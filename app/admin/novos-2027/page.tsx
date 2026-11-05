import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { EVENT } from '@/lib/event';
import { formatDateTime } from '@/lib/format';
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { SubmitButton } from '@/components/submit-button';
import type { Application2027 } from '@/lib/types';
import { convertApplicationAction, updateApplicationAction } from '../actions';

export const metadata = { title: `Novos expositores ${EVENT.nextEdition}` };

const FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'novo', label: 'Novos' },
  { value: 'em_contato', label: 'Em contato' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'recusado', label: 'Recusados' },
];

export default async function NewApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { supabase } = await requireAdmin();
  const { status = '' } = await searchParams;

  let q = supabase.from('applications_2027').select('*').order('created_at', { ascending: false });
  if (FILTERS.some((f) => f.value && f.value === status)) q = q.eq('status', status);
  const { data } = await q;
  const apps = (data ?? []) as Application2027[];

  return (
    <>
      <PageHeader
        title={`Novos expositores ${EVENT.nextEdition}`}
        description={
          <>
            Pré-cadastros recebidos pela{' '}
            <Link href="/novos-expositores-2027" className="text-brand-700 underline" target="_blank">página pública</Link>. Aprove para criar o
            expositor {EVENT.nextEdition} com acesso ao painel.
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `?status=${f.value}` : '?'}
            className={`rounded-full px-3 py-1 text-sm font-medium ${status === f.value ? 'bg-brand-600 text-white' : 'bg-white text-bid-muted ring-1 ring-bid-text/10 hover:bg-bid-surface-soft'}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {apps.length === 0 && <EmptyState title="Nenhum pré-cadastro." />}

      <div className="space-y-3">
        {apps.map((a) => (
          <div key={a.id} className="card p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{a.company_name}</h3>
                  <StatusBadge status={a.status} />
                  <span className="text-xs text-bid-muted/70">{formatDateTime(a.created_at)}</span>
                </div>
                <p className="mt-1 text-bid-muted">
                  {a.contact_name} · <a href={`mailto:${a.email}`} className="text-brand-700">{a.email}</a>
                  {a.phone && ` · ${a.phone}`}
                </p>
                <p className="mt-1 text-bid-muted">
                  {[a.segment, a.desired_area, a.cnpj].filter(Boolean).join(' · ') || '—'}
                  {a.website && (
                    <>
                      {' · '}
                      <a href={a.website.startsWith('http') ? a.website : `https://${a.website}`} target="_blank" rel="noreferrer noopener" className="text-brand-700">site</a>
                    </>
                  )}
                </p>
                {a.message && <p className="mt-2 rounded-lg bg-bid-surface-soft p-3 text-bid-text">{a.message}</p>}
              </div>

              <div className="w-full space-y-2 lg:w-80">
                <form action={updateApplicationAction} className="space-y-2">
                  <input type="hidden" name="id" value={a.id} />
                  <select name="status" defaultValue={a.status} className="input">
                    <option value="novo">Novo</option>
                    <option value="em_contato">Em contato</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="recusado">Recusado</option>
                  </select>
                  <textarea name="admin_notes" rows={2} defaultValue={a.admin_notes ?? ''} placeholder="Notas internas" className="input" />
                  <SubmitButton className="btn-secondary w-full">Salvar</SubmitButton>
                </form>
                {a.exhibitor_id ? (
                  <Link href={`/admin/expositores/${a.exhibitor_id}`} className="btn-secondary w-full">Ver expositor {EVENT.nextEdition}</Link>
                ) : (
                  <form action={convertApplicationAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <SubmitButton className="btn-primary w-full" pendingText="Criando…">Aprovar e criar expositor {EVENT.nextEdition}</SubmitButton>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
