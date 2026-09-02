# Backend (Railway)

**Build command:** `npm install && npm run build`
**Start command:** `node dist/index.js`

## Variáveis de ambiente obrigatórias

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `production` |
| `SERVE_STATIC` | `false` (servidor só expõe API; frontend está em outro deploy) |
| `DATABASE_URL` | URL do PostgreSQL (use Neon, Supabase ou Railway Postgres) |
| `SESSION_SECRET` | Chave aleatória longa para assinar sessões |
| `PORT` | Railway define automaticamente |
| `CORS_ORIGINS` | Lista separada por vírgulas. Ex: `https://seu-app.vercel.app,https://www.seu-dominio.com` |
| `TWILIO_ACCOUNT_SID` | (opcional) WhatsApp |
| `TWILIO_AUTH_TOKEN` | (opcional) |
| `TWILIO_WHATSAPP_NUMBER` | (opcional) |

## Após o deploy

1. Criar um serviço PostgreSQL no Railway (ou conectar Neon/Supabase).
2. Adicionar `DATABASE_URL` e `SESSION_SECRET` no serviço Railway.
3. Definir `CORS_ORIGINS` com a URL final da Vercel, sem barra no final. Para múltiplos domínios, separar por vírgulas.
4. Definir `NODE_ENV=production` e `SERVE_STATIC=false`. O Railway fornece `PORT` automaticamente.
5. O health check deve responder em `GET /api/health`.
6. As migrações e a criação/verificação das tabelas são executadas no startup.

---

# Frontend (Vercel)

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

## WebSocket e sessões

- O frontend usa `VITE_API_URL` para API e WebSocket (`/ws`), então o Railway precisa aceitar conexões WebSocket.
- Como o frontend e backend ficam em domínios diferentes, o backend configura cookies de sessão `SameSite=None; Secure` quando `CORS_ORIGINS` está definido.
- Não coloque `DATABASE_URL` ou `SESSION_SECRET` no Vercel. Variáveis `VITE_*` são públicas no bundle; use apenas a URL pública do backend.
