# Na Bancada - Sistema de Gestão de Restaurante

## Overview
Sistema completo de gestão de restaurante com QR Codes por mesa, painel administrativo e comunicação em tempo real com a cozinha.

## Características Principais
- **Autenticação:** Replit Auth com suporte a Google, GitHub, email/password
- **Gestão de Mesas:** CRUD completo com geração automática de QR codes únicos
- **Gestão de Menu:** Categorias e pratos com preços e descrições
- **Dashboard Admin:** Estatísticas em tempo real (vendas, pedidos, pratos top)
- **Painel de Cozinha:** Visualização de pedidos com filtros e alertas sonoros/visuais
- **Tempo Real:** WebSocket para atualizações instantâneas entre admin e cozinha
- **Dark/Light Mode:** Suporte completo com tema personalizado

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
- `users` - Usuários autenticados
- `sessions` - Sessões (required para Replit Auth)
- `tables` - Mesas do restaurante com QR codes
- `categories` - Categorias do menu
- `menu_items` - Pratos do menu
- `orders` - Pedidos com status
- `order_items` - Itens dos pedidos

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
- `new_order` - Novo pedido criado
- `order_status_updated` - Status do pedido alterado

## API Endpoints

### Auth
- `GET /api/auth/user` - Usuário atual (protected)
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

## Ambiente de Desenvolvimento

### Variáveis de Ambiente (Automáticas)
- `DATABASE_URL` - Connection string PostgreSQL
- `SESSION_SECRET` - Secret para sessões
- `REPLIT_DOMAINS` - Domínios do Replit
- `REPL_ID` - ID da aplicação

### Scripts
- `npm run dev` - Iniciar desenvolvimento
- `npm run db:push` - Sincronizar schema com banco

## Design System
- **Primary Color:** Teal (34° 85% 47%)
- **Status Colors:**
  - Pendente: Amber (#fbbf24)
  - Em Preparo: Blue (#3b82f6)
  - Pronto: Green (#10b981)
  - Servido: Gray (#6b7280)
- **Typography:** Inter (UI), JetBrains Mono (dados)
- **Spacing:** Sistema 4px base (p-2, p-4, p-6, p-8)

## Fluxo de Trabalho

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
1. Cliente escaneia QR code da mesa (feature futura)
2. Pedido criado via POST /api/orders
3. WebSocket notifica cozinha em tempo real
4. Cozinha vê pedido no painel com alerta sonoro
5. Cozinha atualiza status: Pendente → Em Preparo → Pronto → Servido
6. Dashboard atualiza estatísticas automaticamente

## Próximas Fases
- Interface de cliente para fazer pedidos via QR code
- Impressão automática de pedidos
- Histórico completo de pedidos com filtros
- Relatórios avançados de vendas
- Gestão de funcionários com permissões
- Notificações push para garçons

## Data Criação
20/10/2025

## Tecnologias
React, TypeScript, Express, PostgreSQL, Drizzle ORM, Tailwind CSS, Shadcn UI, WebSockets, QRCode.js, Replit Auth
