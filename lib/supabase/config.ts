// Projeto Supabase compartilhado com outros painéis: todas as tabelas do BID
// vivem no schema `bid`. Precisa estar em Settings > API > Exposed schemas.
export const DB_SCHEMA = 'bid' as const;
