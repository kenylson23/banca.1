# Discount Column Error - Fix Summary

## Issue Resolved ✅

**Error**: `column "discount" does not exist` in PostgreSQL queries

**Root Cause**: The database is missing the `discount` and `discount_type` columns in the `orders` table, even though:
- The schema definition includes them (`shared/schema.ts`)
- A migration file exists (`server/migrations/add_discount_to_orders.sql`)
- The migration was never applied to the database

## Changes Made

### 1. Code Fix
**File**: `server/storage.ts` (line ~2229-2230)

Added the missing columns to the explicit SELECT query in `getOrdersByTableId`:

```typescript
discount: orders.discount,
discountType: orders.discountType,
```

**Why**: This method was explicitly listing columns instead of using `select()` which auto-includes all columns.

### 2. Migration File (Already Exists)
**File**: `server/migrations/add_discount_to_orders.sql`

The migration adds:
- `discount` column (DECIMAL 10,2, default '0')
- `discount_type` column (VARCHAR 20, default 'valor')
- Enum type for discount_type ('valor', 'percentual')
- Index for performance (`idx_orders_discount`)

## Action Required 🚨

**You must apply the migration to your database**. See `FIX_DISCOUNT_COLUMN_ERROR.md` for detailed instructions.

### Quick Fix (Production Database):

Connect to your database and run:

```sql
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT '0',
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'valor';

CREATE INDEX IF NOT EXISTS idx_orders_discount ON orders(discount) WHERE discount > 0;
```

## Verification

After applying the migration:

1. ✅ No more "column discount does not exist" errors
2. ✅ Tables page loads without errors
3. ✅ Orders display correctly with discount information
4. ✅ Can fetch orders for multiple tables simultaneously

## Other Queries Status

✅ **No other fixes needed** - Most queries use `select()` without explicit column lists, so they automatically include all columns including discount/discountType once the migration is applied.

## Files Modified

- ✅ `server/storage.ts` - Added discount columns to SELECT query
- 📄 `FIX_DISCOUNT_COLUMN_ERROR.md` - Migration instructions
- 📄 `DISCOUNT_COLUMN_FIX_SUMMARY.md` - This summary

## Next Steps

1. Apply the migration to your database (see FIX_DISCOUNT_COLUMN_ERROR.md)
2. Restart the application
3. Test the tables page to confirm orders load correctly
4. Delete this summary file once resolved

---
**Status**: Code fixed ✅ | Migration pending ⏳
**Created**: 2026-01-01
