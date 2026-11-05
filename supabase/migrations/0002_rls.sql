-- RLS do schema bid: expositor só enxerga o próprio expositor; admin do BID
-- (bid.profiles.role = 'admin') enxerga tudo. Independe dos papéis do
-- painel-bp-admin.

create or replace function bid.is_admin()
returns boolean
language sql stable security definer
set search_path = bid
as $$
  select exists (select 1 from bid.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function bid.is_member(p_exhibitor uuid)
returns boolean
language sql stable security definer
set search_path = bid
as $$
  select exists (
    select 1 from bid.exhibitor_members
    where exhibitor_id = p_exhibitor and user_id = auth.uid()
  );
$$;

alter table bid.profiles enable row level security;
alter table bid.exhibitors enable row level security;
alter table bid.exhibitor_members enable row level security;
alter table bid.stands enable row level security;
alter table bid.document_types enable row level security;
alter table bid.documents enable row level security;
alter table bid.applications_2027 enable row level security;

create policy profiles_select on bid.profiles
  for select using (id = auth.uid() or bid.is_admin());
create policy profiles_admin_write on bid.profiles
  for all using (bid.is_admin()) with check (bid.is_admin());

create policy exhibitors_select on bid.exhibitors
  for select using (bid.is_member(id) or bid.is_admin());
create policy exhibitors_admin_write on bid.exhibitors
  for all using (bid.is_admin()) with check (bid.is_admin());

create policy members_select on bid.exhibitor_members
  for select using (user_id = auth.uid() or bid.is_admin());
create policy members_admin_write on bid.exhibitor_members
  for all using (bid.is_admin()) with check (bid.is_admin());

create policy stands_select on bid.stands
  for select using (bid.is_member(exhibitor_id) or bid.is_admin());
create policy stands_admin_write on bid.stands
  for all using (bid.is_admin()) with check (bid.is_admin());

-- Tipos de documento: só quem tem vínculo com o BID (membro ou admin)
create policy document_types_select on bid.document_types
  for select using (
    bid.is_admin() or exists (select 1 from bid.exhibitor_members where user_id = auth.uid())
  );
create policy document_types_admin_write on bid.document_types
  for all using (bid.is_admin()) with check (bid.is_admin());

create policy documents_select on bid.documents
  for select using (bid.is_member(exhibitor_id) or bid.is_admin());
create policy documents_member_insert on bid.documents
  for insert with check (
    bid.is_member(exhibitor_id)
    and uploaded_by = auth.uid()
    and status = 'enviado'
    and review_note is null
    and reviewed_by is null
  );
create policy documents_member_delete on bid.documents
  for delete using (bid.is_member(exhibitor_id) and status <> 'aprovado');
create policy documents_admin_all on bid.documents
  for all using (bid.is_admin()) with check (bid.is_admin());

-- Pré-cadastro público entra pelo servidor (service role + rate limit)
create policy applications_admin_all on bid.applications_2027
  for all using (bid.is_admin()) with check (bid.is_admin());

-- Onboarding: expositor marca/desmarca etapas sem editar outras colunas
create or replace function bid.set_onboarding_step(p_exhibitor uuid, p_step text, p_done boolean)
returns jsonb
language plpgsql security definer
set search_path = bid
as $$
declare
  v_steps jsonb;
begin
  if not (bid.is_member(p_exhibitor) or bid.is_admin()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_step !~ '^[a-z0-9-]{1,40}$' then
    raise exception 'invalid step';
  end if;

  update bid.exhibitors
     set onboarding_steps = case
           when p_done then onboarding_steps || jsonb_build_object(p_step, now())
           else onboarding_steps - p_step
         end
   where id = p_exhibitor
   returning onboarding_steps into v_steps;
  return v_steps;
end;
$$;

revoke all on function bid.set_onboarding_step(uuid, text, boolean) from public, anon;
grant execute on function bid.set_onboarding_step(uuid, text, boolean) to authenticated;

-- Localiza usuário de auth pelo e-mail (base de logins compartilhada).
-- Só o servidor (service_role) pode chamar.
create or replace function bid.find_auth_user(p_email text)
returns uuid
language sql stable security definer
set search_path = auth, bid
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

revoke all on function bid.find_auth_user(text) from public, anon, authenticated;
grant execute on function bid.find_auth_user(text) to service_role;
