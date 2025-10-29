# Guia Completo de Diagnóstico para Deploy no Render

Este guia fornece um processo sistemático para diagnosticar e corrigir problemas no deploy do NaBancada no Render, especialmente quando o botão de Configurações desaparece.

## 🎯 Problema Principal

**Sintoma**: O botão "Configurações" aparece no Replit mas desaparece no Render após o deploy.

**Causa Raiz**: O botão só aparece para usuários com `role='admin'` ou `role='superadmin'`. Se a autenticação falhar ou o campo `role` não for carregado corretamente, o sistema usa o menu padrão (kitchen) que não inclui o botão.

## 🔧 Novas Ferramentas de Diagnóstico

O sistema agora inclui ferramentas avançadas para facilitar o diagnóstico:

### 1. Endpoint de Health Check (`/api/debug/health`)

**⚠️ Segurança**: Este endpoint só funciona quando `DEBUG_AUTH=true` está configurado no servidor. Em produção sem essa variável, retorna 404 para proteger informações sensíveis.

Acesse `https://seu-app.onrender.com/api/debug/health` para ver:

```json
{
  "status": "healthy",
  "environment": {
    "nodeEnv": "production",
    "hasSessionSecret": true,
    "hasDatabaseUrl": true,
    "port": "10000"
  },
  "session": {
    "isAuthenticated": true,
    "hasSession": true,
    "sessionID": "..."
  },
  "database": {
    "connected": true
  },
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "admin",
    "hasRestaurantId": true
  }
}
```

### 2. Painel de Debug Visual (Frontend)

Um painel visual aparece automaticamente no canto inferior direito quando:
- Ambiente é development (`NODE_ENV=development`)
- OU variável `VITE_DEBUG_AUTH=true` está configurada

O painel mostra:
- Status de autenticação (frontend e backend)
- Role do usuário
- Status da sessão
- Conexão com banco de dados
- **Alertas automáticos** quando detecta problemas

### 3. Logs Detalhados no Servidor

Os logs do servidor agora incluem informações detalhadas sobre:
- Processo de login
- Deserialização de usuário (quando sessão é validada)
- Endpoint `/api/auth/user`
- Falhas de autenticação

**Para ativar no Render:**
```
DEBUG_AUTH=true
```

## 📋 Processo de Diagnóstico Passo a Passo

### PASSO 1: Verificar Variáveis de Ambiente

1. **Acesse o painel do Render** → Seu Web Service → **Environment**
2. **Verifique que TODAS essas variáveis estão configuradas:**

```bash
DATABASE_URL=postgresql://... (Internal Database URL)
NODE_ENV=production
SESSION_SECRET=<string aleatória de 32+ caracteres>
```

3. **Como gerar SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **⚠️ IMPORTANTE**: Após adicionar/modificar variáveis, force um redeploy:
   - **Manual Deploy** → **Deploy latest commit**

### PASSO 2: Ativar Ferramentas de Debug

1. **Adicione temporariamente** estas variáveis no Render:
```bash
DEBUG_AUTH=true
VITE_DEBUG_AUTH=true
```

2. **Force um redeploy**

3. **Acesse sua aplicação** no Render

4. **Você deverá ver:**
   - Painel de debug no canto inferior direito
   - Logs detalhados no console do navegador (F12 → Console)
   - Logs detalhados no servidor (Render → Logs)

### PASSO 3: Análise com Health Check

1. **Acesse (logado ou não logado):**
```
https://seu-app.onrender.com/api/debug/health
```

2. **Verifique cada campo:**

#### ✅ Cenário Saudável:
```json
{
  "status": "healthy",
  "environment": {
    "nodeEnv": "production",
    "hasSessionSecret": true,  ← Deve ser true
    "hasDatabaseUrl": true,    ← Deve ser true
  },
  "session": {
    "isAuthenticated": true,   ← true se logado
    "hasSession": true,        ← Deve ser true se logado
  },
  "database": {
    "connected": true           ← Deve ser true
  },
  "user": {
    "role": "admin"             ← Deve estar definido e ser "admin" ou "superadmin"
  }
}
```

#### ❌ Problemas Comuns:

**A. `hasSessionSecret: false`**
- **Problema**: SESSION_SECRET não está configurada
- **Solução**: Adicione SESSION_SECRET (veja Passo 1)

**B. `hasDatabaseUrl: false`**
- **Problema**: DATABASE_URL não está configurada
- **Solução**: Adicione DATABASE_URL (veja Passo 1)

**C. `database.connected: false`**
- **Problema**: Banco de dados inacessível
- **Solução**: 
  1. Verifique se o banco está "Available" (verde) no Render
  2. Confirme que DATABASE_URL está correta
  3. Use **Internal Database URL** (não External)

**D. `isAuthenticated: false` (quando deveria estar logado)**
- **Problema**: Sessão não está sendo mantida
- **Causas possíveis**:
  - SESSION_SECRET faltando ou mudou
  - Cookies bloqueados
  - Não está acessando via HTTPS
- **Solução**: Veja Passo 4

**E. `user.role: undefined` ou campo user ausente**
- **Problema**: Campo role não está no banco ou não foi carregado
- **Solução**: Veja Passo 5
- **⚠️ IMPORTANTE**: Não há reparo automático (por segurança). Use o script SQL manual.

### PASSO 4: Diagnosticar Problemas de Sessão

Se `isAuthenticated: false` mas você fez login:

1. **Abra DevTools** (F12) → Aba **Application** → **Cookies**

2. **Procure pelo cookie `connect.sid`:**
   - **Se NÃO existir**: Sessão não foi criada
     - Verifique SESSION_SECRET no Render
     - Verifique logs do servidor para erros de sessão
   - **Se existir mas isAuthenticated=false**: Cookie não está sendo enviado
     - Confirme que está acessando via **HTTPS**
     - Limpe todos os cookies do domínio `.onrender.com`
     - Faça logout e login novamente

3. **Verifique logs do servidor** (Render → Logs):
```
[AUTH] Login successful, session created: ...
[AUTH] Deserializing user: { userId: ..., userRole: 'admin' }
```

4. **Se não ver esses logs:**
   - SESSION_SECRET pode estar faltando
   - Problema na configuração do express-session

### PASSO 5: Diagnosticar Problemas de Role

Se `user.role` está `undefined`:

1. **Verifique os logs do navegador** (F12 → Console):
```
[useAuth] User data: { id: "...", role: "admin" } ← role deve estar presente
[AppSidebar] User role: admin  ← deve mostrar admin ou superadmin
```

2. **Se role está undefined:**

**A. Verifique o banco de dados**

Conecte-se usando **External Database URL** e execute:
```sql
SELECT id, email, role, restaurant_id 
FROM users 
WHERE email = 'seu-email@exemplo.com';
```

**Resultado esperado:**
```
id     | email              | role  | restaurant_id
-------|--------------------| ------|---------------
abc123 | admin@example.com  | admin | xyz789
```

**Se role está NULL no banco:**

⚠️ **NÃO há reparo automático** por questões de segurança (evitar escalação de privilégios).

**Use o script SQL para reparo manual:**
```bash
# Execute o arquivo scripts/repair-user-roles.sql no seu banco
```

⚠️ **IMPORTANTE - Segurança**:
O script SQL NÃO faz alterações automáticas. Ele mostra os usuários com problemas para que você corrija **manualmente um por um**.

**Por que manual?**
- Kitchen staff TEM restaurantId (assim como admins)
- Não podemos usar restaurantId para distinguir admin de kitchen
- UPDATE em massa causaria escalação de privilégios (kitchen → admin)

**Processo seguro:**
1. Execute o script para VER os usuários afetados
2. Para CADA usuário, pergunte ao dono qual é o role correto
3. Execute UPDATE individual com o EMAIL específico:
```sql
-- Para super admin:
UPDATE users SET role = 'superadmin' WHERE email = 'superadmin@nabancada.com';

-- Para um admin específico:
UPDATE users SET role = 'admin' WHERE email = 'admin@restaurante.com';

-- Para kitchen staff específico:
UPDATE users SET role = 'kitchen' WHERE email = 'cozinha@restaurante.com';
```

**B. Verifique logs do servidor**

Procure por:
```
[AUTH] CRITICAL: User object missing role field!
```

Se encontrar, o problema está na deserialização. Verifique:
1. Schema do Drizzle está correto em `shared/schema.ts`
2. Tabela `users` tem a coluna `role` (tipo `user_role` enum)
3. Migrações foram executadas corretamente

**C. Verifique Network tab (F12 → Network)**

Faça login e procure pela requisição `/api/auth/user`:

**Response esperada:**
```json
{
  "id": "...",
  "email": "admin@example.com",
  "role": "admin",  ← Deve estar presente
  "restaurantId": "..."
}
```

**Se role não estiver na resposta:**
- Problema no backend
- Verifique logs do servidor
- Endpoint pode estar retornando user incompleto

### PASSO 6: Verificar Painel de Debug Visual

Com `VITE_DEBUG_AUTH=true`:

1. **Painel aparece no canto inferior direito**

2. **Clique no botão de refresh** (ícone de reload)

3. **Analise os alertas:**

**Alerta: "PROBLEMA DETECTADO: Usuário autenticado mas role está undefined"**
- Role está faltando no banco ou não foi carregado
- Siga Passo 5

**Alerta: "PROBLEMA DETECTADO: Sessão existe mas autenticação falhou"**
- Problema com SESSION_SECRET ou cookies
- Siga Passo 4

### PASSO 7: Verificar Criação do Super Admin

1. **Verifique logs do primeiro deploy** (Render → Logs)

Procure por:
```
Creating initial super admin user...
Super admin user created successfully!
Email: superadmin@nabancada.com
Password: SuperAdmin123!
```

2. **Se não encontrar esses logs:**

O super admin pode não ter sido criado. Execute SQL manualmente:

```sql
-- Verificar se super admin existe
SELECT * FROM users WHERE email = 'superadmin@nabancada.com';

-- Se não existir, criar manualmente
-- (Substitua <HASH> por um hash bcrypt da senha)
INSERT INTO users (email, password, first_name, last_name, role, restaurant_id)
VALUES ('superadmin@nabancada.com', '<HASH>', 'Super', 'Admin', 'superadmin', NULL);
```

## 🚨 Problemas Comuns e Soluções

### Problema 1: "connect ECONNREFUSED" nos logs

**Causa**: Banco de dados não está acessível

**Solução**:
1. Verifique status do banco no Render (deve estar verde "Available")
2. Use **Internal Database URL** (não External)
3. Confirme que banco está na **mesma região** do Web Service

### Problema 2: "SESSION_SECRET must be set"

**Causa**: Variável SESSION_SECRET não configurada

**Solução**:
1. Gere um secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Adicione no Render: Environment → Add Environment Variable
3. Force redeploy

### Problema 3: Botão aparece em local mas não no Render

**Causa**: Diferenças entre ambiente local e Render

**Checklist**:
- [ ] SESSION_SECRET está configurada no Render
- [ ] DATABASE_URL aponta para banco correto
- [ ] NODE_ENV=production no Render
- [ ] Fez deploy do último código (não há mudanças não commitadas)
- [ ] Build completou sem erros
- [ ] Limpou cookies do navegador
- [ ] Testou em modo anônimo

### Problema 4: "401 Unauthorized" em /api/auth/user

**Causa**: Sessão não está ativa

**Soluções**:
1. Limpe cookies: DevTools → Application → Cookies → Delete All
2. Faça logout e login novamente
3. Verifique que está acessando via HTTPS
4. Confirme SESSION_SECRET está configurada

### Problema 5: Build falha com "Command not found" (erro 127)

**Causa**: Dependências de desenvolvimento não foram instaladas

**Solução**:
Atualize Build Command no Render:
```bash
npm install --include=dev && npm run build
```

## ✅ Checklist Final

Antes de reportar que o problema persiste:

- [ ] `SESSION_SECRET` configurada (32+ caracteres)
- [ ] `DATABASE_URL` configurada (Internal URL)
- [ ] `NODE_ENV=production` configurada
- [ ] Banco de dados está **Available** (verde)
- [ ] Build completou sem erros
- [ ] Aplicação está **Live** (verde)
- [ ] Acessando via **HTTPS** (não HTTP)
- [ ] Cookies habilitados no navegador
- [ ] Fez login com credenciais corretas
- [ ] `/api/debug/health` retorna status healthy
- [ ] Campo `role` presente no banco de dados
- [ ] Campo `role` presente na resposta de `/api/auth/user`
- [ ] Limpou cookies do navegador
- [ ] Testou em modo anônimo/privado
- [ ] Forçou hard refresh (Ctrl + Shift + R)

## 🔄 Após Resolver

**IMPORTANTE - Segurança em Produção:**

Após resolver o problema, **REMOVA as variáveis de debug** do Render:

```bash
# Remover do Render Environment:
DEBUG_AUTH        # Desabilita endpoint /api/debug/health
VITE_DEBUG_AUTH   # Remove painel de debug visual
```

**Por que remover?**
- `DEBUG_AUTH`: Expõe informações de sessão, ambiente e usuários
- `VITE_DEBUG_AUTH`: Mostra dados de autenticação no frontend

**Como remover:**
1. Render → Environment → Deletar as variáveis
2. Force um redeploy: Manual Deploy → Deploy latest commit

Isso garante que informações sensíveis não fiquem expostas em produção.

## 📞 Ainda com Problemas?

Se após seguir TODO este guia o problema persistir:

1. **Capture evidências:**
   - Screenshot do `/api/debug/health`
   - Screenshot do painel de debug visual
   - Screenshot dos logs do servidor (Render → Logs)
   - Screenshot do Network tab mostrando `/api/auth/user`
   - Screenshot das variáveis de ambiente (OCULTE valores sensíveis)

2. **Teste localmente simulando produção:**
```bash
export NODE_ENV=production
export SESSION_SECRET=<seu_secret>
export DATABASE_URL=<sua_database_url>
npm run build
npm start
```

Se funcionar localmente mas não no Render, o problema é específico do ambiente Render.

## 🔐 Segurança

**NUNCA compartilhe publicamente:**
- SESSION_SECRET
- DATABASE_URL completa
- Senhas de usuários
- Cookies de sessão
- Hashes de senha

Sempre remova informações sensíveis de screenshots antes de compartilhar.

## 📚 Arquivos Relacionados

- `server/routes.ts` - Endpoint `/api/debug/health` e `/api/auth/user`
- `server/auth.ts` - Configuração de sessão e deserialização
- `client/src/hooks/useAuth.ts` - Hook de autenticação
- `client/src/components/app-sidebar.tsx` - Renderização do menu
- `client/src/components/auth-debug-panel.tsx` - Painel de debug visual
- `RENDER_DEPLOY.md` - Guia de deploy
- `RENDER_TROUBLESHOOTING.md` - Troubleshooting geral
