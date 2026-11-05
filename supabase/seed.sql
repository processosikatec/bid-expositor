-- Dados de exemplo (placeholders). Rodar depois das migrations.

insert into bid.document_types (edition, name, description, required, due_date, sort) values
  (2026, 'Contrato de participação assinado', 'Contrato de locação do espaço assinado pelo responsável legal.', true, '2026-11-20', 1),
  (2026, 'Cartão CNPJ', 'Comprovante de inscrição e situação cadastral atualizado.', true, '2026-11-20', 2),
  (2026, 'Projeto do estande', 'Planta e perspectiva do estande (obrigatório para montadora própria).', true, '2026-11-25', 3),
  (2026, 'ART/RRT de montagem', 'Anotação de responsabilidade técnica do responsável pela montagem.', true, '2026-11-28', 4),
  (2026, 'Seguro de responsabilidade civil', 'Apólice vigente durante montagem, evento e desmontagem.', true, '2026-11-28', 5),
  (2026, 'Lista de credenciados', 'Nome e documento das pessoas que trabalharão no estande.', false, '2026-12-01', 6);

-- Tornar admin do BID um usuário que já existe em auth.users (troque o e-mail).
-- Não altera nada no painel-bp-admin (public.profiles).
-- insert into bid.profiles (id, email, role)
-- select id, lower(email), 'admin' from auth.users where lower(email) = 'seu@email.com'
-- on conflict (id) do update set role = 'admin';
