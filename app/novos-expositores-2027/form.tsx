'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Alert } from '@/components/ui';
import { SubmitButton } from '@/components/submit-button';
import { submitApplication } from './actions';

export function ApplicationForm() {
  const [state, action] = useActionState(submitApplication, null);

  if (state?.ok) {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-4 text-xl font-bold">Pré-cadastro recebido!</h2>
        <p className="mt-2 text-sm text-bid-muted">Nossa equipe vai entrar em contato pelo e-mail ou telefone informado.</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <h2 className="text-lg font-bold sm:col-span-2">Pré-cadastro</h2>
      {state?.error && (
        <div className="sm:col-span-2">
          <Alert tone="red">{state.error}</Alert>
        </div>
      )}
      {/* honeypot anti-bot */}
      <input type="text" name="website_url" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="sm:col-span-2">
        <label className="label" htmlFor="company_name">Empresa *</label>
        <input id="company_name" name="company_name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="cnpj">CNPJ</label>
        <input id="cnpj" name="cnpj" className="input" placeholder="00.000.000/0000-00" />
      </div>
      <div>
        <label className="label" htmlFor="segment">Segmento</label>
        <input id="segment" name="segment" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="contact_name">Seu nome *</label>
        <input id="contact_name" name="contact_name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="email">E-mail *</label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Telefone / WhatsApp</label>
        <input id="phone" name="phone" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="desired_area">Área desejada</label>
        <select id="desired_area" name="desired_area" className="input" defaultValue="">
          <option value="">Selecione</option>
          <option>Até 9 m²</option>
          <option>10 a 18 m²</option>
          <option>19 a 36 m²</option>
          <option>37 a 72 m²</option>
          <option>Acima de 72 m²</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="website">Site</label>
        <input id="website" name="website" className="input" placeholder="https://" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="message">Mensagem</label>
        <textarea id="message" name="message" rows={3} className="input" />
      </div>
      <label className="flex items-start gap-2 text-xs text-bid-muted sm:col-span-2">
        <input type="checkbox" name="consent" required className="mt-0.5" />
        Autorizo o contato da organização do BID com informações sobre a participação no evento (LGPD).
      </label>
      <div className="sm:col-span-2">
        <SubmitButton pendingText="Enviando…">Enviar pré-cadastro</SubmitButton>
      </div>
    </form>
  );
}
