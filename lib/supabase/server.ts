import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DB_SCHEMA } from './config';

// Client server-side que respeita a sessão do usuário (RLS vale). Para
// bypass de RLS, ver admin.ts.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    db: { schema: DB_SCHEMA },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // set() chamado de um Server Component — o proxy mantém a sessão.
        }
      },
    },
  });
}
