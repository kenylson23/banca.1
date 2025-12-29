import { db } from '../server/db';

async function applyGuestColumns() {
  try {
    console.log('🔧 Aplicando colunas customer_id e guest_number...');
    
    // Add customer_id column
    await db.execute(`
      ALTER TABLE table_guests 
      ADD COLUMN IF NOT EXISTS customer_id VARCHAR;
    `);
    console.log('✅ Coluna customer_id adicionada');
    
    // Add guest_number column
    await db.execute(`
      ALTER TABLE table_guests 
      ADD COLUMN IF NOT EXISTS guest_number INTEGER;
    `);
    console.log('✅ Coluna guest_number adicionada');
    
    // Add foreign key constraint (só se não existir)
    await db.execute(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'fk_table_guests_customer'
        ) THEN
          ALTER TABLE table_guests
          ADD CONSTRAINT fk_table_guests_customer
          FOREIGN KEY (customer_id) REFERENCES customers(id)
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    console.log('✅ Foreign key adicionada');
    
    // Add indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_table_guests_customer_id 
      ON table_guests(customer_id);
    `);
    console.log('✅ Índice criado');
    
    console.log('\n🎉 Migration aplicada com sucesso!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao aplicar migration:', error.message);
    process.exit(1);
  }
}

applyGuestColumns();
