import { db, initializeConnection } from "../server/db";
import { tables } from "../shared/schema";
import { and, isNotNull, eq } from "drizzle-orm";
import { storage } from "../server/storage";

/**
 * Script: Recalcular Totais de Mesas Ocupadas
 * 
 * Recalcula o campo total_amount de todas as mesas ocupadas
 * baseado na soma dos pedidos não cancelados da sessão ativa.
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
      const currentTotal = parseFloat(table.totalAmount || '0').toFixed(2);
      const newTotalNum = await storage.calculateTableTotal(table.restaurantId, table.id);
      const totalFormatted = newTotalNum.toFixed(2);
      
      console.log(`📋 Mesa ${table.number} (ID: ${table.id.substring(0, 8)}...)`);
      console.log(`   Total anterior: ${currentTotal}`);
      console.log(`   Total calculado: ${totalFormatted}`);
      
      if (currentTotal !== totalFormatted) {
        console.log(`   ⚠️  DIFERENÇA DETECTADA! Atualizado para: ${totalFormatted}`);
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
