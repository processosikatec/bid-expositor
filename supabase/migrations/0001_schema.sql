-- Painel de Expositores BID — schema isolado `bid`
-- Projeto Supabase COMPARTILHADO: nada aqui toca o schema public nem cria
-- trigger em auth.users. Perfis do BID são criados pela aplicação.
create extension if not exists pgcrypto;

create schema if not exists bid;

grant usage on schema bid to authenticated, service_role;
alter default privileges in schema bid grant all on tables to authenticated, service_role;
alter default privileges in schema bid grant all on sequences to authenticated, service_role;
alter default privileges in schema bid grant execute on functions to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Perfis do BID (independente de public.profiles do painel-bp-admin)
-- ---------------------------------------------------------------------------
create table bid.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'exhibitor' check (role in ('admin', 'exhibitor')),
  created_at timestamptz not null default now()
);
create index bid_profiles_email_idx on bid.profiles (lower(email));

-- ---------------------------------------------------------------------------
-- Expositores (empresa) por edição
-- ---------------------------------------------------------------------------
create table bid.exhibitors (
  id uuid primary key default gen_random_uuid(),
  edition int not null default 2026,
  company_name text not null,
  trade_name text,
  cnpj text,
  segment text,
  contact_name text,
  contact_email text not null,
  contact_phone text,
  status text not null default 'confirmado'
    check (status in ('pendente', 'confirmado', 'cancelado')),
  access_token text unique,
  access_token_expires_at timestamptz,
  onboarding_steps jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index bid_exhibitors_edition_email_uq on bid.exhibitors (edition, lower(contact_email));

create table bid.exhibitor_members (
  exhibitor_id uuid not null references bid.exhibitors(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (exhibitor_id, user_id)
);
create index bid_exhibitor_members_user_idx on bid.exhibitor_members (user_id);

-- ---------------------------------------------------------------------------
-- Estande (1 por expositor)
-- ---------------------------------------------------------------------------
create table bid.stands (
  id uuid primary key default gen_random_uuid(),
  exhibitor_id uuid not null unique references bid.exhibitors(id) on delete cascade,
  edition int not null default 2026,
  code text not null,
  pavilion text,
  street text,
  area_m2 numeric(8, 2),
  stand_type text,
  power_kva numeric(6, 2),
  setup_start timestamptz,
  setup_end timestamptz,
  teardown_start timestamptz,
  teardown_end timestamptz,
  map_x int,
  map_y int,
  notes text,
  updated_at timestamptz not null default now(),
  unique (edition, code)
);

-- ---------------------------------------------------------------------------
-- Documentos
-- ---------------------------------------------------------------------------
create table bid.document_types (
  id uuid primary key default gen_random_uuid(),
  edition int not null default 2026,
  name text not null,
  description text,
  required boolean not null default true,
  due_date date,
  template_url text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table bid.documents (
  id uuid primary key default gen_random_uuid(),
  exhibitor_id uuid not null references bid.exhibitors(id) on delete cascade,
  document_type_id uuid not null references bid.document_types(id) on delete restrict,
  file_path text not null,
  file_name text not null,
  file_size bigint,
  status text not null default 'enviado' check (status in ('enviado', 'aprovado', 'reprovado')),
  review_note text,
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz
);
create index bid_documents_exhibitor_idx on bid.documents (exhibitor_id, uploaded_at desc);
create index bid_documents_status_idx on bid.documents (status);

-- ---------------------------------------------------------------------------
-- Novos expositores 2027 (pré-cadastro público)
-- ---------------------------------------------------------------------------
create table bid.applications_2027 (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  cnpj text,
  contact_name text not null,
  email text not null,
  phone text,
  segment text,
  desired_area text,
  website text,
  message text,
  status text not null default 'novo' check (status in ('novo', 'em_contato', 'aprovado', 'recusado')),
  admin_notes text,
  exhibitor_id uuid references bid.exhibitors(id) on delete set null,
  created_at timestamptz not null default now()
);
create index bid_applications_2027_status_idx on bid.applications_2027 (status, created_at desc);

-- updated_at automático
create or replace function bid.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger exhibitors_touch before update on bid.exhibitors
  for each row execute function bid.touch_updated_at();
create trigger stands_touch before update on bid.stands
  for each row execute function bid.touch_updated_at();

-- Grants nas tabelas já criadas (default privileges valem só para as futuras)
grant all on all tables in schema bid to authenticated, service_role;
