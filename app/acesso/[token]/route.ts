import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { linkMember } from '@/lib/server/exhibitors';

// Login por QR code / link individual do expositor.
// Valida o token do expositor e cria uma sessão Supabase real para o e-mail de
// contato (generateLink + verifyOtp no servidor), para que o RLS funcione
// igual ao login por link mágico.
export async function GET(request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const origin = request.nextUrl.origin;
  const fail = () => NextResponse.redirect(new URL('/entrar?erro=link-invalido', origin));

  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return fail();

  const admin = createAdminClient();
  const { data: ex } = await admin
    .from('exhibitors')
    .select('id, contact_email, status, access_token_expires_at')
    .eq('access_token', token)
    .maybeSingle();

  if (!ex || ex.status === 'cancelado') return fail();
  if (ex.access_token_expires_at && new Date(ex.access_token_expires_at) < new Date()) return fail();

  try {
    await linkMember(admin, ex.id, ex.contact_email);
  } catch {
    return fail();
  }

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: ex.contact_email,
  });
  if (linkError || !link?.properties?.hashed_token) return fail();

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token });
  if (error) return fail();

  return NextResponse.redirect(new URL('/expositor', origin));
}
