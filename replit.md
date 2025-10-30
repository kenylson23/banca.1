# Na Bancada - Sistema de Gestão de Restaurante

## Overview
"Na Bancada" is a comprehensive, multi-tenant restaurant management system designed to streamline operations from customer ordering to kitchen management. It features QR code-based table ordering, a real-time kitchen display system, a centralized administration panel, and robust management capabilities for multiple restaurants. The system aims to enhance efficiency, improve customer experience, and provide actionable insights for restaurant owners.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The system features a responsive design optimized for various devices (smartphones, tablets, desktops) with a mobile-first approach. It includes a dark/light mode toggle and utilizes a consistent design system with Teal as the primary color, Inter for UI typography, and JetBrains Mono for data. Spacing is based on a 4px system. Status colors are defined for order states: Amber (Pendente), Blue (Em Preparo), Green (Pronto), and Gray (Servido).

### Technical Implementations
The frontend is built with **React** and **TypeScript**, using **Wouter** for routing, **Tailwind CSS** with **Shadcn UI** components for styling, and **React Query** for server state management. Custom WebSocket hooks enable real-time communication.

The backend uses **Express** with **TypeScript**, featuring **Replit Auth** for OpenID Connect authentication, **PostgreSQL** with **Drizzle ORM** for database management, and **RESTful API** endpoints with **Zod** validation. WebSocket communication is handled at `/ws`, and QR codes are dynamically generated using the `qrcode` library.

### Feature Specifications
- **Multi-Tenancy:** Supports multiple restaurants with data isolation.
- **Super Admin:** Centralized dashboard for restaurant approval and management.
- **Table Management:** CRUD operations for tables, automatic unique QR code generation, and occupancy control. Tables are automatically marked as occupied upon order creation and freed when an order is served.
- **Menu Management:** Categorized menu items with prices and descriptions.
- **Real-time Communication:** WebSocket integration for instant updates between administration and kitchen panels.
- **Dashboard & Kitchen Panel:** Real-time statistics for admins (sales, orders, top dishes) and an order visualization panel for the kitchen with filters and alerts.
- **Authentication & Authorization:** Three access levels: `superadmin`, `admin`, and `kitchen`.

### System Design Choices
- **Database Schema:** Includes `restaurants`, `users`, `sessions`, `tables`, `categories`, `menu_items`, `orders`, and `order_items`. All restaurant-specific data is scoped by `restaurantId`.
- **Order Status Flow:** Pedido (Pendente) → Em Preparo → Pronto → Servido.
- **WebSocket Events:** Critical events like `table_created`, `table_deleted`, `table_freed`, `new_order`, and `order_status_updated` are broadcasted.
- **API Endpoints:** Comprehensive set of RESTful endpoints for authentication, table management, menu management, orders, statistics, and super admin functions.
- **Development Environment:** Uses automatic environment variables for `DATABASE_URL`, `SESSION_SECRET`, etc.
- **Diagnostic Tools:** Includes a `/api/debug/health` endpoint, a visual `AuthDebugPanel` component, detailed server logs, and a SQL script for manual user role repair, all designed for secure troubleshooting in production environments (especially Render).

## External Dependencies
- **PostgreSQL:** Primary database.
- **Replit Auth:** Used for OpenID Connect authentication.
- **QRCode.js:** Library for dynamic QR code generation.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **Shadcn UI:** Component library built on Tailwind CSS.
- **React Query:** For data fetching and state management.