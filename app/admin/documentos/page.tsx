import Link from 'next/link';
import { Download } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { EVENT } from '@/lib/event';
import { formatDate, formatDateTime } from '@/lib/format';
import { Badge, EmptyState, PageHeader } from '@/components/ui';
import type { DocumentType } from '@/lib/types';
import { deleteDocumentTypeAction } from '../actions';
import { ReviewButtons } from './review-buttons';
import { DocumentTypeForm } from './type-form';

export const metadata = { title: 'Documentos' };

export default async function AdminDocumentsPage() {
  const { supabase } = await requireAdmin();
  const [queueRes, typesRes] = await Promise.all([
    supabase
      .from('documents')
      .select('id, file_path, file_name, uploaded_at, exhibitor:exhibitors(id, company_name, trade_name), type:document_types(name)')
      .eq('status', 'enviado')
      .order('uploaded_at'),
    supabase.from('document_types').select('*').order('edition').order('sort'),
  ]);

  type QueueItem = {
    id: string;
    file_path: string;
    file_name: string;
    uploaded_at: string;
    exhibitor: { id: string; company_name: string; trade_name: string | null } | null;
    type: { name: string } | null;
  };
  const queue = (queueRes.data ?? []) as unknown as QueueItem[];
  const types = (typesRes.data ?? []) as DocumentType[];

  const { data: signed } = queue.length
    ? await createAdminClient().storage.from('bid-documentos').createSignedUrls(queue.map((q) => q.file_path), 600)
    : { data: [] };
  const urlFor = (p: string) => signed?.find((s) => s.path === p)?.signedUrl ?? undefined;

  return (
    <>
      <PageHeader title="Documentos" description="Revise os envios e configure os documentos exigidos de cada edição." />

      <section className="mb-8">
        <h2 className="mb-3 font-bold">Aguardando análise ({queue.length})</h2>
        {queue.length === 0 ? (
          <EmptyState title="Fila vazia">Nenhum documento aguardando análise.</EmptyState>
        ) : (
          <div className="card divide-y divide-bid-text/8">
            {queue.map((q) => (
              <div key={q.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/expositores/${q.exhibitor?.id}`} className="font-semibold hover:text-brand-700">
                    {q.exhibitor?.trade_name || q.exhibitor?.company_name}
                  </Link>
                  <p className="text-sm text-bid-muted">{q.type?.name}</p>
                  <a href={urlFor(q.file_path)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-700">
                    <Download className="h-3.5 w-3.5" /> {q.file_name}
                  </a>
                  <span className="ml-2 text-xs text-bid-muted/70">{formatDateTime(q.uploaded_at)}</span>
                </div>
                <ReviewButtons docId={q.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="mb-3 font-bold">Documentos exigidos</h2>
          <div className="card divide-y divide-bid-text/8">
            {types.map((t) => (
              <div key={t.id} className="flex items-start gap-3 p-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{t.name}</p>
                    <Badge>{t.edition}</Badge>
                    {t.required ? <Badge tone="blue">Obrigatório</Badge> : <Badge>Opcional</Badge>}
                  </div>
                  {t.description && <p className="text-sm text-bid-muted">{t.description}</p>}
                  <p className="text-xs text-bid-muted/70">Prazo {formatDate(t.due_date)}</p>
                </div>
                <form action={deleteDocumentTypeAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="text-xs text-red-600 hover:underline" title="Só remove se não houver envios">remover</button>
                </form>
              </div>
            ))}
            {types.length === 0 && <p className="p-4 text-sm text-bid-muted">Nenhum tipo cadastrado.</p>}
          </div>
        </div>
        <div className="card h-fit p-5">
          <h2 className="mb-3 font-bold">Novo tipo de documento</h2>
          <DocumentTypeForm edition={EVENT.edition} nextEdition={EVENT.nextEdition} />
        </div>
      </section>
    </>
  );
}
