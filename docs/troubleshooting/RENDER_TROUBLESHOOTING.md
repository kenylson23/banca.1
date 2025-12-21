# Troubleshooting - Problemas Comuns no Render

Este guia ajuda a resolver problemas comuns ao fazer deploy do NaBancada no Render.

## ❌ Problema 1: Botão de Configurações do Cardápio Digital Desaparece

### Sintomas
- O botão "Configurações" não aparece no menu lateral (sidebar)
- Funciona no Replit mas desaparece no Render
- Ao tentar acessar `/settings` diretamente, redireciona para outra página

### Causa Raiz
O botão só aparece para usuários com `role='admin'` ou `role='superadmin'`. Se a autenticação falhar ou o role não for carregado, o sistema usa o menu de cozinha que não tem o botão.

### Diagnóstico Rápido
1. Abra DevTools (F12) → Console
2. Procure por logs começando com `[AppSidebar]`
3. Verifique se mostra: `User role: admin` ou `User role: undefined`

**Se mostrar `undefined`** → Problema de autenticação (veja soluções abaixo)  
**Se mostrar `admin` mas botão não aparece** → Problema de cache (force refresh)

👉 **[Ver guia completo de correção](./RENDER_SETTINGS_BUTTON_FIX.md)**

---

## ❌ Problema 2: Configurações do Cardápio Digital não carregam dados

### Sintomas
- A página de configurações (/settings) não mostra os dados do restaurante
- Funciona localmente mas não no Render
- A página fica em branco ou mostra um erro

### Possíveis Causas

#### 1. Sessão/Autenticação não está funcionando

**Como verificar:**
1. Abra o DevTools do navegador (F12)
2. Vá na aba Console
3. Verifique se há logs do tipo:
   ```
   [QueryClient] Fetching URL: /api/auth/user
   [QueryClient] Response status: 401 for URL: /api/auth/user
   ```
4. Se vir status 401, significa que você não está autenticado

**Soluções:**

**A. Verificar variável SESSION_SECRET**
1. No painel do Render, vá em **Environment** do seu Web Service
2. Verifique se a variável `SESSION_SECRET` está configurada
3. Se não estiver, adicione:
   ```bash
   # Gerar um novo secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Copie o resultado e adicione como `SESSION_SECRET`
5. Salve e aguarde o redeploy

**B. Verificar configuração HTTPS**
1. Certifique-se de que está acessando o site via HTTPS (não HTTP)
2. O Render fornece HTTPS automaticamente
3. Acesse sempre: `https://seu-app.onrender.com`

**C. Limpar cookies e fazer login novamente**
1. Abra o DevTools (F12)
2. Vá em **Application** → **Cookies**
3. Delete todos os cookies do domínio
4. Recarregue a página
5. Faça login novamente

**D. Verificar logs do servidor**
1. No painel do Render, vá em **Logs**
2. Procure por erros relacionados a sessão:
   ```
   Error: SESSION_SECRET must be set
   Failed to initialize session store
   ```
3. Se encontrar erros, corrija as variáveis de ambiente

#### 2. Banco de dados não está acessível

**Como verificar:**
1. No painel do Render, verifique se o banco de dados está **Available** (verde)
2. Nos logs do servidor, procure por:
   ```
   Error fetching restaurant
   Failed to connect to database
   ```

**Soluções:**

**A. Verificar DATABASE_URL**
1. No painel do Web Service, vá em **Environment**
2. Confirme que `DATABASE_URL` está correta
3. Use a **Internal Database URL** (não External)
4. Exemplo correto:
   ```
   DATABASE_URL=postgresql://user:password@hostname/database
   ```

**B. Verificar região do banco**
- O banco de dados deve estar na mesma região do Web Service
- Isso evita problemas de latência e conexão

#### 3. Restaurante não tem ID ou slug configurado

**Como verificar:**
1. Nos logs do console do navegador, procure por:
   ```
   [Settings] Current user: { ..., restaurantId: null }
   ```
2. Se `restaurantId` for `null`, o usuário não está associado a um restaurante

**Soluções:**

**A. Para Super Admin:**
- Super admins não têm restaurantId
- Eles devem usar o painel /superadmin
- A página /settings não é para super admins

**B. Para Admin de Restaurante:**
1. Verifique se o restaurante foi aprovado pelo super admin
2. Acesse `/superadmin` com as credenciais de super admin
3. Aprove o restaurante (status deve ser "ativo")
4. Faça logout e login novamente como admin do restaurante

#### 4. Dados do restaurante não existem no banco

**Como verificar:**
1. Nos logs do servidor (Render → Logs), procure por:
   ```
   [API] Fetching restaurant by ID: xxx
   [API] Restaurant found: No
   ```

**Soluções:**

**A. Verificar se o restaurante existe:**
1. Conecte-se ao banco de dados usando a **External Database URL**
2. Use um cliente PostgreSQL (pgAdmin, DBeaver, TablePlus)
3. Execute:
   ```sql
   SELECT id, name, email, status FROM restaurants;
   ```
4. Verifique se seu restaurante existe e está ativo

**B. Criar restaurante se necessário:**
1. Acesse a página inicial (não logado)
2. Use a aba "Cadastrar Restaurante"
3. Preencha o formulário
4. Aguarde aprovação do super admin

## 🔍 Como debugar problemas

### 1. Habilitar logs detalhados (já implementado)

O sistema agora inclui logs detalhados para debug:

**Frontend (Console do navegador):**
```
[Settings] Current user: {...}
[Settings] Restaurant ID: xxx
[Settings] Restaurant data: {...}
[QueryClient] Fetching URL: /api/...
[QueryClient] Response status: 200
```

**Backend (Logs do Render):**
```
[API] Fetching restaurant by ID: xxx
[API] Restaurant found: Yes
[API] Returning restaurant: {...}
```

### 2. Verificar fluxo completo de autenticação

1. Fazer login
2. Verificar cookie no DevTools:
   - Abra DevTools → Application → Cookies
   - Procure por `connect.sid`
   - Verifique se existe e tem valor

3. Testar endpoint de autenticação:
   - Abra DevTools → Console
   - Execute:
     ```javascript
     fetch('/api/auth/user', { credentials: 'include' })
       .then(r => r.json())
       .then(console.log)
     ```
   - Deve retornar seus dados de usuário

4. Testar endpoint de restaurante:
   - No Console:
     ```javascript
     fetch('/api/public/restaurants/SEU_RESTAURANT_ID', { credentials: 'include' })
       .then(r => r.json())
       .then(console.log)
     ```
   - Deve retornar dados do restaurante

## 📋 Checklist de Deploy

Antes de reportar um problema, verifique:

- [ ] `DATABASE_URL` está configurada corretamente
- [ ] `SESSION_SECRET` está configurada (32+ caracteres aleatórios)
- [ ] `NODE_ENV=production` está configurada
- [ ] Banco de dados está **Available** (verde)
- [ ] Build foi concluído com sucesso (sem erros)
- [ ] Aplicação está **Live** (verde)
- [ ] Acessando via HTTPS (não HTTP)
- [ ] Cookies estão habilitados no navegador
- [ ] Fez login com credenciais corretas
- [ ] Restaurante está aprovado (status "ativo")
- [ ] Usuário está associado a um restaurante

## 🆘 Ainda com problemas?

Se após seguir este guia você ainda tiver problemas:

1. **Capture informações de debug:**
   - Screenshots dos logs do Console (F12 → Console)
   - Screenshots dos logs do Render (Logs tab)
   - Capture Network requests (F12 → Network → filtrar por "/api")

2. **Verifique configurações:**
   - Tire screenshot das Environment Variables (ocultando valores sensíveis)
   - Verifique o status do banco de dados

3. **Tente passos básicos:**
   - Force um novo deploy: Manual Deploy → Deploy latest commit
   - Reinicie o Web Service
   - Limpe todos os cookies do site
   - Tente em modo anônimo/privado do navegador

## 🔒 Segurança

**NUNCA compartilhe publicamente:**
- `SESSION_SECRET`
- `DATABASE_URL`
- Senhas de usuários
- Credenciais do banco de dados

Se precisar compartilhar logs, sempre remova informações sensíveis primeiro.

## 📚 Recursos Úteis

- [Documentação do Render](https://render.com/docs)
- [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) - Guia completo de deploy
- [Suporte do Render](https://render.com/support)
