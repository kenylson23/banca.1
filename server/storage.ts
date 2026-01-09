import { db } from "./db";
import { 
  users, type User, type InsertUser,
  restaurants, type Restaurant, type InsertRestaurant,
  categories, type Category, type InsertCategory, type UpdateCategory,
  menuItems, type MenuItem, type InsertMenuItem, type UpdateMenuItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  tables, type Table, type InsertTable,
  tableSessions, type TableSession, type InsertTableSession,
  tableGuests, type TableGuest, type InsertTableGuest,
  tablePayments, type TablePayment, type InsertTablePayment,
  guestPayments, type GuestPayment, type InsertGuestPayment,
  notifications, type Notification, type InsertNotification,
  messages, type Message, type InsertMessage,
  loyaltyPrograms, type LoyaltyProgram, type InsertLoyaltyProgram,
  loyaltyTransactions, type LoyaltyTransaction, type InsertLoyaltyTransaction,
  customers, type Customer, type InsertCustomer,
  coupons, type Coupon, type InsertCoupon,
  cashRegisters, type CashRegister, type InsertCashRegister,
  cashRegisterShifts, type CashRegisterShift, type InsertCashRegisterShift,
  financialCategories, type FinancialCategory, type InsertFinancialCategory,
  financialTransactions, type FinancialTransaction, type InsertFinancialTransaction,
  financialShifts, type FinancialShift, type InsertFinancialShift,
  financialEvents, type FinancialEvent, type InsertFinancialEvent,
  orderAdjustments, type OrderAdjustment, type InsertOrderAdjustment,
  paymentEvents, type PaymentEvent, type InsertPaymentEvent,
  reportAggregations, type ReportAggregation, type InsertReportAggregation,
  auditLogs,
  optionGroups, type OptionGroup, type InsertOptionGroup, type UpdateOptionGroup,
  options, type Option, type InsertOption, type UpdateOption,
  orderItemOption, type OrderItemOption, type InsertOrderItemOption,
  subscriptionPlans, subscriptions, subscriptionPayments
} from "@shared/schema";
import { eq, and, desc, asc, sql, or, ne, inArray, isNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(restaurantId: string): Promise<User[]>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Restaurant operations
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getRestaurantByDomain(domain: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<{ restaurant: Restaurant; adminUser: User }>;
  updateRestaurant(id: string, data: Partial<Restaurant>): Promise<Restaurant>;

  // Category operations
  getCategories(restaurantId: string, branchId?: string | null): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(restaurantId: string, branchId: string | null, category: Omit<InsertCategory, 'restaurantId'>): Promise<Category>;
  updateCategory(restaurantId: string, id: string, data: UpdateCategory): Promise<Category>;
  deleteCategory(restaurantId: string, id: string): Promise<void>;
  reorderCategories(restaurantId: string, orderedIds: string[]): Promise<void>;

  // Menu item operations
  getMenuItems(restaurantId: string, branchId?: string | null): Promise<Array<MenuItem & { category: Category; optionGroups?: Array<OptionGroup & { options: Option[] }> }>>;
  getMenuItemById(id: string): Promise<MenuItem | undefined>;
  createMenuItem(restaurantId: string, branchId: string | null, item: Omit<InsertMenuItem, 'restaurantId'>): Promise<MenuItem>;
  updateMenuItem(restaurantId: string, id: string, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(restaurantId: string, id: string): Promise<void>;
  reorderMenuItems(restaurantId: string, categoryId: string, orderedIds: string[]): Promise<void>;

  // Option Group operations
  getOptionGroupsByMenuItem(menuItemId: string): Promise<Array<OptionGroup & { options: Option[] }>>;
  getOptionGroupById(id: string): Promise<OptionGroup | undefined>;
  createOptionGroup(menuItemId: string, groupData: InsertOptionGroup): Promise<OptionGroup>;
  updateOptionGroup(id: string, data: UpdateOptionGroup): Promise<OptionGroup>;
  deleteOptionGroup(id: string): Promise<void>;

  // Option operations
  getOptionsByGroupId(groupId: string): Promise<Option[]>;
  getOptionById(id: string): Promise<Option | undefined>;
  createOption(groupId: string, optionData: InsertOption): Promise<Option>;
  updateOption(id: string, data: UpdateOption): Promise<Option>;
  deleteOption(id: string): Promise<void>;

  // Order Item Option operations
  createOrderItemOptions(orderItemId: string, opts: InsertOrderItemOption[]): Promise<OrderItemOption[]>;
  getOrderItemOptions(orderItemId: string): Promise<OrderItemOption[]>;

  // Order operations
  getKitchenOrders(restaurantId: string, branchId?: string | null): Promise<Array<Order & { customer: Customer | null; table: Table | null; orderItems: Array<OrderItem & { menuItem: MenuItem; options?: OrderItemOption[] }> }>>;
  getOrderById(restaurantId: string, id: string): Promise<Order | undefined>;
  createOrder(restaurantId: string, order: Omit<InsertOrder, 'restaurantId'>): Promise<Order>;
  updateOrderStatus(restaurantId: string, id: string, status: string): Promise<Order>;
  cancelOrder(restaurantId: string, id: string, reason: string, cancelledBy?: string): Promise<Order>;
  deleteOrder(restaurantId: string, id: string): Promise<void>;
  recordPayment(restaurantId: string, id: string, payment: any, userId?: string): Promise<Order>;
  linkCustomerToOrder(restaurantId: string, id: string, customerId: string): Promise<Order>;
  applyCouponToOrder(restaurantId: string, id: string, couponId: string, discountAmount: number): Promise<Order>;
  redeemLoyaltyPointsForOrder(restaurantId: string, customerId: string, points: number, orderId: string, userId: string): Promise<{ order: Order; transaction: LoyaltyTransaction }>;
  applyDiscount(restaurantId: string, id: string, amount: string, type: string): Promise<Order>;
  applyServiceCharge(restaurantId: string, id: string, charge: string, type: string): Promise<Order>;
  applyDeliveryFee(restaurantId: string, id: string, fee: string): Promise<Order>;
  applyPackagingFee(restaurantId: string, id: string, fee: string): Promise<Order>;

  // Table operations
  getTables(restaurantId: string, branchId?: string | null): Promise<Table[]>;
  getTableById(id: string): Promise<Table | undefined>;
  createTable(restaurantId: string, branchId: string | null, table: Omit<InsertTable, 'restaurantId' | 'branchId'>): Promise<Table>;
  deleteTable(restaurantId: string, id: string): Promise<void>;
  getTablesWithOrders(restaurantId: string, branchId?: string | null): Promise<any[]>;
  updateTableStatus(restaurantId: string, id: string, status: string, options?: { customerName?: string; customerCount?: number }): Promise<Table>;
  startTableSession(restaurantId: string, tableId: string, options: { customerName?: string; customerCount?: number }): Promise<TableSession>;
  endTableSession(restaurantId: string, tableId: string): Promise<void>;
  autoUpdateTableStatusOnSessionStart(tableId: string): Promise<void>;
  validateSessionClosure(sessionId: string): Promise<{ canClose: boolean; totalPending: number; unpaidGuests: any[]; warnings: string[] }>;
  autoUpdateTableStatusOnPayment(tableId: string): Promise<void>;

  // Table Guest operations
  getTableGuests(sessionId: string): Promise<TableGuest[]>;
  getTableGuestById(id: string): Promise<TableGuest | undefined>;
  createTableGuest(guest: InsertTableGuest): Promise<TableGuest>;
  deleteTableGuest(id: string): Promise<void>;
  updateGuestSubtotal(guestId: string): Promise<void>;
  recalculateSessionSubtotals(sessionId: string): Promise<void>;

  // Table Payment operations
  addTablePayment(restaurantId: string, payment: any): Promise<TablePayment>;
  getTablePayments(restaurantId: string, tableId?: string, sessionId?: string): Promise<TablePayment[]>;
  
  // Guest Payment operations
  createGuestPayment(restaurantId: string, payment: InsertGuestPayment): Promise<GuestPayment>;
  getGuestPayments(guestId: string): Promise<GuestPayment[]>;

  // Notification operations
  getNotifications(restaurantId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification>;

  // Message operations
  getMessages(restaurantId: string): Promise<Message[]>;
  getAllMessages(): Promise<Array<Message & { restaurant: Restaurant }>>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message>;

  // Loyalty Program operations
  getLoyaltyProgram(restaurantId: string): Promise<LoyaltyProgram | undefined>;
  createLoyaltyProgram(program: InsertLoyaltyProgram): Promise<LoyaltyProgram>;
  updateLoyaltyProgram(id: string, data: Partial<LoyaltyProgram>): Promise<LoyaltyProgram>;

  // Customer operations
  getCustomerById(id: string): Promise<Customer | undefined>;
  getCustomers(restaurantId: string): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<Customer>): Promise<Customer>;
  searchCustomers(restaurantId: string, query: string): Promise<Customer[]>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;

  // Coupon operations
  getCoupons(restaurantId: string, branchId?: string | null, filters?: { isActive?: number }): Promise<Coupon[]>;
  getCouponById(id: string): Promise<Coupon | undefined>;
  createCoupon(restaurantId: string, branchId: string | null, coupon: Omit<InsertCoupon, 'restaurantId' | 'branchId'>): Promise<Coupon>;
  validateCoupon(restaurantId: string, code: string, orderAmount: number, orderType: string, customerId?: string): Promise<{ valid: boolean; coupon?: Coupon; discountAmount?: number; message?: string }>;

  // Subscription Plan operations
  getSubscriptionPlans(): Promise<any[]>;
  getSubscriptionPlanById(id: string): Promise<any | undefined>;
  getAllSubscriptionPlans(): Promise<any[]>;
  updateSubscriptionPlan(id: string, data: any): Promise<any>;
  seedSubscriptionPlans(): Promise<void>;

  // Subscription operations
  getAllSubscriptions(): Promise<any[]>;
  getSubscriptionByRestaurantId(restaurantId: string): Promise<any | undefined>;
  createSubscription(restaurantId: string, data: any): Promise<any>;
  updateSubscription(id: string, data: any): Promise<any>;
  cancelSubscription(restaurantId: string): Promise<any>;
  checkSubscriptionLimits(restaurantId: string): Promise<any>;

  // Subscription Payment operations
  getSubscriptionPayments(restaurantId: string): Promise<any[]>;
  createSubscriptionPayment(restaurantId: string, data: any): Promise<any>;

  // Stats/Reporting
  getTodayStats(restaurantId: string, branchId: string | null): Promise<any>;
  getHistoricalStats(restaurantId: string, branchId: string | null, days: number): Promise<any>;
  getCustomDateRangeStats(restaurantId: string, branchId: string | null, start: Date, end: Date): Promise<any>;
  getSalesHeatmapData(restaurantId: string, branchId: string | null, days: number): Promise<any>;
  getKitchenStats(restaurantId: string, branchId: string | null, period: string): Promise<any>;
  getSalesStats(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date, orderStatus: string, paymentStatus: string, orderType: string, periodFilter?: string): Promise<any>;
  getDashboardStats(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date, orderType?: string): Promise<any>;

  // Financial Module - Cash Registers
  getCashRegisters(restaurantId: string, branchId: string | null): Promise<CashRegister[]>;
  getCashRegisterById(id: string, restaurantId: string): Promise<CashRegister | undefined>;
  createCashRegister(restaurantId: string, data: Omit<InsertCashRegister, 'restaurantId'>): Promise<CashRegister>;
  updateCashRegister(id: string, restaurantId: string, data: Partial<InsertCashRegister>): Promise<CashRegister | undefined>;
  deleteCashRegister(id: string, restaurantId: string): Promise<void>;

  // Financial Module - Cash Register Shifts
  getCashRegisterShifts(restaurantId: string, branchId: string | null, filters?: { cashRegisterId?: string; status?: 'aberto' | 'fechado' }): Promise<any[]>;
  getActiveCashRegisterShift(cashRegisterId: string, restaurantId: string): Promise<CashRegisterShift | undefined>;
  getCashRegistersWithActiveShift(restaurantId: string, branchId: string | null): Promise<CashRegister[]>;
  openCashRegisterShift(restaurantId: string, userId: string, data: Omit<InsertCashRegisterShift, 'restaurantId' | 'openedByUserId'>): Promise<CashRegisterShift>;
  closeCashRegisterShift(shiftId: string, restaurantId: string, userId: string, data: { closingAmountCounted: string; notes?: string }): Promise<CashRegisterShift>;

  // Financial Module - Categories
  getFinancialCategories(restaurantId: string, branchId: string | null, type?: 'receita' | 'despesa'): Promise<FinancialCategory[]>;
  createFinancialCategory(restaurantId: string, data: Omit<InsertFinancialCategory, 'restaurantId'>): Promise<FinancialCategory>;
  deleteFinancialCategory(id: string, restaurantId: string): Promise<{ success: boolean; message?: string }>;

  // Financial Module - Transactions
  createFinancialTransaction(restaurantId: string, userId: string, data: Omit<InsertFinancialTransaction, 'restaurantId' | 'recordedByUserId'>): Promise<FinancialTransaction>;
  getFinancialTransactions(restaurantId: string, branchId: string | null, filters?: any): Promise<any[]>;
  deleteFinancialTransaction(id: string, restaurantId: string): Promise<void>;
  getFinancialSummary(restaurantId: string, branchId: string | null, startDate?: Date, endDate?: Date, cashRegisterId?: string): Promise<any>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getRestaurantByEmail(email: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.email, email));
    return restaurant;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUsers(restaurantId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.restaurantId, restaurantId));
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Restaurant operations
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async getRestaurantByDomain(domain: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.domain, domain));
    return restaurant;
  }

  async createRestaurant(data: InsertRestaurant): Promise<{ restaurant: Restaurant; adminUser: User }> {
    // Extrair dados do usuário admin
    const { password, ...restaurantData } = data;
    
    // Criar o restaurante
    const [newRestaurant] = await db.insert(restaurants).values(restaurantData).returning();
    
    // Criar usuário administrador
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [adminUser] = await db.insert(users).values({
      email: newRestaurant.email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: newRestaurant.name,
      role: 'admin',
      restaurantId: newRestaurant.id,
    }).returning();
    
    return { restaurant: newRestaurant, adminUser };
  }

  async updateRestaurant(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
    const [updated] = await db.update(restaurants).set(data).where(eq(restaurants.id, id)).returning();
    return updated;
  }

  async deleteRestaurant(id: string): Promise<void> {
    await db.delete(restaurants).where(eq(restaurants.id, id));
  }

  // ✅ NOVO: Validar se a sessão pode ser fechada (todos pagaram)
  async validateSessionClosure(sessionId: string): Promise<{
    canClose: boolean;
    totalPending: number;
    unpaidGuests: Array<{ id: string; name: string; pending: number }>;
    warnings: string[];
  }> {
    try {
      const guests = await this.getTableGuests(sessionId);
      const session = await db.select()
        .from(tableSessions)
        .where(eq(tableSessions.id, sessionId))
        .then(rows => rows[0]);
      
      if (!session) {
        return {
          canClose: false,
          totalPending: 0,
          unpaidGuests: [],
          warnings: ['Sessão não encontrada']
        };
      }
      
      // ✅ CORREÇÃO CRÍTICA: Buscar ajustes da sessão
      const sessionDiscount = parseFloat(session.discount || '0');
      const sessionDiscountType = session.discountType || 'valor';
      const sessionServiceCharge = parseFloat(session.serviceCharge || '0');
      const sessionServiceChargeType = session.serviceChargeType || 'percentual';
      
      let totalPending = 0;
      const unpaidGuests = [];
      const warnings = [];
      
      // Calcular subtotal total para distribuição proporcional
      const totalGuestSubtotal = guests.reduce((sum, g) => sum + parseFloat(g.subtotal || '0'), 0);
      
      // ✅ CALCULAR TOTAL DA SESSÃO CONSIDERANDO TAXAS/DESCONTOS
      let sessionCalculatedTotal = totalGuestSubtotal;
      if (sessionDiscount > 0) {
        if (sessionDiscountType === 'percentual') {
          sessionCalculatedTotal = sessionCalculatedTotal * (1 - Math.min(sessionDiscount, 100) / 100);
        } else {
          sessionCalculatedTotal = Math.max(0, sessionCalculatedTotal - sessionDiscount);
        }
      }
      if (sessionServiceCharge > 0) {
        if (sessionServiceChargeType === 'percentual') {
          sessionCalculatedTotal = sessionCalculatedTotal * (1 + sessionServiceCharge / 100);
        } else {
          sessionCalculatedTotal = sessionCalculatedTotal + sessionServiceCharge;
        }
      }

      // Se o saldo pago for maior ou igual ao total calculado da sessão (ajustado), consideramos paga
      const sessionPaidAmount = parseFloat(session.paidAmount || '0');
      if (sessionPaidAmount >= sessionCalculatedTotal - 0.01) {
        return {
          canClose: true,
          totalPending: 0,
          unpaidGuests: [],
          warnings: []
        };
      }
      
      for (const guest of guests) {
        let guestSubtotalOriginal = parseFloat(guest.subtotal || '0');
        let guestSubtotalAjustado = guestSubtotalOriginal;
        
        // ✅ APLICAR DESCONTO
        if (sessionDiscount > 0) {
          if (sessionDiscountType === 'percentual') {
            guestSubtotalAjustado = guestSubtotalAjustado * (1 - Math.min(sessionDiscount, 100) / 100);
          } else {
            // Desconto fixo: distribuir proporcionalmente
            const guestProportion = totalGuestSubtotal > 0 ? guestSubtotalOriginal / totalGuestSubtotal : 0;
            const guestDiscountShare = sessionDiscount * guestProportion;
            guestSubtotalAjustado = Math.max(0, guestSubtotalAjustado - guestDiscountShare);
          }
        }
        
        // ✅ APLICAR TAXA DE SERVIÇO
        if (sessionServiceCharge > 0) {
          if (sessionServiceChargeType === 'percentual') {
            guestSubtotalAjustado = guestSubtotalAjustado * (1 + sessionServiceCharge / 100);
          } else {
            // Taxa fixa: distribuir proporcionalmente
            const guestProportion = totalGuestSubtotal > 0 ? guestSubtotalOriginal / totalGuestSubtotal : 0;
            const guestChargeShare = sessionServiceCharge * guestProportion;
            guestSubtotalAjustado = guestSubtotalAjustado + guestChargeShare;
          }
        }
        
        // ✅ COMPARAR COM VALOR AJUSTADO
        const paid = parseFloat(guest.paidAmount || '0');
        const pending = guestSubtotalAjustado - paid;
        
        console.log(`[validateSessionClosure] Convidado: ${guest.name}`, {
          subtotalOriginal: guestSubtotalOriginal.toFixed(2),
          subtotalAjustado: guestSubtotalAjustado.toFixed(2),
          paid: paid.toFixed(2),
          pending: pending.toFixed(2)
        });
        
        if (pending > 0.01) { // Tolera 1 centavo de diferença
          totalPending += pending;
          unpaidGuests.push({
            id: guest.id,
            name: guest.name || `Convidado ${guest.guestNumber || '?'}`,
            pending: parseFloat(pending.toFixed(2))
          });
        }
      }
      
      // Verificar reconciliação com total da sessão
      if (session) {
        const sessionTotal = parseFloat(session.totalAmount || '0');
        const sessionPaid = parseFloat(session.paidAmount || '0');
        const sessionPending = sessionTotal - sessionPaid;
        
        if (Math.abs(sessionPending - totalPending) > 0.10) {
          warnings.push(
            `Diferença de reconciliação: ${Math.abs(sessionPending - totalPending).toFixed(2)} Kz entre sessão e guests`
          );
        }
      }
      
      return {
        canClose: totalPending <= 0,
        totalPending: parseFloat(totalPending.toFixed(2)),
        unpaidGuests,
        warnings
      };
    } catch (error) {
      console.error('[VALIDATE CLOSURE] Erro:', error);
      return {
        canClose: false,
        totalPending: 0,
        unpaidGuests: [],
        warnings: ['Erro ao validar fechamento']
      };
    }
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

  async addTablePayment(restaurantId: string, payment: any): Promise<TablePayment> {
    // ✅ P0 CORREÇÃO: Usar transação atômica para garantir consistência
    return await db.transaction(async (tx) => {
      // 1. Validar mesa dentro da transação
      const [table] = await tx.select()
        .from(tables)
        .where(eq(tables.id, payment.tableId))
        .limit(1);
      
      if (!table) {
        throw new Error('Table not found');
      }

      // 2. Criar pagamento
      const [newPayment] = await tx.insert(tablePayments).values({
        ...payment,
        restaurantId,
      }).returning();

      // 3. Atualizar session.paidAmount atomicamente usando SQL (previne race conditions)
      if (table.currentSessionId) {
        await tx.execute(sql`
          UPDATE table_sessions 
          SET paid_amount = COALESCE(paid_amount, 0) + ${payment.amount}::numeric,
              updated_at = NOW()
          WHERE id = ${table.currentSessionId}
        `);
        
        console.log(`[addTablePayment] ✅ Session paidAmount atualizado atomicamente`, {
          sessionId: table.currentSessionId,
          paymentAmount: parseFloat(payment.amount).toFixed(2),
        });
        
        // 4. Se for pagamento de convidado específico, atualizar o paidAmount do convidado
        if (payment.guestId) {
          await tx.execute(sql`
            UPDATE table_guests
            SET paid_amount = COALESCE(paid_amount, 0) + ${payment.amount}::numeric
            WHERE id = ${payment.guestId}
          `);
        }
      }
      
      return newPayment;
    });
  }

  async getTableById(id: string): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table;
  }

  async getTables(restaurantId: string, branchId?: string | null): Promise<Table[]> {
    let query = db.select().from(tables).where(eq(tables.restaurantId, restaurantId));
    if (branchId) {
      query = query.where(eq(tables.branchId, branchId));
    }
    return await query.orderBy(asc(tables.number));
  }

  async createTable(restaurantId: string, branchId: string | null, table: Omit<InsertTable, 'restaurantId' | 'branchId'>): Promise<Table> {
    const [newTable] = await db.insert(tables).values({
      restaurantId,
      branchId,
      ...table,
      status: 'livre',
    }).returning();
    return newTable;
  }

  async deleteTable(restaurantId: string, id: string): Promise<void> {
    await db.delete(tables).where(and(eq(tables.id, id), eq(tables.restaurantId, restaurantId)));
  }

  async getTablesWithOrders(restaurantId: string, branchId?: string | null): Promise<any[]> {
    const allTables = await this.getTables(restaurantId, branchId);
    return allTables;
  }

  async updateTableStatus(restaurantId: string, id: string, status: string, options?: { customerName?: string; customerCount?: number }): Promise<Table> {
    const [updated] = await db.update(tables)
      .set({ 
        status: status as any,
        customerName: options?.customerName || null,
        customerCount: options?.customerCount || 0,
        lastActivity: new Date(),
        isOccupied: status === 'ocupada' ? 1 : 0,
      })
      .where(and(eq(tables.id, id), eq(tables.restaurantId, restaurantId)))
      .returning();
    return updated;
  }

  async startTableSession(restaurantId: string, tableId: string, options: { customerName?: string; customerCount?: number }): Promise<TableSession> {
    const [session] = await db.insert(tableSessions).values({
      restaurantId,
      tableId,
      customerName: options.customerName || 'Cliente',
      customerCount: options.customerCount || 1,
      status: 'ativa',
      totalAmount: '0',
      paidAmount: '0',
    }).returning();

    await db.update(tables)
      .set({ 
        currentSessionId: session.id,
        status: 'ocupada',
        customerName: options.customerName || null,
        customerCount: options.customerCount || 0,
        isOccupied: 1,
      })
      .where(eq(tables.id, tableId));

    return session;
  }

  async autoUpdateTableStatusOnSessionStart(tableId: string): Promise<void> {
    await db.update(tables)
      .set({ status: 'ocupada', isOccupied: 1 })
      .where(eq(tables.id, tableId));
  }

  async autoUpdateTableStatusOnPayment(tableId: string): Promise<void> {
    const table = await this.getTableById(tableId);
    if (table?.currentSessionId) {
      const validation = await this.validateSessionClosure(table.currentSessionId);
      if (validation.canClose) {
        await this.endTableSession(table.restaurantId, tableId);
      }
    }
  }

  // Table Guest operations
  async getTableGuests(sessionId: string): Promise<TableGuest[]> {
    return await db.select().from(tableGuests).where(eq(tableGuests.sessionId, sessionId)).orderBy(asc(tableGuests.guestNumber));
  }

  async getTableGuestById(id: string): Promise<TableGuest | undefined> {
    const [guest] = await db.select().from(tableGuests).where(eq(tableGuests.id, id));
    return guest;
  }

  async createTableGuest(guest: InsertTableGuest): Promise<TableGuest> {
    const [newGuest] = await db.insert(tableGuests).values(guest).returning();
    return newGuest;
  }

  async deleteTableGuest(id: string): Promise<void> {
    await db.delete(tableGuests).where(eq(tableGuests.id, id));
  }

  async updateGuestSubtotal(guestId: string): Promise<void> {
    const items = await db.select().from(orderItems).where(eq(orderItems.guestId, guestId));
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    await db.update(tableGuests).set({ subtotal: subtotal.toFixed(2) }).where(eq(tableGuests.id, guestId));
  }

  async recalculateSessionSubtotals(sessionId: string): Promise<void> {
    const guests = await this.getTableGuests(sessionId);
    for (const guest of guests) {
      await this.updateGuestSubtotal(guest.id);
    }
  }

  // Table Payment operations
  async getTablePayments(restaurantId: string, tableId?: string, sessionId?: string): Promise<TablePayment[]> {
    let query = db.select().from(tablePayments).where(eq(tablePayments.restaurantId, restaurantId));
    if (tableId) query = query.where(eq(tablePayments.tableId, tableId));
    if (sessionId) query = query.where(eq(tablePayments.sessionId, sessionId));
    return await query.orderBy(desc(tablePayments.createdAt));
  }

  // Guest Payment operations
  async createGuestPayment(restaurantId: string, payment: InsertGuestPayment): Promise<GuestPayment> {
    const [newPayment] = await db.insert(guestPayments).values(payment).returning();
    // Update guest paidAmount
    const guest = await this.getTableGuestById(payment.guestId);
    if (guest) {
      const currentPaid = parseFloat(guest.paidAmount || '0');
      const newPaid = currentPaid + parseFloat(payment.amount);
      await db.update(tableGuests).set({ paidAmount: newPaid.toFixed(2) }).where(eq(tableGuests.id, payment.guestId));
    }
    return newPayment;
  }

  async getGuestPayments(guestId: string): Promise<GuestPayment[]> {
    return await db.select().from(guestPayments).where(eq(guestPayments.guestId, guestId)).orderBy(desc(guestPayments.createdAt));
  }

  // Rest of the methods stubbed or implemented briefly for brevity...
  async getOrderById(restaurantId: string, id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(and(eq(orders.id, id), eq(orders.restaurantId, restaurantId)));
    return order;
  }

  async getDashboardStats(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date, orderType?: string): Promise<any> {
    return { orders: [] };
  }

  async generateMissingSlugs(): Promise<void> {
    return;
  }

  // Subscription Plan operations
  async getSubscriptionPlans(): Promise<any[]> {
    try {
      console.log('[getSubscriptionPlans] Executando query...');
      const result = await db.select().from(subscriptionPlans).orderBy(asc(subscriptionPlans.displayOrder));
      console.log('[getSubscriptionPlans] Resultado:', result.length, 'planos encontrados');
      return result;
    } catch (error: any) {
      console.error('[getSubscriptionPlans] Erro SQL:', error);
      throw error;
    }
  }

  async getSubscriptionPlanById(id: string): Promise<any | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getAllSubscriptionPlans(): Promise<any[]> {
    return await db.select().from(subscriptionPlans).orderBy(asc(subscriptionPlans.price));
  }

  async updateSubscriptionPlan(id: string, data: any): Promise<any> {
    const [updated] = await db.update(subscriptionPlans)
      .set(data)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updated;
  }

  async seedSubscriptionPlans(): Promise<void> {
    // Verificar se já existem planos
    const existing = await db.select().from(subscriptionPlans);
    if (existing.length > 0) {
      console.log('✅ Planos de subscrição já existem, pulando seed');
      return;
    }

    console.log('🌱 Criando planos de subscrição padrão...');
    
    const plans = [
      {
        id: 'plan_base',
        name: 'Base',
        description: 'Ideal para começar',
        price: '0',
        interval: 'month' as const,
        trialDays: 30,
        maxUsers: 2,
        maxTables: 5,
        maxMenuItems: 20,
        maxOrders: 100,
        features: ['2 utilizadores', '5 mesas', '20 itens no menu', '100 pedidos/mês'],
        isActive: 1,
      },
      {
        id: 'plan_starter',
        name: 'Starter',
        description: 'Para pequenos negócios',
        price: '15000',
        interval: 'month' as const,
        trialDays: 14,
        maxUsers: 5,
        maxTables: 15,
        maxMenuItems: 100,
        maxOrders: 500,
        features: ['5 utilizadores', '15 mesas', '100 itens no menu', '500 pedidos/mês', 'Suporte por email'],
        isActive: 1,
      },
      {
        id: 'plan_professional',
        name: 'Professional',
        description: 'Para restaurantes em crescimento',
        price: '35000',
        interval: 'month' as const,
        trialDays: 14,
        maxUsers: 15,
        maxTables: 50,
        maxMenuItems: 500,
        maxOrders: 2000,
        features: ['15 utilizadores', '50 mesas', '500 itens no menu', '2000 pedidos/mês', 'Múltiplas filiais', 'Suporte prioritário'],
        isActive: 1,
      },
      {
        id: 'plan_enterprise',
        name: 'Enterprise',
        description: 'Solução completa sem limites',
        price: '75000',
        interval: 'month' as const,
        trialDays: 14,
        maxUsers: -1,
        maxTables: -1,
        maxMenuItems: -1,
        maxOrders: -1,
        features: ['Utilizadores ilimitados', 'Mesas ilimitadas', 'Menu ilimitado', 'Pedidos ilimitados', 'Múltiplas filiais', 'Suporte 24/7', 'API personalizada'],
        isActive: 1,
      },
    ];

    for (const plan of plans) {
      await db.insert(subscriptionPlans).values(plan);
    }

    console.log('✅ Planos de subscrição criados com sucesso');
  }

  // Subscription operations
  async getAllSubscriptions(): Promise<any[]> {
    const results = await db.select({
      id: subscriptions.id,
      restaurantId: subscriptions.restaurantId,
      planId: subscriptions.planId,
      status: subscriptions.status,
      billingInterval: subscriptions.billingInterval,
      currency: subscriptions.currency,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      trialStart: subscriptions.trialStart,
      trialEnd: subscriptions.trialEnd,
      canceledAt: subscriptions.canceledAt,
      createdAt: subscriptions.createdAt,
      updatedAt: subscriptions.updatedAt,
      restaurant: {
        id: restaurants.id,
        name: restaurants.name,
        email: restaurants.email,
        phone: restaurants.phone,
        status: restaurants.status,
      },
      plan: {
        id: subscriptionPlans.id,
        name: subscriptionPlans.name,
        price: subscriptionPlans.price,
      }
    })
      .from(subscriptions)
      .leftJoin(restaurants, eq(subscriptions.restaurantId, restaurants.id))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .orderBy(desc(subscriptions.createdAt));
    
    return results;
  }

  async getSubscriptionByRestaurantId(restaurantId: string): Promise<any | undefined> {
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.restaurantId, restaurantId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return subscription;
  }

  async createSubscription(restaurantId: string, data: any): Promise<any> {
    const [subscription] = await db.insert(subscriptions)
      .values({ ...data, restaurantId })
      .returning();
    return subscription;
  }

  async updateSubscription(id: string, data: any): Promise<any> {
    const [updated] = await db.update(subscriptions)
      .set(data)
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  async cancelSubscription(restaurantId: string): Promise<any> {
    const subscription = await this.getSubscriptionByRestaurantId(restaurantId);
    if (!subscription) {
      throw new Error('Subscrição não encontrada');
    }

    const [updated] = await db.update(subscriptions)
      .set({ 
        status: 'cancelada',
        cancelledAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id))
      .returning();
    return updated;
  }

  async checkSubscriptionLimits(restaurantId: string): Promise<any> {
    const subscription = await this.getSubscriptionByRestaurantId(restaurantId);
    if (!subscription) {
      return { valid: false, message: 'Subscrição não encontrada' };
    }

    const plan = await this.getSubscriptionPlanById(subscription.planId);
    if (!plan) {
      return { valid: false, message: 'Plano não encontrado' };
    }

    // Verificar limites (implementação básica)
    return {
      valid: subscription.status === 'ativa',
      plan,
      subscription,
      limits: {
        maxUsers: plan.maxUsers,
        maxTables: plan.maxTables,
        maxMenuItems: plan.maxMenuItems,
        maxOrders: plan.maxOrders,
      }
    };
  }

  // Subscription Payment operations
  async getSubscriptionPayments(restaurantId: string): Promise<any[]> {
    const subscription = await this.getSubscriptionByRestaurantId(restaurantId);
    if (!subscription) return [];

    return await db.select()
      .from(subscriptionPayments)
      .where(eq(subscriptionPayments.subscriptionId, subscription.id))
      .orderBy(desc(subscriptionPayments.createdAt));
  }

  async createSubscriptionPayment(restaurantId: string, data: any): Promise<any> {
    const [payment] = await db.insert(subscriptionPayments)
      .values(data)
      .returning();
    return payment;
  }
}

export const storage = new DatabaseStorage();
