import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { accessUrl } from '@/lib/server/exhibitors';
import { docsSummary, onboardingProgress } from '@/lib/progress';
import { ONBOARDING_STEPS } from '@/lib/event';
import { formatDate, formatDateTime } from '@/lib/format';
import { Badge, PageHeader, Progress, StatusBadge } from '@/components/ui';
import { QrCode } from '@/components/qr-code';
import { CopyButton } from '@/components/copy-button';
import { SubmitButton } from '@/components/submit-button';
import type { DocumentType, Exhibitor, ExhibitorDocument, Stand } from '@/lib/types';
import { regenerateTokenAction, removeMemberAction, revokeTokenAction } from '../../actions';
import { AddMemberForm, ExhibitorForm, StandForm } from './forms';
import { ReviewButtons } from '../../documentos/review-buttons';

export default async function ExhibitorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();

  const { data: exData } = await supabase.from('exhibitors').select('*').eq('id', id).maybeSingle();
  if (!exData) notFound();
  const ex = exData as Exhibitor;

  const [standRes, typesRes, docsRes, membersRes] = await Promise.all([
    supabase.from('stands').select('*').eq('exhibitor_id', id).maybeSingle(),
    supabase.from('document_types').select('*').eq('edition', ex.edition).order('sort'),
    supabase.from('documents').select('*').eq('exhibitor_id', id).order('uploaded_at', { ascending: false }),
    supabase.from('exhibitor_members').select('user_id, created_at').eq('exhibitor_id', id),
  ]);
  const stand = standRes.data as Stand | null;
  const types = (typesRes.data ?? []) as DocumentType[];
  const docs = (docsRes.data ?? []) as ExhibitorDocument[];
  const ds = docsSummary(types, docs);
  const ob = onboardingProgress(ex.onboarding_steps, ds.allRequiredSent);

  const admin = createAdminClient();
  const memberIds = (membersRes.data ?? []).map((m) => m.user_id);
  const { data: memberProfiles } = memberIds.length
    ? await admin.from('profiles').select('id, email').in('id', memberIds)
    : { data: [] as { id: string; email: string | null }[] };

  const paths = docs.map((d) => d.file_path);
  const { data: signed } = paths.length ? await admin.storage.from('bid-documentos').createSignedUrls(paths, 600) : { data: [] };
  const urlFor = (p: string) => signed?.find((s) => s.path === p)?.signedUrl ?? undefined;

  const link = ex.access_token ? await accessUrl(ex.access_token) : null;
  const expired = ex.access_token_expires_at ? new Date(ex.access_token_expires_at) < new Date() : false;

  return (
    <>
      <Link href="/admin/expositores" className="mb-4 inline-flex items-center gap-1 text-sm text-bid-muted hover:text-bid-text">
        <ArrowLeft className="h-4 w-4" /> Expositores
      </Link>
      <PageHeader
        title={ex.trade_name || ex.company_name}
        description={
          <span className="flex items-center gap-2">
            Edição {ex.edition} · <StatusBadge status={ex.status} /> · Onboarding {Math.round(ob.pct)}%
          </span>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-4 font-bold">Dados do expositor</h2>
            <ExhibitorForm exhibitor={ex} />
          </section>

          <section className="card p-6">
            <h2 className="mb-1 font-bold">Estande</h2>
            <p className="mb-4 text-sm text-bid-muted">Horários no fuso do evento (Brasília). Posição X (1–12) e Y (1–8) na planta simplificada.</p>
            <StandForm exhibitorId={ex.id} stand={stand} />
          </section>

          <section className="card p-6">
            <h2 className="mb-4 font-bold">Documentos</h2>
            <div className="divide-y divide-bid-text/8">
              {types.map((t) => {
                const history = docs.filter((d) => d.document_type_id === t.id);
                const latest = history[0];
                return (
                  <div key={t.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{t.name}</p>
                      {t.required && <Badge tone="blue">Obrigatório</Badge>}
                      <StatusBadge status={latest?.status ?? 'pendente_envio'} />
                      <span className="text-xs text-bid-muted/70">Prazo {formatDate(t.due_date)}</span>
                    </div>
                    {history.map((d, i) => (
                      <div key={d.id} className={`mt-2 flex flex-wrap items-center gap-3 rounded-lg px-3 py-2 text-sm ${i === 0 ? 'bg-bid-surface-soft' : 'opacity-60'}`}>
                        <a href={urlFor(d.file_path)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-700">
                          <Download className="h-3.5 w-3.5" /> {d.file_name}
                        </a>
                        <span className="text-xs text-bid-muted/70">{formatDateTime(d.uploaded_at)}</span>
                        {i > 0 && <StatusBadge status={d.status} />}
                        {d.review_note && <span className="text-xs text-bid-muted">“{d.review_note}”</span>}
                        {i === 0 && d.status === 'enviado' && <div className="ml-auto"><ReviewButtons docId={d.id} /></div>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-6">
            <h2 className="font-bold">QR code de acesso</h2>
            <p className="mt-1 text-xs text-bid-muted">Quem escanear entra direto no painel deste expositor. Imprima ou envie por WhatsApp.</p>
            {link && !expired ? (
              <>
                <div className="mt-4 flex justify-center"><QrCode value={link} size={200} /></div>
                <p className="mt-3 break-all rounded-lg bg-bid-surface-soft p-2 text-xs text-bid-muted">{link}</p>
                <p className="mt-1 text-xs text-bid-muted/70">Válido até {formatDate(ex.access_token_expires_at)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton text={link} />
                  <form action={revokeTokenAction}>
                    <input type="hidden" name="id" value={ex.id} />
                    <SubmitButton className="btn-danger" pendingText="…">Revogar</SubmitButton>
                  </form>
                </div>
              </>
            ) : (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{expired ? 'Link expirado.' : 'Acesso por QR desativado.'}</p>
            )}
            <form action={regenerateTokenAction} className="mt-3">
              <input type="hidden" name="id" value={ex.id} />
              <SubmitButton className="btn-secondary w-full" pendingText="Gerando…">
                {link ? 'Gerar novo QR (invalida o atual)' : 'Gerar QR code'}
              </SubmitButton>
            </form>
          </section>

          <section className="card p-6">
            <h2 className="font-bold">Pessoas com acesso</h2>
            <p className="mt-1 text-xs text-bid-muted">Entram por link mágico no e-mail.</p>
            <ul className="mt-3 space-y-2 text-sm">
              {(memberProfiles ?? []).map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{m.email}</span>
                  {m.email !== ex.contact_email && (
                    <form action={removeMemberAction}>
                      <input type="hidden" name="id" value={ex.id} />
                      <input type="hidden" name="user_id" value={m.id} />
                      <button className="text-xs text-red-600 hover:underline">remover</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4"><AddMemberForm exhibitorId={ex.id} /></div>
          </section>

          <section className="card p-6">
            <h2 className="font-bold">Onboarding</h2>
            <div className="mt-3"><Progress value={ob.pct} /></div>
            <ul className="mt-4 space-y-1.5 text-sm">
              {ONBOARDING_STEPS.map((s) => (
                <li key={s.id} className={ob.isDone(s.id) ? 'text-emerald-700' : 'text-bid-muted/70'}>
                  {ob.isDone(s.id) ? '✓' : '○'} {s.title}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
