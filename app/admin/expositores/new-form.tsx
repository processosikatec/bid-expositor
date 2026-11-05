'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui';
import { SubmitButton } from '@/components/submit-button';
import { createExhibitorAction } from '../actions';
import { EVENT } from '@/lib/event';

export function NewExhibitorForm({ defaultEdition }: { defaultEdition: number }) {
  const [state, action] = useActionState(createExhibitorAction, null);
  return (
    <form action={action} className="space-y-3">
      {state?.error && <Alert tone="red">{state.error}</Alert>}
      <div>
        <label className="label">Empresa *</label>
        <input name="company_name" required className="input" />
      </div>
      <div>
        <label className="label">Nome fantasia</label>
        <input name="trade_name" className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">CNPJ</label>
          <input name="cnpj" className="input" />
        </div>
        <div>
          <label className="label">Edição</label>
          <select name="edition" defaultValue={String(defaultEdition)} className="input">
            <option value={EVENT.edition}>{EVENT.edition}</option>
            <option value={EVENT.nextEdition}>{EVENT.nextEdition}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Responsável</label>
        <input name="contact_name" className="input" />
      </div>
      <div>
        <label className="label">E-mail de acesso *</label>
        <input name="contact_email" type="email" required className="input" />
      </div>
      <div>
        <label className="label">Telefone</label>
        <input name="contact_phone" className="input" />
      </div>
      <SubmitButton pendingText="Cadastrando…" className="btn-primary w-full">Cadastrar e gerar QR</SubmitButton>
      <p className="text-xs text-bid-muted">Gera automaticamente o acesso por link mágico e o QR code individual.</p>
    </form>
  );
}
