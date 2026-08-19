import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '..', 'server', 'migrations');

async function runSafeFix() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL não está definida.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Conectado à base de dados\n');

    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64)
      );
    `);

    const migrationFile = path.join(MIGRATIONS_DIR, 'fix_table_status_enum_safe.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    const check = await client.query('SELECT filename FROM migrations WHERE filename = $1', ['fix_table_status_enum_safe.sql']);

    if (check.rows.length > 0) {
      console.log('✅ Migration fix_table_status_enum_safe.sql já foi aplicada.\n');
      return;
    }

    console.log('🔄 Aplicando fix_table_status_enum_safe.sql ...\n');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO migrations (filename) VALUES ($1)', ['fix_table_status_enum_safe.sql']);
    await client.query('COMMIT');

    console.log('✅ fix_table_status_enum_safe.sql aplicada com sucesso!\n');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao aplicar migration:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSafeFix();
