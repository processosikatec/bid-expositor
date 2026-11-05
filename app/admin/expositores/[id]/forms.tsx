'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui';
import { SubmitButton } from '@/components/submit-button';
import { toLocalInput } from '@/lib/format';
import type { Exhibitor, FormState, Stand } from '@/lib/types';
import { addMemberAction, saveStandAction, updateExhibitorAction } from '../../actions';

function Feedback({ state }: { state: FormState }) {
  if (state?.error) return <Alert tone="red">{state.error}</Alert>;
  if (state?.ok && state.message) return <Alert tone="green">{state.message}</Alert>;
  return null;
}

function Field({ label, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <input className="input" {...props} />
    </div>
  );
}

export function ExhibitorForm({ exhibitor: e }: { exhibitor: Exhibitor }) {
  const [state, action] = useActionState(updateExhibitorAction, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2"><Feedback state={state} /></div>
      <input type="hidden" name="id" value={e.id} />
      <Field label="Razão social *" name="company_name" defaultValue={e.company_name} required />
      <Field label="Nome fantasia" name="trade_name" defaultValue={e.trade_name ?? ''} />
      <Field label="CNPJ" name="cnpj" defaultValue={e.cnpj ?? ''} />
      <Field label="Segmento" name="segment" defaultValue={e.segment ?? ''} />
      <Field label="Responsável" name="contact_name" defaultValue={e.contact_name ?? ''} />
      <Field label="E-mail de acesso *" name="contact_email" type="email" defaultValue={e.contact_email} required />
      <Field label="Telefone" name="contact_phone" defaultValue={e.contact_phone ?? ''} />
      <div>
        <label className="label">Status</label>
        <select name="status" defaultValue={e.status} className="input">
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado (bloqueia QR)</option>
        </select>
      </div>
      <div className="sm:col-span-2"><SubmitButton>Salvar dados</SubmitButton></div>
    </form>
  );
}

export function StandForm({ exhibitorId, stand: s }: { exhibitorId: string; stand: Stand | null }) {
  const [state, action] = useActionState(saveStandAction, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-4">
      <div className="sm:col-span-4"><Feedback state={state} /></div>
      <input type="hidden" name="id" value={exhibitorId} />
      <Field label="Código *" name="code" defaultValue={s?.code ?? ''} placeholder="A-12" required />
      <Field label="Pavilhão" name="pavilion" defaultValue={s?.pavilion ?? ''} placeholder="Pavilhão 1" />
      <Field label="Rua / corredor" name="street" defaultValue={s?.street ?? ''} />
      <div>
        <label className="label">Tipo</label>
        <input name="stand_type" list="stand-types" defaultValue={s?.stand_type ?? ''} className="input" />
        <datalist id="stand-types">
          <option value="Básico" />
          <option value="Montadora própria" />
          <option value="Ilha" />
          <option value="Esquina" />
          <option value="Ponta de ilha" />
        </datalist>
      </div>
      <Field label="Área (m²)" name="area_m2" inputMode="decimal" defaultValue={s?.area_m2 ?? ''} />
      <Field label="Energia (kVA)" name="power_kva" inputMode="decimal" defaultValue={s?.power_kva ?? ''} />
      <Field label="Planta X (1–12)" name="map_x" type="number" min={1} max={12} defaultValue={s?.map_x ?? ''} />
      <Field label="Planta Y (1–8)" name="map_y" type="number" min={1} max={8} defaultValue={s?.map_y ?? ''} />
      <Field label="Início montagem" name="setup_start" type="datetime-local" defaultValue={toLocalInput(s?.setup_start)} className="sm:col-span-2" />
      <Field label="Fim montagem" name="setup_end" type="datetime-local" defaultValue={toLocalInput(s?.setup_end)} className="sm:col-span-2" />
      <Field label="Início desmontagem" name="teardown_start" type="datetime-local" defaultValue={toLocalInput(s?.teardown_start)} className="sm:col-span-2" />
      <Field label="Fim desmontagem" name="teardown_end" type="datetime-local" defaultValue={toLocalInput(s?.teardown_end)} className="sm:col-span-2" />
      <div className="sm:col-span-4">
        <label className="label">Observações para o expositor</label>
        <textarea name="notes" rows={3} defaultValue={s?.notes ?? ''} className="input" />
      </div>
      <div className="sm:col-span-4"><SubmitButton>Salvar estande</SubmitButton></div>
    </form>
  );
}

export function AddMemberForm({ exhibitorId }: { exhibitorId: string }) {
  const [state, action] = useActionState(addMemberAction, null);
  return (
    <form action={action} className="space-y-2">
      <Feedback state={state} />
      <input type="hidden" name="id" value={exhibitorId} />
      <div className="flex gap-2">
        <input name="email" type="email" required placeholder="outra.pessoa@empresa.com" className="input" />
        <SubmitButton className="btn-secondary" pendingText="…">Adicionar</SubmitButton>
      </div>
    </form>
  );
}
