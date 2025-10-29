# 🚨 Guia Rápido: Alterações Não Aparecem no Render

## ⚡ Diagnóstico Rápido em 3 Minutos

### Passo 1: Verificar o Build Command (CRÍTICO!)

Você fez mudanças no `shared/schema.ts`? **SIM** ✅

Então você PRECISA deste Build Command:

```bash
npm install --include=dev && npm run db:push -- --force && npm run build
```

**Como verificar/corrigir:**

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique no seu Web Service (nabancada)
3. Vá em **Settings**
4. Role até **Build Command**
5. **Copie e cole EXATAMENTE:**
   ```bash
   npm install --include=dev && npm run db:push -- --force && npm run build
   ```
6. Click em **Save Changes**
7. Aguarde mensagem de confirmação

---

### Passo 2: Limpar Cache e Fazer Deploy

**MUITO IMPORTANTE:** Cache antigo pode estar sendo usado.

1. No topo da página, clique em **"Manual Deploy"**
2. Selecione **"Clear build cache & deploy"** (NÃO use "Deploy latest commit")
3. Aguarde 5-10 minutos para completar

---

### Passo 3: Verificar os Logs

Enquanto aguarda, vá em **"Events"** → Clique no deploy em progresso

**Procure por estas linhas (em ordem):**

✅ `npm install --include=dev` - Instalando dependências
✅ `npm run db:push -- --force` - Aplicando migração
✅ `Tabelas criadas/alteradas com sucesso` - Migração OK
✅ `vite build` - Compilando frontend
✅ `✓ built in XXXms` - Build OK
✅ `esbuild server/index.ts` - Compilando backend
✅ `dist/index.js` - Server OK

**Se NÃO ver `npm run db:push`:**
- O Build Command está errado
- Volte ao Passo 1

---

### Passo 4: Limpar Cache do Navegador

Mesmo com tudo certo no servidor, seu navegador pode usar cache antigo:

**Windows/Linux:**
1. Abra seu site no Render
2. Pressione `Ctrl + Shift + R` (hard refresh)

**Mac:**
1. Abra seu site no Render
2. Pressione `Cmd + Shift + R`

**OU:**
- Abra uma **janela anônima/privada**
- Acesse o site do Render nela

---

## 🎯 Por Que Isso Acontece?

Você fez alterações em:
- ✅ `shared/schema.ts` (novas tabelas/campos)
- ✅ `client/src` (novo frontend)
- ✅ `server/` (novo backend)

**Sem `npm run db:push -- --force` no Build Command:**
- ❌ Backend e frontend são compilados (novo código)
- ❌ MAS o banco de dados fica com estrutura ANTIGA
- ❌ Resultado: Código novo tenta usar campos que não existem = ERRO

---

## ✅ Checklist Completo

Marque cada item conforme completa:

- [ ] Build Command atualizado com `npm run db:push -- --force`
- [ ] Executou "Clear build cache & deploy"
- [ ] Aguardou deploy completar (5-10 min)
- [ ] Verificou logs mostrando migração executada
- [ ] Fez hard refresh no navegador (`Ctrl + Shift + R`)
- [ ] Testou em janela anônima

**Se TODOS marcados e ainda não funciona:**
→ Consulte [RENDER_DIAGNOSTIC_DEPLOY.md](./RENDER_DIAGNOSTIC_DEPLOY.md) para diagnóstico avançado

---

## 🔧 Configuração Completa do Render

Para referência, sua configuração deve estar assim:

**Build Command:**
```bash
npm install --include=dev && npm run db:push -- --force && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
```
DATABASE_URL=postgresql://...  (Internal Database URL)
NODE_ENV=production
SESSION_SECRET=xxxx...  (32+ caracteres aleatórios)
```

**Build & Deploy:**
- Auto-Deploy: **Yes**
- Branch: **main**

---

## 📊 Entender os Logs

Ao executar "Clear build cache & deploy", você verá algo assim:

```
==> Cloning from https://github.com/...
==> Running build command: npm install --include=dev && npm run db:push -- --force && npm run build

added 847 packages in 45s

> db:push
> drizzle-kit push

...
✓ Tabelas criadas/alteradas com sucesso
...

> build
> vite build && esbuild server/index.ts...

vite v5.4.20 building for production...
✓ 847 modules transformed.
dist/public/index.html                   2.29 kB │ gzip:  0.83 kB
dist/public/assets/index-D5oCZlUf.js   717.51 kB │ gzip: 208.17 kB

✓ built in 5.42s

  dist/index.js  106.7kb

==> Build successful! 🎉
==> Uploading build...
==> Build uploaded successfully
==> Starting service...
```

**O hash `D5oCZlUf` muda a cada build com código novo!**

---

## 🆘 Ainda Não Funciona?

Execute este teste:

1. Render → Seu Web Service → **Shell** (menu superior)
2. Execute:
   ```bash
   npm run db:push -- --force
   ```
3. Se aparecer erros, copie e me envie

---

**Tempo estimado:** 3-5 minutos
**Última atualização:** Outubro 2025
