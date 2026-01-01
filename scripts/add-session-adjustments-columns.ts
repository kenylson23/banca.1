import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function addColumns() {
  try {
    console.log('🔧 Adicionando colunas de desconto/taxa na table_sessions...');
    
    await db.execute(sql`
      ALTER TABLE table_sessions 
      ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT '0',
      ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'valor',
      ADD COLUMN IF NOT EXISTS service_charge DECIMAL(10, 2) DEFAULT '0',
      ADD COLUMN IF NOT EXISTS service_charge_type VARCHAR(20) DEFAULT 'percentual'
    `);
    
    console.log('✅ Colunas adicionadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

addColumns();
