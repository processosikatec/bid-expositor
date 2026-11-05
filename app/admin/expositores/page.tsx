import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { EVENT, ONBOARDING_STEPS } from '@/lib/event';
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { NewExhibitorForm } from './new-form';

export const metadata = { title: 'Expositores' };

export default async function ExhibitorsPage({ searchParams }: { searchParams: Promise<{ edicao?: string; q?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const edition = Number(sp.edicao) || EVENT.edition;
  const q = (sp.q ?? '').trim().slice(0, 80);

  let query = supabase
    .from('exhibitors')
    .select('id, company_name, trade_name, contact_email, status, onboarding_steps, stand:stands(code, pavilion), documents(status)')
    .eq('edition', edition)
    .order('company_name');
  if (q) query = query.or(`company_name.ilike.%${q.replace(/[%,()]/g, '')}%,contact_email.ilike.%${q.replace(/[%,()]/g, '')}%`);
  const { data } = await query;

  type Row = {
    id: string;
    company_name: string;
    trade_name: string | null;
    contact_email: string;
    status: string;
    onboarding_steps: Record<string, string>;
    stand: { code: string; pavilion: string | null } | null;
    documents: { status: string }[];
  };
  const rows = (data ?? []) as unknown as Row[];
  const manualSteps = ONBOARDING_STEPS.filter((s) => !s.auto).length;

  return (
    <>
      <PageHeader title="Expositores" description={`${rows.length} expositor(es) na edição ${edition}`} />

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <form className="mb-4 flex flex-wrap gap-2">
            <input name="q" defaultValue={q} placeholder="Buscar empresa ou e-mail" className="input max-w-xs" />
            <select name="edicao" defaultValue={String(edition)} className="input w-auto">
              <option value={EVENT.edition}>{EVENT.edition}</option>
              <option value={EVENT.nextEdition}>{EVENT.nextEdition}</option>
            </select>
            <button className="btn-secondary">Filtrar</button>
          </form>

          {rows.length === 0 ? (
            <EmptyState title="Nenhum expositor encontrado." >Cadastre o primeiro no formulário ao lado.</EmptyState>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-bid-text/10 bg-bid-surface-soft text-left text-xs uppercase tracking-wider text-bid-muted">
                  <tr>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Estande</th>
                    <th className="px-4 py-3">Docs</th>
                    <th className="px-4 py-3">Onboarding</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bid-text/8">
                  {rows.map((r) => {
                    const approved = r.documents.filter((d) => d.status === 'aprovado').length;
                    const pending = r.documents.filter((d) => d.status === 'enviado').length;
                    const ob = Math.round((Math.min(Object.keys(r.onboarding_steps ?? {}).length, manualSteps) / manualSteps) * 100);
                    return (
                      <tr key={r.id} className="hover:bg-bid-surface-soft">
                        <td className="px-4 py-3">
                          <Link href={`/admin/expositores/${r.id}`} className="font-semibold text-bid-text hover:text-brand-700">
                            {r.trade_name || r.company_name}
                          </Link>
                          <p className="text-xs text-bid-muted">{r.contact_email}</p>
                        </td>
                        <td className="px-4 py-3">{r.stand?.code ?? <span className="text-bid-muted/70">—</span>}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className="text-emerald-700">{approved} ok</span>
                          {pending > 0 && <span className="ml-2 text-amber-700">{pending} p/ revisar</span>}
                        </td>
                        <td className="px-4 py-3">{ob}%</td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-3 font-bold">Novo expositor</h2>
          <NewExhibitorForm defaultEdition={edition} />
        </div>
      </div>
    </>
  );
}
