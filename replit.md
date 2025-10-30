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

## Recent Improvements

### October 30, 2025 - Kitchen Sound Effects
- ✅ Implemented audio system using Web Audio API
  - Notification sound (two-tone chime) when new orders arrive in kitchen
  - Completion sound (ascending C-E-G chord) when orders are marked as "ready" or "served"
  - Shared AudioContext to prevent memory leaks
  - Context resumed from user gesture (mute button click) to comply with autoplay policy
- ✅ Mute/unmute button respects all sounds
  - Initializes AudioContext on first button click
  - Sounds work in real-time via WebSocket
  - Intuitive interface with volume icons

### October 30, 2025 - Reports Synchronization and Order Status Fixes
- ✅ Fixed queryClient to correctly convert query parameters to URLs
  - Reports now receive filters for date, status, and type correctly
  - URLs are built with proper query strings (e.g., ?startDate=2025-10-23&endDate=2025-10-30)
- ✅ Fixed order status updates for all order types (table, delivery, takeout)
  - Authorization check now works for orders without associated table
  - updatedAt field is automatically updated on all status changes
- ✅ Implemented automatic cache invalidation for reports
  - Reports are updated when new orders are created
  - Reports are updated when order statuses change
  - WebSocket notifies all pages in real-time
- ✅ Added status update buttons on reports page
  - Allows advancing status directly from order view
  - Intuitive interface showing next possible status
- ✅ Complete synchronization between orders, statuses, and reports
  - Data updated in real-time via WebSocket
  - Cache automatically invalidated to ensure consistency

### October 30, 2025 - Order Notes and Public Order Tracking
- ✅ Added order notes functionality
  - New `orderNotes` field in orders table for general order observations
  - Textarea input in customer menu cart for customers to add order instructions
  - Order notes displayed prominently in kitchen panel for staff visibility
  - Order notes shown in admin reports page for complete order information
  - CartContext updated to manage order notes state
- ✅ Implemented secure public order tracking system
  - New public page at `/r/:slug/rastrear` for customers to track orders outside restaurant
  - Restaurant-scoped order search by order ID, customer name, or phone number
  - Backend endpoint `/api/public/restaurants/:slug/orders/search` with proper multi-tenancy security
  - `searchOrders` method filters results by restaurantId to prevent cross-tenant data exposure
  - Comprehensive UX with loading states, error handling, and detailed order information display
  - Shows order status, items, quantities, prices, and customer notes
  - Real-time order status updates reflected in tracking page

### October 30, 2025 - Automatic Cache Busting System
- ✅ Implemented comprehensive cache busting to eliminate browser cache issues after deployments
  - Service Worker now uses dynamic versioning based on build timestamp
  - Automatic detection of new versions every 60 seconds
  - Elegant toast notification when updates are available (no more manual Ctrl+Shift+R)
  - HTTP headers prevent caching of sw.js and version.json
- ✅ Created deployment workflow scripts
  - `scripts/update-version.sh`: Injects unique version into Service Worker before build
  - `scripts/restore-version-placeholder.sh`: Restores placeholder after build for next deployment
  - Complete workflow: update-version.sh → npm run build → restore-version-placeholder.sh
- ✅ Enhanced user experience
  - Users automatically notified of updates with "Atualizar" button
  - Zero manual intervention needed - updates apply instantly
  - No more "old version" issues after Render deployments
- ✅ Documentation
  - Complete CACHE_BUSTING.md guide with workflow instructions
  - Render configuration examples for automated deployments
  - Troubleshooting section for common issues