import { db, initializeConnection } from "../server/db";
import { tables, orders } from "../shared/schema";
import { eq, and, or, isNotNull } from "drizzle-orm";

/**
 * Script: Recalcular Totais de Mesas Ocupadas
 * 
 * Recalcula o campo total_amount de todas as mesas ocupadas
 * baseado na soma dos pedidos ativos (pendente, em_preparo, pronto).
 * 
 * Uso:
 *   node -e "require('./load-env.js'); require('child_process').execSync('npx tsx scripts/recalculate-table-totals.ts', {stdio:'inherit',env:process.env});"
 */

async function recalculateTableTotals() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 RECALCULAR TOTAIS DAS MESAS');
  console.log('='.repeat(60) + '\n');
  
  try {
    await initializeConnection();
    
    // Buscar todas as mesas ocupadas
    const occupiedTables = await db.query.tables.findMany({
      where: and(
        isNotNull(tables.currentSessionId),
        eq(tables.status, 'ocupada')
      )
    });
    
    console.log(`📊 Encontradas ${occupiedTables.length} mesas ocupadas\n`);
    
    let updated = 0;
    let unchanged = 0;
    
    for (const table of occupiedTables) {
      // Buscar pedidos ativos da mesa
      const tableOrders = await db.query.orders.findMany({
        where: and(
          eq(orders.tableId, table.id),
          eq(orders.restaurantId, table.restaurantId),
          or(
            eq(orders.status, 'pendente'),
            eq(orders.status, 'em_preparo'),
            eq(orders.status, 'pronto')
          )
        )
      });
      
      // Calcular total
      const total = tableOrders.reduce((sum, order) => {
        return sum + parseFloat(order.totalAmount || '0');
      }, 0);
      
      const totalFormatted = total.toFixed(2);
      const currentTotal = parseFloat(table.totalAmount || '0').toFixed(2);
      
      console.log(`📋 Mesa ${table.number} (ID: ${table.id.substring(0, 8)}...)`);
      console.log(`   Pedidos ativos: ${tableOrders.length}`);
      console.log(`   Total atual: ${currentTotal}`);
      console.log(`   Total calculado: ${totalFormatted}`);
      
      if (currentTotal !== totalFormatted) {
        console.log(`   ⚠️  DIFERENÇA DETECTADA! Atualizando...`);
        
        // Atualizar mesa
        await db.update(tables)
          .set({ totalAmount: totalFormatted })
          .where(eq(tables.id, table.id));
        
        console.log(`   ✅ Atualizado para: ${totalFormatted}`);
        updated++;
      } else {
        console.log(`   ✅ OK (total correto)`);
        unchanged++;
      }
      
      console.log();
    }
    
    console.log('='.repeat(60));
    console.log('📊 RESUMO:');
    console.log(`   Total de mesas: ${occupiedTables.length}`);
    console.log(`   Mesas atualizadas: ${updated} ✅`);
    console.log(`   Mesas já corretas: ${unchanged} ✅`);
    console.log('='.repeat(60) + '\n');
    
    if (updated > 0) {
      console.log('✅ Totais recalculados com sucesso!\n');
    } else {
      console.log('✅ Todos os totais já estavam corretos!\n');
    }
    
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

recalculateTableTotals();
