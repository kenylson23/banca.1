# Backend (Railway)

**Build command:** `npm install && npm run build`
**Start command:** `node dist/index.cjs`

## Variáveis de ambiente obrigatórias

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `production` |
| `SERVE_STATIC` | `false` (servidor só expõe API; frontend está em outro deploy) |
| `DATABASE_URL` | URL do PostgreSQL (use Neon, Supabase ou Railway Postgres) |
| `SESSION_SECRET` | Chave aleatória longa para assinar sessões |
| `PORT` | Railway define automaticamente |
| `CORS_ORIGINS` | Lista separada por vírgulas. Ex: `https://seu-app.vercel.app,https://www.seu-dominio.com` |
| `APP_URL` | URL pública do frontend. Ex: `https://seu-app.vercel.app` |
| `TWILIO_ACCOUNT_SID` | (opcional) WhatsApp |
| `TWILIO_AUTH_TOKEN` | (opcional) |
| `TWILIO_WHATSAPP_NUMBER` | (opcional) |

## Após o deploy

1. Provisionar Postgres no Railway (ou Neon/Supabase)
2. Adicionar `DATABASE_URL` no serviço
3. As migrações em `server/migrations/*.sql` rodam automaticamente no startup

---

# Frontend (Vercel)

**Root directory:** `client`
**Build command:** `npm run build`
**Output directory:** `dist`

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL do backend no Railway. Ex: `https://seu-backend.up.railway.app` |

## Após o deploy

1. No Vercel, defina `VITE_API_URL` com a URL do Railway
2. Adicione o domínio da Vercel em `CORS_ORIGINS` no backend
3. Re-deploy do backend se necessário
