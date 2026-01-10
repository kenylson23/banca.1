/**
 * Script para corrigir session.paidAmount baseado nos pagamentos reais
 * Uso: npm run fix-session-paid-amount
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { tableSessions, tablePayments } from '../shared/schema';
import { eq, isNull } from 'drizzle-orm';

async function fixSessionPaidAmounts() {
  // Inicializar conexão com o banco
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não configurada');
  }
  
  const client = postgres(connectionString);
  const db = drizzle(client);
  console.log('🔧 Iniciando correção de session.paidAmount...\n');

  // Buscar todas as sessões ativas (sem endedAt)
  const activeSessions = await db.select()
    .from(tableSessions)
    .where(isNull(tableSessions.endedAt));

  console.log(`📊 Sessões ativas encontradas: ${activeSessions.length}\n`);

  let fixed = 0;
  let errors = 0;

  for (const session of activeSessions) {
    try {
      // Buscar todos os pagamentos da sessão
      const payments = await db.select()
        .from(tablePayments)
        .where(eq(tablePayments.sessionId, session.id));

      // Calcular total real dos pagamentos
      const correctPaidAmount = payments.reduce((sum, p) => {
        return sum + parseFloat(p.amount || '0');
      }, 0);

      const currentPaidAmount = parseFloat(session.paidAmount || '0');
      const difference = Math.abs(correctPaidAmount - currentPaidAmount);

      // Se houver diferença maior que 1 centavo, corrigir
      if (difference > 0.01) {
        console.log(`\n⚠️  Sessão ${session.id}:`);
        console.log(`   Valor ATUAL em session.paidAmount: ${currentPaidAmount.toFixed(2)} Kz`);
        console.log(`   Valor CORRETO (soma dos pagamentos): ${correctPaidAmount.toFixed(2)} Kz`);
        console.log(`   Diferença: ${difference.toFixed(2)} Kz`);
        console.log(`   Pagamentos registrados: ${payments.length}`);

        // Atualizar
        await db.update(tableSessions)
          .set({ paidAmount: correctPaidAmount.toFixed(2) })
          .where(eq(tableSessions.id, session.id));

        console.log(`   ✅ Corrigido!`);
        fixed++;
      } else {
        console.log(`✓ Sessão ${session.id}: OK (${currentPaidAmount.toFixed(2)} Kz)`);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar sessão ${session.id}:`, error);
      errors++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RESUMO DA CORREÇÃO:`);
  console.log(`   Total de sessões verificadas: ${activeSessions.length}`);
  console.log(`   Sessões corrigidas: ${fixed}`);
  console.log(`   Erros: ${errors}`);
  console.log(`${'='.repeat(60)}\n`);

  if (fixed > 0) {
    console.log('✅ Correção concluída! Recarregue a página no navegador.');
  } else {
    console.log('✅ Nenhuma correção necessária. Todos os valores estão corretos.');
  }

  process.exit(0);
}

// Executar
fixSessionPaidAmounts().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
