import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { DB_SCHEMA } from './config';

// Client com service_role — ignora RLS. Só usar em código de servidor.
// O import 'server-only' faz o build falhar se um client component importar.
// Apontado para o schema `bid`: nunca lê/escreve tabelas de outros painéis.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada — ver .env.local.');
  }
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
