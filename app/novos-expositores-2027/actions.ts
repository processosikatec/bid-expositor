'use server';

import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { isRateLimited } from '@/lib/rate-limit';
import { EMAIL_RE, str } from '@/lib/format';
import type { FormState } from '@/lib/types';

export async function submitApplication(_prev: FormState, form: FormData): Promise<FormState> {
  // honeypot preenchido = bot; finge sucesso
  if (str(form, 'website_url')) return { ok: true };

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(`app2027:${ip}`, 5, 10 * 60_000)) {
    return { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' };
  }

  const company_name = str(form, 'company_name', 200);
  const contact_name = str(form, 'contact_name', 200);
  const email = str(form, 'email', 200)?.toLowerCase() ?? null;
  if (!company_name || !contact_name || !email) return { error: 'Preencha empresa, nome e e-mail.' };
  if (!EMAIL_RE.test(email)) return { error: 'E-mail inválido.' };
  if (!form.get('consent')) return { error: 'É necessário autorizar o contato.' };

  const admin = createAdminClient();
  const { error } = await admin.from('applications_2027').insert({
    company_name,
    contact_name,
    email,
    cnpj: str(form, 'cnpj', 30),
    phone: str(form, 'phone', 40),
    segment: str(form, 'segment', 120),
    desired_area: str(form, 'desired_area', 40),
    website: str(form, 'website', 200),
    message: str(form, 'message', 2000),
  });
  if (error) return { error: 'Não foi possível enviar agora. Tente novamente em instantes.' };
  return { ok: true };
}
