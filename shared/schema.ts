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
  slug: varchar("slug", { length: 100 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  whatsappNumber: varchar("whatsapp_number", { length: 50 }),
  address: text("address"),
  logoUrl: text("logo_url"),
  businessHours: text("business_hours"),
  description: text("description"),
  status: restaurantStatusEnum("status").notNull().default('pendente'),
  isOpen: integer("is_open").notNull().default(1), // 0 = fechado, 1 = aberto
  primaryColor: varchar("primary_color", { length: 7 }).default('#EA580C'),
  secondaryColor: varchar("secondary_color", { length: 7 }).default('#DC2626'),
  accentColor: varchar("accent_color", { length: 7 }).default('#0891B2'),
  heroImageUrl: text("hero_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  status: true,
  isOpen: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Nome do restaurante é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string()
    .min(1, "Telefone é obrigatório")
    .regex(/^(\+244|244)?\s*[9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$|^(\+244|244)?[9][0-9]{8}$/, "Formato de telefone angolano inválido. Use o formato: +244 9XX XXX XXX"),
  whatsappNumber: z.string()
    .regex(/^(\+244|244)?\s*[9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$|^(\+244|244)?[9][0-9]{8}$/, "Formato de telefone angolano inválido. Use o formato: +244 9XX XXX XXX")
    .optional(),
  address: z.string().min(1, "Endereço é obrigatório"),
  logoUrl: z.string().optional(),
  businessHours: z.string().optional(),
  description: z.string().optional(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  planId: z.string().min(1, "Plano de subscrição é obrigatório"),
});

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

// Registration schema with password confirmation (for frontend form)
export const registerRestaurantSchema = z.object({
  name: z.string().min(1, "Nome do restaurante é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string()
    .min(1, "Telefone é obrigatório")
    .regex(/^(\+244|244)?\s*[9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$|^(\+244|244)?[9][0-9]{8}$/, "Formato inválido. Use: +244 9XX XXX XXX"),
  whatsappNumber: z.string()
    .regex(/^(\+244|244)?\s*[9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$|^(\+244|244)?[9][0-9]{8}$/, "Formato inválido. Use: +244 9XX XXX XXX")
    .optional()
    .or(z.literal('')),
  address: z.string().min(1, "Endereço é obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirme sua senha"),
  planId: z.string().min(1, "Selecione um plano de subscrição"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type RegisterRestaurant = z.infer<typeof registerRestaurantSchema>;

export const updateRestaurantSlugSchema = z.object({
  slug: z.string()
    .min(3, "Slug deve ter no mínimo 3 caracteres")
    .max(100, "Slug deve ter no máximo 100 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens")
});

export type UpdateRestaurantSlug = z.infer<typeof updateRestaurantSlugSchema>;

export const updateRestaurantAppearanceSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor primária inválida. Use formato hexadecimal (#000000)").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor secundária inválida. Use formato hexadecimal (#000000)").optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor de destaque inválida. Use formato hexadecimal (#000000)").optional(),
  logoUrl: z.string().optional().or(z.literal('')),
  heroImageUrl: z.string().optional().or(z.literal('')),
  whatsappNumber: z.string()
    .regex(/^(\+244|244)?\s*[9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$|^(\+244|244)?[9][0-9]{8}$/, "Formato de telefone angolano inválido")
    .optional(),
  isOpen: z.number().min(0).max(1).optional(),
});

export type UpdateRestaurantAppearance = z.infer<typeof updateRestaurantAppearanceSchema>;

// Branches - Filiais/Unidades do Restaurante
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 200 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  isActive: integer("is_active").notNull().default(1), // 0 = inativa, 1 = ativa
  isMain: integer("is_main").notNull().default(0), // 0 = filial, 1 = unidade principal/matriz
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Nome da unidade é obrigatório"),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.number().optional(),
  isMain: z.number().optional(),
});

export const updateBranchSchema = z.object({
  name: z.string().min(1, "Nome da unidade é obrigatório").optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.number().optional(),
});

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type UpdateBranch = z.infer<typeof updateBranchSchema>;
export type Branch = typeof branches.$inferSelect;

// User Role Enum
// Roles hierarchy (from most to least privileged):
// - superadmin: Full system access (all restaurants)
// - admin: Full restaurant access (owner)
// - manager: Almost full access except critical settings
// - cashier: PDV, payments, close tables
// - waiter: View assigned tables, take orders, update status
// - kitchen: Kitchen display only
export const userRoleEnum = pgEnum('user_role', ['superadmin', 'admin', 'manager', 'cashier', 'waiter', 'kitchen']);

// Role permissions map for frontend use
export const ROLE_PERMISSIONS = {
  superadmin: {
    label: 'Super Admin',
    description: 'Acesso total ao sistema',
    canAccessDashboard: true,
    canAccessTables: true,
    canAccessMenu: true,
    canAccessPDV: true,
    canAccessKitchen: true,
    canAccessReports: true,
    canAccessFinancial: true,
    canAccessUsers: true,
    canAccessSettings: true,
    canAccessBranches: true,
    canAccessCustomers: true,
    canAccessInventory: true,
    canCloseShifts: true,
    canApplyDiscounts: true,
    canCancelOrders: true,
    canEditMenu: true,
    canManageSubscription: true,
  },
  admin: {
    label: 'Administrador',
    description: 'Dono do restaurante - acesso total',
    canAccessDashboard: true,
    canAccessTables: true,
    canAccessMenu: true,
    canAccessPDV: true,
    canAccessKitchen: true,
    canAccessReports: true,
    canAccessFinancial: true,
    canAccessUsers: true,
    canAccessSettings: true,
    canAccessBranches: true,
    canAccessCustomers: true,
    canAccessInventory: true,
    canCloseShifts: true,
    canApplyDiscounts: true,
    canCancelOrders: true,
    canEditMenu: true,
    canManageSubscription: true,
  },
  manager: {
    label: 'Gerente',
    description: 'Gestão operacional do restaurante',
    canAccessDashboard: true,
    canAccessTables: true,
    canAccessMenu: true,
    canAccessPDV: true,
    canAccessKitchen: true,
    canAccessReports: true,
    canAccessFinancial: true,
    canAccessUsers: false,
    canAccessSettings: false,
    canAccessBranches: false,
    canAccessCustomers: true,
    canAccessInventory: true,
    canCloseShifts: true,
    canApplyDiscounts: true,
    canCancelOrders: true,
    canEditMenu: true,
    canManageSubscription: false,
  },
  cashier: {
    label: 'Caixa',
    description: 'Receber pagamentos e fechar contas',
    canAccessDashboard: false,
    canAccessTables: true,
    canAccessMenu: false,
    canAccessPDV: true,
    canAccessKitchen: false,
    canAccessReports: false,
    canAccessFinancial: false,
    canAccessUsers: false,
    canAccessSettings: false,
    canAccessBranches: false,
    canAccessCustomers: true,
    canAccessInventory: false,
    canCloseShifts: true,
    canApplyDiscounts: true,
    canCancelOrders: false,
    canEditMenu: false,
    canManageSubscription: false,
  },
  waiter: {
    label: 'Garçom',
    description: 'Atender mesas e registrar pedidos',
    canAccessDashboard: false,
    canAccessTables: true,
    canAccessMenu: false,
    canAccessPDV: true,
    canAccessKitchen: false,
    canAccessReports: false,
    canAccessFinancial: false,
    canAccessUsers: false,
    canAccessSettings: false,
    canAccessBranches: false,
    canAccessCustomers: false,
    canAccessInventory: false,
    canCloseShifts: false,
    canApplyDiscounts: false,
    canCancelOrders: false,
    canEditMenu: false,
    canManageSubscription: false,
  },
  kitchen: {
    label: 'Cozinha',
    description: 'Visualizar e preparar pedidos',
    canAccessDashboard: false,
    canAccessTables: false,
    canAccessMenu: false,
    canAccessPDV: false,
    canAccessKitchen: true,
    canAccessReports: false,
    canAccessFinancial: false,
    canAccessUsers: false,
    canAccessSettings: false,
    canAccessBranches: false,
    canAccessCustomers: false,
    canAccessInventory: false,
    canCloseShifts: false,
    canApplyDiscounts: false,
    canCancelOrders: false,
    canEditMenu: false,
    canManageSubscription: false,
  },
} as const;

export type UserRole = keyof typeof ROLE_PERMISSIONS;

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").references(() => restaurants.id, { onDelete: 'cascade' }),
  activeBranchId: varchar("active_branch_id").references(() => branches.id, { onDelete: 'set null' }), // Filial ativa na sessão
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
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
  role: z.enum(['superadmin', 'admin', 'manager', 'cashier', 'waiter', 'kitchen']),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const updateUserSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'manager', 'cashier', 'waiter', 'kitchen']).optional(),
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

export const adminResetPasswordSchema = z.object({
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
});

export type AdminResetPassword = z.infer<typeof adminResetPasswordSchema>;

export const resetRestaurantAdminCredentialsSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Confirmação de senha é obrigatória ao definir uma nova senha",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.newPassword && data.confirmPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
}).refine((data) => {
  return data.email || data.newPassword;
}, {
  message: "Deve fornecer pelo menos email ou senha para atualizar",
  path: ["email"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type ResetRestaurantAdminCredentials = z.infer<typeof resetRestaurantAdminCredentialsSchema>;
export type User = typeof users.$inferSelect;

// Table Status Enum
export const tableStatusEnum = pgEnum('table_status', ['livre', 'ocupada', 'em_andamento', 'aguardando_pagamento', 'encerrada']);

// Tables - Mesas do restaurante
export const tables = pgTable("tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  number: integer("number").notNull(),
  capacity: integer("capacity").default(4),
  area: varchar("area", { length: 100 }), // Área da mesa (ex: "Salão Principal", "Terraço", "VIP")
  qrCode: text("qr_code").notNull(),
  status: tableStatusEnum("status").notNull().default('livre'),
  currentSessionId: varchar("current_session_id"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default('0'),
  customerName: varchar("customer_name", { length: 200 }),
  customerCount: integer("customer_count").default(0),
  lastActivity: timestamp("last_activity"),
  isOccupied: integer("is_occupied").notNull().default(0), // Manter para compatibilidade
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTableSchema = z.object({
  number: z.number().int().positive("O número da mesa deve ser maior que zero"),
  capacity: z.number().int().positive("A capacidade deve ser maior que zero").optional(),
  area: z.string().min(1, "A área não pode ser vazia").max(100, "Nome da área muito longo").optional(),
});

export const updateTableStatusSchema = z.object({
  status: z.enum(['livre', 'ocupada', 'em_andamento', 'aguardando_pagamento', 'encerrada']),
  customerName: z.string().optional(),
  customerCount: z.number().optional(),
});

export type InsertTable = z.infer<typeof insertTableSchema>;
export type UpdateTableStatus = z.infer<typeof updateTableStatusSchema>;
export type Table = typeof tables.$inferSelect;

// ===== FINANCIAL SYSTEM ENUMS =====

// Shift Status Enum
export const shiftStatusEnum = pgEnum('shift_status', ['aberto', 'fechado']);

// Financial Event Type Enum
export const financialEventTypeEnum = pgEnum('financial_event_type', [
  'ITEM_ADDED', 'ITEM_REMOVED', 'ITEM_QUANTITY_CHANGED',
  'PAYMENT_CAPTURED', 'PAYMENT_PARTIAL',
  'REFUND_ISSUED', 'REFUND_PARTIAL',
  'CANCELLED_ORDER', 'CANCELLED_ITEM',
  'DISCOUNT_APPLIED', 'DISCOUNT_REMOVED',
  'SERVICE_CHARGE_APPLIED',
  'SESSION_STARTED', 'SESSION_CLOSED',
  'TABLE_MOVED', 'TABLE_MERGED'
]);

// Event Source Enum
export const eventSourceEnum = pgEnum('event_source', ['UI', 'API', 'AUTO']);

// Adjustment Type Enum
export const adjustmentTypeEnum = pgEnum('adjustment_type', ['discount', 'service_charge', 'delivery_fee', 'packaging_fee', 'other']);

// Report Period Type Enum
export const reportPeriodTypeEnum = pgEnum('report_period_type', ['daily', 'weekly', 'monthly']);

// Payment Method Enum (used by financial tables)
export const paymentMethodEnum = pgEnum('payment_method', ['dinheiro', 'multicaixa', 'transferencia', 'cartao']);

// ===== FINANCIAL SHIFTS =====
// Must be declared before tableSessions since tableSessions references it

export const financialShifts = pgTable("financial_shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  operatorId: varchar("operator_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: shiftStatusEnum("status").notNull().default('aberto'),
  openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).default('0'),
  closingBalance: decimal("closing_balance", { precision: 10, scale: 2 }).default('0'),
  expectedBalance: decimal("expected_balance", { precision: 10, scale: 2 }).default('0'),
  discrepancy: decimal("discrepancy", { precision: 10, scale: 2 }).default('0'),
  notes: text("notes"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const insertFinancialShiftSchema = createInsertSchema(financialShifts).omit({
  id: true,
  restaurantId: true,
  status: true,
  startedAt: true,
  endedAt: true,
}).extend({
  openingBalance: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido").optional(),
});

export type InsertFinancialShift = z.infer<typeof insertFinancialShiftSchema>;
export type FinancialShift = typeof financialShifts.$inferSelect;

// Table Sessions - Histórico de sessões das mesas
export const tableSessions = pgTable("table_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: varchar("table_id").notNull().references(() => tables.id, { onDelete: 'cascade' }),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  shiftId: varchar("shift_id").references(() => financialShifts.id, { onDelete: 'set null' }),
  operatorId: varchar("operator_id").references(() => users.id, { onDelete: 'set null' }),
  customerName: varchar("customer_name", { length: 200 }),
  customerCount: integer("customer_count"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default('0'),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default('0'),
  sessionTotals: jsonb("session_totals"),
  closingSnapshot: jsonb("closing_snapshot"),
  status: tableStatusEnum("status").notNull().default('ocupada'),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  closedById: varchar("closed_by_id").references(() => users.id, { onDelete: 'set null' }),
  notes: text("notes"),
});

export const insertTableSessionSchema = createInsertSchema(tableSessions).omit({
  id: true,
  restaurantId: true,
  totalAmount: true,
  paidAmount: true,
  status: true,
  startedAt: true,
  endedAt: true,
});

export type InsertTableSession = z.infer<typeof insertTableSessionSchema>;
export type TableSession = typeof tableSessions.$inferSelect;

// Table Payments - Pagamentos de mesas
export const tablePayments = pgTable("table_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: varchar("table_id").notNull().references(() => tables.id, { onDelete: 'cascade' }),
  sessionId: varchar("session_id").references(() => tableSessions.id, { onDelete: 'cascade' }),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  operatorId: varchar("operator_id").references(() => users.id, { onDelete: 'set null' }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentSource: varchar("payment_source", { length: 100 }),
  methodDetails: jsonb("method_details"),
  reconciliationBatchId: varchar("reconciliation_batch_id", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTablePaymentSchema = createInsertSchema(tablePayments).omit({
  id: true,
  restaurantId: true,
  operatorId: true,
  createdAt: true,
}).extend({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
  paymentMethod: z.string().min(1, "Método de pagamento é obrigatório"),
});

export type InsertTablePayment = z.infer<typeof insertTablePaymentSchema>;
export type TablePayment = typeof tablePayments.$inferSelect;

// ===== ORDERS SECTION =====

// Order Status Enum
export const orderStatusEnum = pgEnum('order_status', ['pendente', 'em_preparo', 'pronto', 'servido', 'cancelado']);

// Order Type Enum
export const orderTypeEnum = pgEnum('order_type', ['mesa', 'delivery', 'takeout', 'balcao', 'pdv']);

// Payment Status Enum
export const paymentStatusEnum = pgEnum('payment_status', ['nao_pago', 'parcial', 'pago']);

// Discount Type Enum
export const discountTypeEnum = pgEnum('discount_type', ['valor', 'percentual']);

// ===== CUSTOMER MANAGEMENT SECTION =====

// Customer Tier Enum
export const customerTierEnum = pgEnum('customer_tier', ['bronze', 'prata', 'ouro', 'platina']);

// Loyalty Transaction Type Enum
export const loyaltyTransactionTypeEnum = pgEnum('loyalty_transaction_type', [
  'ganho',        // Points earned from purchase
  'resgate',      // Points redeemed
  'expiracao',    // Points expired
  'ajuste',       // Manual adjustment
  'bonus'         // Bonus points (birthday, promotion, etc)
]);

// Customers - Clientes
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'set null' }),
  name: varchar("name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  cpf: varchar("cpf", { length: 14 }),
  birthDate: timestamp("birth_date"),
  address: text("address"),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  tier: customerTierEnum("tier").default('bronze'),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default('0'),
  visitCount: integer("visit_count").notNull().default(0),
  lastVisit: timestamp("last_visit"),
  notes: text("notes"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  restaurantId: true,
  loyaltyPoints: true,
  tier: true,
  totalSpent: true,
  visitCount: true,
  lastVisit: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  branchId: z.string().optional().nullable(),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.number().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.number().optional(),
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Customer Sessions - Sessões de clientes para login multi-dispositivo
export const customerSessions = pgTable("customer_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: 'cascade' }),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  otpCode: varchar("otp_code", { length: 6 }),
  otpExpiresAt: timestamp("otp_expires_at"),
  otpAttempts: integer("otp_attempts").notNull().default(0),
  deviceInfo: text("device_info"),
  ipAddress: varchar("ip_address", { length: 50 }),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSessionSchema = createInsertSchema(customerSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertCustomerSession = z.infer<typeof insertCustomerSessionSchema>;
export type CustomerSession = typeof customerSessions.$inferSelect;

// Customer Auth Request Schema - Para solicitar código OTP
export const customerAuthRequestSchema = z.object({
  phone: z.string().min(9, "Telefone é obrigatório"),
  restaurantId: z.string().min(1, "ID do restaurante é obrigatório"),
});

export type CustomerAuthRequest = z.infer<typeof customerAuthRequestSchema>;

// Customer Auth Verify Schema - Para verificar código OTP
export const customerAuthVerifySchema = z.object({
  phone: z.string().min(9, "Telefone é obrigatório"),
  restaurantId: z.string().min(1, "ID do restaurante é obrigatório"),
  otpCode: z.string().length(6, "Código deve ter 6 dígitos"),
});

export type CustomerAuthVerify = z.infer<typeof customerAuthVerifySchema>;

// Loyalty Programs - Configuração do Programa de Fidelidade
export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  isActive: integer("is_active").notNull().default(1),
  pointsPerCurrency: decimal("points_per_currency", { precision: 10, scale: 2 }).notNull().default('1'),
  currencyPerPoint: decimal("currency_per_point", { precision: 10, scale: 2 }).notNull().default('0.10'),
  minPointsToRedeem: integer("min_points_to_redeem").notNull().default(100),
  maxPointsPerOrder: integer("max_points_per_order"),
  pointsExpirationDays: integer("points_expiration_days"),
  birthdayBonusPoints: integer("birthday_bonus_points").default(0),
  bronzeTierMinSpent: decimal("bronze_tier_min_spent", { precision: 10, scale: 2 }).default('0'),
  silverTierMinSpent: decimal("silver_tier_min_spent", { precision: 10, scale: 2 }).default('5000'),
  goldTierMinSpent: decimal("gold_tier_min_spent", { precision: 10, scale: 2 }).default('15000'),
  platinumTierMinSpent: decimal("platinum_tier_min_spent", { precision: 10, scale: 2 }).default('50000'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLoyaltyProgramSchema = createInsertSchema(loyaltyPrograms).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  isActive: z.number().optional(),
  pointsPerCurrency: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido").optional(),
  currencyPerPoint: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido").optional(),
  minPointsToRedeem: z.number().int().min(0).optional(),
  maxPointsPerOrder: z.number().int().min(0).optional(),
  pointsExpirationDays: z.number().int().min(0).optional(),
  birthdayBonusPoints: z.number().int().min(0).optional(),
  bronzeTierMinSpent: z.string().optional(),
  silverTierMinSpent: z.string().optional(),
  goldTierMinSpent: z.string().optional(),
  platinumTierMinSpent: z.string().optional(),
});

export const updateLoyaltyProgramSchema = insertLoyaltyProgramSchema;

export type InsertLoyaltyProgram = z.infer<typeof insertLoyaltyProgramSchema>;
export type UpdateLoyaltyProgram = z.infer<typeof updateLoyaltyProgramSchema>;
export type LoyaltyProgram = typeof loyaltyPrograms.$inferSelect;

// Loyalty Transactions - Transações de Pontos
export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: 'cascade' }),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: 'set null' }),
  type: loyaltyTransactionTypeEnum("type").notNull(),
  points: integer("points").notNull(),
  description: varchar("description", { length: 500 }),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
}).extend({
  customerId: z.string().min(1, "Cliente é obrigatório"),
  orderId: z.string().optional().nullable(),
  type: z.enum(['ganho', 'resgate', 'expiracao', 'ajuste', 'bonus']),
  points: z.number().int(),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
  createdBy: z.string().optional().nullable(),
});

export type InsertLoyaltyTransaction = z.infer<typeof insertLoyaltyTransactionSchema>;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;

// Coupons - Cupons de Desconto
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'set null' }),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  discountType: discountTypeEnum("discount_type").notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderValue: decimal("min_order_value", { precision: 10, scale: 2 }).default('0'),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  maxUses: integer("max_uses"),
  maxUsesPerCustomer: integer("max_uses_per_customer").default(1),
  currentUses: integer("current_uses").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  applicableOrderTypes: text("applicable_order_types").array(),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  restaurantId: true,
  currentUses: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  code: z.string().min(3, "Código deve ter no mínimo 3 caracteres").max(50),
  description: z.string().optional(),
  branchId: z.string().optional().nullable(),
  discountType: z.enum(['valor', 'percentual']),
  discountValue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
  minOrderValue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido").optional(),
  maxDiscount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido").optional(),
  validFrom: z.string().min(1, "Data inicial é obrigatória"),
  validUntil: z.string().min(1, "Data final é obrigatória"),
  maxUses: z.number().int().min(1).optional(),
  maxUsesPerCustomer: z.number().int().min(1).default(1),
  isActive: z.number().optional(),
  applicableOrderTypes: z.array(z.string()).optional(),
  createdBy: z.string().optional().nullable(),
});

export const updateCouponSchema = z.object({
  code: z.string().min(3, "Código deve ter no mínimo 3 caracteres").max(50).optional(),
  description: z.string().optional(),
  discountType: z.enum(['valor', 'percentual']).optional(),
  discountValue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido").optional(),
  minOrderValue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido").optional(),
  maxDiscount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido").optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  maxUses: z.number().int().min(1).optional(),
  maxUsesPerCustomer: z.number().int().min(1).optional(),
  isActive: z.number().optional(),
  applicableOrderTypes: z.array(z.string()).optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Código do cupom é obrigatório"),
  orderType: z.string().optional(),
  orderValue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
  customerId: z.string().optional(),
});

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type UpdateCoupon = z.infer<typeof updateCouponSchema>;
export type ValidateCoupon = z.infer<typeof validateCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

// Coupon Usages - Registro de uso de cupons
export const couponUsages = pgTable("coupon_usages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  couponId: varchar("coupon_id").notNull().references(() => coupons.id, { onDelete: 'cascade' }),
  customerId: varchar("customer_id").references(() => customers.id, { onDelete: 'set null' }),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: 'set null' }),
  discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCouponUsageSchema = createInsertSchema(couponUsages).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
}).extend({
  couponId: z.string().min(1, "Cupom é obrigatório"),
  customerId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  discountApplied: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
});

export type InsertCouponUsage = z.infer<typeof insertCouponUsageSchema>;
export type CouponUsage = typeof couponUsages.$inferSelect;

// Orders - Pedidos
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  tableId: varchar("table_id").references(() => tables.id, { onDelete: 'cascade' }),
  tableSessionId: varchar("table_session_id").references(() => tableSessions.id, { onDelete: 'set null' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  customerId: varchar("customer_id").references(() => customers.id, { onDelete: 'set null' }),
  couponId: varchar("coupon_id").references(() => coupons.id, { onDelete: 'set null' }),
  orderType: orderTypeEnum("order_type").notNull().default('mesa'),
  customerName: varchar("customer_name", { length: 200 }),
  customerPhone: varchar("customer_phone", { length: 50 }),
  deliveryAddress: text("delivery_address"),
  orderNotes: text("order_notes"),
  orderTitle: varchar("order_title", { length: 200 }),
  status: orderStatusEnum("status").notNull().default('pendente'),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default('0'),
  discount: decimal("discount", { precision: 10, scale: 2 }).default('0'),
  discountType: discountTypeEnum("discount_type").default('valor'),
  couponDiscount: decimal("coupon_discount", { precision: 10, scale: 2 }).default('0'),
  serviceCharge: decimal("service_charge", { precision: 10, scale: 2 }).default('0'),
  serviceName: varchar("service_name", { length: 200 }),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default('0'),
  packagingFee: decimal("packaging_fee", { precision: 10, scale: 2 }).default('0'),
  loyaltyPointsEarned: integer("loyalty_points_earned").default(0),
  loyaltyPointsRedeemed: integer("loyalty_points_redeemed").default(0),
  loyaltyDiscountAmount: decimal("loyalty_discount_amount", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default('nao_pago'),
  paymentMethod: paymentMethodEnum("payment_method"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default('0'),
  changeAmount: decimal("change_amount", { precision: 10, scale: 2 }).default('0'),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).default('0'),
  cancellationReason: text("cancellation_reason"),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: varchar("cancelled_by").references(() => users.id, { onDelete: 'set null' }),
  isSynced: integer("is_synced").default(1),
  createdBy: varchar("created_by").references(() => users.id),
  closedBy: varchar("closed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  subtotal: true,
  totalAmount: true,
  paymentStatus: true,
  paidAmount: true,
  changeAmount: true,
}).extend({
  orderType: z.enum(['mesa', 'delivery', 'takeout', 'balcao', 'pdv']).default('mesa'),
  customerId: z.string().optional().nullable(),
  tableId: z.string().optional().nullable(),
  tableSessionId: z.string().optional().nullable(),
  couponId: z.string().optional().nullable(),
  discount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Desconto inválido").optional(),
  discountType: z.enum(['valor', 'percentual']).optional(),
  serviceCharge: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de serviço inválida").optional(),
  deliveryFee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de entrega inválida").optional(),
});

// Public order schema for customer checkout (omits advanced controls)
// This schema is used for /api/public/orders to prevent customers from setting
// professional features like discounts, service charges, etc.
// Note: paymentMethod is allowed so customers can select how they want to pay on delivery/takeout
export const publicOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  subtotal: true,
  totalAmount: true,
  paymentStatus: true,
  paidAmount: true,
  changeAmount: true,
  // Omit professional/admin-only fields
  discount: true,
  discountType: true,
  serviceCharge: true,
  deliveryFee: true,
  createdBy: true,
}).extend({
  // Restrict order types to customer-accessible ones only
  orderType: z.enum(['mesa', 'delivery', 'takeout']).default('mesa'),
  customerId: z.string().optional().nullable(),
  tableId: z.string().optional().nullable(),
  tableSessionId: z.string().optional().nullable(),
  couponId: z.string().optional().nullable(),
  // Allow customers to select payment method for delivery/takeout
  paymentMethod: z.enum(['dinheiro', 'multicaixa', 'transferencia', 'cartao']).optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pendente', 'em_preparo', 'pronto', 'servido', 'cancelado']),
});

export const updateOrderMetadataSchema = z.object({
  orderTitle: z.string().max(200).optional(),
  customerName: z.string().max(200).optional(),
  customerPhone: z.string().max(50).optional(),
  deliveryAddress: z.string().optional(),
  orderNotes: z.string().optional(),
});

export const applyDiscountSchema = z.object({
  discount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Desconto inválido"),
  discountType: z.enum(['valor', 'percentual']),
});

export const applyServiceChargeSchema = z.object({
  serviceCharge: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de serviço inválida"),
  serviceName: z.string().max(200).optional(),
});

export const applyDeliveryFeeSchema = z.object({
  deliveryFee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de entrega inválida"),
});

export const applyPackagingFeeSchema = z.object({
  packagingFee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de embalagem inválida"),
});

export const recordPaymentSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
  paymentMethod: z.enum(['dinheiro', 'multicaixa', 'transferencia', 'cartao']),
  receivedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor recebido inválido").optional(),
});

export const updateOrderItemQuantitySchema = z.object({
  quantity: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
});

export const linkCustomerSchema = z.object({
  customerId: z.string().uuid("ID de cliente inválido"),
});

export const applyCouponSchema = z.object({
  couponCode: z.string().min(1, "Código do cupom é obrigatório"),
});

export const redeemLoyaltyPointsSchema = z.object({
  pointsToRedeem: z.number().int().min(1, "Pontos a resgatar deve ser pelo menos 1"),
});

export const cancelOrderSchema = z.object({
  cancellationReason: z.string().min(1, "Motivo do cancelamento é obrigatório").max(500, "Motivo muito longo"),
});

export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderMetadata = z.infer<typeof updateOrderMetadataSchema>;
export type ApplyDiscount = z.infer<typeof applyDiscountSchema>;
export type ApplyServiceCharge = z.infer<typeof applyServiceChargeSchema>;
export type ApplyDeliveryFee = z.infer<typeof applyDeliveryFeeSchema>;
export type ApplyPackagingFee = z.infer<typeof applyPackagingFeeSchema>;
export type RecordPayment = z.infer<typeof recordPaymentSchema>;
export type UpdateOrderItemQuantity = z.infer<typeof updateOrderItemQuantitySchema>;
export type LinkCustomer = z.infer<typeof linkCustomerSchema>;
export type ApplyCoupon = z.infer<typeof applyCouponSchema>;
export type RedeemLoyaltyPoints = z.infer<typeof redeemLoyaltyPointsSchema>;
export type CancelOrder = z.infer<typeof cancelOrderSchema>;

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
}).extend({
  selectedOptions: z.array(z.object({
    optionId: z.string(),
    optionName: z.string(),
    optionGroupName: z.string(),
    priceAdjustment: z.string(),
    quantity: z.number().int().min(1).default(1),
  })).optional().default([]),
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type PublicOrderItem = z.infer<typeof publicOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Order Item Options - Opções selecionadas em cada item do pedido
export const orderItemOptions = pgTable("order_item_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderItemId: varchar("order_item_id").notNull().references(() => orderItems.id, { onDelete: 'cascade' }),
  optionId: varchar("option_id").notNull().references(() => options.id),
  optionName: varchar("option_name", { length: 200 }).notNull(), // Armazenar nome para histórico
  optionGroupName: varchar("option_group_name", { length: 200 }).notNull(), // Armazenar nome do grupo
  priceAdjustment: decimal("price_adjustment", { precision: 10, scale: 2 }).notNull().default('0'),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderItemOptionSchema = createInsertSchema(orderItemOptions).omit({
  id: true,
  createdAt: true,
}).extend({
  priceAdjustment: z.string().regex(/^-?\d+(\.\d{1,2})?$/, "Preço inválido").default('0'),
});

export type InsertOrderItemOption = z.infer<typeof insertOrderItemOptionSchema>;
export type OrderItemOption = typeof orderItemOptions.$inferSelect;

// ===== FINANCIAL TABLES =====

// Financial Events - Log de eventos financeiros (Audit Trail)
export const financialEvents = pgTable("financial_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  sessionId: varchar("session_id").references(() => tableSessions.id, { onDelete: 'set null' }),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: 'set null' }),
  tableId: varchar("table_id").references(() => tables.id, { onDelete: 'set null' }),
  shiftId: varchar("shift_id").references(() => financialShifts.id, { onDelete: 'set null' }),
  eventType: financialEventTypeEnum("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  operatorId: varchar("operator_id").references(() => users.id, { onDelete: 'set null' }),
  source: eventSourceEnum("source").notNull().default('UI'),
  metadata: jsonb("metadata"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFinancialEventSchema = createInsertSchema(financialEvents).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
  version: true,
});

export type InsertFinancialEvent = z.infer<typeof insertFinancialEventSchema>;
export type FinancialEvent = typeof financialEvents.$inferSelect;

// Order Adjustments - Ajustes de pedidos
export const orderAdjustments = pgTable("order_adjustments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  adjustmentType: adjustmentTypeEnum("adjustment_type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason"),
  operatorId: varchar("operator_id").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderAdjustmentSchema = createInsertSchema(orderAdjustments).omit({
  id: true,
  restaurantId: true,
  operatorId: true,
  createdAt: true,
}).extend({
  amount: z.string().regex(/^-?\d+(\.\d{1,2})?$/, "Valor inválido"),
});

export type InsertOrderAdjustment = z.infer<typeof insertOrderAdjustmentSchema>;
export type OrderAdjustment = typeof orderAdjustments.$inferSelect;

// Payment Events - Eventos de pagamento detalhados
export const paymentEvents = pgTable("payment_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: 'cascade' }),
  sessionId: varchar("session_id").references(() => tableSessions.id, { onDelete: 'cascade' }),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentSource: varchar("payment_source", { length: 100 }),
  methodDetails: jsonb("method_details"),
  reconciliationBatchId: varchar("reconciliation_batch_id", { length: 100 }),
  operatorId: varchar("operator_id").references(() => users.id, { onDelete: 'set null' }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentEventSchema = createInsertSchema(paymentEvents).omit({
  id: true,
  restaurantId: true,
  operatorId: true,
  createdAt: true,
}).extend({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
});

export type InsertPaymentEvent = z.infer<typeof insertPaymentEventSchema>;
export type PaymentEvent = typeof paymentEvents.$inferSelect;

// Report Aggregations - Agregações para relatórios
export const reportAggregations = pgTable("report_aggregations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  periodType: reportPeriodTypeEnum("period_type").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totals: jsonb("totals").notNull(),
  byTable: jsonb("by_table"),
  byCategory: jsonb("by_category"),
  byOperator: jsonb("by_operator"),
  topProducts: jsonb("top_products"),
  cancellations: jsonb("cancellations"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportAggregationSchema = createInsertSchema(reportAggregations).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
});

export type InsertReportAggregation = z.infer<typeof insertReportAggregationSchema>;
export type ReportAggregation = typeof reportAggregations.$inferSelect;

// Categories - Categorias do menu
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }), // Filial específica (null = compartilhado)
  name: varchar("name", { length: 100 }).notNull(),
  imageUrl: text("image_url"), // URL da imagem/ícone da categoria
  displayOrder: integer("display_order").notNull().default(0), // Ordem de exibição
  isVisible: integer("is_visible").notNull().default(1), // 0 = oculto, 1 = visível
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  restaurantId: true,
  branchId: true,
  createdAt: true,
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório").max(100, "Nome muito longo"),
  imageUrl: z.string().nullable().optional(),
  displayOrder: z.number().optional(),
  isVisible: z.number().min(0).max(1).optional(),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Menu Items - Pratos do menu
export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }), // Filial específica (null = compartilhado)
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }), // Preço original (antes do desconto)
  imageUrl: text("image_url"),
  displayOrder: integer("display_order").notNull().default(0), // Ordem de exibição
  isVisible: integer("is_visible").notNull().default(1), // 0 = oculto no menu, 1 = visível
  isAvailable: integer("is_available").notNull().default(1), // 0 = indisponível, 1 = disponível
  isFavorite: integer("is_favorite").notNull().default(0), // 0 = não é favorito, 1 = favorito
  isFeatured: integer("is_featured").notNull().default(0), // 0 = normal, 1 = destaque/mais vendido
  isNew: integer("is_new").notNull().default(0), // 0 = normal, 1 = novo item
  tags: text("tags").array(), // Tags: vegetariano, vegano, sem_gluten, picante, etc
  preparationTime: integer("preparation_time"), // Tempo de preparo em minutos
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  restaurantId: true,
  branchId: true,
  createdAt: true,
}).extend({
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido"),
  originalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço original inválido").optional().nullable(),
}).refine((data) => {
  if (data.originalPrice) {
    const price = parseFloat(data.price);
    const originalPrice = parseFloat(data.originalPrice);
    return originalPrice >= price;
  }
  return true;
}, {
  message: "Preço original deve ser maior ou igual ao preço atual",
  path: ["originalPrice"],
});

export const updateMenuItemSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1, "Nome do item é obrigatório").max(200, "Nome muito longo").optional(),
  description: z.string().nullable().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido").optional(),
  originalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço original inválido").nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  displayOrder: z.number().optional(),
  isVisible: z.number().min(0).max(1).optional(),
  isAvailable: z.number().min(0).max(1).optional(),
  isFavorite: z.number().min(0).max(1).optional(),
  isFeatured: z.number().min(0).max(1).optional(),
  isNew: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional(),
  preparationTime: z.number().min(1).optional().nullable(),
});

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type UpdateMenuItem = z.infer<typeof updateMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

// Option Group Type Enum
export const optionGroupTypeEnum = pgEnum('option_group_type', ['single', 'multiple']);

// Option Groups - Grupos de opções para pratos
export const optionGroups = pgTable("option_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menuItemId: varchar("menu_item_id").notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 200 }).notNull(), // Ex: "Tamanho", "Acompanhamentos"
  unit: varchar("unit", { length: 50 }), // Ex: "g", "ml", "un", "kg" - Unidade de medida das opções
  type: optionGroupTypeEnum("type").notNull().default('single'), // single = escolha única, multiple = múltipla escolha
  isRequired: integer("is_required").notNull().default(0), // 0 = opcional, 1 = obrigatório
  minSelections: integer("min_selections").notNull().default(0), // Mínimo de opções a escolher
  maxSelections: integer("max_selections").notNull().default(1), // Máximo de opções a escolher
  displayOrder: integer("display_order").notNull().default(0), // Ordem de exibição
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOptionGroupSchema = createInsertSchema(optionGroups).omit({
  id: true,
  menuItemId: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Nome do grupo é obrigatório"),
  unit: z.string().max(50, "Unidade muito longa").nullable().optional(),
  type: z.enum(['single', 'multiple']).default('single'),
  isRequired: z.number().min(0).max(1).default(0),
  minSelections: z.number().min(0).default(0),
  maxSelections: z.number().min(1).default(1),
  displayOrder: z.number().default(0),
});

export const updateOptionGroupSchema = createInsertSchema(optionGroups).omit({
  id: true,
  menuItemId: true,
  createdAt: true,
}).extend({
  unit: z.string().max(50, "Unidade muito longa").nullable().optional(),
}).partial();

export type InsertOptionGroup = z.infer<typeof insertOptionGroupSchema>;
export type UpdateOptionGroup = z.infer<typeof updateOptionGroupSchema>;
export type OptionGroup = typeof optionGroups.$inferSelect;

// Options - Opções individuais dentro de cada grupo
export const options = pgTable("options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  optionGroupId: varchar("option_group_id").notNull().references(() => optionGroups.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 200 }).notNull(), // Ex: "Grande", "Arroz", "Mal Passado"
  priceAdjustment: decimal("price_adjustment", { precision: 10, scale: 2 }).notNull().default('0'), // Valor adicional
  isAvailable: integer("is_available").notNull().default(1), // 0 = indisponível, 1 = disponível
  isRecommended: integer("is_recommended").notNull().default(0), // 0 = não recomendado, 1 = recomendado para upselling
  displayOrder: integer("display_order").notNull().default(0), // Ordem de exibição
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOptionSchema = createInsertSchema(options).omit({
  id: true,
  optionGroupId: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Nome da opção é obrigatório"),
  priceAdjustment: z.string().regex(/^-?\d+(\.\d{1,2})?$/, "Preço inválido").default('0'),
  isAvailable: z.number().min(0).max(1).default(1),
  isRecommended: z.number().min(0).max(1).default(0),
  displayOrder: z.number().default(0),
});

export const updateOptionSchema = createInsertSchema(options).omit({
  id: true,
  optionGroupId: true,
  createdAt: true,
}).partial();

export type InsertOption = z.infer<typeof insertOptionSchema>;
export type UpdateOption = z.infer<typeof updateOptionSchema>;
export type Option = typeof options.$inferSelect;

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

// Menu Visits - Registro de visitas ao menu digital
export const menuVisits = pgTable("menu_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  visitSource: varchar("visit_source", { length: 50 }).notNull().default('qr_code'), // 'qr_code', 'link', 'direct'
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMenuVisitSchema = createInsertSchema(menuVisits).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
});

export type InsertMenuVisit = z.infer<typeof insertMenuVisitSchema>;
export type MenuVisit = typeof menuVisits.$inferSelect;

// Customer Reviews - Avaliações de clientes
export const customerReviews = pgTable("customer_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: 'set null' }),
  customerName: varchar("customer_name", { length: 200 }),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerReviewSchema = createInsertSchema(customerReviews).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
}).extend({
  rating: z.number().int().min(1, "Avaliação deve ser no mínimo 1").max(5, "Avaliação deve ser no máximo 5"),
});

export type InsertCustomerReview = z.infer<typeof insertCustomerReviewSchema>;
export type CustomerReview = typeof customerReviews.$inferSelect;

// Relations
export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  users: many(users),
  branches: many(branches),
  tables: many(tables),
  categories: many(categories),
  menuItems: many(menuItems),
  messages: many(messages),
  menuVisits: many(menuVisits),
  customerReviews: many(customerReviews),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [branches.restaurantId],
    references: [restaurants.id],
  }),
  tables: many(tables),
  categories: many(categories),
  menuItems: many(menuItems),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [users.restaurantId],
    references: [restaurants.id],
  }),
  activeBranch: one(branches, {
    fields: [users.activeBranchId],
    references: [branches.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [categories.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [categories.branchId],
    references: [branches.id],
  }),
  menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [menuItems.branchId],
    references: [branches.id],
  }),
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  optionGroups: many(optionGroups),
}));

export const tablesRelations = relations(tables, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [tables.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [tables.branchId],
    references: [branches.id],
  }),
  orders: many(orders),
  sessions: many(tableSessions),
  payments: many(tablePayments),
}));

export const tableSessionsRelations = relations(tableSessions, ({ one, many }) => ({
  table: one(tables, {
    fields: [tableSessions.tableId],
    references: [tables.id],
  }),
  restaurant: one(restaurants, {
    fields: [tableSessions.restaurantId],
    references: [restaurants.id],
  }),
  shift: one(financialShifts, {
    fields: [tableSessions.shiftId],
    references: [financialShifts.id],
  }),
  operator: one(users, {
    fields: [tableSessions.operatorId],
    references: [users.id],
  }),
  closedBy: one(users, {
    fields: [tableSessions.closedById],
    references: [users.id],
  }),
  payments: many(tablePayments),
  orders: many(orders),
  events: many(financialEvents),
  paymentEvents: many(paymentEvents),
}));

export const tablePaymentsRelations = relations(tablePayments, ({ one }) => ({
  table: one(tables, {
    fields: [tablePayments.tableId],
    references: [tables.id],
  }),
  session: one(tableSessions, {
    fields: [tablePayments.sessionId],
    references: [tableSessions.id],
  }),
  restaurant: one(restaurants, {
    fields: [tablePayments.restaurantId],
    references: [restaurants.id],
  }),
  operator: one(users, {
    fields: [tablePayments.operatorId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),
  tableSession: one(tableSessions, {
    fields: [orders.tableSessionId],
    references: [tableSessions.id],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
  createdByUser: one(users, {
    fields: [orders.createdBy],
    references: [users.id],
  }),
  closedByUser: one(users, {
    fields: [orders.closedBy],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  adjustments: many(orderAdjustments),
  events: many(financialEvents),
  paymentEvents: many(paymentEvents),
  loyaltyTransactions: many(loyaltyTransactions),
  couponUsages: many(couponUsages),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
  orderItemOptions: many(orderItemOptions),
}));

export const optionGroupsRelations = relations(optionGroups, ({ one, many }) => ({
  menuItem: one(menuItems, {
    fields: [optionGroups.menuItemId],
    references: [menuItems.id],
  }),
  options: many(options),
}));

export const optionsRelations = relations(options, ({ one, many }) => ({
  optionGroup: one(optionGroups, {
    fields: [options.optionGroupId],
    references: [optionGroups.id],
  }),
  orderItemOptions: many(orderItemOptions),
}));

export const orderItemOptionsRelations = relations(orderItemOptions, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [orderItemOptions.orderItemId],
    references: [orderItems.id],
  }),
  option: one(options, {
    fields: [orderItemOptions.optionId],
    references: [options.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [messages.restaurantId],
    references: [restaurants.id],
  }),
}));

export const menuVisitsRelations = relations(menuVisits, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [menuVisits.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [menuVisits.branchId],
    references: [branches.id],
  }),
}));

export const customerReviewsRelations = relations(customerReviews, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [customerReviews.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [customerReviews.branchId],
    references: [branches.id],
  }),
  order: one(orders, {
    fields: [customerReviews.orderId],
    references: [orders.id],
  }),
}));

export const financialShiftsRelations = relations(financialShifts, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [financialShifts.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [financialShifts.branchId],
    references: [branches.id],
  }),
  operator: one(users, {
    fields: [financialShifts.operatorId],
    references: [users.id],
  }),
  sessions: many(tableSessions),
  events: many(financialEvents),
}));

export const financialEventsRelations = relations(financialEvents, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [financialEvents.restaurantId],
    references: [restaurants.id],
  }),
  session: one(tableSessions, {
    fields: [financialEvents.sessionId],
    references: [tableSessions.id],
  }),
  order: one(orders, {
    fields: [financialEvents.orderId],
    references: [orders.id],
  }),
  table: one(tables, {
    fields: [financialEvents.tableId],
    references: [tables.id],
  }),
  shift: one(financialShifts, {
    fields: [financialEvents.shiftId],
    references: [financialShifts.id],
  }),
  operator: one(users, {
    fields: [financialEvents.operatorId],
    references: [users.id],
  }),
}));

export const orderAdjustmentsRelations = relations(orderAdjustments, ({ one }) => ({
  order: one(orders, {
    fields: [orderAdjustments.orderId],
    references: [orders.id],
  }),
  restaurant: one(restaurants, {
    fields: [orderAdjustments.restaurantId],
    references: [restaurants.id],
  }),
  operator: one(users, {
    fields: [orderAdjustments.operatorId],
    references: [users.id],
  }),
}));

export const paymentEventsRelations = relations(paymentEvents, ({ one }) => ({
  order: one(orders, {
    fields: [paymentEvents.orderId],
    references: [orders.id],
  }),
  session: one(tableSessions, {
    fields: [paymentEvents.sessionId],
    references: [tableSessions.id],
  }),
  restaurant: one(restaurants, {
    fields: [paymentEvents.restaurantId],
    references: [restaurants.id],
  }),
  operator: one(users, {
    fields: [paymentEvents.operatorId],
    references: [users.id],
  }),
}));

export const reportAggregationsRelations = relations(reportAggregations, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [reportAggregations.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [reportAggregations.branchId],
    references: [branches.id],
  }),
}));

// Financial Module - Cash Registers
export const cashRegisters = pgTable("cash_registers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 200 }).notNull(),
  initialBalance: decimal("initial_balance", { precision: 10, scale: 2 }).notNull().default('0.00'),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull().default('0.00'),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCashRegisterSchema = createInsertSchema(cashRegisters).omit({
  id: true,
  restaurantId: true,
  currentBalance: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Nome da caixa é obrigatório"),
  branchId: z.string().optional().nullable(),
  initialBalance: z.string().optional(),
  isActive: z.number().optional(),
});

export const updateCashRegisterSchema = z.object({
  name: z.string().min(1, "Nome da caixa é obrigatório").optional(),
  isActive: z.number().optional(),
});

export type InsertCashRegister = z.infer<typeof insertCashRegisterSchema>;
export type UpdateCashRegister = z.infer<typeof updateCashRegisterSchema>;
export type CashRegister = typeof cashRegisters.$inferSelect;

// Cash Register Shift Status Enum
export const cashRegisterShiftStatusEnum = pgEnum('cash_register_shift_status', ['aberto', 'fechado']);

// Financial Module - Cash Register Shifts (Turnos de Caixa)
export const cashRegisterShifts = pgTable("cash_register_shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  cashRegisterId: varchar("cash_register_id").notNull().references(() => cashRegisters.id, { onDelete: 'restrict' }),
  openedByUserId: varchar("opened_by_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  closedByUserId: varchar("closed_by_user_id").references(() => users.id, { onDelete: 'restrict' }),
  status: cashRegisterShiftStatusEnum("status").notNull().default('aberto'),
  openingAmount: decimal("opening_amount", { precision: 10, scale: 2 }).notNull().default('0.00'),
  closingAmountExpected: decimal("closing_amount_expected", { precision: 10, scale: 2 }).default('0.00'),
  closingAmountCounted: decimal("closing_amount_counted", { precision: 10, scale: 2 }).default('0.00'),
  difference: decimal("difference", { precision: 10, scale: 2 }).default('0.00'),
  totalRevenues: decimal("total_revenues", { precision: 10, scale: 2 }).default('0.00'),
  totalExpenses: decimal("total_expenses", { precision: 10, scale: 2 }).default('0.00'),
  openedAt: timestamp("opened_at").defaultNow(),
  closedAt: timestamp("closed_at"),
  notes: text("notes"),
});

export const insertCashRegisterShiftSchema = createInsertSchema(cashRegisterShifts).omit({
  id: true,
  restaurantId: true,
  openedByUserId: true,
  closedByUserId: true,
  status: true,
  closingAmountExpected: true,
  closingAmountCounted: true,
  difference: true,
  totalRevenues: true,
  totalExpenses: true,
  openedAt: true,
  closedAt: true,
}).extend({
  branchId: z.string().optional().nullable(),
  cashRegisterId: z.string().min(1, "Caixa registradora é obrigatória"),
  openingAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor de abertura inválido"),
  notes: z.string().optional(),
});

export const closeCashRegisterShiftSchema = z.object({
  closingAmountCounted: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor contado inválido"),
  notes: z.string().optional(),
});

export type InsertCashRegisterShift = z.infer<typeof insertCashRegisterShiftSchema>;
export type CloseCashRegisterShift = z.infer<typeof closeCashRegisterShiftSchema>;
export type CashRegisterShift = typeof cashRegisterShifts.$inferSelect;

// Financial Module - Transaction Types
export const transactionTypeEnum = pgEnum('transaction_type', ['receita', 'despesa', 'ajuste']);

// Financial Module - Transaction Origin
export const transactionOriginEnum = pgEnum('transaction_origin', ['pdv', 'web', 'manual']);

// Financial Module - Categories
export const financialCategories = pgTable("financial_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  type: transactionTypeEnum("type").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  isDefault: integer("is_default").notNull().default(0),
  isArchived: integer("is_archived").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFinancialCategorySchema = createInsertSchema(financialCategories).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.enum(['receita', 'despesa', 'ajuste']),
  name: z.string().min(1, "Nome da categoria é obrigatório"),
  branchId: z.string().optional().nullable(),
  description: z.string().optional(),
  isDefault: z.number().optional(),
  isArchived: z.number().optional(),
});

export type InsertFinancialCategory = z.infer<typeof insertFinancialCategorySchema>;
export type FinancialCategory = typeof financialCategories.$inferSelect;

// Financial Module - Transactions
export const financialTransactions = pgTable("financial_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  cashRegisterId: varchar("cash_register_id").references(() => cashRegisters.id, { onDelete: 'restrict' }),
  shiftId: varchar("shift_id").references(() => cashRegisterShifts.id, { onDelete: 'restrict' }),
  categoryId: varchar("category_id").notNull().references(() => financialCategories.id, { onDelete: 'restrict' }),
  recordedByUserId: varchar("recorded_by_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  type: transactionTypeEnum("type").notNull(),
  origin: transactionOriginEnum("origin").notNull().default('manual'),
  description: varchar("description", { length: 500 }),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  referenceOrderId: varchar("reference_order_id").references(() => orders.id, { onDelete: 'set null' }),
  occurredAt: timestamp("occurred_at").notNull(),
  note: text("note"),
  totalInstallments: integer("total_installments").default(1),
  installmentNumber: integer("installment_number").default(1),
  parentTransactionId: varchar("parent_transaction_id").references((): any => financialTransactions.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({
  id: true,
  restaurantId: true,
  recordedByUserId: true,
  createdAt: true,
}).extend({
  branchId: z.string().optional().nullable(),
  cashRegisterId: z.string().optional().nullable(),
  shiftId: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  type: z.enum(['receita', 'despesa', 'ajuste']),
  origin: z.enum(['pdv', 'web', 'manual']).default('manual'),
  description: z.string().optional(),
  paymentMethod: z.enum(['dinheiro', 'multicaixa', 'transferencia', 'cartao']),
  amount: z.string().min(1, "Valor é obrigatório"),
  referenceOrderId: z.string().optional().nullable(),
  occurredAt: z.string().min(1, "Data e hora são obrigatórias"),
  note: z.string().optional(),
  totalInstallments: z.number().int().optional(),
  installmentNumber: z.number().int().optional(),
  parentTransactionId: z.string().optional().nullable(),
  installments: z.number().int().min(1).max(36).optional(),
});

export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;

// Financial Module - Expenses (Despesas)
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  categoryId: varchar("category_id").notNull().references(() => financialCategories.id, { onDelete: 'restrict' }),
  transactionId: varchar("transaction_id").references(() => financialTransactions.id, { onDelete: 'restrict' }),
  description: varchar("description", { length: 500 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  occurredAt: timestamp("occurred_at").notNull(),
  recordedByUserId: varchar("recorded_by_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  restaurantId: true,
  transactionId: true,
  recordedByUserId: true,
  createdAt: true,
}).extend({
  branchId: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
  paymentMethod: z.enum(['dinheiro', 'multicaixa', 'transferencia', 'cartao']),
  occurredAt: z.string().min(1, "Data e hora são obrigatórias"),
  note: z.string().optional(),
});

export const updateExpenseSchema = z.object({
  categoryId: z.string().min(1, "Categoria é obrigatória").optional(),
  description: z.string().min(1, "Descrição é obrigatória").optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido").optional(),
  paymentMethod: z.enum(['dinheiro', 'multicaixa', 'transferencia', 'cartao']).optional(),
  occurredAt: z.string().min(1, "Data e hora são obrigatórias").optional(),
  note: z.string().optional(),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Relations
export const cashRegistersRelations = relations(cashRegisters, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [cashRegisters.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [cashRegisters.branchId],
    references: [branches.id],
  }),
  transactions: many(financialTransactions),
  shifts: many(cashRegisterShifts),
}));

export const cashRegisterShiftsRelations = relations(cashRegisterShifts, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [cashRegisterShifts.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [cashRegisterShifts.branchId],
    references: [branches.id],
  }),
  cashRegister: one(cashRegisters, {
    fields: [cashRegisterShifts.cashRegisterId],
    references: [cashRegisters.id],
  }),
  openedBy: one(users, {
    fields: [cashRegisterShifts.openedByUserId],
    references: [users.id],
  }),
  closedBy: one(users, {
    fields: [cashRegisterShifts.closedByUserId],
    references: [users.id],
  }),
  transactions: many(financialTransactions),
}));

export const financialCategoriesRelations = relations(financialCategories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [financialCategories.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [financialCategories.branchId],
    references: [branches.id],
  }),
  transactions: many(financialTransactions),
}));

export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [financialTransactions.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [financialTransactions.branchId],
    references: [branches.id],
  }),
  cashRegister: one(cashRegisters, {
    fields: [financialTransactions.cashRegisterId],
    references: [cashRegisters.id],
  }),
  shift: one(cashRegisterShifts, {
    fields: [financialTransactions.shiftId],
    references: [cashRegisterShifts.id],
  }),
  category: one(financialCategories, {
    fields: [financialTransactions.categoryId],
    references: [financialCategories.id],
  }),
  recordedBy: one(users, {
    fields: [financialTransactions.recordedByUserId],
    references: [users.id],
  }),
  referenceOrder: one(orders, {
    fields: [financialTransactions.referenceOrderId],
    references: [orders.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [expenses.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [expenses.branchId],
    references: [branches.id],
  }),
  category: one(financialCategories, {
    fields: [expenses.categoryId],
    references: [financialCategories.id],
  }),
  transaction: one(financialTransactions, {
    fields: [expenses.transactionId],
    references: [financialTransactions.id],
  }),
  recordedBy: one(users, {
    fields: [expenses.recordedByUserId],
    references: [users.id],
  }),
}));

// ===== INVENTORY MODULE =====

// Stock Movement Type Enum
export const stockMovementTypeEnum = pgEnum('stock_movement_type', [
  'entrada',      // Entrada de mercadoria
  'saida',        // Saída de mercadoria
  'ajuste',       // Ajuste manual de estoque
  'transferencia' // Transferência entre filiais
]);

// Inventory Categories
export const inventoryCategories = pgTable("inventory_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInventoryCategorySchema = createInsertSchema(inventoryCategories).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Nome da categoria é obrigatório"),
  description: z.string().optional(),
});

export const updateInventoryCategorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório").optional(),
  description: z.string().optional(),
});

export type InsertInventoryCategory = z.infer<typeof insertInventoryCategorySchema>;
export type UpdateInventoryCategory = z.infer<typeof updateInventoryCategorySchema>;
export type InventoryCategory = typeof inventoryCategories.$inferSelect;

// Measurement Units
export const measurementUnits = pgTable("measurement_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 100 }).notNull(),
  abbreviation: varchar("abbreviation", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMeasurementUnitSchema = createInsertSchema(measurementUnits).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Nome da unidade é obrigatório"),
  abbreviation: z.string().min(1, "Abreviação é obrigatória"),
});

export const updateMeasurementUnitSchema = z.object({
  name: z.string().min(1, "Nome da unidade é obrigatório").optional(),
  abbreviation: z.string().min(1, "Abreviação é obrigatória").optional(),
});

export type InsertMeasurementUnit = z.infer<typeof insertMeasurementUnitSchema>;
export type UpdateMeasurementUnit = z.infer<typeof updateMeasurementUnitSchema>;
export type MeasurementUnit = typeof measurementUnits.$inferSelect;

// Inventory Items
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  categoryId: varchar("category_id").references(() => inventoryCategories.id, { onDelete: 'set null' }),
  unitId: varchar("unit_id").notNull().references(() => measurementUnits.id, { onDelete: 'restrict' }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull().default('0'),
  minStock: decimal("min_stock", { precision: 10, scale: 2 }).default('0'),
  maxStock: decimal("max_stock", { precision: 10, scale: 2 }).default('0'),
  reorderPoint: decimal("reorder_point", { precision: 10, scale: 2 }).default('0'),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  categoryId: z.string().optional().nullable(),
  unitId: z.string().min(1, "Unidade de medida é obrigatória"),
  name: z.string().min(1, "Nome do produto é obrigatório"),
  description: z.string().optional(),
  sku: z.string().optional(),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço de custo inválido").optional(),
  minStock: z.string().regex(/^\d+(\.\d{1,2})?$/, "Estoque mínimo inválido").optional(),
  maxStock: z.string().regex(/^\d+(\.\d{1,2})?$/, "Estoque máximo inválido").optional(),
  reorderPoint: z.string().regex(/^\d+(\.\d{1,2})?$/, "Ponto de recompra inválido").optional(),
  isActive: z.number().optional(),
});

export const updateInventoryItemSchema = z.object({
  categoryId: z.string().optional().nullable(),
  unitId: z.string().min(1, "Unidade de medida é obrigatória").optional(),
  name: z.string().min(1, "Nome do produto é obrigatório").optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço de custo inválido").optional(),
  minStock: z.string().regex(/^\d+(\.\d{1,2})?$/, "Estoque mínimo inválido").optional(),
  maxStock: z.string().regex(/^\d+(\.\d{1,2})?$/, "Estoque máximo inválido").optional(),
  reorderPoint: z.string().regex(/^\d+(\.\d{1,2})?$/, "Ponto de recompra inválido").optional(),
  isActive: z.number().optional(),
});

export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type UpdateInventoryItem = z.infer<typeof updateInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;

// Branch Stock
export const branchStock = pgTable("branch_stock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").notNull().references(() => branches.id, { onDelete: 'cascade' }),
  inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default('0'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type BranchStock = typeof branchStock.$inferSelect;

// Stock Movements
export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").notNull().references(() => branches.id, { onDelete: 'cascade' }),
  inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }),
  movementType: stockMovementTypeEnum("movement_type").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  previousQuantity: decimal("previous_quantity", { precision: 10, scale: 2 }).notNull(),
  newQuantity: decimal("new_quantity", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).default('0'),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).default('0'),
  reason: text("reason"),
  referenceId: varchar("reference_id", { length: 100 }),
  fromBranchId: varchar("from_branch_id").references(() => branches.id, { onDelete: 'set null' }),
  toBranchId: varchar("to_branch_id").references(() => branches.id, { onDelete: 'set null' }),
  recordedByUserId: varchar("recorded_by_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  restaurantId: true,
  recordedByUserId: true,
  previousQuantity: true,
  newQuantity: true,
  createdAt: true,
}).extend({
  branchId: z.string().optional(),
  inventoryItemId: z.string().min(1, "Produto é obrigatório"),
  movementType: z.enum(['entrada', 'saida', 'ajuste', 'transferencia']),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/, "Quantidade inválida"),
  unitCost: z.string().regex(/^\d+(\.\d{1,2})?$/, "Custo unitário inválido").optional(),
  totalCost: z.string().regex(/^\d+(\.\d{1,2})?$/, "Custo total inválido").optional(),
  reason: z.string().optional(),
  referenceId: z.string().optional(),
  fromBranchId: z.string().optional().nullable(),
  toBranchId: z.string().optional().nullable(),
});

export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;

// Inventory Relations
export const inventoryCategoriesRelations = relations(inventoryCategories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [inventoryCategories.restaurantId],
    references: [restaurants.id],
  }),
  items: many(inventoryItems),
}));

export const measurementUnitsRelations = relations(measurementUnits, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [measurementUnits.restaurantId],
    references: [restaurants.id],
  }),
  items: many(inventoryItems),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [inventoryItems.restaurantId],
    references: [restaurants.id],
  }),
  category: one(inventoryCategories, {
    fields: [inventoryItems.categoryId],
    references: [inventoryCategories.id],
  }),
  unit: one(measurementUnits, {
    fields: [inventoryItems.unitId],
    references: [measurementUnits.id],
  }),
  branchStocks: many(branchStock),
  movements: many(stockMovements),
}));

export const branchStockRelations = relations(branchStock, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [branchStock.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [branchStock.branchId],
    references: [branches.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [branchStock.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [stockMovements.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [stockMovements.branchId],
    references: [branches.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [stockMovements.inventoryItemId],
    references: [inventoryItems.id],
  }),
  fromBranch: one(branches, {
    fields: [stockMovements.fromBranchId],
    references: [branches.id],
  }),
  toBranch: one(branches, {
    fields: [stockMovements.toBranchId],
    references: [branches.id],
  }),
  recordedBy: one(users, {
    fields: [stockMovements.recordedByUserId],
    references: [users.id],
  }),
}));

// Recipe Ingredients - Liga itens do menu com ingredientes do inventário
export const recipeIngredients = pgTable("recipe_ingredients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  menuItemId: varchar("menu_item_id").notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  menuItemId: z.string().min(1, "Item do menu é obrigatório"),
  inventoryItemId: z.string().min(1, "Ingrediente é obrigatório"),
  quantity: z.string().regex(/^\d+(\.\d{1,3})?$/, "Quantidade inválida"),
});

export const updateRecipeIngredientSchema = z.object({
  quantity: z.string().regex(/^\d+(\.\d{1,3})?$/, "Quantidade inválida").optional(),
});

export type InsertRecipeIngredient = z.infer<typeof insertRecipeIngredientSchema>;
export type UpdateRecipeIngredient = z.infer<typeof updateRecipeIngredientSchema>;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [recipeIngredients.restaurantId],
    references: [restaurants.id],
  }),
  menuItem: one(menuItems, {
    fields: [recipeIngredients.menuItemId],
    references: [menuItems.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [recipeIngredients.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

// ===== CUSTOMER MANAGEMENT RELATIONS =====

export const customersRelations = relations(customers, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [customers.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [customers.branchId],
    references: [branches.id],
  }),
  orders: many(orders),
  loyaltyTransactions: many(loyaltyTransactions),
  couponUsages: many(couponUsages),
  sessions: many(customerSessions),
}));

export const customerSessionsRelations = relations(customerSessions, ({ one }) => ({
  customer: one(customers, {
    fields: [customerSessions.customerId],
    references: [customers.id],
  }),
  restaurant: one(restaurants, {
    fields: [customerSessions.restaurantId],
    references: [restaurants.id],
  }),
}));

export const loyaltyProgramsRelations = relations(loyaltyPrograms, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [loyaltyPrograms.restaurantId],
    references: [restaurants.id],
  }),
}));

export const loyaltyTransactionsRelations = relations(loyaltyTransactions, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [loyaltyTransactions.restaurantId],
    references: [restaurants.id],
  }),
  customer: one(customers, {
    fields: [loyaltyTransactions.customerId],
    references: [customers.id],
  }),
  order: one(orders, {
    fields: [loyaltyTransactions.orderId],
    references: [orders.id],
  }),
  createdByUser: one(users, {
    fields: [loyaltyTransactions.createdBy],
    references: [users.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [coupons.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [coupons.branchId],
    references: [branches.id],
  }),
  createdByUser: one(users, {
    fields: [coupons.createdBy],
    references: [users.id],
  }),
  usages: many(couponUsages),
  orders: many(orders),
}));

export const couponUsagesRelations = relations(couponUsages, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [couponUsages.restaurantId],
    references: [restaurants.id],
  }),
  coupon: one(coupons, {
    fields: [couponUsages.couponId],
    references: [coupons.id],
  }),
  customer: one(customers, {
    fields: [couponUsages.customerId],
    references: [customers.id],
  }),
  order: one(orders, {
    fields: [couponUsages.orderId],
    references: [orders.id],
  }),
}));

// ===== SUBSCRIPTION SYSTEM =====

// Subscription Plan Enum
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['basico', 'profissional', 'empresarial', 'enterprise']);

// Subscription Status Enum
export const subscriptionStatusEnum = pgEnum('subscription_status', ['trial', 'ativa', 'cancelada', 'suspensa', 'expirada']);

// Payment Status for Subscriptions
export const subscriptionPaymentStatusEnum = pgEnum('subscription_payment_status', ['pendente', 'pago', 'falhou', 'reembolsado']);

// Billing Interval Enum
export const billingIntervalEnum = pgEnum('billing_interval', ['mensal', 'anual']);

// Subscription Plans - Planos de Subscrição Pré-definidos
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(), // Básico, Profissional, Empresarial, Enterprise
  slug: varchar("slug", { length: 50 }).notNull().unique(), // basico, profissional, empresarial, enterprise
  description: text("description"),
  priceMonthlyKz: decimal("price_monthly_kz", { precision: 10, scale: 2 }).notNull(), // Preço mensal em Kwanzas
  priceAnnualKz: decimal("price_annual_kz", { precision: 10, scale: 2 }).notNull(), // Preço anual em Kwanzas
  priceMonthlyUsd: decimal("price_monthly_usd", { precision: 10, scale: 2 }).notNull(), // Preço mensal em USD
  priceAnnualUsd: decimal("price_annual_usd", { precision: 10, scale: 2 }).notNull(), // Preço anual em USD
  stripePriceIdMonthly: varchar("stripe_price_id_monthly", { length: 255 }), // Stripe Price ID para mensal
  stripePriceIdAnnual: varchar("stripe_price_id_annual", { length: 255 }), // Stripe Price ID para anual
  trialDays: integer("trial_days").notNull().default(14),
  maxBranches: integer("max_branches").notNull().default(1),
  maxTables: integer("max_tables").notNull().default(10),
  maxMenuItems: integer("max_menu_items").notNull().default(50),
  maxOrdersPerMonth: integer("max_orders_per_month").notNull().default(500),
  maxUsers: integer("max_users").notNull().default(2),
  historyRetentionDays: integer("history_retention_days").notNull().default(30),
  maxCustomers: integer("max_customers").notNull().default(100),
  hasLoyaltyProgram: integer("has_loyalty_program").notNull().default(0),
  maxActiveCoupons: integer("max_active_coupons").notNull().default(0),
  hasCouponSystem: integer("has_coupon_system").notNull().default(0),
  hasExpenseTracking: integer("has_expense_tracking").notNull().default(0),
  maxExpenseCategories: integer("max_expense_categories").notNull().default(0),
  hasInventoryModule: integer("has_inventory_module").notNull().default(0),
  maxInventoryItems: integer("max_inventory_items").notNull().default(0),
  hasStockTransfers: integer("has_stock_transfers").notNull().default(0),
  features: jsonb("features"), // Array de features incluídas: ['pdv', 'fidelidade', 'cupons', etc]
  isActive: integer("is_active").notNull().default(1), // 0 = inativo, 1 = ativo
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Nome do plano é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  priceMonthlyKz: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido"),
  priceAnnualKz: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido"),
  priceMonthlyUsd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido"),
  priceAnnualUsd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido"),
});

export const updateSubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Nome do plano é obrigatório").optional(),
  description: z.string().optional(),
  priceMonthlyKz: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido").optional(),
  priceAnnualKz: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido").optional(),
  priceMonthlyUsd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido").optional(),
  priceAnnualUsd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido").optional(),
  trialDays: z.number().int().min(0).optional(),
  maxBranches: z.number().int().min(1).optional(),
  maxTables: z.number().int().min(1).optional(),
  maxMenuItems: z.number().int().min(1).optional(),
  maxOrdersPerMonth: z.number().int().min(1).optional(),
  maxUsers: z.number().int().min(1).optional(),
  historyRetentionDays: z.number().int().min(1).optional(),
  maxCustomers: z.number().int().min(0).optional(),
  hasLoyaltyProgram: z.number().int().min(0).max(1).optional(),
  maxActiveCoupons: z.number().int().min(0).optional(),
  hasCouponSystem: z.number().int().min(0).max(1).optional(),
  hasExpenseTracking: z.number().int().min(0).max(1).optional(),
  maxExpenseCategories: z.number().int().min(0).optional(),
  hasInventoryModule: z.number().int().min(0).max(1).optional(),
  maxInventoryItems: z.number().int().min(0).optional(),
  hasStockTransfers: z.number().int().min(0).max(1).optional(),
  isActive: z.number().int().min(0).max(1).optional(),
  displayOrder: z.number().int().optional(),
});

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type UpdateSubscriptionPlan = z.infer<typeof updateSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// Subscriptions - Subscrições Ativas
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }).unique(),
  planId: varchar("plan_id").notNull().references(() => subscriptionPlans.id, { onDelete: 'restrict' }),
  status: subscriptionStatusEnum("status").notNull().default('trial'),
  billingInterval: billingIntervalEnum("billing_interval").notNull().default('mensal'),
  currency: varchar("currency", { length: 3 }).notNull().default('AOA'), // AOA ou USD
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  canceledAt: timestamp("canceled_at"),
  cancelAtPeriodEnd: integer("cancel_at_period_end").notNull().default(0), // 0 = não, 1 = sim
  autoRenew: integer("auto_renew").notNull().default(1), // 0 = não renova, 1 = renova automaticamente
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema simplificado para cliente criar subscrição - aceita apenas o mínimo necessário
export const insertSubscriptionSchema = z.object({
  planId: z.string().min(1, "Plano é obrigatório"),
  billingInterval: z.enum(['mensal', 'anual']).default('mensal'),
  currency: z.enum(['AOA', 'USD']).default('AOA'),
});

export const updateSubscriptionSchema = z.object({
  planId: z.string().optional(),
  status: z.enum(['trial', 'ativa', 'cancelada', 'suspensa', 'expirada']).optional(),
  billingInterval: z.enum(['mensal', 'anual']).optional(),
  cancelAtPeriodEnd: z.number().optional(),
  autoRenew: z.number().optional(),
});

export const superAdminCreateSubscriptionSchema = z.object({
  planId: z.string().min(1, "Plano é obrigatório"),
  billingInterval: z.enum(['mensal', 'anual']),
  currency: z.enum(['AOA', 'USD']),
  status: z.enum(['trial', 'ativa', 'cancelada', 'suspensa', 'expirada']).default('trial'),
});

export const superAdminUpdateSubscriptionSchema = z.object({
  planId: z.string().optional(),
  status: z.enum(['trial', 'ativa', 'cancelada', 'suspensa', 'expirada']).optional(),
  billingInterval: z.enum(['mensal', 'anual']).optional(),
  currency: z.enum(['AOA', 'USD']).optional(),
  cancelAtPeriodEnd: z.number().optional(),
  autoRenew: z.number().optional(),
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type UpdateSubscription = z.infer<typeof updateSubscriptionSchema>;
export type SuperAdminCreateSubscription = z.infer<typeof superAdminCreateSubscriptionSchema>;
export type SuperAdminUpdateSubscription = z.infer<typeof superAdminUpdateSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Subscription Payments - Histórico de Pagamentos
export const subscriptionPayments = pgTable("subscription_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default('KZ'), // KZ ou USD
  status: subscriptionPaymentStatusEnum("status").notNull().default('pendente'),
  paymentMethod: varchar("payment_method", { length: 100 }), // stripe, multicaixa, transferencia
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  paidAt: timestamp("paid_at"),
  failedAt: timestamp("failed_at"),
  failureReason: text("failure_reason"),
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionPaymentSchema = createInsertSchema(subscriptionPayments).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
}).extend({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
  billingPeriodStart: z.string(),
  billingPeriodEnd: z.string(),
});

export type InsertSubscriptionPayment = z.infer<typeof insertSubscriptionPaymentSchema>;
export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;

// Subscription Usage - Métricas de Uso
export const subscriptionUsage = pgTable("subscription_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  branchesCount: integer("branches_count").notNull().default(0),
  tablesCount: integer("tables_count").notNull().default(0),
  menuItemsCount: integer("menu_items_count").notNull().default(0),
  ordersCount: integer("orders_count").notNull().default(0),
  usersCount: integer("users_count").notNull().default(0),
  lastCalculatedAt: timestamp("last_calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionUsageSchema = createInsertSchema(subscriptionUsage).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
}).extend({
  periodStart: z.string(),
  periodEnd: z.string(),
});

export type InsertSubscriptionUsage = z.infer<typeof insertSubscriptionUsageSchema>;
export type SubscriptionUsage = typeof subscriptionUsage.$inferSelect;

// ===== SUBSCRIPTION RELATIONS =====

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [subscriptions.restaurantId],
    references: [restaurants.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  payments: many(subscriptionPayments),
  usageRecords: many(subscriptionUsage),
}));

export const subscriptionPaymentsRelations = relations(subscriptionPayments, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [subscriptionPayments.subscriptionId],
    references: [subscriptions.id],
  }),
  restaurant: one(restaurants, {
    fields: [subscriptionPayments.restaurantId],
    references: [restaurants.id],
  }),
}));

export const subscriptionUsageRelations = relations(subscriptionUsage, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [subscriptionUsage.restaurantId],
    references: [restaurants.id],
  }),
  subscription: one(subscriptions, {
    fields: [subscriptionUsage.subscriptionId],
    references: [subscriptions.id],
  }),
}));

// ===== NOTIFICATION SYSTEM =====

// Notification Type Enum
export const notificationTypeEnum = pgEnum('notification_type', [
  'new_order',           // Novo pedido recebido
  'order_status',        // Mudança de status do pedido
  'order_cancelled',     // Pedido cancelado
  'low_stock',           // Estoque baixo
  'new_customer',        // Novo cliente cadastrado
  'payment_received',    // Pagamento recebido
  'subscription_alert',  // Alerta de subscrição (expirando, limite atingido)
  'system',              // Notificação do sistema
]);

// Notification Channel Enum
export const notificationChannelEnum = pgEnum('notification_channel', [
  'in_app',    // Notificação dentro do app
  'whatsapp',  // WhatsApp via Twilio
  'email',     // Email (futuro)
  'push',      // Push notification (futuro)
]);

// Notifications - Notificações
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: varchar("branch_id").references(() => branches.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }), // null = notificação para todos os admins
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Dados adicionais (orderId, customerId, etc.)
  isRead: integer("is_read").notNull().default(0), // 0 = não lida, 1 = lida
  readAt: timestamp("read_at"),
  channel: notificationChannelEnum("channel").notNull().default('in_app'),
  sentAt: timestamp("sent_at"), // Quando foi enviada via WhatsApp/Email
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_notifications_restaurant").on(table.restaurantId),
  index("idx_notifications_user").on(table.userId),
  index("idx_notifications_unread").on(table.restaurantId, table.isRead),
]);

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  restaurantId: true,
  isRead: true,
  readAt: true,
  sentAt: true,
  createdAt: true,
}).extend({
  title: z.string().min(1, "Título é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  type: z.enum(['new_order', 'order_status', 'order_cancelled', 'low_stock', 'new_customer', 'payment_received', 'subscription_alert', 'system']),
  channel: z.enum(['in_app', 'whatsapp', 'email', 'push']).default('in_app'),
  branchId: z.string().optional(),
  userId: z.string().optional(),
  data: z.any().optional(),
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Notification Preferences - Preferências de Notificação por Usuário/Restaurante
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }), // null = configuração padrão do restaurante
  // Canais habilitados
  inAppEnabled: integer("in_app_enabled").notNull().default(1),
  whatsappEnabled: integer("whatsapp_enabled").notNull().default(0),
  emailEnabled: integer("email_enabled").notNull().default(0),
  // Tipos de notificação habilitados
  newOrderEnabled: integer("new_order_enabled").notNull().default(1),
  orderStatusEnabled: integer("order_status_enabled").notNull().default(1),
  orderCancelledEnabled: integer("order_cancelled_enabled").notNull().default(1),
  lowStockEnabled: integer("low_stock_enabled").notNull().default(1),
  newCustomerEnabled: integer("new_customer_enabled").notNull().default(0),
  paymentReceivedEnabled: integer("payment_received_enabled").notNull().default(1),
  subscriptionAlertEnabled: integer("subscription_alert_enabled").notNull().default(1),
  // WhatsApp para admin (número alternativo para receber notificações)
  whatsappNotificationNumber: varchar("whatsapp_notification_number", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_notification_prefs_restaurant").on(table.restaurantId),
  index("idx_notification_prefs_user").on(table.userId),
]);

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateNotificationPreferencesSchema = z.object({
  inAppEnabled: z.number().min(0).max(1).optional(),
  whatsappEnabled: z.number().min(0).max(1).optional(),
  emailEnabled: z.number().min(0).max(1).optional(),
  newOrderEnabled: z.number().min(0).max(1).optional(),
  orderStatusEnabled: z.number().min(0).max(1).optional(),
  orderCancelledEnabled: z.number().min(0).max(1).optional(),
  lowStockEnabled: z.number().min(0).max(1).optional(),
  newCustomerEnabled: z.number().min(0).max(1).optional(),
  paymentReceivedEnabled: z.number().min(0).max(1).optional(),
  subscriptionAlertEnabled: z.number().min(0).max(1).optional(),
  whatsappNotificationNumber: z.string().optional(),
});

export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type UpdateNotificationPreferences = z.infer<typeof updateNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

// Customer Notification Preferences - Preferências de Notificação do Cliente
export const customerNotificationPreferences = pgTable("customer_notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: 'cascade' }).unique(),
  orderStatusEnabled: integer("order_status_enabled").notNull().default(1), // Receber atualizações de status
  promotionsEnabled: integer("promotions_enabled").notNull().default(0), // Receber promoções
  whatsappEnabled: integer("whatsapp_enabled").notNull().default(1), // Receber via WhatsApp
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const updateCustomerNotificationPreferencesSchema = z.object({
  orderStatusEnabled: z.number().min(0).max(1).optional(),
  promotionsEnabled: z.number().min(0).max(1).optional(),
  whatsappEnabled: z.number().min(0).max(1).optional(),
});

export type UpdateCustomerNotificationPreferences = z.infer<typeof updateCustomerNotificationPreferencesSchema>;
export type CustomerNotificationPreferences = typeof customerNotificationPreferences.$inferSelect;

// ===== NOTIFICATION RELATIONS =====

export const notificationsRelations = relations(notifications, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [notifications.restaurantId],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [notifications.branchId],
    references: [branches.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [notificationPreferences.restaurantId],
    references: [restaurants.id],
  }),
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export const customerNotificationPreferencesRelations = relations(customerNotificationPreferences, ({ one }) => ({
  customer: one(customers, {
    fields: [customerNotificationPreferences.customerId],
    references: [customers.id],
  }),
}));
