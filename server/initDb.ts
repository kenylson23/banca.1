import { sql } from 'drizzle-orm';
import { db, initializeConnection } from './db';
import { hashPassword } from './auth';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureTablesExist() {
  if (isInitialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      await initializeConnection();
      console.log('Ensuring database tables exist...');
      
      // Create enums
      await db.execute(sql`DO $$ BEGIN CREATE TYPE restaurant_status AS ENUM ('pendente', 'ativo', 'suspenso'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'kitchen'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pendente', 'em_preparo', 'pronto', 'servido'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE order_type AS ENUM ('mesa', 'delivery', 'takeout', 'balcao', 'pdv'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('nao_pago', 'parcial', 'pago'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('dinheiro', 'multicaixa', 'transferencia', 'cartao'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE discount_type AS ENUM ('valor', 'percentual'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Create restaurants table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS restaurants (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(100) UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE, 
        phone VARCHAR(50), 
        address TEXT, 
        logo_url TEXT,
        business_hours TEXT,
        description TEXT,
        status restaurant_status NOT NULL DEFAULT 'pendente', 
        created_at TIMESTAMP DEFAULT NOW(), 
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Add new columns to existing restaurants table if they don't exist
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN slug VARCHAR(100) UNIQUE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN logo_url TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN business_hours TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN description TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create users table with restaurantId
      await db.execute(sql`CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE, 
        email VARCHAR(255) NOT NULL UNIQUE, 
        password VARCHAR(255) NOT NULL, 
        first_name VARCHAR(100), 
        last_name VARCHAR(100), 
        role user_role NOT NULL DEFAULT 'admin', 
        created_at TIMESTAMP DEFAULT NOW(), 
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Add restaurantId to existing users if column doesn't exist
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE users ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create branches table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS branches (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, 
        name VARCHAR(200) NOT NULL, 
        address TEXT, 
        phone VARCHAR(50), 
        is_active INTEGER NOT NULL DEFAULT 1, 
        is_main INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(), 
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Add active_branch_id to users
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE users ADD COLUMN active_branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create sessions table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY, 
        sess JSONB NOT NULL, 
        expire TIMESTAMP NOT NULL
      );`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);`);
      
      // Create tables with restaurantId
      await db.execute(sql`CREATE TABLE IF NOT EXISTS tables (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, 
        number INTEGER NOT NULL, 
        qr_code TEXT NOT NULL, 
        is_occupied INTEGER NOT NULL DEFAULT 0, 
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Add restaurantId to existing tables if column doesn't exist
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add branch_id to tables
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Drop the unique constraint on table number (since now it's unique per restaurant)
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_number_unique; 
      EXCEPTION WHEN undefined_object THEN null; END $$;`);
      
      // Drop old constraint if exists
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_restaurant_branch_number_unique; 
      EXCEPTION WHEN undefined_object THEN null; END $$;`);
      
      // Drop old index if exists
      await db.execute(sql`DROP INDEX IF EXISTS tables_restaurant_branch_number_idx;`);
      
      // Create unique index that handles NULL branch_id properly
      // Using COALESCE to treat NULL branch_id as empty string ensures uniqueness works correctly
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS tables_restaurant_branch_number_idx 
        ON tables (restaurant_id, COALESCE(branch_id, ''), number);`);
      
      // Create table_status enum if it doesn't exist
      await db.execute(sql`DO $$ BEGIN
        CREATE TYPE table_status AS ENUM ('livre', 'ocupada', 'em_andamento', 'aguardando_pagamento', 'encerrada');
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Add status column to tables
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN status table_status NOT NULL DEFAULT 'livre'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add current_session_id to tables
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN current_session_id VARCHAR; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add total_amount to tables
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add customer_name to tables
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN customer_name VARCHAR(200); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add customer_count to tables
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN customer_count INTEGER DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add last_activity to tables
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN last_activity TIMESTAMP; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add is_occupied back for compatibility
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN is_occupied INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add capacity to tables
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN capacity INTEGER; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add area to tables
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN area VARCHAR(100); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create shift_status enum if it doesn't exist
      await db.execute(sql`DO $$ BEGIN
        CREATE TYPE shift_status AS ENUM ('aberto', 'fechado');
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Create financial_shifts table (referenced by table_sessions)
      await db.execute(sql`CREATE TABLE IF NOT EXISTS financial_shifts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        operator_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status shift_status NOT NULL DEFAULT 'aberto',
        opening_balance DECIMAL(10, 2) DEFAULT 0,
        closing_balance DECIMAL(10, 2) DEFAULT 0,
        expected_balance DECIMAL(10, 2) DEFAULT 0,
        discrepancy DECIMAL(10, 2) DEFAULT 0,
        notes TEXT,
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP
      );`);
      
      // Create table_sessions table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS table_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id VARCHAR NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        customer_name VARCHAR(200),
        customer_count INTEGER,
        total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        status table_status NOT NULL DEFAULT 'ocupada',
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP,
        notes TEXT
      );`);
      
      // Add shift_id to table_sessions
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE table_sessions ADD COLUMN shift_id VARCHAR REFERENCES financial_shifts(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add operator_id to table_sessions
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE table_sessions ADD COLUMN operator_id VARCHAR REFERENCES users(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add session_totals to table_sessions
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE table_sessions ADD COLUMN session_totals JSONB; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add closing_snapshot to table_sessions
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE table_sessions ADD COLUMN closing_snapshot JSONB; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add closed_by_id to table_sessions
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE table_sessions ADD COLUMN closed_by_id VARCHAR REFERENCES users(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create table_payments table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS table_payments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id VARCHAR NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
        session_id VARCHAR REFERENCES table_sessions(id) ON DELETE CASCADE,
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Add operator_id to table_payments
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE table_payments ADD COLUMN operator_id VARCHAR REFERENCES users(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add payment_source to table_payments
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE table_payments ADD COLUMN payment_source VARCHAR(100); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add method_details to table_payments
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE table_payments ADD COLUMN method_details JSONB; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add reconciliation_batch_id to table_payments
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE table_payments ADD COLUMN reconciliation_batch_id VARCHAR(100); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create categories with restaurantId
      await db.execute(sql`CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, 
        name VARCHAR(100) NOT NULL, 
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Add restaurantId to existing categories if column doesn't exist
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE categories ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add branch_id to categories
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE categories ADD COLUMN branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add customization fields to categories
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE categories ADD COLUMN image_url TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE categories ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE categories ADD COLUMN is_visible INTEGER NOT NULL DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create menu_items with restaurantId
      await db.execute(sql`CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, 
        category_id VARCHAR NOT NULL REFERENCES categories(id) ON DELETE CASCADE, 
        name VARCHAR(200) NOT NULL, 
        description TEXT, 
        price DECIMAL(10, 2) NOT NULL, 
        image_url TEXT, 
        is_available INTEGER NOT NULL DEFAULT 1, 
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Add restaurantId to existing menu_items if column doesn't exist
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add branch_id to menu_items
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add customization fields to menu_items
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN is_visible INTEGER NOT NULL DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create orders table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        table_id VARCHAR REFERENCES tables(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        order_type order_type NOT NULL DEFAULT 'mesa',
        customer_name VARCHAR(200), 
        customer_phone VARCHAR(50),
        delivery_address TEXT,
        order_notes TEXT,
        status order_status NOT NULL DEFAULT 'pendente', 
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        paid_amount DECIMAL(10, 2) DEFAULT 0,
        is_synced INTEGER DEFAULT 1,
        created_by VARCHAR REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(), 
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Add missing columns to orders table (for existing installations)
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN order_type order_type NOT NULL DEFAULT 'mesa'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN delivery_address TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN order_notes TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ALTER COLUMN table_id DROP NOT NULL; 
      EXCEPTION WHEN others THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN payment_method payment_method; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN paid_amount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN is_synced INTEGER DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN created_by VARCHAR REFERENCES users(id); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add new checkout-related columns to orders table
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN order_title VARCHAR(200); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN discount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN discount_type discount_type DEFAULT 'valor'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN service_charge DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN payment_status payment_status NOT NULL DEFAULT 'nao_pago'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN change_amount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN service_name VARCHAR(200); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN packaging_fee DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN table_session_id VARCHAR REFERENCES table_sessions(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN refund_amount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN cancellation_reason TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN closed_by VARCHAR REFERENCES users(id); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create order_items table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        order_id VARCHAR NOT NULL REFERENCES orders(id) ON DELETE CASCADE, 
        menu_item_id VARCHAR NOT NULL REFERENCES menu_items(id), 
        quantity INTEGER NOT NULL, 
        price DECIMAL(10, 2) NOT NULL, 
        notes TEXT, 
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create option_group_type enum
      await db.execute(sql`DO $$ BEGIN CREATE TYPE option_group_type AS ENUM ('single', 'multiple'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Create option_groups table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS option_groups (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        menu_item_id VARCHAR NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        type option_group_type NOT NULL DEFAULT 'single',
        is_required INTEGER NOT NULL DEFAULT 0,
        min_selections INTEGER NOT NULL DEFAULT 0,
        max_selections INTEGER NOT NULL DEFAULT 1,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create options table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS options (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        option_group_id VARCHAR NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        price_adjustment DECIMAL(10, 2) NOT NULL DEFAULT 0,
        is_available INTEGER NOT NULL DEFAULT 1,
        is_recommended INTEGER NOT NULL DEFAULT 0,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Add is_recommended column if it doesn't exist
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE options ADD COLUMN is_recommended INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create order_item_options table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS order_item_options (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_item_id VARCHAR NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
        option_id VARCHAR NOT NULL REFERENCES options(id),
        option_name VARCHAR(200) NOT NULL,
        option_group_name VARCHAR(200) NOT NULL,
        price_adjustment DECIMAL(10, 2) NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create messages table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, 
        subject VARCHAR(255) NOT NULL, 
        content TEXT NOT NULL, 
        sent_by VARCHAR NOT NULL, 
        is_read INTEGER NOT NULL DEFAULT 0, 
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create menu_visits table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS menu_visits (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        visit_source VARCHAR(50) NOT NULL DEFAULT 'qr_code',
        ip_address VARCHAR(50),
        user_agent TEXT,
        referrer TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create customer_reviews table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS customer_reviews (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        order_id VARCHAR REFERENCES orders(id) ON DELETE SET NULL,
        customer_name VARCHAR(200),
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create financial module tables
      // Create transaction_type enum if it doesn't exist
      await db.execute(sql`DO $$ BEGIN
        CREATE TYPE transaction_type AS ENUM ('receita', 'despesa', 'ajuste');
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Add 'ajuste' to existing transaction_type enum if not present
      await db.execute(sql`DO $$ BEGIN
        ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'ajuste';
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Create transaction_origin enum if it doesn't exist
      await db.execute(sql`DO $$ BEGIN
        CREATE TYPE transaction_origin AS ENUM ('pdv', 'web', 'manual');
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Create cash_register_shift_status enum if it doesn't exist
      await db.execute(sql`DO $$ BEGIN
        CREATE TYPE cash_register_shift_status AS ENUM ('aberto', 'fechado');
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Create cash_registers table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS cash_registers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        current_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create financial_categories table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS financial_categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        type transaction_type NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        is_default INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create cash_register_shifts table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS cash_register_shifts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        cash_register_id VARCHAR NOT NULL REFERENCES cash_registers(id) ON DELETE RESTRICT,
        opened_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        closed_by_user_id VARCHAR REFERENCES users(id) ON DELETE RESTRICT,
        status cash_register_shift_status NOT NULL DEFAULT 'aberto',
        opening_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        closing_amount_expected DECIMAL(10, 2) DEFAULT 0.00,
        closing_amount_counted DECIMAL(10, 2) DEFAULT 0.00,
        difference DECIMAL(10, 2) DEFAULT 0.00,
        total_revenues DECIMAL(10, 2) DEFAULT 0.00,
        total_expenses DECIMAL(10, 2) DEFAULT 0.00,
        opened_at TIMESTAMP DEFAULT NOW(),
        closed_at TIMESTAMP,
        notes TEXT
      );`);
      
      // Create financial_transactions table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS financial_transactions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        cash_register_id VARCHAR REFERENCES cash_registers(id) ON DELETE RESTRICT,
        shift_id VARCHAR REFERENCES cash_register_shifts(id) ON DELETE RESTRICT,
        category_id VARCHAR NOT NULL REFERENCES financial_categories(id) ON DELETE RESTRICT,
        recorded_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        type transaction_type NOT NULL,
        origin transaction_origin NOT NULL DEFAULT 'manual',
        description VARCHAR(500),
        payment_method payment_method NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        reference_order_id VARCHAR REFERENCES orders(id) ON DELETE SET NULL,
        occurred_at TIMESTAMP NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Add missing columns to existing financial_transactions table
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN origin transaction_origin NOT NULL DEFAULT 'manual'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN description VARCHAR(500); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN reference_order_id VARCHAR REFERENCES orders(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE financial_transactions ALTER COLUMN cash_register_id DROP NOT NULL; 
      EXCEPTION WHEN others THEN null; END $$;`);
      
      // Create expenses table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        category_id VARCHAR NOT NULL REFERENCES financial_categories(id) ON DELETE RESTRICT,
        transaction_id VARCHAR REFERENCES financial_transactions(id) ON DELETE RESTRICT,
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method payment_method NOT NULL,
        occurred_at TIMESTAMP NOT NULL,
        recorded_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create stock_movement_type enum
      await db.execute(sql`DO $$ BEGIN 
        CREATE TYPE stock_movement_type AS ENUM ('entrada', 'saida', 'ajuste', 'transferencia'); 
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Create inventory_categories table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS inventory_categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create measurement_units table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS measurement_units (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        abbreviation VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create inventory_items table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS inventory_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        category_id VARCHAR REFERENCES inventory_categories(id) ON DELETE SET NULL,
        unit_id VARCHAR NOT NULL REFERENCES measurement_units(id) ON DELETE RESTRICT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        sku VARCHAR(100),
        cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        min_stock DECIMAL(10, 2) DEFAULT 0,
        max_stock DECIMAL(10, 2) DEFAULT 0,
        reorder_point DECIMAL(10, 2) DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create branch_stock table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS branch_stock (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        inventory_item_id VARCHAR NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
        quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create unique index on branch_stock to prevent duplicates
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS branch_stock_restaurant_branch_item_idx 
        ON branch_stock (restaurant_id, branch_id, inventory_item_id);`);
      
      // Create stock_movements table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS stock_movements (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        inventory_item_id VARCHAR NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
        movement_type stock_movement_type NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        previous_quantity DECIMAL(10, 2) NOT NULL,
        new_quantity DECIMAL(10, 2) NOT NULL,
        unit_cost DECIMAL(10, 2) DEFAULT 0,
        total_cost DECIMAL(10, 2) DEFAULT 0,
        reason TEXT,
        reference_id VARCHAR(100),
        from_branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL,
        to_branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL,
        recorded_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create initial super admin user if it doesn't exist
      const superAdminEmail = 'superadmin@nabancada.com';
      const checkSuperAdmin = await db.execute(sql`SELECT id FROM users WHERE email = ${superAdminEmail} AND role = 'superadmin'`);
      
      if (checkSuperAdmin.rows.length === 0) {
        console.log('Creating initial super admin user...');
        const defaultPassword = 'SuperAdmin123!';
        const hashedPassword = await hashPassword(defaultPassword);
        
        await db.execute(sql`
          INSERT INTO users (email, password, first_name, last_name, role, restaurant_id)
          VALUES (${superAdminEmail}, ${hashedPassword}, 'Super', 'Admin', 'superadmin', NULL)
        `);
        
        console.log('Super admin user created successfully!');
        console.log('Email: superadmin@nabancada.com');
        console.log('Password: SuperAdmin123!');
        console.log('IMPORTANT: Please change this password after first login!');
      }
      
      isInitialized = true;
      console.log('Database tables ensured successfully!');
    } catch (error) {
      console.error('Error ensuring tables exist:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}
