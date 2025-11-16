# Na Bancada - Sistema de Gestão de Restaurante

## Overview
"Na Bancada" is a comprehensive, multi-tenant restaurant management system designed to streamline restaurant operations from customer ordering to kitchen management. It features QR code-based table ordering, a real-time kitchen display system, a centralized administration panel, and robust management capabilities for multiple restaurants. The system aims to enhance efficiency, improve customer experience, and provide actionable insights for restaurant owners, ultimately boosting business vision and market potential.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

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