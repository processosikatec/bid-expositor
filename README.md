# Painel do Expositor — BID

Guia e manual do expositor do evento BID: manual público, onboarding, gestão de documentos, "Meu estande", pré-cadastro de novos expositores 2027 e área administrativa da organização.

Stack: Next.js 16 (App Router, `proxy.ts`) · Tailwind 4 · Supabase (Auth, Postgres com RLS, Storage) · deploy Netlify.

## Áreas

| Rota | Quem | O quê |
|---|---|---|
| `/` | público | Home do guia, datas importantes |
| `/manual` | público | Manual do expositor (conteúdo em `lib/event.ts`) |
| `/novos-expositores-2027` | público | Pré-cadastro para 2027 (rate limit + honeypot) |
| `/entrar` | público | Login sem senha por **link mágico** (só e-mails cadastrados) |
| `/acesso/<token>` | público | Login por **QR code / link individual** do expositor |
| `/expositor` | expositor | Início, progresso, prazos, QR para abrir no celular |
| `/expositor/onboarding` | expositor | Checklist (etapa de documentos conclui sozinha) |
| `/expositor/estande` | expositor | Código, pavilhão, área, energia, horários, planta |
| `/expositor/documentos` | expositor | Envio (PDF/JPG/PNG ≤ 10 MB), status, motivo de reprovação |
| `/admin` | organização | KPIs, fila de documentos, pré-cadastros |
| `/admin/expositores` | organização | Cadastro, estande, QR (gerar/revogar), pessoas com acesso, revisão de docs |
| `/admin/documentos` | organização | Fila de aprovação e tipos de documento por edição |
| `/admin/novos-2027` | organização | Pré-cadastros → aprovar e criar expositor 2027 |

Login é opcional: manual, home e pré-cadastro são públicos; só a área pessoal exige acesso.

## Setup (projeto Supabase compartilhado, schema `bid`)

O BID roda no mesmo projeto Supabase do painel-bp-admin e dos painéis de CX. Tudo do BID fica isolado no schema `bid` e no bucket `bid-documentos`. Nada é criado em `public` e não há trigger em `auth.users`.

1. Rode no SQL Editor, em ordem: `supabase/migrations/0001_schema.sql`, `0002_rls.sql`, `0003_storage.sql` e (opcional) `supabase/seed.sql`.
2. **Settings > API > Data API > Exposed schemas**: adicione `bid` (mantenha `public`). Sem isso a API responde `Invalid schema: bid`.
3. **Authentication > URL Configuration > Redirect URLs**: *adicione* `https://<dominio-do-bid>/auth/callback` e `http://localhost:3000/auth/callback`.
   **Não altere o Site URL**: ele é do painel-bp-admin.
4. Copie `.env.example` para `.env.local`, usando a URL e as chaves do projeto compartilhado.
5. `npm install && npm run dev`
6. Torne-se admin do BID (o usuário precisa existir em Authentication > Users; não mexe no seu papel do painel-bp-admin):
   ```sql
   insert into bid.profiles (id, email, role)
   select id, lower(email), 'admin' from auth.users where lower(email) = 'seu@email.com'
   on conflict (id) do update set role = 'admin';
   ```
   Entre em `/entrar` com esse e-mail.

### Convivência com os outros painéis

- A base de logins (`auth.users`) é compartilhada. Expositores criados pelo BID **não** ganham `public.profiles`, então não acessam o painel-bp-admin.
- Alguém do time interno pode pedir link mágico no BID. Sem vínculo com um expositor e sem ser admin em `bid.profiles`, cai em "sem expositor".
- O template do e-mail de link mágico (Authentication > Email Templates) também é compartilhado. Um texto específico do BID exige SMTP ou template próprio.

## Como o acesso funciona

- **Link mágico**: `signInWithOtp` com `shouldCreateUser: false` — só quem a organização cadastrou recebe o link.
- **QR code**: cada expositor tem um `access_token` aleatório (validade de 180 dias). Em `/acesso/<token>` o servidor valida o token e cria uma sessão Supabase real para o e-mail de contato (`generateLink` + `verifyOtp`), então o RLS vale igual ao login por e-mail. O admin pode **revogar** ou **gerar novo** (o anterior para de funcionar). Status "cancelado" bloqueia o QR.
- O token fica em texto no banco, para o admin poder reimprimir o QR. Quem tem o QR entra como o expositor: trate como senha.

## Personalizar

- **Conteúdo do evento** (datas, local, manual, onboarding, contatos): `lib/event.ts`
- **Cores da marca**: tokens `--color-brand-*` em `app/globals.css`
- **Planta**: `components/stand-map.tsx` (grade 12×8 ilustrativa; trocar pela planta real)
- **Documentos exigidos**: pelo admin em `/admin/documentos`
