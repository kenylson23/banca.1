// Blueprint: javascript_database - Database storage implementation
import {
  users,
  restaurants,
  branches,
  tables,
  tableSessions,
  tablePayments,
  financialShifts,
  financialEvents,
  orderAdjustments,
  paymentEvents,
  reportAggregations,
  categories,
  menuItems,
  orders,
  orderItems,
  messages,
  menuVisits,
  customerReviews,
  optionGroups,
  options,
  orderItemOptions,
  cashRegisters,
  cashRegisterShifts,
  financialCategories,
  financialTransactions,
  expenses,
  inventoryCategories,
  measurementUnits,
  inventoryItems,
  branchStock,
  stockMovements,
  recipeIngredients,
  customers,
  loyaltyPrograms,
  loyaltyTransactions,
  coupons,
  couponUsages,
  type User,
  type InsertUser,
  type Restaurant,
  type InsertRestaurant,
  type UpdateRestaurantAppearance,
  type Branch,
  type InsertBranch,
  type UpdateBranch,
  type Table,
  type InsertTable,
  type TableSession,
  type InsertTableSession,
  type TablePayment,
  type InsertTablePayment,
  type FinancialShift,
  type InsertFinancialShift,
  type FinancialEvent,
  type InsertFinancialEvent,
  type OrderAdjustment,
  type InsertOrderAdjustment,
  type PaymentEvent,
  type InsertPaymentEvent,
  type ReportAggregation,
  type InsertReportAggregation,
  type Category,
  type InsertCategory,
  type UpdateCategory,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type PublicOrderItem,
  type Message,
  type InsertMessage,
  type MenuVisit,
  type InsertMenuVisit,
  type CustomerReview,
  type InsertCustomerReview,
  type OptionGroup,
  type InsertOptionGroup,
  type UpdateOptionGroup,
  type Option,
  type InsertOption,
  type UpdateOption,
  type OrderItemOption,
  type InsertOrderItemOption,
  type CashRegister,
  type InsertCashRegister,
  type UpdateCashRegister,
  type CashRegisterShift,
  type InsertCashRegisterShift,
  type CloseCashRegisterShift,
  type FinancialCategory,
  type InsertFinancialCategory,
  type FinancialTransaction,
  type InsertFinancialTransaction,
  type Expense,
  type InsertExpense,
  type UpdateExpense,
  type InventoryCategory,
  type InsertInventoryCategory,
  type UpdateInventoryCategory,
  type MeasurementUnit,
  type InsertMeasurementUnit,
  type UpdateMeasurementUnit,
  type InventoryItem,
  type InsertInventoryItem,
  type UpdateInventoryItem,
  type BranchStock,
  type StockMovement,
  type InsertStockMovement,
  type RecipeIngredient,
  type InsertRecipeIngredient,
  type UpdateRecipeIngredient,
  type Customer,
  type InsertCustomer,
  type UpdateCustomer,
  type LoyaltyProgram,
  type InsertLoyaltyProgram,
  type UpdateLoyaltyProgram,
  type LoyaltyTransaction,
  type InsertLoyaltyTransaction,
  type Coupon,
  type InsertCoupon,
  type UpdateCoupon,
  type CouponUsage,
  type InsertCouponUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, or, isNull, inArray, ne } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { alias } from "drizzle-orm/pg-core";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface IStorage {
  // Restaurant operations
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantById(id: string): Promise<Restaurant | undefined>;
  getRestaurantByEmail(email: string): Promise<Restaurant | undefined>;
  getRestaurantBySlug(slug: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant & { password: string }): Promise<{ restaurant: Restaurant; adminUser: User }>;
  updateRestaurantStatus(id: string, status: 'pendente' | 'ativo' | 'suspenso'): Promise<Restaurant>;
  updateRestaurantSlug(restaurantId: string, slug: string): Promise<Restaurant>;
  updateRestaurantAppearance(restaurantId: string, data: UpdateRestaurantAppearance): Promise<Restaurant>;
  deleteRestaurant(id: string): Promise<void>;
  
  // Branch operations
  getBranches(restaurantId: string): Promise<Branch[]>;
  getBranchById(id: string): Promise<Branch | undefined>;
  createBranch(restaurantId: string, branch: InsertBranch): Promise<Branch>;
  updateBranch(restaurantId: string, id: string, data: UpdateBranch): Promise<Branch>;
  deleteBranch(restaurantId: string, id: string): Promise<void>;
  ensureMainBranch(restaurantId: string): Promise<Branch>;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(restaurantId: string | null): Promise<User[]>;
  deleteUser(restaurantId: string | null, id: string): Promise<void>;
  updateUser(restaurantId: string | null, id: string, data: { email?: string; firstName?: string; lastName?: string; role?: 'superadmin' | 'admin' | 'kitchen' }): Promise<User>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<User>;
  updateUserActiveBranch(userId: string, branchId: string | null): Promise<User>;

  // Table operations
  getTables(restaurantId: string, branchId?: string | null): Promise<Table[]>;
  getTableById(id: string): Promise<Table | undefined>;
  getTableByNumber(tableNumber: number): Promise<Table | undefined>;
  createTable(restaurantId: string, branchId: string | null, table: { number: number; qrCode: string; capacity?: number; area?: string }): Promise<Table>;
  deleteTable(restaurantId: string, id: string): Promise<void>;
  updateTableOccupancy(restaurantId: string, id: string, isOccupied: boolean): Promise<void>;

  // Category operations
  getCategories(restaurantId: string, branchId?: string | null): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(restaurantId: string, branchId: string | null, category: Omit<InsertCategory, 'restaurantId'>): Promise<Category>;
  updateCategory(restaurantId: string, id: string, data: UpdateCategory): Promise<Category>;
  deleteCategory(restaurantId: string, id: string): Promise<void>;

  // Menu item operations
  getMenuItems(restaurantId: string, branchId?: string | null): Promise<Array<MenuItem & { category: Category }>>;
  getMenuItemById(id: string): Promise<MenuItem | undefined>;
  createMenuItem(restaurantId: string, branchId: string | null, item: Omit<InsertMenuItem, 'restaurantId'>): Promise<MenuItem>;
  updateMenuItem(restaurantId: string, id: string, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(restaurantId: string, id: string): Promise<void>;
  reorderCategories(restaurantId: string, orderedIds: string[]): Promise<void>;
  reorderMenuItems(restaurantId: string, categoryId: string, orderedIds: string[]): Promise<void>;

  // Order operations
  getKitchenOrders(restaurantId: string, branchId?: string | null): Promise<Array<Order & { customer: Customer | null; table: Table | null; orderItems: Array<OrderItem & { menuItem: MenuItem; options?: OrderItemOption[] }> }>>;
  getRecentOrders(restaurantId: string, branchId: string | null, limit: number): Promise<Array<Order & { customer: Customer | null; table: { number: number } | null }>>;
  getOrdersByTableId(restaurantId: string, tableId: string): Promise<Array<Order & { orderItems: Array<OrderItem & { menuItem: MenuItem }> }>>;
  searchOrders(restaurantId: string, searchTerm: string): Promise<Array<Order & { table: Table | null; orderItems: Array<OrderItem & { menuItem: MenuItem }> }>>;
  createOrder(order: InsertOrder, items: PublicOrderItem[]): Promise<Order>;
  updateOrderStatus(restaurantId: string, id: string, status: string, userId?: string): Promise<Order>;
  deleteOrder(restaurantId: string, id: string): Promise<void>;
  
  // Checkout operations
  getOrderById(restaurantId: string, id: string): Promise<Order & { customer: Customer | null; table: Table | null; orderItems: Array<OrderItem & { menuItem: MenuItem; options?: OrderItemOption[] }> } | undefined>;
  updateOrderMetadata(restaurantId: string, id: string, data: {
    orderTitle?: string;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    orderNotes?: string;
  }): Promise<Order>;
  addOrderItem(restaurantId: string, orderId: string, item: PublicOrderItem): Promise<OrderItem>;
  updateOrderItemQuantity(restaurantId: string, orderId: string, itemId: string, quantity: number): Promise<OrderItem>;
  removeOrderItem(restaurantId: string, orderId: string, itemId: string): Promise<void>;
  applyDiscount(restaurantId: string, orderId: string, discount: string, discountType: 'valor' | 'percentual'): Promise<Order>;
  applyServiceCharge(restaurantId: string, orderId: string, serviceCharge: string, serviceName?: string): Promise<Order>;
  applyDeliveryFee(restaurantId: string, orderId: string, deliveryFee: string): Promise<Order>;
  applyPackagingFee(restaurantId: string, orderId: string, packagingFee: string): Promise<Order>;
  recordPayment(restaurantId: string, orderId: string, data: {
    amount: string;
    paymentMethod: 'dinheiro' | 'multicaixa' | 'transferencia' | 'cartao';
    receivedAmount?: string;
  }, userId?: string): Promise<Order>;
  calculateOrderTotal(orderId: string): Promise<Order>;
  cancelOrder(restaurantId: string, orderId: string, cancellationReason: string, userId?: string): Promise<Order>;
  
  // Stats operations
  getTodayStats(restaurantId: string, branchId?: string | null): Promise<{
    todaySales: string;
    todayOrders: number;
    activeTables: number;
    yesterdaySales: string;
    yesterdayOrders: number;
    salesChange: number;
    ordersChange: number;
    cancelledOrders: number;
    cancelledRevenue: string;
    cancellationRate: number;
    topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }>;
  }>;
  
  getCustomDateRangeStats(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    totalSales: string;
    totalOrders: number;
    averageOrderValue: string;
    cancelledOrders: number;
    cancelledRevenue: string;
    cancellationRate: number;
    topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }>;
    periodStart: Date;
    periodEnd: Date;
  }>;
  
  getHistoricalStats(restaurantId: string, branchId: string | null, days: number): Promise<Array<{
    date: string;
    sales: number;
    orders: number;
  }>>;
  
  getKitchenStats(restaurantId: string, branchId: string | null, period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'): Promise<{
    totalOrders: number;
    totalRevenue: string;
    averageOrderValue: string;
    averageOrdersPerDay: string;
    topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }>;
    periodStart: Date;
    periodEnd: Date;
  }>;
  
  // Super admin stats
  getSuperAdminStats(): Promise<{
    totalRestaurants: number;
    activeRestaurants: number;
    pendingRestaurants: number;
    suspendedRestaurants: number;
    totalRevenue: string;
  }>;
  
  // Reports operations
  getSalesReport(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    totalSales: string;
    totalOrders: number;
    averageTicket: string;
    ordersByType: Array<{ type: string; count: number; revenue: string }>;
    ordersByStatus: Array<{ status: string; count: number }>;
    salesByDay: Array<{ date: string; sales: string; orders: number }>;
  }>;
  
  getOrdersReport(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date, status?: string, orderType?: string): Promise<Array<Order & { 
    table: { number: number } | null;
    orderItems: Array<OrderItem & { menuItem: MenuItem }>;
  }>>;
  
  getProductsReport(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    topProducts: Array<{
      menuItem: MenuItem;
      quantity: number;
      revenue: string;
      ordersCount: number;
    }>;
    productsByCategory: Array<{
      categoryName: string;
      totalRevenue: string;
      itemsCount: number;
    }>;
  }>;
  
  getPerformanceReport(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    averagePrepTime: string;
    completionRate: string;
    peakHours: Array<{ hour: number; orders: number }>;
    topTables: Array<{ tableNumber: number; orders: number; revenue: string }>;
  }>;
  
  // Sales/Vendas operations
  getOrdersForSales(
    restaurantId: string,
    branchId: string | null,
    startDate: Date,
    endDate: Date,
    orderStatus: string,
    paymentStatus: string,
    orderType: string,
    orderBy: string,
    periodFilter?: string
  ): Promise<Array<Order & { tableNumber?: number }>>;
  
  getSalesStats(
    restaurantId: string,
    branchId: string | null,
    startDate: Date,
    endDate: Date,
    orderStatus: string,
    paymentStatus: string,
    orderType: string,
    periodFilter?: string
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageTicket: number;
    paidOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
  }>;
  
  // Message operations
  getMessages(restaurantId: string): Promise<Message[]>;
  getAllMessages(): Promise<Array<Message & { restaurant: Restaurant }>>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message>;
  
  // Option Group operations
  getOptionGroupsByMenuItem(menuItemId: string): Promise<Array<OptionGroup & { options: Option[] }>>;
  getOptionGroupById(id: string): Promise<OptionGroup | undefined>;
  createOptionGroup(menuItemId: string, group: InsertOptionGroup): Promise<OptionGroup>;
  updateOptionGroup(id: string, data: UpdateOptionGroup): Promise<OptionGroup>;
  deleteOptionGroup(id: string): Promise<void>;
  
  // Option operations
  getOptionsByGroupId(groupId: string): Promise<Option[]>;
  getOptionById(id: string): Promise<Option | undefined>;
  createOption(groupId: string, option: InsertOption): Promise<Option>;
  updateOption(id: string, data: UpdateOption): Promise<Option>;
  deleteOption(id: string): Promise<void>;
  
  // Order Item Option operations
  createOrderItemOptions(orderItemId: string, options: InsertOrderItemOption[]): Promise<OrderItemOption[]>;
  getOrderItemOptions(orderItemId: string): Promise<OrderItemOption[]>;
  
  // Financial Shift operations
  getActiveShift(restaurantId: string, branchId: string | null, operatorId: string): Promise<FinancialShift | undefined>;
  getAllShifts(restaurantId: string, branchId: string | null, startDate?: Date, endDate?: Date): Promise<FinancialShift[]>;
  getShiftById(id: string): Promise<FinancialShift | undefined>;
  createShift(restaurantId: string, branchId: string | null, shift: InsertFinancialShift): Promise<FinancialShift>;
  closeShift(id: string, closingBalance: string, notes?: string): Promise<FinancialShift>;
  
  // Financial Event operations
  createFinancialEvent(restaurantId: string, event: Omit<InsertFinancialEvent, 'restaurantId'>): Promise<FinancialEvent>;
  getFinancialEvents(restaurantId: string, branchId: string | null, filters?: {
    sessionId?: string;
    orderId?: string;
    tableId?: string;
    shiftId?: string;
    operatorId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<FinancialEvent[]>;
  
  // Order Adjustment operations
  createOrderAdjustment(restaurantId: string, adjustment: Omit<InsertOrderAdjustment, 'restaurantId'>): Promise<OrderAdjustment>;
  getOrderAdjustments(orderId: string): Promise<OrderAdjustment[]>;
  
  // Payment Event operations
  createPaymentEvent(restaurantId: string, event: Omit<InsertPaymentEvent, 'restaurantId'>): Promise<PaymentEvent>;
  getPaymentEvents(restaurantId: string, filters?: {
    orderId?: string;
    sessionId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PaymentEvent[]>;
  
  // Report Aggregation operations
  createReportAggregation(restaurantId: string, aggregation: Omit<InsertReportAggregation, 'restaurantId'>): Promise<ReportAggregation>;
  getReportAggregations(restaurantId: string, branchId: string | null, periodType: 'daily' | 'weekly' | 'monthly', startDate?: Date, endDate?: Date): Promise<ReportAggregation[]>;
  getLatestAggregation(restaurantId: string, branchId: string | null, periodType: 'daily' | 'weekly' | 'monthly'): Promise<ReportAggregation | undefined>;
  
  // Menu Visit operations
  recordMenuVisit(restaurantId: string, visit: Omit<InsertMenuVisit, 'restaurantId'>): Promise<MenuVisit>;
  getMenuVisitStats(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    totalVisits: number;
    visitsToday: number;
    visitsBySource: Array<{ source: string; count: number }>;
  }>;
  
  // Customer Review operations
  createCustomerReview(restaurantId: string, review: Omit<InsertCustomerReview, 'restaurantId'>): Promise<CustomerReview>;
  getCustomerReviews(restaurantId: string, branchId: string | null, limit?: number): Promise<CustomerReview[]>;
  getAverageRating(restaurantId: string, branchId: string | null): Promise<number>;
  
  // Dashboard Stats
  getDashboardStats(
    restaurantId: string,
    branchId: string | null,
    startDate: Date,
    endDate: Date,
    orderType?: string
  ): Promise<{
    salesByDay: Array<{ date: string; sales: number; orders: number; pdv: number; web: number }>;
    totalOrders: number;
    totalRevenue: number;
    averageTicket: number;
    newCustomers: number;
    averageRating: number;
    totalReviews: number;
    topProducts: Array<{ name: string; quantity: number }>;
  }>;
  
  // Cash Register operations
  getCashRegisters(restaurantId: string, branchId: string | null): Promise<CashRegister[]>;
  getCashRegisterById(id: string, restaurantId: string): Promise<CashRegister | undefined>;
  createCashRegister(restaurantId: string, data: Omit<InsertCashRegister, 'restaurantId'>): Promise<CashRegister>;
  updateCashRegister(id: string, restaurantId: string, data: Partial<InsertCashRegister>): Promise<CashRegister | undefined>;
  deleteCashRegister(id: string, restaurantId: string): Promise<void>;
  
  // Cash Register Shift operations
  getCashRegisterShifts(restaurantId: string, branchId: string | null, filters?: { status?: 'aberto' | 'fechado'; cashRegisterId?: string }): Promise<Array<CashRegisterShift & { cashRegister: CashRegister; openedBy: User }>>;
  getCashRegisterShiftById(id: string): Promise<CashRegisterShift | undefined>;
  getActiveCashRegisterShift(cashRegisterId: string, restaurantId: string): Promise<CashRegisterShift | undefined>;
  openCashRegisterShift(restaurantId: string, userId: string, data: Omit<InsertCashRegisterShift, 'restaurantId' | 'openedByUserId'>): Promise<CashRegisterShift>;
  closeCashRegisterShift(shiftId: string, restaurantId: string, userId: string, data: CloseCashRegisterShift): Promise<CashRegisterShift>;
  
  // Financial Category operations
  getFinancialCategories(restaurantId: string, branchId: string | null, type?: 'receita' | 'despesa'): Promise<FinancialCategory[]>;
  createFinancialCategory(restaurantId: string, data: Omit<InsertFinancialCategory, 'restaurantId'>): Promise<FinancialCategory>;
  deleteFinancialCategory(id: string, restaurantId: string): Promise<{ success: boolean; message?: string }>;
  
  // Financial Transaction operations
  getFinancialTransactions(restaurantId: string, branchId: string | null, filters?: {
    type?: 'receita' | 'despesa' | 'ajuste';
    paymentMethod?: 'dinheiro' | 'multicaixa' | 'transferencia' | 'cartao';
    shiftId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<FinancialTransaction & { category: FinancialCategory; recordedBy: User }>>;
  getFinancialTransactionById(id: string): Promise<FinancialTransaction | undefined>;
  createFinancialTransaction(restaurantId: string, userId: string, data: InsertFinancialTransaction): Promise<FinancialTransaction>;
  
  // Expense operations
  getExpenses(restaurantId: string, branchId: string | null, filters?: {
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<Expense & { category: FinancialCategory; recordedBy: User; transaction?: FinancialTransaction }>>;
  getExpenseById(id: string): Promise<Expense | undefined>;
  createExpense(restaurantId: string, branchId: string | null, userId: string, data: InsertExpense): Promise<Expense>;
  updateExpense(restaurantId: string, id: string, data: UpdateExpense): Promise<Expense>;
  deleteExpense(restaurantId: string, id: string): Promise<void>;
  
  // Financial Reports
  getFinancialReport(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    totalRevenue: string;
    totalExpenses: string;
    totalAdjustments: string;
    netBalance: string;
    revenueByMethod: Array<{ method: string; total: string }>;
    expensesByCategory: Array<{ category: string; total: string }>;
    transactionsByDay: Array<{ date: string; revenue: string; expenses: string }>;
  }>;
  
  // Inventory Category operations
  getInventoryCategories(restaurantId: string): Promise<InventoryCategory[]>;
  createInventoryCategory(restaurantId: string, data: InsertInventoryCategory): Promise<InventoryCategory>;
  updateInventoryCategory(id: string, restaurantId: string, data: UpdateInventoryCategory): Promise<InventoryCategory>;
  deleteInventoryCategory(id: string, restaurantId: string): Promise<void>;
  
  // Measurement Unit operations
  getMeasurementUnits(restaurantId: string): Promise<MeasurementUnit[]>;
  createMeasurementUnit(restaurantId: string, data: InsertMeasurementUnit): Promise<MeasurementUnit>;
  updateMeasurementUnit(id: string, restaurantId: string, data: UpdateMeasurementUnit): Promise<MeasurementUnit>;
  deleteMeasurementUnit(id: string, restaurantId: string): Promise<void>;
  
  // Inventory Item operations
  getInventoryItems(restaurantId: string, filters?: { categoryId?: string; isActive?: number }): Promise<Array<InventoryItem & { category: InventoryCategory | null; unit: MeasurementUnit }>>;
  getInventoryItemById(id: string): Promise<InventoryItem | undefined>;
  createInventoryItem(restaurantId: string, data: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, restaurantId: string, data: UpdateInventoryItem): Promise<InventoryItem>;
  deleteInventoryItem(id: string, restaurantId: string): Promise<void>;
  
  // Branch Stock operations
  getBranchStock(restaurantId: string, branchId: string): Promise<Array<BranchStock & { inventoryItem: InventoryItem & { category: InventoryCategory | null; unit: MeasurementUnit } }>>;
  getStockByItemId(restaurantId: string, branchId: string, inventoryItemId: string): Promise<BranchStock | undefined>;
  updateBranchStock(restaurantId: string, branchId: string, inventoryItemId: string, quantity: string): Promise<BranchStock>;
  
  // Stock Movement operations
  getStockMovements(restaurantId: string, branchId: string, filters?: {
    inventoryItemId?: string;
    movementType?: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<StockMovement & { inventoryItem: InventoryItem; recordedBy: User }>>;
  createStockMovement(restaurantId: string, userId: string, data: InsertStockMovement): Promise<StockMovement>;
  
  // Inventory Stats
  getInventoryStats(restaurantId: string, branchId: string): Promise<{
    totalValue: string;
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
  }>;
  
  // Recipe Ingredients operations
  getRecipeIngredients(restaurantId: string, menuItemId: string): Promise<Array<RecipeIngredient & { inventoryItem: InventoryItem & { unit: MeasurementUnit } }>>;
  addRecipeIngredient(restaurantId: string, data: InsertRecipeIngredient): Promise<RecipeIngredient>;
  updateRecipeIngredient(id: string, restaurantId: string, data: UpdateRecipeIngredient): Promise<RecipeIngredient>;
  deleteRecipeIngredient(id: string, restaurantId: string): Promise<void>;
  getMenuItemRecipeCost(restaurantId: string, menuItemId: string): Promise<string>;
  checkStockAvailability(restaurantId: string, branchId: string, menuItemId: string, quantity: number): Promise<{ available: boolean; missingItems: Array<{ itemName: string; required: string; available: string }> }>;
  deductStockForOrder(restaurantId: string, branchId: string, orderId: string, userId: string, tx?: PgTransaction<any, any, any>): Promise<void>;
  restoreStockForOrder(restaurantId: string, branchId: string, order: Order, userId: string, tx: PgTransaction<any, any, any>): Promise<void>;
  
  // Customer operations
  getCustomers(restaurantId: string, branchId?: string | null, filters?: { search?: string; isActive?: number }): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(restaurantId: string, phone: string): Promise<Customer | undefined>;
  getCustomerByCpf(restaurantId: string, cpf: string): Promise<Customer | undefined>;
  createCustomer(restaurantId: string, branchId: string | null, data: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, restaurantId: string, data: UpdateCustomer): Promise<Customer>;
  deleteCustomer(id: string, restaurantId: string): Promise<void>;
  updateCustomerTier(customerId: string, restaurantId: string): Promise<Customer>;
  getCustomerStats(restaurantId: string, branchId: string | null): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    newThisMonth: number;
    topCustomers: Array<Customer & { orderCount: number }>;
  }>;
  
  // Loyalty Program operations
  getLoyaltyProgram(restaurantId: string): Promise<LoyaltyProgram | undefined>;
  createOrUpdateLoyaltyProgram(restaurantId: string, data: InsertLoyaltyProgram): Promise<LoyaltyProgram>;
  
  // Loyalty Transaction operations
  getLoyaltyTransactions(restaurantId: string, customerId?: string, filters?: { startDate?: Date; endDate?: Date }): Promise<Array<LoyaltyTransaction & { customer: Customer }>>;
  createLoyaltyTransaction(restaurantId: string, data: InsertLoyaltyTransaction): Promise<LoyaltyTransaction>;
  calculateLoyaltyPoints(restaurantId: string, orderValue: number): Promise<number>;
  redeemLoyaltyPoints(restaurantId: string, customerId: string, points: number, orderId?: string, userId?: string): Promise<{ transaction: LoyaltyTransaction; discountAmount: number }>;
  redeemLoyaltyPointsForOrder(restaurantId: string, customerId: string, points: number, orderId: string, userId: string): Promise<{ order: Order; transaction: LoyaltyTransaction; discountAmount: number }>;
  getLoyaltyStats(restaurantId: string): Promise<{
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    activeCustomers: number;
    tierDistribution: { bronze: number; prata: number; ouro: number; platina: number };
  }>;
  
  // Coupon operations
  getCoupons(restaurantId: string, branchId?: string | null, filters?: { isActive?: number; code?: string }): Promise<Coupon[]>;
  getCouponById(id: string): Promise<Coupon | undefined>;
  getCouponByCode(restaurantId: string, code: string): Promise<Coupon | undefined>;
  createCoupon(restaurantId: string, branchId: string | null, data: InsertCoupon, userId?: string): Promise<Coupon>;
  updateCoupon(id: string, restaurantId: string, data: UpdateCoupon): Promise<Coupon>;
  deleteCoupon(id: string, restaurantId: string): Promise<void>;
  validateCoupon(restaurantId: string, code: string, orderValue: number, orderType?: string, customerId?: string): Promise<{ valid: boolean; message?: string; coupon?: Coupon; discountAmount?: number }>;
  applyCoupon(restaurantId: string, couponId: string, orderId: string, customerId?: string, discountApplied?: number): Promise<CouponUsage>;
  
  // Coupon Usage operations
  getCouponUsages(restaurantId: string, filters?: { couponId?: string; customerId?: string; startDate?: Date; endDate?: Date }): Promise<Array<CouponUsage & { coupon: Coupon; customer?: Customer; order?: Order }>>;
  getCouponStats(restaurantId: string, branchId: string | null): Promise<{
    totalCoupons: number;
    activeCoupons: number;
    totalUsages: number;
    totalDiscount: string;
    topCoupons: Array<{ coupon: Coupon; usageCount: number; totalDiscount: string }>;
  }>;
  
  // Order-Customer-Coupon-Loyalty integration
  linkCustomerToOrder(restaurantId: string, orderId: string, customerId: string): Promise<Order>;
  applyCouponToOrder(restaurantId: string, orderId: string, couponId: string, discountAmount: number): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  // Restaurant operations
  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).orderBy(restaurants.createdAt);
  }

  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async getRestaurantByEmail(email: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.email, email));
    return restaurant;
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
    return restaurant;
  }

  async updateRestaurantSlug(restaurantId: string, slug: string): Promise<Restaurant> {
    const [updated] = await db
      .update(restaurants)
      .set({ slug, updatedAt: new Date() })
      .where(eq(restaurants.id, restaurantId))
      .returning();
    return updated;
  }

  async updateRestaurantAppearance(restaurantId: string, data: UpdateRestaurantAppearance): Promise<Restaurant> {
    const [updated] = await db
      .update(restaurants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(restaurants.id, restaurantId))
      .returning();
    return updated;
  }

  async createRestaurant(data: InsertRestaurant & { password: string }): Promise<{ restaurant: Restaurant; adminUser: User }> {
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    let slug = generateSlug(data.name);
    let counter = 1;
    
    while (await this.getRestaurantBySlug(slug)) {
      slug = `${generateSlug(data.name)}-${counter}`;
      counter++;
    }
    
    const [restaurant] = await db.insert(restaurants).values({
      name: data.name,
      slug,
      email: data.email,
      phone: data.phone,
      address: data.address,
      logoUrl: data.logoUrl,
      businessHours: data.businessHours,
      description: data.description,
    }).returning();

    // Create main branch automatically
    const mainBranch = await this.createBranch(restaurant.id, {
      name: `${restaurant.name} - Matriz`,
      address: data.address,
      phone: data.phone,
      isActive: 1,
      isMain: 1,
    });

    const [adminUser] = await db.insert(users).values({
      restaurantId: restaurant.id,
      activeBranchId: mainBranch.id,
      email: data.email,
      password: hashedPassword,
      firstName: data.name,
      role: 'admin',
    }).returning();

    return { restaurant, adminUser };
  }

  async updateRestaurantStatus(id: string, status: 'pendente' | 'ativo' | 'suspenso'): Promise<Restaurant> {
    const [updated] = await db
      .update(restaurants)
      .set({ status, updatedAt: new Date() })
      .where(eq(restaurants.id, id))
      .returning();
    return updated;
  }

  async deleteRestaurant(id: string): Promise<void> {
    await db.delete(restaurants).where(eq(restaurants.id, id));
  }

  // Branch operations
  async getBranches(restaurantId: string): Promise<Branch[]> {
    return await db.select().from(branches)
      .where(eq(branches.restaurantId, restaurantId))
      .orderBy(desc(branches.isMain), branches.createdAt);
  }

  async getBranchById(id: string): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch;
  }

  async createBranch(restaurantId: string, data: InsertBranch): Promise<Branch> {
    const [branch] = await db.insert(branches).values({
      restaurantId,
      name: data.name,
      address: data.address,
      phone: data.phone,
      isActive: data.isActive ?? 1,
      isMain: data.isMain ?? 0,
    }).returning();
    return branch;
  }

  async updateBranch(restaurantId: string, id: string, data: UpdateBranch): Promise<Branch> {
    const existing = await this.getBranchById(id);
    if (!existing) {
      throw new Error('Branch not found');
    }
    if (existing.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: Branch does not belong to your restaurant');
    }

    const [updated] = await db
      .update(branches)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();
    return updated;
  }

  async deleteBranch(restaurantId: string, id: string): Promise<void> {
    const existing = await this.getBranchById(id);
    if (!existing) {
      throw new Error('Branch not found');
    }
    if (existing.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: Branch does not belong to your restaurant');
    }
    if (existing.isMain === 1) {
      throw new Error('Cannot delete main branch');
    }

    await db.delete(branches).where(eq(branches.id, id));
  }

  async ensureMainBranch(restaurantId: string): Promise<Branch> {
    const existingBranches = await this.getBranches(restaurantId);
    const mainBranch = existingBranches.find(b => b.isMain === 1);
    
    if (mainBranch) {
      return mainBranch;
    }

    const restaurant = await this.getRestaurantById(restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    return await this.createBranch(restaurantId, {
      name: `${restaurant.name} - Matriz`,
      address: restaurant.address || undefined,
      phone: restaurant.phone || undefined,
      isActive: 1,
      isMain: 1,
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    await this.ensureTables();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.ensureTables();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    await this.ensureTables();
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getAllUsers(restaurantId: string | null): Promise<User[]> {
    await this.ensureTables();
    // restaurantId === null means superadmin requesting all users
    // restaurantId === string means restaurant admin requesting their users only
    if (restaurantId === null) {
      return await db.select().from(users).orderBy(users.createdAt);
    }
    return await db.select().from(users).where(eq(users.restaurantId, restaurantId)).orderBy(users.createdAt);
  }

  async deleteUser(restaurantId: string | null, id: string): Promise<void> {
    // Verify the user belongs to the restaurant before deleting
    const existing = await this.getUser(id);
    if (!existing) {
      throw new Error('User not found');
    }
    
    // restaurantId === null means superadmin can delete any user
    if (restaurantId !== null && existing.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: User does not belong to your restaurant');
    }
    
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUser(restaurantId: string | null, id: string, data: { email?: string; firstName?: string; lastName?: string; role?: 'superadmin' | 'admin' | 'kitchen' }): Promise<User> {
    // Verify the user belongs to the restaurant before updating
    const existing = await this.getUser(id);
    if (!existing) {
      throw new Error('User not found');
    }
    
    // restaurantId === null means superadmin can update any user
    if (restaurantId !== null) {
      if (existing.restaurantId !== restaurantId) {
        throw new Error('Unauthorized: User does not belong to your restaurant');
      }
      // Restaurant admins cannot promote users to superadmin
      if (data.role === 'superadmin') {
        throw new Error('Unauthorized: Cannot promote users to superadmin');
      }
    }
    
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<User> {
    // Password updates are for the user themselves, no restaurant check needed
    // The route layer should ensure users can only update their own password
    const [updated] = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updateUserActiveBranch(userId: string, branchId: string | null): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ activeBranchId: branchId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  private async ensureTables() {
    const { ensureTablesExist } = await import('./initDb');
    await ensureTablesExist();
  }

  // Table operations
  async getTables(restaurantId: string, branchId?: string | null): Promise<Table[]> {
    if (branchId) {
      // Para mesas, usamos lógica de OVERRIDE:
      // - Primeiro busca todas as mesas compartilhadas (branchId = null)
      // - Depois busca mesas específicas da filial
      // - Remove compartilhadas que foram sobrescritas por específicas
      const sharedTables = await db.select().from(tables)
        .where(and(eq(tables.restaurantId, restaurantId), isNull(tables.branchId)))
        .orderBy(tables.number);
      
      const branchTables = await db.select().from(tables)
        .where(and(eq(tables.restaurantId, restaurantId), eq(tables.branchId, branchId)))
        .orderBy(tables.number);
      
      // Números de mesa que foram sobrescritos pela filial
      const overriddenNumbers = new Set(branchTables.map((t: Table) => t.number));
      
      // Retorna mesas específicas + compartilhadas não sobrescritas
      const result = [
        ...branchTables,
        ...sharedTables.filter((t: Table) => !overriddenNumbers.has(t.number))
      ];
      
      return result.sort((a, b) => a.number - b.number);
    }
    return await db.select().from(tables).where(eq(tables.restaurantId, restaurantId)).orderBy(tables.number);
  }

  async getTableById(id: string): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table;
  }

  async getTableByNumber(tableNumber: number): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.number, tableNumber));
    return table;
  }

  async createTable(restaurantId: string, branchId: string | null, table: { number: number; qrCode: string; capacity?: number; area?: string }): Promise<Table> {
    // Check if a table with the same number already exists in this restaurant/branch
    const conditions = branchId 
      ? and(
          eq(tables.restaurantId, restaurantId),
          eq(tables.branchId, branchId),
          eq(tables.number, table.number)
        )
      : and(
          eq(tables.restaurantId, restaurantId),
          eq(tables.number, table.number)
        );
    
    const [existingTable] = await db.select().from(tables).where(conditions);
    
    if (existingTable) {
      throw new Error(`Já existe uma mesa com o número ${table.number} nesta ${branchId ? 'filial' : 'unidade'}`);
    }

    const [newTable] = await db.insert(tables).values({
      restaurantId,
      branchId,
      number: table.number,
      capacity: table.capacity,
      area: table.area,
      qrCode: table.qrCode,
    }).returning();
    return newTable;
  }

  async deleteTable(restaurantId: string, id: string): Promise<void> {
    // Verify the table belongs to the restaurant before deleting
    const existing = await this.getTableById(id);
    if (!existing) {
      throw new Error('Table not found');
    }
    if (existing.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: Table does not belong to your restaurant');
    }
    
    await db.delete(tables).where(eq(tables.id, id));
  }

  async updateTableOccupancy(restaurantId: string, id: string, isOccupied: boolean): Promise<void> {
    // Verify the table belongs to the restaurant before updating
    const existing = await this.getTableById(id);
    if (!existing) {
      throw new Error('Table not found');
    }
    if (existing.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: Table does not belong to your restaurant');
    }
    
    await db.update(tables)
      .set({ isOccupied: isOccupied ? 1 : 0 })
      .where(eq(tables.id, id));
  }

  async updateTableStatus(restaurantId: string, tableId: string, status: string, data?: { customerName?: string; customerCount?: number }): Promise<Table> {
    const existing = await this.getTableById(tableId);
    if (!existing) {
      throw new Error('Table not found');
    }
    if (existing.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: Table does not belong to your restaurant');
    }

    const updateData: any = {
      status,
      lastActivity: new Date(),
      isOccupied: status !== 'livre' ? 1 : 0,
    };

    if (data?.customerName !== undefined) {
      updateData.customerName = data.customerName;
    }
    if (data?.customerCount !== undefined) {
      updateData.customerCount = data.customerCount;
    }

    const [updated] = await db.update(tables)
      .set(updateData)
      .where(eq(tables.id, tableId))
      .returning();
    
    return updated;
  }

  async getTablesWithOrders(restaurantId: string, branchId?: string | null): Promise<Array<Table & { orders: any[] }>> {
    const allTables = await this.getTables(restaurantId, branchId);
    
    const tablesWithOrders = await Promise.all(
      allTables.map(async (table) => {
        const tableOrders = await db.select()
          .from(orders)
          .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(and(
            eq(orders.tableId, table.id),
            eq(orders.restaurantId, restaurantId),
            or(
              eq(orders.status, 'pendente'),
              eq(orders.status, 'em_preparo'),
              eq(orders.status, 'pronto')
            )
          ))
          .orderBy(desc(orders.createdAt));

        const groupedOrders = tableOrders.reduce((acc: any[], row: any) => {
          const orderId = row.orders.id;
          let order = acc.find((o: any) => o.id === orderId);
          
          if (!order) {
            order = {
              ...row.orders,
              orderItems: [],
            };
            acc.push(order);
          }
          
          if (row.order_items) {
            order.orderItems.push({
              ...row.order_items,
              menuItem: row.menu_items,
            });
          }
          
          return acc;
        }, []);

        return {
          ...table,
          orders: groupedOrders,
        };
      })
    );

    return tablesWithOrders;
  }

  async startTableSession(restaurantId: string, tableId: string, sessionData: { customerName?: string; customerCount?: number }): Promise<any> {
    const table = await this.getTableById(tableId);
    if (!table) {
      throw new Error('Table not found');
    }

    const [session] = await db.insert(tableSessions).values({
      tableId,
      restaurantId,
      customerName: sessionData.customerName,
      customerCount: sessionData.customerCount,
      status: 'ocupada',
    }).returning();

    await db.update(tables)
      .set({
        status: 'ocupada',
        currentSessionId: session.id,
        customerName: sessionData.customerName,
        customerCount: sessionData.customerCount || 0,
        lastActivity: new Date(),
        isOccupied: 1,
      })
      .where(eq(tables.id, tableId));

    return session;
  }

  async endTableSession(restaurantId: string, tableId: string): Promise<void> {
    const table = await this.getTableById(tableId);
    if (!table || !table.currentSessionId) {
      throw new Error('No active session found');
    }

    await db.update(tableSessions)
      .set({
        status: 'encerrada',
        endedAt: new Date(),
      })
      .where(eq(tableSessions.id, table.currentSessionId));

    await db.update(tables)
      .set({
        status: 'livre',
        currentSessionId: null,
        totalAmount: '0',
        customerName: null,
        customerCount: 0,
        lastActivity: new Date(),
        isOccupied: 0,
      })
      .where(eq(tables.id, tableId));
  }

  async addTablePayment(restaurantId: string, payment: any): Promise<any> {
    const table = await this.getTableById(payment.tableId);
    if (!table) {
      throw new Error('Table not found');
    }

    const [newPayment] = await db.insert(tablePayments).values({
      ...payment,
      restaurantId,
    }).returning();

    if (table.currentSessionId) {
      const session = await db.select().from(tableSessions)
        .where(eq(tableSessions.id, table.currentSessionId))
        .limit(1);
      
      if (session.length > 0) {
        const currentPaid = parseFloat(session[0].paidAmount || '0');
        const newPaid = currentPaid + parseFloat(payment.amount);
        
        await db.update(tableSessions)
          .set({ paidAmount: newPaid.toFixed(2) })
          .where(eq(tableSessions.id, table.currentSessionId));
      }
    }

    return newPayment;
  }

  async getTableSessions(restaurantId: string, tableId?: string): Promise<any[]> {
    let query = db.select().from(tableSessions)
      .where(eq(tableSessions.restaurantId, restaurantId));
    
    if (tableId) {
      query = query.where(and(
        eq(tableSessions.restaurantId, restaurantId),
        eq(tableSessions.tableId, tableId)
      ));
    }
    
    return await query.orderBy(desc(tableSessions.startedAt));
  }

  async getTablePayments(restaurantId: string, tableId?: string, sessionId?: string): Promise<any[]> {
    const conditions = [eq(tablePayments.restaurantId, restaurantId)];
    
    if (tableId) {
      conditions.push(eq(tablePayments.tableId, tableId));
    }
    if (sessionId) {
      conditions.push(eq(tablePayments.sessionId, sessionId));
    }
    
    return await db.select().from(tablePayments)
      .where(and(...conditions))
      .orderBy(desc(tablePayments.createdAt));
  }

  async calculateTableTotal(restaurantId: string, tableId: string): Promise<number> {
    const tableOrders = await db.select()
      .from(orders)
      .where(and(
        eq(orders.tableId, tableId),
        eq(orders.restaurantId, restaurantId),
        or(
          eq(orders.status, 'pendente'),
          eq(orders.status, 'em_preparo'),
          eq(orders.status, 'pronto')
        )
      ));

    const total = tableOrders.reduce((sum: number, order: Order) => {
      return sum + parseFloat(order.totalAmount || '0');
    }, 0);

    await db.update(tables)
      .set({ totalAmount: total.toFixed(2) })
      .where(eq(tables.id, tableId));

    if (tableOrders.length > 0) {
      const table = await this.getTableById(tableId);
      if (table?.currentSessionId) {
        await db.update(tableSessions)
          .set({ totalAmount: total.toFixed(2) })
          .where(eq(tableSessions.id, table.currentSessionId));
      }
    }

    return total;
  }

  // Category operations
  async getCategories(restaurantId: string, branchId?: string | null): Promise<Category[]> {
    if (branchId) {
      // Retorna categorias compartilhadas (branchId = null) + categorias específicas da filial
      return await db.select().from(categories)
        .where(
          and(
            eq(categories.restaurantId, restaurantId),
            or(
              isNull(categories.branchId),
              eq(categories.branchId, branchId)
            )
          )
        )
        .orderBy(categories.displayOrder, categories.name);
    }
    // Retorna todas as categorias do restaurante (quando não há filial ativa)
    return await db.select().from(categories).where(eq(categories.restaurantId, restaurantId)).orderBy(categories.displayOrder, categories.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(restaurantId: string, branchId: string | null, category: Omit<InsertCategory, 'restaurantId'>): Promise<Category> {
    const [newCategory] = await db.insert(categories).values({
      restaurantId,
      branchId,
      ...category,
    }).returning();
    return newCategory;
  }

  async updateCategory(restaurantId: string, id: string, data: UpdateCategory): Promise<Category> {
    const existing = await this.getCategoryById(id);
    if (!existing) {
      throw new Error('Category not found');
    }
    if (existing.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: Category does not belong to your restaurant');
    }
    
    const [updated] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(restaurantId: string, id: string): Promise<void> {
    // Verify the category belongs to the restaurant before deleting
    const existing = await this.getCategoryById(id);
    if (!existing) {
      throw new Error('Category not found');
    }
    if (existing.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: Category does not belong to your restaurant');
    }
    
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Menu item operations
  async getMenuItems(restaurantId: string, branchId?: string | null): Promise<Array<MenuItem & { category: Category }>> {
    let results;
    if (branchId) {
      // Retorna itens compartilhados (branchId = null) + itens específicos da filial
      results = await db
        .select()
        .from(menuItems)
        .leftJoin(categories, eq(menuItems.categoryId, categories.id))
        .where(
          and(
            eq(menuItems.restaurantId, restaurantId),
            or(
              isNull(menuItems.branchId),
              eq(menuItems.branchId, branchId)
            )
          )
        )
        .orderBy(categories.displayOrder, categories.name, menuItems.displayOrder, menuItems.name);
    } else {
      results = await db
        .select()
        .from(menuItems)
        .leftJoin(categories, eq(menuItems.categoryId, categories.id))
        .where(eq(menuItems.restaurantId, restaurantId))
        .orderBy(categories.displayOrder, categories.name, menuItems.displayOrder, menuItems.name);
    }

    return results.map((row: { menu_items: MenuItem; categories: Category | null }) => ({
      ...row.menu_items,
      category: row.categories!,
    }));
  }

  async getMenuItemById(id: string): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(restaurantId: string, branchId: string | null, item: Omit<InsertMenuItem, 'restaurantId'>): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values({
      restaurantId,
      branchId,
      ...item,
    }).returning();
    return newItem;
  }

  async updateMenuItem(restaurantId: string, id: string, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    // Verify the item belongs to the restaurant before updating
    const existing = await this.getMenuItemById(id);
    if (!existing) {
      throw new Error('Menu item not found');
    }
    if (existing.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: Menu item does not belong to your restaurant');
    }
    
    const [updated] = await db
      .update(menuItems)
      .set(item)
      .where(eq(menuItems.id, id))
      .returning();
    return updated;
  }

  async deleteMenuItem(restaurantId: string, id: string): Promise<void> {
    // Verify the item belongs to the restaurant before deleting
    const existing = await this.getMenuItemById(id);
    if (!existing) {
      throw new Error('Menu item not found');
    }
    if (existing.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: Menu item does not belong to your restaurant');
    }
    
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  async reorderCategories(restaurantId: string, orderedIds: string[]): Promise<void> {
    // Update displayOrder for each category in the provided order
    for (let i = 0; i < orderedIds.length; i++) {
      const categoryId = orderedIds[i];
      const category = await this.getCategoryById(categoryId);
      if (category && category.restaurantId === restaurantId) {
        await db.update(categories)
          .set({ displayOrder: i })
          .where(eq(categories.id, categoryId));
      }
    }
  }

  async reorderMenuItems(restaurantId: string, categoryId: string, orderedIds: string[]): Promise<void> {
    // Update displayOrder for each menu item in the provided order within a category
    for (let i = 0; i < orderedIds.length; i++) {
      const itemId = orderedIds[i];
      const item = await this.getMenuItemById(itemId);
      if (item && item.restaurantId === restaurantId && item.categoryId === categoryId) {
        await db.update(menuItems)
          .set({ displayOrder: i })
          .where(eq(menuItems.id, itemId));
      }
    }
  }

  // Order operations
  async getKitchenOrders(restaurantId: string, branchId?: string | null): Promise<Array<Order & { customer: Customer | null; table: Table | null; orderItems: Array<OrderItem & { menuItem: MenuItem; options?: OrderItemOption[] }> }>> {
    let allOrders;
    if (branchId) {
      // Busca IDs das mesas da filial usando lógica de override
      const branchTables = await this.getTables(restaurantId, branchId);
      const tableIds = branchTables.map((t: Table) => t.id);
      
      // ISOLAMENTO DE DADOS: Filtra por restaurantId, branchId (específico + compartilhado), e mesas
      const branchCondition = or(eq(orders.branchId, branchId), isNull(orders.branchId));  // Filial OU compartilhado
      const tableCondition = tableIds.length > 0
        ? or(inArray(orders.tableId, tableIds), isNull(orders.tableId))  // Mesas da filial OU delivery/takeout
        : sql`true`;  // Sem mesas, aceita qualquer tableId (já garantido por branchCondition)
      
      allOrders = await db
        .select()
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          branchCondition,  // CRÍTICO: Garante isolamento de filial
          tableCondition
        ))
        .orderBy(desc(orders.createdAt));
    } else {
      allOrders = await db
        .select()
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(eq(orders.restaurantId, restaurantId))
        .orderBy(desc(orders.createdAt));
    }

    const ordersWithItems = await Promise.all(
      allOrders.map(async (orderRow: { orders: Order; customers: Customer | null; tables: Table | null }) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, orderRow.orders.id));

        const itemsWithOptions = await Promise.all(
          items.map(async (item: { order_items: OrderItem; menu_items: MenuItem | null }) => {
            const options = await db
              .select()
              .from(orderItemOptions)
              .where(eq(orderItemOptions.orderItemId, item.order_items.id));
            
            return {
              ...item.order_items,
              menuItem: item.menu_items!,
              options,
            };
          })
        );

        return {
          ...orderRow.orders,
          customer: orderRow.customers,
          table: orderRow.tables,
          orderItems: itemsWithOptions,
        };
      })
    );

    return ordersWithItems;
  }

  async getRecentOrders(restaurantId: string, branchId: string | null, limit: number): Promise<Array<Order & { customer: Customer | null; table: { number: number } | null }>> {
    let results;
    if (branchId) {
      // Busca IDs das mesas da filial usando lógica de override
      const branchTables = await this.getTables(restaurantId, branchId);
      const tableIds = branchTables.map((t: Table) => t.id);
      
      // ISOLAMENTO DE DADOS: Filtra por restaurantId, branchId (específico + compartilhado), e mesas
      const branchCondition = or(eq(orders.branchId, branchId), isNull(orders.branchId));  // Filial OU compartilhado
      const tableCondition = tableIds.length > 0
        ? or(inArray(orders.tableId, tableIds), isNull(orders.tableId))  // Mesas da filial OU delivery/takeout
        : sql`true`;  // Sem mesas, aceita qualquer tableId (já garantido por branchCondition)
      
      results = await db
        .select()
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          branchCondition,  // CRÍTICO: Garante isolamento de filial
          tableCondition
        ))
        .orderBy(desc(orders.createdAt))
        .limit(limit);
    } else {
      results = await db
        .select()
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(eq(orders.restaurantId, restaurantId))
        .orderBy(desc(orders.createdAt))
        .limit(limit);
    }

    return results.map((row: { orders: Order; customers: Customer | null; tables: Table | null }) => ({
      ...row.orders,
      customer: row.customers,
      table: row.tables ? { number: row.tables.number } : null,
    }));
  }

  async getOrdersByTableId(restaurantId: string, tableId: string): Promise<Array<Order & { orderItems: Array<OrderItem & { menuItem: MenuItem }> }>> {
    // Verify the table belongs to the restaurant before querying orders
    const table = await this.getTableById(tableId);
    if (!table) {
      throw new Error('Table not found');
    }
    if (table.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: Table does not belong to your restaurant');
    }
    
    const tableOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.tableId, tableId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      tableOrders.map(async (order: Order) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, order.id));

        const itemsWithOptions = await Promise.all(
          items.map(async (item: { order_items: OrderItem; menu_items: MenuItem | null }) => {
            const options = await db
              .select()
              .from(orderItemOptions)
              .where(eq(orderItemOptions.orderItemId, item.order_items.id));
            
            return {
              ...item.order_items,
              menuItem: item.menu_items!,
              options,
            };
          })
        );

        return {
          ...order,
          orderItems: itemsWithOptions,
        };
      })
    );

    return ordersWithItems;
  }

  async searchOrders(restaurantId: string, searchTerm: string): Promise<Array<Order & { table: Table | null; orderItems: Array<OrderItem & { menuItem: MenuItem }> }>> {
    const trimmedSearch = searchTerm.trim();
    
    const foundOrders = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          or(
            eq(orders.id, trimmedSearch),
            sql`LOWER(${orders.customerName}) LIKE LOWER(${`%${trimmedSearch}%`})`,
            sql`${orders.customerPhone} LIKE ${`%${trimmedSearch}%`}`
          )
        )
      )
      .orderBy(desc(orders.createdAt))
      .limit(20);

    const ordersWithItems = await Promise.all(
      foundOrders.map(async (row: { orders: Order; tables: Table | null }) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, row.orders.id));

        const itemsWithOptions = await Promise.all(
          items.map(async (item: { order_items: OrderItem; menu_items: MenuItem | null }) => {
            const options = await db
              .select()
              .from(orderItemOptions)
              .where(eq(orderItemOptions.orderItemId, item.order_items.id));
            
            return {
              ...item.order_items,
              menuItem: item.menu_items!,
              options,
            };
          })
        );

        return {
          ...row.orders,
          table: row.tables,
          orderItems: itemsWithOptions,
        };
      })
    );

    return ordersWithItems;
  }

  async createOrder(order: InsertOrder, items: PublicOrderItem[]): Promise<Order> {
    let restaurantId: string;
    
    // For table orders, verify the table exists and get its restaurantId
    if (order.orderType === 'mesa' && order.tableId) {
      const table = await this.getTableById(order.tableId);
      if (!table) {
        throw new Error('Table not found');
      }
      restaurantId = table.restaurantId;
    } else {
      // For delivery/takeout orders, get restaurantId from order
      restaurantId = order.restaurantId;
    }
    
    // Verify all menu items belong to the same restaurant
    if (items.length > 0) {
      const itemChecks = await Promise.all(
        items.map(item => this.getMenuItemById(item.menuItemId))
      );
      
      for (const menuItem of itemChecks) {
        if (!menuItem) {
          throw new Error('Menu item not found');
        }
        if (menuItem.restaurantId !== restaurantId) {
          throw new Error('Menu items must belong to the same restaurant');
        }
      }
    }
    
    // Calculate subtotal from items and options
    let subtotal = 0;
    for (const item of items) {
      const itemPrice = parseFloat(item.price) * item.quantity;
      let optionsTotal = 0;
      
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        for (const option of item.selectedOptions) {
          optionsTotal += parseFloat(option.priceAdjustment) * option.quantity;
        }
      }
      
      subtotal += itemPrice + optionsTotal;
    }
    
    // Calculate total with discount, service charge, and delivery fee
    const discount = parseFloat(order.discount || '0');
    const serviceCharge = parseFloat(order.serviceCharge || '0');
    const deliveryFee = parseFloat(order.deliveryFee || '0');
    
    let totalAmount = subtotal;
    
    // Apply discount
    if (order.discountType === 'percentual') {
      totalAmount -= (subtotal * discount / 100);
    } else {
      totalAmount -= discount;
    }
    
    // Add service charge and delivery fee
    totalAmount += serviceCharge + deliveryFee;
    
    // Ensure totalAmount is not negative
    totalAmount = Math.max(0, totalAmount);
    
    const [newOrder] = await db.insert(orders).values({
      ...order,
      subtotal: subtotal.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    }).returning();
    
    if (items.length > 0) {
      for (const item of items) {
        const { selectedOptions, ...itemData } = item;
        
        const [createdItem] = await db.insert(orderItems).values({
          ...itemData,
          orderId: newOrder.id,
        }).returning();
        
        if (selectedOptions && selectedOptions.length > 0) {
          const optionsToInsert = selectedOptions.map(opt => ({
            orderItemId: createdItem.id,
            optionId: opt.optionId,
            optionName: opt.optionName,
            optionGroupName: opt.optionGroupName,
            priceAdjustment: opt.priceAdjustment,
            quantity: opt.quantity,
          }));
          
          await db.insert(orderItemOptions).values(optionsToInsert);
        }
      }
    }

    // Update table occupancy only for table orders
    if (order.orderType === 'mesa' && order.tableId) {
      await this.updateTableOccupancy(restaurantId, order.tableId, true);
    }

    return newOrder;
  }

  async updateOrderStatus(restaurantId: string, id: string, status: string, userId?: string): Promise<Order> {
    // Verify the order belongs to the restaurant before updating
    const [orderData] = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(eq(orders.id, id));
    
    if (!orderData || !orderData.orders) {
      throw new Error('Order not found');
    }
    
    // For table orders, verify via table's restaurantId
    // For delivery/takeout, verify via order's restaurantId
    if (orderData.orders.tableId && orderData.tables) {
      if (orderData.tables.restaurantId !== restaurantId) {
        throw new Error('Unauthorized: Order does not belong to your restaurant');
      }
    } else {
      if (orderData.orders.restaurantId !== restaurantId) {
        throw new Error('Unauthorized: Order does not belong to your restaurant');
      }
    }
    
    const previousStatus = orderData.orders.status;
    
    // Require userId when marking order as served (for stock deduction and audit trail)
    if (status === 'servido' && previousStatus !== 'servido') {
      if (!userId) {
        throw new Error('User ID is required when marking order as served');
      }
      if (!orderData.orders.branchId) {
        throw new Error('Branch ID is required for stock deduction');
      }
    }
    
    const needsStockDeduction = status === 'servido' && previousStatus !== 'servido' && orderData.orders.branchId && userId;
    
    // If we need to deduct stock, wrap both operations in a transaction
    if (needsStockDeduction) {
      return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
        // First, deduct stock (this will fail if insufficient stock)
        await this.deductStockForOrder(restaurantId, orderData.orders.branchId!, id, userId!, tx);
        
        // Only update status if stock deduction succeeded
        const [updated] = await tx
          .update(orders)
          .set({ status: status as any, updatedAt: new Date() })
          .where(eq(orders.id, id))
          .returning();
        
        return updated;
      });
    } else {
      // No stock deduction needed, just update status
      const [updated] = await db
        .update(orders)
        .set({ status: status as any, updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning();
      
      return updated;
    }
  }

  async deleteOrder(restaurantId: string, id: string): Promise<void> {
    const [orderData] = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(eq(orders.id, id));
    
    if (!orderData || !orderData.orders) {
      throw new Error('Order not found');
    }
    
    if (orderData.orders.tableId && orderData.tables) {
      if (orderData.tables.restaurantId !== restaurantId) {
        throw new Error('Unauthorized: Order does not belong to your restaurant');
      }
    } else {
      if (orderData.orders.restaurantId !== restaurantId) {
        throw new Error('Unauthorized: Order does not belong to your restaurant');
      }
    }

    if (orderData.orders.paymentStatus === 'pago') {
      throw new Error('Cannot delete paid orders');
    }

    await db.delete(orderItemOptions).where(
      eq(orderItemOptions.orderItemId, 
        db.select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.orderId, id)) as any
      )
    );

    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    await db.delete(orders).where(eq(orders.id, id));

    if (orderData.orders.tableId) {
      const remainingOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.tableId, orderData.orders.tableId));
      
      if (remainingOrders.length === 0) {
        await this.updateTableOccupancy(restaurantId, orderData.orders.tableId, false);
      }
    }
  }

  async getOrderById(restaurantId: string, id: string): Promise<Order & { customer: Customer | null; table: Table | null; orderItems: Array<OrderItem & { menuItem: MenuItem; options?: OrderItemOption[] }> } | undefined> {
    const [orderData] = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(eq(orders.id, id));
    
    if (!orderData || !orderData.orders) {
      return undefined;
    }
    
    if (orderData.orders.tableId && orderData.tables) {
      if (orderData.tables.restaurantId !== restaurantId) {
        throw new Error('Unauthorized: Order does not belong to your restaurant');
      }
    } else {
      if (orderData.orders.restaurantId !== restaurantId) {
        throw new Error('Unauthorized: Order does not belong to your restaurant');
      }
    }
    
    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, id));

    const itemsWithOptions = await Promise.all(
      items.map(async (item: { order_items: OrderItem; menu_items: MenuItem | null }) => {
        const options = await db
          .select()
          .from(orderItemOptions)
          .where(eq(orderItemOptions.orderItemId, item.order_items.id));
        
        return {
          ...item.order_items,
          menuItem: item.menu_items!,
          options,
        };
      })
    );

    return {
      ...orderData.orders,
      customer: orderData.customers,
      table: orderData.tables,
      orderItems: itemsWithOptions,
    };
  }

  async updateOrderMetadata(restaurantId: string, id: string, data: {
    orderTitle?: string;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    orderNotes?: string;
  }): Promise<Order> {
    const order = await this.getOrderById(restaurantId, id);
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.orderType === 'delivery' && data.deliveryAddress === '') {
      throw new Error('Delivery address is required for delivery orders');
    }
    
    const [updated] = await db
      .update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    
    return updated;
  }

  async addOrderItem(restaurantId: string, orderId: string, item: PublicOrderItem): Promise<OrderItem> {
    return db.transaction(async (tx: PgTransaction<any, any, any>) => {
      const [orderData] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .for('update');
      
      if (!orderData) {
        throw new Error('Order not found');
      }

      const menuItem = await this.getMenuItemById(item.menuItemId);
      if (!menuItem) {
        throw new Error('Menu item not found');
      }
      if (menuItem.restaurantId !== restaurantId) {
        throw new Error('Menu item does not belong to your restaurant');
      }

      const { selectedOptions, ...itemData } = item;
      
      const [createdItem] = await tx.insert(orderItems).values({
        ...itemData,
        orderId,
      }).returning();
      
      if (selectedOptions && selectedOptions.length > 0) {
        const optionsToInsert = selectedOptions.map(opt => ({
          orderItemId: createdItem.id,
          optionId: opt.optionId,
          optionName: opt.optionName,
          optionGroupName: opt.optionGroupName,
          priceAdjustment: opt.priceAdjustment,
          quantity: opt.quantity,
        }));
        
        await tx.insert(orderItemOptions).values(optionsToInsert);
      }

      await this.calculateOrderTotal(orderId);
      
      return createdItem;
    });
  }

  async updateOrderItemQuantity(restaurantId: string, orderId: string, itemId: string, quantity: number): Promise<OrderItem> {
    return db.transaction(async (tx: PgTransaction<any, any, any>) => {
      const [orderData] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .for('update');
      
      if (!orderData) {
        throw new Error('Order not found');
      }

      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      const [updated] = await tx
        .update(orderItems)
        .set({ quantity })
        .where(and(eq(orderItems.id, itemId), eq(orderItems.orderId, orderId)))
        .returning();
      
      if (!updated) {
        throw new Error('Order item not found');
      }

      await this.calculateOrderTotal(orderId);
      
      return updated;
    });
  }

  async removeOrderItem(restaurantId: string, orderId: string, itemId: string): Promise<void> {
    return db.transaction(async (tx: PgTransaction<any, any, any>) => {
      const [orderData] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .for('update');
      
      if (!orderData) {
        throw new Error('Order not found');
      }

      await tx.delete(orderItems)
        .where(and(eq(orderItems.id, itemId), eq(orderItems.orderId, orderId)));

      const remainingItems = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      if (remainingItems.length === 0 && orderData.orderType === 'mesa' && orderData.tableId) {
        await this.updateTableOccupancy(orderData.restaurantId!, orderData.tableId, false);
      }

      await this.calculateOrderTotal(orderId);
    });
  }

  async applyDiscount(restaurantId: string, orderId: string, discount: string, discountType: 'valor' | 'percentual'): Promise<Order> {
    const order = await this.getOrderById(restaurantId, orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const discountValue = parseFloat(discount);
    if (discountValue < 0) {
      throw new Error('Discount cannot be negative');
    }

    const subtotal = parseFloat(order.subtotal || '0');
    
    if (discountType === 'percentual' && discountValue > 100) {
      throw new Error('Discount percentage cannot exceed 100%');
    }
    
    if (discountType === 'valor' && discountValue > subtotal) {
      throw new Error('Discount value cannot exceed order subtotal');
    }

    const [updated] = await db
      .update(orders)
      .set({ 
        discount: discount,
        discountType,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();

    return this.calculateOrderTotal(orderId);
  }

  async applyServiceCharge(restaurantId: string, orderId: string, serviceCharge: string, serviceName?: string): Promise<Order> {
    const order = await this.getOrderById(restaurantId, orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const chargeValue = parseFloat(serviceCharge);
    if (chargeValue < 0) {
      throw new Error('Service charge cannot be negative');
    }

    const [updated] = await db
      .update(orders)
      .set({ 
        serviceCharge,
        serviceName: serviceName || null,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();

    return this.calculateOrderTotal(orderId);
  }

  async applyDeliveryFee(restaurantId: string, orderId: string, deliveryFee: string): Promise<Order> {
    const order = await this.getOrderById(restaurantId, orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.orderType !== 'delivery') {
      throw new Error('Delivery fee can only be applied to delivery orders');
    }

    const feeValue = parseFloat(deliveryFee);
    if (feeValue < 0) {
      throw new Error('Delivery fee cannot be negative');
    }

    const [updated] = await db
      .update(orders)
      .set({ 
        deliveryFee,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();

    return this.calculateOrderTotal(orderId);
  }

  async applyPackagingFee(restaurantId: string, orderId: string, packagingFee: string): Promise<Order> {
    const order = await this.getOrderById(restaurantId, orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const feeValue = parseFloat(packagingFee);
    if (feeValue < 0) {
      throw new Error('Packaging fee cannot be negative');
    }

    const [updated] = await db
      .update(orders)
      .set({ 
        packagingFee,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();

    return this.calculateOrderTotal(orderId);
  }

  async recordPayment(restaurantId: string, orderId: string, data: {
    amount: string;
    paymentMethod: 'dinheiro' | 'multicaixa' | 'transferencia' | 'cartao';
    receivedAmount?: string;
  }, userId?: string): Promise<Order> {
    const order = await this.getOrderById(restaurantId, orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const paymentAmount = parseFloat(data.amount);
    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    const currentPaid = parseFloat(order.paidAmount || '0');
    const total = parseFloat(order.totalAmount);
    const remainingBalance = total - currentPaid;

    if (paymentAmount > remainingBalance + 0.01) {
      throw new Error(`Payment amount (${paymentAmount.toFixed(2)}) exceeds remaining balance (${remainingBalance.toFixed(2)})`);
    }

    const newPaidAmount = Math.min(currentPaid + paymentAmount, total);

    let changeAmount = 0;
    if (data.receivedAmount) {
      const received = parseFloat(data.receivedAmount);
      if (received >= paymentAmount) {
        changeAmount = received - paymentAmount;
      }
    }

    let paymentStatus: 'nao_pago' | 'parcial' | 'pago' = 'nao_pago';
    const tolerance = 0.01;
    if (newPaidAmount < tolerance) {
      paymentStatus = 'nao_pago';
    } else if (newPaidAmount < total - tolerance) {
      paymentStatus = 'parcial';
    } else {
      paymentStatus = 'pago';
    }

    return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
      // Lock the order row to prevent concurrent payment processing
      const [lockedOrder] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .for('update');

      if (!lockedOrder) {
        throw new Error('Order not found');
      }

      const [updated] = await tx
        .update(orders)
        .set({ 
          paidAmount: newPaidAmount.toFixed(2),
          changeAmount: Math.max(0, changeAmount).toFixed(2),
          paymentStatus,
          paymentMethod: data.paymentMethod,
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId))
        .returning();

      if (userId) {
        const saleCategoryResults = await tx
          .select()
          .from(financialCategories)
          .where(and(
            eq(financialCategories.restaurantId, restaurantId),
            eq(financialCategories.type, 'receita'),
            eq(financialCategories.name, 'Vendas PDV')
          ))
          .limit(1);

        let categoryId = saleCategoryResults[0]?.id;

        if (!categoryId) {
          const [category] = await tx
            .insert(financialCategories)
            .values({
              restaurantId,
              branchId: order.branchId || null,
              type: 'receita',
              name: 'Vendas PDV',
              description: 'Receita de vendas através do PDV',
              isDefault: 1,
            })
            .returning();
          categoryId = category.id;
        }

        let cashRegisterId: string | null = null;
        let shiftId: string | null = null;

        if (data.paymentMethod === 'dinheiro') {
          const activeCashRegisters = await this.getCashRegistersWithActiveShift(restaurantId, order.branchId || null);
          
          if (activeCashRegisters.length > 0) {
            const cashRegister = activeCashRegisters[0];
            const activeShift = await this.getActiveCashRegisterShift(cashRegister.id, restaurantId);
            
            if (activeShift && cashRegister) {
              cashRegisterId = cashRegister.id;
              shiftId = activeShift.id;

              await tx
                .update(cashRegisters)
                .set({
                  currentBalance: sql`${cashRegisters.currentBalance} + ${parseFloat(data.amount)}`,
                  updatedAt: new Date(),
                })
                .where(eq(cashRegisters.id, cashRegister.id));
            }
          }
        }

        await tx
          .insert(financialTransactions)
          .values({
            restaurantId,
            recordedByUserId: userId,
            branchId: order.branchId || null,
            cashRegisterId: cashRegisterId,
            shiftId: shiftId,
            categoryId,
            type: 'receita',
            origin: order.orderType === 'pdv' || order.orderType === 'balcao' ? 'pdv' : 'web',
            description: `Venda - Pedido #${orderId.substring(0, 8)}`,
            paymentMethod: data.paymentMethod,
            amount: data.amount,
            referenceOrderId: orderId,
            occurredAt: new Date(),
            note: order.orderNotes || null,
          });
      }

      // Atualizar estatísticas básicas do cliente quando pedido é pago
      // Estatísticas básicas (totalSpent, visitCount, lastVisit) são sempre atualizadas
      // Pontos de fidelidade e tier só são atualizados se houver programa ativo
      if (paymentStatus === 'pago' && updated.customerId) {
        const orderTotal = Number(updated.totalAmount ?? 0);
        
        // Buscar cliente
        const [customer] = await tx
          .select()
          .from(customers)
          .where(eq(customers.id, updated.customerId));

        if (customer) {
          const currentTotalSpent = Number(customer.totalSpent ?? 0);
          const currentVisitCount = Number(customer.visitCount ?? 0);
          
          const newTotalSpent = currentTotalSpent + orderTotal;
          const newVisitCount = currentVisitCount + 1;

          // Preparar atualização básica do cliente (sempre executada)
          const customerUpdate: any = {
            totalSpent: newTotalSpent.toFixed(2),
            visitCount: newVisitCount,
            lastVisit: new Date(),
            updatedAt: new Date(),
          };

          // Buscar programa de fidelidade ativo
          const activeLoyaltyPrograms = await tx
            .select()
            .from(loyaltyPrograms)
            .where(and(
              eq(loyaltyPrograms.restaurantId, restaurantId),
              eq(loyaltyPrograms.isActive, 1)
            ))
            .limit(1);

          let pointsEarned = 0;

          // Se houver programa ativo e os pontos ainda não foram atribuídos
          if (activeLoyaltyPrograms.length > 0 && !lockedOrder.loyaltyPointsEarned) {
            const program = activeLoyaltyPrograms[0];
            
            // Calcular pontos ganhos
            const pointsPerCurrency = Number(program.pointsPerCurrency ?? 1);
            pointsEarned = Math.floor(orderTotal * pointsPerCurrency);
            
            // Verificar se há limite máximo de pontos por pedido
            if (program.maxPointsPerOrder && pointsEarned > program.maxPointsPerOrder) {
              pointsEarned = program.maxPointsPerOrder;
            }

            if (pointsEarned > 0) {
              // Criar transação de fidelidade
              await tx
                .insert(loyaltyTransactions)
                .values({
                  restaurantId,
                  customerId: updated.customerId,
                  orderId: updated.id,
                  type: 'ganho',
                  points: pointsEarned,
                  description: `Pontos ganhos em compra de ${orderTotal.toFixed(2)} Kz`,
                  createdBy: userId || null,
                });

              // Atualizar pontos do cliente
              const currentPoints = Number(customer.loyaltyPoints ?? 0);
              const newPoints = currentPoints + pointsEarned;
              customerUpdate.loyaltyPoints = newPoints;

              // Calcular novo tier baseado no total gasto
              let newTier: 'bronze' | 'prata' | 'ouro' | 'platina' = 'bronze';
              const platinumMin = Number(program.platinumTierMinSpent ?? 50000);
              const goldMin = Number(program.goldTierMinSpent ?? 15000);
              const silverMin = Number(program.silverTierMinSpent ?? 5000);

              if (newTotalSpent >= platinumMin) {
                newTier = 'platina';
              } else if (newTotalSpent >= goldMin) {
                newTier = 'ouro';
              } else if (newTotalSpent >= silverMin) {
                newTier = 'prata';
              }
              customerUpdate.tier = newTier;

              // Atualizar o pedido com os pontos ganhos
              await tx
                .update(orders)
                .set({
                  loyaltyPointsEarned: pointsEarned,
                  updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId));
            }
          }

          // Aplicar atualização do cliente (sempre executada, com ou sem programa de fidelidade)
          await tx
            .update(customers)
            .set(customerUpdate)
            .where(eq(customers.id, updated.customerId));
        }
      }

      return updated;
    });
  }

  async calculateOrderTotal(orderId: string): Promise<Order> {
    const [result] = await db
      .select({
        subtotal: sql<string>`
          COALESCE(
            SUM(
              (${orderItems.price}::numeric + 
                COALESCE(
                  (SELECT SUM(${orderItemOptions.priceAdjustment}::numeric * ${orderItemOptions.quantity})
                   FROM ${orderItemOptions}
                   WHERE ${orderItemOptions.orderItemId} = ${orderItems.id}), 
                  0
                )
              ) * ${orderItems.quantity}
            ), 
            0
          )::text
        `
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const subtotal = parseFloat(result?.subtotal || '0');

    const [currentOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!currentOrder) {
      throw new Error('Order not found');
    }

    let total = subtotal;
    
    if (currentOrder.discountType === 'percentual') {
      const discountPercent = Math.min(parseFloat(currentOrder.discount || '0'), 100);
      const discountAmount = (subtotal * discountPercent) / 100;
      total -= discountAmount;
    } else {
      const discountValue = parseFloat(currentOrder.discount || '0');
      total -= Math.min(discountValue, subtotal);
    }

    total = Math.max(0, total);
    
    total -= parseFloat(currentOrder.couponDiscount || '0');
    total -= parseFloat(currentOrder.loyaltyDiscountAmount || '0');
    
    total = Math.max(0, total);
    
    total += parseFloat(currentOrder.serviceCharge || '0');
    total += parseFloat(currentOrder.deliveryFee || '0');
    total += parseFloat(currentOrder.packagingFee || '0');

    total = Math.round(total * 100) / 100;

    const [updated] = await db
      .update(orders)
      .set({ 
        subtotal: subtotal.toFixed(2),
        totalAmount: total.toFixed(2),
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();

    return updated;
  }

  async cancelOrder(restaurantId: string, orderId: string, cancellationReason: string, userId?: string): Promise<Order> {
    return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
      // 1. Buscar o pedido com lock para evitar concorrência
      const [order] = await tx
        .select()
        .from(orders)
        .where(and(
          eq(orders.id, orderId),
          eq(orders.restaurantId, restaurantId)
        ))
        .for('update');

      if (!order) {
        throw new Error('Pedido não encontrado');
      }

      // Verificar se já está cancelado
      if (order.status === 'cancelado' || (order.cancellationReason && order.cancellationReason !== '')) {
        throw new Error('Pedido já está cancelado');
      }

      // 2. ESTORNAR ESTATÍSTICAS DO CLIENTE
      // Estatísticas básicas (totalSpent, visitCount) são sempre estornadas
      // Pontos de fidelidade e tier só são estornados se houver pontos envolvidos
      if (order.customerId && order.paymentStatus === 'pago') {
        // Buscar o cliente
        const [customer] = await tx
          .select()
          .from(customers)
          .where(eq(customers.id, order.customerId));

        if (customer) {
          const currentTotalSpent = Number(customer.totalSpent ?? 0);
          const currentVisitCount = Number(customer.visitCount ?? 0);
          const orderTotal = Number(order.totalAmount ?? 0);
          
          // Estornar total gasto e visitas (sempre)
          const newTotalSpent = Math.max(0, currentTotalSpent - orderTotal);
          const newVisitCount = Math.max(0, currentVisitCount - 1);

          // Preparar atualização básica do cliente
          const customerUpdate: any = {
            totalSpent: newTotalSpent.toFixed(2),
            visitCount: newVisitCount,
            updatedAt: new Date(),
          };

          // Se houve pontos de fidelidade envolvidos, estornar também
          const pointsEarned = order.loyaltyPointsEarned || 0;
          const pointsRedeemed = order.loyaltyPointsRedeemed || 0;
          
          if (pointsEarned > 0 || pointsRedeemed > 0) {
            const currentPoints = Number(customer.loyaltyPoints ?? 0);
            
            // Calcular ajustes de pontos:
            // - Remover pontos que foram ganhos neste pedido
            // - Devolver pontos que foram resgatados neste pedido
            const pointsAdjustment = -pointsEarned + pointsRedeemed;
            const newPoints = Math.max(0, currentPoints + pointsAdjustment);
            customerUpdate.loyaltyPoints = newPoints;

            // Recalcular tier baseado no novo total gasto
            const loyaltyProgram = await this.getLoyaltyProgram(restaurantId);
            let newTier: 'bronze' | 'prata' | 'ouro' | 'platina' = 'bronze';
            
            if (loyaltyProgram) {
              const platinumMin = Number(loyaltyProgram.platinumTierMinSpent ?? 50000);
              const goldMin = Number(loyaltyProgram.goldTierMinSpent ?? 15000);
              const silverMin = Number(loyaltyProgram.silverTierMinSpent ?? 5000);

              if (newTotalSpent >= platinumMin) {
                newTier = 'platina';
              } else if (newTotalSpent >= goldMin) {
                newTier = 'ouro';
              } else if (newTotalSpent >= silverMin) {
                newTier = 'prata';
              }
            }
            customerUpdate.tier = newTier;

            // Criar transações de fidelidade de estorno
            if (pointsEarned > 0) {
              await tx
                .insert(loyaltyTransactions)
                .values({
                  restaurantId,
                  customerId: order.customerId,
                  orderId: order.id,
                  type: 'ajuste',
                  points: -pointsEarned,
                  description: `Estorno de pontos ganhos - Pedido #${order.id.substring(0, 8)} cancelado: ${cancellationReason}`,
                  createdBy: userId || null,
                });
            }

            if (pointsRedeemed > 0) {
              await tx
                .insert(loyaltyTransactions)
                .values({
                  restaurantId,
                  customerId: order.customerId,
                  orderId: order.id,
                  type: 'ajuste',
                  points: pointsRedeemed,
                  description: `Devolução de pontos resgatados - Pedido #${order.id.substring(0, 8)} cancelado: ${cancellationReason}`,
                  createdBy: userId || null,
                });
            }
          }

          // Aplicar atualização do cliente (sempre executada)
          await tx
            .update(customers)
            .set(customerUpdate)
            .where(eq(customers.id, order.customerId));
        }
      }

      // 3. ESTORNAR PAGAMENTO (se foi pago)
      const paidAmount = parseFloat(order.paidAmount || '0');
      if (paidAmount > 0 && userId) {
        // Buscar categoria de estorno/reembolso
        let refundCategoryResults = await tx
          .select()
          .from(financialCategories)
          .where(and(
            eq(financialCategories.restaurantId, restaurantId),
            eq(financialCategories.type, 'despesa'),
            eq(financialCategories.name, 'Estornos e Reembolsos')
          ))
          .limit(1);

        let refundCategoryId = refundCategoryResults[0]?.id;

        // Se não existe, criar categoria
        if (!refundCategoryId) {
          const [category] = await tx
            .insert(financialCategories)
            .values({
              restaurantId,
              branchId: order.branchId || null,
              type: 'despesa',
              name: 'Estornos e Reembolsos',
              description: 'Estornos de pedidos cancelados',
              isDefault: 0,
            })
            .returning();
          refundCategoryId = category.id;
        }

        // Encontrar caixa ativo se o pagamento foi em dinheiro
        let cashRegisterId: string | null = null;
        let shiftId: string | null = null;

        if (order.paymentMethod === 'dinheiro') {
          const activeCashRegisters = await this.getCashRegistersWithActiveShift(restaurantId, order.branchId || null);
          
          if (activeCashRegisters.length > 0) {
            const cashRegister = activeCashRegisters[0];
            const activeShift = await this.getActiveCashRegisterShift(cashRegister.id, restaurantId);
            
            if (activeShift && cashRegister) {
              cashRegisterId = cashRegister.id;
              shiftId = activeShift.id;

              // Deduzir do saldo do caixa
              await tx
                .update(cashRegisters)
                .set({
                  currentBalance: sql`${cashRegisters.currentBalance} - ${paidAmount}`,
                  updatedAt: new Date(),
                })
                .where(eq(cashRegisters.id, cashRegister.id));
            }
          }
        }

        // Criar transação financeira de estorno
        await tx
          .insert(financialTransactions)
          .values({
            restaurantId,
            recordedByUserId: userId,
            branchId: order.branchId || null,
            cashRegisterId: cashRegisterId,
            shiftId: shiftId,
            categoryId: refundCategoryId,
            type: 'despesa',
            origin: order.orderType === 'pdv' || order.orderType === 'balcao' ? 'pdv' : 'web',
            description: `Estorno - Pedido #${orderId.substring(0, 8)} cancelado: ${cancellationReason}`,
            paymentMethod: order.paymentMethod || 'dinheiro',
            amount: paidAmount.toFixed(2),
            referenceOrderId: orderId,
            occurredAt: new Date(),
            note: `Cancelamento: ${cancellationReason}`,
          });
      }

      // 4. DEVOLVER ESTOQUE (se foi deduzido - pedido estava servido)
      if (order.status === 'servido' && order.branchId && userId) {
        await this.restoreStockForOrder(restaurantId, order.branchId, order, userId, tx);
      }

      // 5. MARCAR PEDIDO COMO CANCELADO
      const [cancelledOrder] = await tx
        .update(orders)
        .set({
          status: 'cancelado',
          cancellationReason,
          cancelledAt: new Date(),
          cancelledBy: userId || null,
          refundAmount: paidAmount.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      return cancelledOrder;
    });
  }

  // Stats operations
  async getTodayStats(restaurantId: string, branchId?: string | null): Promise<{
    todaySales: string;
    todayOrders: number;
    activeTables: number;
    yesterdaySales: string;
    yesterdayOrders: number;
    salesChange: number;
    ordersChange: number;
    cancelledOrders: number;
    cancelledRevenue: string;
    cancellationRate: number;
    topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's stats (all orders including cancelled) in a single efficient query
    let todayStatsQuery;
    if (branchId) {
      todayStatsQuery = await db
        .select({
          completedOrders: sql<number>`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
          completedRevenue: sql<string>`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
          cancelledOrders: sql<number>`cast(count(*) filter (where ${orders.status} = 'cancelado') as int)`,
          cancelledRevenue: sql<string>`cast(coalesce(sum(case when (${orders.status} = 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
        })
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), isNull(orders.tableId)),
          gte(orders.createdAt, today)
        ));
    } else {
      todayStatsQuery = await db
        .select({
          completedOrders: sql<number>`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
          completedRevenue: sql<string>`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
          cancelledOrders: sql<number>`cast(count(*) filter (where ${orders.status} = 'cancelado') as int)`,
          cancelledRevenue: sql<string>`cast(coalesce(sum(case when (${orders.status} = 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
        })
        .from(orders)
        .where(and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, today)
        ));
    }

    const todayStats = todayStatsQuery[0] || { completedOrders: 0, completedRevenue: '0', cancelledOrders: 0, cancelledRevenue: '0' };
    const todayOrders = todayStats.completedOrders;
    const todaySales = parseFloat(todayStats.completedRevenue) || 0;
    const todayCancelledOrders = todayStats.cancelledOrders;
    const todayCancelledRevenue = parseFloat(todayStats.cancelledRevenue) || 0;

    // Get yesterday's stats for comparison (excluding cancelled orders)
    let yesterdayStatsQuery;
    if (branchId) {
      yesterdayStatsQuery = await db
        .select({
          completedOrders: sql<number>`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
          completedRevenue: sql<string>`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
        })
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), isNull(orders.tableId)),
          gte(orders.createdAt, yesterday),
          sql`${orders.createdAt} < ${today}`
        ));
    } else {
      yesterdayStatsQuery = await db
        .select({
          completedOrders: sql<number>`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
          completedRevenue: sql<string>`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
        })
        .from(orders)
        .where(and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, yesterday),
          sql`${orders.createdAt} < ${today}`
        ));
    }

    const yesterdayStats = yesterdayStatsQuery[0] || { completedOrders: 0, completedRevenue: '0' };
    const yesterdayOrders = yesterdayStats.completedOrders;
    const yesterdaySales = parseFloat(yesterdayStats.completedRevenue) || 0;

    // Calculate percentage changes (ensure numeric values)
    const todaySalesNum = Number(todaySales) || 0;
    const yesterdaySalesNum = Number(yesterdaySales) || 0;
    
    const salesChange = yesterdaySalesNum > 0 
      ? ((todaySalesNum - yesterdaySalesNum) / yesterdaySalesNum) * 100 
      : todaySalesNum > 0 ? 100 : 0;
    
    const ordersChange = yesterdayOrders > 0
      ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
      : todayOrders > 0 ? 100 : 0;

    // Get active tables for this restaurant
    let activeTables;
    if (branchId) {
      activeTables = await db
        .select()
        .from(tables)
        .where(and(
          eq(tables.restaurantId, restaurantId),
          eq(tables.branchId, branchId),
          eq(tables.isOccupied, 1)
        ));
    } else {
      activeTables = await db
        .select()
        .from(tables)
        .where(and(
          eq(tables.restaurantId, restaurantId),
          eq(tables.isOccupied, 1)
        ));
    }

    // Calculate cancellation rate
    const totalOrdersIncludingCancelled = todayOrders + todayCancelledOrders;
    const cancellationRate = totalOrdersIncludingCancelled > 0
      ? (todayCancelledOrders / totalOrdersIncludingCancelled) * 100
      : 0;

    // Get today's order IDs for top dishes (only non-cancelled orders)
    let todayOrderIdsQuery;
    if (branchId) {
      todayOrderIdsQuery = await db
        .select({ id: orders.id })
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), isNull(orders.tableId)),
          sql`${orders.status} IS DISTINCT FROM 'cancelado'`,
          gte(orders.createdAt, today)
        ));
    } else {
      todayOrderIdsQuery = await db
        .select({ id: orders.id })
        .from(orders)
        .where(and(
          eq(orders.restaurantId, restaurantId),
          sql`${orders.status} IS DISTINCT FROM 'cancelado'`,
          gte(orders.createdAt, today)
        ));
    }
    
    const todayOrderIds = todayOrderIdsQuery.map((row: { id: string }) => row.id);
    
    let topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }> = [];

    if (todayOrderIds.length > 0) {
      const dishStats = await db
        .select({
          menuItemId: orderItems.menuItemId,
          count: sql<number>`cast(sum(${orderItems.quantity}) as int)`,
          revenue: sql<string>`cast(sum(${orderItems.quantity} * ${orderItems.price}) as text)`,
        })
        .from(orderItems)
        .where(sql`${orderItems.orderId} = ANY(ARRAY[${sql.join(todayOrderIds.map((id: string) => sql`${id}`), sql`, `)}])`)
        .groupBy(orderItems.menuItemId)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(5);

      topDishes = await Promise.all(
        dishStats.map(async (stat: { menuItemId: string; count: number; revenue: string }) => {
          const item = await this.getMenuItemById(stat.menuItemId);
          return {
            menuItem: item!,
            count: stat.count,
            totalRevenue: parseFloat(stat.revenue).toFixed(2),
          };
        })
      );
    }

    return {
      todaySales: todaySales.toFixed(2),
      todayOrders: todayOrders,
      activeTables: activeTables.length,
      yesterdaySales: yesterdaySales.toFixed(2),
      yesterdayOrders: yesterdayOrders,
      salesChange: isNaN(salesChange) ? 0 : Math.round(salesChange * 10) / 10,
      ordersChange: isNaN(ordersChange) ? 0 : Math.round(ordersChange * 10) / 10,
      cancelledOrders: todayCancelledOrders,
      cancelledRevenue: todayCancelledRevenue.toFixed(2),
      cancellationRate: isNaN(cancellationRate) ? 0 : Math.round(cancellationRate * 10) / 10,
      topDishes,
    };
  }

  async getCustomDateRangeStats(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    totalSales: string;
    totalOrders: number;
    averageOrderValue: string;
    cancelledOrders: number;
    cancelledRevenue: string;
    cancellationRate: number;
    topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }>;
    periodStart: Date;
    periodEnd: Date;
  }> {
    const periodStart = startDate;
    const periodEnd = endDate;

    // Get stats for the date range (all orders including cancelled) in a single efficient query
    let periodStatsQuery;
    if (branchId) {
      periodStatsQuery = await db
        .select({
          completedOrders: sql<number>`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
          completedRevenue: sql<string>`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
          cancelledOrders: sql<number>`cast(count(*) filter (where ${orders.status} = 'cancelado') as int)`,
          cancelledRevenue: sql<string>`cast(coalesce(sum(case when (${orders.status} = 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
        })
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), isNull(orders.tableId)),
          gte(orders.createdAt, periodStart),
          sql`${orders.createdAt} <= ${periodEnd}`
        ));
    } else {
      periodStatsQuery = await db
        .select({
          completedOrders: sql<number>`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
          completedRevenue: sql<string>`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
          cancelledOrders: sql<number>`cast(count(*) filter (where ${orders.status} = 'cancelado') as int)`,
          cancelledRevenue: sql<string>`cast(coalesce(sum(case when (${orders.status} = 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
        })
        .from(orders)
        .where(and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, periodStart),
          sql`${orders.createdAt} <= ${periodEnd}`
        ));
    }

    const periodStats = periodStatsQuery[0] || { completedOrders: 0, completedRevenue: '0', cancelledOrders: 0, cancelledRevenue: '0' };
    const totalOrders = periodStats.completedOrders;
    const totalSales = parseFloat(periodStats.completedRevenue) || 0;
    const periodCancelledOrders = periodStats.cancelledOrders;
    const periodCancelledRevenue = parseFloat(periodStats.cancelledRevenue) || 0;

    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate cancellation rate
    const totalOrdersIncludingCancelled = totalOrders + periodCancelledOrders;
    const cancellationRate = totalOrdersIncludingCancelled > 0
      ? (periodCancelledOrders / totalOrdersIncludingCancelled) * 100
      : 0;

    // Get order IDs for top dishes (only non-cancelled orders)
    let orderIdsQuery;
    if (branchId) {
      orderIdsQuery = await db
        .select({ id: orders.id })
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), isNull(orders.tableId)),
          sql`${orders.status} IS DISTINCT FROM 'cancelado'`,
          gte(orders.createdAt, periodStart),
          sql`${orders.createdAt} <= ${periodEnd}`
        ));
    } else {
      orderIdsQuery = await db
        .select({ id: orders.id })
        .from(orders)
        .where(and(
          eq(orders.restaurantId, restaurantId),
          sql`${orders.status} IS DISTINCT FROM 'cancelado'`,
          gte(orders.createdAt, periodStart),
          sql`${orders.createdAt} <= ${periodEnd}`
        ));
    }

    const orderIds = orderIdsQuery.map((row: { id: string }) => row.id);
    
    let topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }> = [];

    if (orderIds.length > 0) {
      const dishStats = await db
        .select({
          menuItemId: orderItems.menuItemId,
          count: sql<number>`cast(sum(${orderItems.quantity}) as int)`,
          revenue: sql<string>`cast(sum(${orderItems.quantity} * ${orderItems.price}) as text)`,
        })
        .from(orderItems)
        .where(sql`${orderItems.orderId} = ANY(ARRAY[${sql.join(orderIds.map((id: string) => sql`${id}`), sql`, `)}])`)
        .groupBy(orderItems.menuItemId)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(10);

      topDishes = await Promise.all(
        dishStats.map(async (stat: { menuItemId: string; count: number; revenue: string }) => {
          const item = await this.getMenuItemById(stat.menuItemId);
          return {
            menuItem: item!,
            count: stat.count,
            totalRevenue: parseFloat(stat.revenue).toFixed(2),
          };
        })
      );
    }

    return {
      totalSales: totalSales.toFixed(2),
      totalOrders,
      averageOrderValue: averageOrderValue.toFixed(2),
      cancelledOrders: periodCancelledOrders,
      cancelledRevenue: periodCancelledRevenue.toFixed(2),
      cancellationRate: isNaN(cancellationRate) ? 0 : Math.round(cancellationRate * 10) / 10,
      topDishes,
      periodStart,
      periodEnd,
    };
  }

  async getHistoricalStats(restaurantId: string, branchId: string | null, days: number): Promise<Array<{
    date: string;
    sales: number;
    orders: number;
  }>> {
    const result: Array<{ date: string; sales: number; orders: number }> = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(today);
      dayEnd.setDate(dayEnd.getDate() - i);
      dayEnd.setHours(23, 59, 59, 999);

      let dayOrdersData;
      if (branchId) {
        dayOrdersData = await db
          .select()
          .from(orders)
          .leftJoin(tables, eq(orders.tableId, tables.id))
          .where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), isNull(orders.tableId)),
            sql`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, dayStart),
            sql`${orders.createdAt} <= ${dayEnd}`
          ));
      } else {
        dayOrdersData = await db
          .select()
          .from(orders)
          .leftJoin(tables, eq(orders.tableId, tables.id))
          .where(and(
            eq(orders.restaurantId, restaurantId),
            sql`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, dayStart),
            sql`${orders.createdAt} <= ${dayEnd}`
          ));
      }

      const dayOrders = dayOrdersData.map((row: { orders: Order; tables: Table | null }) => row.orders);
      const daySales = dayOrders.reduce(
        (sum: number, order: Order) => sum + parseFloat(order.totalAmount),
        0
      );

      result.push({
        date: dayStart.toLocaleDateString('pt-BR', { weekday: 'short' }),
        sales: daySales,
        orders: dayOrders.length
      });
    }

    return result;
  }

  async getKitchenStats(restaurantId: string, branchId: string | null, period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'): Promise<{
    totalOrders: number;
    totalRevenue: string;
    averageOrderValue: string;
    averageOrdersPerDay: string;
    topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }>;
    periodStart: Date;
    periodEnd: Date;
  }> {
    const periodEnd = new Date();
    periodEnd.setHours(23, 59, 59, 999);
    
    const periodStart = new Date();
    periodStart.setHours(0, 0, 0, 0);

    // Calculate period start based on selected period
    switch (period) {
      case 'daily':
        // Already set to today
        break;
      case 'weekly':
        periodStart.setDate(periodStart.getDate() - 7);
        break;
      case 'monthly':
        periodStart.setMonth(periodStart.getMonth() - 1);
        break;
      case 'quarterly':
        periodStart.setMonth(periodStart.getMonth() - 3);
        break;
      case 'yearly':
        periodStart.setFullYear(periodStart.getFullYear() - 1);
        break;
    }

    // Get orders for the period for this restaurant (excluding cancelled orders)
    let periodOrdersData;
    if (branchId) {
      periodOrdersData = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), isNull(orders.tableId)),
          sql`${orders.status} IS DISTINCT FROM 'cancelado'`,
          gte(orders.createdAt, periodStart),
          sql`${orders.createdAt} <= ${periodEnd}`
        ));
    } else {
      periodOrdersData = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          sql`${orders.status} IS DISTINCT FROM 'cancelado'`,
          gte(orders.createdAt, periodStart),
          sql`${orders.createdAt} <= ${periodEnd}`
        ));
    }

    const periodOrders = periodOrdersData.map((row: { orders: Order; tables: Table | null }) => row.orders);

    const totalOrders = periodOrders.length;
    const totalRevenue = periodOrders.reduce(
      (sum: number, order: Order) => sum + parseFloat(order.totalAmount),
      0
    );

    // Calculate days in period
    const daysInPeriod = Math.max(1, Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)));
    const averageOrdersPerDay = totalOrders / daysInPeriod;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top dishes for the period
    const orderIds = periodOrders.map((o: Order) => o.id);
    
    let topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }> = [];

    if (orderIds.length > 0) {
      const dishStats = await db
        .select({
          menuItemId: orderItems.menuItemId,
          count: sql<number>`cast(sum(${orderItems.quantity}) as int)`,
          revenue: sql<string>`cast(sum(${orderItems.quantity} * ${orderItems.price}) as text)`,
        })
        .from(orderItems)
        .where(sql`${orderItems.orderId} = ANY(ARRAY[${sql.join(orderIds.map((id: string) => sql`${id}`), sql`, `)}])`)
        .groupBy(orderItems.menuItemId)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(10);

      topDishes = await Promise.all(
        dishStats.map(async (stat: { menuItemId: string; count: number; revenue: string }) => {
          const item = await this.getMenuItemById(stat.menuItemId);
          return {
            menuItem: item!,
            count: stat.count,
            totalRevenue: parseFloat(stat.revenue).toFixed(2),
          };
        })
      );
    }

    return {
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      averageOrderValue: averageOrderValue.toFixed(2),
      averageOrdersPerDay: averageOrdersPerDay.toFixed(1),
      topDishes,
      periodStart,
      periodEnd,
    };
  }

  // Super admin stats
  async getSuperAdminStats(): Promise<{
    totalRestaurants: number;
    activeRestaurants: number;
    pendingRestaurants: number;
    suspendedRestaurants: number;
    totalRevenue: string;
  }> {
    const allRestaurants = await this.getRestaurants();
    
    const totalRestaurants = allRestaurants.length;
    const activeRestaurants = allRestaurants.filter(r => r.status === 'ativo').length;
    const pendingRestaurants = allRestaurants.filter(r => r.status === 'pendente').length;
    const suspendedRestaurants = allRestaurants.filter(r => r.status === 'suspenso').length;

    // Calculate total revenue across all restaurants (excluding cancelled orders)
    const allOrders = await db
      .select()
      .from(orders)
      .where(ne(orders.status, 'cancelado'));
    const totalRevenue = allOrders.reduce(
      (sum: number, order: Order) => sum + parseFloat(order.totalAmount),
      0
    );

    return {
      totalRestaurants,
      activeRestaurants,
      pendingRestaurants,
      suspendedRestaurants,
      totalRevenue: totalRevenue.toFixed(2),
    };
  }

  // Reports operations
  async getSalesReport(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    totalSales: string;
    totalOrders: number;
    averageTicket: string;
    ordersByType: Array<{ type: string; count: number; revenue: string }>;
    ordersByStatus: Array<{ status: string; count: number }>;
    salesByDay: Array<{ date: string; sales: string; orders: number }>;
  }> {
    let periodOrders;
    if (branchId) {
      periodOrders = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), sql`${orders.tableId} IS NULL`),
          sql`${orders.status} IS DISTINCT FROM 'cancelado'`,
          gte(orders.createdAt, startDate),
          sql`${orders.createdAt} <= ${endDate}`
        ));
    } else {
      periodOrders = await db
        .select()
        .from(orders)
        .where(and(
          eq(orders.restaurantId, restaurantId),
          sql`${orders.status} IS DISTINCT FROM 'cancelado'`,
          gte(orders.createdAt, startDate),
          sql`${orders.createdAt} <= ${endDate}`
        ));
    }

    const periodOrdersRaw = periodOrders.map((row: any) => row.orders || row);

    const totalOrders = periodOrdersRaw.length;
    const totalSales = periodOrdersRaw.reduce((sum: number, order: Order) => sum + parseFloat(order.totalAmount), 0);
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    const ordersByType = ['mesa', 'delivery', 'takeout'].map(type => {
      const typeOrders = periodOrdersRaw.filter((o: Order) => o.orderType === type);
      const revenue = typeOrders.reduce((sum: number, o: Order) => sum + parseFloat(o.totalAmount), 0);
      return {
        type,
        count: typeOrders.length,
        revenue: revenue.toFixed(2),
      };
    });

    const ordersByStatus = ['pendente', 'em_preparo', 'pronto', 'servido'].map(status => {
      const statusOrders = periodOrdersRaw.filter((o: Order) => o.status === status);
      return {
        status,
        count: statusOrders.length,
      };
    });

    const salesByDayMap = new Map<string, { sales: number; orders: number }>();
    periodOrdersRaw.forEach((order: Order) => {
      const dateKey = order.createdAt!.toISOString().split('T')[0];
      const existing = salesByDayMap.get(dateKey) || { sales: 0, orders: 0 };
      salesByDayMap.set(dateKey, {
        sales: existing.sales + parseFloat(order.totalAmount),
        orders: existing.orders + 1,
      });
    });

    const salesByDay = Array.from(salesByDayMap.entries())
      .map(([date, data]) => ({
        date,
        sales: data.sales.toFixed(2),
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSales: totalSales.toFixed(2),
      totalOrders,
      averageTicket: averageTicket.toFixed(2),
      ordersByType,
      ordersByStatus,
      salesByDay,
    };
  }

  async getCancelledOrdersStats(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    totalCancelled: number;
    totalLostRevenue: string;
    cancelledOrders: Array<Order & {
      table: { number: number } | null;
      orderItems: Array<OrderItem & { menuItem: MenuItem }>;
    }>;
  }> {
    let cancelledOrdersData;
    if (branchId) {
      cancelledOrdersData = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), sql`${orders.tableId} IS NULL`),
          eq(orders.status, 'cancelado'),
          gte(orders.createdAt, startDate),
          sql`${orders.createdAt} <= ${endDate}`
        ))
        .orderBy(desc(orders.createdAt));
    } else {
      cancelledOrdersData = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          eq(orders.status, 'cancelado'),
          gte(orders.createdAt, startDate),
          sql`${orders.createdAt} <= ${endDate}`
        ))
        .orderBy(desc(orders.createdAt));
    }

    const cancelledOrdersRaw = cancelledOrdersData.map((row: any) => row.orders || row);
    const totalCancelled = cancelledOrdersRaw.length;
    const totalLostRevenue = cancelledOrdersRaw.reduce(
      (sum: number, order: Order) => sum + parseFloat(order.totalAmount),
      0
    );

    const cancelledOrders = await Promise.all(
      cancelledOrdersData.map(async (orderRow: { orders: Order; tables: Table | null }) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, orderRow.orders.id));

        return {
          ...orderRow.orders,
          table: orderRow.tables ? { number: orderRow.tables.number } : null,
          orderItems: items.map((item: { order_items: OrderItem; menu_items: MenuItem | null }) => ({
            ...item.order_items,
            menuItem: item.menu_items!,
          })),
        };
      })
    );

    return {
      totalCancelled,
      totalLostRevenue: totalLostRevenue.toFixed(2),
      cancelledOrders,
    };
  }

  async getOrdersReport(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date, status?: string, orderType?: string): Promise<Array<Order & { 
    table: { number: number } | null;
    orderItems: Array<OrderItem & { menuItem: MenuItem }>;
  }>> {
    let baseConditions: any[] = [
      eq(orders.restaurantId, restaurantId),
      gte(orders.createdAt, startDate),
      sql`${orders.createdAt} <= ${endDate}`
    ];

    // Handle status filtering
    if (status === 'cancelado') {
      // Only show cancelled orders when explicitly requested
      baseConditions.push(eq(orders.status, 'cancelado'));
    } else if (status && status !== 'todos') {
      // Show only orders with specific status
      baseConditions.push(eq(orders.status, status as any));
    } else {
      // Default: exclude cancelled orders (when status is 'todos', undefined, or null)
      baseConditions.push(ne(orders.status, 'cancelado'));
    }

    if (orderType && orderType !== 'todos') {
      baseConditions.push(eq(orders.orderType, orderType as any));
    }

    let ordersData;
    if (branchId) {
      ordersData = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          ...baseConditions,
          or(
            and(eq(tables.branchId, branchId), sql`${orders.tableId} IS NOT NULL`),
            sql`${orders.tableId} IS NULL`
          )
        ))
        .orderBy(desc(orders.createdAt));
    } else {
      ordersData = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(...baseConditions))
        .orderBy(desc(orders.createdAt));
    }

    const ordersWithItems = await Promise.all(
      ordersData.map(async (orderRow: { orders: Order; tables: Table | null }) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, orderRow.orders.id));

        return {
          ...orderRow.orders,
          table: orderRow.tables ? { number: orderRow.tables.number } : null,
          orderItems: items.map((item: { order_items: OrderItem; menu_items: MenuItem | null }) => ({
            ...item.order_items,
            menuItem: item.menu_items!,
          })),
        };
      })
    );

    return ordersWithItems;
  }

  async getProductsReport(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    topProducts: Array<{
      menuItem: MenuItem;
      quantity: number;
      revenue: string;
      ordersCount: number;
    }>;
    productsByCategory: Array<{
      categoryName: string;
      totalRevenue: string;
      itemsCount: number;
    }>;
  }> {
    let periodOrdersRaw;
    if (branchId) {
      periodOrdersRaw = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), sql`${orders.tableId} IS NULL`),
          gte(orders.createdAt, startDate),
          sql`${orders.createdAt} <= ${endDate}`
        ));
    } else {
      periodOrdersRaw = await db
        .select()
        .from(orders)
        .where(and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startDate),
          sql`${orders.createdAt} <= ${endDate}`
        ));
    }

    const periodOrders = periodOrdersRaw.map((row: any) => row.orders || row);
    const orderIds = periodOrders.map((o: Order) => o.id);

    let topProducts: Array<{
      menuItem: MenuItem;
      quantity: number;
      revenue: string;
      ordersCount: number;
    }> = [];

    if (orderIds.length > 0) {
      const productStats = await db
        .select({
          menuItemId: orderItems.menuItemId,
          quantity: sql<number>`cast(sum(${orderItems.quantity}) as int)`,
          revenue: sql<string>`cast(sum(${orderItems.quantity} * ${orderItems.price}) as text)`,
          ordersCount: sql<number>`cast(count(distinct ${orderItems.orderId}) as int)`,
        })
        .from(orderItems)
        .where(sql`${orderItems.orderId} = ANY(ARRAY[${sql.join(orderIds.map((id: string) => sql`${id}`), sql`, `)}])`)
        .groupBy(orderItems.menuItemId)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(20);

      topProducts = await Promise.all(
        productStats.map(async (stat: { menuItemId: string; quantity: number; revenue: string; ordersCount: number }) => {
          const item = await this.getMenuItemById(stat.menuItemId);
          return {
            menuItem: item!,
            quantity: stat.quantity,
            revenue: parseFloat(stat.revenue).toFixed(2),
            ordersCount: stat.ordersCount,
          };
        })
      );
    }

    const categoryRevenue = new Map<string, { revenue: number; items: Set<string> }>();
    
    if (orderIds.length > 0) {
      const categoryStats = await db
        .select({
          categoryId: menuItems.categoryId,
          menuItemId: orderItems.menuItemId,
          revenue: sql<string>`cast(sum(${orderItems.quantity} * ${orderItems.price}) as text)`,
        })
        .from(orderItems)
        .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
        .where(sql`${orderItems.orderId} = ANY(ARRAY[${sql.join(orderIds.map((id: string) => sql`${id}`), sql`, `)}])`)
        .groupBy(menuItems.categoryId, orderItems.menuItemId);

      for (const stat of categoryStats) {
        const category = await this.getCategoryById(stat.categoryId);
        if (category) {
          const existing = categoryRevenue.get(category.name) || { revenue: 0, items: new Set() };
          existing.revenue += parseFloat(stat.revenue);
          existing.items.add(stat.menuItemId);
          categoryRevenue.set(category.name, existing);
        }
      }
    }

    const productsByCategory = Array.from(categoryRevenue.entries())
      .map(([categoryName, data]) => ({
        categoryName,
        totalRevenue: data.revenue.toFixed(2),
        itemsCount: data.items.size,
      }))
      .sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue));

    return {
      topProducts,
      productsByCategory,
    };
  }

  async getPerformanceReport(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    averagePrepTime: string;
    completionRate: string;
    peakHours: Array<{ hour: number; orders: number }>;
    topTables: Array<{ tableNumber: number; orders: number; revenue: string }>;
  }> {
    let periodOrdersRaw;
    if (branchId) {
      periodOrdersRaw = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), sql`${orders.tableId} IS NULL`),
          gte(orders.createdAt, startDate),
          sql`${orders.createdAt} <= ${endDate}`
        ));
    } else {
      periodOrdersRaw = await db
        .select()
        .from(orders)
        .where(and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startDate),
          sql`${orders.createdAt} <= ${endDate}`
        ));
    }

    const periodOrders = periodOrdersRaw.map((row: any) => row.orders || row);

    let totalPrepTime = 0;
    let prepTimeCount = 0;
    periodOrders.forEach((order: Order) => {
      if (order.updatedAt && order.createdAt) {
        const prepTime = (order.updatedAt.getTime() - order.createdAt.getTime()) / 1000 / 60;
        totalPrepTime += prepTime;
        prepTimeCount++;
      }
    });
    const averagePrepTime = prepTimeCount > 0 ? totalPrepTime / prepTimeCount : 0;

    const completedOrders = periodOrders.filter((o: Order) => o.status === 'servido').length;
    const completionRate = periodOrders.length > 0 ? (completedOrders / periodOrders.length) * 100 : 0;

    const hourCounts = new Map<number, number>();
    periodOrders.forEach((order: Order) => {
      const hour = order.createdAt!.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const peakHours = Array.from(hourCounts.entries())
      .map(([hour, orders]) => ({ hour, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    const tableStats = new Map<number, { orders: number; revenue: number }>();
    periodOrdersRaw.forEach((row: any) => {
      const order = row.orders || row;
      const table = row.tables || null;
      if (table) {
        const tableNumber = table.number;
        const existing = tableStats.get(tableNumber) || { orders: 0, revenue: 0 };
        existing.orders++;
        existing.revenue += parseFloat(order.totalAmount);
        tableStats.set(tableNumber, existing);
      }
    });
    const topTables = Array.from(tableStats.entries())
      .map(([tableNumber, data]) => ({
        tableNumber,
        orders: data.orders,
        revenue: data.revenue.toFixed(2),
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    return {
      averagePrepTime: averagePrepTime.toFixed(1),
      completionRate: completionRate.toFixed(1),
      peakHours,
      topTables,
    };
  }

  // Sales/Vendas operations
  async getOrdersForSales(
    restaurantId: string,
    branchId: string | null,
    startDate: Date,
    endDate: Date,
    orderStatus: string,
    paymentStatus: string,
    orderType: string,
    orderBy: string,
    periodFilter?: string
  ): Promise<Array<Order & { tableNumber?: number }>> {
    let query = db
      .select({
        order: orders,
        tableNumber: tables.number,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .$dynamic();

    const conditions = [
      eq(orders.restaurantId, restaurantId),
      gte(orders.createdAt, startDate),
      sql`${orders.createdAt} <= ${endDate}`
    ];

    // Apply period filter (time of day) without modifying the date range
    if (periodFilter && periodFilter !== 'all') {
      if (periodFilter === 'morning') {
        conditions.push(sql`EXTRACT(HOUR FROM ${orders.createdAt}) >= 6 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 12`);
      } else if (periodFilter === 'afternoon') {
        conditions.push(sql`EXTRACT(HOUR FROM ${orders.createdAt}) >= 12 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 18`);
      } else if (periodFilter === 'night') {
        conditions.push(sql`EXTRACT(HOUR FROM ${orders.createdAt}) >= 18 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 24`);
      }
    }

    if (branchId) {
      conditions.push(
        or(
          eq(tables.branchId, branchId),
          sql`${orders.tableId} IS NULL`
        ) as any
      );
    }

    if (orderStatus && orderStatus !== 'all') {
      conditions.push(eq(orders.status, orderStatus as any));
    }

    if (paymentStatus && paymentStatus !== 'all') {
      conditions.push(eq(orders.paymentStatus, paymentStatus as any));
    }

    if (orderType && orderType !== 'all') {
      conditions.push(eq(orders.orderType, orderType as any));
    }

    query = query.where(and(...conditions));

    if (orderBy === 'updated') {
      query = query.orderBy(desc(orders.updatedAt));
    } else {
      query = query.orderBy(desc(orders.createdAt));
    }

    const results = await query;

    return results.map((row: any) => ({
      ...row.order,
      tableNumber: row.tableNumber,
    }));
  }

  async getSalesStats(
    restaurantId: string,
    branchId: string | null,
    startDate: Date,
    endDate: Date,
    orderStatus: string,
    paymentStatus: string,
    orderType: string,
    periodFilter?: string
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageTicket: number;
    paidOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    cancelledRevenue: number;
  }> {
    // Build base conditions that apply to both queries
    const baseConditions: any[] = [
      eq(orders.restaurantId, restaurantId),
      gte(orders.createdAt, startDate),
      sql`${orders.createdAt} <= ${endDate}`
    ];

    // Apply period filter (time of day) to base conditions
    if (periodFilter && periodFilter !== 'all') {
      if (periodFilter === 'morning') {
        baseConditions.push(sql`EXTRACT(HOUR FROM ${orders.createdAt}) >= 6 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 12`);
      } else if (periodFilter === 'afternoon') {
        baseConditions.push(sql`EXTRACT(HOUR FROM ${orders.createdAt}) >= 12 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 18`);
      } else if (periodFilter === 'night') {
        baseConditions.push(sql`EXTRACT(HOUR FROM ${orders.createdAt}) >= 18 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 24`);
      }
    }

    if (branchId) {
      baseConditions.push(
        or(
          eq(tables.branchId, branchId),
          sql`${orders.tableId} IS NULL`
        ) as any
      );
    }

    if (orderStatus && orderStatus !== 'all') {
      baseConditions.push(eq(orders.status, orderStatus as any));
    }

    if (paymentStatus && paymentStatus !== 'all') {
      baseConditions.push(eq(orders.paymentStatus, paymentStatus as any));
    }

    if (orderType && orderType !== 'all') {
      baseConditions.push(eq(orders.orderType, orderType as any));
    }

    // Query 1: Get ALL matching orders (including cancelled) for cancelled count
    let allQuery = db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(and(...baseConditions))
      .$dynamic();

    const allResults = await allQuery;
    const allOrders = allResults.map((row: any) => row.orders);

    // Count cancelled orders and calculate lost revenue from the full set
    const cancelledOrdersList = allOrders.filter((o: Order) => o.status === 'cancelado');
    const cancelledOrders = cancelledOrdersList.length;
    const cancelledRevenue = cancelledOrdersList.reduce((sum: number, order: Order) => 
      sum + parseFloat(order.totalAmount), 0
    );

    // Query 2: Get valid (non-cancelled) orders for KPIs
    const validConditions = [
      ...baseConditions,
      // Exclude cancelled orders in the query
      sql`${orders.status} != 'cancelado'` as any
    ];

    let validQuery = db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(and(...validConditions))
      .$dynamic();

    const validResults = await validQuery;
    const validOrders = validResults.map((row: any) => row.orders);

    const totalOrders = validOrders.length;
    const totalRevenue = validOrders.reduce((sum: number, order: Order) => 
      sum + parseFloat(order.totalAmount), 0
    );
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const paidOrders = validOrders.filter((o: Order) => o.paymentStatus === 'pago').length;
    const pendingOrders = validOrders.filter((o: Order) => o.paymentStatus === 'nao_pago').length;

    return {
      totalOrders,
      totalRevenue,
      averageTicket,
      paidOrders,
      pendingOrders,
      cancelledOrders,
      cancelledRevenue,
    };
  }

  // Message operations
  async getMessages(restaurantId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.restaurantId, restaurantId))
      .orderBy(desc(messages.createdAt));
  }

  async getAllMessages(): Promise<Array<Message & { restaurant: Restaurant }>> {
    const results = await db
      .select()
      .from(messages)
      .leftJoin(restaurants, eq(messages.restaurantId, restaurants.id))
      .orderBy(desc(messages.createdAt));

    return results.map((row: { messages: Message; restaurants: Restaurant | null }) => ({
      ...row.messages,
      restaurant: row.restaurants!,
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: string): Promise<Message> {
    const [updated] = await db
      .update(messages)
      .set({ isRead: 1 })
      .where(eq(messages.id, id))
      .returning();
    return updated;
  }

  // Option Group operations
  async getOptionGroupsByMenuItem(menuItemId: string): Promise<Array<OptionGroup & { options: Option[] }>> {
    const groups = await db
      .select()
      .from(optionGroups)
      .where(eq(optionGroups.menuItemId, menuItemId))
      .orderBy(optionGroups.displayOrder, optionGroups.createdAt);

    const result = await Promise.all(
      groups.map(async (group: OptionGroup) => {
        const opts = await this.getOptionsByGroupId(group.id);
        return {
          ...group,
          options: opts,
        };
      })
    );

    return result;
  }

  async getOptionGroupById(id: string): Promise<OptionGroup | undefined> {
    const [group] = await db.select().from(optionGroups).where(eq(optionGroups.id, id));
    return group;
  }

  async createOptionGroup(menuItemId: string, groupData: InsertOptionGroup): Promise<OptionGroup> {
    const [newGroup] = await db
      .insert(optionGroups)
      .values({
        menuItemId,
        ...groupData,
      })
      .returning();
    return newGroup;
  }

  async updateOptionGroup(id: string, data: UpdateOptionGroup): Promise<OptionGroup> {
    const [updated] = await db
      .update(optionGroups)
      .set(data)
      .where(eq(optionGroups.id, id))
      .returning();
    return updated;
  }

  async deleteOptionGroup(id: string): Promise<void> {
    await db.delete(optionGroups).where(eq(optionGroups.id, id));
  }

  // Option operations
  async getOptionsByGroupId(groupId: string): Promise<Option[]> {
    return await db
      .select()
      .from(options)
      .where(eq(options.optionGroupId, groupId))
      .orderBy(options.displayOrder, options.createdAt);
  }

  async getOptionById(id: string): Promise<Option | undefined> {
    const [option] = await db.select().from(options).where(eq(options.id, id));
    return option;
  }

  async createOption(groupId: string, optionData: InsertOption): Promise<Option> {
    const [newOption] = await db
      .insert(options)
      .values({
        optionGroupId: groupId,
        ...optionData,
      })
      .returning();
    return newOption;
  }

  async updateOption(id: string, data: UpdateOption): Promise<Option> {
    const [updated] = await db
      .update(options)
      .set(data)
      .where(eq(options.id, id))
      .returning();
    return updated;
  }

  async deleteOption(id: string): Promise<void> {
    await db.delete(options).where(eq(options.id, id));
  }

  // Order Item Option operations
  async createOrderItemOptions(orderItemId: string, opts: InsertOrderItemOption[]): Promise<OrderItemOption[]> {
    if (opts.length === 0) return [];
    
    const values = opts.map(opt => ({
      ...opt,
      orderItemId,
    }));
    
    const created = await db.insert(orderItemOptions).values(values).returning();
    return created;
  }

  async getOrderItemOptions(orderItemId: string): Promise<OrderItemOption[]> {
    return await db
      .select()
      .from(orderItemOptions)
      .where(eq(orderItemOptions.orderItemId, orderItemId))
      .orderBy(orderItemOptions.createdAt);
  }

  // Financial Shift operations
  async getActiveShift(restaurantId: string, branchId: string | null, operatorId: string): Promise<FinancialShift | undefined> {
    const conditions = [
      eq(financialShifts.restaurantId, restaurantId),
      eq(financialShifts.operatorId, operatorId),
      eq(financialShifts.status, 'aberto'),
    ];

    if (branchId) {
      conditions.push(eq(financialShifts.branchId, branchId));
    } else {
      conditions.push(isNull(financialShifts.branchId));
    }

    const [shift] = await db
      .select()
      .from(financialShifts)
      .where(and(...conditions));
    
    return shift;
  }

  async getAllShifts(restaurantId: string, branchId: string | null, startDate?: Date, endDate?: Date): Promise<FinancialShift[]> {
    let conditions = [eq(financialShifts.restaurantId, restaurantId)];
    
    // Always filter by branch - either specific branch or null branch
    if (branchId) {
      conditions.push(eq(financialShifts.branchId, branchId));
    } else {
      conditions.push(isNull(financialShifts.branchId));
    }
    
    if (startDate) {
      conditions.push(gte(financialShifts.startedAt, startDate));
    }
    
    if (endDate) {
      conditions.push(sql`${financialShifts.endedAt} <= ${endDate}`);
    }

    return await db
      .select()
      .from(financialShifts)
      .where(and(...conditions))
      .orderBy(desc(financialShifts.startedAt));
  }

  async getShiftById(id: string): Promise<FinancialShift | undefined> {
    const [shift] = await db.select().from(financialShifts).where(eq(financialShifts.id, id));
    return shift;
  }

  async createShift(restaurantId: string, branchId: string | null, shift: InsertFinancialShift): Promise<FinancialShift> {
    const [newShift] = await db
      .insert(financialShifts)
      .values({
        restaurantId,
        branchId,
        ...shift,
      })
      .returning();
    return newShift;
  }

  async closeShift(id: string, closingBalance: string, notes?: string): Promise<FinancialShift> {
    const shift = await this.getShiftById(id);
    if (!shift) throw new Error('Turno não encontrado');

    const openingBalance = parseFloat(shift.openingBalance || '0');
    const expectedBalance = parseFloat(shift.expectedBalance || '0');
    const closing = parseFloat(closingBalance);
    const discrepancy = closing - expectedBalance;

    const [updated] = await db
      .update(financialShifts)
      .set({
        status: 'fechado',
        closingBalance,
        discrepancy: discrepancy.toFixed(2),
        endedAt: new Date(),
        notes: notes || shift.notes,
      })
      .where(eq(financialShifts.id, id))
      .returning();
    
    return updated;
  }

  // Financial Event operations
  async createFinancialEvent(restaurantId: string, event: Omit<InsertFinancialEvent, 'restaurantId'>): Promise<FinancialEvent> {
    const [newEvent] = await db
      .insert(financialEvents)
      .values({
        restaurantId,
        ...event,
      })
      .returning();
    return newEvent;
  }

  async getFinancialEvents(restaurantId: string, branchId: string | null, filters?: {
    sessionId?: string;
    orderId?: string;
    tableId?: string;
    shiftId?: string;
    operatorId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<FinancialEvent[]> {
    let conditions = [eq(financialEvents.restaurantId, restaurantId)];

    // Always filter by branch - either specific branch or null branch
    if (branchId) {
      conditions.push(eq(financialEvents.branchId, branchId));
    } else {
      conditions.push(isNull(financialEvents.branchId));
    }

    if (filters) {
      if (filters.sessionId) conditions.push(eq(financialEvents.sessionId, filters.sessionId));
      if (filters.orderId) conditions.push(eq(financialEvents.orderId, filters.orderId));
      if (filters.tableId) conditions.push(eq(financialEvents.tableId, filters.tableId));
      if (filters.shiftId) conditions.push(eq(financialEvents.shiftId, filters.shiftId));
      if (filters.operatorId) conditions.push(eq(financialEvents.operatorId, filters.operatorId));
      if (filters.startDate) conditions.push(gte(financialEvents.createdAt, filters.startDate));
      if (filters.endDate) conditions.push(sql`${financialEvents.createdAt} <= ${filters.endDate}`);
    }

    return await db
      .select()
      .from(financialEvents)
      .where(and(...conditions))
      .orderBy(desc(financialEvents.createdAt));
  }

  // Order Adjustment operations
  async createOrderAdjustment(restaurantId: string, adjustment: Omit<InsertOrderAdjustment, 'restaurantId'>): Promise<OrderAdjustment> {
    const [newAdjustment] = await db
      .insert(orderAdjustments)
      .values({
        restaurantId,
        ...adjustment,
      })
      .returning();
    return newAdjustment;
  }

  async getOrderAdjustments(orderId: string): Promise<OrderAdjustment[]> {
    return await db
      .select()
      .from(orderAdjustments)
      .where(eq(orderAdjustments.orderId, orderId))
      .orderBy(desc(orderAdjustments.createdAt));
  }

  // Payment Event operations
  async createPaymentEvent(restaurantId: string, event: Omit<InsertPaymentEvent, 'restaurantId'>): Promise<PaymentEvent> {
    const [newEvent] = await db
      .insert(paymentEvents)
      .values({
        restaurantId,
        ...event,
      })
      .returning();
    return newEvent;
  }

  async getPaymentEvents(restaurantId: string, filters?: {
    orderId?: string;
    sessionId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PaymentEvent[]> {
    let conditions = [eq(paymentEvents.restaurantId, restaurantId)];

    if (filters) {
      if (filters.orderId) conditions.push(eq(paymentEvents.orderId, filters.orderId));
      if (filters.sessionId) conditions.push(eq(paymentEvents.sessionId, filters.sessionId));
      if (filters.startDate) conditions.push(gte(paymentEvents.createdAt, filters.startDate));
      if (filters.endDate) conditions.push(sql`${paymentEvents.createdAt} <= ${filters.endDate}`);
    }

    return await db
      .select()
      .from(paymentEvents)
      .where(and(...conditions))
      .orderBy(desc(paymentEvents.createdAt));
  }

  // Report Aggregation operations
  async createReportAggregation(restaurantId: string, aggregation: Omit<InsertReportAggregation, 'restaurantId'>): Promise<ReportAggregation> {
    const [newAggregation] = await db
      .insert(reportAggregations)
      .values({
        restaurantId,
        ...aggregation,
      })
      .returning();
    return newAggregation;
  }

  async getReportAggregations(restaurantId: string, branchId: string | null, periodType: 'daily' | 'weekly' | 'monthly', startDate?: Date, endDate?: Date): Promise<ReportAggregation[]> {
    let conditions = [
      eq(reportAggregations.restaurantId, restaurantId),
      eq(reportAggregations.periodType, periodType)
    ];

    // Always filter by branch - either specific branch or null branch
    if (branchId) {
      conditions.push(eq(reportAggregations.branchId, branchId));
    } else {
      conditions.push(isNull(reportAggregations.branchId));
    }

    if (startDate) {
      conditions.push(gte(reportAggregations.periodStart, startDate));
    }

    if (endDate) {
      conditions.push(sql`${reportAggregations.periodEnd} <= ${endDate}`);
    }

    return await db
      .select()
      .from(reportAggregations)
      .where(and(...conditions))
      .orderBy(desc(reportAggregations.periodStart));
  }

  async getLatestAggregation(restaurantId: string, branchId: string | null, periodType: 'daily' | 'weekly' | 'monthly'): Promise<ReportAggregation | undefined> {
    let conditions = [
      eq(reportAggregations.restaurantId, restaurantId),
      eq(reportAggregations.periodType, periodType)
    ];

    // Always filter by branch - either specific branch or null branch
    if (branchId) {
      conditions.push(eq(reportAggregations.branchId, branchId));
    } else {
      conditions.push(isNull(reportAggregations.branchId));
    }

    const [latest] = await db
      .select()
      .from(reportAggregations)
      .where(and(...conditions))
      .orderBy(desc(reportAggregations.periodStart))
      .limit(1);

    return latest;
  }

  // Menu Visit operations
  async recordMenuVisit(restaurantId: string, visit: Omit<InsertMenuVisit, 'restaurantId'>): Promise<MenuVisit> {
    const [newVisit] = await db
      .insert(menuVisits)
      .values({
        restaurantId,
        ...visit,
      })
      .returning();
    return newVisit;
  }

  async getMenuVisitStats(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    totalVisits: number;
    visitsToday: number;
    visitsBySource: Array<{ source: string; count: number }>;
  }> {
    let conditions = [
      eq(menuVisits.restaurantId, restaurantId),
      gte(menuVisits.createdAt, startDate),
      sql`${menuVisits.createdAt} <= ${endDate}`
    ];

    if (branchId !== null) {
      const branchCondition = or(
        eq(menuVisits.branchId, branchId),
        isNull(menuVisits.branchId)
      );
      if (branchCondition) {
        conditions.push(branchCondition);
      }
    }

    const allVisits = await db
      .select()
      .from(menuVisits)
      .where(and(...conditions));

    const totalVisits = allVisits.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitsToday = allVisits.filter((v: MenuVisit) => v.createdAt && new Date(v.createdAt) >= today).length;

    const visitsBySourceMap: Record<string, number> = {};
    allVisits.forEach((visit: MenuVisit) => {
      const source = visit.visitSource || 'unknown';
      visitsBySourceMap[source] = (visitsBySourceMap[source] || 0) + 1;
    });

    const visitsBySource = Object.entries(visitsBySourceMap).map(([source, count]) => ({
      source,
      count
    }));

    return {
      totalVisits,
      visitsToday,
      visitsBySource
    };
  }

  // Customer Review operations
  async createCustomerReview(restaurantId: string, review: Omit<InsertCustomerReview, 'restaurantId'>): Promise<CustomerReview> {
    const [newReview] = await db
      .insert(customerReviews)
      .values({
        restaurantId,
        ...review,
      })
      .returning();
    return newReview;
  }

  async getCustomerReviews(restaurantId: string, branchId: string | null, limit?: number, startDate?: Date, endDate?: Date): Promise<CustomerReview[]> {
    let conditions = [eq(customerReviews.restaurantId, restaurantId)];

    if (branchId !== null) {
      conditions.push(eq(customerReviews.branchId, branchId));
    }

    if (startDate) {
      conditions.push(gte(customerReviews.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(sql`${customerReviews.createdAt} <= ${endDate}`);
    }

    let query = db
      .select()
      .from(customerReviews)
      .where(and(...conditions))
      .orderBy(desc(customerReviews.createdAt));

    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  }

  async getAverageRating(restaurantId: string, branchId: string | null, startDate?: Date, endDate?: Date): Promise<number> {
    const reviews = await this.getCustomerReviews(restaurantId, branchId, undefined, startDate, endDate);
    
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  // Dashboard Stats
  async getDashboardStats(
    restaurantId: string,
    branchId: string | null,
    startDate: Date,
    endDate: Date,
    orderType?: string
  ): Promise<{
    salesByDay: Array<{ date: string; sales: number; orders: number; pdv: number; web: number }>;
    totalOrders: number;
    totalRevenue: number;
    averageTicket: number;
    newCustomers: number;
    averageRating: number;
    totalReviews: number;
    topProducts: Array<{ name: string; quantity: number }>;
  }> {
    let orderConditions = [
      eq(orders.restaurantId, restaurantId),
      eq(orders.paymentStatus, 'pago'),
      ne(orders.status, 'cancelado'),
      gte(orders.createdAt, startDate),
      sql`${orders.createdAt} <= ${endDate}`
    ];

    if (branchId !== null) {
      orderConditions.push(or(
        eq(orders.branchId, branchId),
        sql`${orders.branchId} IS NULL`
      ) as any);
    }

    if (orderType && orderType !== 'all') {
      if (orderType === 'pdv') {
        orderConditions.push(or(
          eq(orders.orderType, 'pdv'),
          eq(orders.orderType, 'balcao')
        ) as any);
      } else if (orderType === 'web') {
        orderConditions.push(or(
          eq(orders.orderType, 'mesa'),
          eq(orders.orderType, 'delivery'),
          eq(orders.orderType, 'takeout')
        ) as any);
      }
    }

    const periodOrders = await db
      .select()
      .from(orders)
      .where(and(...orderConditions));

    const totalOrders = periodOrders.length;
    const totalRevenue = periodOrders.reduce((sum: number, order: Order) => sum + parseFloat(order.totalAmount), 0);
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const salesByDayMap: Record<string, { sales: number; orders: number; pdv: number; web: number }> = {};
    
    periodOrders.forEach((order: Order) => {
      const dateKey = order.createdAt?.toISOString().split('T')[0] || '';
      if (!salesByDayMap[dateKey]) {
        salesByDayMap[dateKey] = { sales: 0, orders: 0, pdv: 0, web: 0 };
      }
      const revenue = parseFloat(order.totalAmount);
      salesByDayMap[dateKey].sales += revenue;
      salesByDayMap[dateKey].orders += 1;

      if (order.orderType === 'pdv' || order.orderType === 'balcao') {
        salesByDayMap[dateKey].pdv += revenue;
      } else {
        salesByDayMap[dateKey].web += revenue;
      }
    });

    const salesByDay = Object.entries(salesByDayMap)
      .map(([date, data]) => ({
        date,
        ...data
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const uniquePhones = new Set<string>();
    periodOrders.forEach((order: Order) => {
      if (order.customerPhone) {
        uniquePhones.add(order.customerPhone);
      }
    });
    const newCustomers = uniquePhones.size;

    const reviews = await this.getCustomerReviews(restaurantId, branchId, undefined, startDate, endDate);
    const averageRating = await this.getAverageRating(restaurantId, branchId, startDate, endDate);
    const totalReviews = reviews.length;

    const orderIds = periodOrders.map((o: Order) => o.id);
    let topProducts: Array<{ name: string; quantity: number }> = [];
    
    if (orderIds.length > 0) {
      const items = await db
        .select({
          menuItemId: orderItems.menuItemId,
          quantity: orderItems.quantity,
          name: menuItems.name,
        })
        .from(orderItems)
        .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
        .where(inArray(orderItems.orderId, orderIds));

      const productMap: Record<string, { name: string; quantity: number }> = {};
      items.forEach((item: any) => {
        const name = item.name || 'Unknown';
        if (!productMap[name]) {
          productMap[name] = { name, quantity: 0 };
        }
        productMap[name].quantity += item.quantity || 0;
      });

      topProducts = Object.values(productMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    }

    return {
      salesByDay,
      totalOrders,
      totalRevenue,
      averageTicket,
      newCustomers,
      averageRating,
      totalReviews,
      topProducts
    };
  }

  // Cash Register operations
  async getCashRegisters(restaurantId: string, branchId: string | null): Promise<CashRegister[]> {
    let conditions = [eq(cashRegisters.restaurantId, restaurantId)];
    
    if (branchId !== null) {
      conditions.push(eq(cashRegisters.branchId, branchId));
    }

    return await db
      .select()
      .from(cashRegisters)
      .where(and(...conditions))
      .orderBy(desc(cashRegisters.createdAt));
  }

  async getCashRegisterById(id: string, restaurantId: string): Promise<CashRegister | undefined> {
    const [cashRegister] = await db
      .select()
      .from(cashRegisters)
      .where(and(
        eq(cashRegisters.id, id),
        eq(cashRegisters.restaurantId, restaurantId)
      ))
      .limit(1);
    return cashRegister;
  }

  async createCashRegister(restaurantId: string, data: Omit<InsertCashRegister, 'restaurantId'>): Promise<CashRegister> {
    const initialBalance = data.initialBalance || '0.00';
    const [newRegister] = await db
      .insert(cashRegisters)
      .values({
        restaurantId,
        branchId: data.branchId || null,
        name: data.name,
        initialBalance,
        currentBalance: initialBalance,
        isActive: data.isActive ?? 1,
      })
      .returning();
    return newRegister;
  }

  async updateCashRegister(id: string, restaurantId: string, data: Partial<InsertCashRegister>): Promise<CashRegister | undefined> {
    const [updated] = await db
      .update(cashRegisters)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(
        eq(cashRegisters.id, id),
        eq(cashRegisters.restaurantId, restaurantId)
      ))
      .returning();
    return updated;
  }

  async deleteCashRegister(id: string, restaurantId: string): Promise<void> {
    await db
      .delete(cashRegisters)
      .where(and(
        eq(cashRegisters.id, id),
        eq(cashRegisters.restaurantId, restaurantId)
      ));
  }

  // Financial Category operations
  async getFinancialCategories(restaurantId: string, branchId: string | null, type?: 'receita' | 'despesa'): Promise<FinancialCategory[]> {
    let conditions = [
      eq(financialCategories.restaurantId, restaurantId),
      eq(financialCategories.isArchived, 0)
    ];
    
    if (branchId !== null) {
      conditions.push(
        or(
          eq(financialCategories.branchId, branchId),
          isNull(financialCategories.branchId)
        )!
      );
    }

    if (type) {
      conditions.push(eq(financialCategories.type, type));
    }

    return await db
      .select()
      .from(financialCategories)
      .where(and(...conditions))
      .orderBy(desc(financialCategories.isDefault), financialCategories.name);
  }

  async createFinancialCategory(restaurantId: string, data: Omit<InsertFinancialCategory, 'restaurantId'>): Promise<FinancialCategory> {
    const [newCategory] = await db
      .insert(financialCategories)
      .values({
        restaurantId,
        ...data,
        branchId: data.branchId || null,
      })
      .returning();
    return newCategory;
  }

  async deleteFinancialCategory(id: string, restaurantId: string): Promise<{ success: boolean; message?: string }> {
    const usageCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(financialTransactions)
      .where(eq(financialTransactions.categoryId, id));

    if (usageCount[0].count > 0) {
      return {
        success: false,
        message: 'Categoria não pode ser excluída pois possui lançamentos associados'
      };
    }

    await db
      .delete(financialCategories)
      .where(and(
        eq(financialCategories.id, id),
        eq(financialCategories.restaurantId, restaurantId)
      ));

    return { success: true };
  }

  // Financial Transaction operations
  async createFinancialTransaction(
    restaurantId: string, 
    userId: string, 
    data: Omit<InsertFinancialTransaction, 'restaurantId' | 'recordedByUserId'>
  ): Promise<FinancialTransaction> {
    let activeShift: CashRegisterShift | undefined = undefined;

    if (data.cashRegisterId) {
      activeShift = await this.getActiveCashRegisterShift(data.cashRegisterId, restaurantId);
      
      if (!activeShift) {
        throw new Error('Não existe um turno aberto para esta caixa. Abra um turno antes de registrar lançamentos.');
      }
    }

    const amount = parseFloat(data.amount);
    const amountChange = data.type === 'despesa' ? -amount : amount;

    const [transaction] = await db.transaction(async (tx: PgTransaction<any, any, any>) => {
      const [newTransaction] = await tx
        .insert(financialTransactions)
        .values({
          restaurantId,
          recordedByUserId: userId,
          branchId: data.branchId || null,
          cashRegisterId: data.cashRegisterId || null,
          shiftId: data.shiftId || (activeShift?.id || null),
          categoryId: data.categoryId,
          type: data.type,
          origin: data.origin || 'manual',
          description: data.description,
          paymentMethod: data.paymentMethod,
          amount: data.amount,
          referenceOrderId: data.referenceOrderId || null,
          occurredAt: new Date(data.occurredAt),
          note: data.note,
          totalInstallments: data.totalInstallments || 1,
          installmentNumber: data.installmentNumber || 1,
          parentTransactionId: data.parentTransactionId || null,
        })
        .returning();

      if (data.cashRegisterId) {
        await tx
          .update(cashRegisters)
          .set({
            currentBalance: sql`${cashRegisters.currentBalance} + ${amountChange}`,
            updatedAt: new Date(),
          })
          .where(eq(cashRegisters.id, data.cashRegisterId));
      }

      return [newTransaction];
    });

    return transaction;
  }

  async getFinancialTransactions(
    restaurantId: string,
    branchId: string | null,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      cashRegisterId?: string;
      paymentMethod?: 'dinheiro' | 'multicaixa' | 'transferencia' | 'cartao';
      type?: 'receita' | 'despesa';
    }
  ): Promise<Array<FinancialTransaction & { 
    cashRegister: CashRegister; 
    category: FinancialCategory;
    recordedBy: User;
  }>> {
    let conditions = [eq(financialTransactions.restaurantId, restaurantId)];

    if (branchId !== null) {
      conditions.push(
        or(
          eq(financialTransactions.branchId, branchId),
          isNull(financialTransactions.branchId)
        )!
      );
    }

    if (filters?.startDate) {
      conditions.push(gte(financialTransactions.occurredAt, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(sql`${financialTransactions.occurredAt} <= ${filters.endDate}`);
    }

    if (filters?.cashRegisterId) {
      conditions.push(eq(financialTransactions.cashRegisterId, filters.cashRegisterId));
    }

    if (filters?.paymentMethod) {
      conditions.push(eq(financialTransactions.paymentMethod, filters.paymentMethod));
    }

    if (filters?.type) {
      conditions.push(eq(financialTransactions.type, filters.type));
    }

    const results = await db
      .select({
        transaction: financialTransactions,
        cashRegister: cashRegisters,
        category: financialCategories,
        recordedBy: users,
      })
      .from(financialTransactions)
      .leftJoin(cashRegisters, eq(financialTransactions.cashRegisterId, cashRegisters.id))
      .leftJoin(financialCategories, eq(financialTransactions.categoryId, financialCategories.id))
      .leftJoin(users, eq(financialTransactions.recordedByUserId, users.id))
      .where(and(...conditions))
      .orderBy(desc(financialTransactions.occurredAt));

    return results.map((r: any) => ({
      ...r.transaction,
      cashRegister: r.cashRegister!,
      category: r.category!,
      recordedBy: r.recordedBy!,
    }));
  }

  async deleteFinancialTransaction(id: string, restaurantId: string): Promise<void> {
    const [transaction] = await db
      .select()
      .from(financialTransactions)
      .where(and(
        eq(financialTransactions.id, id),
        eq(financialTransactions.restaurantId, restaurantId)
      ))
      .limit(1);

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    const amount = parseFloat(transaction.amount);
    const amountChange = transaction.type === 'receita' ? -amount : amount;

    await db.transaction(async (tx: PgTransaction<any, any, any>) => {
      await tx
        .delete(financialTransactions)
        .where(eq(financialTransactions.id, id));

      await tx
        .update(cashRegisters)
        .set({
          currentBalance: sql`${cashRegisters.currentBalance} + ${amountChange}`,
          updatedAt: new Date(),
        })
        .where(eq(cashRegisters.id, transaction.cashRegisterId));
    });
  }

  async getFinancialSummary(
    restaurantId: string,
    branchId: string | null,
    startDate?: Date,
    endDate?: Date,
    cashRegisterId?: string
  ): Promise<{
    totalBalance: string;
    cashRegisterBalances: Array<{ id: string; name: string; balance: string }>;
    totalIncome: string;
    totalExpense: string;
    netResult: string;
  }> {
    let registerConditions = [
      eq(cashRegisters.restaurantId, restaurantId),
      eq(cashRegisters.isActive, 1)
    ];

    if (branchId !== null) {
      registerConditions.push(eq(cashRegisters.branchId, branchId));
    }

    if (cashRegisterId) {
      registerConditions.push(eq(cashRegisters.id, cashRegisterId));
    }

    const registers = await db
      .select()
      .from(cashRegisters)
      .where(and(...registerConditions));

    const totalBalance = registers.reduce((sum: number, r: CashRegister) => sum + parseFloat(r.currentBalance), 0);

    const cashRegisterBalances = registers.map((r: CashRegister) => ({
      id: r.id,
      name: r.name,
      balance: r.currentBalance,
    }));

    let transactionConditions = [eq(financialTransactions.restaurantId, restaurantId)];

    if (branchId !== null) {
      transactionConditions.push(
        or(
          eq(financialTransactions.branchId, branchId),
          isNull(financialTransactions.branchId)
        )!
      );
    }

    if (startDate) {
      transactionConditions.push(gte(financialTransactions.occurredAt, startDate));
    }

    if (endDate) {
      transactionConditions.push(sql`${financialTransactions.occurredAt} <= ${endDate}`);
    }

    if (cashRegisterId) {
      transactionConditions.push(eq(financialTransactions.cashRegisterId, cashRegisterId));
    }

    const transactions = await db
      .select()
      .from(financialTransactions)
      .where(and(...transactionConditions));

    const totalIncome = transactions
      .filter((t: FinancialTransaction) => t.type === 'receita')
      .reduce((sum: number, t: FinancialTransaction) => sum + parseFloat(t.amount), 0);

    const totalExpense = transactions
      .filter((t: FinancialTransaction) => t.type === 'despesa')
      .reduce((sum: number, t: FinancialTransaction) => sum + parseFloat(t.amount), 0);

    const netResult = totalIncome - totalExpense;

    return {
      totalBalance: totalBalance.toFixed(2),
      cashRegisterBalances,
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      netResult: netResult.toFixed(2),
    };
  }

  // Cash Register Shift operations
  async getCashRegisterShifts(
    restaurantId: string,
    branchId: string | null,
    filters?: {
      cashRegisterId?: string;
      status?: 'aberto' | 'fechado';
    }
  ): Promise<Array<CashRegisterShift & { cashRegister: CashRegister; openedBy: User; closedBy?: User }>> {
    let conditions = [eq(cashRegisterShifts.restaurantId, restaurantId)];

    if (branchId !== null) {
      conditions.push(
        or(
          eq(cashRegisterShifts.branchId, branchId),
          isNull(cashRegisterShifts.branchId)
        )!
      );
    }

    if (filters?.cashRegisterId) {
      conditions.push(eq(cashRegisterShifts.cashRegisterId, filters.cashRegisterId));
    }

    if (filters?.status) {
      conditions.push(eq(cashRegisterShifts.status, filters.status));
    }

    const openedByUsers = alias(users, 'openedByUsers');
    const closedByUsers = alias(users, 'closedByUsers');

    const results = await db
      .select({
        shift: cashRegisterShifts,
        cashRegister: cashRegisters,
        openedBy: openedByUsers,
        closedBy: closedByUsers,
      })
      .from(cashRegisterShifts)
      .leftJoin(cashRegisters, eq(cashRegisterShifts.cashRegisterId, cashRegisters.id))
      .leftJoin(openedByUsers, eq(cashRegisterShifts.openedByUserId, openedByUsers.id))
      .leftJoin(closedByUsers, eq(cashRegisterShifts.closedByUserId, closedByUsers.id))
      .where(and(...conditions))
      .orderBy(desc(cashRegisterShifts.openedAt));

    return results.map((r: any) => ({
      ...r.shift,
      cashRegister: r.cashRegister!,
      openedBy: r.openedBy!,
      closedBy: r.closedBy || undefined,
    }));
  }

  async getActiveCashRegisterShift(cashRegisterId: string, restaurantId: string): Promise<CashRegisterShift | undefined> {
    const [shift] = await db
      .select()
      .from(cashRegisterShifts)
      .where(and(
        eq(cashRegisterShifts.cashRegisterId, cashRegisterId),
        eq(cashRegisterShifts.restaurantId, restaurantId),
        eq(cashRegisterShifts.status, 'aberto')
      ))
      .limit(1);

    return shift;
  }

  async getCashRegistersWithActiveShift(restaurantId: string, branchId: string | null): Promise<CashRegister[]> {
    let conditions = [
      eq(cashRegisters.restaurantId, restaurantId),
      eq(cashRegisters.isActive, 1)
    ];

    if (branchId !== null) {
      conditions.push(eq(cashRegisters.branchId, branchId));
    }

    const registers = await db
      .select()
      .from(cashRegisters)
      .where(and(...conditions));

    const registersWithShifts: CashRegister[] = [];

    for (const register of registers) {
      const activeShift = await this.getActiveCashRegisterShift(register.id, restaurantId);
      if (activeShift) {
        registersWithShifts.push(register);
      }
    }

    return registersWithShifts;
  }

  async openCashRegisterShift(
    restaurantId: string,
    userId: string,
    data: Omit<InsertCashRegisterShift, 'restaurantId' | 'openedByUserId'>
  ): Promise<CashRegisterShift> {
    const existingShift = await this.getActiveCashRegisterShift(data.cashRegisterId, restaurantId);
    
    if (existingShift) {
      throw new Error('Já existe um turno aberto para esta caixa. Feche o turno atual antes de abrir um novo.');
    }

    return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
      const [shift] = await tx
        .insert(cashRegisterShifts)
        .values({
          restaurantId,
          openedByUserId: userId,
          branchId: data.branchId || null,
          cashRegisterId: data.cashRegisterId,
          openingAmount: data.openingAmount,
          notes: data.notes,
        })
        .returning();

      const openingCategoryResults = await tx
        .select()
        .from(financialCategories)
        .where(and(
          eq(financialCategories.restaurantId, restaurantId),
          eq(financialCategories.type, 'ajuste'),
          eq(financialCategories.isDefault, 1)
        ))
        .limit(1);

      let categoryId = openingCategoryResults[0]?.id;

      if (!categoryId) {
        const [category] = await tx
          .insert(financialCategories)
          .values({
            restaurantId,
            branchId: data.branchId || null,
            type: 'ajuste',
            name: 'Abertura de Caixa',
            description: 'Valor inicial ao abrir o caixa',
            isDefault: 1,
          })
          .returning();
        categoryId = category.id;
      }

      await tx
        .insert(financialTransactions)
        .values({
          restaurantId,
          recordedByUserId: userId,
          branchId: data.branchId || null,
          cashRegisterId: data.cashRegisterId,
          shiftId: shift.id,
          categoryId,
          type: 'ajuste',
          origin: 'manual',
          description: 'Abertura do caixa',
          paymentMethod: 'dinheiro',
          amount: data.openingAmount,
          referenceOrderId: null,
          occurredAt: new Date(),
          note: data.notes,
        });

      await tx
        .update(cashRegisters)
        .set({
          currentBalance: sql`${cashRegisters.currentBalance} + ${data.openingAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(cashRegisters.id, data.cashRegisterId));

      return shift;
    });
  }

  async closeCashRegisterShift(
    shiftId: string,
    restaurantId: string,
    userId: string,
    data: CloseCashRegisterShift
  ): Promise<CashRegisterShift> {
    const [shift] = await db
      .select()
      .from(cashRegisterShifts)
      .where(and(
        eq(cashRegisterShifts.id, shiftId),
        eq(cashRegisterShifts.restaurantId, restaurantId),
        eq(cashRegisterShifts.status, 'aberto')
      ))
      .limit(1);

    if (!shift) {
      throw new Error('Turno não encontrado ou já fechado.');
    }

    const allTransactions = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.shiftId, shiftId));

    const cashTransactions = allTransactions.filter((t: FinancialTransaction) => 
      t.paymentMethod === 'dinheiro'
    );

    const totalRevenues = cashTransactions
      .filter((t: FinancialTransaction) => t.type === 'receita')
      .reduce((sum: number, t: FinancialTransaction) => sum + parseFloat(t.amount), 0);

    const totalExpenses = cashTransactions
      .filter((t: FinancialTransaction) => t.type === 'despesa')
      .reduce((sum: number, t: FinancialTransaction) => sum + parseFloat(t.amount), 0);

    const totalAdjustments = cashTransactions
      .filter((t: FinancialTransaction) => t.type === 'ajuste')
      .reduce((sum: number, t: FinancialTransaction) => sum + parseFloat(t.amount), 0);

    const closingAmountExpected = totalRevenues - totalExpenses + totalAdjustments;
    const closingAmountCounted = parseFloat(data.closingAmountCounted);
    const difference = closingAmountCounted - closingAmountExpected;

    const [closedShift] = await db
      .update(cashRegisterShifts)
      .set({
        status: 'fechado',
        closedByUserId: userId,
        closingAmountExpected: closingAmountExpected.toFixed(2),
        closingAmountCounted: data.closingAmountCounted,
        difference: difference.toFixed(2),
        totalRevenues: totalRevenues.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        closedAt: new Date(),
        notes: data.notes || shift.notes,
      })
      .where(eq(cashRegisterShifts.id, shiftId))
      .returning();

    return closedShift;
  }

  async getCashRegisterShiftById(id: string): Promise<CashRegisterShift | undefined> {
    const [shift] = await db
      .select()
      .from(cashRegisterShifts)
      .where(eq(cashRegisterShifts.id, id))
      .limit(1);
    return shift;
  }

  async getFinancialTransactionById(id: string): Promise<FinancialTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.id, id))
      .limit(1);
    return transaction;
  }

  // Expense operations
  async getExpenses(
    restaurantId: string,
    branchId: string | null,
    filters?: {
      categoryId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Array<Expense & { category: FinancialCategory; recordedBy: User; transaction?: FinancialTransaction }>> {
    let conditions = [eq(expenses.restaurantId, restaurantId)];

    if (branchId !== null) {
      conditions.push(
        or(
          eq(expenses.branchId, branchId),
          isNull(expenses.branchId)
        )!
      );
    }

    if (filters?.categoryId) {
      conditions.push(eq(expenses.categoryId, filters.categoryId));
    }

    if (filters?.startDate) {
      conditions.push(gte(expenses.occurredAt, filters.startDate));
    }

    if (filters?.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(sql`${expenses.occurredAt} <= ${endOfDay}`);
    }

    const results = await db
      .select({
        expense: expenses,
        category: financialCategories,
        recordedBy: users,
        transaction: financialTransactions,
      })
      .from(expenses)
      .leftJoin(financialCategories, eq(expenses.categoryId, financialCategories.id))
      .leftJoin(users, eq(expenses.recordedByUserId, users.id))
      .leftJoin(financialTransactions, eq(expenses.transactionId, financialTransactions.id))
      .where(and(...conditions))
      .orderBy(desc(expenses.occurredAt));

    return results.map((r: any) => ({
      ...r.expense,
      category: r.category!,
      recordedBy: r.recordedBy!,
      transaction: r.transaction || undefined,
    }));
  }

  async getExpenseById(id: string): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);
    return expense;
  }

  async createExpense(
    restaurantId: string,
    branchId: string | null,
    userId: string,
    data: InsertExpense
  ): Promise<Expense> {
    return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
      const amountDecimal = parseFloat(data.amount).toFixed(2);

      const [transaction] = await tx
        .insert(financialTransactions)
        .values({
          restaurantId,
          recordedByUserId: userId,
          branchId: branchId || null,
          cashRegisterId: null,
          shiftId: null,
          categoryId: data.categoryId,
          type: 'despesa',
          origin: 'manual',
          description: data.description,
          paymentMethod: data.paymentMethod,
          amount: amountDecimal,
          referenceOrderId: null,
          occurredAt: new Date(data.occurredAt),
          note: data.note || null,
        })
        .returning();

      const [newExpense] = await tx
        .insert(expenses)
        .values({
          restaurantId,
          branchId: branchId || null,
          categoryId: data.categoryId,
          transactionId: transaction.id,
          description: data.description,
          amount: amountDecimal,
          paymentMethod: data.paymentMethod,
          occurredAt: new Date(data.occurredAt),
          recordedByUserId: userId,
          note: data.note || null,
        })
        .returning();

      return newExpense;
    });
  }

  async updateExpense(
    restaurantId: string,
    id: string,
    data: UpdateExpense
  ): Promise<Expense> {
    const existing = await this.getExpenseById(id);
    if (!existing) {
      throw new Error('Despesa não encontrada');
    }
    if (existing.restaurantId !== restaurantId) {
      throw new Error('Não autorizado');
    }

    return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
      const updateData: any = {};
      if (data.categoryId) updateData.categoryId = data.categoryId;
      if (data.description) updateData.description = data.description;
      if (data.amount) updateData.amount = parseFloat(data.amount).toFixed(2);
      if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
      if (data.occurredAt) updateData.occurredAt = new Date(data.occurredAt);
      if (data.note !== undefined) updateData.note = data.note;

      await tx
        .update(expenses)
        .set(updateData)
        .where(eq(expenses.id, id));

      if (existing.transactionId) {
        const txUpdateData: any = {};
        if (data.categoryId) txUpdateData.categoryId = data.categoryId;
        if (data.description) txUpdateData.description = data.description;
        if (data.amount) txUpdateData.amount = parseFloat(data.amount).toFixed(2);
        if (data.paymentMethod) txUpdateData.paymentMethod = data.paymentMethod;
        if (data.occurredAt) txUpdateData.occurredAt = new Date(data.occurredAt);
        if (data.note !== undefined) txUpdateData.note = data.note;

        await tx
          .update(financialTransactions)
          .set(txUpdateData)
          .where(eq(financialTransactions.id, existing.transactionId));
      }

      const updated = await this.getExpenseById(id);
      if (!updated) {
        throw new Error('Erro ao atualizar despesa');
      }
      return updated;
    });
  }

  async deleteExpense(restaurantId: string, id: string): Promise<void> {
    const existing = await this.getExpenseById(id);
    if (!existing) {
      throw new Error('Despesa não encontrada');
    }
    if (existing.restaurantId !== restaurantId) {
      throw new Error('Não autorizado');
    }

    await db.transaction(async (tx: PgTransaction<any, any, any>) => {
      if (existing.transactionId) {
        await tx
          .delete(financialTransactions)
          .where(eq(financialTransactions.id, existing.transactionId));
      }

      await tx
        .delete(expenses)
        .where(eq(expenses.id, id));
    });
  }

  // Financial Reports
  async getFinancialReport(
    restaurantId: string,
    branchId: string | null,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRevenue: string;
    totalExpenses: string;
    totalAdjustments: string;
    netBalance: string;
    revenueByMethod: Array<{ method: string; total: string }>;
    expensesByCategory: Array<{ category: string; total: string }>;
    transactionsByDay: Array<{ date: string; revenue: string; expenses: string }>;
  }> {
    let conditions = [
      eq(financialTransactions.restaurantId, restaurantId),
      gte(financialTransactions.occurredAt, startDate),
    ];

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    conditions.push(sql`${financialTransactions.occurredAt} <= ${endOfDay}`);

    if (branchId !== null) {
      conditions.push(
        or(
          eq(financialTransactions.branchId, branchId),
          isNull(financialTransactions.branchId)
        )!
      );
    }

    const transactions = await db
      .select({
        transaction: financialTransactions,
        category: financialCategories,
      })
      .from(financialTransactions)
      .leftJoin(financialCategories, eq(financialTransactions.categoryId, financialCategories.id))
      .where(and(...conditions));

    const totalRevenue = transactions
      .filter((t: any) => t.transaction.type === 'receita')
      .reduce((sum: number, t: any) => sum + parseFloat(t.transaction.amount), 0);

    const totalExpenses = transactions
      .filter((t: any) => t.transaction.type === 'despesa')
      .reduce((sum: number, t: any) => sum + parseFloat(t.transaction.amount), 0);

    const totalAdjustments = transactions
      .filter((t: any) => t.transaction.type === 'ajuste')
      .reduce((sum: number, t: any) => sum + parseFloat(t.transaction.amount), 0);

    const netBalance = totalRevenue - totalExpenses + totalAdjustments;

    const revenueByMethodMap: Record<string, number> = {};
    transactions
      .filter((t: any) => t.transaction.type === 'receita')
      .forEach((t: any) => {
        const method = t.transaction.paymentMethod;
        if (!revenueByMethodMap[method]) {
          revenueByMethodMap[method] = 0;
        }
        revenueByMethodMap[method] += parseFloat(t.transaction.amount);
      });

    const revenueByMethod = Object.entries(revenueByMethodMap).map(([method, total]) => ({
      method,
      total: total.toFixed(2),
    }));

    const expensesByCategoryMap: Record<string, number> = {};
    transactions
      .filter((t: any) => t.transaction.type === 'despesa')
      .forEach((t: any) => {
        const category = t.category?.name || 'Sem categoria';
        if (!expensesByCategoryMap[category]) {
          expensesByCategoryMap[category] = 0;
        }
        expensesByCategoryMap[category] += parseFloat(t.transaction.amount);
      });

    const expensesByCategory = Object.entries(expensesByCategoryMap).map(([category, total]) => ({
      category,
      total: total.toFixed(2),
    }));

    const transactionsByDayMap: Record<string, { revenue: number; expenses: number }> = {};
    transactions.forEach((t: any) => {
      const date = new Date(t.transaction.occurredAt).toISOString().split('T')[0];
      if (!transactionsByDayMap[date]) {
        transactionsByDayMap[date] = { revenue: 0, expenses: 0 };
      }
      if (t.transaction.type === 'receita') {
        transactionsByDayMap[date].revenue += parseFloat(t.transaction.amount);
      } else if (t.transaction.type === 'despesa') {
        transactionsByDayMap[date].expenses += parseFloat(t.transaction.amount);
      }
    });

    const transactionsByDay = Object.entries(transactionsByDayMap)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue.toFixed(2),
        expenses: data.expenses.toFixed(2),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      totalAdjustments: totalAdjustments.toFixed(2),
      netBalance: netBalance.toFixed(2),
      revenueByMethod,
      expensesByCategory,
      transactionsByDay,
    };
  }

  // Inventory Category operations
  async getInventoryCategories(restaurantId: string): Promise<InventoryCategory[]> {
    return await db
      .select()
      .from(inventoryCategories)
      .where(eq(inventoryCategories.restaurantId, restaurantId))
      .orderBy(inventoryCategories.name);
  }

  async createInventoryCategory(restaurantId: string, data: InsertInventoryCategory): Promise<InventoryCategory> {
    const [category] = await db
      .insert(inventoryCategories)
      .values({ ...data, restaurantId })
      .returning();
    return category;
  }

  async updateInventoryCategory(id: string, restaurantId: string, data: UpdateInventoryCategory): Promise<InventoryCategory> {
    const [category] = await db
      .update(inventoryCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(inventoryCategories.id, id),
          eq(inventoryCategories.restaurantId, restaurantId)
        )
      )
      .returning();
    return category;
  }

  async deleteInventoryCategory(id: string, restaurantId: string): Promise<void> {
    await db
      .delete(inventoryCategories)
      .where(
        and(
          eq(inventoryCategories.id, id),
          eq(inventoryCategories.restaurantId, restaurantId)
        )
      );
  }

  // Measurement Unit operations
  async getMeasurementUnits(restaurantId: string): Promise<MeasurementUnit[]> {
    return await db
      .select()
      .from(measurementUnits)
      .where(eq(measurementUnits.restaurantId, restaurantId))
      .orderBy(measurementUnits.name);
  }

  async createMeasurementUnit(restaurantId: string, data: InsertMeasurementUnit): Promise<MeasurementUnit> {
    const [unit] = await db
      .insert(measurementUnits)
      .values({ ...data, restaurantId })
      .returning();
    return unit;
  }

  async updateMeasurementUnit(id: string, restaurantId: string, data: UpdateMeasurementUnit): Promise<MeasurementUnit> {
    const [unit] = await db
      .update(measurementUnits)
      .set(data)
      .where(
        and(
          eq(measurementUnits.id, id),
          eq(measurementUnits.restaurantId, restaurantId)
        )
      )
      .returning();
    return unit;
  }

  async deleteMeasurementUnit(id: string, restaurantId: string): Promise<void> {
    await db
      .delete(measurementUnits)
      .where(
        and(
          eq(measurementUnits.id, id),
          eq(measurementUnits.restaurantId, restaurantId)
        )
      );
  }

  // Inventory Item operations
  async getInventoryItems(
    restaurantId: string,
    filters?: { categoryId?: string; isActive?: number }
  ): Promise<Array<InventoryItem & { category: InventoryCategory | null; unit: MeasurementUnit }>> {
    let conditions = [eq(inventoryItems.restaurantId, restaurantId)];

    if (filters?.categoryId) {
      conditions.push(eq(inventoryItems.categoryId, filters.categoryId));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(inventoryItems.isActive, filters.isActive));
    }

    const items = await db
      .select({
        item: inventoryItems,
        category: inventoryCategories,
        unit: measurementUnits,
      })
      .from(inventoryItems)
      .leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id))
      .innerJoin(measurementUnits, eq(inventoryItems.unitId, measurementUnits.id))
      .where(and(...conditions))
      .orderBy(inventoryItems.name);

    return items.map((row: any) => ({
      ...row.item,
      category: row.category,
      unit: row.unit,
    }));
  }

  async getInventoryItemById(id: string): Promise<InventoryItem | undefined> {
    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id));
    return item;
  }

  async createInventoryItem(restaurantId: string, data: InsertInventoryItem): Promise<InventoryItem> {
    const itemData: any = {
      ...data,
      restaurantId,
    };
    if (data.costPrice) itemData.costPrice = parseFloat(data.costPrice).toFixed(2);
    if (data.minStock) itemData.minStock = parseFloat(data.minStock).toFixed(2);
    if (data.maxStock) itemData.maxStock = parseFloat(data.maxStock).toFixed(2);
    if (data.reorderPoint) itemData.reorderPoint = parseFloat(data.reorderPoint).toFixed(2);

    const [item] = await db
      .insert(inventoryItems)
      .values(itemData)
      .returning();
    return item;
  }

  async updateInventoryItem(id: string, restaurantId: string, data: UpdateInventoryItem): Promise<InventoryItem> {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.unitId) updateData.unitId = data.unitId;
    if (data.costPrice) updateData.costPrice = parseFloat(data.costPrice).toFixed(2);
    if (data.minStock) updateData.minStock = parseFloat(data.minStock).toFixed(2);
    if (data.maxStock) updateData.maxStock = parseFloat(data.maxStock).toFixed(2);
    if (data.reorderPoint) updateData.reorderPoint = parseFloat(data.reorderPoint).toFixed(2);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(inventoryItems)
      .set(updateData)
      .where(
        and(
          eq(inventoryItems.id, id),
          eq(inventoryItems.restaurantId, restaurantId)
        )
      )
      .returning();
    return updated;
  }

  async deleteInventoryItem(id: string, restaurantId: string): Promise<void> {
    await db
      .delete(inventoryItems)
      .where(
        and(
          eq(inventoryItems.id, id),
          eq(inventoryItems.restaurantId, restaurantId)
        )
      );
  }

  // Branch Stock operations
  async getBranchStock(
    restaurantId: string,
    branchId: string
  ): Promise<Array<BranchStock & { inventoryItem: InventoryItem & { category: InventoryCategory | null; unit: MeasurementUnit } }>> {
    const stocks = await db
      .select({
        stock: branchStock,
        item: inventoryItems,
        category: inventoryCategories,
        unit: measurementUnits,
      })
      .from(branchStock)
      .innerJoin(inventoryItems, eq(branchStock.inventoryItemId, inventoryItems.id))
      .leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id))
      .innerJoin(measurementUnits, eq(inventoryItems.unitId, measurementUnits.id))
      .where(
        and(
          eq(branchStock.restaurantId, restaurantId),
          eq(branchStock.branchId, branchId)
        )
      )
      .orderBy(inventoryItems.name);

    return stocks.map((row: any) => ({
      ...row.stock,
      inventoryItem: {
        ...row.item,
        category: row.category,
        unit: row.unit,
      },
    }));
  }

  async getStockByItemId(
    restaurantId: string,
    branchId: string,
    inventoryItemId: string
  ): Promise<BranchStock | undefined> {
    const [stock] = await db
      .select()
      .from(branchStock)
      .where(
        and(
          eq(branchStock.restaurantId, restaurantId),
          eq(branchStock.branchId, branchId),
          eq(branchStock.inventoryItemId, inventoryItemId)
        )
      );
    return stock;
  }

  async updateBranchStock(
    restaurantId: string,
    branchId: string,
    inventoryItemId: string,
    quantity: string
  ): Promise<BranchStock> {
    const existing = await this.getStockByItemId(restaurantId, branchId, inventoryItemId);

    if (existing) {
      const [updated] = await db
        .update(branchStock)
        .set({
          quantity: parseFloat(quantity).toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(branchStock.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(branchStock)
        .values({
          restaurantId,
          branchId,
          inventoryItemId,
          quantity: parseFloat(quantity).toFixed(2),
        })
        .returning();
      return created;
    }
  }

  // Stock Movement operations
  async getStockMovements(
    restaurantId: string,
    branchId: string,
    filters?: {
      inventoryItemId?: string;
      movementType?: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Array<StockMovement & { inventoryItem: InventoryItem; recordedBy: User }>> {
    let conditions = [
      eq(stockMovements.restaurantId, restaurantId),
      eq(stockMovements.branchId, branchId),
    ];

    if (filters?.inventoryItemId) {
      conditions.push(eq(stockMovements.inventoryItemId, filters.inventoryItemId));
    }
    if (filters?.movementType) {
      conditions.push(eq(stockMovements.movementType, filters.movementType));
    }
    if (filters?.startDate) {
      conditions.push(gte(stockMovements.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(sql`${stockMovements.createdAt} <= ${endOfDay}`);
    }

    const movements = await db
      .select({
        movement: stockMovements,
        item: inventoryItems,
        user: users,
      })
      .from(stockMovements)
      .innerJoin(inventoryItems, eq(stockMovements.inventoryItemId, inventoryItems.id))
      .innerJoin(users, eq(stockMovements.recordedByUserId, users.id))
      .where(and(...conditions))
      .orderBy(desc(stockMovements.createdAt));

    return movements.map((row: any) => ({
      ...row.movement,
      inventoryItem: row.item,
      recordedBy: row.user,
    }));
  }

  async createStockMovement(
    restaurantId: string,
    userId: string,
    data: InsertStockMovement
  ): Promise<StockMovement> {
    const branchId = data.branchId;
    if (!branchId) {
      throw new Error('Branch ID é obrigatório para movimento de estoque');
    }

    return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
      const currentStock = await this.getStockByItemId(
        restaurantId,
        branchId,
        data.inventoryItemId
      );

      const currentQuantity = currentStock ? parseFloat(currentStock.quantity) : 0;
      const movementQuantity = parseFloat(data.quantity);
      let newQuantity = currentQuantity;

      switch (data.movementType) {
        case 'entrada':
          newQuantity = currentQuantity + movementQuantity;
          break;
        case 'saida':
          newQuantity = currentQuantity - movementQuantity;
          if (newQuantity < 0) {
            throw new Error('Estoque insuficiente para realizar esta saída');
          }
          break;
        case 'ajuste':
          newQuantity = movementQuantity;
          break;
        case 'transferencia':
          if (data.fromBranchId === data.branchId) {
            newQuantity = currentQuantity - movementQuantity;
            if (newQuantity < 0) {
              throw new Error('Estoque insuficiente para realizar esta transferência');
            }
          } else if (data.toBranchId === data.branchId) {
            newQuantity = currentQuantity + movementQuantity;
          }
          break;
      }

      const [movement] = await tx
        .insert(stockMovements)
        .values({
          inventoryItemId: data.inventoryItemId,
          branchId: branchId,
          movementType: data.movementType,
          fromBranchId: data.fromBranchId || null,
          toBranchId: data.toBranchId || null,
          restaurantId,
          recordedByUserId: userId,
          previousQuantity: currentQuantity.toFixed(2),
          newQuantity: newQuantity.toFixed(2),
          quantity: movementQuantity.toFixed(2),
          unitCost: data.unitCost ? parseFloat(data.unitCost).toFixed(2) : '0',
          totalCost: data.totalCost ? parseFloat(data.totalCost).toFixed(2) : '0',
          reason: data.reason || null,
          referenceId: data.referenceId || null,
        })
        .returning();

      await this.updateBranchStock(
        restaurantId,
        branchId,
        data.inventoryItemId,
        newQuantity.toFixed(2)
      );

      if (data.movementType === 'transferencia' && data.fromBranchId && data.toBranchId) {
        if (data.fromBranchId !== data.branchId && data.toBranchId !== data.branchId) {
          throw new Error('Transferência inválida: a filial de origem ou destino deve ser a filial atual');
        }

        const otherBranchId = data.branchId === data.fromBranchId ? data.toBranchId : data.fromBranchId;

        const otherStock = await this.getStockByItemId(
          restaurantId,
          otherBranchId,
          data.inventoryItemId
        );
        const otherCurrentQuantity = otherStock ? parseFloat(otherStock.quantity) : 0;
        const otherNewQuantity = data.branchId === data.fromBranchId
          ? otherCurrentQuantity + movementQuantity
          : otherCurrentQuantity - movementQuantity;

        if (otherNewQuantity < 0) {
          throw new Error('Estoque insuficiente na filial de origem');
        }

        await this.updateBranchStock(
          restaurantId,
          otherBranchId,
          data.inventoryItemId,
          otherNewQuantity.toFixed(2)
        );
      }

      return movement;
    });
  }

  // Inventory Stats
  async getInventoryStats(
    restaurantId: string,
    branchId: string
  ): Promise<{
    totalValue: string;
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
  }> {
    const stocks = await this.getBranchStock(restaurantId, branchId);

    const totalValue = stocks.reduce((sum: number, stock: any) => {
      const quantity = parseFloat(stock.quantity);
      const costPrice = parseFloat(stock.inventoryItem.costPrice);
      return sum + (quantity * costPrice);
    }, 0);

    const totalItems = stocks.length;

    const lowStockItems = stocks.filter((stock: any) => {
      const quantity = parseFloat(stock.quantity);
      const minStock = parseFloat(stock.inventoryItem.minStock);
      return quantity > 0 && quantity <= minStock;
    }).length;

    const outOfStockItems = stocks.filter((stock: any) => {
      return parseFloat(stock.quantity) === 0;
    }).length;

    return {
      totalValue: totalValue.toFixed(2),
      totalItems,
      lowStockItems,
      outOfStockItems,
    };
  }

  // Recipe Ingredients operations
  async getRecipeIngredients(
    restaurantId: string,
    menuItemId: string,
    tx?: PgTransaction<any, any, any>
  ): Promise<Array<RecipeIngredient & { inventoryItem: InventoryItem & { unit: MeasurementUnit } }>> {
    const executor = tx || db;
    const ingredients = await executor
      .select()
      .from(recipeIngredients)
      .leftJoin(inventoryItems, eq(recipeIngredients.inventoryItemId, inventoryItems.id))
      .leftJoin(measurementUnits, eq(inventoryItems.unitId, measurementUnits.id))
      .where(
        and(
          eq(recipeIngredients.restaurantId, restaurantId),
          eq(recipeIngredients.menuItemId, menuItemId)
        )
      )
      .orderBy(inventoryItems.name);

    return ingredients.map((row: any) => ({
      ...row.recipe_ingredients,
      inventoryItem: {
        ...row.inventory_items!,
        unit: row.measurement_units!,
      },
    }));
  }

  async addRecipeIngredient(
    restaurantId: string,
    data: InsertRecipeIngredient
  ): Promise<RecipeIngredient> {
    const [ingredient] = await db
      .insert(recipeIngredients)
      .values({
        ...data,
        restaurantId,
      })
      .returning();
    return ingredient;
  }

  async updateRecipeIngredient(
    id: string,
    restaurantId: string,
    data: UpdateRecipeIngredient
  ): Promise<RecipeIngredient> {
    const [updated] = await db
      .update(recipeIngredients)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(recipeIngredients.id, id),
          eq(recipeIngredients.restaurantId, restaurantId)
        )
      )
      .returning();
    return updated;
  }

  async deleteRecipeIngredient(id: string, restaurantId: string): Promise<void> {
    await db
      .delete(recipeIngredients)
      .where(
        and(
          eq(recipeIngredients.id, id),
          eq(recipeIngredients.restaurantId, restaurantId)
        )
      );
  }

  async getMenuItemRecipeCost(restaurantId: string, menuItemId: string): Promise<string> {
    const ingredients = await this.getRecipeIngredients(restaurantId, menuItemId);
    
    const totalCost = ingredients.reduce((sum, ingredient) => {
      const quantity = parseFloat(ingredient.quantity || "0");
      const costPrice = parseFloat(ingredient.inventoryItem.costPrice || "0");
      if (isNaN(quantity) || isNaN(costPrice)) {
        return sum;
      }
      return sum + (quantity * costPrice);
    }, 0);

    return totalCost.toFixed(2);
  }

  async checkStockAvailability(
    restaurantId: string,
    branchId: string,
    menuItemId: string,
    quantity: number
  ): Promise<{ available: boolean; missingItems: Array<{ itemName: string; required: string; available: string }> }> {
    const ingredients = await this.getRecipeIngredients(restaurantId, menuItemId);
    const missingItems: Array<{ itemName: string; required: string; available: string }> = [];

    for (const ingredient of ingredients) {
      const stock = await this.getStockByItemId(restaurantId, branchId, ingredient.inventoryItemId);
      const required = parseFloat(ingredient.quantity) * quantity;
      const available = stock ? parseFloat(stock.quantity) : 0;

      if (available < required) {
        missingItems.push({
          itemName: ingredient.inventoryItem.name,
          required: required.toFixed(2),
          available: available.toFixed(2),
        });
      }
    }

    return {
      available: missingItems.length === 0,
      missingItems,
    };
  }

  async deductStockForOrder(
    restaurantId: string,
    branchId: string,
    orderId: string,
    userId: string,
    tx?: PgTransaction<any, any, any>
  ): Promise<void> {
    const order = await this.getOrderById(restaurantId, orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // If transaction provided, use it directly for atomic operations
    if (tx) {
      for (const orderItem of order.orderItems) {
        const ingredients = await this.getRecipeIngredients(restaurantId, orderItem.menuItemId, tx);
        
        if (ingredients.length === 0) {
          console.log(`Prato ${orderItem.menuItemId} não possui receita cadastrada, pulando baixa de estoque`);
          continue;
        }
        
        for (const ingredient of ingredients) {
          const quantityToDeduct = parseFloat(ingredient.quantity) * orderItem.quantity;
          
          if (quantityToDeduct <= 0) {
            continue;
          }

          await tx.insert(stockMovements).values({
            id: nanoid(),
            restaurantId,
            branchId,
            inventoryItemId: ingredient.inventoryItemId,
            movementType: 'saida',
            quantity: quantityToDeduct.toFixed(2),
            reason: `Venda - Pedido #${orderId.substring(0, 8)}`,
            referenceId: orderId,
            performedBy: userId,
            createdAt: new Date(),
          });

          await tx
            .update(inventoryItems)
            .set({
              currentStock: sql`${inventoryItems.currentStock} - ${quantityToDeduct}`,
              updatedAt: new Date(),
            })
            .where(eq(inventoryItems.id, ingredient.inventoryItemId));
        }
      }
    } else {
      // No transaction provided, use createStockMovement which has its own transaction
      for (const orderItem of order.orderItems) {
        const ingredients = await this.getRecipeIngredients(restaurantId, orderItem.menuItemId);
        
        if (ingredients.length === 0) {
          console.log(`Prato ${orderItem.menuItemId} não possui receita cadastrada, pulando baixa de estoque`);
          continue;
        }
        
        for (const ingredient of ingredients) {
          const quantityToDeduct = parseFloat(ingredient.quantity) * orderItem.quantity;
          
          if (quantityToDeduct <= 0) {
            continue;
          }

          await this.createStockMovement(restaurantId, userId, {
            branchId,
            inventoryItemId: ingredient.inventoryItemId,
            movementType: 'saida',
            quantity: quantityToDeduct.toFixed(2),
            reason: `Venda - Pedido #${orderId.substring(0, 8)}`,
            referenceId: orderId,
          });
        }
      }
    }
  }

  async restoreStockForOrder(
    restaurantId: string,
    branchId: string,
    order: Order,
    userId: string,
    tx: PgTransaction<any, any, any>
  ): Promise<void> {
    for (const orderItem of order.orderItems) {
      const ingredients = await this.getRecipeIngredients(restaurantId, orderItem.menuItemId, tx);
      
      if (ingredients.length === 0) {
        console.log(`Prato ${orderItem.menuItemId} não possui receita cadastrada, pulando devolução de estoque`);
        continue;
      }
      
      for (const ingredient of ingredients) {
        const quantityToRestore = parseFloat(ingredient.quantity) * orderItem.quantity;
        
        if (quantityToRestore <= 0) {
          continue;
        }

        await tx.insert(stockMovements).values({
          id: nanoid(),
          restaurantId,
          branchId,
          inventoryItemId: ingredient.inventoryItemId,
          movementType: 'entrada',
          quantity: quantityToRestore.toFixed(2),
          reason: `Devolução - Pedido #${order.id.substring(0, 8)} cancelado`,
          referenceId: order.id,
          performedBy: userId,
          createdAt: new Date(),
        });

        await tx
          .update(inventoryItems)
          .set({
            currentStock: sql`${inventoryItems.currentStock} + ${quantityToRestore}`,
            updatedAt: new Date(),
          })
          .where(eq(inventoryItems.id, ingredient.inventoryItemId));
      }
    }
  }

  // ===== CUSTOMER OPERATIONS =====
  
  async getCustomers(
    restaurantId: string,
    branchId?: string | null,
    filters?: { search?: string; isActive?: number }
  ): Promise<Customer[]> {
    let conditions = [eq(customers.restaurantId, restaurantId)];
    
    if (branchId !== undefined && branchId !== null) {
      conditions.push(or(eq(customers.branchId, branchId), isNull(customers.branchId))!);
    }
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(customers.isActive, filters.isActive));
    }
    
    let query = db.select().from(customers).where(and(...conditions));
    
    const results = await query.orderBy(desc(customers.createdAt));
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      return results.filter((c: Customer) => 
        c.name.toLowerCase().includes(searchTerm) ||
        c.phone?.toLowerCase().includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm) ||
        c.cpf?.toLowerCase().includes(searchTerm)
      );
    }
    
    return results;
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByPhone(restaurantId: string, phone: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.restaurantId, restaurantId), eq(customers.phone, phone)));
    return customer;
  }

  async getCustomerByCpf(restaurantId: string, cpf: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.restaurantId, restaurantId), eq(customers.cpf, cpf)));
    return customer;
  }

  async createCustomer(
    restaurantId: string,
    branchId: string | null,
    data: InsertCustomer
  ): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values({
        ...data,
        restaurantId,
        branchId,
      })
      .returning();
    return customer;
  }

  async updateCustomer(
    id: string,
    restaurantId: string,
    data: UpdateCustomer
  ): Promise<Customer> {
    const [updated] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(customers.id, id), eq(customers.restaurantId, restaurantId)))
      .returning();
    return updated;
  }

  async deleteCustomer(id: string, restaurantId: string): Promise<void> {
    await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.restaurantId, restaurantId)));
  }

  async updateCustomerTier(customerId: string, restaurantId: string): Promise<Customer> {
    const customer = await this.getCustomerById(customerId);
    if (!customer) {
      throw new Error('Cliente não encontrado');
    }

    const program = await this.getLoyaltyProgram(restaurantId);
    if (!program) {
      return customer;
    }

    const totalSpent = parseFloat(customer.totalSpent);
    let newTier: 'bronze' | 'prata' | 'ouro' | 'platina' = 'bronze';

    if (totalSpent >= parseFloat(program.platinumTierMinSpent || '0')) {
      newTier = 'platina';
    } else if (totalSpent >= parseFloat(program.goldTierMinSpent || '0')) {
      newTier = 'ouro';
    } else if (totalSpent >= parseFloat(program.silverTierMinSpent || '0')) {
      newTier = 'prata';
    }

    if (newTier !== customer.tier) {
      const [updated] = await db
        .update(customers)
        .set({ tier: newTier, updatedAt: new Date() })
        .where(eq(customers.id, customerId))
        .returning();
      return updated;
    }

    return customer;
  }

  async getCustomerStats(
    restaurantId: string,
    branchId: string | null
  ): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    newThisMonth: number;
    topCustomers: Array<Customer & { orderCount: number }>;
  }> {
    let conditions = [eq(customers.restaurantId, restaurantId)];
    
    if (branchId) {
      conditions.push(or(eq(customers.branchId, branchId), isNull(customers.branchId))!);
    }

    const allCustomers = await db
      .select()
      .from(customers)
      .where(and(...conditions));

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalCustomers: allCustomers.length,
      activeCustomers: allCustomers.filter((c: Customer) => c.isActive === 1).length,
      newThisMonth: allCustomers.filter((c: Customer) => c.createdAt && c.createdAt >= firstDayOfMonth).length,
      topCustomers: [] as Array<Customer & { orderCount: number }>,
    };

    const topCustomersData = allCustomers
      .sort((a: Customer, b: Customer) => parseFloat(b.totalSpent) - parseFloat(a.totalSpent))
      .slice(0, 5)
      .map((c: Customer) => ({
        ...c,
        orderCount: c.visitCount,
      }));

    stats.topCustomers = topCustomersData;

    return stats;
  }

  // ===== LOYALTY PROGRAM OPERATIONS =====

  async getLoyaltyProgram(restaurantId: string): Promise<LoyaltyProgram | undefined> {
    const [program] = await db
      .select()
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.restaurantId, restaurantId));
    return program;
  }

  async createOrUpdateLoyaltyProgram(
    restaurantId: string,
    data: InsertLoyaltyProgram
  ): Promise<LoyaltyProgram> {
    const existing = await this.getLoyaltyProgram(restaurantId);

    if (existing) {
      const [updated] = await db
        .update(loyaltyPrograms)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(loyaltyPrograms.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(loyaltyPrograms)
        .values({ ...data, restaurantId })
        .returning();
      return created;
    }
  }

  // ===== LOYALTY TRANSACTION OPERATIONS =====

  async getLoyaltyTransactions(
    restaurantId: string,
    customerId?: string,
    filters?: { startDate?: Date; endDate?: Date }
  ): Promise<Array<LoyaltyTransaction & { customer: Customer }>> {
    let conditions = [eq(loyaltyTransactions.restaurantId, restaurantId)];

    if (customerId) {
      conditions.push(eq(loyaltyTransactions.customerId, customerId));
    }

    if (filters?.startDate) {
      conditions.push(gte(loyaltyTransactions.createdAt, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(sql`${loyaltyTransactions.createdAt} <= ${filters.endDate}`);
    }

    const transactions = await db
      .select()
      .from(loyaltyTransactions)
      .leftJoin(customers, eq(loyaltyTransactions.customerId, customers.id))
      .where(and(...conditions))
      .orderBy(desc(loyaltyTransactions.createdAt));

    return transactions.map((t: any) => ({
      ...t.loyalty_transactions,
      customer: t.customers!,
    }));
  }

  async createLoyaltyTransaction(
    restaurantId: string,
    data: InsertLoyaltyTransaction
  ): Promise<LoyaltyTransaction> {
    const [transaction] = await db
      .insert(loyaltyTransactions)
      .values({ ...data, restaurantId })
      .returning();

    await db
      .update(customers)
      .set({
        loyaltyPoints: sql`${customers.loyaltyPoints} + ${data.points}`,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, data.customerId));

    return transaction;
  }

  async calculateLoyaltyPoints(restaurantId: string, orderValue: number): Promise<number> {
    const program = await this.getLoyaltyProgram(restaurantId);
    if (!program || program.isActive !== 1) {
      return 0;
    }

    const pointsPerCurrency = parseFloat(program.pointsPerCurrency);
    return Math.floor(orderValue * pointsPerCurrency);
  }

  async redeemLoyaltyPoints(
    restaurantId: string,
    customerId: string,
    points: number,
    orderId?: string,
    userId?: string
  ): Promise<{ transaction: LoyaltyTransaction; discountAmount: number }> {
    const customer = await this.getCustomerById(customerId);
    if (!customer) {
      throw new Error('Cliente não encontrado');
    }

    if (customer.loyaltyPoints < points) {
      throw new Error('Pontos insuficientes');
    }

    const program = await this.getLoyaltyProgram(restaurantId);
    if (!program || program.isActive !== 1) {
      throw new Error('Programa de fidelidade não está ativo');
    }

    if (points < program.minPointsToRedeem) {
      throw new Error(`Mínimo de ${program.minPointsToRedeem} pontos necessário para resgate`);
    }

    const currencyPerPoint = parseFloat(program.currencyPerPoint);
    const discountAmount = points * currencyPerPoint;

    const transaction = await this.createLoyaltyTransaction(restaurantId, {
      customerId,
      orderId: orderId || null,
      type: 'resgate',
      points: -points,
      description: `Resgate de ${points} pontos`,
      createdBy: userId || null,
    });

    return { transaction, discountAmount };
  }

  // ===== COUPON OPERATIONS =====

  async getCoupons(
    restaurantId: string,
    branchId?: string | null,
    filters?: { isActive?: number; code?: string }
  ): Promise<Coupon[]> {
    let conditions = [eq(coupons.restaurantId, restaurantId)];

    if (branchId !== undefined && branchId !== null) {
      conditions.push(or(eq(coupons.branchId, branchId), isNull(coupons.branchId))!);
    }

    if (filters?.isActive !== undefined) {
      conditions.push(eq(coupons.isActive, filters.isActive));
    }

    if (filters?.code) {
      conditions.push(eq(coupons.code, filters.code.toUpperCase()));
    }

    return await db
      .select()
      .from(coupons)
      .where(and(...conditions))
      .orderBy(desc(coupons.createdAt));
  }

  async getCouponById(id: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }

  async getCouponByCode(restaurantId: string, code: string): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.restaurantId, restaurantId), eq(coupons.code, code.toUpperCase())));
    return coupon;
  }

  async createCoupon(
    restaurantId: string,
    branchId: string | null,
    data: InsertCoupon,
    userId?: string
  ): Promise<Coupon> {
    const [coupon] = await db
      .insert(coupons)
      .values({
        ...data,
        restaurantId,
        branchId,
        code: data.code.toUpperCase(),
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        createdBy: userId || null,
      })
      .returning();
    return coupon;
  }

  async updateCoupon(id: string, restaurantId: string, data: UpdateCoupon): Promise<Coupon> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.code) {
      updateData.code = data.code.toUpperCase();
    }
    if (data.validFrom) {
      updateData.validFrom = new Date(data.validFrom);
    }
    if (data.validUntil) {
      updateData.validUntil = new Date(data.validUntil);
    }

    const [updated] = await db
      .update(coupons)
      .set(updateData)
      .where(and(eq(coupons.id, id), eq(coupons.restaurantId, restaurantId)))
      .returning();
    return updated;
  }

  async deleteCoupon(id: string, restaurantId: string): Promise<void> {
    await db
      .delete(coupons)
      .where(and(eq(coupons.id, id), eq(coupons.restaurantId, restaurantId)));
  }

  async validateCoupon(
    restaurantId: string,
    code: string,
    orderValue: number,
    orderType?: string,
    customerId?: string
  ): Promise<{ valid: boolean; message?: string; coupon?: Coupon; discountAmount?: number }> {
    const coupon = await this.getCouponByCode(restaurantId, code);

    if (!coupon) {
      return { valid: false, message: 'Cupom não encontrado' };
    }

    if (coupon.isActive !== 1) {
      return { valid: false, message: 'Cupom inativo' };
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      return { valid: false, message: 'Cupom ainda não válido' };
    }

    if (coupon.validUntil < now) {
      return { valid: false, message: 'Cupom expirado' };
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return { valid: false, message: 'Cupom atingiu limite de usos' };
    }

    if (orderValue < parseFloat(coupon.minOrderValue || '0')) {
      return {
        valid: false,
        message: `Pedido mínimo de ${coupon.minOrderValue} necessário`,
      };
    }

    if (orderType && coupon.applicableOrderTypes && coupon.applicableOrderTypes.length > 0) {
      if (!coupon.applicableOrderTypes.includes(orderType)) {
        return { valid: false, message: 'Cupom não válido para este tipo de pedido' };
      }
    }

    if (customerId && coupon.maxUsesPerCustomer) {
      const usageCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(couponUsages)
        .where(
          and(
            eq(couponUsages.couponId, coupon.id),
            eq(couponUsages.customerId, customerId)
          )
        );

      if (usageCount[0].count >= coupon.maxUsesPerCustomer) {
        return { valid: false, message: 'Você já atingiu o limite de usos deste cupom' };
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'valor') {
      discountAmount = parseFloat(coupon.discountValue);
    } else {
      discountAmount = (orderValue * parseFloat(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
      }
    }

    return { valid: true, coupon, discountAmount };
  }

  async applyCoupon(
    restaurantId: string,
    couponId: string,
    orderId: string,
    customerId?: string,
    discountApplied?: number
  ): Promise<CouponUsage> {
    const [usage] = await db
      .insert(couponUsages)
      .values({
        restaurantId,
        couponId,
        orderId,
        customerId: customerId || null,
        discountApplied: discountApplied?.toFixed(2) || '0',
      })
      .returning();

    await db
      .update(coupons)
      .set({ currentUses: sql`${coupons.currentUses} + 1` })
      .where(eq(coupons.id, couponId));

    return usage;
  }

  // ===== COUPON USAGE OPERATIONS =====

  async getCouponUsages(
    restaurantId: string,
    filters?: { couponId?: string; customerId?: string; startDate?: Date; endDate?: Date }
  ): Promise<Array<CouponUsage & { coupon: Coupon; customer?: Customer; order?: Order }>> {
    let conditions = [eq(couponUsages.restaurantId, restaurantId)];

    if (filters?.couponId) {
      conditions.push(eq(couponUsages.couponId, filters.couponId));
    }

    if (filters?.customerId) {
      conditions.push(eq(couponUsages.customerId, filters.customerId));
    }

    if (filters?.startDate) {
      conditions.push(gte(couponUsages.createdAt, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(sql`${couponUsages.createdAt} <= ${filters.endDate}`);
    }

    const usages = await db
      .select()
      .from(couponUsages)
      .leftJoin(coupons, eq(couponUsages.couponId, coupons.id))
      .leftJoin(customers, eq(couponUsages.customerId, customers.id))
      .leftJoin(orders, eq(couponUsages.orderId, orders.id))
      .where(and(...conditions))
      .orderBy(desc(couponUsages.createdAt));

    return usages.map((u: any) => ({
      ...u.coupon_usages,
      coupon: u.coupons!,
      customer: u.customers || undefined,
      order: u.orders || undefined,
    }));
  }

  async getCouponStats(
    restaurantId: string,
    branchId: string | null
  ): Promise<{
    totalCoupons: number;
    activeCoupons: number;
    totalUsages: number;
    totalDiscount: string;
    topCoupons: Array<{ coupon: Coupon; usageCount: number; totalDiscount: string }>;
  }> {
    let conditions = [eq(coupons.restaurantId, restaurantId)];

    if (branchId) {
      conditions.push(or(eq(coupons.branchId, branchId), isNull(coupons.branchId))!);
    }

    const allCoupons = await db
      .select()
      .from(coupons)
      .where(and(...conditions));

    const now = new Date();
    const activeCoupons = allCoupons.filter(
      (c: Coupon) => c.isActive === 1 && c.validFrom <= now && c.validUntil >= now
    );

    let usageConditions = [eq(couponUsages.restaurantId, restaurantId)];
    const allUsages = await db
      .select()
      .from(couponUsages)
      .where(and(...usageConditions));

    const totalDiscount = allUsages
      .reduce((sum: number, usage: CouponUsage) => sum + parseFloat(usage.discountApplied), 0)
      .toFixed(2);

    const couponUsageMap = new Map<string, { count: number; total: number }>();
    allUsages.forEach((usage: CouponUsage) => {
      const existing = couponUsageMap.get(usage.couponId) || { count: 0, total: 0 };
      couponUsageMap.set(usage.couponId, {
        count: existing.count + 1,
        total: existing.total + parseFloat(usage.discountApplied),
      });
    });

    const topCoupons = Array.from(couponUsageMap.entries())
      .map(([couponId, stats]) => ({
        coupon: allCoupons.find((c: Coupon) => c.id === couponId)!,
        usageCount: stats.count,
        totalDiscount: stats.total.toFixed(2),
      }))
      .filter(item => item.coupon)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    return {
      totalCoupons: allCoupons.length,
      activeCoupons: activeCoupons.length,
      totalUsages: allUsages.length,
      totalDiscount,
      topCoupons,
    };
  }

  // Order-Customer-Coupon-Loyalty integration methods
  async linkCustomerToOrder(restaurantId: string, orderId: string, customerId: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ customerId, updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurantId)))
      .returning();
    
    if (!updated) {
      throw new Error("Pedido não encontrado");
    }

    return updated;
  }

  async applyCouponToOrder(restaurantId: string, orderId: string, couponId: string, discountAmount: number): Promise<Order> {
    const order = await this.getOrderById(restaurantId, orderId);
    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    const subtotal = parseFloat(order.subtotal || "0");
    const discount = Math.min(discountAmount, subtotal);

    await db
      .update(orders)
      .set({ 
        couponId, 
        couponDiscount: discount.toFixed(2),
        updatedAt: new Date() 
      })
      .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurantId)));

    await this.applyCoupon(restaurantId, couponId, orderId, order.customerId || undefined, discount);

    return this.calculateOrderTotal(orderId);
  }

  async redeemLoyaltyPointsForOrder(
    restaurantId: string, 
    customerId: string, 
    points: number, 
    orderId: string, 
    userId: string
  ): Promise<{ order: Order; transaction: LoyaltyTransaction; discountAmount: number }> {
    const result = await this.redeemLoyaltyPoints(restaurantId, customerId, points, orderId, userId);

    await db
      .update(orders)
      .set({ 
        loyaltyPointsRedeemed: points,
        loyaltyDiscountAmount: result.discountAmount.toFixed(2),
        updatedAt: new Date() 
      })
      .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurantId)));

    const order = await this.calculateOrderTotal(orderId);

    return {
      order,
      transaction: result.transaction,
      discountAmount: result.discountAmount
    };
  }

  async getLoyaltyStats(restaurantId: string): Promise<{
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    activeCustomers: number;
    tierDistribution: { bronze: number; prata: number; ouro: number; platina: number };
  }> {
    const allTransactions = await db
      .select()
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.restaurantId, restaurantId));

    const totalPointsEarned = allTransactions
      .filter((t: LoyaltyTransaction) => t.type === 'ganho' || t.type === 'bonus')
      .reduce((sum: number, t: LoyaltyTransaction) => sum + t.points, 0);

    const totalPointsRedeemed = allTransactions
      .filter((t: LoyaltyTransaction) => t.type === 'resgate' || t.type === 'expiracao')
      .reduce((sum: number, t: LoyaltyTransaction) => sum + Math.abs(t.points), 0);

    const allCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.restaurantId, restaurantId));

    const activeCustomers = allCustomers.filter((c: Customer) => (c.loyaltyPoints || 0) > 0).length;

    const tierDistribution = {
      bronze: allCustomers.filter((c: Customer) => c.tier === 'bronze').length,
      prata: allCustomers.filter((c: Customer) => c.tier === 'prata').length,
      ouro: allCustomers.filter((c: Customer) => c.tier === 'ouro').length,
      platina: allCustomers.filter((c: Customer) => c.tier === 'platina').length,
    };

    return {
      totalPointsEarned,
      totalPointsRedeemed,
      activeCustomers,
      tierDistribution,
    };
  }
}

export const storage = new DatabaseStorage();
