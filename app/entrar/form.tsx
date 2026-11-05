'use client';

import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Alert } from '@/components/ui';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // Só e-mails já cadastrados pela organização recebem link
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/painel`,
      },
    });
    if (error) {
      setState('error');
      setError(
        /signups not allowed|not found/i.test(error.message)
          ? 'E-mail não cadastrado. Use o e-mail informado à organização.'
          : /rate|seconds/i.test(error.message)
            ? 'Aguarde alguns segundos antes de pedir outro link.'
            : 'Não foi possível enviar o link. Tente novamente.'
      );
      return;
    }
    setState('sent');
  }

  if (state === 'sent') {
    return (
      <div className="rounded-xl bg-emerald-50 p-5 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-3 font-semibold text-emerald-900">Link enviado!</p>
        <p className="mt-1 text-sm text-emerald-800">
          Abra o e-mail enviado para <strong>{email}</strong> e clique no link para entrar. Abra no mesmo navegador.
        </p>
        <button className="mt-4 text-sm font-medium text-emerald-800 underline" onClick={() => setState('idle')}>
          Usar outro e-mail
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {state === 'error' && <Alert tone="red">{error}</Alert>}
      <div>
        <label htmlFor="email" className="label">E-mail cadastrado</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="voce@empresa.com.br"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={state === 'sending'}>
        {state === 'sending' ? 'Enviando…' : 'Receber link mágico'}
      </button>
    </form>
  );
}
