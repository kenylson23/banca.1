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
-   **Database Schema:** Includes `restaurants`, `users`, `sessions`, `tables`, `categories`, `menu_items`, `orders`, `order_items`, `option_groups`, `options`, `order_item_options`, `table_sessions`, `table_payments`, and financial system tables (`financial_shifts`, `financial_events`, `order_adjustments`, `payment_events`, `report_aggregations`), with all restaurant-specific data scoped by `restaurantId` and `branchId` where applicable.
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