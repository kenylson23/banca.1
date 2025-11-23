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
      await db.execute(sql`DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pendente', 'em_preparo', 'pronto', 'servido', 'cancelado'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE order_type AS ENUM ('mesa', 'delivery', 'takeout', 'balcao', 'pdv'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('nao_pago', 'parcial', 'pago'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('dinheiro', 'multicaixa', 'transferencia', 'cartao'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE discount_type AS ENUM ('valor', 'percentual'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Add 'cancelado' to existing order_status enum if it doesn't exist
      await db.execute(sql`DO $$ BEGIN
        ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cancelado';
      EXCEPTION WHEN others THEN null; END $$;`);
      
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
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN primary_color VARCHAR(7) DEFAULT '#EA580C'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#DC2626'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN accent_color VARCHAR(7) DEFAULT '#0891B2'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN hero_image_url TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN whatsapp_number VARCHAR(50); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN is_open INTEGER NOT NULL DEFAULT 1; 
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
      
      // Add profile_image_url to users
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500); 
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
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN original_price DECIMAL(10, 2); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add smart badges and filtering fields to menu_items
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN is_new INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN tags TEXT[]; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN preparation_time INTEGER; 
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
        ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMP; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN cancelled_by VARCHAR REFERENCES users(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN closed_by VARCHAR REFERENCES users(id); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create customer_tier enum if it doesn't exist
      await db.execute(sql`DO $$ BEGIN CREATE TYPE customer_tier AS ENUM ('bronze', 'prata', 'ouro', 'platina'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Create customers table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL,
        name VARCHAR(200) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        cpf VARCHAR(14),
        birth_date TIMESTAMP,
        address TEXT,
        loyalty_points INTEGER NOT NULL DEFAULT 0,
        tier customer_tier DEFAULT 'bronze',
        total_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
        visit_count INTEGER NOT NULL DEFAULT 0,
        last_visit TIMESTAMP,
        notes TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create loyalty_transaction_type enum if it doesn't exist
      await db.execute(sql`DO $$ BEGIN CREATE TYPE loyalty_transaction_type AS ENUM ('ganho', 'resgate', 'expiracao', 'ajuste', 'bonus'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Add customer_id to orders
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN customer_id VARCHAR REFERENCES customers(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create coupons table (must exist before adding foreign key to orders)
      await db.execute(sql`CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL,
        code VARCHAR(50) NOT NULL,
        description TEXT,
        discount_type discount_type NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        min_order_value DECIMAL(10, 2) DEFAULT 0,
        max_discount DECIMAL(10, 2),
        valid_from TIMESTAMP NOT NULL,
        valid_until TIMESTAMP NOT NULL,
        max_uses INTEGER,
        max_uses_per_customer INTEGER DEFAULT 1,
        current_uses INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        applicable_order_types TEXT[],
        created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Migrate old coupon table structure to new schema
      // Check if old columns exist before renaming
      const hasTimesUsed = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'times_used'
      `);
      
      if (hasTimesUsed.rows.length > 0) {
        await db.execute(sql`ALTER TABLE coupons RENAME COLUMN times_used TO current_uses;`);
      }
      
      const hasUsageLimit = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'usage_limit'
      `);
      
      if (hasUsageLimit.rows.length > 0) {
        await db.execute(sql`ALTER TABLE coupons RENAME COLUMN usage_limit TO max_uses;`);
      }
      
      // Add missing columns only if they don't exist
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE coupons ADD COLUMN max_uses_per_customer INTEGER DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Only add current_uses if it doesn't exist (it might exist from rename)
      const hasCurrentUses = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'current_uses'
      `);
      
      if (hasCurrentUses.rows.length === 0) {
        await db.execute(sql`ALTER TABLE coupons ADD COLUMN current_uses INTEGER NOT NULL DEFAULT 0;`);
      }
      
      // Add coupon_id to orders (now that coupons table exists)
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN coupon_id VARCHAR REFERENCES coupons(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Add loyalty fields to orders
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN coupon_discount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN loyalty_points_earned INTEGER DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN loyalty_points_redeemed INTEGER DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN loyalty_discount_amount DECIMAL(10, 2) DEFAULT 0; 
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
      
      // Add installment-related columns to financial_transactions
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN total_installments INTEGER DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN installment_number INTEGER DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN parent_transaction_id VARCHAR REFERENCES financial_transactions(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
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
      
      // Create recipe_ingredients table - Liga itens do menu com ingredientes do inventário
      await db.execute(sql`CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        menu_item_id VARCHAR NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        inventory_item_id VARCHAR NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
        quantity DECIMAL(10, 3) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create unique index on recipe_ingredients to prevent duplicates
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS recipe_ingredients_menu_inventory_idx 
        ON recipe_ingredients (menu_item_id, inventory_item_id);`);
      
      // ===== CUSTOMER MANAGEMENT TABLES =====
      
      // Create customer_tier enum
      await db.execute(sql`DO $$ BEGIN 
        CREATE TYPE customer_tier AS ENUM ('bronze', 'prata', 'ouro', 'platina'); 
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Create loyalty_transaction_type enum
      await db.execute(sql`DO $$ BEGIN 
        CREATE TYPE loyalty_transaction_type AS ENUM ('ganho', 'resgate', 'expiracao', 'ajuste', 'bonus'); 
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Create customers table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL,
        name VARCHAR(200) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        cpf VARCHAR(14),
        birth_date TIMESTAMP,
        address TEXT,
        loyalty_points INTEGER NOT NULL DEFAULT 0,
        tier customer_tier DEFAULT 'bronze',
        total_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
        visit_count INTEGER NOT NULL DEFAULT 0,
        last_visit TIMESTAMP,
        notes TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create index on customer phone for faster lookup
      await db.execute(sql`CREATE INDEX IF NOT EXISTS customers_phone_idx ON customers (restaurant_id, phone);`);
      
      // Create loyalty_programs table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS loyalty_programs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        is_active INTEGER NOT NULL DEFAULT 1,
        points_per_currency DECIMAL(10, 2) NOT NULL DEFAULT 1,
        currency_per_point DECIMAL(10, 2) NOT NULL DEFAULT 0.10,
        min_points_to_redeem INTEGER NOT NULL DEFAULT 100,
        max_points_per_order INTEGER,
        points_expiration_days INTEGER,
        birthday_bonus_points INTEGER DEFAULT 0,
        bronze_tier_min_spent DECIMAL(10, 2) DEFAULT 0,
        silver_tier_min_spent DECIMAL(10, 2) DEFAULT 5000,
        gold_tier_min_spent DECIMAL(10, 2) DEFAULT 15000,
        platinum_tier_min_spent DECIMAL(10, 2) DEFAULT 50000,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create loyalty_transactions table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS loyalty_transactions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        customer_id VARCHAR NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        order_id VARCHAR REFERENCES orders(id) ON DELETE SET NULL,
        type loyalty_transaction_type NOT NULL,
        points INTEGER NOT NULL,
        description VARCHAR(500),
        expires_at TIMESTAMP,
        created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create index on loyalty_transactions for faster queries
      await db.execute(sql`CREATE INDEX IF NOT EXISTS loyalty_transactions_customer_idx ON loyalty_transactions (customer_id, created_at DESC);`);
      
      // Additional coupon-related migrations are done earlier in the file (after creating the coupons table)
      
      // Add additional columns to coupons if they don't exist
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE coupons ADD COLUMN applicable_order_types TEXT[]; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE coupons ADD COLUMN created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Check for NULL values in critical fields
      const nullValidFrom = await db.execute(sql`
        SELECT COUNT(*) as count FROM coupons WHERE valid_from IS NULL
      `);
      const nullValidUntil = await db.execute(sql`
        SELECT COUNT(*) as count FROM coupons WHERE valid_until IS NULL
      `);
      
      const nullFromCount = Number(nullValidFrom.rows[0]?.count ?? 0);
      const nullUntilCount = Number(nullValidUntil.rows[0]?.count ?? 0);
      
      // Only backfill if there are NULL values (should not happen in production)
      if (nullFromCount > 0) {
        console.warn(`Warning: Found ${nullFromCount} coupons with NULL valid_from, setting to current time`);
        await db.execute(sql`UPDATE coupons SET valid_from = NOW() WHERE valid_from IS NULL;`);
      }
      
      if (nullUntilCount > 0) {
        console.warn(`Warning: Found ${nullUntilCount} coupons with NULL valid_until, setting to 30 days from now`);
        await db.execute(sql`UPDATE coupons SET valid_until = NOW() + INTERVAL '30 days' WHERE valid_until IS NULL;`);
      }
      
      // Ensure valid_from and valid_until are NOT NULL after backfill
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE coupons ALTER COLUMN valid_from SET NOT NULL; 
      EXCEPTION WHEN others THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE coupons ALTER COLUMN valid_until SET NOT NULL; 
      EXCEPTION WHEN others THEN null; END $$;`);
      
      // Create unique index on coupon code per restaurant
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS coupons_restaurant_code_idx ON coupons (restaurant_id, code);`);
      
      // Create coupon_usages table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS coupon_usages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        coupon_id VARCHAR NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        customer_id VARCHAR REFERENCES customers(id) ON DELETE SET NULL,
        order_id VARCHAR REFERENCES orders(id) ON DELETE SET NULL,
        discount_applied DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create index on coupon_usages for usage tracking
      await db.execute(sql`CREATE INDEX IF NOT EXISTS coupon_usages_coupon_idx ON coupon_usages (coupon_id);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS coupon_usages_customer_idx ON coupon_usages (customer_id);`);
      
      // Create subscription enums
      await db.execute(sql`DO $$ BEGIN CREATE TYPE subscription_status AS ENUM ('trial', 'ativa', 'cancelada', 'suspensa', 'expirada'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE subscription_payment_status AS ENUM ('pendente', 'pago', 'falhado', 'cancelado'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE billing_interval AS ENUM ('mensal', 'anual'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
      // Create subscription_plans table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS subscription_plans (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        price_monthly_kz DECIMAL(10, 2) NOT NULL DEFAULT 0,
        price_annual_kz DECIMAL(10, 2) NOT NULL DEFAULT 0,
        price_monthly_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
        price_annual_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
        trial_days INTEGER NOT NULL DEFAULT 0,
        max_branches INTEGER NOT NULL DEFAULT 1,
        max_tables INTEGER NOT NULL DEFAULT 10,
        max_menu_items INTEGER NOT NULL DEFAULT 50,
        max_orders_per_month INTEGER NOT NULL DEFAULT 1000,
        max_users INTEGER NOT NULL DEFAULT 2,
        history_retention_days INTEGER NOT NULL DEFAULT 30,
        features JSONB,
        is_active INTEGER NOT NULL DEFAULT 1,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create subscriptions table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
        plan_id VARCHAR NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
        status subscription_status NOT NULL DEFAULT 'trial',
        billing_interval billing_interval NOT NULL DEFAULT 'mensal',
        currency VARCHAR(3) NOT NULL DEFAULT 'AOA',
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        current_period_start TIMESTAMP NOT NULL,
        current_period_end TIMESTAMP NOT NULL,
        trial_start TIMESTAMP,
        trial_end TIMESTAMP,
        canceled_at TIMESTAMP,
        cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
        auto_renew INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Add currency column if it doesn't exist (migration for existing databases)
      await db.execute(sql`DO $$ BEGIN 
        ALTER TABLE subscriptions ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'AOA'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      
      // Create subscription_payments table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS subscription_payments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_id VARCHAR NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'KZ',
        status subscription_payment_status NOT NULL DEFAULT 'pendente',
        payment_method VARCHAR(100),
        stripe_payment_intent_id VARCHAR(255),
        stripe_invoice_id VARCHAR(255),
        reference_number VARCHAR(100),
        notes TEXT,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      
      // Create subscription_usage table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS subscription_usage (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
        subscription_id VARCHAR NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
        current_branches INTEGER NOT NULL DEFAULT 0,
        current_tables INTEGER NOT NULL DEFAULT 0,
        current_menu_items INTEGER NOT NULL DEFAULT 0,
        current_users INTEGER NOT NULL DEFAULT 0,
        orders_this_month INTEGER NOT NULL DEFAULT 0,
        last_calculated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
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
      
      // Seed subscription plans if they don't exist
      const checkPlans = await db.execute(sql`SELECT COUNT(*) as count FROM subscription_plans`);
      const planCount = parseInt((checkPlans.rows[0] as any).count);
      
      if (planCount === 0) {
        console.log('Seeding subscription plans...');
        
        const plans = [
          {
            name: 'Básico',
            slug: 'basico',
            description: 'Ideal para pequenos restaurantes, lanchonetes e food trucks. Inclui funcionalidades essenciais para começar.',
            priceMonthlyKz: '15000.00',
            priceAnnualKz: '144000.00',
            priceMonthlyUsd: '18.00',
            priceAnnualUsd: '172.80',
            trialDays: 14,
            maxBranches: 1,
            maxTables: 10,
            maxMenuItems: 50,
            maxOrdersPerMonth: 500,
            maxUsers: 2,
            historyRetentionDays: 30,
            features: JSON.stringify([
              'pdv', 'gestao_mesas', 'menu_digital', 'qr_code',
              'cozinha_tempo_real', 'relatorios_basicos',
              'impressao_recibos', 'suporte_email'
            ]),
            isActive: 1,
            displayOrder: 1,
          },
          {
            name: 'Profissional',
            slug: 'profissional',
            description: 'Ideal para restaurantes médios e cafeterias estabelecidas. Inclui sistema de fidelidade e cupons.',
            priceMonthlyKz: '35000.00',
            priceAnnualKz: '336000.00',
            priceMonthlyUsd: '42.00',
            priceAnnualUsd: '403.20',
            trialDays: 14,
            maxBranches: 3,
            maxTables: 30,
            maxMenuItems: 150,
            maxOrdersPerMonth: 2000,
            maxUsers: 5,
            historyRetentionDays: 90,
            features: JSON.stringify([
              'pdv', 'gestao_mesas', 'menu_digital', 'qr_code',
              'cozinha_tempo_real', 'relatorios_basicos', 'impressao_recibos',
              'fidelidade', 'cupons', 'gestao_clientes', 'delivery_takeout',
              'relatorios_avancados', 'dashboard_analytics', 'gestao_despesas',
              'multi_filial', 'suporte_prioritario'
            ]),
            isActive: 1,
            displayOrder: 2,
          },
          {
            name: 'Empresarial',
            slug: 'empresarial',
            description: 'Ideal para redes de restaurantes e franquias. Funcionalidades completas e multi-filial.',
            priceMonthlyKz: '70000.00',
            priceAnnualKz: '672000.00',
            priceMonthlyUsd: '84.00',
            priceAnnualUsd: '806.40',
            trialDays: 14,
            maxBranches: 10,
            maxTables: 100,
            maxMenuItems: 999999,
            maxOrdersPerMonth: 10000,
            maxUsers: 15,
            historyRetentionDays: 365,
            features: JSON.stringify([
              'pdv', 'gestao_mesas', 'menu_digital', 'qr_code',
              'cozinha_tempo_real', 'relatorios_basicos', 'impressao_recibos',
              'fidelidade', 'cupons', 'gestao_clientes', 'delivery_takeout',
              'relatorios_avancados', 'dashboard_analytics', 'gestao_despesas',
              'multi_filial', 'inventario', 'relatorios_financeiros',
              'api_integracoes', 'exportacao_dados', 'customizacao_visual',
              'multiplos_turnos', 'suporte_whatsapp'
            ]),
            isActive: 1,
            displayOrder: 3,
          },
          {
            name: 'Enterprise',
            slug: 'enterprise',
            description: 'Solução personalizada para grandes cadeias e grupos de restaurantes. Tudo ilimitado com suporte dedicado.',
            priceMonthlyKz: '150000.00',
            priceAnnualKz: '1440000.00',
            priceMonthlyUsd: '180.00',
            priceAnnualUsd: '1728.00',
            trialDays: 30,
            maxBranches: 999999,
            maxTables: 999999,
            maxMenuItems: 999999,
            maxOrdersPerMonth: 999999,
            maxUsers: 999999,
            historyRetentionDays: 999999,
            features: JSON.stringify([
              'tudo_ilimitado', 'servidor_dedicado', 'white_label',
              'integracao_personalizada', 'treinamento_presencial',
              'sla_garantido', 'suporte_24_7', 'gerente_conta_dedicado'
            ]),
            isActive: 1,
            displayOrder: 4,
          },
        ];
        
        for (const plan of plans) {
          await db.execute(sql`
            INSERT INTO subscription_plans (
              name, slug, description,
              price_monthly_kz, price_annual_kz,
              price_monthly_usd, price_annual_usd,
              trial_days, max_branches, max_tables, max_menu_items,
              max_orders_per_month, max_users, history_retention_days,
              features, is_active, display_order
            ) VALUES (
              ${plan.name}, ${plan.slug}, ${plan.description},
              ${plan.priceMonthlyKz}, ${plan.priceAnnualKz},
              ${plan.priceMonthlyUsd}, ${plan.priceAnnualUsd},
              ${plan.trialDays}, ${plan.maxBranches}, ${plan.maxTables}, ${plan.maxMenuItems},
              ${plan.maxOrdersPerMonth}, ${plan.maxUsers}, ${plan.historyRetentionDays},
              ${plan.features}::jsonb, ${plan.isActive}, ${plan.displayOrder}
            )
          `);
        }
        
        console.log('✅ Subscription plans seeded successfully!');
        console.log('  🥉 Básico: 15.000 Kz/mês');
        console.log('  🥈 Profissional: 35.000 Kz/mês');
        console.log('  🥇 Empresarial: 70.000 Kz/mês');
        console.log('  💎 Enterprise: 150.000 Kz/mês');
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
