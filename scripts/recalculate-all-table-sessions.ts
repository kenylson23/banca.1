import { db, initializeConnection, pool } from '../server/db';
import { tableSessions } from '../shared/schema';
import { storage } from '../server/storage';

/**
 * Recalcula totais e pagamentos de todas as sessões, incluindo as encerradas.
 *
 * O recálculo usa os pedidos, ajustes da sessão e pagamentos registrados como
 * fonte de verdade. É seguro executar novamente.
 */
async function recalculateAllTableSessions() {
  await initializeConnection();

  const sessions = await db.select().from(tableSessions);
  let updated = 0;
  let unchanged = 0;

  console.log(`🔄 Recalculando ${sessions.length} sessão(ões) de mesa...`);

  for (const session of sessions) {
    const previousTotal = session.totalAmount || '0.00';
    const previousPaid = session.paidAmount || '0.00';
    const result = await storage.recalculateSessionTotals(session.id);

    if (
      result &&
      (result.totalAmount !== previousTotal || result.paidAmount !== previousPaid)
    ) {
      updated++;
      console.log(
        `✅ ${session.id}: total ${previousTotal} → ${result.totalAmount}; pago ${previousPaid} → ${result.paidAmount}`,
      );
    } else {
      unchanged++;
    }
  }

  console.log(`Concluído: ${updated} atualizada(s), ${unchanged} já correta(s).`);
  await pool.end();
}

recalculateAllTableSessions().catch(async (error) => {
  console.error('❌ Erro ao recalcular sessões:', error);
  try {
    await pool.end();
  } catch {
    // A conexão pode não ter sido inicializada.
  }
  process.exit(1);
});