import { db, initializeConnection } from "../server/db";
import { tables, tableGuests } from "../shared/schema";
import { eq, and, isNotNull } from "drizzle-orm";

/**
 * Script de Manutenção: Corrigir Mesas Ocupadas sem Convidados
 * 
 * Este script encontra todas as mesas que estão marcadas como ocupadas
 * mas não têm nenhum convidado associado, e adiciona automaticamente
 * um convidado anônimo para permitir que pedidos sejam feitos.
 * 
 * Uso:
 *   npx tsx scripts/fix-empty-occupied-tables.ts
 * 
 * Ou com modo dry-run (apenas visualizar, sem modificar):
 *   DRY_RUN=true npx tsx scripts/fix-empty-occupied-tables.ts
 */

async function fixEmptyOccupiedTables() {
  const isDryRun = process.env.DRY_RUN === 'true';
  
  console.log('\n' + '='.repeat(60));
  console.log('🔧 SCRIPT DE MANUTENÇÃO: Mesas Ocupadas sem Convidados');
  console.log('='.repeat(60) + '\n');
  
  if (isDryRun) {
    console.log('⚠️  MODO DRY-RUN: Nenhuma alteração será feita no banco\n');
  }
  
  try {
    // Inicializar conexão com o banco
    await initializeConnection();
    // 1. Buscar todas as mesas ocupadas com sessão ativa
    console.log('🔍 Buscando mesas ocupadas com sessão ativa...\n');
    
    const occupiedTables = await db.query.tables.findMany({
      where: and(
        isNotNull(tables.currentSessionId),
        eq(tables.status, 'ocupada')
      ),
      with: {
        restaurant: {
          columns: {
            id: true,
            name: true,
          }
        }
      }
    });
    
    console.log(`📊 Encontradas ${occupiedTables.length} mesas ocupadas com sessão ativa\n`);
    
    if (occupiedTables.length === 0) {
      console.log('✅ Nenhuma mesa ocupada encontrada. Tudo OK!\n');
      return;
    }
    
    let fixed = 0;
    let alreadyOk = 0;
    const problems: Array<{ table: any; reason: string }> = [];
    
    // 2. Verificar cada mesa
    for (const table of occupiedTables) {
      // Buscar convidados da sessão
      const guests = await db.query.tableGuests.findMany({
        where: eq(tableGuests.sessionId, table.currentSessionId!)
      });
      
      console.log(`\n📋 Mesa ${table.number} (ID: ${table.id.substring(0, 8)}...)`);
      console.log(`   Restaurante: ${table.restaurant?.name || 'N/A'}`);
      console.log(`   Session ID: ${table.currentSessionId?.substring(0, 8)}...`);
      console.log(`   Convidados: ${guests.length}`);
      
      if (guests.length === 0) {
        console.log(`   ❌ PROBLEMA: Mesa ocupada mas SEM convidados!`);
        
        problems.push({
          table,
          reason: 'Mesa ocupada sem convidados'
        });
        
        if (!isDryRun) {
          // Adicionar 1 convidado padrão
          try {
            await db.insert(tableGuests).values({
              sessionId: table.currentSessionId!,
              tableId: table.id,
              restaurantId: table.restaurantId,
              guestNumber: 1,
              name: 'Convidado 1',
            });
            
            console.log(`   ✅ CORRIGIDO: Convidado adicionado!`);
            fixed++;
          } catch (error) {
            console.log(`   ❌ ERRO ao adicionar convidado:`, error);
          }
        } else {
          console.log(`   ⚠️  SERIA CORRIGIDO: Adicionaria convidado (dry-run ativo)`);
          fixed++; // Contar para estatísticas
        }
      } else {
        console.log(`   ✅ OK (${guests.length} convidado${guests.length > 1 ? 's' : ''})`);
        alreadyOk++;
      }
    }
    
    // 3. Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL');
    console.log('='.repeat(60) + '\n');
    console.log(`Total de mesas verificadas: ${occupiedTables.length}`);
    console.log(`Mesas OK: ${alreadyOk} ✅`);
    console.log(`Mesas com problemas: ${problems.length} ❌`);
    
    if (isDryRun) {
      console.log(`Mesas que SERIAM corrigidas: ${fixed} 🔧`);
    } else {
      console.log(`Mesas corrigidas: ${fixed} ✅`);
    }
    
    if (problems.length > 0) {
      console.log('\n📝 Detalhes dos problemas encontrados:');
      problems.forEach((p, idx) => {
        console.log(`\n${idx + 1}. Mesa ${p.table.number} (${p.table.restaurant?.name || 'N/A'})`);
        console.log(`   Razão: ${p.reason}`);
        console.log(`   Session ID: ${p.table.currentSessionId}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (isDryRun && fixed > 0) {
      console.log('\n💡 Para aplicar as correções, execute:');
      console.log('   npx tsx scripts/fix-empty-occupied-tables.ts\n');
    } else if (!isDryRun && fixed > 0) {
      console.log('\n✅ Script executado com sucesso!\n');
    } else if (fixed === 0) {
      console.log('\n✅ Nenhuma correção necessária. Sistema OK!\n');
    }
    
  } catch (error) {
    console.error('\n❌ Erro ao executar script:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Executar
console.log('\n🚀 Iniciando script...\n');
fixEmptyOccupiedTables();
