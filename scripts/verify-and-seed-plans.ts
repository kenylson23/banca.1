import { db, initializeConnection } from '../server/db';
import { subscriptionPlans } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function verifyAndSeedPlans() {
  try {
    console.log('🔍 Connecting to database...');
    await initializeConnection();
    
    // Check if stripe columns exist
    console.log('\n📊 Checking table structure...');
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'subscription_plans' 
      ORDER BY ordinal_position
    `);
    
    console.log('Columns in subscription_plans:');
    columns.rows.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check current plans count
    console.log('\n📦 Checking existing plans...');
    const existingPlans = await db.select().from(subscriptionPlans);
    console.log(`Found ${existingPlans.length} existing plans`);
    
    if (existingPlans.length > 0) {
      console.log('\nExisting plans:');
      existingPlans.forEach(plan => {
        console.log(`  - ${plan.name} (${plan.slug}): ${plan.priceMonthlyKz} Kz/mês`);
      });
    }
    
    // Delete all existing plans
    console.log('\n🗑️  Clearing existing plans...');
    await db.delete(subscriptionPlans);
    
    // Insert new plans
    console.log('\n✨ Inserting new plans...');
    const plansData = [
      {
        name: 'Básico',
        slug: 'basico',
        description: 'Ideal para pequenos restaurantes, lanchonetes e food trucks. Inclui funcionalidades essenciais para começar.',
        priceMonthlyKz: '15000.00',
        priceAnnualKz: '144000.00',
        priceMonthlyUsd: '18.00',
        priceAnnualUsd: '172.80',
        trialDays: 14,
        maxBranches: 1,
        maxTables: 10,
        maxMenuItems: 50,
        maxOrdersPerMonth: 500,
        maxUsers: 2,
        historyRetentionDays: 30,
        features: [
          'pdv', 'gestao_mesas', 'menu_digital', 'qr_code',
          'cozinha_tempo_real', 'relatorios_basicos',
          'impressao_recibos', 'suporte_email'
        ],
        isActive: 1,
        displayOrder: 1,
      },
      {
        name: 'Profissional',
        slug: 'profissional',
        description: 'Ideal para restaurantes médios e cafeterias estabelecidas. Inclui sistema de fidelidade e cupons.',
        priceMonthlyKz: '35000.00',
        priceAnnualKz: '336000.00',
        priceMonthlyUsd: '42.00',
        priceAnnualUsd: '403.20',
        trialDays: 14,
        maxBranches: 3,
        maxTables: 30,
        maxMenuItems: 150,
        maxOrdersPerMonth: 2000,
        maxUsers: 5,
        historyRetentionDays: 90,
        features: [
          'pdv', 'gestao_mesas', 'menu_digital', 'qr_code',
          'cozinha_tempo_real', 'relatorios_basicos', 'impressao_recibos',
          'fidelidade', 'cupons', 'gestao_clientes', 'delivery_takeout',
          'relatorios_avancados', 'dashboard_analytics', 'gestao_despesas',
          'multi_filial', 'suporte_prioritario'
        ],
        isActive: 1,
        displayOrder: 2,
      },
      {
        name: 'Empresarial',
        slug: 'empresarial',
        description: 'Ideal para redes de restaurantes e franquias. Funcionalidades completas e multi-filial.',
        priceMonthlyKz: '70000.00',
        priceAnnualKz: '672000.00',
        priceMonthlyUsd: '84.00',
        priceAnnualUsd: '806.40',
        trialDays: 14,
        maxBranches: 10,
        maxTables: 100,
        maxMenuItems: 999999,
        maxOrdersPerMonth: 10000,
        maxUsers: 15,
        historyRetentionDays: 365,
        features: [
          'pdv', 'gestao_mesas', 'menu_digital', 'qr_code',
          'cozinha_tempo_real', 'relatorios_basicos', 'impressao_recibos',
          'fidelidade', 'cupons', 'gestao_clientes', 'delivery_takeout',
          'relatorios_avancados', 'dashboard_analytics', 'gestao_despesas',
          'multi_filial', 'inventario', 'relatorios_financeiros',
          'api_integracoes', 'exportacao_dados', 'customizacao_visual',
          'multiplos_turnos', 'suporte_whatsapp'
        ],
        isActive: 1,
        displayOrder: 3,
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'Solução personalizada para grandes cadeias e grupos de restaurantes. Tudo ilimitado com suporte dedicado.',
        priceMonthlyKz: '150000.00',
        priceAnnualKz: '1440000.00',
        priceMonthlyUsd: '180.00',
        priceAnnualUsd: '1728.00',
        trialDays: 30,
        maxBranches: 999999,
        maxTables: 999999,
        maxMenuItems: 999999,
        maxOrdersPerMonth: 999999,
        maxUsers: 999999,
        historyRetentionDays: 999999,
        features: [
          'tudo_ilimitado', 'servidor_dedicado', 'white_label',
          'integracao_personalizada', 'treinamento_presencial',
          'sla_garantido', 'suporte_24_7', 'gerente_conta_dedicado'
        ],
        isActive: 1,
        displayOrder: 4,
      },
    ];
    
    for (const plan of plansData) {
      await db.insert(subscriptionPlans).values(plan as any);
      console.log(`  ✅ ${plan.name}: ${parseFloat(plan.priceMonthlyKz).toLocaleString('pt-AO')} Kz/mês`);
    }
    
    console.log('\n✅ Plans seeded successfully!');
    
    // Verify the insertion
    const newPlans = await db.select().from(subscriptionPlans);
    console.log(`\n📦 Total plans in database: ${newPlans.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyAndSeedPlans();
