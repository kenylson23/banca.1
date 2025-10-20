import { sql } from 'drizzle-orm';
import { db } from './db';

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
      console.log('Ensuring database tables exist...');
      
      await db.execute(sql`CREATE TABLE IF NOT EXISTS users (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, first_name VARCHAR(100), last_name VARCHAR(100), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS tables (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), number INTEGER NOT NULL UNIQUE, qr_code TEXT NOT NULL, is_occupied INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT NOW());`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS categories (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) NOT NULL, created_at TIMESTAMP DEFAULT NOW());`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS menu_items (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), category_id VARCHAR NOT NULL REFERENCES categories(id) ON DELETE CASCADE, name VARCHAR(200) NOT NULL, description TEXT, price DECIMAL(10, 2) NOT NULL, image_url TEXT, is_available INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMP DEFAULT NOW());`);
      await db.execute(sql`DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pendente', 'em_preparo', 'pronto', 'servido'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS orders (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), table_id VARCHAR NOT NULL REFERENCES tables(id) ON DELETE CASCADE, status order_status NOT NULL DEFAULT 'pendente', total_amount DECIMAL(10, 2) NOT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS order_items (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), order_id VARCHAR NOT NULL REFERENCES orders(id) ON DELETE CASCADE, menu_item_id VARCHAR NOT NULL REFERENCES menu_items(id), quantity INTEGER NOT NULL, price DECIMAL(10, 2) NOT NULL, created_at TIMESTAMP DEFAULT NOW());`);
      
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
