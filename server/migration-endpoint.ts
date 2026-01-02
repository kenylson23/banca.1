/**
 * Endpoint interno para forçar execução de migrações
 * Pode ser chamado via API ou linha de comando
 */

import type { Express, Request, Response } from 'express';
import { runAutoMigrations } from './auto-migrate';

/**
 * Adiciona endpoint para executar migrações manualmente
 */
export function setupMigrationEndpoint(app: Express) {
  // Endpoint público (sem autenticação) para desenvolvimento
  // Em produção, considere adicionar alguma proteção
  app.post('/api/internal/run-migrations', async (req: Request, res: Response) => {
    try {
      console.log('\n🔄 Executando migrações via endpoint...');
      
      const result = await runAutoMigrations();
      
      res.json({
        success: result.success,
        message: result.success 
          ? 'Migrações executadas com sucesso' 
          : 'Algumas migrações falharam',
        migrationsRun: result.migrationsRun,
        errors: result.errors,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Erro ao executar migrações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao executar migrações',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Endpoint para verificar status das migrações
  app.get('/api/internal/migrations/status', async (req: Request, res: Response) => {
    try {
      const { db } = await import('./db');
      const { sql } = await import('drizzle-orm');
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      // Buscar migrações aplicadas
      const appliedResult = await db.execute(sql`
        SELECT filename, applied_at 
        FROM migrations 
        ORDER BY applied_at DESC
      `);
      
      const applied = (appliedResult.rows || []).map((row: any) => ({
        filename: row.filename,
        appliedAt: row.applied_at
      }));
      
      // Buscar todas as migrações disponíveis
      const migrationsDir = path.join(__dirname, 'migrations');
      const allMigrations = fs.existsSync(migrationsDir)
        ? fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
        : [];
      
      const appliedFilenames = new Set(applied.map(m => m.filename));
      const pending = allMigrations.filter(f => !appliedFilenames.has(f));
      
      res.json({
        total: allMigrations.length,
        applied: applied.length,
        pending: pending.length,
        appliedMigrations: applied,
        pendingMigrations: pending,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}
