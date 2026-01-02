/**
 * Sistema de Migração Automático
 * 
 * Executa migrações SQL pendentes automaticamente no startup da aplicação.
 * Funciona em qualquer ambiente: Render, Replit, VPS, local, etc.
 */

import { db } from './db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MigrationResult {
  success: boolean;
  migrationsRun: string[];
  errors: string[];
}

/**
 * Garante que a tabela de controle de migrações existe
 */
async function ensureMigrationsTable(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64)
      );
      
      CREATE INDEX IF NOT EXISTS idx_migrations_filename ON migrations(filename);
    `);
  } catch (error) {
    console.error('⚠️  Erro ao criar tabela de migrações:', error);
    throw error;
  }
}

/**
 * Obtém lista de migrações já aplicadas
 */
async function getAppliedMigrations(): Promise<Set<string>> {
  try {
    const result = await db.execute(sql`
      SELECT filename FROM migrations ORDER BY applied_at
    `);
    
    return new Set((result.rows || []).map((row: any) => row.filename));
  } catch (error) {
    console.error('⚠️  Erro ao buscar migrações aplicadas:', error);
    return new Set();
  }
}

/**
 * Registra uma migração como aplicada
 */
async function recordMigration(filename: string): Promise<void> {
  await db.execute(sql`
    INSERT INTO migrations (filename) 
    VALUES (${filename})
    ON CONFLICT (filename) DO NOTHING
  `);
}

/**
 * Executa uma migração SQL
 */
async function executeMigration(filename: string, migrationSQL: string): Promise<void> {
  console.log(`   🔄 Aplicando: ${filename}`);
  
  try {
    // Executar o SQL da migração
    await db.execute(sql.raw(migrationSQL));
    
    // Registrar como aplicada
    await recordMigration(filename);
    
    console.log(`   ✅ Aplicada: ${filename}`);
  } catch (error: any) {
    // Ignorar erros de "já existe" - são seguros
    if (
      error.message?.includes('already exists') ||
      error.message?.includes('duplicate') ||
      error.code === '42P07' || // relation already exists
      error.code === '42701' || // column already exists
      error.code === '42710'    // object already exists
    ) {
      console.log(`   ℹ️  Ignorado (já existe): ${filename}`);
      // Ainda assim registrar como aplicada
      try {
        await recordMigration(filename);
      } catch (recordError) {
        // Já registrada, tudo bem
      }
      return;
    }
    
    throw error;
  }
}

/**
 * Executa todas as migrações pendentes automaticamente
 */
export async function runAutoMigrations(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migrationsRun: [],
    errors: []
  };

  try {
    console.log('\n🔄 Verificando migrações pendentes...');
    
    // Criar tabela de controle se não existir
    await ensureMigrationsTable();
    
    // Obter migrações já aplicadas
    const appliedMigrations = await getAppliedMigrations();
    
    // Ler todos os ficheiros de migração
    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('   ℹ️  Nenhuma pasta de migrações encontrada');
      return result;
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ordenação alfabética garante ordem
    
    // Filtrar apenas as pendentes
    const pendingMigrations = migrationFiles.filter(f => !appliedMigrations.has(f));
    
    if (pendingMigrations.length === 0) {
      console.log('   ✅ Todas as migrações já aplicadas');
      return result;
    }
    
    console.log(`   📋 ${pendingMigrations.length} migração(ões) pendente(s):`);
    pendingMigrations.forEach(f => console.log(`      - ${f}`));
    console.log('');
    
    // Executar cada migração pendente
    for (const filename of pendingMigrations) {
      try {
        const migrationPath = path.join(migrationsDir, filename);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        await executeMigration(filename, migrationSQL);
        result.migrationsRun.push(filename);
      } catch (error: any) {
        const errorMsg = `${filename}: ${error.message}`;
        result.errors.push(errorMsg);
        result.success = false;
        console.error(`   ❌ Erro em ${filename}:`, error.message);
      }
    }
    
    if (result.migrationsRun.length > 0) {
      console.log(`\n✅ ${result.migrationsRun.length} migração(ões) aplicada(s) com sucesso!`);
    }
    
    if (result.errors.length > 0) {
      console.warn(`\n⚠️  ${result.errors.length} erro(s) encontrado(s)`);
    }
    
  } catch (error: any) {
    console.error('\n❌ Erro fatal no sistema de migrações:', error.message);
    result.success = false;
    result.errors.push(error.message);
  }
  
  return result;
}

/**
 * Executa migrações de forma síncrona (sem parar a aplicação em caso de erro)
 */
export async function runAutoMigrationsSafe(): Promise<void> {
  try {
    await runAutoMigrations();
  } catch (error) {
    console.error('⚠️  Erro ao executar migrações automáticas');
    console.error('   A aplicação continuará a funcionar, mas pode ter problemas de BD');
    console.error('   Execute manualmente: npm run db:migrate');
  }
}
