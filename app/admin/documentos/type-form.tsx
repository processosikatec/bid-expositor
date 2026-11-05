'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui';
import { SubmitButton } from '@/components/submit-button';
import { createDocumentTypeAction } from '../actions';

export function DocumentTypeForm({ edition, nextEdition }: { edition: number; nextEdition: number }) {
  const [state, action] = useActionState(createDocumentTypeAction, null);
  return (
    <form action={action} className="space-y-3">
      {state?.error && <Alert tone="red">{state.error}</Alert>}
      {state?.ok && <Alert tone="green">{state.message}</Alert>}
      <div>
        <label className="label">Nome *</label>
        <input name="name" required className="input" />
      </div>
      <div>
        <label className="label">Descrição</label>
        <textarea name="description" rows={2} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Edição</label>
          <select name="edition" className="input" defaultValue={String(edition)}>
            <option value={edition}>{edition}</option>
            <option value={nextEdition}>{nextEdition}</option>
          </select>
        </div>
        <div>
          <label className="label">Prazo</label>
          <input name="due_date" type="date" className="input" />
        </div>
      </div>
      <div>
        <label className="label">Link do modelo (opcional)</label>
        <input name="template_url" type="url" className="input" placeholder="https://" />
      </div>
      <div className="grid grid-cols-2 items-end gap-3">
        <div>
          <label className="label">Ordem</label>
          <input name="sort" type="number" className="input" defaultValue={99} />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" name="required" defaultChecked /> Obrigatório
        </label>
      </div>
      <SubmitButton className="btn-primary w-full">Adicionar</SubmitButton>
    </form>
  );
}
