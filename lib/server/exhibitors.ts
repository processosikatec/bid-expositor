import 'server-only';
import { randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import QRCode from 'qrcode';
import { createAdminClient } from '../supabase/admin';

type AdminClient = ReturnType<typeof createAdminClient>;

const TOKEN_TTL_DAYS = 180;

export function newAccessToken() {
  return {
    access_token: randomBytes(24).toString('base64url'),
    access_token_expires_at: new Date(Date.now() + TOKEN_TTL_DAYS * 86_400_000).toISOString(),
  };
}

/**
 * Retorna o id do usuário Supabase para o e-mail, criando-o se não existir, e
 * garante o perfil em bid.profiles. A base de logins (auth.users) é
 * compartilhada com outros painéis: se a pessoa já existe lá (ex.: alguém do
 * time interno), reaproveita o mesmo usuário — sem tocar em public.profiles.
 */
export async function ensureUserForEmail(admin: AdminClient, rawEmail: string): Promise<string> {
  const email = rawEmail.trim().toLowerCase();

  const { data: profile } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
  if (profile?.id) return profile.id;

  const { data: existingId } = await admin.rpc('find_auth_user', { p_email: email });
  let userId = (existingId as string | null) ?? null;

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (!data?.user) throw new Error(`Não foi possível criar o usuário ${email}: ${error?.message ?? 'erro desconhecido'}`);
    userId = data.user.id;
  }

  // ignoreDuplicates: nunca rebaixa um admin do BID que já exista
  const { error: pErr } = await admin.from('profiles').upsert({ id: userId, email }, { onConflict: 'id', ignoreDuplicates: true });
  if (pErr) throw new Error(pErr.message);
  return userId;
}

export async function linkMember(admin: AdminClient, exhibitorId: string, email: string) {
  const userId = await ensureUserForEmail(admin, email);
  const { error } = await admin
    .from('exhibitor_members')
    .upsert({ exhibitor_id: exhibitorId, user_id: userId }, { onConflict: 'exhibitor_id,user_id' });
  if (error) throw new Error(error.message);
  return userId;
}

export type NewExhibitorInput = {
  edition: number;
  company_name: string;
  trade_name?: string | null;
  cnpj?: string | null;
  segment?: string | null;
  contact_name?: string | null;
  contact_email: string;
  contact_phone?: string | null;
  status?: 'pendente' | 'confirmado';
};

export async function createExhibitor(input: NewExhibitorInput) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('exhibitors')
    .insert({ ...input, contact_email: input.contact_email.toLowerCase(), ...newAccessToken() })
    .select('id')
    .single();
  if (error) {
    if (error.code === '23505') throw new Error('Já existe expositor com este e-mail nesta edição.');
    throw new Error(error.message);
  }
  await linkMember(admin, data.id, input.contact_email);
  return data.id as string;
}

export async function getSiteUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function accessUrl(token: string) {
  return `${await getSiteUrl()}/acesso/${token}`;
}

export async function qrSvg(text: string) {
  return QRCode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0f172a', light: '#ffffff' } });
}
