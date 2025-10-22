// Blueprint: javascript_log_in_with_replit - Replit Auth schema
// Blueprint: javascript_database - PostgreSQL database schema
import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Restaurant Status Enum
export const restaurantStatusEnum = pgEnum('restaurant_status', ['pendente', 'ativo', 'suspenso']);

// Restaurants - Multi-tenant support
export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  logoUrl: text("logo_url"),
  businessHours: text("business_hours"),
  description: text("description"),
  status: restaurantStatusEnum("status").notNull().default('pendente'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Nome do restaurante é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string()
    .min(1, "Telefone é obrigatório")
    .regex(/^(\+244|244)?\s*[9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$|^(\+244|244)?[9][0-9]{8}$/, "Formato de telefone angolano inválido. Use o formato: +244 9XX XXX XXX"),
  address: z.string().min(1, "Endereço é obrigatório"),
  logoUrl: z.string().optional(),
  businessHours: z.string().optional(),
  description: z.string().optional(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

// User Role Enum
export const userRoleEnum = pgEnum('user_role', ['superadmin', 'admin', 'kitchen']);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").references(() => restaurants.id, { onDelete: 'cascade' }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: userRoleEnum("role").notNull().default('admin'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'kitchen']),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const updateUserSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'kitchen']).optional(),
});

export const updateProfileSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type User = typeof users.$inferSelect;

// Tables - Mesas do restaurante
export const tables = pgTable("tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  number: integer("number").notNull(),
  qrCode: text("qr_code").notNull(), // Data URL do QR code
  isOccupied: integer("is_occupied").notNull().default(0), // 0 = livre, 1 = ocupada
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTableSchema = createInsertSchema(tables).omit({
  id: true,
  restaurantId: true,
  qrCode: true,
  isOccupied: true,
  createdAt: true,
});

export type InsertTable = z.infer<typeof insertTableSchema>;
export type Table = typeof tables.$inferSelect;

// Categories - Categorias do menu
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Menu Items - Pratos do menu
export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  isAvailable: integer("is_available").notNull().default(1), // 0 = indisponível, 1 = disponível
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
}).extend({
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido"),
});

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

// Order Status Enum
export const orderStatusEnum = pgEnum('order_status', ['pendente', 'em_preparo', 'pronto', 'servido']);

// Orders - Pedidos
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: varchar("table_id").notNull().references(() => tables.id, { onDelete: 'cascade' }),
  customerName: varchar("customer_name", { length: 200 }),
  customerPhone: varchar("customer_phone", { length: 50 }),
  status: orderStatusEnum("status").notNull().default('pendente'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items - Itens do pedido
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: varchar("menu_item_id").notNull().references(() => menuItems.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const publicOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  orderId: true,
  createdAt: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type PublicOrderItem = z.infer<typeof publicOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Messages - Comunicações entre superadmin e restaurantes
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  sentBy: varchar("sent_by").notNull(),
  isRead: integer("is_read").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Relations
export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  users: many(users),
  tables: many(tables),
  categories: many(categories),
  menuItems: many(menuItems),
  messages: many(messages),
}));

export const usersRelations = relations(users, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [users.restaurantId],
    references: [restaurants.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [categories.restaurantId],
    references: [restaurants.id],
  }),
  menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const tablesRelations = relations(tables, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [tables.restaurantId],
    references: [restaurants.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [messages.restaurantId],
    references: [restaurants.id],
  }),
}));
