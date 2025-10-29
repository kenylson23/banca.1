# Correção: Botão de Configurações Desaparecendo no Render

## 🔍 Problema

O botão de "Configurações do Cardápio Digital" aparece e funciona perfeitamente no Replit, mas desaparece após o deploy no Render.

## 🎯 Causa Raiz

O botão de Configurações (`/settings`) só aparece para usuários com `role === 'admin'` ou `role === 'superadmin'`. Se o `user.role` não for carregado corretamente, o sistema usa o menu padrão (`kitchenMenuItems`) que NÃO inclui o botão de Configurações.

## 🔬 Diagnóstico

### Logs de Debug Adicionados

Foram adicionados logs específicos para diagnosticar o problema. 

**⚠️ IMPORTANTE**: Os logs só aparecem em ambiente de desenvolvimento por padrão.

Para habilitar logs de debug **temporariamente** no Render:
1. Vá em **Environment** no painel do Render
2. Adicione a variável: `VITE_DEBUG_AUTH=true`
3. Force um redeploy
4. **LEMBRE-SE DE REMOVER** após resolver o problema (por segurança)

Os logs disponíveis são:

#### 1. No Frontend - `useAuth()`:
```
[useAuth] User data: {...}
[useAuth] Is loading: false
[useAuth] Error: null
[useAuth] Is authenticated: true
```

#### 2. No Frontend - `AppSidebar`:
```
[AppSidebar] User object: {...}
[AppSidebar] User role: admin (ou undefined se houver problema)
[AppSidebar] Will use menu: adminMenuItems (ou kitchenMenuItems se houver problema)
```

#### 3. No Backend - `QueryClient`:
```
[QueryClient] Fetching URL: /api/auth/user
[QueryClient] Response status: 200 (ou 401 se não autenticado)
```

### Como Diagnosticar no Render

**Primeiro, habilite os logs de debug** (veja seção acima sobre `VITE_DEBUG_AUTH`)

Depois:
1. **Acesse sua aplicação no Render** via navegador
2. **Faça login** com credenciais de admin
3. **Abra DevTools** (pressione F12)
4. **Vá na aba Console**
5. **Analise os logs** procurando por:

#### ✅ Cenário Normal (Funcionando):
```
[QueryClient] Fetching URL: /api/auth/user
[QueryClient] Response status: 200
[useAuth] User data: { id: "...", role: "admin", ... }
[useAuth] Is authenticated: true
[AppSidebar] User role: admin
[AppSidebar] Will use menu: adminMenuItems
```
**Resultado**: Botão de Configurações aparece ✅

#### ❌ Cenário com Problema:
```
[QueryClient] Fetching URL: /api/auth/user
[QueryClient] Response status: 401
[useAuth] User data: undefined
[useAuth] Is authenticated: false
[AppSidebar] User role: undefined
[AppSidebar] Will use menu: kitchenMenuItems
```
**Resultado**: Botão de Configurações NÃO aparece ❌

## 🛠️ Soluções

### Problema 1: Response 401 - Não Autenticado

**Causa**: Sessão não está sendo mantida ou cookies não estão sendo enviados.

**Soluções**:

#### A. Verificar SESSION_SECRET no Render
1. Vá em **Environment** no painel do Render
2. Confirme que `SESSION_SECRET` está configurada
3. Se não estiver, gere uma:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Adicione como variável de ambiente
5. Force um redeploy

#### B. Limpar Cookies e Fazer Login Novamente
1. Abra DevTools (F12)
2. Vá em **Application** → **Cookies**
3. Delete todos os cookies do domínio `.onrender.com`
4. Recarregue a página
5. Faça login novamente

#### C. Verificar Logs do Servidor
1. No painel do Render, vá em **Logs**
2. Procure por erros de sessão:
   ```
   Error: SESSION_SECRET must be set
   Error creating session store
   ```
3. Se encontrar, corrija a variável de ambiente

### Problema 2: User data existe mas role é undefined

**Causa**: O banco de dados não tem o campo `role` populado ou houve erro na migração.

**Soluções**:

#### A. Verificar dados do usuário no banco
1. Conecte-se ao banco PostgreSQL do Render usando **External Database URL**
2. Execute:
   ```sql
   SELECT id, email, role, "restaurantId" FROM users WHERE email = 'seu-email@exemplo.com';
   ```
3. Verifique se o campo `role` está preenchido ('admin' ou 'superadmin')

#### B. Atualizar role do usuário manualmente (se necessário)
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';
```

### Problema 3: Response 200 mas user.role está undefined

**Causa**: O endpoint `/api/auth/user` não está retornando o campo `role`.

**Solução**:

#### Verificar resposta da API no Network
1. DevTools (F12) → aba **Network**
2. Faça login
3. Encontre a requisição `/api/auth/user`
4. Verifique a **Response**:
   ```json
   {
     "id": "...",
     "email": "...",
     "role": "admin",  ← Deve estar presente
     "restaurantId": "..."
   }
   ```
5. Se `role` não estiver presente, há problema no backend

### Problema 4: Tudo está correto mas botão não aparece

**Causa**: Cache do browser ou CDN.

**Soluções**:

#### A. Force Hard Refresh
- **Chrome/Edge**: Ctrl + Shift + R (Windows) ou Cmd + Shift + R (Mac)
- **Firefox**: Ctrl + F5
- **Safari**: Cmd + Option + R

#### B. Teste em modo anônimo
1. Abra uma janela anônima/privada
2. Acesse o Render
3. Faça login
4. Verifique se o botão aparece

#### C. Force um novo deploy no Render
1. No painel do Render, vá em **Manual Deploy**
2. Clique em **"Deploy latest commit"**
3. Aguarde conclusão do build
4. Teste novamente

## 📋 Checklist de Verificação

Antes de reportar que o problema persiste, verifique:

- [ ] `SESSION_SECRET` está configurada no Render
- [ ] `NODE_ENV=production` está configurada
- [ ] Banco de dados está **Available** (verde)
- [ ] Fez login com credenciais corretas (admin ou superadmin)
- [ ] Verificou logs do console do navegador
- [ ] Verificou que `/api/auth/user` retorna status 200
- [ ] Verificou que `user.role` está definido
- [ ] Limpou cookies do browser
- [ ] Testou em modo anônimo/privado
- [ ] Forçou hard refresh (Ctrl + Shift + R)

## 🔄 Fluxo de Funcionamento Correto

1. Usuário faz login → POST `/api/auth/login`
2. Backend cria sessão e define cookie
3. Frontend carrega → `useAuth()` busca `/api/auth/user`
4. Request inclui cookie de sessão (`credentials: "include"`)
5. Backend valida sessão e retorna user com `role`
6. `AppSidebar` recebe user.role
7. Se `role === 'admin'` → mostra `adminMenuItems` (inclui Configurações)
8. Se `role === 'superadmin'` → mostra `superAdminMenuItems` (inclui Configurações)
9. Se `role === 'kitchen'` ou undefined → mostra `kitchenMenuItems` (SEM Configurações)

## 🆘 Ainda com Problemas?

Se após seguir todos os passos o botão ainda não aparecer:

1. **Capture as evidências**:
   - Screenshot dos logs do Console mostrando `[AppSidebar] User role: ...`
   - Screenshot do Network tab mostrando response de `/api/auth/user`
   - Screenshot das variáveis de ambiente do Render (ocultando valores sensíveis)

2. **Verifique o Environment do Render**:
   - Certifique-se de que não há NENHUMA variável conflitante
   - Confirme que DATABASE_URL aponta para o banco correto

3. **Teste localmente primeiro**:
   ```bash
   # Simule ambiente de produção
   export NODE_ENV=production
   export SESSION_SECRET=<seu_secret>
   export DATABASE_URL=<sua_database_url>
   npm run build
   npm start
   ```
   - Se funcionar localmente mas não no Render, o problema é específico do ambiente Render

## 📚 Arquivos Envolvidos

- `client/src/hooks/useAuth.ts` - Hook que busca dados do usuário
- `client/src/components/app-sidebar.tsx` - Componente que renderiza o menu
- `client/src/lib/queryClient.ts` - Cliente HTTP com credentials
- `server/auth.ts` - Configuração de sessão e cookies
- `server/routes.ts` - Endpoint `/api/auth/user`

## 🔐 Segurança

**NUNCA compartilhe publicamente:**
- SESSION_SECRET
- DATABASE_URL completa
- Senhas de usuários
- Cookies de sessão

Sempre remova informações sensíveis de screenshots e logs antes de compartilhar.
