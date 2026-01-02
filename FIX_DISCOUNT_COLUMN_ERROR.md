# Fix: Database Missing Discount Columns

## Problem
The application is throwing errors: `column "discount" does not exist`

This happens because the database schema is missing the `discount` and `discount_type` columns in the `orders` table, even though they are defined in the schema file.

## Solution

### Option 1: Run Migration via Database Console (Recommended for Production)

1. **Access your database** (e.g., Render PostgreSQL dashboard, pgAdmin, or psql)

2. **Run the following SQL**:

```sql
-- Migration: Add discount columns to orders table
-- Description: Adds discount and discountType columns to support order-level discounts

-- Add discount columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT '0',
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'valor';

-- Create discount_type enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('valor', 'percentual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update the column to use the enum type (if not already using it)
-- Note: This is safe because we have default values
ALTER TABLE orders 
ALTER COLUMN discount_type TYPE discount_type USING discount_type::discount_type;

-- Add comments to document the columns
COMMENT ON COLUMN orders.discount IS 'Desconto aplicado ao pedido (valor fixo ou percentual)';
COMMENT ON COLUMN orders.discount_type IS 'Tipo de desconto: valor (fixed amount) ou percentual (percentage)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_discount 
ON orders(discount) WHERE discount > 0;
```

3. **Verify the migration**:

```sql
-- Check if columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('discount', 'discount_type');
```

### Option 2: Run Migration via Application (Local Development)

If you have access to the database environment variables:

```bash
# Create a migration runner script
cat > scripts/run_discount_migration.ts << 'EOF'
import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function applyDiscountMigration() {
  try {
    console.log('🔄 Applying discount migration to orders table...');
    
    const migrationPath = path.join(__dirname, '..', 'server', 'migrations', 'add_discount_to_orders.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await db.execute(sql.raw(migrationSQL));
    
    console.log('✅ Migration applied successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Columns already exist - migration already applied');
      process.exit(0);
    }
    
    process.exit(1);
  }
}

applyDiscountMigration();
EOF

# Run the migration
DATABASE_URL=<your-database-url> tsx scripts/run_discount_migration.ts
```

### Option 3: Use Existing Migration File

The migration file already exists at: `server/migrations/add_discount_to_orders.sql`

You can apply it directly via psql:

```bash
psql $DATABASE_URL -f server/migrations/add_discount_to_orders.sql
```

## What Changed

### Code Fix Applied
- **File**: `server/storage.ts`
- **Change**: Added `discount` and `discountType` to the SELECT query in `getOrdersByTableId` method (lines 2229-2230)

This ensures that once the database columns exist, the application will properly fetch and use them.

### Schema Status
- ✅ Schema file (`shared/schema.ts`) already defines the columns
- ✅ Migration file (`server/migrations/add_discount_to_orders.sql`) already exists
- ❌ Database table is missing the columns (needs migration)

## Verification

After applying the migration, restart your application and verify:

1. **No more errors in logs** about missing `discount` column
2. **Orders load properly** in the tables view
3. **Discount functionality works** when creating/updating orders

## Additional Notes

- The migration is **safe** and uses `IF NOT EXISTS` to prevent errors if columns already exist
- Default values are set to `'0'` for discount and `'valor'` for discount_type
- An index is created for better query performance when filtering by discount
- The migration includes proper documentation via SQL comments

---

**Status**: Ready to apply
**Priority**: High (application is currently failing)
**Impact**: All table order queries will work after migration
