import { db } from '../server/db';
import { subscriptionPlans } from '../shared/schema';
import { eq } from 'drizzle-orm';

const plans = [
  {
    name: 'Básico',
    slug: 'basico',
    description: 'Ideal para pequenos restaurantes, lanchonetes e food trucks. Inclui funcionalidades essenciais para começar.',
    priceMonthlyKz: '15000.00',
    priceAnnualKz: '144000.00', // 20% desconto
    priceMonthlyUsd: '18.00',
    priceAnnualUsd: '172.80', // 20% desconto
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    trialDays: 14,
    maxBranches: 1,
    maxTables: 10,
    maxMenuItems: 50,
    maxOrdersPerMonth: 500,
    maxUsers: 2,
    historyRetentionDays: 30,
    features: JSON.stringify([
      'pdv',
      'gestao_mesas',
      'menu_digital',
      'qr_code',
      'cozinha_tempo_real',
      'relatorios_basicos',
      'impressao_recibos',
      'suporte_email'
    ]),
    isActive: 1,
    displayOrder: 1,
  },
  {
    name: 'Profissional',
    slug: 'profissional',
    description: 'Ideal para restaurantes médios e cafeterias estabelecidas. Inclui sistema de fidelidade e cupons.',
    priceMonthlyKz: '35000.00',
    priceAnnualKz: '336000.00', // 20% desconto
    priceMonthlyUsd: '42.00',
    priceAnnualUsd: '403.20', // 20% desconto
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    trialDays: 14,
    maxBranches: 3,
    maxTables: 30,
    maxMenuItems: 150,
    maxOrdersPerMonth: 2000,
    maxUsers: 5,
    historyRetentionDays: 90,
    features: JSON.stringify([
      'pdv',
      'gestao_mesas',
      'menu_digital',
      'qr_code',
      'cozinha_tempo_real',
      'relatorios_basicos',
      'impressao_recibos',
      'fidelidade',
      'cupons',
      'gestao_clientes',
      'delivery_takeout',
      'relatorios_avancados',
      'dashboard_analytics',
      'gestao_despesas',
      'multi_filial',
      'suporte_prioritario'
    ]),
    isActive: 1,
    displayOrder: 2,
  },
  {
    name: 'Empresarial',
    slug: 'empresarial',
    description: 'Ideal para redes de restaurantes e franquias. Funcionalidades completas e multi-filial.',
    priceMonthlyKz: '70000.00',
    priceAnnualKz: '672000.00', // 20% desconto
    priceMonthlyUsd: '84.00',
    priceAnnualUsd: '806.40', // 20% desconto
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    trialDays: 14,
    maxBranches: 10,
    maxTables: 100,
    maxMenuItems: 999999, // ilimitado
    maxOrdersPerMonth: 10000,
    maxUsers: 15,
    historyRetentionDays: 365,
    features: JSON.stringify([
      'pdv',
      'gestao_mesas',
      'menu_digital',
      'qr_code',
      'cozinha_tempo_real',
      'relatorios_basicos',
      'impressao_recibos',
      'fidelidade',
      'cupons',
      'gestao_clientes',
      'delivery_takeout',
      'relatorios_avancados',
      'dashboard_analytics',
      'gestao_despesas',
      'multi_filial',
      'inventario',
      'relatorios_financeiros',
      'api_integracoes',
      'exportacao_dados',
      'customizacao_visual',
      'multiplos_turnos',
      'suporte_whatsapp'
    ]),
    isActive: 1,
    displayOrder: 3,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Solução personalizada para grandes cadeias e grupos de restaurantes. Tudo ilimitado com suporte dedicado.',
    priceMonthlyKz: '150000.00',
    priceAnnualKz: '1440000.00', // 20% desconto
    priceMonthlyUsd: '180.00',
    priceAnnualUsd: '1728.00', // 20% desconto
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    trialDays: 30,
    maxBranches: 999999, // ilimitado
    maxTables: 999999, // ilimitado
    maxMenuItems: 999999, // ilimitado
    maxOrdersPerMonth: 999999, // ilimitado
    maxUsers: 999999, // ilimitado
    historyRetentionDays: 999999, // ilimitado
    features: JSON.stringify([
      'tudo_ilimitado',
      'servidor_dedicado',
      'white_label',
      'integracao_personalizada',
      'treinamento_presencial',
      'sla_garantido',
      'suporte_24_7',
      'gerente_conta_dedicado'
    ]),
    isActive: 1,
    displayOrder: 4,
  },
];

async function seedSubscriptionPlans() {
  console.log('🌱 Populando planos de subscrição...\n');

  for (const plan of plans) {
    try {
      const existing = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.slug, plan.slug))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⚠️  Plano "${plan.name}" já existe. Atualizando...`);
        await db
          .update(subscriptionPlans)
          .set({
            ...plan,
            updatedAt: new Date(),
          })
          .where(eq(subscriptionPlans.slug, plan.slug));
        console.log(`✅ Plano "${plan.name}" atualizado com sucesso!\n`);
      } else {
        await db.insert(subscriptionPlans).values(plan);
        console.log(`✅ Plano "${plan.name}" criado com sucesso!`);
        console.log(`   💰 Mensal: ${plan.priceMonthlyKz} Kz / ${plan.priceMonthlyUsd} USD`);
        console.log(`   💰 Anual: ${plan.priceAnnualKz} Kz / ${plan.priceAnnualUsd} USD`);
        console.log(`   📊 Limites: ${plan.maxBranches} filiais, ${plan.maxTables} mesas, ${plan.maxMenuItems} itens\n`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar/atualizar plano "${plan.name}":`, error);
    }
  }

  console.log('✨ Seed de planos de subscrição concluído!\n');
  console.log('📋 Resumo dos planos:');
  console.log('  🥉 Básico: 15.000 Kz/mês - Para pequenos negócios');
  console.log('  🥈 Profissional: 35.000 Kz/mês - Para restaurantes médios');
  console.log('  🥇 Empresarial: 70.000 Kz/mês - Para redes e franquias');
  console.log('  💎 Enterprise: 150.000 Kz/mês - Tudo ilimitado e personalizado\n');
}

seedSubscriptionPlans()
  .then(() => {
    console.log('✅ Processo finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao popular planos:', error);
    process.exit(1);
  });
