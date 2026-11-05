'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const MAX = 10 * 1024 * 1024;
const TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

function safeName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(-80);
}

export function Uploader({ exhibitorId, documentTypeId, label }: { exhibitorId: string; documentTypeId: string; label: string }) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onFile(file: File) {
    setError('');
    if (!TYPES.includes(file.type)) return setError('Use PDF, JPG ou PNG.');
    if (file.size > MAX) return setError('Arquivo acima de 10 MB.');

    setBusy(true);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const path = `${exhibitorId}/${documentTypeId}/${crypto.randomUUID()}-${safeName(file.name)}`;

    const up = await supabase.storage.from('bid-documentos').upload(path, file, { contentType: file.type });
    if (up.error) {
      setBusy(false);
      return setError('Falha no envio. Tente novamente.');
    }
    const ins = await supabase.from('documents').insert({
      exhibitor_id: exhibitorId,
      document_type_id: documentTypeId,
      file_path: path,
      file_name: file.name.slice(0, 200),
      file_size: file.size,
      uploaded_by: auth.user?.id,
    });
    if (ins.error) {
      await supabase.storage.from('bid-documentos').remove([path]);
      setBusy(false);
      return setError('Falha ao registrar o documento.');
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="shrink-0 sm:text-right">
      <input
        ref={input}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
      />
      <button type="button" className="btn-primary" disabled={busy} onClick={() => input.current?.click()}>
        <Upload className="h-4 w-4" /> {busy ? 'Enviando…' : label}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
