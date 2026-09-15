import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  checkCanAddBranch,
  checkCanAddCustomer,
  checkCanAddInventoryItem,
  checkCanAddMenuItem,
  checkCanAddTable,
  checkCanAddUser,
  checkCanCreateCoupon,
  checkCanCreateOrder,
  checkCanUseCouponSystem,
  checkCanUseExpenseTracking,
  checkCanUseInventoryModule,
  checkCanUseLoyaltyProgram,
  checkCanUseStockTransfers,
  hasEnterpriseAccess as backendHasEnterpriseAccess,
} from '../server/planLimits';
import {
  hasEnterpriseAccess as frontendHasEnterpriseAccess,
  hasPlanFeature,
} from '../client/src/hooks/useFeatureAccess';
import {
  canUsePlanLimit,
  hasEnterpriseAccess as sharedHasEnterpriseAccess,
} from '../shared/planAccess';

const enterpriseFeatures = [
  'gestao_clientes',
  'fidelidade',
  'cupons',
  'inventario',
  'gestao_despesas',
  'multi_filial',
  'relatorios_avancados',
  'dashboard_analytics',
  'delivery_takeout',
  'relatorios_financeiros',
  'api_integracoes',
  'exportacao_dados',
] as const;

const backendChecks = [
  checkCanAddUser,
  checkCanAddBranch,
  checkCanAddTable,
  checkCanAddMenuItem,
  checkCanCreateOrder,
  checkCanAddCustomer,
  checkCanUseLoyaltyProgram,
  checkCanUseCouponSystem,
  checkCanCreateCoupon,
  checkCanUseExpenseTracking,
  checkCanUseInventoryModule,
  checkCanAddInventoryItem,
  checkCanUseStockTransfers,
] as const;

const resourceLimitFields = [
  'maxBranches',
  'maxTables',
  'maxMenuItems',
  'maxOrdersPerMonth',
  'maxUsers',
  'maxCustomers',
  'maxActiveCoupons',
  'maxInventoryItems',
] as const;

function makeLimits(plan: Record<string, unknown>) {
  return {
    plan,
    subscription: {} as any,
    usage: {
      branches: Number.MAX_SAFE_INTEGER,
      tables: Number.MAX_SAFE_INTEGER,
      menuItems: Number.MAX_SAFE_INTEGER,
      users: Number.MAX_SAFE_INTEGER,
      ordersThisMonth: Number.MAX_SAFE_INTEGER,
      customers: Number.MAX_SAFE_INTEGER,
      activeCoupons: Number.MAX_SAFE_INTEGER,
      inventoryItems: Number.MAX_SAFE_INTEGER,
    },
    withinLimits: {
      branches: false,
      tables: false,
      menuItems: false,
      users: false,
      orders: false,
      customers: false,
      coupons: false,
      inventoryItems: false,
    },
    canAddBranch: false,
    canAddTable: false,
    canAddMenuItem: false,
    canAddUser: false,
    canCreateOrder: false,
    canAddCustomer: false,
    canAddCoupon: false,
    canAddInventoryItem: false,
  };
}

function makeStorage(plan: Record<string, unknown>) {
  return {
    checkSubscriptionLimits: async () => makeLimits(plan),
  } as any;
}

describe('subscription plan access', () => {
  it('grants every feature and limit check to canonical Enterprise rows', async () => {
    const plan = {
      slug: 'enterprise',
      name: 'Enterprise',
      features: ['tudo_ilimitado'],
      maxBranches: 1,
      maxTables: 1,
      maxMenuItems: 1,
      maxOrdersPerMonth: 1,
      maxUsers: 1,
      maxCustomers: 1,
      maxActiveCoupons: 0,
      maxInventoryItems: 0,
      hasLoyaltyProgram: 0,
      hasCouponSystem: 0,
      hasExpenseTracking: 0,
      hasInventoryModule: 0,
      hasStockTransfers: 0,
    };
    const storage = makeStorage(plan);

    assert.equal(backendHasEnterpriseAccess(plan), true);
    assert.equal(frontendHasEnterpriseAccess(plan), true);
    assert.equal(sharedHasEnterpriseAccess(plan), true);
    for (const limitField of resourceLimitFields) {
      assert.equal(
        canUsePlanLimit(plan, Number(plan[limitField]), Number.MAX_SAFE_INTEGER),
        true,
        limitField,
      );
    }
    for (const feature of enterpriseFeatures) {
      assert.equal(hasPlanFeature(plan, feature), true, feature);
    }
    for (const check of backendChecks) {
      await check(storage, 'restaurant-enterprise');
    }
  });

  it('keeps legacy Enterprise subscriptions unlimited even with stale persisted fields', async () => {
    const plan = {
      slug: 'enterprise-legacy',
      name: 'Enterprise',
      features: JSON.stringify(['tudo_ilimitado']),
      maxBranches: 1,
      maxTables: 1,
      maxMenuItems: 1,
      maxOrdersPerMonth: 1,
      maxUsers: 1,
      maxCustomers: 1,
      maxActiveCoupons: 0,
      maxInventoryItems: 0,
      hasLoyaltyProgram: 0,
      hasCouponSystem: 0,
      hasExpenseTracking: 0,
      hasInventoryModule: 0,
      hasStockTransfers: 0,
    };
    const storage = makeStorage(plan);

    assert.equal(backendHasEnterpriseAccess(plan), true);
    assert.equal(frontendHasEnterpriseAccess(plan), true);
    for (const limitField of resourceLimitFields) {
      assert.equal(
        canUsePlanLimit(plan, Number(plan[limitField]), Number.MAX_SAFE_INTEGER),
        true,
        limitField,
      );
    }
    for (const feature of enterpriseFeatures) {
      assert.equal(hasPlanFeature(plan, feature), true, feature);
    }
    for (const check of backendChecks) {
      await check(storage, 'restaurant-legacy-enterprise');
    }
  });

  it('does not promote Empresarial through the unlimited feature marker', async () => {
    const plan = {
      slug: 'empresarial',
      name: 'Empresarial',
      features: ['tudo_ilimitado', 'gestao_clientes', 'inventario'],
      maxBranches: 10,
      maxTables: 100,
      maxMenuItems: 999999,
      maxOrdersPerMonth: 10000,
      maxUsers: 15,
      maxCustomers: 1000,
      maxActiveCoupons: 200,
      maxInventoryItems: 5000,
      hasLoyaltyProgram: 1,
      hasCouponSystem: 1,
      hasExpenseTracking: 1,
      hasInventoryModule: 1,
      hasStockTransfers: 1,
    };

    assert.equal(backendHasEnterpriseAccess(plan), false);
    assert.equal(frontendHasEnterpriseAccess(plan), false);
    assert.equal(sharedHasEnterpriseAccess(plan), false);
    assert.equal(hasPlanFeature(plan, 'gestao_clientes'), true);
    assert.equal(hasPlanFeature(plan, 'inventario'), true);
    assert.equal(hasPlanFeature(plan, 'servidor_dedicado'), false);
    assert.equal(hasPlanFeature(plan, 'api_integracoes'), false);
  });
});