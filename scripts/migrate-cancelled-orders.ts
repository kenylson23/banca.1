import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log('🔄 Starting migration for cancelled orders...');

  try {
    // Step 1: Add new enum value 'cancelado' to order_status
    console.log('📝 Adding "cancelado" to order_status enum...');
    await sql`
      ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cancelado';
    `;
    console.log('✅ Added "cancelado" status');

    // Step 2: Add cancelled_at column
    console.log('📝 Adding cancelled_at column...');
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
    `;
    console.log('✅ Added cancelled_at column');

    // Step 3: Add cancelled_by column with foreign key
    console.log('📝 Adding cancelled_by column...');
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR REFERENCES users(id) ON DELETE SET NULL;
    `;
    console.log('✅ Added cancelled_by column');

    // Step 4: Update existing cancelled orders
    console.log('📝 Updating existing cancelled orders...');
    const result = await sql`
      UPDATE orders 
      SET 
        status = 'cancelado',
        cancelled_at = updated_at
      WHERE 
        (cancellation_reason IS NOT NULL AND cancellation_reason != '')
        AND status != 'cancelado';
    `;
    console.log(`✅ Updated ${result.length} cancelled orders`);

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrate()
  .then(() => {
    console.log('Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
