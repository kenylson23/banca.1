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
      await db.execute(sql`DO $$ BEGIN CREATE TYPE order_type AS ENUM ('mesa', 'delivery', 'takeout'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      
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
      
      // Create orders table
      await db.execute(sql`CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        table_id VARCHAR REFERENCES tables(id) ON DELETE CASCADE,
        order_type order_type NOT NULL DEFAULT 'mesa',
        customer_name VARCHAR(200), 
        customer_phone VARCHAR(50),
        delivery_address TEXT,
        status order_status NOT NULL DEFAULT 'pendente', 
        total_amount DECIMAL(10, 2) NOT NULL, 
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
