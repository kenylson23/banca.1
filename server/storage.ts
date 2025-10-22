// Blueprint: javascript_database - Database storage implementation
import {
  users,
  restaurants,
  tables,
  categories,
  menuItems,
  orders,
  orderItems,
  type User,
  type InsertUser,
  type Restaurant,
  type InsertRestaurant,
  type Table,
  type InsertTable,
  type Category,
  type InsertCategory,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type PublicOrderItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export interface IStorage {
  // Restaurant operations
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantById(id: string): Promise<Restaurant | undefined>;
  getRestaurantByEmail(email: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant & { password: string }): Promise<{ restaurant: Restaurant; adminUser: User }>;
  updateRestaurantStatus(id: string, status: 'pendente' | 'ativo' | 'suspenso'): Promise<Restaurant>;
  deleteRestaurant(id: string): Promise<void>;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(restaurantId: string | null): Promise<User[]>;
  deleteUser(restaurantId: string | null, id: string): Promise<void>;
  updateUser(restaurantId: string | null, id: string, data: { email?: string; firstName?: string; lastName?: string; role?: 'superadmin' | 'admin' | 'kitchen' }): Promise<User>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<User>;

  // Table operations
  getTables(restaurantId: string): Promise<Table[]>;
  getTableById(id: string): Promise<Table | undefined>;
  createTable(restaurantId: string, table: { number: number; qrCode: string }): Promise<Table>;
  deleteTable(restaurantId: string, id: string): Promise<void>;
  updateTableOccupancy(restaurantId: string, id: string, isOccupied: boolean): Promise<void>;

  // Category operations
  getCategories(restaurantId: string): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(restaurantId: string, category: Omit<InsertCategory, 'restaurantId'>): Promise<Category>;
  deleteCategory(restaurantId: string, id: string): Promise<void>;

  // Menu item operations
  getMenuItems(restaurantId: string): Promise<Array<MenuItem & { category: Category }>>;
  getMenuItemById(id: string): Promise<MenuItem | undefined>;
  createMenuItem(restaurantId: string, item: Omit<InsertMenuItem, 'restaurantId'>): Promise<MenuItem>;
  updateMenuItem(restaurantId: string, id: string, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(restaurantId: string, id: string): Promise<void>;

  // Order operations
  getKitchenOrders(restaurantId: string): Promise<Array<Order & { table: Table; orderItems: Array<OrderItem & { menuItem: MenuItem }> }>>;
  getRecentOrders(restaurantId: string, limit: number): Promise<Array<Order & { table: { number: number } }>>;
  getOrdersByTableId(restaurantId: string, tableId: string): Promise<Array<Order & { orderItems: Array<OrderItem & { menuItem: MenuItem }> }>>;
  createOrder(order: InsertOrder, items: PublicOrderItem[]): Promise<Order>;
  updateOrderStatus(restaurantId: string, id: string, status: string): Promise<Order>;
  
  // Stats operations
  getTodayStats(restaurantId: string): Promise<{
    todaySales: string;
    todayOrders: number;
    activeTables: number;
    topDishes: Array<{
      menuItem: MenuItem;
      count: number;
      totalRevenue: string;
    }>;
  }>;
  
  getKitchenStats(restaurantId: string, period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'): Promise<{
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

  async createRestaurant(data: InsertRestaurant & { password: string }): Promise<{ restaurant: Restaurant; adminUser: User }> {
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const [restaurant] = await db.insert(restaurants).values({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
    }).returning();

    const [adminUser] = await db.insert(users).values({
      restaurantId: restaurant.id,
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

  private async ensureTables() {
    const { ensureTablesExist } = await import('./initDb');
    await ensureTablesExist();
  }

  // Table operations
  async getTables(restaurantId: string): Promise<Table[]> {
    return await db.select().from(tables).where(eq(tables.restaurantId, restaurantId)).orderBy(tables.number);
  }

  async getTableById(id: string): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table;
  }

  async createTable(restaurantId: string, table: { number: number; qrCode: string }): Promise<Table> {
    const [newTable] = await db.insert(tables).values({
      restaurantId,
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

  // Category operations
  async getCategories(restaurantId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.restaurantId, restaurantId)).orderBy(categories.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(restaurantId: string, category: Omit<InsertCategory, 'restaurantId'>): Promise<Category> {
    const [newCategory] = await db.insert(categories).values({
      restaurantId,
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
  async getMenuItems(restaurantId: string): Promise<Array<MenuItem & { category: Category }>> {
    const results = await db
      .select()
      .from(menuItems)
      .leftJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(eq(menuItems.restaurantId, restaurantId))
      .orderBy(categories.name, menuItems.name);

    return results.map(row => ({
      ...row.menu_items,
      category: row.categories!,
    }));
  }

  async getMenuItemById(id: string): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(restaurantId: string, item: Omit<InsertMenuItem, 'restaurantId'>): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values({
      restaurantId,
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
  async getKitchenOrders(restaurantId: string): Promise<Array<Order & { table: Table; orderItems: Array<OrderItem & { menuItem: MenuItem }> }>> {
    const allOrders = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(eq(tables.restaurantId, restaurantId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      allOrders.map(async (orderRow) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, orderRow.orders.id));

        return {
          ...orderRow.orders,
          table: orderRow.tables!,
          orderItems: items.map(item => ({
            ...item.order_items,
            menuItem: item.menu_items!,
          })),
        };
      })
    );

    return ordersWithItems;
  }

  async getRecentOrders(restaurantId: string, limit: number): Promise<Array<Order & { table: { number: number } }>> {
    const results = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(eq(tables.restaurantId, restaurantId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    return results.map(row => ({
      ...row.orders,
      table: { number: row.tables!.number },
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
      tableOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          orderItems: items.map(item => ({
            ...item.order_items,
            menuItem: item.menu_items!,
          })),
        };
      })
    );

    return ordersWithItems;
  }

  async createOrder(order: InsertOrder, items: PublicOrderItem[]): Promise<Order> {
    // Verify that the table exists and get its restaurantId
    const table = await this.getTableById(order.tableId);
    if (!table) {
      throw new Error('Table not found');
    }
    
    // Verify all menu items belong to the same restaurant as the table
    if (items.length > 0) {
      const itemChecks = await Promise.all(
        items.map(item => this.getMenuItemById(item.menuItemId))
      );
      
      for (const menuItem of itemChecks) {
        if (!menuItem) {
          throw new Error('Menu item not found');
        }
        if (menuItem.restaurantId !== table.restaurantId) {
          throw new Error('Menu items must belong to the same restaurant as the table');
        }
      }
    }
    
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    if (items.length > 0) {
      const itemsWithOrderId = items.map(item => ({
        ...item,
        orderId: newOrder.id,
      }));
      await db.insert(orderItems).values(itemsWithOrderId);
    }

    // Update table occupancy
    await this.updateTableOccupancy(table.restaurantId, order.tableId, true);

    return newOrder;
  }

  async updateOrderStatus(restaurantId: string, id: string, status: string): Promise<Order> {
    // Verify the order belongs to the restaurant before updating
    // Orders don't have restaurantId directly, so we need to check via table
    const [orderData] = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(eq(orders.id, id));
    
    if (!orderData || !orderData.orders) {
      throw new Error('Order not found');
    }
    if (orderData.tables!.restaurantId !== restaurantId) {
      throw new Error('Unauthorized: Order does not belong to your restaurant');
    }
    
    const [updated] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Stats operations
  async getTodayStats(restaurantId: string): Promise<{
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
    const todayOrdersData = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(and(
        eq(tables.restaurantId, restaurantId),
        gte(orders.createdAt, today)
      ));

    const todayOrders = todayOrdersData.map(row => row.orders);

    const todaySales = todayOrders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount),
      0
    );

    // Get active tables for this restaurant
    const activeTables = await db
      .select()
      .from(tables)
      .where(and(
        eq(tables.restaurantId, restaurantId),
        eq(tables.isOccupied, 1)
      ));

    // Get top dishes from today
    const todayOrderIds = todayOrders.map(o => o.id);
    
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
        .where(sql`${orderItems.orderId} = ANY(ARRAY[${sql.join(todayOrderIds.map(id => sql`${id}`), sql`, `)}])`)
        .groupBy(orderItems.menuItemId)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(5);

      topDishes = await Promise.all(
        dishStats.map(async (stat) => {
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

  async getKitchenStats(restaurantId: string, period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'): Promise<{
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
    const periodOrdersData = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(and(
        eq(tables.restaurantId, restaurantId),
        gte(orders.createdAt, periodStart),
        sql`${orders.createdAt} <= ${periodEnd}`
      ));

    const periodOrders = periodOrdersData.map(row => row.orders);

    const totalOrders = periodOrders.length;
    const totalRevenue = periodOrders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount),
      0
    );

    // Calculate days in period
    const daysInPeriod = Math.max(1, Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)));
    const averageOrdersPerDay = totalOrders / daysInPeriod;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top dishes for the period
    const orderIds = periodOrders.map(o => o.id);
    
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
        .where(sql`${orderItems.orderId} = ANY(ARRAY[${sql.join(orderIds.map(id => sql`${id}`), sql`, `)}])`)
        .groupBy(orderItems.menuItemId)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(10);

      topDishes = await Promise.all(
        dishStats.map(async (stat) => {
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
      (sum, order) => sum + parseFloat(order.totalAmount),
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
}

export const storage = new DatabaseStorage();
