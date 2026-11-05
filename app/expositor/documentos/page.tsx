import { Download, FileText } from 'lucide-react';
import { requireExhibitor } from '@/lib/auth';
import { loadExhibitorData } from '@/lib/server/exhibitor-data';
import { docsSummary } from '@/lib/progress';
import { daysUntil, formatBytes, formatDate, formatDateTime } from '@/lib/format';
import { Badge, EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { Uploader } from './uploader';
import { deleteDocument } from './actions';

export const metadata = { title: 'Documentos' };

export default async function DocumentsPage() {
  const { supabase, exhibitor } = await requireExhibitor();
  const { types, docs } = await loadExhibitorData(supabase, exhibitor);
  const ds = docsSummary(types, docs);

  const paths = [...ds.latest.values()].map((d) => d.file_path);
  const { data: signed } = paths.length
    ? await supabase.storage.from('bid-documentos').createSignedUrls(paths, 60 * 10)
    : { data: [] };
  const urlFor = (path: string) => signed?.find((s) => s.path === path)?.signedUrl ?? null;

  return (
    <>
      <PageHeader
        title="Documentos"
        description={`${ds.sentRequiredCount} de ${ds.requiredCount} obrigatórios enviados · ${ds.approvedRequiredCount} aprovados. PDF, JPG ou PNG até 10 MB.`}
      />

      {types.length === 0 && <EmptyState title="Nenhum documento solicitado ainda." />}

      <div className="space-y-3">
        {types.map((t) => {
          const doc = ds.latest.get(t.id);
          const url = doc ? urlFor(doc.file_path) : null;
          const left = t.due_date ? daysUntil(t.due_date) : null;
          const late = left !== null && left < 0 && (!doc || doc.status === 'reprovado');
          return (
            <div key={t.id} className="card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <FileText className="hidden h-8 w-8 shrink-0 text-bid-text/20 sm:block" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{t.name}</h3>
                    {t.required ? <Badge tone="blue">Obrigatório</Badge> : <Badge>Opcional</Badge>}
                    <StatusBadge status={doc?.status ?? 'pendente_envio'} />
                  </div>
                  {t.description && <p className="mt-1 text-sm text-bid-muted">{t.description}</p>}
                  <p className={`mt-1 text-xs ${late ? 'font-semibold text-red-600' : 'text-bid-muted/70'}`}>
                    {t.due_date ? `Prazo: ${formatDate(t.due_date)}${late ? ' — atrasado' : ''}` : 'Sem prazo definido'}
                    {t.template_url && (
                      <>
                        {' · '}
                        <a href={t.template_url} target="_blank" rel="noreferrer" className="text-brand-700 underline">Baixar modelo</a>
                      </>
                    )}
                  </p>

                  {doc && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-bid-surface-soft px-3 py-2 text-sm">
                      <span className="truncate font-medium">{doc.file_name}</span>
                      <span className="text-xs text-bid-muted/70">{formatBytes(doc.file_size)} · {formatDateTime(doc.uploaded_at)}</span>
                      {url && (
                        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand-700">
                          <Download className="h-3.5 w-3.5" /> Ver
                        </a>
                      )}
                      {doc.status !== 'aprovado' && (
                        <form action={deleteDocument} className="ml-auto">
                          <input type="hidden" name="id" value={doc.id} />
                          <button className="text-xs font-medium text-red-600 hover:underline">Remover</button>
                        </form>
                      )}
                    </div>
                  )}
                  {doc?.status === 'reprovado' && doc.review_note && (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                      <strong>Motivo:</strong> {doc.review_note}
                    </p>
                  )}
                </div>
                {doc?.status !== 'aprovado' && (
                  <Uploader exhibitorId={exhibitor.id} documentTypeId={t.id} label={doc ? 'Reenviar' : 'Enviar'} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
