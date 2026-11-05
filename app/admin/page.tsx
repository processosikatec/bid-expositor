import Link from 'next/link';
import { ClipboardCheck, MapPin, Rocket, Sparkles, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { EVENT, ONBOARDING_STEPS } from '@/lib/event';
import { formatDateTime } from '@/lib/format';
import { PageHeader, Progress, Stat, StatusBadge } from '@/components/ui';

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const [exhibitors, stands, pendingDocs, apps] = await Promise.all([
    supabase.from('exhibitors').select('id, onboarding_steps, status').eq('edition', EVENT.edition).neq('status', 'cancelado'),
    supabase.from('stands').select('id', { count: 'exact', head: true }).eq('edition', EVENT.edition),
    supabase
      .from('documents')
      .select('id, uploaded_at, file_name, exhibitor:exhibitors(id, company_name), type:document_types(name)')
      .eq('status', 'enviado')
      .order('uploaded_at')
      .limit(6),
    supabase.from('applications_2027').select('id, company_name, status, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  const list = exhibitors.data ?? [];
  const manualSteps = ONBOARDING_STEPS.filter((s) => !s.auto).length;
  const avgOnboarding = list.length
    ? (list.reduce((acc, e) => acc + Math.min(Object.keys(e.onboarding_steps ?? {}).length, manualSteps), 0) / (list.length * manualSteps)) * 100
    : 0;

  type PendingDoc = { id: string; uploaded_at: string; file_name: string; exhibitor: { id: string; company_name: string } | null; type: { name: string } | null };
  const pending = (pendingDocs.data ?? []) as unknown as PendingDoc[];

  return (
    <>
      <PageHeader title="Visão geral" description={`${EVENT.name} · ${EVENT.dateLabel}`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={`Expositores ${EVENT.edition}`} value={list.length} icon={<Users className="h-5 w-5" />} />
        <Stat label="Estandes definidos" value={`${stands.count ?? 0}/${list.length}`} icon={<MapPin className="h-5 w-5" />} />
        <Stat label="Docs aguardando análise" value={pendingDocs.data?.length === 6 ? '6+' : pending.length} icon={<ClipboardCheck className="h-5 w-5" />} />
        <Stat label="Onboarding médio" value={`${Math.round(avgOnboarding)}%`} icon={<Rocket className="h-5 w-5" />} hint={<Progress value={avgOnboarding} />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Fila de documentos</h2>
            <Link href="/admin/documentos" className="text-sm font-medium text-brand-700 hover:underline">Revisar</Link>
          </div>
          <ul className="mt-4 divide-y divide-bid-text/8 text-sm">
            {pending.length === 0 && <li className="py-3 text-bid-muted">Nenhum documento pendente. 🎉</li>}
            {pending.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.exhibitor?.company_name}</p>
                  <p className="truncate text-xs text-bid-muted">{d.type?.name}</p>
                </div>
                <span className="shrink-0 text-xs text-bid-muted/70">{formatDateTime(d.uploaded_at)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4 text-accent-500" /> Pré-cadastros {EVENT.nextEdition}</h2>
            <Link href="/admin/novos-2027" className="text-sm font-medium text-brand-700 hover:underline">Ver todos</Link>
          </div>
          <ul className="mt-4 divide-y divide-bid-text/8 text-sm">
            {(apps.data ?? []).length === 0 && <li className="py-3 text-bid-muted">Nenhum pré-cadastro ainda.</li>}
            {(apps.data ?? []).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="truncate font-medium">{a.company_name}</span>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
