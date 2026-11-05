import Link from 'next/link';
import { ArrowRight, CalendarDays, FileText, MapPin, Rocket } from 'lucide-react';
import { requireExhibitor } from '@/lib/auth';
import { loadExhibitorData } from '@/lib/server/exhibitor-data';
import { docsSummary, onboardingProgress } from '@/lib/progress';
import { EVENT, KEY_DATES } from '@/lib/event';
import { daysUntil, formatDate, formatRange } from '@/lib/format';
import { Alert, PageHeader, Progress, Stat } from '@/components/ui';
import { QrCode } from '@/components/qr-code';
import { accessUrl } from '@/lib/server/exhibitors';

export default async function ExhibitorHome() {
  const { supabase, exhibitor } = await requireExhibitor();
  const { stand, types, docs } = await loadExhibitorData(supabase, exhibitor);
  const ds = docsSummary(types, docs);
  const ob = onboardingProgress(exhibitor.onboarding_steps, ds.allRequiredSent);
  const nextDates = KEY_DATES.filter((d) => daysUntil(d.date) >= 0).slice(0, 3);
  const qrUrl = exhibitor.access_token ? await accessUrl(exhibitor.access_token) : null;

  return (
    <>
      <PageHeader
        title={`Olá, ${exhibitor.contact_name?.split(' ')[0] ?? exhibitor.company_name}!`}
        description={`Bem-vindo ao painel do expositor do ${EVENT.name}.`}
      />

      {ds.rejectedCount > 0 && (
        <div className="mb-6">
          <Alert tone="red">
            {ds.rejectedCount} documento(s) reprovado(s).{' '}
            <Link href="/expositor/documentos" className="font-semibold underline">Ver motivo e reenviar</Link>
          </Alert>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Onboarding" icon={<Rocket className="h-5 w-5" />} value={`${Math.round(ob.pct)}%`} hint={`${ob.done} de ${ob.total} etapas`} />
        <Stat
          label="Documentos obrigatórios"
          icon={<FileText className="h-5 w-5" />}
          value={`${ds.approvedRequiredCount}/${ds.requiredCount}`}
          hint={`${ds.sentRequiredCount} enviados · ${ds.approvedRequiredCount} aprovados`}
        />
        <Stat label="Meu estande" icon={<MapPin className="h-5 w-5" />} value={stand?.code ?? '—'} hint={stand ? `${stand.pavilion ?? ''} ${stand.area_m2 ? `· ${stand.area_m2} m²` : ''}` : 'Aguardando definição'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Seu progresso</h2>
            <Link href="/expositor/onboarding" className="text-sm font-medium text-brand-700 hover:underline">Ver checklist</Link>
          </div>
          <div className="mt-4"><Progress value={ob.pct} /></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-bid-surface-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-bid-muted/70">Montagem</p>
              <p className="mt-1 text-sm font-medium">{formatRange(stand?.setup_start ?? null, stand?.setup_end ?? null)}</p>
            </div>
            <div className="rounded-xl bg-bid-surface-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-bid-muted/70">Desmontagem</p>
              <p className="mt-1 text-sm font-medium">{formatRange(stand?.teardown_start ?? null, stand?.teardown_end ?? null)}</p>
            </div>
          </div>
          <Link href="/expositor/estande" className="btn-secondary mt-6">
            Detalhes do estande <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-bold"><CalendarDays className="h-5 w-5 text-brand-600" /> Próximos prazos</h2>
            <ul className="mt-4 space-y-3">
              {nextDates.length === 0 && <li className="text-sm text-bid-muted">Sem prazos pendentes.</li>}
              {nextDates.map((d) => (
                <li key={d.label} className="flex justify-between gap-3 text-sm">
                  <span>{d.label}</span>
                  <span className="shrink-0 font-medium text-bid-text">{formatDate(d.date)}</span>
                </li>
              ))}
            </ul>
          </div>
          {qrUrl && (
            <div className="card flex items-center gap-4 p-6">
              <QrCode value={qrUrl} size={112} />
              <div className="text-sm">
                <p className="font-bold">Acesse pelo celular</p>
                <p className="mt-1 text-bid-muted">Escaneie para abrir este painel no celular sem precisar de e-mail. Não compartilhe fora da sua equipe.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
