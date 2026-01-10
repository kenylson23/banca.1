import { db } from "../server/db";
import { tableSessions, tableGuests } from "../shared/schema";
import { sql, eq } from "drizzle-orm";

/**
 * Script para corrigir sessões com paidAmount maior que totalAmount
 * (causado por pagamentos duplicados)
 */

async function fixOverpaidSessions() {
  console.log('🔧 Iniciando correção de sessões com pagamento excessivo...\n');

  try {
    // Buscar todas as sessões com paidAmount > totalAmount
    const sessions = await db.select().from(tableSessions);
    
    let fixedCount = 0;
    
    for (const session of sessions) {
      const totalAmount = parseFloat(session.totalAmount || '0');
      const paidAmount = parseFloat(session.paidAmount || '0');
      
      if (paidAmount > totalAmount && totalAmount > 0) {
        console.log(`⚠️  Sessão ${session.id}:`);
        console.log(`   Total: ${totalAmount.toFixed(2)} Kz`);
        console.log(`   Pago: ${paidAmount.toFixed(2)} Kz`);
        console.log(`   Excesso: ${(paidAmount - totalAmount).toFixed(2)} Kz`);
        
        // Corrigir paidAmount para não exceder totalAmount
        await db.update(tableSessions)
          .set({ paidAmount: totalAmount.toFixed(2) })
          .where(eq(tableSessions.id, session.id));
        
        console.log(`   ✅ Corrigido para: ${totalAmount.toFixed(2)} Kz\n`);
        
        // Também corrigir os convidados proporcionalmente
        const guests = await db.select()
          .from(tableGuests)
          .where(eq(tableGuests.sessionId, session.id));
        
        if (guests.length > 0) {
          console.log(`   🔧 Corrigindo ${guests.length} convidado(s)...`);
          
          for (const guest of guests) {
            const guestSubtotal = parseFloat(guest.subtotal || '0');
            const guestPaid = parseFloat(guest.paidAmount || '0');
            
            if (guestPaid > guestSubtotal) {
              await db.update(tableGuests)
                .set({ paidAmount: guestSubtotal.toFixed(2) })
                .where(eq(tableGuests.id, guest.id));
              
              console.log(`      - ${guest.name}: ${guestPaid.toFixed(2)} → ${guestSubtotal.toFixed(2)} Kz`);
            }
          }
        }
        
        fixedCount++;
      }
    }
    
    if (fixedCount === 0) {
      console.log('✅ Nenhuma sessão com pagamento excessivo encontrada!');
    } else {
      console.log(`\n✅ Total de sessões corrigidas: ${fixedCount}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir sessões:', error);
    throw error;
  }
}

// Executar
fixOverpaidSessions()
  .then(() => {
    console.log('\n✅ Correção concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro na correção:', error);
    process.exit(1);
  });
