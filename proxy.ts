import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Roda só nas áreas logadas (ver matcher). Páginas públicas (home, manual,
// 2027, entrar, acesso por QR) não passam por aqui e saem do cache estático.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // getClaims valida o JWT localmente (chaves assimétricas) e só renova a
  // sessão quando o token expira — evita uma ida ao Supabase Auth a cada clique.
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    const url = request.nextUrl.clone();
    url.pathname = '/entrar';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

// Precisa ser literal (analisado em build). `:path*` também casa a raiz.
export const config = {
  matcher: ['/expositor/:path*', '/admin/:path*', '/painel'],
};
