'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// Lê a sessão do cookie no navegador (sem rede). Mantém as páginas públicas
// 100% estáticas: o servidor não precisa saber quem está logado.
export function HeaderAuthButton() {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setLogged(!!data.session))
      .catch(() => {});
  }, []);

  return (
    <Link href={logged ? '/painel' : '/entrar'} className="btn-primary ml-2">
      {logged ? 'Meu painel' : 'Entrar'}
    </Link>
  );
}
