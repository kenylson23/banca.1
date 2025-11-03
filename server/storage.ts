// Blueprint: javascript_database - Database storage implementation
import {
  users,
  restaurants,
  branches,
  tables,
  tableSessions,
  tablePayments,
  categories,
  menuItems,
  orders,
  orderItems,
  messages,
  optionGroups,
  options,
  orderItemOptions,
  type User,
  type InsertUser,
  type Restaurant,
  type InsertRestaurant,
  type Branch,
  type InsertBranch,
  type UpdateBranch,
  type Table,
  type InsertTable,
  type TableSession,
  type InsertTableSession,
  type TablePayment,
  type InsertTablePayment,
  type Category,
  type InsertCategory,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type PublicOrderItem,
  type Message,
  type InsertMessage,
  type OptionGroup,
  type InsertOptionGroup,
  type UpdateOptionGroup,
  type Option,
  type InsertOption,
  type UpdateOption,
  type OrderItemOption,
  type InsertOrderItemOption,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, or, isNull } from "drizzle-orm";

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
  createTable(restaurantId: string, branchId: string | null, table: { number: number; qrCode: string }): Promise<Table>;
  deleteTable(restaurantId: string, id: string): Promise<void>;
  updateTableOccupancy(restaurantId: string, id: string, isOccupied: boolean): Promise<void>;

  // Category operations
  getCategories(restaurantId: string, branchId?: string | null): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(restaurantId: string, branchId: string | null, category: Omit<InsertCategory, 'restaurantId'>): Promise<Category>;
  deleteCategory(restaurantId: string, id: string): Promise<void>;

  // Menu item operations
  getMenuItems(restaurantId: string, branchId?: string | null): Promise<Array<MenuItem & { category: Category }>>;
  getMenuItemById(id: string): Promise<MenuItem | undefined>;
  createMenuItem(restaurantId: string, branchId: string | null, item: Omit<InsertMenuItem, 'restaurantId'>): Promise<MenuItem>;
  updateMenuItem(restaurantId: string, id: string, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(restaurantId: string, id: string): Promise<void>;

  // Order operations
  getKitchenOrders(restaurantId: string, branchId?: string | null): Promise<Array<Order & { table: Table; orderItems: Array<OrderItem & { menuItem: MenuItem }> }>>;
  getRecentOrders(restaurantId: string, branchId: string | null, limit: number): Promise<Array<Order & { table: { number: number } }>>;
  getOrdersByTableId(restaurantId: string, tableId: string): Promise<Array<Order & { orderItems: Array<OrderItem & { menuItem: MenuItem }> }>>;
  searchOrders(restaurantId: string, searchTerm: string): Promise<Array<Order & { table: Table | null; orderItems: Array<OrderItem & { menuItem: MenuItem }> }>>;
  createOrder(order: InsertOrder, items: PublicOrderItem[]): Promise<Order>;
  updateOrderStatus(restaurantId: string, id: string, status: string): Promise<Order>;
  
  // Stats operations
  getTodayStats(restaurantId: string, branchId?: string | null): Promise<{
    todaySales: string;
    todayOrders: number;
    activeTables: number;
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
    topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }>;
    periodStart: Date;
    periodEnd: Date;
  }>;
  
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
      return await db.select().from(tables)
        .where(and(eq(tables.restaurantId, restaurantId), eq(tables.branchId, branchId)))
        .orderBy(tables.number);
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

  async createTable(restaurantId: string, branchId: string | null, table: { number: number; qrCode: string; capacity?: number }): Promise<Table> {
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
      ...table,
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
      return await db.select().from(categories)
        .where(and(eq(categories.restaurantId, restaurantId), eq(categories.branchId, branchId)))
        .orderBy(categories.name);
    }
    return await db.select().from(categories).where(eq(categories.restaurantId, restaurantId)).orderBy(categories.name);
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
      results = await db
        .select()
        .from(menuItems)
        .leftJoin(categories, eq(menuItems.categoryId, categories.id))
        .where(and(eq(menuItems.restaurantId, restaurantId), eq(menuItems.branchId, branchId)))
        .orderBy(categories.name, menuItems.name);
    } else {
      results = await db
        .select()
        .from(menuItems)
        .leftJoin(categories, eq(menuItems.categoryId, categories.id))
        .where(eq(menuItems.restaurantId, restaurantId))
        .orderBy(categories.name, menuItems.name);
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

  // Order operations
  async getKitchenOrders(restaurantId: string, branchId?: string | null): Promise<Array<Order & { table: Table; orderItems: Array<OrderItem & { menuItem: MenuItem }> }>> {
    let allOrders;
    if (branchId) {
      allOrders = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), isNull(orders.tableId))
        ))
        .orderBy(desc(orders.createdAt));
    } else {
      allOrders = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(eq(orders.restaurantId, restaurantId))
        .orderBy(desc(orders.createdAt));
    }

    const ordersWithItems = await Promise.all(
      allOrders.map(async (orderRow: { orders: Order; tables: Table | null }) => {
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
          table: orderRow.tables!,
          orderItems: itemsWithOptions,
        };
      })
    );

    return ordersWithItems;
  }

  async getRecentOrders(restaurantId: string, branchId: string | null, limit: number): Promise<Array<Order & { table: { number: number } }>> {
    let results;
    if (branchId) {
      results = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), isNull(orders.tableId))
        ))
        .orderBy(desc(orders.createdAt))
        .limit(limit);
    } else {
      results = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(eq(orders.restaurantId, restaurantId))
        .orderBy(desc(orders.createdAt))
        .limit(limit);
    }

    return results.map((row: { orders: Order; tables: Table | null }) => ({
      ...row.orders,
      table: row.tables ? { number: row.tables.number } : { number: 0 },
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
    
    const [newOrder] = await db.insert(orders).values(order).returning();
    
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

  async updateOrderStatus(restaurantId: string, id: string, status: string): Promise<Order> {
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
    
    const [updated] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Stats operations
  async getTodayStats(restaurantId: string, branchId?: string | null): Promise<{
    todaySales: string;
    todayOrders: number;
    activeTables: number;
    topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's orders for this restaurant
    let todayOrdersData;
    if (branchId) {
      todayOrdersData = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), isNull(orders.tableId)),
          gte(orders.createdAt, today)
        ));
    } else {
      todayOrdersData = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, today)
        ));
    }

    const todayOrders = todayOrdersData.map((row: { orders: Order; tables: Table | null }) => row.orders);

    const todaySales = todayOrders.reduce(
      (sum: number, order: Order) => sum + parseFloat(order.totalAmount),
      0
    );

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

    // Get top dishes from today
    const todayOrderIds = todayOrders.map((o: Order) => o.id);
    
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
      todayOrders: todayOrders.length,
      activeTables: activeTables.length,
      topDishes,
    };
  }

  async getCustomDateRangeStats(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date): Promise<{
    totalSales: string;
    totalOrders: number;
    averageOrderValue: string;
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

    // Get orders for the date range
    let periodOrdersData;
    if (branchId) {
      periodOrdersData = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), isNull(orders.tableId)),
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
          gte(orders.createdAt, periodStart),
          sql`${orders.createdAt} <= ${periodEnd}`
        ));
    }

    const periodOrders = periodOrdersData.map((row: { orders: Order; tables: Table | null }) => row.orders);

    const totalOrders = periodOrders.length;
    const totalSales = periodOrders.reduce(
      (sum: number, order: Order) => sum + parseFloat(order.totalAmount),
      0
    );

    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

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
      totalSales: totalSales.toFixed(2),
      totalOrders,
      averageOrderValue: averageOrderValue.toFixed(2),
      topDishes,
      periodStart,
      periodEnd,
    };
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

    // Get orders for the period for this restaurant
    let periodOrdersData;
    if (branchId) {
      periodOrdersData = await db
        .select()
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(and(
          eq(orders.restaurantId, restaurantId),
          or(eq(tables.branchId, branchId), isNull(orders.tableId)),
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

    // Calculate total revenue across all restaurants
    const allOrders = await db.select().from(orders);
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
          gte(orders.createdAt, startDate),
          sql`${orders.createdAt} <= ${endDate}`
        ));
    } else {
      periodOrders = await db
        .select()
        .from(orders)
        .where(and(
          eq(orders.restaurantId, restaurantId),
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

  async getOrdersReport(restaurantId: string, branchId: string | null, startDate: Date, endDate: Date, status?: string, orderType?: string): Promise<Array<Order & { 
    table: { number: number } | null;
    orderItems: Array<OrderItem & { menuItem: MenuItem }>;
  }>> {
    let baseConditions: any[] = [
      eq(orders.restaurantId, restaurantId),
      gte(orders.createdAt, startDate),
      sql`${orders.createdAt} <= ${endDate}`
    ];

    if (status && status !== 'todos') {
      baseConditions.push(eq(orders.status, status as any));
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
}

export const storage = new DatabaseStorage();
