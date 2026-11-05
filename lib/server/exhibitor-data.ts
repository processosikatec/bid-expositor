import 'server-only';
import type { SessionContext } from '../auth';
import type { DocumentType, Exhibitor, ExhibitorDocument, Stand } from '../types';

/** Carrega estande, tipos de documento e documentos do expositor (via RLS). */
export async function loadExhibitorData(supabase: SessionContext['supabase'], exhibitor: Exhibitor) {
  const [stand, types, docs] = await Promise.all([
    supabase.from('stands').select('*').eq('exhibitor_id', exhibitor.id).maybeSingle(),
    supabase.from('document_types').select('*').eq('edition', exhibitor.edition).order('sort'),
    supabase.from('documents').select('*').eq('exhibitor_id', exhibitor.id).order('uploaded_at', { ascending: false }),
  ]);
  return {
    stand: (stand.data as Stand | null) ?? null,
    types: (types.data as DocumentType[] | null) ?? [],
    docs: (docs.data as ExhibitorDocument[] | null) ?? [],
  };
}
