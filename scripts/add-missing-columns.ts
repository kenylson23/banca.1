import { pool } from '../server/db';

async function addMissingColumns() {
  try {
    console.log('Verificando e adicionando colunas que faltam...');
    
    // Check if service_name column exists
    const checkServiceName = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'service_name'
    `);
    
    if (checkServiceName.rows.length === 0) {
      console.log('Adicionando coluna service_name...');
      await pool.query(`
        ALTER TABLE orders 
        ADD COLUMN service_name VARCHAR(200)
      `);
      console.log('✓ Coluna service_name adicionada com sucesso!');
    } else {
      console.log('✓ Coluna service_name já existe');
    }
    
    // Check if packaging_fee column exists
    const checkPackagingFee = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'packaging_fee'
    `);
    
    if (checkPackagingFee.rows.length === 0) {
      console.log('Adicionando coluna packaging_fee...');
      await pool.query(`
        ALTER TABLE orders 
        ADD COLUMN packaging_fee DECIMAL(10, 2) DEFAULT 0
      `);
      console.log('✓ Coluna packaging_fee adicionada com sucesso!');
    } else {
      console.log('✓ Coluna packaging_fee já existe');
    }
    
    console.log('\n✅ Todas as colunas necessárias foram verificadas/adicionadas!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao adicionar colunas:', error.message);
    process.exit(1);
  }
}

addMissingColumns();
