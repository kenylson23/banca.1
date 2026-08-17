-- Migration: Add Performance Indexes
-- Description: Add critical indexes to improve query performance
-- Impact: 10-100x faster queries on large tables
-- Date: 2024-12-22

-- ============================================================================
-- ORDERS (Pedidos)
-- Most queried table, needs indexes on common filters
-- ============================================================================

-- Index for filtering orders by restaurant and status (used in admin dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status 
ON orders(restaurant_id, status);

-- Index for table-based queries (used in PDV and table management)
CREATE INDEX IF NOT EXISTS idx_orders_table_id 
ON orders(table_id);

-- Index for date-based queries and reports (DESC for latest first)
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON orders(created_at DESC);

-- Index for order number lookups (track-order page)
CREATE INDEX IF NOT EXISTS idx_orders_order_number 
ON orders(order_number);

-- Index for guest-based queries (split bills, guest orders)
CREATE INDEX IF NOT EXISTS idx_orders_guest_id 
ON orders(guest_id);


-- ============================================================================
-- SUBSCRIPTIONS
-- Critical for middleware checkSubscriptionStatus
-- ============================================================================

-- Composite index for subscription checks (used in every authenticated request)
CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant_status 
ON subscriptions(restaurant_id, status);

-- Index for expiration checks (used in cron job)
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end 
ON subscriptions(current_period_end);

-- Index for plan-based queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id 
ON subscriptions(plan_id);


-- ============================================================================
-- MENU_ITEMS (Cardápio)
-- Frequently queried when displaying menus
-- ============================================================================

-- Composite index for available menu items by restaurant
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_available 
ON menu_items(restaurant_id, available);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_menu_items_category 
ON menu_items(category_id);

-- Index for branch-specific menus
CREATE INDEX IF NOT EXISTS idx_menu_items_branch 
ON menu_items(branch_id);


-- ============================================================================
-- TABLES (Mesas)
-- Used in PDV and table management
-- ============================================================================

-- Composite index for table status by restaurant
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_status 
ON tables(restaurant_id, status);

-- Index for branch-based queries
CREATE INDEX IF NOT EXISTS idx_tables_branch_id 
ON tables(branch_id);

-- Index for QR code lookups
CREATE INDEX IF NOT EXISTS idx_tables_qr_code 
ON tables(qr_code) WHERE qr_code IS NOT NULL;


-- ============================================================================
-- USERS
-- Used in authentication and user management
-- ============================================================================

-- Unique index for email (login)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- Composite index for restaurant users by role
CREATE INDEX IF NOT EXISTS idx_users_restaurant_role 
ON users(restaurant_id, role);


-- ============================================================================
-- FINANCIAL_TRANSACTIONS
-- Heavy queries for reports
-- ============================================================================

-- Composite index for transactions by restaurant and date (most common query)
CREATE INDEX IF NOT EXISTS idx_transactions_restaurant_date 
ON financial_transactions(restaurant_id, transaction_date DESC);

-- Index for category-based filtering
CREATE INDEX IF NOT EXISTS idx_transactions_category 
ON financial_transactions(category_id);

-- Index for transaction type filtering (income/expense)
CREATE INDEX IF NOT EXISTS idx_transactions_type 
ON financial_transactions(transaction_type);

-- Index for cash register queries
CREATE INDEX IF NOT EXISTS idx_transactions_cash_register 
ON financial_transactions(cash_register_id);


-- ============================================================================
-- CUSTOMERS (Clientes)
-- Used in loyalty programs and customer management
-- ============================================================================

-- Index for restaurant customers
CREATE INDEX IF NOT EXISTS idx_customers_restaurant 
ON customers(restaurant_id);

-- Index for phone lookup (used in PDV)
CREATE INDEX IF NOT EXISTS idx_customers_phone 
ON customers(phone) WHERE phone IS NOT NULL;

-- Index for email lookup
CREATE INDEX IF NOT EXISTS idx_customers_email 
ON customers(email) WHERE email IS NOT NULL;


-- ============================================================================
-- TABLE_GUESTS (Convidados/Divisão de conta)
-- Used frequently in bill splitting
-- ============================================================================

-- Index for table-based guest queries
CREATE INDEX IF NOT EXISTS idx_table_guests_table 
ON table_guests(table_id);

-- Index for order-based guest queries
CREATE INDEX IF NOT EXISTS idx_table_guests_order 
ON table_guests(order_id) WHERE order_id IS NOT NULL;


-- ============================================================================
-- ORDER_ITEMS (Itens do pedido)
-- Large table, needs indexes
-- ============================================================================

-- Index for order-based queries (most common)
CREATE INDEX IF NOT EXISTS idx_order_items_order 
ON order_items(order_id);

-- Index for menu item tracking
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item 
ON order_items(menu_item_id);


-- ============================================================================
-- COUPONS (Cupons de desconto)
-- Used in checkout
-- ============================================================================

-- Index for restaurant coupons
CREATE INDEX IF NOT EXISTS idx_coupons_restaurant 
ON coupons(restaurant_id);

-- Index for active coupons (valid_from and valid_until checks)
CREATE INDEX IF NOT EXISTS idx_coupons_validity 
ON coupons(valid_from, valid_until);

-- Index for coupon code lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code 
ON coupons(code);


-- ============================================================================
-- LOYALTY_POINTS (Pontos de fidelidade)
-- Queried frequently in PDV
-- ============================================================================

-- Composite index for customer points by restaurant
CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_restaurant 
ON loyalty_points(customer_id, restaurant_id);


-- ============================================================================
-- RESTAURANTS
-- Indexed for slug-based lookups (public menu)
-- ============================================================================

-- Index for slug lookups (public menu page)
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_slug 
ON restaurants(slug) WHERE slug IS NOT NULL;

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_restaurants_status 
ON restaurants(status);


-- ============================================================================
-- CASH_REGISTERS (Caixas)
-- Used in financial module
-- ============================================================================

-- Composite index for restaurant cash registers
CREATE INDEX IF NOT EXISTS idx_cash_registers_restaurant_status 
ON cash_registers(restaurant_id, status);


-- ============================================================================
-- INVENTORY_ITEMS (Estoque)
-- Used in inventory module
-- ============================================================================

-- Composite index for inventory by restaurant
CREATE INDEX IF NOT EXISTS idx_inventory_restaurant 
ON inventory_items(restaurant_id);

-- Index for branch-based inventory
CREATE INDEX IF NOT EXISTS idx_inventory_branch 
ON inventory_items(branch_id) WHERE branch_id IS NOT NULL;


-- ============================================================================
-- Analyze tables after index creation
-- This updates statistics for the query planner
-- ============================================================================

ANALYZE orders;
ANALYZE subscriptions;
ANALYZE menu_items;
ANALYZE tables;
ANALYZE users;
ANALYZE financial_transactions;
ANALYZE customers;
ANALYZE table_guests;
ANALYZE order_items;
ANALYZE coupons;
ANALYZE loyalty_points;
ANALYZE restaurants;
ANALYZE cash_registers;
ANALYZE inventory_items;

-- ============================================================================
-- End of migration
-- ============================================================================
