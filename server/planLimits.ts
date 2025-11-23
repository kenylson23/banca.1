import type { IStorage } from "./storage";

export class PlanLimitError extends Error {
  constructor(
    message: string,
    public readonly limitType: 'users' | 'branches' | 'tables' | 'menuItems' | 'orders' | 'customers' | 'coupons' | 'inventoryItems' | 'expenseCategories',
    public readonly current: number,
    public readonly max: number
  ) {
    super(message);
    this.name = 'PlanLimitError';
  }
}

export class PlanFeatureError extends Error {
  constructor(
    message: string,
    public readonly featureName: 'loyalty' | 'coupons' | 'expenses' | 'inventory' | 'stockTransfers'
  ) {
    super(message);
    this.name = 'PlanFeatureError';
  }
}

export async function checkCanAddUser(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.canAddUser) {
    throw new PlanLimitError(
      `Limite de usuários atingido. O plano ${limits.plan.name} permite até ${limits.plan.maxUsers} usuários e você já possui ${limits.usage.users}.`,
      'users',
      limits.usage.users,
      limits.plan.maxUsers
    );
  }
}

export async function checkCanAddBranch(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.canAddBranch) {
    throw new PlanLimitError(
      `Limite de filiais atingido. O plano ${limits.plan.name} permite até ${limits.plan.maxBranches} filiais e você já possui ${limits.usage.branches}.`,
      'branches',
      limits.usage.branches,
      limits.plan.maxBranches
    );
  }
}

export async function checkCanAddTable(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.canAddTable) {
    throw new PlanLimitError(
      `Limite de mesas atingido. O plano ${limits.plan.name} permite até ${limits.plan.maxTables} mesas e você já possui ${limits.usage.tables}.`,
      'tables',
      limits.usage.tables,
      limits.plan.maxTables
    );
  }
}

export async function checkCanAddMenuItem(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.canAddMenuItem) {
    throw new PlanLimitError(
      `Limite de produtos no menu atingido. O plano ${limits.plan.name} permite até ${limits.plan.maxMenuItems} produtos e você já possui ${limits.usage.menuItems}.`,
      'menuItems',
      limits.usage.menuItems,
      limits.plan.maxMenuItems
    );
  }
}

export async function checkCanCreateOrder(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.canCreateOrder) {
    throw new PlanLimitError(
      `Limite de pedidos mensais atingido. O plano ${limits.plan.name} permite até ${limits.plan.maxOrdersPerMonth} pedidos por mês e você já criou ${limits.usage.ordersThisMonth}.`,
      'orders',
      limits.usage.ordersThisMonth,
      limits.plan.maxOrdersPerMonth
    );
  }
}

export async function checkCanAddCustomer(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.canAddCustomer) {
    throw new PlanLimitError(
      `Limite de clientes atingido. O plano ${limits.plan.name} permite até ${limits.plan.maxCustomers} clientes e você já possui ${limits.usage.customers}.`,
      'customers',
      limits.usage.customers,
      limits.plan.maxCustomers
    );
  }
}

export async function checkCanUseLoyaltyProgram(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.plan.hasLoyaltyProgram) {
    throw new PlanFeatureError(
      `O programa de fidelidade não está disponível no plano ${limits.plan.name}. Faça upgrade para o plano Profissional ou superior.`,
      'loyalty'
    );
  }
}

export async function checkCanUseCouponSystem(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.plan.hasCouponSystem) {
    throw new PlanFeatureError(
      `O sistema de cupons não está disponível no plano ${limits.plan.name}. Faça upgrade para o plano Profissional ou superior.`,
      'coupons'
    );
  }
}

export async function checkCanCreateCoupon(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.plan.hasCouponSystem) {
    throw new PlanFeatureError(
      `O sistema de cupons não está disponível no plano ${limits.plan.name}. Faça upgrade para o plano Profissional ou superior.`,
      'coupons'
    );
  }
  
  if (!limits.canAddCoupon) {
    throw new PlanLimitError(
      `Limite de cupons ativos atingido. O plano ${limits.plan.name} permite até ${limits.plan.maxActiveCoupons} cupons ativos e você já possui ${limits.usage.activeCoupons}.`,
      'coupons',
      limits.usage.activeCoupons,
      limits.plan.maxActiveCoupons
    );
  }
}

export async function checkCanUseExpenseTracking(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.plan.hasExpenseTracking) {
    throw new PlanFeatureError(
      `A gestão de despesas não está disponível no plano ${limits.plan.name}. Faça upgrade para o plano Profissional ou superior.`,
      'expenses'
    );
  }
}

export async function checkCanUseInventoryModule(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.plan.hasInventoryModule) {
    throw new PlanFeatureError(
      `O módulo de inventário não está disponível no plano ${limits.plan.name}. Faça upgrade para o plano Empresarial ou superior.`,
      'inventory'
    );
  }
}

export async function checkCanAddInventoryItem(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.plan.hasInventoryModule) {
    throw new PlanFeatureError(
      `O módulo de inventário não está disponível no plano ${limits.plan.name}. Faça upgrade para o plano Empresarial ou superior.`,
      'inventory'
    );
  }
  
  if (!limits.canAddInventoryItem) {
    throw new PlanLimitError(
      `Limite de itens de inventário atingido. O plano ${limits.plan.name} permite até ${limits.plan.maxInventoryItems} itens e você já possui ${limits.usage.inventoryItems}.`,
      'inventoryItems',
      limits.usage.inventoryItems,
      limits.plan.maxInventoryItems
    );
  }
}

export async function checkCanUseStockTransfers(storage: IStorage, restaurantId: string): Promise<void> {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  if (!limits.plan.hasStockTransfers) {
    throw new PlanFeatureError(
      `As transferências de estoque não estão disponíveis no plano ${limits.plan.name}. Faça upgrade para o plano Empresarial ou superior.`,
      'stockTransfers'
    );
  }
}

export async function getRestaurantUsage(storage: IStorage, restaurantId: string) {
  const limits = await storage.checkSubscriptionLimits(restaurantId);
  
  return {
    plan: limits.plan,
    subscription: limits.subscription,
    usage: limits.usage,
    withinLimits: limits.withinLimits,
    canAddBranch: limits.canAddBranch,
    canAddTable: limits.canAddTable,
    canAddMenuItem: limits.canAddMenuItem,
    canAddUser: limits.canAddUser,
    canCreateOrder: limits.canCreateOrder,
    canAddCustomer: limits.canAddCustomer,
    canAddCoupon: limits.canAddCoupon,
    canAddInventoryItem: limits.canAddInventoryItem,
  };
}
