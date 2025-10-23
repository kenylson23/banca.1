import '../load-env';
import { db, initializeConnection } from '../server/db';
import { menuItems } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function fixMenuAvailability() {
  console.log('🔧 Corrigindo disponibilidade dos itens do menu...\n');
  
  try {
    // Initialize database connection
    await initializeConnection();
    
    // Update all menu items to be available
    const result = await db
      .update(menuItems)
      .set({ isAvailable: 1 })
      .where(eq(menuItems.isAvailable, 0))
      .returning();
    
    console.log(`✅ ${result.length} itens do menu foram atualizados para disponíveis!\n`);
    
    if (result.length > 0) {
      console.log('Itens atualizados:');
      result.forEach(item => {
        console.log(`  - ${item.name}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao atualizar itens:', error);
    process.exit(1);
  }
}

fixMenuAvailability();
