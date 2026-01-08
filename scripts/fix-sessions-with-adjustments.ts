/**
 * Script de Correção: Sessões com Ajustes Não Salvos
 * 
 * OBJETIVO: Corrigir sessões onde pagamentos incluíram descontos/taxas
 *           mas os ajustes não foram salvos na sessão
 * 
 * USO: npx tsx scripts/fix-sessions-with-adjustments.ts [--dry-run] [--auto-confirm]
 * 
 * SEGURANÇA:
 * - Modo dry-run por padrão (não modifica dados)
 * - Backup automático antes de aplicar
 * - Validação de todos os cálculos
 * - Confirmação manual antes de commit
 */

import { db } from '../server/db';
import { tableSessions } from '../shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import * as readline from 'readline';

// Configuração
const DRY_RUN = !process.argv.includes('--execute');
const AUTO_CONFIRM = process.argv.includes('--auto-confirm');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Interface para sessão problemática
interface ProblematicSession {
  id: string;
  tableId: string;
  totalAmount: string;
  paidAmount: string;
  difference: number;
  calculatedDiscountPercent?: number;
  calculatedServicePercent?: number;
  adjustmentType: 'desconto' | 'taxa' | 'ambos' | 'nenhum';
}

// Função para solicitar confirmação
async function confirm(question: string): Promise<boolean> {
  if (AUTO_CONFIRM) return true;
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (s/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'y');
    });
  });
}

// Passo 1: Identificar sessões problemáticas
async function identifyProblematicSessions(): Promise<ProblematicSession[]> {
  log('blue', '\n🔍 Passo 1: Identificando sessões problemáticas...\n');

  const sessions = await db.select().from(tableSessions).where(
    and(
      // Não tem ajustes salvos ou são zero
      or(
        eq(tableSessions.discount, '0'),
        eq(tableSessions.discount, '0.00'),
        sql`${tableSessions.discount} IS NULL`
      ),
      or(
        eq(tableSessions.serviceCharge, '0'),
        eq(tableSessions.serviceCharge, '0.00'),
        sql`${tableSessions.serviceCharge} IS NULL`
      ),
      // Tem valor pago (pagamento foi processado)
      sql`CAST(${tableSessions.paidAmount} AS NUMERIC) > 0`,
      // Não está fechada
      sql`${tableSessions.status} != 'fechada'`
    )
  );

  const problematicSessions: ProblematicSession[] = [];

  for (const session of sessions) {
    const totalAmount = parseFloat(session.totalAmount || '0');
    const paidAmount = parseFloat(session.paidAmount || '0');
    const difference = totalAmount - paidAmount;

    // Apenas se houver diferença significativa (> 1 centavo)
    if (Math.abs(difference) > 0.01) {
      let adjustmentType: 'desconto' | 'taxa' | 'ambos' | 'nenhum' = 'nenhum';
      let calculatedDiscountPercent = 0;
      let calculatedServicePercent = 0;

      if (difference > 0) {
        // Diferença positiva = desconto foi aplicado
        // totalAmount - desconto = paidAmount
        // desconto = totalAmount - paidAmount
        calculatedDiscountPercent = (difference / totalAmount) * 100;
        adjustmentType = 'desconto';
      } else if (difference < 0) {
        // Diferença negativa = taxa foi aplicada
        // totalAmount + taxa = paidAmount
        // taxa = paidAmount - totalAmount
        calculatedServicePercent = (Math.abs(difference) / totalAmount) * 100;
        adjustmentType = 'taxa';
      }

      // Detectar casos complexos (desconto + taxa)
      // Se o ajuste é muito específico (não múltiplo de 5%), pode ser combinado
      const isRoundPercent = (percent: number) => percent % 5 === 0 || Math.abs(percent - Math.round(percent)) < 0.1;
      
      if (!isRoundPercent(calculatedDiscountPercent) && !isRoundPercent(calculatedServicePercent)) {
        log('yellow', `⚠️  Sessão ${session.id} pode ter desconto + taxa combinados (ajuste ${Math.abs(difference).toFixed(2)})`);
        // Tentar padrão comum: 10% desconto + 10% taxa
        // total * 0.9 * 1.1 = total * 0.99
        // Ou: 10% desconto + 10% taxa = -1% do total
      }

      problematicSessions.push({
        id: session.id,
        tableId: session.tableId,
        totalAmount: session.totalAmount || '0',
        paidAmount: session.paidAmount || '0',
        difference,
        calculatedDiscountPercent: Math.round(calculatedDiscountPercent * 100) / 100,
        calculatedServicePercent: Math.round(calculatedServicePercent * 100) / 100,
        adjustmentType,
      });
    }
  }

  log('green', `✅ Encontradas ${problematicSessions.length} sessões com diferença entre total e pago\n`);
  
  return problematicSessions;
}

// Passo 2: Exibir análise
function displayAnalysis(sessions: ProblematicSession[]) {
  log('blue', '📊 Análise das Sessões:\n');

  const byType = {
    desconto: sessions.filter(s => s.adjustmentType === 'desconto'),
    taxa: sessions.filter(s => s.adjustmentType === 'taxa'),
    ambos: sessions.filter(s => s.adjustmentType === 'ambos'),
  };

  console.table({
    'Total de sessões': sessions.length,
    'Com desconto': byType.desconto.length,
    'Com taxa': byType.taxa.length,
    'Com ambos': byType.ambos.length,
  });

  log('cyan', '\n📋 Detalhes das sessões:\n');
  
  sessions.forEach((session, index) => {
    console.log(`${index + 1}. Sessão ${session.id}`);
    console.log(`   Mesa: ${session.tableId}`);
    console.log(`   Total: R$ ${session.totalAmount}`);
    console.log(`   Pago: R$ ${session.paidAmount}`);
    console.log(`   Diferença: R$ ${session.difference.toFixed(2)}`);
    console.log(`   Tipo: ${session.adjustmentType}`);
    if (session.calculatedDiscountPercent && session.calculatedDiscountPercent > 0) {
      console.log(`   Desconto calculado: ${session.calculatedDiscountPercent}%`);
    }
    if (session.calculatedServicePercent && session.calculatedServicePercent > 0) {
      console.log(`   Taxa calculada: ${session.calculatedServicePercent}%`);
    }
    console.log('');
  });

  // Alertas
  const highAdjustments = sessions.filter(
    s => (s.calculatedDiscountPercent || 0) > 50 || (s.calculatedServicePercent || 0) > 50
  );

  if (highAdjustments.length > 0) {
    log('red', `\n🚨 ATENÇÃO: ${highAdjustments.length} sessões com ajustes muito altos (>50%):`);
    highAdjustments.forEach(s => {
      console.log(`   - Sessão ${s.id}: ${s.calculatedDiscountPercent}% desconto, ${s.calculatedServicePercent}% taxa`);
    });
    log('yellow', '   Estas sessões devem ser revisadas manualmente!\n');
  }
}

// Passo 3: Criar backup
async function createBackup(): Promise<void> {
  log('blue', '\n💾 Passo 3: Criando backup...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupTable = `table_sessions_backup_${timestamp}`;

  await db.execute(sql`
    CREATE TABLE ${sql.identifier(backupTable)} AS 
    SELECT * FROM table_sessions
  `);

  const count = await db.execute(sql`SELECT COUNT(*) FROM ${sql.identifier(backupTable)}`);
  
  log('green', `✅ Backup criado: ${backupTable} (${count.rows[0].count} sessões)\n`);
}

// Passo 4: Aplicar correções
async function applyCorrections(sessions: ProblematicSession[]): Promise<number> {
  log('blue', '\n🔧 Passo 4: Aplicando correções...\n');

  let corrected = 0;

  for (const session of sessions) {
    try {
      const updates: any = { updatedAt: new Date() };

      if (session.calculatedDiscountPercent && session.calculatedDiscountPercent > 0) {
        updates.discount = session.calculatedDiscountPercent.toFixed(2);
        updates.discountType = 'percentual';
      }

      if (session.calculatedServicePercent && session.calculatedServicePercent > 0) {
        updates.serviceCharge = session.calculatedServicePercent.toFixed(2);
        updates.serviceChargeType = 'percentual';
      }

      if (Object.keys(updates).length > 1) { // Mais de apenas updatedAt
        await db.update(tableSessions)
          .set(updates)
          .where(eq(tableSessions.id, session.id));

        log('green', `✅ Sessão ${session.id} corrigida`);
        corrected++;
      }
    } catch (error) {
      log('red', `❌ Erro ao corrigir sessão ${session.id}: ${error}`);
    }
  }

  return corrected;
}

// Passo 5: Validar correções
async function validateCorrections(sessionIds: string[]): Promise<void> {
  log('blue', '\n🔍 Passo 5: Validando correções...\n');

  let valid = 0;
  let invalid = 0;

  for (const sessionId of sessionIds) {
    const [session] = await db.select()
      .from(tableSessions)
      .where(eq(tableSessions.id, sessionId))
      .limit(1);

    if (!session) continue;

    const totalAmount = parseFloat(session.totalAmount || '0');
    const paidAmount = parseFloat(session.paidAmount || '0');
    const discount = parseFloat(session.discount || '0');
    const serviceCharge = parseFloat(session.serviceCharge || '0');

    // Calcular total esperado com ajustes
    let expectedTotal = totalAmount;
    
    if (discount > 0) {
      expectedTotal = expectedTotal * (1 - discount / 100);
    }
    
    if (serviceCharge > 0) {
      expectedTotal = expectedTotal * (1 + serviceCharge / 100);
    }

    const difference = Math.abs(expectedTotal - paidAmount);

    if (difference <= 0.01) {
      valid++;
    } else {
      invalid++;
      log('yellow', `⚠️  Sessão ${sessionId} ainda tem diferença: ${difference.toFixed(2)}`);
    }
  }

  console.log('');
  log('green', `✅ Validação: ${valid} sessões OK`);
  if (invalid > 0) {
    log('red', `❌ ${invalid} sessões ainda com diferença`);
  }
}

// Função principal
async function main() {
  try {
    log('magenta', '\n╔═══════════════════════════════════════════════════════╗');
    log('magenta', '║  Script de Correção: Sessões com Ajustes Não Salvos  ║');
    log('magenta', '╚═══════════════════════════════════════════════════════╝\n');

    if (DRY_RUN) {
      log('yellow', '⚠️  MODO DRY-RUN: Nenhuma modificação será feita');
      log('cyan', '   Use --execute para aplicar as correções\n');
    }

    // Passo 1: Identificar
    const problematicSessions = await identifyProblematicSessions();

    if (problematicSessions.length === 0) {
      log('green', '✅ Nenhuma sessão problemática encontrada!\n');
      process.exit(0);
    }

    // Passo 2: Análise
    displayAnalysis(problematicSessions);

    if (DRY_RUN) {
      log('yellow', '\n📊 Análise completa!');
      log('cyan', '   Execute novamente com --execute para aplicar as correções\n');
      process.exit(0);
    }

    // Confirmação
    log('yellow', '\n⚠️  ATENÇÃO: As correções serão aplicadas ao banco de dados!');
    const confirmed = await confirm('Deseja continuar?');

    if (!confirmed) {
      log('yellow', '\n❌ Operação cancelada pelo usuário\n');
      process.exit(0);
    }

    // Passo 3: Backup
    await createBackup();

    // Passo 4: Aplicar
    const corrected = await applyCorrections(problematicSessions);

    // Passo 5: Validar
    await validateCorrections(problematicSessions.map(s => s.id));

    log('green', `\n✅ Processo concluído! ${corrected} sessões corrigidas\n`);

  } catch (error) {
    log('red', `\n❌ Erro fatal: ${error}\n`);
    console.error(error);
    process.exit(1);
  }
}

// Executar
main();
