# Diagnóstico: Alterações Não Refletidas no Render

Este documento identifica e resolve problemas comuns quando alterações commitadas não aparecem no Render.

## 🔍 Checklist de Diagnóstico

### 1. ✅ Verificar que o Build Command está CORRETO

No Render → Settings → Build & Deploy:

**Build Command DEVE ser:**
```bash
npm install --include=dev && npm run db:push -- --force && npm run build
```

**❌ Se estiver assim (ERRADO):**
```bash
npm install && npm run build
```
ou
```bash
npm install --include=dev && npm run build
```

**Problema**: Sem `npm run db:push -- --force`, mudanças no banco de dados NÃO são aplicadas!

---

### 2. ✅ Verificar que Auto-Deploy está ATIVADO

1. Render Dashboard → Seu Web Service
2. Settings → Build & Deploy
3. **Auto-Deploy**: deve estar **Yes**
4. **Branch**: deve ser `main` (ou sua branch principal)

---

### 3. ✅ Limpar Cache do Build

Cache antigo pode fazer o Render usar código velho:

1. Render Dashboard → Seu Web Service
2. **Manual Deploy** → **Clear build cache & deploy**
3. Aguarde o deploy completar (5-10 minutos)

---

### 4. ✅ Verificar NODE_ENV no Render

Em Render → Environment:

**DEVE ter:**
```
NODE_ENV=production
```

**❌ Se estiver faltando ou como `development`**:
- O servidor pode estar usando código de desenvolvimento
- Assets podem não ser compilados corretamente

---

### 5. ✅ Verificar Logs do Build

1. Render Dashboard → Events → Clique no último deploy
2. Procure por:

**✅ Sinais de SUCESSO:**
```
==> npm install --include=dev && npm run db:push -- --force && npm run build
✓ drizzle-kit pushed successfully
vite v5.x.x building for production...
✓ built in XXXms
dist/index.js  XXX kb
==> Build successful!
```

**❌ Sinais de PROBLEMA:**
```
Error: Command not found (status 127)
Warning: Using development dependencies in production
Build failed
Migration failed
```

---

### 6. ✅ Confirmar que o Código Foi Pushed

No seu terminal local:

```bash
# Ver status
git status

# Deve mostrar: "nothing to commit, working tree clean"

# Ver último commit local
git log --oneline -1

# Ver último commit remoto
git ls-remote origin HEAD
```

**Se os hashes forem DIFERENTES:**
- Suas alterações locais NÃO foram pushed
- Execute: `git push origin main`

---

### 7. ✅ Verificar Cache do Navegador

Mesmo com o código atualizado no servidor, seu navegador pode estar usando cache:

**Solução:**
1. **Hard Refresh:**
   - Windows/Linux: `Ctrl + Shift + R` ou `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **Testar em Janela Anônima:**
   - Chrome: `Ctrl + Shift + N` (Windows) ou `Cmd + Shift + N` (Mac)
   - Acesse a URL do Render na janela anônima

3. **Limpar Todo o Cache:**
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files

---

### 8. ✅ Verificar se as Mudanças Exigem Migração de Banco

**Se você alterou `shared/schema.ts`:**
- ✅ Mudou estrutura de tabelas (novas colunas, tipos)
- ✅ Adicionou novas tabelas
- ✅ Adicionou novos campos

**Então você PRECISA:**
1. Build Command com `npm run db:push -- --force`
2. OU executar manualmente no Shell do Render:
   ```bash
   npm run db:push -- --force
   ```

---

### 9. ✅ Verificar Timestamp do Deploy vs Commit

1. Render → Events → Ver timestamp do último deploy
2. GitHub → Seu repositório → Commits → Ver timestamp do commit

**O deploy DEVE ser DEPOIS do commit!**

**Se deploy é ANTES do commit:**
- Render não detectou o novo commit
- Auto-deploy pode estar desativado
- Branch configurada está errada

---

### 10. ✅ Teste com Rebuild Manual

Forçar um rebuild completo:

1. Render Dashboard → Settings
2. Build Command → Adicione um espaço no final → Save
3. Manual Deploy → **Deploy latest commit**
4. Aguarde completar

---

## 🔧 Soluções Rápidas por Tipo de Mudança

### Se mudou APENAS o Frontend (client/src)

**Sintomas:**
- UI antiga aparece
- Novos componentes não aparecem
- Estilos antigos

**Solução:**
1. Clear build cache & deploy
2. Hard refresh no navegador (`Ctrl + Shift + R`)
3. Verificar se `dist/public/` foi recriado nos logs

---

### Se mudou o Backend (server/)

**Sintomas:**
- Endpoints retornam dados antigos
- Novos endpoints retornam 404
- Lógica antiga executando

**Solução:**
1. Verificar se `dist/index.js` foi recriado nos logs
2. Verificar se o servidor reiniciou após o build
3. Procurar por erros de TypeScript nos logs

---

### Se mudou o Schema (shared/schema.ts)

**Sintomas:**
- Erros de banco de dados
- Campos faltando
- Queries falhando

**Solução:**
1. **OBRIGATÓRIO:** Build Command com `npm run db:push -- --force`
2. Verificar logs do push:
   ```
   ✓ Database schema synced
   ✓ Tables created/updated
   ```
3. Se falhar, executar no Shell do Render:
   ```bash
   npm run db:push -- --force
   ```

---

## 🚨 Erros Comuns e Soluções

### Erro: "Command not found" (status 127)

**Causa:** Falta `--include=dev` no Build Command

**Solução:**
```bash
npm install --include=dev && npm run db:push -- --force && npm run build
```

---

### Erro: "Module not found"

**Causa:** Dependência nova não foi instalada

**Solução:**
1. Verificar se a dependência está em `package.json`
2. Clear build cache & deploy
3. Verificar logs para confirmar `npm install` executou

---

### Erro: "Build succeeded but changes not visible"

**Causas Múltiplas:**

1. **Cache do navegador**
   - Solução: Hard refresh (`Ctrl + Shift + R`)

2. **Mudança no banco não aplicada**
   - Solução: Adicionar `npm run db:push -- --force` ao Build Command

3. **Assets com hash antigo**
   - Solução: Clear build cache & deploy

4. **CDN/Proxy cache**
   - Solução: Aguardar 5-15 minutos para propagação

---

## 📋 Processo Completo de Troubleshooting

Execute TODOS os passos na ordem:

```bash
# 1. LOCAL: Confirmar que código está committed e pushed
git status
git push origin main

# 2. RENDER: Atualizar Build Command (se necessário)
# Settings → Build Command:
npm install --include=dev && npm run db:push -- --force && npm run build

# 3. RENDER: Clear cache e fazer deploy
# Manual Deploy → Clear build cache & deploy

# 4. AGUARDAR: Deploy completar (5-10 min)
# Acompanhar em: Events → Deploy mais recente

# 5. VERIFICAR: Logs do build
# Procurar por:
# - ✓ drizzle-kit pushed (se mudou schema)
# - ✓ vite build
# - ✓ esbuild server
# - Seu serviço está no ar

# 6. BROWSER: Limpar cache
# Hard refresh: Ctrl + Shift + R
# OU: Janela anônima

# 7. TESTAR: Verificar se mudanças aparecem
```

---

## ✅ Configuração Ideal para Render

**Build Command:**
```bash
npm install --include=dev && npm run db:push -- --force && npm run build
```

**Start Command:**
```bash
npm start
```

**Variáveis de Ambiente:**
```
DATABASE_URL=<internal-database-url>
NODE_ENV=production
SESSION_SECRET=<random-32-chars>
```

**Auto-Deploy:** Yes
**Branch:** main

---

## 🔍 Como Confirmar que Mudanças Foram Aplicadas

### 1. Verificar Hash do Build

Nos logs do Vite, procure por algo como:
```
dist/public/assets/index-D5oCZlUf.js  717.51 kB │ gzip: 208.17 kB
```

O hash `D5oCZlUf` deve MUDAR a cada build que modifica o código.

**Se o hash NÃO muda:**
- Render está usando cache antigo
- Execute Clear build cache & deploy

### 2. Verificar no Navegador

1. Abra DevTools (F12)
2. Network tab → Disable cache
3. Recarregue a página
4. Procure por `index-XXXXX.js`
5. Clique no arquivo
6. Response tab → procure por seu código novo

### 3. Verificar Timestamp do Server

Adicione temporariamente um log no `server/index.ts`:

```typescript
console.log('Server built at:', new Date().toISOString());
```

Faça commit, push, e veja nos logs do Render se o timestamp é recente.

---

## 📞 Ainda Não Funciona?

Se após TODOS os passos acima as mudanças ainda não aparecem:

1. **Capture evidências:**
   - Screenshot do último commit (GitHub)
   - Screenshot do último deploy (Render Events)
   - Screenshot dos logs completos do build
   - Screenshot da página não atualizada
   - Network tab do DevTools mostrando assets

2. **Verifique novamente:**
   - Build Command está EXATAMENTE como indicado?
   - NODE_ENV=production está configurada?
   - Auto-Deploy está ativado?
   - Branch correta configurada?

3. **Teste extremo:**
   - Delete o Web Service no Render
   - Crie um novo usando Blueprint (render.yaml)
   - Isso garante configuração 100% limpa

---

**Última atualização:** Outubro 2025
