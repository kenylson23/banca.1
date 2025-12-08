# Na Bancada - Sistema de Gestão de Restaurante

## Overview
"Na Bancada" is a comprehensive, multi-tenant restaurant management system designed to streamline restaurant operations from customer ordering to kitchen management. It features QR code-based table ordering, a real-time kitchen display system, a centralized administration panel, and robust management capabilities for multiple restaurants. The system aims to enhance efficiency, improve customer experience, and provide actionable insights for restaurant owners, ultimately boosting business vision and market potential.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## Recent Changes

### Subscription & Billing System (November 2025)
Implementado sistema completo de subscrições e faturamento para o mercado angolano:

**Planos de Subscrição:**
- **Básico** (15.000 Kz/mês ou 18$ USD): 1 filial, 10 mesas, 50 itens, 500 pedidos/mês, 2 usuários, 14 dias trial
- **Profissional** (35.000 Kz/mês ou 42$ USD): 3 filiais, 30 mesas, 150 itens, 2.000 pedidos/mês, 5 usuários, 14 dias trial
- **Empresarial** (70.000 Kz/mês ou 84$ USD): 10 filiais, 100 mesas, ilimitado itens, 10.000 pedidos/mês, 15 usuários, 14 dias trial
- **Enterprise** (150.000 Kz/mês ou 180$ USD): ilimitado em todos os recursos, 30 dias trial

**Inicialização Automática:**
- Planos são automaticamente populados no banco de dados quando o servidor iniciar pela primeira vez
- Seed implementado em `server/initDb.ts` para garantir que planos estejam sempre disponíveis
- SuperAdmin pode visualizar e gerenciar subscrições, mas não pode criar/editar os planos pré-definidos

**Schema e Database:**
- Enums: `subscription_status`, `subscription_payment_status`, `billing_interval`
- Tabelas: `subscription_plans`, `subscriptions`, `subscription_payments`, `subscription_usage`
- Coluna `currency` para suporte a AOA (Kwanza) e USD
- Subscrição única por restaurante (constraint unique em `restaurant_id`)

**Backend (Routes & Storage):**
- `GET /api/subscription-plans`: Lista todos os planos disponíveis
- `GET /api/subscription`: Retorna subscrição atual do restaurante com plano associado
- `POST /api/subscription`: Cria nova subscrição (valida duplicatas, calcula períodos e trial)
- `PATCH /api/subscription`: Atualiza plano/intervalo (recalcula períodos, limpa trial, ativa subscrição)
- `DELETE /api/subscription`: Cancela subscrição (marca para cancelar ao fim do período)
- `GET /api/subscription/limits`: Verifica limites e uso atual (branches, tables, menuItems, users, ordersThisMonth)
- `GET /api/subscription/payments`: Histórico de pagamentos da subscrição

**Frontend:**
- Página completa de gerenciamento (`/subscription`) com overview, limites, pagamentos
- Componente `SubscriptionPlanSelector` para criar/mudar plano
- Visualização de uso com progress bars e badges de status
- Alertas de limite atingido
- Diálogo de confirmação para cancelamento
- Suporte a modo de comparação de planos
- Integração total com React Query para cache e invalidação

**Validações e Segurança:**
- Validação de subscrição duplicada (retorna 409 Conflict)
- Recálculo automático de períodos ao mudar plano/intervalo
- Limites ilimitados representados como 999999 no banco, exibidos como ∞ na UI
- Verificação de limites antes de criar recursos (branches, tables, etc)
- Apenas admin/superadmin podem criar/modificar subscrições

**Benefícios:**
- Monetização clara e transparente para o mercado angolano
- Gestão de limites automática por plano
- Trial period para novos clientes
- Flexibilidade de moeda (Kwanza e Dólar)
- Histórico completo de pagamentos
- Interface intuitiva para upgrade/downgrade

### Cancelled Orders Tracking System (November 2025)
Implementado sistema completo de rastreamento e relatórios para pedidos cancelados:

**Schema e Database:**
- Adicionado status 'cancelado' ao enum order_status
- Novos campos: `cancelledAt` (timestamp) e `cancelledBy` (referência ao usuário)
- Script de migração criado para atualizar pedidos existentes

**Backend (Storage & Routes):**
- Função `cancelOrder()` atualizada para registrar status 'cancelado', timestamp e operador
- Queries de relatórios refatoradas para **excluir pedidos cancelados dos KPIs de receita**
- Novas métricas dedicadas: `cancelledOrders` (contagem) e `cancelledRevenue` (receita perdida)
- Endpoints `/api/sales-stats`, `/api/orders/report` e `/api/products/report` retornam métricas de cancelamento

**Frontend:**
- `StatusBadge` e `Badge` component atualizados com variant 'cancelled' (estilo destructive/vermelho)
- Relatórios incluem mapeamento de cores e labels para status cancelado
- UI mostra pedidos cancelados com estilo apropriado e separados das métricas de sucesso

**Benefícios:**
- Pedidos cancelados não inflam receita ou estatísticas de vendas
- Visibilidade total de cancelamentos (quantidade e impacto financeiro)
- Rastreamento de quem cancelou e quando
- Relatórios precisos e auditáveis

### Enhanced Toast Notifications with Restaurant Branding (December 2025)
Implementado sistema de notificações melhorado com nome e logo do restaurante:

**Arquivos Criados/Modificados:**
- `client/src/hooks/useRestaurantBrand.ts`: Hook para buscar e fornecer dados de branding do restaurante
- `client/src/hooks/use-toast.ts`: Estendido para suportar `restaurantName` e `restaurantLogo`
- `client/src/components/ui/toaster.tsx`: Atualizado para exibir Avatar com logo e nome do restaurante

**Funcionalidades:**
- Toasts agora exibem o logo do restaurante (ou fallback com iniciais) ao lado da mensagem
- Nome do restaurante aparece acima do título do toast
- Hook `useRestaurantBrand` centraliza busca de dados de branding com cache eficiente
- Todas as notificações do `NotificationDropdown` agora incluem branding do restaurante
- Cache otimizado com `staleTime` e `gcTime` para evitar refetches desnecessários

**Componentes:**
- Avatar com `AvatarImage` para logo e `AvatarFallback` com iniciais ou ícone
- Layout flexível que se adapta à presença/ausência de branding
- Integração com `useRestaurantBrand` hook via ref para uso em callbacks

### Dashboard Modernization (November 2025)
Implementada modernização completa do dashboard com inspiração em dashboards SaaS modernos (estilo Nexus):

**Novos Componentes Criados:**
- **AnimatedCounter**: Contador com animação de números usando Framer Motion useMotionValue
- **MiniSparkline**: Gráficos sparkline SVG com gradientes e animações de linha
- **AdvancedKpiCard**: Cards KPI com sparklines, badges de comparação, animações de entrada e gradientes
- **AdvancedSalesChart**: Gráficos de área com gradientes, tooltips customizados e modo de comparação
- **SalesHeatmap**: Mapa de calor interativo de vendas por hora/dia com animações staggered
- **ActivityFeed**: Feed de atividades recentes com scroll, badges de status e timestamps
- **GoalsWidget**: Widget de metas com progress rings circulares SVG e animações de progresso
- **QuickActionsWidget**: Ações rápidas com ícones coloridos e navegação direta
- **AdvancedFilters**: Barra de filtros com pills, date picker, comparação e exportação
- **ShimmerSkeleton**: Loading states com efeito shimmer

**Melhorias no Dashboard:**
- Layout completamente redesenhado com grid responsivo
- Animações staggered de entrada para todos os componentes
- KPI cards com mini gráficos de tendência e comparações de período
- Heatmap de vendas mostrando padrões por hora do dia
- Widget de metas com visualização circular de progresso
- Filtros visuais modernos com suporte a comparação de períodos
- Feed de atividades em tempo real
- Ações rápidas para navegação eficiente
- Gradientes e micro-interações em toda a interface
- Loading states elegantes com animação shimmer
- Tooltips interativos e informativos
- Responsividade completa para mobile, tablet e desktop

## System Architecture

### UI/UX Decisions
The system features a responsive, mobile-first design with a dark/light mode toggle. It uses a consistent design system with Teal as the primary color, Inter for UI typography, and JetBrains Mono for data, with a 4px spacing system. Status colors are defined for order states: Amber (Pendente), Blue (Em Preparo), Green (Pronto), and Gray (Servido).

### Technical Implementations
The frontend uses **React**, **TypeScript**, **Wouter** for routing, **Tailwind CSS** with **Shadcn UI** components, and **React Query** for server state management. Custom WebSocket hooks enable real-time communication.

The backend is built with **Express** and **TypeScript**, leveraging **Replit Auth** for OpenID Connect, **PostgreSQL** with **Drizzle ORM**, and **RESTful API** endpoints with **Zod** validation. WebSocket communication is handled at `/ws`, and QR codes are dynamically generated.

### Feature Specifications
-   **Multi-Tenancy:** Supports multiple restaurants with data isolation.
-   **Subscription & Billing:** Tiered subscription plans (Básico, Profissional, Empresarial, Enterprise) with usage limits, trial periods, multi-currency support (AOA/USD), and automatic limit enforcement.
-   **Super Admin:** Centralized dashboard for restaurant approval and management.
-   **Table Management:** CRUD operations for tables, automatic QR code generation, and occupancy control.
-   **Menu Management:** Categorized menu items with prices, descriptions, and a configurable options system (size, add-ons, customizations) with min/max selection rules and price adjustments.
-   **Real-time Communication:** WebSocket integration for instant updates across administration, kitchen, and customer interfaces (e.g., order tracking).
-   **Dashboard & Kitchen Panel:** Real-time statistics for admins (sales, orders, top dishes) and an order visualization panel for the kitchen with filters and alerts, including audio notifications for new orders and status changes.
-   **Authentication & Authorization:** Three access levels: `superadmin`, `admin`, and `kitchen`.
-   **Public Order Tracking:** Secure public page for customers to track their orders.
-   **Order Notes:** Functionality for customers to add notes to their orders, displayed in the kitchen and admin panels.
-   **Automatic Cache Busting:** Comprehensive system using Service Workers for seamless updates and prevention of stale assets after deployments.

### System Design Choices
-   **Database Schema:** Includes `restaurants`, `users`, `sessions`, `tables`, `categories`, `menu_items`, `orders`, `order_items`, `option_groups`, `options`, `order_item_options`, `table_sessions`, `table_payments`, financial system tables (`financial_shifts`, `financial_events`, `order_adjustments`, `payment_events`, `report_aggregations`), and subscription system tables (`subscription_plans`, `subscriptions`, `subscription_payments`, `subscription_usage`), with all restaurant-specific data scoped by `restaurantId` and `branchId` where applicable.
-   **Multi-Filial (Branch) Strategy:**
    -   **Categorias e Itens do Menu:** Modelo compartilhado + específico. Itens com `branchId = null` são compartilhados entre todas as filiais. Itens com `branchId` específico são exclusivos daquela filial. Queries retornam compartilhados + específicos da filial ativa.
    -   **Mesas (Tables):** Modelo de override. Mesas específicas da filial sobrescrevem mesas compartilhadas com o mesmo número. Evita duplicação de números de mesa na mesma filial.
    -   **Isolamento de Dados:** Usuários com `activeBranchId` veem apenas dados da filial ativa + dados compartilhados. Mudança de filial altera escopo dos dados visíveis.
-   **Financial System:** Event-based immutable audit trail with 7-year retention. Tracks all financial operations (payments, cancellations, refunds, adjustments) by operator with shift management and end-of-day reconciliation. Complete branch scoping ensures data isolation between branches.
-   **Order Status Flow:** Pedido (Pendente) → Em Preparo → Pronto → Servido.
-   **WebSocket Events:** Critical events like `table_created`, `table_deleted`, `table_freed`, `new_order`, and `order_status_updated` are broadcasted.
-   **API Endpoints:** Comprehensive RESTful endpoints for all functionalities, including public endpoints for menu and order tracking with multi-tenancy security.
-   **Table Validation:** Multi-layered protection for table creation, including unique database indexing (per restaurant/branch) and application-level validation for positive, non-duplicate table numbers.
-   **Production Readiness:** All debugging elements removed, server-side logs limited to critical events, and `no-cache` headers implemented for public API routes to ensure fresh data.

## External Dependencies
-   **PostgreSQL:** Primary database.
-   **Replit Auth:** Used for OpenID Connect authentication.
-   **QRCode.js:** Library for dynamic QR code generation.
-   **Tailwind CSS:** Utility-first CSS framework.
-   **Shadcn UI:** Component library.
-   **React Query:** For data fetching and state management.