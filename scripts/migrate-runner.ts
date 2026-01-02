/**
 * Sistema de Migração de Base de Dados
 * 
 * Este script executa migrações SQL pendentes de forma ordenada e segura.
 * Mantém um registo de migrações aplicadas na tabela `migrations`.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

// Obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Migration {
  filename: string;
  sql: string;
  applied: boolean;
  appliedAt?: Date;
}

class MigrationRunner {
  private client: Client;
  private migrationsDir: string;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('❌ DATABASE_URL não está definida. Configure a variável de ambiente.');
    }

    this.client = new Client({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    this.migrationsDir = path.join(__dirname, '..', 'server', 'migrations');
  }

  async connect(): Promise<void> {
    await this.client.connect();
    console.log('✅ Conectado à base de dados\n');
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  /**
   * Cria a tabela de controle de migrações se não existir
   */
  async ensureMigrationsTable(): Promise<void> {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64)
      );
      
      CREATE INDEX IF NOT EXISTS idx_migrations_filename ON migrations(filename);
    `);
    console.log('✅ Tabela de controle de migrações verificada\n');
  }

  /**
   * Obtém lista de migrações aplicadas
   */
  async getAppliedMigrations(): Promise<Set<string>> {
    const result = await this.client.query(
      'SELECT filename FROM migrations ORDER BY applied_at'
    );
    return new Set(result.rows.map(row => row.filename));
  }

  /**
   * Obtém todas as migrações disponíveis
   */
  async getAllMigrations(): Promise<Migration[]> {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ordenação alfabética

    const appliedMigrations = await this.getAppliedMigrations();

    return files.map(filename => ({
      filename,
      sql: fs.readFileSync(path.join(this.migrationsDir, filename), 'utf8'),
      applied: appliedMigrations.has(filename)
    }));
  }

  /**
   * Executa uma migração
   */
  async runMigration(migration: Migration): Promise<void> {
    console.log(`🔄 Aplicando migração: ${migration.filename}`);
    
    try {
      // Iniciar transação
      await this.client.query('BEGIN');

      // Executar SQL da migração
      await this.client.query(migration.sql);

      // Registrar migração como aplicada
      await this.client.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [migration.filename]
      );

      // Commit da transação
      await this.client.query('COMMIT');

      console.log(`✅ Migração aplicada: ${migration.filename}\n`);
    } catch (error: any) {
      // Rollback em caso de erro
      await this.client.query('ROLLBACK');
      throw new Error(`❌ Erro ao aplicar ${migration.filename}: ${error.message}`);
    }
  }

  /**
   * Executa todas as migrações pendentes
   */
  async runPendingMigrations(): Promise<void> {
    const migrations = await this.getAllMigrations();
    const pending = migrations.filter(m => !m.applied);

    if (pending.length === 0) {
      console.log('✨ Nenhuma migração pendente. Base de dados está atualizada!\n');
      return;
    }

    console.log(`📋 Encontradas ${pending.length} migração(ões) pendente(s):\n`);
    pending.forEach(m => console.log(`   - ${m.filename}`));
    console.log('');

    for (const migration of pending) {
      await this.runMigration(migration);
    }

    console.log(`✨ Todas as ${pending.length} migrações foram aplicadas com sucesso!\n`);
  }

  /**
   * Lista o status de todas as migrações
   */
  async listMigrations(): Promise<void> {
    const migrations = await this.getAllMigrations();

    console.log('📋 Status das Migrações:\n');
    console.log('Status | Ficheiro');
    console.log('-------|' + '-'.repeat(60));

    for (const migration of migrations) {
      const status = migration.applied ? '✅' : '⏳';
      console.log(`${status}     | ${migration.filename}`);
    }

    const applied = migrations.filter(m => m.applied).length;
    const pending = migrations.filter(m => !m.applied).length;

    console.log('\n' + '='.repeat(68));
    console.log(`Total: ${migrations.length} | Aplicadas: ${applied} | Pendentes: ${pending}\n`);
  }
}

/**
 * Função principal
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  const runner = new MigrationRunner();

  try {
    await runner.connect();
    await runner.ensureMigrationsTable();

    switch (command) {
      case 'run':
      case 'up':
        await runner.runPendingMigrations();
        break;

      case 'list':
      case 'status':
        await runner.listMigrations();
        break;

      default:
        console.log('❌ Comando desconhecido:', command);
        console.log('\nComandos disponíveis:');
        console.log('  run, up      - Executa migrações pendentes (padrão)');
        console.log('  list, status - Lista o status de todas as migrações');
        process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await runner.disconnect();
  }
}

// Executar se for o módulo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MigrationRunner };
