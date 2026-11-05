import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import type { Exhibitor, Role } from './types';

export type SessionContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  email: string | null;
  role: Role;
  exhibitor: Exhibitor | null;
};

export const getSession = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createClient();
  // getClaims verifica o JWT localmente (sem ida ao Supabase Auth na maioria
  // dos requests). A autorização real continua no RLS do banco.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const user = { id: claims.sub, email: (claims.email as string | undefined) ?? null };

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    supabase
      .from('exhibitor_members')
      .select('exhibitor:exhibitors(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    supabase,
    userId: user.id,
    email: user.email ?? null,
    role: (profile?.role as Role) ?? 'exhibitor',
    exhibitor: (membership?.exhibitor as unknown as Exhibitor | null) ?? null,
  };
});

export async function requireExhibitor() {
  const ctx = await getSession();
  if (!ctx) redirect('/entrar');
  if (!ctx.exhibitor) {
    if (ctx.role === 'admin') redirect('/admin');
    redirect('/entrar?erro=sem-expositor');
  }
  return ctx as SessionContext & { exhibitor: Exhibitor };
}

export async function requireAdmin() {
  const ctx = await getSession();
  if (!ctx) redirect('/entrar');
  if (ctx.role !== 'admin') redirect('/expositor');
  return ctx;
}
