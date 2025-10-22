# Na Bancada - Sistema de Gestão de Restaurante

## Overview
Sistema completo de gestão de restaurante multi-tenant com QR Codes por mesa, painel administrativo, comunicação em tempo real com a cozinha e gerenciamento centralizado de múltiplos restaurantes.

## Características Principais
- **Multi-Tenancy:** Suporte para múltiplos restaurantes com isolamento de dados
- **Super Admin:** Sistema de aprovação de restaurantes com dashboard centralizado
- **Cadastro de Restaurantes:** Formulário público para novos restaurantes solicitarem acesso
- **Autenticação:** Sistema de autenticação com três níveis de acesso (superadmin, admin, kitchen)
- **Gestão de Mesas:** CRUD completo com geração automática de QR codes únicos e controle automático de estado
- **Controle de Ocupação:** Sistema automático que bloqueia mesas ocupadas até finalização do pedido
- **Gestão de Menu:** Categorias e pratos com preços e descrições
- **Dashboard Admin:** Estatísticas em tempo real (vendas, pedidos, pratos top)
- **Painel de Cozinha:** Visualização de pedidos com filtros e alertas sonoros/visuais
- **Tempo Real:** WebSocket para atualizações instantâneas entre admin e cozinha
- **Dark/Light Mode:** Suporte completo com tema personalizado
- **Responsividade Total:** Interface otimizada para smartphones, tablets e desktops (320px+)

## Arquitetura

### Frontend (React + TypeScript)
- **Framework:** React com Wouter para roteamento
- **Styling:** Tailwind CSS + Shadcn UI components
- **State:** React Query para server state
- **Theme:** Dark mode por padrão com toggle
- **Real-time:** WebSocket hook customizado

### Backend (Express + TypeScript)
- **Auth:** OpenID Connect via Replit Auth
- **Database:** PostgreSQL com Drizzle ORM
- **API:** RESTful endpoints com validação Zod
- **WebSocket:** Comunicação bidirecional em /ws
- **QR Codes:** Geração dinâmica com biblioteca qrcode

### Database Schema
- `restaurants` - Restaurantes cadastrados (multi-tenant)
- `users` - Usuários autenticados (com restaurantId para isolamento)
- `sessions` - Sessões de autenticação
- `tables` - Mesas do restaurante com QR codes (scoped por restaurantId)
- `categories` - Categorias do menu (scoped por restaurantId)
- `menu_items` - Pratos do menu (scoped por restaurantId)
- `orders` - Pedidos com status
- `order_items` - Itens dos pedidos

### Roles e Permissões
- **superadmin:** Acesso total à plataforma, gerencia restaurantes
- **admin:** Administrador de restaurante, gerencia menu, mesas e pedidos
- **kitchen:** Acesso apenas ao painel de cozinha

## Estrutura de Pastas

```
├── client/
│   └── src/
│       ├── components/   # Componentes reutilizáveis
│       ├── hooks/        # Custom hooks (useAuth, useWebSocket)
│       ├── lib/          # Utilitários (authUtils, queryClient)
│       └── pages/        # Páginas da aplicação
├── server/
│   ├── db.ts            # Configuração do banco
│   ├── storage.ts       # Camada de acesso a dados
│   ├── replitAuth.ts    # Configuração de autenticação
│   └── routes.ts        # Rotas da API + WebSocket
└── shared/
    └── schema.ts        # Schemas Drizzle + validação Zod
```

## Status dos Pedidos
1. **Pendente** - Pedido criado, aguardando preparo
2. **Em Preparo** - Cozinha está preparando
3. **Pronto** - Pedido finalizado, aguardando servir
4. **Servido** - Pedido entregue ao cliente

## WebSocket Events
- `table_created` - Nova mesa criada
- `table_deleted` - Mesa removida
- `table_freed` - Mesa liberada após pedido servido
- `new_order` - Novo pedido criado
- `order_status_updated` - Status do pedido alterado

## API Endpoints

### Auth
- `GET /api/auth/user` - Usuário atual (protected)
- `PATCH /api/auth/profile` - Atualizar perfil (email, nome) (protected)
- `PATCH /api/auth/password` - Alterar senha (protected)
- `GET /api/login` - Iniciar login
- `GET /api/logout` - Fazer logout

### Tables
- `GET /api/tables` - Listar mesas
- `POST /api/tables` - Criar mesa (gera QR code)
- `DELETE /api/tables/:id` - Excluir mesa

### Categories
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `DELETE /api/categories/:id` - Excluir categoria

### Menu Items
- `GET /api/menu-items` - Listar pratos
- `POST /api/menu-items` - Criar prato
- `PATCH /api/menu-items/:id` - Atualizar prato
- `DELETE /api/menu-items/:id` - Excluir prato

### Orders
- `GET /api/orders/kitchen` - Pedidos para cozinha
- `GET /api/orders/recent` - Pedidos recentes (últimos 10)
- `POST /api/orders` - Criar pedido
- `PATCH /api/orders/:id/status` - Atualizar status

### Stats
- `GET /api/stats/dashboard` - Estatísticas do dashboard

### Super Admin (Protected - superadmin only)
- `POST /api/restaurants/register` - Cadastro público de restaurante
- `GET /api/superadmin/restaurants` - Listar todos os restaurantes
- `PATCH /api/superadmin/restaurants/:id/status` - Atualizar status (pendente/ativo/suspenso)
- `DELETE /api/superadmin/restaurants/:id` - Excluir restaurante
- `GET /api/superadmin/stats` - Estatísticas da plataforma

## Ambiente de Desenvolvimento

### Variáveis de Ambiente (Automáticas)
- `DATABASE_URL` - Connection string PostgreSQL
- `SESSION_SECRET` - Secret para sessões
- `REPLIT_DOMAINS` - Domínios do Replit
- `REPL_ID` - ID da aplicação

### Scripts
- `npm run dev` - Iniciar desenvolvimento
- `npm run db:push` - Sincronizar schema com banco

### Credenciais Iniciais
**Super Admin (criado automaticamente):**
- Email: `superadmin@nabancada.com`
- Senha: `SuperAdmin123!`
- **IMPORTANTE:** Alterar senha após primeiro login!

## Design System
- **Primary Color:** Teal (34° 85% 47%)
- **Status Colors:**
  - Pendente: Amber (#fbbf24)
  - Em Preparo: Blue (#3b82f6)
  - Pronto: Green (#10b981)
  - Servido: Gray (#6b7280)
- **Typography:** Inter (UI), JetBrains Mono (dados)
- **Spacing:** Sistema 4px base (p-2, p-4, p-6, p-8)
- **Responsividade:** Mobile-first com breakpoints Tailwind (sm:640px, md:768px, lg:1024px, xl:1280px)

## Fluxo de Trabalho

### Cadastro de Novo Restaurante
1. Proprietário acessa página inicial
2. Clica na aba "Cadastrar Restaurante"
3. Preenche formulário (nome, email, telefone, endereço, senha)
4. Sistema cria restaurante com status "pendente"
5. Sistema cria usuário admin inicial para o restaurante
6. Aguarda aprovação do super administrador

### Aprovação de Restaurante (Super Admin)
1. Super admin faz login com credenciais especiais
2. Acessa dashboard de super admin em /superadmin
3. Visualiza restaurantes pendentes
4. Clica em "Aprovar" para ativar restaurante
5. Restaurante e admin podem fazer login e acessar sistema

### Criar Mesa
1. Admin acessa /mesas
2. Clica em "Nova Mesa"
3. Insere número da mesa
4. Sistema gera QR code automaticamente
5. Admin pode baixar o QR code

### Gerenciar Menu
1. Admin acessa /menu
2. Cria categorias (ex: "Entradas", "Pratos Principais")
3. Adiciona pratos em cada categoria
4. Define preços e descrições

### Fluxo de Pedido
1. Cliente escaneia QR code da mesa
2. Sistema verifica se mesa está disponível
3. Se mesa ocupada, exibe mensagem e bloqueia novos pedidos
4. Se disponível, cliente pode fazer pedido
5. Ao confirmar pedido, mesa é marcada como ocupada automaticamente
6. WebSocket notifica cozinha em tempo real
7. Cozinha vê pedido no painel com alerta sonoro
8. Cozinha atualiza status: Pendente → Em Preparo → Pronto → Servido
9. Quando marcado como "Servido", mesa é liberada automaticamente
10. Dashboard atualiza estatísticas em tempo real

## Funcionalidades Implementadas
- ✅ Interface de cliente para fazer pedidos via QR code (20/10/2025)
- ✅ Sistema automático de controle de ocupação de mesas (20/10/2025)
- ✅ Bloqueio de pedidos em mesas ocupadas (20/10/2025)
- ✅ Liberação automática ao finalizar pedido (20/10/2025)
- ✅ Página de perfil para alterar email, nome e senha (22/10/2025)
- ✅ Validação de senha atual antes de alteração (22/10/2025)
- ✅ Segurança: Schema separado para perfil (sem campo role) (22/10/2025)
- ✅ Sistema multi-tenant para múltiplos restaurantes (22/10/2025)
- ✅ Formulário público de cadastro de restaurantes (22/10/2025)
- ✅ Dashboard de super admin com aprovação de restaurantes (22/10/2025)
- ✅ Estatísticas da plataforma (total, ativos, pendentes, suspensos) (22/10/2025)
- ✅ Controle de acesso baseado em roles (superadmin, admin, kitchen) (22/10/2025)
- ✅ Responsividade mobile/tablet em todas as páginas (22/10/2025)
  - Títulos, espaçamentos e grids adaptáveis
  - Headers responsivos com flex-wrap
  - Padding otimizado para telas pequenas (320px+)
  - Botões e controles com tamanhos adequados para toque
  - Experiência de pedido otimizada para clientes em smartphones

## Próximas Fases
- Testes automatizados para super admin endpoints
- Telemetria e logging de mudanças de status de restaurantes
- Rotação de credenciais do super admin em produção
- Impressão automática de pedidos
- Histórico completo de pedidos com filtros avançados
- Relatórios detalhados de vendas e performance por restaurante
- Gestão de funcionários com permissões customizadas
- Notificações push para garçons
- Sistema de gorjetas e pagamento integrado
- Planos e cobrança para restaurantes

## Data Criação
20/10/2025

## Tecnologias
React, TypeScript, Express, PostgreSQL, Drizzle ORM, Tailwind CSS, Shadcn UI, WebSockets, QRCode.js, Replit Auth
