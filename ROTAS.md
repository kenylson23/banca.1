# Documentação de Rotas - Na Bancada

## Rotas do Frontend (Wouter)

### Rotas Públicas (Não Autenticadas)
- `/` - Landing page com informações do sistema
- `/login` - Página de login e cadastro de restaurantes
- `/mesa/:tableNumber` - Menu do cliente (acesso via QR code)

### Rotas Protegidas (Autenticadas)

#### Admin (role: 'admin')
- `/dashboard` - Dashboard principal com estatísticas
- `/tables` - Gerenciamento de mesas e QR codes
- `/menu` - Gerenciamento do cardápio
- `/kitchen` - Painel da cozinha (compartilhado com kitchen role)
- `/users` - Gerenciamento de usuários do restaurante
- `/profile` - Perfil do usuário

#### Kitchen (role: 'kitchen')
- `/kitchen` - Painel da cozinha
- `/profile` - Perfil do usuário

#### Super Admin (role: 'superadmin')
- `/superadmin` - Painel de administração global
- `/profile` - Perfil do usuário

### Redirecionamentos Automáticos

Após login, o usuário é redirecionado automaticamente para:
- `superadmin` role → `/superadmin`
- `kitchen` role → `/kitchen`
- `admin` role → `/dashboard`

## Rotas da API (Express)

### Rotas Públicas (Sem Autenticação)

#### Cadastro e Autenticação
- `POST /api/restaurants/register` - Cadastro de novo restaurante
- `POST /api/auth/login` - Login de usuário

#### Rotas Públicas para Clientes (QR Code)
- `GET /api/public/restaurants/:restaurantId` - Detalhes do restaurante
- `GET /api/public/tables/:number` - Busca mesa por número
- `GET /api/public/menu-items/:restaurantId` - Lista itens do menu disponíveis
- `GET /api/public/orders/table/:tableId` - Lista pedidos de uma mesa
- `POST /api/public/orders` - Cria novo pedido (cliente)

### Rotas Autenticadas

#### Auth
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Dados do usuário atual
- `PATCH /api/auth/profile` - Atualiza perfil
- `PATCH /api/auth/password` - Atualiza senha

### Rotas Admin (isAdmin)

#### Mensagens
- `GET /api/messages` - Lista mensagens do restaurante
- `PATCH /api/messages/:id/read` - Marca mensagem como lida

#### Usuários
- `GET /api/users` - Lista usuários do restaurante
- `POST /api/users` - Cria novo usuário
- `DELETE /api/users/:id` - Remove usuário
- `PATCH /api/users/:id` - Atualiza usuário

#### Mesas
- `GET /api/tables` - Lista mesas do restaurante
- `POST /api/tables` - Cria nova mesa
- `DELETE /api/tables/:id` - Remove mesa

#### Categorias
- `GET /api/categories` - Lista categorias
- `POST /api/categories` - Cria categoria
- `DELETE /api/categories/:id` - Remove categoria

#### Menu
- `GET /api/menu-items` - Lista itens do menu
- `POST /api/menu-items` - Cria item
- `PATCH /api/menu-items/:id` - Atualiza item
- `DELETE /api/menu-items/:id` - Remove item

#### Pedidos
- `GET /api/orders/recent` - Lista pedidos recentes
- `POST /api/orders` - Cria pedido (admin)

#### Estatísticas
- `GET /api/stats/dashboard` - Estatísticas do dashboard

### Rotas Autenticadas (isAuthenticated)

#### Cozinha
- `GET /api/orders/kitchen` - Lista todos os pedidos (cozinha)
- `PATCH /api/orders/:id/status` - Atualiza status do pedido
- `GET /api/stats/kitchen` - Estatísticas da cozinha

### Rotas Super Admin (isSuperAdmin)

#### Restaurantes
- `GET /api/superadmin/restaurants` - Lista todos os restaurantes
- `PATCH /api/superadmin/restaurants/:id/status` - Atualiza status do restaurante
- `DELETE /api/superadmin/restaurants/:id` - Remove restaurante

#### Estatísticas
- `GET /api/superadmin/stats` - Estatísticas globais

#### Mensagens
- `GET /api/superadmin/messages` - Lista todas as mensagens
- `POST /api/superadmin/messages` - Envia mensagem para restaurante

## Fluxos de Navegação

### 1. Fluxo do Cliente (QR Code)
```
1. Cliente escaneia QR Code → /mesa/:tableNumber
2. Sistema busca mesa: GET /api/public/tables/:number
3. Sistema busca restaurante: GET /api/public/restaurants/:restaurantId
4. Sistema busca menu: GET /api/public/menu-items/:restaurantId
5. Cliente faz pedido: POST /api/public/orders
6. Sistema atualiza pedidos: GET /api/public/orders/table/:tableId
```

### 2. Fluxo de Login (Admin/Kitchen)
```
1. Usuário acessa / → Landing page
2. Clica em "Acessar Sistema" → /login
3. Faz login → POST /api/auth/login
4. Sistema verifica role e redireciona:
   - admin → /dashboard
   - kitchen → /kitchen
   - superadmin → /superadmin
```

### 3. Fluxo de Cadastro (Restaurante)
```
1. Usuário acessa /login
2. Clica em aba "Cadastrar"
3. Preenche formulário → POST /api/restaurants/register
4. Aguarda aprovação do superadmin
5. Superadmin aprova → PATCH /api/superadmin/restaurants/:id/status
6. Usuário pode fazer login
```

### 4. Fluxo da Cozinha
```
1. Usuário kitchen faz login → /kitchen
2. Sistema carrega pedidos: GET /api/orders/kitchen
3. Cozinha atualiza status: PATCH /api/orders/:id/status
4. WebSocket notifica cliente sobre atualização
```

## Proteção de Rotas

### Frontend (Route Guards)
Todas as rotas autenticadas verificam:
1. Se o usuário está autenticado
2. Se o role do usuário tem permissão para acessar a rota
3. Redireciona para `/login` se não autenticado
4. Redireciona para `/` se não tem permissão

### Backend (Middlewares)
- `isAuthenticated` - Verifica se está logado
- `isAdmin` - Verifica se é admin ou superadmin
- `isSuperAdmin` - Verifica se é superadmin

## Notas Técnicas

### Multi-tenancy
- Todas as rotas admin são filtradas por `restaurantId` do usuário
- Super admin pode ver/gerenciar todos os restaurantes
- Rotas públicas usam `tableNumber` para identificar contexto

### WebSockets
O sistema usa WebSockets para atualizações em tempo real:
- Novos pedidos
- Atualizações de status
- Comunicação cozinha ↔ cliente

### Refresh de Página
Com as rotas reais implementadas:
- ✅ Refresh mantém a página atual
- ✅ Deep linking funciona (compartilhar URLs)
- ✅ Histórico do navegador funciona (botão voltar)
- ✅ Proteção de rotas no nível de URL
