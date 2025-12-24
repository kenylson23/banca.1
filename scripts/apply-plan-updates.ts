/**
 * Script para aplicar atualizações nas flags dos planos
 * Executa as queries SQL diretamente no banco via código
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function updatePlans() {
  console.log('🔄 Iniciando atualização dos planos...\n');

  try {
    // Atualizar Plano Básico
    console.log('📦 Atualizando Plano Básico...');
    await db.execute(sql`
      UPDATE subscription_plans
      SET 
        max_customers = 50,
        has_loyalty_program = 0,
        max_active_coupons = 0,
        has_coupon_system = 0,
        has_expense_tracking = 0,
        max_expense_categories = 0,
        has_inventory_module = 0,
        max_inventory_items = 0,
        has_stock_transfers = 0
      WHERE slug = 'basico'
    `);
    console.log('✅ Plano Básico atualizado!\n');

    // Atualizar Plano Profissional
    console.log('💼 Atualizando Plano Profissional...');
    await db.execute(sql`
      UPDATE subscription_plans
      SET 
        max_customers = 200,
        has_loyalty_program = 1,
        max_active_coupons = 50,
        has_coupon_system = 1,
        has_expense_tracking = 1,
        max_expense_categories = 50,
        has_inventory_module = 0,
        max_inventory_items = 0,
        has_stock_transfers = 0
      WHERE slug = 'profissional'
    `);
    console.log('✅ Plano Profissional atualizado!\n');

    // Atualizar Plano Empresarial
    console.log('🏢 Atualizando Plano Empresarial...');
    await db.execute(sql`
      UPDATE subscription_plans
      SET 
        max_customers = 1000,
        has_loyalty_program = 1,
        max_active_coupons = 200,
        has_coupon_system = 1,
        has_expense_tracking = 1,
        max_expense_categories = 200,
        has_inventory_module = 1,
        max_inventory_items = 5000,
        has_stock_transfers = 1
      WHERE slug = 'empresarial'
    `);
    console.log('✅ Plano Empresarial atualizado!\n');

    // Atualizar Plano Enterprise
    console.log('💎 Atualizando Plano Enterprise...');
    await db.execute(sql`
      UPDATE subscription_plans
      SET 
        max_customers = 999999,
        has_loyalty_program = 1,
        max_active_coupons = 999999,
        has_coupon_system = 1,
        has_expense_tracking = 1,
        max_expense_categories = 999999,
        has_inventory_module = 1,
        max_inventory_items = 999999,
        has_stock_transfers = 1
      WHERE slug = 'enterprise'
    `);
    console.log('✅ Plano Enterprise atualizado!\n');

    // Verificar resultados
    console.log('📊 Verificando resultados...\n');
    const plans = await db.execute(sql`
      SELECT 
        name,
        slug,
        max_customers,
        has_loyalty_program,
        has_coupon_system,
        has_expense_tracking,
        has_inventory_module,
        has_stock_transfers
      FROM subscription_plans
      ORDER BY display_order
    `);

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    PLANOS ATUALIZADOS                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    for (const plan of plans.rows) {
      console.log(`📋 ${plan.name} (${plan.slug})`);
      console.log(`   Clientes: ${plan.max_customers}`);
      console.log(`   Fidelidade: ${plan.has_loyalty_program ? '✅' : '❌'}`);
      console.log(`   Cupons: ${plan.has_coupon_system ? '✅' : '❌'}`);
      console.log(`   Despesas: ${plan.has_expense_tracking ? '✅' : '❌'}`);
      console.log(`   Inventário: ${plan.has_inventory_module ? '✅' : '❌'}`);
      console.log(`   Transferências: ${plan.has_stock_transfers ? '✅' : '❌'}`);
      console.log('');
    }

    console.log('🎉 Atualização concluída com sucesso!\n');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar planos:', error);
    throw error;
  }
}

// Executar
updatePlans()
  .then(() => {
    console.log('✅ Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
