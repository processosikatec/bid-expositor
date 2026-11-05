'use server';

import { revalidatePath } from 'next/cache';
import { requireExhibitor } from '@/lib/auth';

export async function deleteDocument(form: FormData) {
  const { supabase, exhibitor } = await requireExhibitor();
  const id = String(form.get('id') ?? '');

  // RLS garante: só do próprio expositor e não aprovado
  const { data: doc } = await supabase
    .from('documents')
    .select('id, file_path, status')
    .eq('id', id)
    .eq('exhibitor_id', exhibitor.id)
    .maybeSingle();
  if (!doc || doc.status === 'aprovado') return;

  const { error } = await supabase.from('documents').delete().eq('id', doc.id);
  if (!error) await supabase.storage.from('bid-documentos').remove([doc.file_path]);
  revalidatePath('/expositor', 'layout');
}
