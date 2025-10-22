import '../load-env';
import { sql } from 'drizzle-orm';
import { db } from '../server/db';

async function migrateToMultiTenant() {
  try {
    console.log('Starting multi-tenant migration...');
    
    // 1. Create restaurant_status enum
    console.log('Creating restaurant_status enum...');
    await db.execute(sql`DO $$ BEGIN 
      CREATE TYPE restaurant_status AS ENUM ('pendente', 'ativo', 'suspenso'); 
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    
    // 2. Update user_role enum to include superadmin
    console.log('Updating user_role enum...');
    await db.execute(sql`DO $$ BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';
    EXCEPTION WHEN others THEN null; END $$;`);
    
    // 3. Create restaurants table
    console.log('Creating restaurants table...');
    await db.execute(sql`CREATE TABLE IF NOT EXISTS restaurants (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
      name VARCHAR(200) NOT NULL, 
      email VARCHAR(255) NOT NULL UNIQUE, 
      phone VARCHAR(50), 
      address TEXT, 
      status restaurant_status NOT NULL DEFAULT 'pendente', 
      created_at TIMESTAMP DEFAULT NOW(), 
      updated_at TIMESTAMP DEFAULT NOW()
    );`);
    
    // 4. Add restaurant_id to users table
    console.log('Adding restaurant_id to users table...');
    await db.execute(sql`DO $$ BEGIN 
      ALTER TABLE users ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
    EXCEPTION WHEN duplicate_column THEN null; END $$;`);
    
    // 5. Add restaurant_id to tables table
    console.log('Adding restaurant_id to tables table...');
    await db.execute(sql`DO $$ BEGIN 
      ALTER TABLE tables ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
    EXCEPTION WHEN duplicate_column THEN null; END $$;`);
    
    // 6. Drop unique constraint on table number (will be unique per restaurant)
    console.log('Dropping unique constraint on table number...');
    await db.execute(sql`DO $$ BEGIN 
      ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_number_unique; 
    EXCEPTION WHEN undefined_object THEN null; END $$;`);
    
    // 7. Add restaurant_id to categories table
    console.log('Adding restaurant_id to categories table...');
    await db.execute(sql`DO $$ BEGIN 
      ALTER TABLE categories ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
    EXCEPTION WHEN duplicate_column THEN null; END $$;`);
    
    // 8. Add restaurant_id to menu_items table
    console.log('Adding restaurant_id to menu_items table...');
    await db.execute(sql`DO $$ BEGIN 
      ALTER TABLE menu_items ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
    EXCEPTION WHEN duplicate_column THEN null; END $$;`);
    
    console.log('✅ Multi-tenant migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run the create-superadmin script to create the super administrator');
    console.log('2. Create a default restaurant or have restaurants register');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateToMultiTenant();
