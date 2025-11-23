import type { IStorage } from "./storage";

export class PlanLimitError extends Error {
  constructor(
    message: string,
    public readonly limitType: 'users' | 'branches' | 'tables' | 'menuItems' | 'orders',
    public readonly current: number,
    public readonly max: number
  ) {
    super(message);
    this.name = 'PlanLimitError';
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
  };
}
