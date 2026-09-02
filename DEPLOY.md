# Backend (Railway)

**Build command:** `npm install --registry=https://registry.npmjs.org/ --no-audit --no-fund && npm run build`
**Start command:** `SERVE_STATIC=true NODE_ENV=production node dist/index.js`

## Variáveis de ambiente obrigatórias

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `production` |
| `SERVE_STATIC` | `true` para o Railway servir também o frontend compilado (já incluído no Start Command) |
| `DATABASE_URL` | URL do PostgreSQL (use Neon, Supabase ou Railway Postgres) |
| `SESSION_SECRET` | Chave aleatória longa para assinar sessões |
| `CRON_SECRET` | Chave longa para autenticar `/api/cron/check-subscriptions` (configure se usar esse endpoint) |
| `PORT` | Railway define automaticamente |
| `CORS_ORIGINS` | Lista separada por vírgulas. Ex: `https://seu-app.vercel.app,https://www.seu-dominio.com` |
| `REDIS_URL` | (opcional) Redis para cache e WebSocket compartilhados entre múltiplas instâncias |
| `TWILIO_ACCOUNT_SID` | (opcional) WhatsApp |
| `TWILIO_AUTH_TOKEN` | (opcional) |
| `TWILIO_WHATSAPP_NUMBER` | (opcional) |

## Após o deploy

1. Criar um serviço PostgreSQL no Railway (ou conectar Neon/Supabase).
2. Adicionar `DATABASE_URL` e `SESSION_SECRET` no serviço Railway.
3. Se também usar a Vercel, definir `CORS_ORIGINS` com a URL final da Vercel, sem barra no final. Para múltiplos domínios, separar por vírgulas. Se usar somente o Railway, essa variável pode ficar ausente.
4. Definir `CRON_SECRET` se for usar o endpoint de verificação de assinaturas.
5. O Start Command já define `NODE_ENV=production` e `SERVE_STATIC=true` para abrir o frontend pela URL do Railway. O Railway fornece `PORT` automaticamente.
6. O health check deve responder em `GET /api/health`.
7. As migrações e a criação/verificação das tabelas são executadas no startup.

> O comando de build força o registry público porque o ambiente Replit pode gravar URLs
> internas no `package-lock.json`; essas URLs não são acessíveis durante o build no Railway.
> Usamos `npm install` em vez de `npm ci` porque o cache do Nixpacks pode montar
> `/app/node_modules/.cache`; o `npm ci` tenta apagar essa montagem e falha com `EBUSY`.

---

# Frontend (Vercel, opcional)

**Root directory:** `/` (raiz do repositório)
**Build command:** `npm run build:client`
**Output directory:** `dist/public`

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL do backend no Railway. Ex: `https://seu-backend.up.railway.app` |

## Após o deploy

1. Fazer o deploy do backend no Railway e copiar o domínio público `https://...`. Esse domínio já servirá o frontend quando `SERVE_STATIC=true`.
2. No Vercel, definir `VITE_API_URL` com esse domínio, sem `/` no final.
3. Fazer o deploy do frontend na Vercel.
4. Copiar o domínio final da Vercel para `CORS_ORIGINS` no Railway e fazer redeploy do backend.
5. Se usar domínio personalizado, incluir também a versão `www` (se existir).

## WebSocket e sessões

- O frontend usa `VITE_API_URL` para API e WebSocket (`/ws`), então o Railway precisa aceitar conexões WebSocket.
- Quando o frontend é aberto pelo próprio Railway, `VITE_API_URL` pode ficar vazio no build e as chamadas usam o mesmo domínio. Na Vercel, configure `VITE_API_URL` com a URL pública do Railway.
- Como o frontend e backend ficam no mesmo domínio quando o Railway serve o frontend, não é necessário CORS adicional. Se usar a Vercel, o backend configura cookies de sessão `SameSite=None; Secure` quando `CORS_ORIGINS` está definido.
- Não coloque `DATABASE_URL` ou `SESSION_SECRET` no Vercel. Variáveis `VITE_*` são públicas no bundle; use apenas a URL pública do backend.
