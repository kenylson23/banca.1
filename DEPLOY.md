# Deploy completo (Railway)

**Build command:** `npm install --registry=https://registry.npmjs.org/ --no-audit --no-fund && npm run build`
**Start command:** `SERVE_STATIC=true NODE_ENV=production node dist/index.js`

O Railway serve o frontend React, a API Express e o WebSocket no mesmo domínio.

## Variáveis de ambiente obrigatórias

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `production` |
| `SERVE_STATIC` | `true` para o Railway servir o frontend junto com a API |
| `DATABASE_URL` | URL do PostgreSQL (use Neon, Supabase ou Railway Postgres) |
| `SESSION_SECRET` | Chave aleatória longa para assinar sessões |
| `CRON_SECRET` | Chave longa para autenticar `/api/cron/check-subscriptions` (configure se usar esse endpoint) |
| `PORT` | Railway define automaticamente |
| `CORS_ORIGINS` | Não é necessária quando frontend e API usam o mesmo domínio. Só use para um frontend separado. |
| `UPLOAD_DIR` | (opcional) Diretório de imagens no backend. Padrão: `uploads`. Use um volume persistente no Railway se precisar preservar uploads entre deploys. |
| `REDIS_URL` | (opcional) Redis para cache e WebSocket compartilhados entre múltiplas instâncias |
| `TWILIO_ACCOUNT_SID` | (opcional) WhatsApp |
| `TWILIO_AUTH_TOKEN` | (opcional) |
| `TWILIO_WHATSAPP_NUMBER` | (opcional) |

## Após o deploy

1. Criar um serviço PostgreSQL no Railway (ou conectar Neon/Supabase).
2. Adicionar `DATABASE_URL` e `SESSION_SECRET` no serviço Railway.
3. Deixar `CORS_ORIGINS` vazia quando o frontend for servido pelo próprio Railway. Se usar um frontend externo, informe os domínios permitidos separados por vírgula.
4. Definir `CRON_SECRET` se for usar o endpoint de verificação de assinaturas.
5. O Start Command já define `NODE_ENV=production` e `SERVE_STATIC=true` para servir o frontend e a API no mesmo domínio. O Railway fornece `PORT` automaticamente.
6. O health check deve responder em `GET /api/health`.
7. As migrações e a criação/verificação das tabelas são executadas no startup.
8. O startup não cria mais um superadmin com senha conhecida. Para criar o primeiro, execute `npm run admin:create` em um ambiente com acesso ao mesmo `DATABASE_URL`.

> O comando de build força o registry público porque o ambiente Replit pode gravar URLs
> internas no `package-lock.json`; essas URLs não são acessíveis durante o build no Railway.
> Usamos `npm install` em vez de `npm ci` porque o cache do Nixpacks pode montar
> `/app/node_modules/.cache`; o `npm ci` tenta apagar essa montagem e falha com `EBUSY`.

## Frontend separado na Vercel (opcional)

Use esta opção somente se precisar manter o frontend separado do Railway.

**Root directory:** `/` (raiz do repositório)
**Build command:** `npm run build:client`
**Output directory:** `dist/public`

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL do backend no Railway. Ex: `https://seu-backend.up.railway.app` |

## Após o deploy

1. Fazer o deploy do backend no Railway e copiar o domínio público `https://...`.
2. No Vercel, definir `VITE_API_URL` com esse domínio, sem `/` no final.
3. Fazer o deploy do frontend na Vercel.
4. Copiar o domínio final da Vercel para `CORS_ORIGINS` no Railway e fazer redeploy do backend.
5. Se usar domínio personalizado, incluir também a versão `www` (se existir).

## WebSocket, sessões e URLs

- O frontend usa `VITE_API_URL` para API e WebSocket (`/ws`). Quando é servido pelo próprio Railway, deixe `VITE_API_URL` vazia para usar o mesmo domínio.
- Como frontend e backend ficam no mesmo domínio no Railway, não é necessário CORS adicional e as sessões usam cookies same-site.
- Se usar a Vercel, configure `VITE_API_URL` com a URL pública do Railway e `CORS_ORIGINS` com o domínio final da Vercel; nesse caso o backend usa cookies `SameSite=None; Secure`.
- Não coloque `DATABASE_URL` ou `SESSION_SECRET` no Vercel. Variáveis `VITE_*` são públicas no bundle; use apenas a URL pública do backend.
- Imagens enviadas pelo painel são servidas pelo Railway em `/uploads/...`; elas não dependem mais dos arquivos estáticos da Vercel. O filesystem do Railway pode ser efêmero, então configure um volume persistente ou migre para object storage antes de depender desses uploads em produção.
