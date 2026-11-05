'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createExhibitor, linkMember, newAccessToken } from '@/lib/server/exhibitors';
import { EMAIL_RE, fromLocalInput, num, str } from '@/lib/format';
import { EVENT } from '@/lib/event';
import type { FormState } from '@/lib/types';

const id = (form: FormData, key = 'id') => {
  const v = String(form.get(key) ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(v)) throw new Error('id inválido');
  return v;
};

// ---------------------------------------------------------------- expositores

export async function createExhibitorAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const company_name = str(form, 'company_name', 200);
  const contact_email = str(form, 'contact_email', 200);
  if (!company_name || !contact_email) return { error: 'Empresa e e-mail são obrigatórios.' };
  if (!EMAIL_RE.test(contact_email)) return { error: 'E-mail inválido.' };

  let newId: string;
  try {
    newId = await createExhibitor({
      edition: num(form, 'edition') ?? EVENT.edition,
      company_name,
      contact_email,
      trade_name: str(form, 'trade_name', 200),
      cnpj: str(form, 'cnpj', 30),
      segment: str(form, 'segment', 120),
      contact_name: str(form, 'contact_name', 200),
      contact_phone: str(form, 'contact_phone', 40),
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath('/admin', 'layout');
  redirect(`/admin/expositores/${newId}`);
}

export async function updateExhibitorAction(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const exhibitorId = id(form);
  const contact_email = str(form, 'contact_email', 200);
  if (!contact_email || !EMAIL_RE.test(contact_email)) return { error: 'E-mail inválido.' };

  const { error } = await supabase
    .from('exhibitors')
    .update({
      company_name: str(form, 'company_name', 200) ?? undefined,
      trade_name: str(form, 'trade_name', 200),
      cnpj: str(form, 'cnpj', 30),
      segment: str(form, 'segment', 120),
      contact_name: str(form, 'contact_name', 200),
      contact_email: contact_email.toLowerCase(),
      contact_phone: str(form, 'contact_phone', 40),
      status: str(form, 'status', 20) ?? 'confirmado',
    })
    .eq('id', exhibitorId);
  if (error) return { error: error.code === '23505' ? 'E-mail já usado por outro expositor nesta edição.' : error.message };

  // garante que o novo e-mail de contato também tenha acesso
  try {
    await linkMember(createAdminClient(), exhibitorId, contact_email);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath('/admin', 'layout');
  return { ok: true, message: 'Dados salvos.' };
}

export async function regenerateTokenAction(form: FormData) {
  const { supabase } = await requireAdmin();
  const exhibitorId = id(form);
  await supabase.from('exhibitors').update(newAccessToken()).eq('id', exhibitorId);
  revalidatePath(`/admin/expositores/${exhibitorId}`);
}

export async function revokeTokenAction(form: FormData) {
  const { supabase } = await requireAdmin();
  const exhibitorId = id(form);
  await supabase.from('exhibitors').update({ access_token: null, access_token_expires_at: null }).eq('id', exhibitorId);
  revalidatePath(`/admin/expositores/${exhibitorId}`);
}

export async function addMemberAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const exhibitorId = id(form);
  const email = str(form, 'email', 200);
  if (!email || !EMAIL_RE.test(email)) return { error: 'E-mail inválido.' };
  try {
    await linkMember(createAdminClient(), exhibitorId, email);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath(`/admin/expositores/${exhibitorId}`);
  return { ok: true, message: `${email} agora pode entrar por link mágico.` };
}

export async function removeMemberAction(form: FormData) {
  const { supabase } = await requireAdmin();
  const exhibitorId = id(form);
  await supabase.from('exhibitor_members').delete().eq('exhibitor_id', exhibitorId).eq('user_id', id(form, 'user_id'));
  revalidatePath(`/admin/expositores/${exhibitorId}`);
}

// ---------------------------------------------------------------- estande

export async function saveStandAction(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const exhibitorId = id(form);
  const code = str(form, 'code', 20);
  if (!code) return { error: 'Informe o código do estande.' };

  const { data: ex } = await supabase.from('exhibitors').select('edition').eq('id', exhibitorId).single();
  const { error } = await supabase.from('stands').upsert(
    {
      exhibitor_id: exhibitorId,
      edition: ex?.edition ?? EVENT.edition,
      code: code.toUpperCase(),
      pavilion: str(form, 'pavilion', 80),
      street: str(form, 'street', 80),
      area_m2: num(form, 'area_m2'),
      stand_type: str(form, 'stand_type', 80),
      power_kva: num(form, 'power_kva'),
      setup_start: fromLocalInput(form.get('setup_start')),
      setup_end: fromLocalInput(form.get('setup_end')),
      teardown_start: fromLocalInput(form.get('teardown_start')),
      teardown_end: fromLocalInput(form.get('teardown_end')),
      map_x: num(form, 'map_x'),
      map_y: num(form, 'map_y'),
      notes: str(form, 'notes', 2000),
    },
    { onConflict: 'exhibitor_id' }
  );
  if (error) return { error: error.code === '23505' ? `Código ${code} já está em uso nesta edição.` : error.message };
  revalidatePath('/admin', 'layout');
  return { ok: true, message: 'Estande salvo.' };
}

// ---------------------------------------------------------------- documentos

export async function reviewDocumentAction(form: FormData) {
  const { supabase, userId } = await requireAdmin();
  const docId = id(form);
  const decision = form.get('decision') === 'aprovado' ? 'aprovado' : 'reprovado';
  const note = str(form, 'note', 1000);
  await supabase
    .from('documents')
    .update({
      status: decision,
      review_note: decision === 'reprovado' ? (note ?? 'Documento reprovado. Fale com a organização.') : note,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', docId);
  revalidatePath('/admin', 'layout');
}

export async function createDocumentTypeAction(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const name = str(form, 'name', 200);
  if (!name) return { error: 'Informe o nome.' };
  const { error } = await supabase.from('document_types').insert({
    name,
    edition: num(form, 'edition') ?? EVENT.edition,
    description: str(form, 'description', 1000),
    required: form.get('required') === 'on',
    due_date: str(form, 'due_date', 10),
    template_url: str(form, 'template_url', 500),
    sort: num(form, 'sort') ?? 99,
  });
  if (error) return { error: error.message };
  revalidatePath('/admin/documentos');
  return { ok: true, message: 'Tipo de documento criado.' };
}

export async function deleteDocumentTypeAction(form: FormData) {
  const { supabase } = await requireAdmin();
  // on delete restrict: falha se já houver envios desse tipo
  await supabase.from('document_types').delete().eq('id', id(form));
  revalidatePath('/admin/documentos');
}

// ---------------------------------------------------------------- novos 2027

export async function updateApplicationAction(form: FormData) {
  const { supabase } = await requireAdmin();
  const status = str(form, 'status', 20);
  await supabase
    .from('applications_2027')
    .update({
      ...(status && ['novo', 'em_contato', 'aprovado', 'recusado'].includes(status) ? { status } : {}),
      admin_notes: str(form, 'admin_notes', 2000),
    })
    .eq('id', id(form));
  revalidatePath('/admin', 'layout');
}

export async function convertApplicationAction(form: FormData) {
  const { supabase } = await requireAdmin();
  const appId = id(form);
  const { data: app } = await supabase.from('applications_2027').select('*').eq('id', appId).single();
  if (!app || app.exhibitor_id) return;

  const exhibitorId = await createExhibitor({
    edition: EVENT.nextEdition,
    company_name: app.company_name,
    cnpj: app.cnpj,
    segment: app.segment,
    contact_name: app.contact_name,
    contact_email: app.email,
    contact_phone: app.phone,
    status: 'pendente',
  });
  await supabase.from('applications_2027').update({ status: 'aprovado', exhibitor_id: exhibitorId }).eq('id', appId);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/expositores/${exhibitorId}`);
}
