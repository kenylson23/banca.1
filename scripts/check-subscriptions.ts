#!/usr/bin/env tsx
/**
 * Job de Monitoramento de Subscrições
 * 
 * Este script deve ser executado diariamente (cron job) para:
 * 1. Verificar subscrições que expiraram
 * 2. Auto-atualizar status para 'expirada'
 * 3. Enviar notificações de alerta (7 dias, 3 dias, 1 dia antes)
 * 4. Gerar relatório de subscrições críticas
 */

import '../load-env.js';
import { db } from '../server/db.js';
import { eq, and, lte, gte, sql } from 'drizzle-orm';
import { subscriptions, subscriptionPlans, restaurants } from '../shared/schema.js';

interface SubscriptionCheck {
  id: string;
  restaurantId: string;
  restaurantName: string;
  planName: string;
  status: string;
  currentPeriodEnd: Date;
  daysUntilExpiration: number;
  autoRenew: number;
}

async function checkExpiredSubscriptions() {
  console.log('🔍 Checking for expired subscriptions...');
  
  const now = new Date();
  
  // Find subscriptions that are expired (period ended but still marked as active/trial)
  const expiredSubs = await db
    .select({
      id: subscriptions.id,
      restaurantId: subscriptions.restaurantId,
      restaurantName: restaurants.name,
      planName: subscriptionPlans.name,
      status: subscriptions.status,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(subscriptions)
    .innerJoin(restaurants, eq(subscriptions.restaurantId, restaurants.id))
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(
      and(
        lte(subscriptions.currentPeriodEnd, now),
        sql`${subscriptions.status} IN ('trial', 'ativa')`
      )
    );

  if (expiredSubs.length === 0) {
    console.log('✅ No expired subscriptions found');
    return { expired: 0, updated: 0 };
  }

  console.log(`⚠️  Found ${expiredSubs.length} expired subscription(s)`);

  let updatedCount = 0;
  for (const sub of expiredSubs) {
    try {
      // Update subscription status to expired
      await db
        .update(subscriptions)
        .set({ 
          status: 'expirada',
          updatedAt: new Date()
        })
        .where(eq(subscriptions.id, sub.id));

      updatedCount++;
      console.log(`  ✅ Updated ${sub.restaurantName} (${sub.planName}) - expired ${Math.floor((now.getTime() - sub.currentPeriodEnd.getTime()) / (1000 * 60 * 60 * 24))} days ago`);
    } catch (error) {
      console.error(`  ❌ Failed to update subscription ${sub.id}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${updatedCount}/${expiredSubs.length} subscriptions updated to 'expirada'\n`);
  return { expired: expiredSubs.length, updated: updatedCount };
}

async function checkExpiringSubscriptions() {
  console.log('🔍 Checking for expiring subscriptions...');
  
  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);
  
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);
  
  const in1Day = new Date(now);
  in1Day.setDate(in1Day.getDate() + 1);

  // Find subscriptions expiring in next 7 days
  const expiringSubs = await db
    .select({
      id: subscriptions.id,
      restaurantId: subscriptions.restaurantId,
      restaurantName: restaurants.name,
      restaurantEmail: restaurants.email,
      planName: subscriptionPlans.name,
      status: subscriptions.status,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      autoRenew: subscriptions.autoRenew,
      billingInterval: subscriptions.billingInterval,
      currency: subscriptions.currency,
    })
    .from(subscriptions)
    .innerJoin(restaurants, eq(subscriptions.restaurantId, restaurants.id))
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(
      and(
        lte(subscriptions.currentPeriodEnd, in7Days),
        gte(subscriptions.currentPeriodEnd, now),
        sql`${subscriptions.status} IN ('trial', 'ativa')`
      )
    )
    .orderBy(subscriptions.currentPeriodEnd);

  if (expiringSubs.length === 0) {
    console.log('✅ No subscriptions expiring in the next 7 days');
    return { total: 0, alerts: [] };
  }

  console.log(`⚠️  Found ${expiringSubs.length} subscription(s) expiring soon:\n`);

  const alerts: { restaurant: string; plan: string; daysLeft: number; priority: 'high' | 'medium' | 'low' }[] = [];

  for (const sub of expiringSubs) {
    const daysUntilExpiration = Math.ceil(
      (sub.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const priority = daysUntilExpiration <= 1 ? 'high' : daysUntilExpiration <= 3 ? 'medium' : 'low';
    const emoji = daysUntilExpiration <= 1 ? '🚨' : daysUntilExpiration <= 3 ? '⚠️' : '📢';

    console.log(`  ${emoji} ${sub.restaurantName} (${sub.planName})`);
    console.log(`     Status: ${sub.status} | Expira em: ${daysUntilExpiration} dia(s)`);
    console.log(`     Email: ${sub.restaurantEmail}`);
    console.log(`     Auto-renovar: ${sub.autoRenew ? 'Sim' : 'Não'}`);
    console.log('');

    alerts.push({
      restaurant: sub.restaurantName,
      plan: sub.planName,
      daysLeft: daysUntilExpiration,
      priority
    });

    // TODO: Send email notifications based on days left
    // if (daysUntilExpiration === 7) sendEmail7DaysWarning(sub);
    // if (daysUntilExpiration === 3) sendEmail3DaysWarning(sub);
    // if (daysUntilExpiration === 1) sendEmail1DayWarning(sub);
  }

  console.log(`📊 Summary: ${expiringSubs.length} subscription(s) expiring soon`);
  console.log(`   🚨 High priority (≤1 day): ${alerts.filter(a => a.priority === 'high').length}`);
  console.log(`   ⚠️  Medium priority (2-3 days): ${alerts.filter(a => a.priority === 'medium').length}`);
  console.log(`   📢 Low priority (4-7 days): ${alerts.filter(a => a.priority === 'low').length}\n`);

  return { total: expiringSubs.length, alerts };
}

async function generateReport() {
  console.log('📊 RELATÓRIO DE SUBSCRIÇÕES\n');
  console.log('═'.repeat(60));
  
  // Count subscriptions by status
  const statusCounts = await db
    .select({
      status: subscriptions.status,
      count: sql<number>`count(*)::int`
    })
    .from(subscriptions)
    .groupBy(subscriptions.status);

  console.log('\n📈 Status das Subscrições:');
  for (const row of statusCounts) {
    const emoji = 
      row.status === 'ativa' ? '✅' :
      row.status === 'trial' ? '🎁' :
      row.status === 'expirada' ? '❌' :
      row.status === 'suspensa' ? '⏸️' :
      row.status === 'cancelada' ? '🚫' : '❓';
    
    console.log(`  ${emoji} ${row.status.padEnd(12)}: ${row.count}`);
  }

  // Count subscriptions by plan
  const planCounts = await db
    .select({
      planName: subscriptionPlans.name,
      count: sql<number>`count(*)::int`
    })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .groupBy(subscriptionPlans.name);

  console.log('\n💳 Subscrições por Plano:');
  for (const row of planCounts) {
    console.log(`  • ${row.planName.padEnd(20)}: ${row.count}`);
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

// Main execution
async function main() {
  console.log('\n🚀 INICIANDO VERIFICAÇÃO DE SUBSCRIÇÕES');
  console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);
  console.log('═'.repeat(60) + '\n');

  try {
    // Check and update expired subscriptions
    const expiredResults = await checkExpiredSubscriptions();
    
    // Check subscriptions expiring soon
    const expiringResults = await checkExpiringSubscriptions();
    
    // Generate summary report
    await generateReport();

    console.log('✅ VERIFICAÇÃO CONCLUÍDA COM SUCESSO\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO DURANTE VERIFICAÇÃO:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkExpiredSubscriptions, checkExpiringSubscriptions, generateReport };
