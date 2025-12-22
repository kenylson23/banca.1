var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  ROLE_PERMISSIONS: () => ROLE_PERMISSIONS,
  adjustmentTypeEnum: () => adjustmentTypeEnum,
  adminResetPasswordSchema: () => adminResetPasswordSchema,
  applyCouponSchema: () => applyCouponSchema,
  applyDeliveryFeeSchema: () => applyDeliveryFeeSchema,
  applyDiscountSchema: () => applyDiscountSchema,
  applyPackagingFeeSchema: () => applyPackagingFeeSchema,
  applyServiceChargeSchema: () => applyServiceChargeSchema,
  billSplitTypeEnum: () => billSplitTypeEnum,
  billingIntervalEnum: () => billingIntervalEnum,
  branchStock: () => branchStock,
  branchStockRelations: () => branchStockRelations,
  branches: () => branches,
  branchesRelations: () => branchesRelations,
  cancelOrderSchema: () => cancelOrderSchema,
  cashRegisterShiftStatusEnum: () => cashRegisterShiftStatusEnum,
  cashRegisterShifts: () => cashRegisterShifts,
  cashRegisterShiftsRelations: () => cashRegisterShiftsRelations,
  cashRegisters: () => cashRegisters,
  cashRegistersRelations: () => cashRegistersRelations,
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  closeCashRegisterShiftSchema: () => closeCashRegisterShiftSchema,
  couponUsages: () => couponUsages,
  couponUsagesRelations: () => couponUsagesRelations,
  coupons: () => coupons,
  couponsRelations: () => couponsRelations,
  customerAuthRequestSchema: () => customerAuthRequestSchema,
  customerAuthVerifySchema: () => customerAuthVerifySchema,
  customerNotificationPreferences: () => customerNotificationPreferences,
  customerNotificationPreferencesRelations: () => customerNotificationPreferencesRelations,
  customerReviews: () => customerReviews,
  customerReviewsRelations: () => customerReviewsRelations,
  customerSessions: () => customerSessions,
  customerSessionsRelations: () => customerSessionsRelations,
  customerTierEnum: () => customerTierEnum,
  customers: () => customers,
  customersRelations: () => customersRelations,
  discountTypeEnum: () => discountTypeEnum,
  eventSourceEnum: () => eventSourceEnum,
  expenses: () => expenses,
  expensesRelations: () => expensesRelations,
  financialCategories: () => financialCategories,
  financialCategoriesRelations: () => financialCategoriesRelations,
  financialEventTypeEnum: () => financialEventTypeEnum,
  financialEvents: () => financialEvents,
  financialEventsRelations: () => financialEventsRelations,
  financialShifts: () => financialShifts,
  financialShiftsRelations: () => financialShiftsRelations,
  financialTransactions: () => financialTransactions,
  financialTransactionsRelations: () => financialTransactionsRelations,
  guestPayments: () => guestPayments,
  guestStatusEnum: () => guestStatusEnum,
  insertBranchSchema: () => insertBranchSchema,
  insertCashRegisterSchema: () => insertCashRegisterSchema,
  insertCashRegisterShiftSchema: () => insertCashRegisterShiftSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertCouponSchema: () => insertCouponSchema,
  insertCouponUsageSchema: () => insertCouponUsageSchema,
  insertCustomerReviewSchema: () => insertCustomerReviewSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertCustomerSessionSchema: () => insertCustomerSessionSchema,
  insertExpenseSchema: () => insertExpenseSchema,
  insertFinancialCategorySchema: () => insertFinancialCategorySchema,
  insertFinancialEventSchema: () => insertFinancialEventSchema,
  insertFinancialShiftSchema: () => insertFinancialShiftSchema,
  insertFinancialTransactionSchema: () => insertFinancialTransactionSchema,
  insertGuestPaymentSchema: () => insertGuestPaymentSchema,
  insertInventoryCategorySchema: () => insertInventoryCategorySchema,
  insertInventoryItemSchema: () => insertInventoryItemSchema,
  insertLinkAnalyticsSchema: () => insertLinkAnalyticsSchema,
  insertLoyaltyProgramSchema: () => insertLoyaltyProgramSchema,
  insertLoyaltyTransactionSchema: () => insertLoyaltyTransactionSchema,
  insertMeasurementUnitSchema: () => insertMeasurementUnitSchema,
  insertMenuItemSchema: () => insertMenuItemSchema,
  insertMenuVisitSchema: () => insertMenuVisitSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationPreferencesSchema: () => insertNotificationPreferencesSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOptionGroupSchema: () => insertOptionGroupSchema,
  insertOptionSchema: () => insertOptionSchema,
  insertOrderAdjustmentSchema: () => insertOrderAdjustmentSchema,
  insertOrderItemAuditLogSchema: () => insertOrderItemAuditLogSchema,
  insertOrderItemOptionSchema: () => insertOrderItemOptionSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPaymentEventSchema: () => insertPaymentEventSchema,
  insertPrintHistorySchema: () => insertPrintHistorySchema,
  insertPrinterConfigurationSchema: () => insertPrinterConfigurationSchema,
  insertRecipeIngredientSchema: () => insertRecipeIngredientSchema,
  insertReportAggregationSchema: () => insertReportAggregationSchema,
  insertRestaurantSchema: () => insertRestaurantSchema,
  insertStockMovementSchema: () => insertStockMovementSchema,
  insertSubscriptionPaymentSchema: () => insertSubscriptionPaymentSchema,
  insertSubscriptionPlanSchema: () => insertSubscriptionPlanSchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertSubscriptionUsageSchema: () => insertSubscriptionUsageSchema,
  insertTableBillSplitSchema: () => insertTableBillSplitSchema,
  insertTableGuestSchema: () => insertTableGuestSchema,
  insertTablePaymentSchema: () => insertTablePaymentSchema,
  insertTableSchema: () => insertTableSchema,
  insertTableSessionSchema: () => insertTableSessionSchema,
  insertUserAuditLogSchema: () => insertUserAuditLogSchema,
  insertUserSchema: () => insertUserSchema,
  inventoryCategories: () => inventoryCategories,
  inventoryCategoriesRelations: () => inventoryCategoriesRelations,
  inventoryItems: () => inventoryItems,
  inventoryItemsRelations: () => inventoryItemsRelations,
  linkAnalytics: () => linkAnalytics,
  linkCustomerSchema: () => linkCustomerSchema,
  loginSchema: () => loginSchema,
  loyaltyPrograms: () => loyaltyPrograms,
  loyaltyProgramsRelations: () => loyaltyProgramsRelations,
  loyaltyTransactionTypeEnum: () => loyaltyTransactionTypeEnum,
  loyaltyTransactions: () => loyaltyTransactions,
  loyaltyTransactionsRelations: () => loyaltyTransactionsRelations,
  measurementUnits: () => measurementUnits,
  measurementUnitsRelations: () => measurementUnitsRelations,
  menuItems: () => menuItems,
  menuItemsRelations: () => menuItemsRelations,
  menuVisits: () => menuVisits,
  menuVisitsRelations: () => menuVisitsRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  notificationChannelEnum: () => notificationChannelEnum,
  notificationPreferences: () => notificationPreferences,
  notificationPreferencesRelations: () => notificationPreferencesRelations,
  notificationTypeEnum: () => notificationTypeEnum,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  optionGroupTypeEnum: () => optionGroupTypeEnum,
  optionGroups: () => optionGroups,
  optionGroupsRelations: () => optionGroupsRelations,
  options: () => options,
  optionsRelations: () => optionsRelations,
  orderAdjustments: () => orderAdjustments,
  orderAdjustmentsRelations: () => orderAdjustmentsRelations,
  orderItemAuditActionEnum: () => orderItemAuditActionEnum,
  orderItemAuditLogs: () => orderItemAuditLogs,
  orderItemAuditLogsRelations: () => orderItemAuditLogsRelations,
  orderItemOptions: () => orderItemOptions,
  orderItemOptionsRelations: () => orderItemOptionsRelations,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orderStatusEnum: () => orderStatusEnum,
  orderTypeEnum: () => orderTypeEnum,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  paymentEvents: () => paymentEvents,
  paymentEventsRelations: () => paymentEventsRelations,
  paymentMethodEnum: () => paymentMethodEnum,
  paymentStatusEnum: () => paymentStatusEnum,
  printHistory: () => printHistory,
  printerConfigurations: () => printerConfigurations,
  printerLanguageEnum: () => printerLanguageEnum,
  printerTypeEnum: () => printerTypeEnum,
  publicOrderItemSchema: () => publicOrderItemSchema,
  publicOrderSchema: () => publicOrderSchema,
  reassignOrderItemSchema: () => reassignOrderItemSchema,
  recipeIngredients: () => recipeIngredients,
  recipeIngredientsRelations: () => recipeIngredientsRelations,
  recordPaymentSchema: () => recordPaymentSchema,
  redeemLoyaltyPointsSchema: () => redeemLoyaltyPointsSchema,
  registerRestaurantSchema: () => registerRestaurantSchema,
  reportAggregations: () => reportAggregations,
  reportAggregationsRelations: () => reportAggregationsRelations,
  reportPeriodTypeEnum: () => reportPeriodTypeEnum,
  resetRestaurantAdminCredentialsSchema: () => resetRestaurantAdminCredentialsSchema,
  restaurantStatusEnum: () => restaurantStatusEnum,
  restaurants: () => restaurants,
  restaurantsRelations: () => restaurantsRelations,
  sessions: () => sessions,
  shiftStatusEnum: () => shiftStatusEnum,
  stockMovementTypeEnum: () => stockMovementTypeEnum,
  stockMovements: () => stockMovements,
  stockMovementsRelations: () => stockMovementsRelations,
  subscriptionPaymentStatusEnum: () => subscriptionPaymentStatusEnum,
  subscriptionPayments: () => subscriptionPayments,
  subscriptionPaymentsRelations: () => subscriptionPaymentsRelations,
  subscriptionPlanEnum: () => subscriptionPlanEnum,
  subscriptionPlans: () => subscriptionPlans,
  subscriptionPlansRelations: () => subscriptionPlansRelations,
  subscriptionStatusEnum: () => subscriptionStatusEnum,
  subscriptionUsage: () => subscriptionUsage,
  subscriptionUsageRelations: () => subscriptionUsageRelations,
  subscriptions: () => subscriptions,
  subscriptionsRelations: () => subscriptionsRelations,
  superAdminCreateSubscriptionSchema: () => superAdminCreateSubscriptionSchema,
  superAdminUpdateSubscriptionSchema: () => superAdminUpdateSubscriptionSchema,
  tableBillSplits: () => tableBillSplits,
  tableGuests: () => tableGuests,
  tablePayments: () => tablePayments,
  tablePaymentsRelations: () => tablePaymentsRelations,
  tableSessions: () => tableSessions,
  tableSessionsRelations: () => tableSessionsRelations,
  tableStatusEnum: () => tableStatusEnum,
  tables: () => tables,
  tablesRelations: () => tablesRelations,
  transactionOriginEnum: () => transactionOriginEnum,
  transactionTypeEnum: () => transactionTypeEnum,
  updateBranchSchema: () => updateBranchSchema,
  updateCashRegisterSchema: () => updateCashRegisterSchema,
  updateCategorySchema: () => updateCategorySchema,
  updateCouponSchema: () => updateCouponSchema,
  updateCustomerNotificationPreferencesSchema: () => updateCustomerNotificationPreferencesSchema,
  updateCustomerSchema: () => updateCustomerSchema,
  updateExpenseSchema: () => updateExpenseSchema,
  updateInventoryCategorySchema: () => updateInventoryCategorySchema,
  updateInventoryItemSchema: () => updateInventoryItemSchema,
  updateLoyaltyProgramSchema: () => updateLoyaltyProgramSchema,
  updateMeasurementUnitSchema: () => updateMeasurementUnitSchema,
  updateMenuItemSchema: () => updateMenuItemSchema,
  updateNotificationPreferencesSchema: () => updateNotificationPreferencesSchema,
  updateOptionGroupSchema: () => updateOptionGroupSchema,
  updateOptionSchema: () => updateOptionSchema,
  updateOrderItemQuantitySchema: () => updateOrderItemQuantitySchema,
  updateOrderMetadataSchema: () => updateOrderMetadataSchema,
  updateOrderStatusSchema: () => updateOrderStatusSchema,
  updatePasswordSchema: () => updatePasswordSchema,
  updatePrinterConfigurationSchema: () => updatePrinterConfigurationSchema,
  updateProfileSchema: () => updateProfileSchema,
  updateRecipeIngredientSchema: () => updateRecipeIngredientSchema,
  updateRestaurantAppearanceSchema: () => updateRestaurantAppearanceSchema,
  updateRestaurantSlugSchema: () => updateRestaurantSlugSchema,
  updateSubscriptionPlanSchema: () => updateSubscriptionPlanSchema,
  updateSubscriptionSchema: () => updateSubscriptionSchema,
  updateTableBillSplitSchema: () => updateTableBillSplitSchema,
  updateTableGuestSchema: () => updateTableGuestSchema,
  updateTableStatusSchema: () => updateTableStatusSchema,
  updateUserSchema: () => updateUserSchema,
  userAuditActionEnum: () => userAuditActionEnum,
  userAuditLogs: () => userAuditLogs,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations,
  validateCouponSchema: () => validateCouponSchema
});
import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  serial,
  decimal,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions, restaurantStatusEnum, restaurants, insertRestaurantSchema, registerRestaurantSchema, updateRestaurantSlugSchema, updateRestaurantAppearanceSchema, branches, insertBranchSchema, updateBranchSchema, userRoleEnum, ROLE_PERMISSIONS, users, insertUserSchema, loginSchema, updateUserSchema, updateProfileSchema, updatePasswordSchema, adminResetPasswordSchema, resetRestaurantAdminCredentialsSchema, userAuditActionEnum, userAuditLogs, insertUserAuditLogSchema, printerTypeEnum, printerLanguageEnum, printerConfigurations, insertPrinterConfigurationSchema, updatePrinterConfigurationSchema, printHistory, insertPrintHistorySchema, tableStatusEnum, tables, insertTableSchema, updateTableStatusSchema, shiftStatusEnum, financialEventTypeEnum, eventSourceEnum, adjustmentTypeEnum, reportPeriodTypeEnum, paymentMethodEnum, financialShifts, insertFinancialShiftSchema, tableSessions, insertTableSessionSchema, tablePayments, insertTablePaymentSchema, guestStatusEnum, billSplitTypeEnum, tableGuests, insertTableGuestSchema, updateTableGuestSchema, tableBillSplits, insertTableBillSplitSchema, updateTableBillSplitSchema, guestPayments, insertGuestPaymentSchema, orderStatusEnum, orderTypeEnum, paymentStatusEnum, discountTypeEnum, customerTierEnum, loyaltyTransactionTypeEnum, customers, insertCustomerSchema, updateCustomerSchema, customerSessions, insertCustomerSessionSchema, customerAuthRequestSchema, customerAuthVerifySchema, loyaltyPrograms, insertLoyaltyProgramSchema, updateLoyaltyProgramSchema, loyaltyTransactions, insertLoyaltyTransactionSchema, coupons, insertCouponSchema, updateCouponSchema, validateCouponSchema, couponUsages, insertCouponUsageSchema, orders, insertOrderSchema, publicOrderSchema, updateOrderStatusSchema, updateOrderMetadataSchema, applyDiscountSchema, applyServiceChargeSchema, applyDeliveryFeeSchema, applyPackagingFeeSchema, recordPaymentSchema, updateOrderItemQuantitySchema, reassignOrderItemSchema, orderItemAuditActionEnum, orderItemAuditLogs, insertOrderItemAuditLogSchema, linkCustomerSchema, applyCouponSchema, redeemLoyaltyPointsSchema, cancelOrderSchema, orderItems, insertOrderItemSchema, publicOrderItemSchema, orderItemOptions, insertOrderItemOptionSchema, financialEvents, insertFinancialEventSchema, orderAdjustments, insertOrderAdjustmentSchema, paymentEvents, insertPaymentEventSchema, reportAggregations, insertReportAggregationSchema, categories, insertCategorySchema, updateCategorySchema, menuItems, insertMenuItemSchema, updateMenuItemSchema, optionGroupTypeEnum, optionGroups, insertOptionGroupSchema, updateOptionGroupSchema, options, insertOptionSchema, updateOptionSchema, messages, insertMessageSchema, menuVisits, insertMenuVisitSchema, customerReviews, insertCustomerReviewSchema, restaurantsRelations, branchesRelations, usersRelations, categoriesRelations, menuItemsRelations, tablesRelations, tableSessionsRelations, tablePaymentsRelations, ordersRelations, orderItemsRelations, orderItemAuditLogsRelations, optionGroupsRelations, optionsRelations, orderItemOptionsRelations, messagesRelations, menuVisitsRelations, customerReviewsRelations, financialShiftsRelations, financialEventsRelations, orderAdjustmentsRelations, paymentEventsRelations, reportAggregationsRelations, cashRegisters, insertCashRegisterSchema, updateCashRegisterSchema, cashRegisterShiftStatusEnum, cashRegisterShifts, insertCashRegisterShiftSchema, closeCashRegisterShiftSchema, transactionTypeEnum, transactionOriginEnum, financialCategories, insertFinancialCategorySchema, financialTransactions, insertFinancialTransactionSchema, expenses, insertExpenseSchema, updateExpenseSchema, cashRegistersRelations, cashRegisterShiftsRelations, financialCategoriesRelations, financialTransactionsRelations, expensesRelations, stockMovementTypeEnum, inventoryCategories, insertInventoryCategorySchema, updateInventoryCategorySchema, measurementUnits, insertMeasurementUnitSchema, updateMeasurementUnitSchema, inventoryItems, insertInventoryItemSchema, updateInventoryItemSchema, branchStock, stockMovements, insertStockMovementSchema, inventoryCategoriesRelations, measurementUnitsRelations, inventoryItemsRelations, branchStockRelations, stockMovementsRelations, recipeIngredients, insertRecipeIngredientSchema, updateRecipeIngredientSchema, recipeIngredientsRelations, customersRelations, customerSessionsRelations, loyaltyProgramsRelations, loyaltyTransactionsRelations, couponsRelations, couponUsagesRelations, subscriptionPlanEnum, subscriptionStatusEnum, subscriptionPaymentStatusEnum, billingIntervalEnum, subscriptionPlans, insertSubscriptionPlanSchema, updateSubscriptionPlanSchema, subscriptions, insertSubscriptionSchema, updateSubscriptionSchema, superAdminCreateSubscriptionSchema, superAdminUpdateSubscriptionSchema, subscriptionPayments, insertSubscriptionPaymentSchema, subscriptionUsage, insertSubscriptionUsageSchema, subscriptionPlansRelations, subscriptionsRelations, subscriptionPaymentsRelations, subscriptionUsageRelations, notificationTypeEnum, notificationChannelEnum, notifications, insertNotificationSchema, notificationPreferences, insertNotificationPreferencesSchema, updateNotificationPreferencesSchema, customerNotificationPreferences, updateCustomerNotificationPreferencesSchema, notificationsRelations, notificationPreferencesRelations, customerNotificationPreferencesRelations, linkAnalytics, insertLinkAnalyticsSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    restaurantStatusEnum = pgEnum("restaurant_status", ["pendente", "ativo", "suspenso"]);
    restaurants = pgTable("restaurants", {
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
      status: restaurantStatusEnum("status").notNull().default("pendente"),
      isOpen: integer("is_open").notNull().default(1),
      // 0 = fechado, 1 = aberto
      primaryColor: varchar("primary_color", { length: 7 }).default("#EA580C"),
      secondaryColor: varchar("secondary_color", { length: 7 }).default("#DC2626"),
      accentColor: varchar("accent_color", { length: 7 }).default("#0891B2"),
      heroImageUrl: text("hero_image_url"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertRestaurantSchema = createInsertSchema(restaurants).omit({
      id: true,
      status: true,
      isOpen: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      name: z.string().min(1, "Nome do restaurante \xE9 obrigat\xF3rio"),
      email: z.string().email("Email inv\xE1lido"),
      phone: z.string().min(1, "Telefone \xE9 obrigat\xF3rio").regex(/^(\+244|244)?\s*[9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$|^(\+244|244)?[9][0-9]{8}$/, "Formato de telefone angolano inv\xE1lido. Use o formato: +244 9XX XXX XXX"),
      whatsappNumber: z.string().regex(/^(\+244|244)?\s*[9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$|^(\+244|244)?[9][0-9]{8}$/, "Formato de telefone angolano inv\xE1lido. Use o formato: +244 9XX XXX XXX").optional(),
      address: z.string().min(1, "Endere\xE7o \xE9 obrigat\xF3rio"),
      logoUrl: z.string().optional(),
      businessHours: z.string().optional(),
      description: z.string().optional(),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
      planId: z.string().min(1, "Plano de subscri\xE7\xE3o \xE9 obrigat\xF3rio")
    });
    registerRestaurantSchema = z.object({
      name: z.string().min(1, "Nome do restaurante \xE9 obrigat\xF3rio"),
      email: z.string().email("Email inv\xE1lido"),
      phone: z.string().min(1, "Telefone \xE9 obrigat\xF3rio").regex(/^(\+244|244)?\s*[9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$|^(\+244|244)?[9][0-9]{8}$/, "Formato inv\xE1lido. Use: +244 9XX XXX XXX"),
      whatsappNumber: z.string().regex(/^(\+244|244)?\s*[9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$|^(\+244|244)?[9][0-9]{8}$/, "Formato inv\xE1lido. Use: +244 9XX XXX XXX").optional().or(z.literal("")),
      address: z.string().min(1, "Endere\xE7o \xE9 obrigat\xF3rio"),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
      confirmPassword: z.string().min(1, "Confirme sua senha"),
      planId: z.string().min(1, "Selecione um plano de subscri\xE7\xE3o")
    }).refine((data) => data.password === data.confirmPassword, {
      message: "As senhas n\xE3o coincidem",
      path: ["confirmPassword"]
    });
    updateRestaurantSlugSchema = z.object({
      slug: z.string().min(3, "Slug deve ter no m\xEDnimo 3 caracteres").max(100, "Slug deve ter no m\xE1ximo 100 caracteres").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras min\xFAsculas, n\xFAmeros e h\xEDfens")
    });
    updateRestaurantAppearanceSchema = z.object({
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor prim\xE1ria inv\xE1lida. Use formato hexadecimal (#000000)").optional(),
      secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor secund\xE1ria inv\xE1lida. Use formato hexadecimal (#000000)").optional(),
      accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor de destaque inv\xE1lida. Use formato hexadecimal (#000000)").optional(),
      logoUrl: z.string().optional().or(z.literal("")),
      heroImageUrl: z.string().optional().or(z.literal("")),
      whatsappNumber: z.string().regex(/^(\+244|244)?\s*[9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$|^(\+244|244)?[9][0-9]{8}$/, "Formato de telefone angolano inv\xE1lido").optional(),
      businessHours: z.string().optional(),
      isOpen: z.number().min(0).max(1).optional()
    });
    branches = pgTable("branches", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 200 }).notNull(),
      address: text("address"),
      phone: varchar("phone", { length: 50 }),
      isActive: integer("is_active").notNull().default(1),
      // 0 = inativa, 1 = ativa
      isMain: integer("is_main").notNull().default(0),
      // 0 = filial, 1 = unidade principal/matriz
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertBranchSchema = createInsertSchema(branches).omit({
      id: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      name: z.string().min(1, "Nome da unidade \xE9 obrigat\xF3rio"),
      address: z.string().optional(),
      phone: z.string().optional(),
      isActive: z.number().optional(),
      isMain: z.number().optional()
    });
    updateBranchSchema = z.object({
      name: z.string().min(1, "Nome da unidade \xE9 obrigat\xF3rio").optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      isActive: z.number().optional()
    });
    userRoleEnum = pgEnum("user_role", ["superadmin", "admin", "manager", "cashier", "waiter", "kitchen"]);
    ROLE_PERMISSIONS = {
      superadmin: {
        label: "Super Admin",
        description: "Acesso total ao sistema",
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
        canManageSubscription: true
      },
      admin: {
        label: "Administrador",
        description: "Dono do restaurante - acesso total",
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
        canManageSubscription: true
      },
      manager: {
        label: "Gerente",
        description: "Gest\xE3o operacional do restaurante",
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
        canManageSubscription: false
      },
      cashier: {
        label: "Caixa",
        description: "Receber pagamentos e fechar contas",
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
        canManageSubscription: false
      },
      waiter: {
        label: "Gar\xE7om",
        description: "Atender mesas e registrar pedidos",
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
        canManageSubscription: false
      },
      kitchen: {
        label: "Cozinha",
        description: "Visualizar e preparar pedidos",
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
        canManageSubscription: false
      }
    };
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").references(() => restaurants.id, { onDelete: "cascade" }),
      activeBranchId: varchar("active_branch_id").references(() => branches.id, { onDelete: "set null" }),
      // Filial ativa na sessão
      email: varchar("email", { length: 255 }).notNull().unique(),
      password: varchar("password", { length: 255 }).notNull(),
      firstName: varchar("first_name", { length: 100 }),
      lastName: varchar("last_name", { length: 100 }),
      profileImageUrl: varchar("profile_image_url", { length: 500 }),
      role: userRoleEnum("role").notNull().default("admin"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      email: z.string().email("Email inv\xE1lido"),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      role: z.enum(["superadmin", "admin", "manager", "cashier", "waiter", "kitchen"])
    });
    loginSchema = z.object({
      email: z.string().email("Email inv\xE1lido"),
      password: z.string().min(1, "Senha \xE9 obrigat\xF3ria")
    });
    updateUserSchema = z.object({
      email: z.string().email("Email inv\xE1lido").optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      profileImageUrl: z.string().optional(),
      role: z.enum(["superadmin", "admin", "manager", "cashier", "waiter", "kitchen"]).optional()
    });
    updateProfileSchema = z.object({
      email: z.string().email("Email inv\xE1lido").optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional()
    });
    updatePasswordSchema = z.object({
      currentPassword: z.string().min(1, "Senha atual \xE9 obrigat\xF3ria"),
      newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
      confirmPassword: z.string().min(1, "Confirma\xE7\xE3o de senha \xE9 obrigat\xF3ria")
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: "As senhas n\xE3o coincidem",
      path: ["confirmPassword"]
    });
    adminResetPasswordSchema = z.object({
      newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres")
    });
    resetRestaurantAdminCredentialsSchema = z.object({
      email: z.string().email("Email inv\xE1lido").optional(),
      newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres").optional(),
      confirmPassword: z.string().optional()
    }).refine((data) => {
      if (data.newPassword && !data.confirmPassword) {
        return false;
      }
      return true;
    }, {
      message: "Confirma\xE7\xE3o de senha \xE9 obrigat\xF3ria ao definir uma nova senha",
      path: ["confirmPassword"]
    }).refine((data) => {
      if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    }, {
      message: "As senhas n\xE3o coincidem",
      path: ["confirmPassword"]
    }).refine((data) => {
      return data.email || data.newPassword;
    }, {
      message: "Deve fornecer pelo menos email ou senha para atualizar",
      path: ["email"]
    });
    userAuditActionEnum = pgEnum("user_audit_action", [
      "user_created",
      "user_updated",
      "user_deleted",
      "password_reset",
      "role_changed",
      "user_login",
      "user_logout"
    ]);
    userAuditLogs = pgTable("user_audit_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").references(() => restaurants.id, { onDelete: "cascade" }),
      actorId: varchar("actor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      targetUserId: varchar("target_user_id").references(() => users.id, { onDelete: "set null" }),
      action: userAuditActionEnum("action").notNull(),
      details: jsonb("details"),
      // Additional context (old/new values, etc)
      ipAddress: varchar("ip_address", { length: 45 }),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserAuditLogSchema = createInsertSchema(userAuditLogs).omit({
      id: true,
      createdAt: true
    });
    printerTypeEnum = pgEnum("printer_type", ["receipt", "kitchen", "invoice"]);
    printerLanguageEnum = pgEnum("printer_language", ["esc-pos", "star-prnt"]);
    printerConfigurations = pgTable("printer_configurations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
      // Null = global config
      printerType: printerTypeEnum("printer_type").notNull(),
      printerName: varchar("printer_name", { length: 200 }).notNull(),
      vendorId: integer("vendor_id"),
      productId: integer("product_id"),
      serialNumber: varchar("serial_number", { length: 100 }),
      language: printerLanguageEnum("language").default("esc-pos"),
      codepageMapping: varchar("codepage_mapping", { length: 50 }),
      paperWidth: integer("paper_width").notNull().default(80),
      // 58mm or 80mm
      marginLeft: integer("margin_left").default(0),
      marginRight: integer("margin_right").default(0),
      marginTop: integer("margin_top").default(0),
      marginBottom: integer("margin_bottom").default(0),
      autoPrint: integer("auto_print").notNull().default(0),
      // Auto-print on order creation
      copies: integer("copies").default(1),
      // Number of copies to print
      soundEnabled: integer("sound_enabled").default(1),
      // Play sound on print
      autoReconnect: integer("auto_reconnect").default(1),
      // Auto-reconnect on disconnect
      isActive: integer("is_active").notNull().default(1),
      lastConnected: timestamp("last_connected"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertPrinterConfigurationSchema = createInsertSchema(printerConfigurations).omit({
      id: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true,
      lastConnected: true
    }).extend({
      branchId: z.string().optional().nullable(),
      userId: z.string().optional().nullable(),
      printerType: z.enum(["receipt", "kitchen", "invoice"]),
      printerName: z.string().min(1, "Nome da impressora \xE9 obrigat\xF3rio"),
      vendorId: z.number().int().optional(),
      productId: z.number().int().optional(),
      serialNumber: z.string().optional(),
      language: z.enum(["esc-pos", "star-prnt"]).optional(),
      codepageMapping: z.string().optional(),
      paperWidth: z.number().int().min(58).max(80).default(80),
      marginLeft: z.number().int().min(0).default(0),
      marginRight: z.number().int().min(0).default(0),
      marginTop: z.number().int().min(0).default(0),
      marginBottom: z.number().int().min(0).default(0),
      autoPrint: z.number().min(0).max(1).default(0),
      copies: z.number().int().min(1).max(5).default(1),
      soundEnabled: z.number().min(0).max(1).default(1),
      autoReconnect: z.number().min(0).max(1).default(1),
      isActive: z.number().min(0).max(1).default(1)
    });
    updatePrinterConfigurationSchema = z.object({
      printerName: z.string().min(1, "Nome da impressora \xE9 obrigat\xF3rio").optional(),
      language: z.enum(["esc-pos", "star-prnt"]).optional(),
      codepageMapping: z.string().optional(),
      paperWidth: z.number().int().min(58).max(80).optional(),
      marginLeft: z.number().int().min(0).optional(),
      marginRight: z.number().int().min(0).optional(),
      marginTop: z.number().int().min(0).optional(),
      marginBottom: z.number().int().min(0).optional(),
      autoPrint: z.number().min(0).max(1).optional(),
      copies: z.number().int().min(1).max(5).optional(),
      soundEnabled: z.number().min(0).max(1).optional(),
      autoReconnect: z.number().min(0).max(1).optional(),
      isActive: z.number().min(0).max(1).optional(),
      lastConnected: z.string().optional()
    });
    printHistory = pgTable("print_history", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      printerId: varchar("printer_id").references(() => printerConfigurations.id, { onDelete: "set null" }),
      userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
      orderId: varchar("order_id").references(() => orders.id, { onDelete: "set null" }),
      printerType: printerTypeEnum("printer_type").notNull(),
      printerName: varchar("printer_name", { length: 200 }).notNull(),
      documentType: varchar("document_type", { length: 50 }).notNull(),
      // 'order', 'receipt', 'invoice', 'bill', 'report'
      orderNumber: varchar("order_number", { length: 20 }),
      success: integer("success").notNull().default(1),
      errorMessage: text("error_message"),
      printedAt: timestamp("printed_at").defaultNow()
    });
    insertPrintHistorySchema = createInsertSchema(printHistory).omit({
      id: true,
      restaurantId: true,
      printedAt: true
    }).extend({
      branchId: z.string().optional().nullable(),
      printerId: z.string().optional().nullable(),
      userId: z.string().optional().nullable(),
      orderId: z.string().optional().nullable(),
      printerType: z.enum(["receipt", "kitchen", "invoice"]),
      printerName: z.string().min(1, "Nome da impressora \xE9 obrigat\xF3rio"),
      documentType: z.string().min(1, "Tipo de documento \xE9 obrigat\xF3rio"),
      orderNumber: z.string().optional(),
      success: z.number().min(0).max(1).default(1),
      errorMessage: z.string().optional()
    });
    tableStatusEnum = pgEnum("table_status", ["livre", "ocupada", "em_andamento", "aguardando_pagamento", "encerrada"]);
    tables = pgTable("tables", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      number: integer("number").notNull(),
      capacity: integer("capacity").default(4),
      area: varchar("area", { length: 100 }),
      // Área da mesa (ex: "Salão Principal", "Terraço", "VIP")
      qrCode: text("qr_code").notNull(),
      status: tableStatusEnum("status").notNull().default("livre"),
      currentSessionId: varchar("current_session_id"),
      totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0"),
      customerName: varchar("customer_name", { length: 200 }),
      customerCount: integer("customer_count").default(0),
      lastActivity: timestamp("last_activity"),
      isOccupied: integer("is_occupied").notNull().default(0),
      // Manter para compatibilidade
      positionX: decimal("position_x", { precision: 5, scale: 2 }).default("50"),
      // Posição X (0-100)
      positionY: decimal("position_y", { precision: 5, scale: 2 }).default("50"),
      // Posição Y (0-100)
      createdAt: timestamp("created_at").defaultNow()
    });
    insertTableSchema = z.object({
      number: z.number().int().positive("O n\xFAmero da mesa deve ser maior que zero"),
      capacity: z.number().int().positive("A capacidade deve ser maior que zero").optional(),
      area: z.string().min(1, "A \xE1rea n\xE3o pode ser vazia").max(100, "Nome da \xE1rea muito longo").optional()
    });
    updateTableStatusSchema = z.object({
      status: z.enum(["livre", "ocupada", "em_andamento", "aguardando_pagamento", "encerrada"]),
      customerName: z.string().optional(),
      customerCount: z.number().optional()
    });
    shiftStatusEnum = pgEnum("shift_status", ["aberto", "fechado"]);
    financialEventTypeEnum = pgEnum("financial_event_type", [
      "ITEM_ADDED",
      "ITEM_REMOVED",
      "ITEM_QUANTITY_CHANGED",
      "PAYMENT_CAPTURED",
      "PAYMENT_PARTIAL",
      "REFUND_ISSUED",
      "REFUND_PARTIAL",
      "CANCELLED_ORDER",
      "CANCELLED_ITEM",
      "DISCOUNT_APPLIED",
      "DISCOUNT_REMOVED",
      "SERVICE_CHARGE_APPLIED",
      "SESSION_STARTED",
      "SESSION_CLOSED",
      "TABLE_MOVED",
      "TABLE_MERGED"
    ]);
    eventSourceEnum = pgEnum("event_source", ["UI", "API", "AUTO"]);
    adjustmentTypeEnum = pgEnum("adjustment_type", ["discount", "service_charge", "delivery_fee", "packaging_fee", "other"]);
    reportPeriodTypeEnum = pgEnum("report_period_type", ["daily", "weekly", "monthly"]);
    paymentMethodEnum = pgEnum("payment_method", ["dinheiro", "multicaixa", "transferencia", "cartao"]);
    financialShifts = pgTable("financial_shifts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      operatorId: varchar("operator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      status: shiftStatusEnum("status").notNull().default("aberto"),
      openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).default("0"),
      closingBalance: decimal("closing_balance", { precision: 10, scale: 2 }).default("0"),
      expectedBalance: decimal("expected_balance", { precision: 10, scale: 2 }).default("0"),
      discrepancy: decimal("discrepancy", { precision: 10, scale: 2 }).default("0"),
      notes: text("notes"),
      startedAt: timestamp("started_at").defaultNow(),
      endedAt: timestamp("ended_at")
    });
    insertFinancialShiftSchema = createInsertSchema(financialShifts).omit({
      id: true,
      restaurantId: true,
      status: true,
      startedAt: true,
      endedAt: true
    }).extend({
      openingBalance: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido").optional()
    });
    tableSessions = pgTable("table_sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      tableId: varchar("table_id").notNull().references(() => tables.id, { onDelete: "cascade" }),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      shiftId: varchar("shift_id").references(() => financialShifts.id, { onDelete: "set null" }),
      operatorId: varchar("operator_id").references(() => users.id, { onDelete: "set null" }),
      customerName: varchar("customer_name", { length: 200 }),
      customerCount: integer("customer_count"),
      totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
      paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
      sessionTotals: jsonb("session_totals"),
      closingSnapshot: jsonb("closing_snapshot"),
      status: tableStatusEnum("status").notNull().default("ocupada"),
      startedAt: timestamp("started_at").defaultNow(),
      endedAt: timestamp("ended_at"),
      closedById: varchar("closed_by_id").references(() => users.id, { onDelete: "set null" }),
      notes: text("notes")
    });
    insertTableSessionSchema = createInsertSchema(tableSessions).omit({
      id: true,
      restaurantId: true,
      totalAmount: true,
      paidAmount: true,
      status: true,
      startedAt: true,
      endedAt: true
    });
    tablePayments = pgTable("table_payments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      tableId: varchar("table_id").notNull().references(() => tables.id, { onDelete: "cascade" }),
      sessionId: varchar("session_id").references(() => tableSessions.id, { onDelete: "cascade" }),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      operatorId: varchar("operator_id").references(() => users.id, { onDelete: "set null" }),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
      paymentSource: varchar("payment_source", { length: 100 }),
      methodDetails: jsonb("method_details"),
      reconciliationBatchId: varchar("reconciliation_batch_id", { length: 100 }),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertTablePaymentSchema = createInsertSchema(tablePayments).omit({
      id: true,
      restaurantId: true,
      operatorId: true,
      createdAt: true
    }).extend({
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido"),
      paymentMethod: z.string().min(1, "M\xE9todo de pagamento \xE9 obrigat\xF3rio")
    });
    guestStatusEnum = pgEnum("guest_status", ["ativo", "aguardando_conta", "pago", "saiu"]);
    billSplitTypeEnum = pgEnum("bill_split_type", ["igual", "por_pessoa", "personalizado"]);
    tableGuests = pgTable("table_guests", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      sessionId: varchar("session_id").notNull().references(() => tableSessions.id, { onDelete: "cascade" }),
      tableId: varchar("table_id").notNull().references(() => tables.id, { onDelete: "cascade" }),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      guestNumber: integer("guest_number").notNull(),
      name: varchar("name", { length: 200 }),
      seatNumber: integer("seat_number"),
      status: guestStatusEnum("status").notNull().default("ativo"),
      subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
      paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
      token: varchar("token", { length: 100 }).unique(),
      deviceInfo: text("device_info"),
      joinedAt: timestamp("joined_at").defaultNow(),
      leftAt: timestamp("left_at")
    });
    insertTableGuestSchema = createInsertSchema(tableGuests).omit({
      id: true,
      restaurantId: true,
      guestNumber: true,
      subtotal: true,
      paidAmount: true,
      status: true,
      joinedAt: true,
      leftAt: true
    }).extend({
      sessionId: z.string().min(1, "Sess\xE3o \xE9 obrigat\xF3ria"),
      tableId: z.string().min(1, "Mesa \xE9 obrigat\xF3ria"),
      name: z.string().optional(),
      seatNumber: z.number().int().positive().optional()
    });
    updateTableGuestSchema = z.object({
      name: z.string().optional(),
      seatNumber: z.number().int().positive().optional(),
      status: z.enum(["ativo", "aguardando_conta", "pago", "saiu"]).optional()
    });
    tableBillSplits = pgTable("table_bill_splits", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      sessionId: varchar("session_id").notNull().references(() => tableSessions.id, { onDelete: "cascade" }),
      tableId: varchar("table_id").notNull().references(() => tables.id, { onDelete: "cascade" }),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      splitType: billSplitTypeEnum("split_type").notNull(),
      totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
      splitCount: integer("split_count").notNull().default(1),
      allocations: jsonb("allocations"),
      isFinalized: integer("is_finalized").notNull().default(0),
      createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("created_at").defaultNow(),
      finalizedAt: timestamp("finalized_at")
    });
    insertTableBillSplitSchema = createInsertSchema(tableBillSplits).omit({
      id: true,
      restaurantId: true,
      isFinalized: true,
      createdAt: true,
      finalizedAt: true
    }).extend({
      sessionId: z.string().min(1, "Sess\xE3o \xE9 obrigat\xF3ria"),
      tableId: z.string().min(1, "Mesa \xE9 obrigat\xF3ria"),
      splitType: z.enum(["igual", "por_pessoa", "personalizado"]),
      totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido"),
      splitCount: z.number().int().positive().optional(),
      allocations: z.array(z.object({
        guestId: z.string().optional(),
        guestName: z.string().optional(),
        amount: z.string(),
        items: z.array(z.string()).optional(),
        isPaid: z.boolean().optional()
      })).optional()
    });
    updateTableBillSplitSchema = z.object({
      allocations: z.array(z.object({
        guestId: z.string().optional(),
        guestName: z.string().optional(),
        amount: z.string(),
        items: z.array(z.string()).optional(),
        isPaid: z.boolean().optional()
      })).optional(),
      isFinalized: z.number().min(0).max(1).optional()
    });
    guestPayments = pgTable("guest_payments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      guestId: varchar("guest_id").notNull().references(() => tableGuests.id, { onDelete: "cascade" }),
      sessionId: varchar("session_id").notNull().references(() => tableSessions.id, { onDelete: "cascade" }),
      tablePaymentId: varchar("table_payment_id").references(() => tablePayments.id, { onDelete: "set null" }),
      splitId: varchar("split_id").references(() => tableBillSplits.id, { onDelete: "set null" }),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertGuestPaymentSchema = createInsertSchema(guestPayments).omit({
      id: true,
      restaurantId: true,
      createdAt: true
    }).extend({
      guestId: z.string().min(1, "Cliente \xE9 obrigat\xF3rio"),
      sessionId: z.string().min(1, "Sess\xE3o \xE9 obrigat\xF3ria"),
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido"),
      paymentMethod: z.string().min(1, "M\xE9todo de pagamento \xE9 obrigat\xF3rio")
    });
    orderStatusEnum = pgEnum("order_status", ["pendente", "em_preparo", "pronto", "servido", "cancelado"]);
    orderTypeEnum = pgEnum("order_type", ["mesa", "delivery", "takeout", "balcao", "pdv"]);
    paymentStatusEnum = pgEnum("payment_status", ["nao_pago", "parcial", "pago"]);
    discountTypeEnum = pgEnum("discount_type", ["valor", "percentual"]);
    customerTierEnum = pgEnum("customer_tier", ["bronze", "prata", "ouro", "platina"]);
    loyaltyTransactionTypeEnum = pgEnum("loyalty_transaction_type", [
      "ganho",
      // Points earned from purchase
      "resgate",
      // Points redeemed
      "expiracao",
      // Points expired
      "ajuste",
      // Manual adjustment
      "bonus"
      // Bonus points (birthday, promotion, etc)
    ]);
    customers = pgTable("customers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "set null" }),
      name: varchar("name", { length: 200 }).notNull(),
      phone: varchar("phone", { length: 50 }),
      email: varchar("email", { length: 255 }),
      cpf: varchar("cpf", { length: 14 }),
      birthDate: timestamp("birth_date"),
      address: text("address"),
      loyaltyPoints: integer("loyalty_points").notNull().default(0),
      tier: customerTierEnum("tier").default("bronze"),
      totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0"),
      visitCount: integer("visit_count").notNull().default(0),
      lastVisit: timestamp("last_visit"),
      notes: text("notes"),
      isActive: integer("is_active").notNull().default(1),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertCustomerSchema = createInsertSchema(customers).omit({
      id: true,
      restaurantId: true,
      loyaltyPoints: true,
      tier: true,
      totalSpent: true,
      visitCount: true,
      lastVisit: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      name: z.string().min(1, "Nome \xE9 obrigat\xF3rio"),
      phone: z.string().optional(),
      email: z.string().email("Email inv\xE1lido").optional().or(z.literal("")),
      cpf: z.string().optional(),
      birthDate: z.string().optional(),
      branchId: z.string().optional().nullable(),
      address: z.string().optional(),
      notes: z.string().optional(),
      isActive: z.number().optional()
    });
    updateCustomerSchema = z.object({
      name: z.string().min(1, "Nome \xE9 obrigat\xF3rio").optional(),
      phone: z.string().optional(),
      email: z.string().email("Email inv\xE1lido").optional().or(z.literal("")),
      cpf: z.string().optional(),
      birthDate: z.string().optional(),
      address: z.string().optional(),
      notes: z.string().optional(),
      isActive: z.number().optional()
    });
    customerSessions = pgTable("customer_sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      token: varchar("token", { length: 255 }).notNull().unique(),
      otpCode: varchar("otp_code", { length: 6 }),
      otpExpiresAt: timestamp("otp_expires_at"),
      otpAttempts: integer("otp_attempts").notNull().default(0),
      deviceInfo: text("device_info"),
      ipAddress: varchar("ip_address", { length: 50 }),
      lastActiveAt: timestamp("last_active_at").defaultNow(),
      expiresAt: timestamp("expires_at").notNull(),
      isActive: integer("is_active").notNull().default(1),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertCustomerSessionSchema = createInsertSchema(customerSessions).omit({
      id: true,
      createdAt: true
    });
    customerAuthRequestSchema = z.object({
      phone: z.string().min(9, "Telefone \xE9 obrigat\xF3rio"),
      restaurantId: z.string().min(1, "ID do restaurante \xE9 obrigat\xF3rio")
    });
    customerAuthVerifySchema = z.object({
      phone: z.string().min(9, "Telefone \xE9 obrigat\xF3rio"),
      restaurantId: z.string().min(1, "ID do restaurante \xE9 obrigat\xF3rio"),
      otpCode: z.string().length(6, "C\xF3digo deve ter 6 d\xEDgitos")
    });
    loyaltyPrograms = pgTable("loyalty_programs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      isActive: integer("is_active").notNull().default(1),
      pointsPerCurrency: decimal("points_per_currency", { precision: 10, scale: 2 }).notNull().default("1"),
      currencyPerPoint: decimal("currency_per_point", { precision: 10, scale: 2 }).notNull().default("0.10"),
      minPointsToRedeem: integer("min_points_to_redeem").notNull().default(100),
      maxPointsPerOrder: integer("max_points_per_order"),
      pointsExpirationDays: integer("points_expiration_days"),
      birthdayBonusPoints: integer("birthday_bonus_points").default(0),
      bronzeTierMinSpent: decimal("bronze_tier_min_spent", { precision: 10, scale: 2 }).default("0"),
      silverTierMinSpent: decimal("silver_tier_min_spent", { precision: 10, scale: 2 }).default("5000"),
      goldTierMinSpent: decimal("gold_tier_min_spent", { precision: 10, scale: 2 }).default("15000"),
      platinumTierMinSpent: decimal("platinum_tier_min_spent", { precision: 10, scale: 2 }).default("50000"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertLoyaltyProgramSchema = createInsertSchema(loyaltyPrograms).omit({
      id: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      isActive: z.number().optional(),
      pointsPerCurrency: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido").optional(),
      currencyPerPoint: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido").optional(),
      minPointsToRedeem: z.number().int().min(0).optional(),
      maxPointsPerOrder: z.number().int().min(0).optional(),
      pointsExpirationDays: z.number().int().min(0).optional(),
      birthdayBonusPoints: z.number().int().min(0).optional(),
      bronzeTierMinSpent: z.string().optional(),
      silverTierMinSpent: z.string().optional(),
      goldTierMinSpent: z.string().optional(),
      platinumTierMinSpent: z.string().optional()
    });
    updateLoyaltyProgramSchema = insertLoyaltyProgramSchema;
    loyaltyTransactions = pgTable("loyalty_transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
      orderId: varchar("order_id").references(() => orders.id, { onDelete: "set null" }),
      type: loyaltyTransactionTypeEnum("type").notNull(),
      points: integer("points").notNull(),
      description: varchar("description", { length: 500 }),
      expiresAt: timestamp("expires_at"),
      createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).omit({
      id: true,
      restaurantId: true,
      createdAt: true
    }).extend({
      customerId: z.string().min(1, "Cliente \xE9 obrigat\xF3rio"),
      orderId: z.string().optional().nullable(),
      type: z.enum(["ganho", "resgate", "expiracao", "ajuste", "bonus"]),
      points: z.number().int(),
      description: z.string().optional(),
      expiresAt: z.string().optional(),
      createdBy: z.string().optional().nullable()
    });
    coupons = pgTable("coupons", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "set null" }),
      code: varchar("code", { length: 50 }).notNull(),
      description: text("description"),
      discountType: discountTypeEnum("discount_type").notNull(),
      discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
      minOrderValue: decimal("min_order_value", { precision: 10, scale: 2 }).default("0"),
      maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
      validFrom: timestamp("valid_from").notNull(),
      validUntil: timestamp("valid_until").notNull(),
      maxUses: integer("max_uses"),
      maxUsesPerCustomer: integer("max_uses_per_customer").default(1),
      currentUses: integer("current_uses").notNull().default(0),
      isActive: integer("is_active").notNull().default(1),
      applicableOrderTypes: text("applicable_order_types").array(),
      createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertCouponSchema = createInsertSchema(coupons).omit({
      id: true,
      restaurantId: true,
      currentUses: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      code: z.string().min(3, "C\xF3digo deve ter no m\xEDnimo 3 caracteres").max(50),
      description: z.string().optional(),
      branchId: z.string().optional().nullable(),
      discountType: z.enum(["valor", "percentual"]),
      discountValue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido"),
      minOrderValue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido").optional(),
      maxDiscount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido").optional(),
      validFrom: z.string().min(1, "Data inicial \xE9 obrigat\xF3ria"),
      validUntil: z.string().min(1, "Data final \xE9 obrigat\xF3ria"),
      maxUses: z.number().int().min(1).optional(),
      maxUsesPerCustomer: z.number().int().min(1).default(1),
      isActive: z.number().optional(),
      applicableOrderTypes: z.array(z.string()).optional(),
      createdBy: z.string().optional().nullable()
    });
    updateCouponSchema = z.object({
      code: z.string().min(3, "C\xF3digo deve ter no m\xEDnimo 3 caracteres").max(50).optional(),
      description: z.string().optional(),
      discountType: z.enum(["valor", "percentual"]).optional(),
      discountValue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido").optional(),
      minOrderValue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido").optional(),
      maxDiscount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido").optional(),
      validFrom: z.string().optional(),
      validUntil: z.string().optional(),
      maxUses: z.number().int().min(1).optional(),
      maxUsesPerCustomer: z.number().int().min(1).optional(),
      isActive: z.number().optional(),
      applicableOrderTypes: z.array(z.string()).optional()
    });
    validateCouponSchema = z.object({
      code: z.string().min(1, "C\xF3digo do cupom \xE9 obrigat\xF3rio"),
      orderType: z.string().optional(),
      orderValue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido"),
      customerId: z.string().optional()
    });
    couponUsages = pgTable("coupon_usages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      couponId: varchar("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
      customerId: varchar("customer_id").references(() => customers.id, { onDelete: "set null" }),
      orderId: varchar("order_id").references(() => orders.id, { onDelete: "set null" }),
      discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertCouponUsageSchema = createInsertSchema(couponUsages).omit({
      id: true,
      restaurantId: true,
      createdAt: true
    }).extend({
      couponId: z.string().min(1, "Cupom \xE9 obrigat\xF3rio"),
      customerId: z.string().optional().nullable(),
      orderId: z.string().optional().nullable(),
      discountApplied: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido")
    });
    orders = pgTable("orders", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      tableId: varchar("table_id").references(() => tables.id, { onDelete: "cascade" }),
      tableSessionId: varchar("table_session_id").references(() => tableSessions.id, { onDelete: "set null" }),
      guestId: varchar("guest_id").references(() => tableGuests.id, { onDelete: "set null" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      customerId: varchar("customer_id").references(() => customers.id, { onDelete: "set null" }),
      couponId: varchar("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
      orderType: orderTypeEnum("order_type").notNull().default("mesa"),
      customerName: varchar("customer_name", { length: 200 }),
      customerPhone: varchar("customer_phone", { length: 50 }),
      deliveryAddress: text("delivery_address"),
      deliveryNotes: text("delivery_notes"),
      orderNotes: text("order_notes"),
      orderNumber: varchar("order_number", { length: 20 }),
      orderTitle: varchar("order_title", { length: 200 }),
      status: orderStatusEnum("status").notNull().default("pendente"),
      subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
      discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
      discountType: discountTypeEnum("discount_type").default("valor"),
      couponDiscount: decimal("coupon_discount", { precision: 10, scale: 2 }).default("0"),
      serviceCharge: decimal("service_charge", { precision: 10, scale: 2 }).default("0"),
      serviceName: varchar("service_name", { length: 200 }),
      deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0"),
      packagingFee: decimal("packaging_fee", { precision: 10, scale: 2 }).default("0"),
      loyaltyPointsEarned: integer("loyalty_points_earned").default(0),
      loyaltyPointsRedeemed: integer("loyalty_points_redeemed").default(0),
      loyaltyDiscountAmount: decimal("loyalty_discount_amount", { precision: 10, scale: 2 }).default("0"),
      totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
      paymentStatus: paymentStatusEnum("payment_status").notNull().default("nao_pago"),
      paymentMethod: paymentMethodEnum("payment_method"),
      paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
      changeAmount: decimal("change_amount", { precision: 10, scale: 2 }).default("0"),
      refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).default("0"),
      cancellationReason: text("cancellation_reason"),
      cancelledAt: timestamp("cancelled_at"),
      cancelledBy: varchar("cancelled_by").references(() => users.id, { onDelete: "set null" }),
      isSynced: integer("is_synced").default(1),
      createdBy: varchar("created_by").references(() => users.id),
      closedBy: varchar("closed_by").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertOrderSchema = createInsertSchema(orders).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      subtotal: true,
      totalAmount: true,
      paymentStatus: true,
      paidAmount: true,
      changeAmount: true
    }).extend({
      orderType: z.enum(["mesa", "delivery", "takeout", "balcao", "pdv"]).default("mesa"),
      customerId: z.string().optional().nullable(),
      tableId: z.string().optional().nullable(),
      tableSessionId: z.string().optional().nullable(),
      guestId: z.string().optional().nullable(),
      couponId: z.string().optional().nullable(),
      discount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Desconto inv\xE1lido").optional(),
      discountType: z.enum(["valor", "percentual"]).optional(),
      serviceCharge: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de servi\xE7o inv\xE1lida").optional(),
      deliveryFee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de entrega inv\xE1lida").optional()
    });
    publicOrderSchema = createInsertSchema(orders).omit({
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
      createdBy: true
    }).extend({
      // Restrict order types to customer-accessible ones only
      orderType: z.enum(["mesa", "delivery", "takeout"]).default("mesa"),
      customerId: z.string().optional().nullable(),
      tableId: z.string().optional().nullable(),
      tableSessionId: z.string().optional().nullable(),
      couponId: z.string().optional().nullable(),
      // Allow customers to select payment method for delivery/takeout
      paymentMethod: z.enum(["dinheiro", "multicaixa", "transferencia", "cartao"]).optional().nullable()
    });
    updateOrderStatusSchema = z.object({
      status: z.enum(["pendente", "em_preparo", "pronto", "servido", "cancelado"])
    });
    updateOrderMetadataSchema = z.object({
      orderTitle: z.string().max(200).optional(),
      customerName: z.string().max(200).optional(),
      customerPhone: z.string().max(50).optional(),
      deliveryAddress: z.string().optional(),
      deliveryNotes: z.string().optional(),
      orderNotes: z.string().optional()
    });
    applyDiscountSchema = z.object({
      discount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Desconto inv\xE1lido"),
      discountType: z.enum(["valor", "percentual"])
    });
    applyServiceChargeSchema = z.object({
      serviceCharge: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de servi\xE7o inv\xE1lida"),
      serviceName: z.string().max(200).optional()
    });
    applyDeliveryFeeSchema = z.object({
      deliveryFee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de entrega inv\xE1lida")
    });
    applyPackagingFeeSchema = z.object({
      packagingFee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de embalagem inv\xE1lida")
    });
    recordPaymentSchema = z.object({
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido"),
      paymentMethod: z.enum(["dinheiro", "multicaixa", "transferencia", "cartao"]),
      receivedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor recebido inv\xE1lido").optional()
    });
    updateOrderItemQuantitySchema = z.object({
      quantity: z.number().int().min(1, "Quantidade deve ser pelo menos 1")
    });
    reassignOrderItemSchema = z.object({
      newGuestId: z.string().uuid("ID de cliente inv\xE1lido"),
      reason: z.string().max(500).optional()
    });
    orderItemAuditActionEnum = pgEnum("order_item_audit_action", [
      "item_reassigned",
      // Item movido entre clientes
      "item_added",
      // Item adicionado ao pedido
      "item_removed",
      // Item removido do pedido
      "quantity_changed"
      // Quantidade alterada
    ]);
    orderItemAuditLogs = pgTable("order_item_audit_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      orderItemId: varchar("order_item_id").references(() => orderItems.id, { onDelete: "set null" }),
      orderId: varchar("order_id").references(() => orders.id, { onDelete: "set null" }),
      sessionId: varchar("session_id").references(() => tableSessions.id, { onDelete: "set null" }),
      action: orderItemAuditActionEnum("action").notNull(),
      actorUserId: varchar("actor_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
      sourceGuestId: varchar("source_guest_id").references(() => tableGuests.id, { onDelete: "set null" }),
      targetGuestId: varchar("target_guest_id").references(() => tableGuests.id, { onDelete: "set null" }),
      itemDetails: jsonb("item_details").notNull(),
      // Nome do item, quantidade, preço
      oldValue: jsonb("old_value"),
      // Valor antigo (quantidade antiga, cliente antigo, etc)
      newValue: jsonb("new_value"),
      // Valor novo
      reason: text("reason"),
      // Motivo da mudança
      ipAddress: varchar("ip_address", { length: 45 }),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_order_item_audit_restaurant").on(table.restaurantId),
      index("idx_order_item_audit_session").on(table.sessionId),
      index("idx_order_item_audit_order").on(table.orderId),
      index("idx_order_item_audit_created").on(table.createdAt)
    ]);
    insertOrderItemAuditLogSchema = createInsertSchema(orderItemAuditLogs).omit({
      id: true,
      restaurantId: true,
      actorUserId: true,
      createdAt: true
    }).extend({
      orderItemId: z.string().optional(),
      orderId: z.string().optional(),
      sessionId: z.string().optional(),
      action: z.enum(["item_reassigned", "item_added", "item_removed", "quantity_changed"]),
      sourceGuestId: z.string().optional(),
      targetGuestId: z.string().optional(),
      reason: z.string().max(500).optional()
    });
    linkCustomerSchema = z.object({
      customerId: z.string().uuid("ID de cliente inv\xE1lido")
    });
    applyCouponSchema = z.object({
      couponCode: z.string().min(1, "C\xF3digo do cupom \xE9 obrigat\xF3rio")
    });
    redeemLoyaltyPointsSchema = z.object({
      pointsToRedeem: z.number().int().min(1, "Pontos a resgatar deve ser pelo menos 1")
    });
    cancelOrderSchema = z.object({
      cancellationReason: z.string().min(1, "Motivo do cancelamento \xE9 obrigat\xF3rio").max(500, "Motivo muito longo")
    });
    orderItems = pgTable("order_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
      menuItemId: varchar("menu_item_id").notNull().references(() => menuItems.id),
      guestId: varchar("guest_id").references(() => tableGuests.id, { onDelete: "set null" }),
      quantity: integer("quantity").notNull(),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertOrderItemSchema = createInsertSchema(orderItems).omit({
      id: true,
      createdAt: true
    });
    publicOrderItemSchema = createInsertSchema(orderItems).omit({
      id: true,
      orderId: true,
      createdAt: true
    }).extend({
      selectedOptions: z.array(z.object({
        optionId: z.string(),
        optionName: z.string(),
        optionGroupName: z.string(),
        priceAdjustment: z.string(),
        quantity: z.number().int().min(1).default(1)
      })).optional().default([])
    });
    orderItemOptions = pgTable("order_item_options", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderItemId: varchar("order_item_id").notNull().references(() => orderItems.id, { onDelete: "cascade" }),
      optionId: varchar("option_id").notNull().references(() => options.id),
      optionName: varchar("option_name", { length: 200 }).notNull(),
      // Armazenar nome para histórico
      optionGroupName: varchar("option_group_name", { length: 200 }).notNull(),
      // Armazenar nome do grupo
      priceAdjustment: decimal("price_adjustment", { precision: 10, scale: 2 }).notNull().default("0"),
      quantity: integer("quantity").notNull().default(1),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertOrderItemOptionSchema = createInsertSchema(orderItemOptions).omit({
      id: true,
      createdAt: true
    }).extend({
      priceAdjustment: z.string().regex(/^-?\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido").default("0")
    });
    financialEvents = pgTable("financial_events", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      sessionId: varchar("session_id").references(() => tableSessions.id, { onDelete: "set null" }),
      orderId: varchar("order_id").references(() => orders.id, { onDelete: "set null" }),
      tableId: varchar("table_id").references(() => tables.id, { onDelete: "set null" }),
      shiftId: varchar("shift_id").references(() => financialShifts.id, { onDelete: "set null" }),
      eventType: financialEventTypeEnum("event_type").notNull(),
      payload: jsonb("payload").notNull(),
      operatorId: varchar("operator_id").references(() => users.id, { onDelete: "set null" }),
      source: eventSourceEnum("source").notNull().default("UI"),
      metadata: jsonb("metadata"),
      version: integer("version").notNull().default(1),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertFinancialEventSchema = createInsertSchema(financialEvents).omit({
      id: true,
      restaurantId: true,
      createdAt: true,
      version: true
    });
    orderAdjustments = pgTable("order_adjustments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      adjustmentType: adjustmentTypeEnum("adjustment_type").notNull(),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      reason: text("reason"),
      operatorId: varchar("operator_id").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertOrderAdjustmentSchema = createInsertSchema(orderAdjustments).omit({
      id: true,
      restaurantId: true,
      operatorId: true,
      createdAt: true
    }).extend({
      amount: z.string().regex(/^-?\d+(\.\d{1,2})?$/, "Valor inv\xE1lido")
    });
    paymentEvents = pgTable("payment_events", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").references(() => orders.id, { onDelete: "cascade" }),
      sessionId: varchar("session_id").references(() => tableSessions.id, { onDelete: "cascade" }),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      paymentMethod: paymentMethodEnum("payment_method").notNull(),
      paymentSource: varchar("payment_source", { length: 100 }),
      methodDetails: jsonb("method_details"),
      reconciliationBatchId: varchar("reconciliation_batch_id", { length: 100 }),
      operatorId: varchar("operator_id").references(() => users.id, { onDelete: "set null" }),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertPaymentEventSchema = createInsertSchema(paymentEvents).omit({
      id: true,
      restaurantId: true,
      operatorId: true,
      createdAt: true
    }).extend({
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido")
    });
    reportAggregations = pgTable("report_aggregations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      periodType: reportPeriodTypeEnum("period_type").notNull(),
      periodStart: timestamp("period_start").notNull(),
      periodEnd: timestamp("period_end").notNull(),
      totals: jsonb("totals").notNull(),
      byTable: jsonb("by_table"),
      byCategory: jsonb("by_category"),
      byOperator: jsonb("by_operator"),
      topProducts: jsonb("top_products"),
      cancellations: jsonb("cancellations"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertReportAggregationSchema = createInsertSchema(reportAggregations).omit({
      id: true,
      restaurantId: true,
      createdAt: true
    });
    categories = pgTable("categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      // Filial específica (null = compartilhado)
      name: varchar("name", { length: 100 }).notNull(),
      imageUrl: text("image_url"),
      // URL da imagem/ícone da categoria
      displayOrder: integer("display_order").notNull().default(0),
      // Ordem de exibição
      isVisible: integer("is_visible").notNull().default(1),
      // 0 = oculto, 1 = visível
      createdAt: timestamp("created_at").defaultNow()
    });
    insertCategorySchema = createInsertSchema(categories).omit({
      id: true,
      restaurantId: true,
      branchId: true,
      createdAt: true
    });
    updateCategorySchema = z.object({
      name: z.string().min(1, "Nome da categoria \xE9 obrigat\xF3rio").max(100, "Nome muito longo"),
      imageUrl: z.string().nullable().optional(),
      displayOrder: z.number().optional(),
      isVisible: z.number().min(0).max(1).optional()
    });
    menuItems = pgTable("menu_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      // Filial específica (null = compartilhado)
      categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 200 }).notNull(),
      description: text("description"),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
      // Preço original (antes do desconto)
      imageUrl: text("image_url"),
      displayOrder: integer("display_order").notNull().default(0),
      // Ordem de exibição
      isVisible: integer("is_visible").notNull().default(1),
      // 0 = oculto no menu, 1 = visível
      isAvailable: integer("is_available").notNull().default(1),
      // 0 = indisponível, 1 = disponível
      isFavorite: integer("is_favorite").notNull().default(0),
      // 0 = não é favorito, 1 = favorito
      isFeatured: integer("is_featured").notNull().default(0),
      // 0 = normal, 1 = destaque/mais vendido
      isNew: integer("is_new").notNull().default(0),
      // 0 = normal, 1 = novo item
      tags: text("tags").array(),
      // Tags: vegetariano, vegano, sem_gluten, picante, etc
      preparationTime: integer("preparation_time"),
      // Tempo de preparo em minutos
      createdAt: timestamp("created_at").defaultNow()
    });
    insertMenuItemSchema = createInsertSchema(menuItems).omit({
      id: true,
      restaurantId: true,
      branchId: true,
      createdAt: true
    }).extend({
      price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido"),
      originalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o original inv\xE1lido").optional().nullable()
    }).refine((data) => {
      if (data.originalPrice) {
        const price = parseFloat(data.price);
        const originalPrice = parseFloat(data.originalPrice);
        return originalPrice >= price;
      }
      return true;
    }, {
      message: "Pre\xE7o original deve ser maior ou igual ao pre\xE7o atual",
      path: ["originalPrice"]
    });
    updateMenuItemSchema = z.object({
      categoryId: z.string().optional(),
      name: z.string().min(1, "Nome do item \xE9 obrigat\xF3rio").max(200, "Nome muito longo").optional(),
      description: z.string().nullable().optional(),
      price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido").optional(),
      originalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o original inv\xE1lido").nullable().optional(),
      imageUrl: z.string().nullable().optional(),
      displayOrder: z.number().optional(),
      isVisible: z.number().min(0).max(1).optional(),
      isAvailable: z.number().min(0).max(1).optional(),
      isFavorite: z.number().min(0).max(1).optional(),
      isFeatured: z.number().min(0).max(1).optional(),
      isNew: z.number().min(0).max(1).optional(),
      tags: z.array(z.string()).optional(),
      preparationTime: z.number().min(1).optional().nullable()
    });
    optionGroupTypeEnum = pgEnum("option_group_type", ["single", "multiple"]);
    optionGroups = pgTable("option_groups", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      menuItemId: varchar("menu_item_id").notNull().references(() => menuItems.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 200 }).notNull(),
      // Ex: "Tamanho", "Acompanhamentos"
      unit: varchar("unit", { length: 50 }),
      // Ex: "g", "ml", "un", "kg" - Unidade de medida das opções
      type: optionGroupTypeEnum("type").notNull().default("single"),
      // single = escolha única, multiple = múltipla escolha
      isRequired: integer("is_required").notNull().default(0),
      // 0 = opcional, 1 = obrigatório
      minSelections: integer("min_selections").notNull().default(0),
      // Mínimo de opções a escolher
      maxSelections: integer("max_selections").notNull().default(1),
      // Máximo de opções a escolher
      displayOrder: integer("display_order").notNull().default(0),
      // Ordem de exibição
      createdAt: timestamp("created_at").defaultNow()
    });
    insertOptionGroupSchema = createInsertSchema(optionGroups).omit({
      id: true,
      menuItemId: true,
      createdAt: true
    }).extend({
      name: z.string().min(1, "Nome do grupo \xE9 obrigat\xF3rio"),
      unit: z.string().max(50, "Unidade muito longa").nullable().optional(),
      type: z.enum(["single", "multiple"]).default("single"),
      isRequired: z.number().min(0).max(1).default(0),
      minSelections: z.number().min(0).default(0),
      maxSelections: z.number().min(1).default(1),
      displayOrder: z.number().default(0)
    });
    updateOptionGroupSchema = createInsertSchema(optionGroups).omit({
      id: true,
      menuItemId: true,
      createdAt: true
    }).extend({
      unit: z.string().max(50, "Unidade muito longa").nullable().optional()
    }).partial();
    options = pgTable("options", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      optionGroupId: varchar("option_group_id").notNull().references(() => optionGroups.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 200 }).notNull(),
      // Ex: "Grande", "Arroz", "Mal Passado"
      priceAdjustment: decimal("price_adjustment", { precision: 10, scale: 2 }).notNull().default("0"),
      // Valor adicional
      isAvailable: integer("is_available").notNull().default(1),
      // 0 = indisponível, 1 = disponível
      isRecommended: integer("is_recommended").notNull().default(0),
      // 0 = não recomendado, 1 = recomendado para upselling
      displayOrder: integer("display_order").notNull().default(0),
      // Ordem de exibição
      createdAt: timestamp("created_at").defaultNow()
    });
    insertOptionSchema = createInsertSchema(options).omit({
      id: true,
      optionGroupId: true,
      createdAt: true
    }).extend({
      name: z.string().min(1, "Nome da op\xE7\xE3o \xE9 obrigat\xF3rio"),
      priceAdjustment: z.string().regex(/^-?\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido").default("0"),
      isAvailable: z.number().min(0).max(1).default(1),
      isRecommended: z.number().min(0).max(1).default(0),
      displayOrder: z.number().default(0)
    });
    updateOptionSchema = createInsertSchema(options).omit({
      id: true,
      optionGroupId: true,
      createdAt: true
    }).partial();
    messages = pgTable("messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      subject: varchar("subject", { length: 255 }).notNull(),
      content: text("content").notNull(),
      sentBy: varchar("sent_by").notNull(),
      isRead: integer("is_read").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertMessageSchema = createInsertSchema(messages).omit({
      id: true,
      isRead: true,
      createdAt: true
    });
    menuVisits = pgTable("menu_visits", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      visitSource: varchar("visit_source", { length: 50 }).notNull().default("qr_code"),
      // 'qr_code', 'link', 'direct'
      ipAddress: varchar("ip_address", { length: 50 }),
      userAgent: text("user_agent"),
      referrer: text("referrer"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertMenuVisitSchema = createInsertSchema(menuVisits).omit({
      id: true,
      restaurantId: true,
      createdAt: true
    });
    customerReviews = pgTable("customer_reviews", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      orderId: varchar("order_id").references(() => orders.id, { onDelete: "set null" }),
      customerName: varchar("customer_name", { length: 200 }),
      rating: integer("rating").notNull(),
      // 1-5 stars
      comment: text("comment"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertCustomerReviewSchema = createInsertSchema(customerReviews).omit({
      id: true,
      restaurantId: true,
      createdAt: true
    }).extend({
      rating: z.number().int().min(1, "Avalia\xE7\xE3o deve ser no m\xEDnimo 1").max(5, "Avalia\xE7\xE3o deve ser no m\xE1ximo 5")
    });
    restaurantsRelations = relations(restaurants, ({ many }) => ({
      users: many(users),
      branches: many(branches),
      tables: many(tables),
      categories: many(categories),
      menuItems: many(menuItems),
      messages: many(messages),
      menuVisits: many(menuVisits),
      customerReviews: many(customerReviews)
    }));
    branchesRelations = relations(branches, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [branches.restaurantId],
        references: [restaurants.id]
      }),
      tables: many(tables),
      categories: many(categories),
      menuItems: many(menuItems),
      users: many(users)
    }));
    usersRelations = relations(users, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [users.restaurantId],
        references: [restaurants.id]
      }),
      activeBranch: one(branches, {
        fields: [users.activeBranchId],
        references: [branches.id]
      })
    }));
    categoriesRelations = relations(categories, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [categories.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [categories.branchId],
        references: [branches.id]
      }),
      menuItems: many(menuItems)
    }));
    menuItemsRelations = relations(menuItems, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [menuItems.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [menuItems.branchId],
        references: [branches.id]
      }),
      category: one(categories, {
        fields: [menuItems.categoryId],
        references: [categories.id]
      }),
      orderItems: many(orderItems),
      optionGroups: many(optionGroups)
    }));
    tablesRelations = relations(tables, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [tables.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [tables.branchId],
        references: [branches.id]
      }),
      orders: many(orders),
      sessions: many(tableSessions),
      payments: many(tablePayments)
    }));
    tableSessionsRelations = relations(tableSessions, ({ one, many }) => ({
      table: one(tables, {
        fields: [tableSessions.tableId],
        references: [tables.id]
      }),
      restaurant: one(restaurants, {
        fields: [tableSessions.restaurantId],
        references: [restaurants.id]
      }),
      shift: one(financialShifts, {
        fields: [tableSessions.shiftId],
        references: [financialShifts.id]
      }),
      operator: one(users, {
        fields: [tableSessions.operatorId],
        references: [users.id]
      }),
      closedBy: one(users, {
        fields: [tableSessions.closedById],
        references: [users.id]
      }),
      payments: many(tablePayments),
      orders: many(orders),
      events: many(financialEvents),
      paymentEvents: many(paymentEvents)
    }));
    tablePaymentsRelations = relations(tablePayments, ({ one }) => ({
      table: one(tables, {
        fields: [tablePayments.tableId],
        references: [tables.id]
      }),
      session: one(tableSessions, {
        fields: [tablePayments.sessionId],
        references: [tableSessions.id]
      }),
      restaurant: one(restaurants, {
        fields: [tablePayments.restaurantId],
        references: [restaurants.id]
      }),
      operator: one(users, {
        fields: [tablePayments.operatorId],
        references: [users.id]
      })
    }));
    ordersRelations = relations(orders, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [orders.restaurantId],
        references: [restaurants.id]
      }),
      table: one(tables, {
        fields: [orders.tableId],
        references: [tables.id]
      }),
      tableSession: one(tableSessions, {
        fields: [orders.tableSessionId],
        references: [tableSessions.id]
      }),
      customer: one(customers, {
        fields: [orders.customerId],
        references: [customers.id]
      }),
      coupon: one(coupons, {
        fields: [orders.couponId],
        references: [coupons.id]
      }),
      createdByUser: one(users, {
        fields: [orders.createdBy],
        references: [users.id]
      }),
      closedByUser: one(users, {
        fields: [orders.closedBy],
        references: [users.id]
      }),
      orderItems: many(orderItems),
      adjustments: many(orderAdjustments),
      events: many(financialEvents),
      paymentEvents: many(paymentEvents),
      loyaltyTransactions: many(loyaltyTransactions),
      couponUsages: many(couponUsages)
    }));
    orderItemsRelations = relations(orderItems, ({ one, many }) => ({
      order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id]
      }),
      menuItem: one(menuItems, {
        fields: [orderItems.menuItemId],
        references: [menuItems.id]
      }),
      guest: one(tableGuests, {
        fields: [orderItems.guestId],
        references: [tableGuests.id]
      }),
      orderItemOptions: many(orderItemOptions),
      auditLogs: many(orderItemAuditLogs)
    }));
    orderItemAuditLogsRelations = relations(orderItemAuditLogs, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [orderItemAuditLogs.restaurantId],
        references: [restaurants.id]
      }),
      orderItem: one(orderItems, {
        fields: [orderItemAuditLogs.orderItemId],
        references: [orderItems.id]
      }),
      order: one(orders, {
        fields: [orderItemAuditLogs.orderId],
        references: [orders.id]
      }),
      session: one(tableSessions, {
        fields: [orderItemAuditLogs.sessionId],
        references: [tableSessions.id]
      }),
      actor: one(users, {
        fields: [orderItemAuditLogs.actorUserId],
        references: [users.id]
      }),
      sourceGuest: one(tableGuests, {
        fields: [orderItemAuditLogs.sourceGuestId],
        references: [tableGuests.id]
      }),
      targetGuest: one(tableGuests, {
        fields: [orderItemAuditLogs.targetGuestId],
        references: [tableGuests.id]
      })
    }));
    optionGroupsRelations = relations(optionGroups, ({ one, many }) => ({
      menuItem: one(menuItems, {
        fields: [optionGroups.menuItemId],
        references: [menuItems.id]
      }),
      options: many(options)
    }));
    optionsRelations = relations(options, ({ one, many }) => ({
      optionGroup: one(optionGroups, {
        fields: [options.optionGroupId],
        references: [optionGroups.id]
      }),
      orderItemOptions: many(orderItemOptions)
    }));
    orderItemOptionsRelations = relations(orderItemOptions, ({ one }) => ({
      orderItem: one(orderItems, {
        fields: [orderItemOptions.orderItemId],
        references: [orderItems.id]
      }),
      option: one(options, {
        fields: [orderItemOptions.optionId],
        references: [options.id]
      })
    }));
    messagesRelations = relations(messages, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [messages.restaurantId],
        references: [restaurants.id]
      })
    }));
    menuVisitsRelations = relations(menuVisits, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [menuVisits.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [menuVisits.branchId],
        references: [branches.id]
      })
    }));
    customerReviewsRelations = relations(customerReviews, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [customerReviews.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [customerReviews.branchId],
        references: [branches.id]
      }),
      order: one(orders, {
        fields: [customerReviews.orderId],
        references: [orders.id]
      })
    }));
    financialShiftsRelations = relations(financialShifts, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [financialShifts.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [financialShifts.branchId],
        references: [branches.id]
      }),
      operator: one(users, {
        fields: [financialShifts.operatorId],
        references: [users.id]
      }),
      sessions: many(tableSessions),
      events: many(financialEvents)
    }));
    financialEventsRelations = relations(financialEvents, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [financialEvents.restaurantId],
        references: [restaurants.id]
      }),
      session: one(tableSessions, {
        fields: [financialEvents.sessionId],
        references: [tableSessions.id]
      }),
      order: one(orders, {
        fields: [financialEvents.orderId],
        references: [orders.id]
      }),
      table: one(tables, {
        fields: [financialEvents.tableId],
        references: [tables.id]
      }),
      shift: one(financialShifts, {
        fields: [financialEvents.shiftId],
        references: [financialShifts.id]
      }),
      operator: one(users, {
        fields: [financialEvents.operatorId],
        references: [users.id]
      })
    }));
    orderAdjustmentsRelations = relations(orderAdjustments, ({ one }) => ({
      order: one(orders, {
        fields: [orderAdjustments.orderId],
        references: [orders.id]
      }),
      restaurant: one(restaurants, {
        fields: [orderAdjustments.restaurantId],
        references: [restaurants.id]
      }),
      operator: one(users, {
        fields: [orderAdjustments.operatorId],
        references: [users.id]
      })
    }));
    paymentEventsRelations = relations(paymentEvents, ({ one }) => ({
      order: one(orders, {
        fields: [paymentEvents.orderId],
        references: [orders.id]
      }),
      session: one(tableSessions, {
        fields: [paymentEvents.sessionId],
        references: [tableSessions.id]
      }),
      restaurant: one(restaurants, {
        fields: [paymentEvents.restaurantId],
        references: [restaurants.id]
      }),
      operator: one(users, {
        fields: [paymentEvents.operatorId],
        references: [users.id]
      })
    }));
    reportAggregationsRelations = relations(reportAggregations, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [reportAggregations.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [reportAggregations.branchId],
        references: [branches.id]
      })
    }));
    cashRegisters = pgTable("cash_registers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 200 }).notNull(),
      initialBalance: decimal("initial_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
      currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
      isActive: integer("is_active").notNull().default(1),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertCashRegisterSchema = createInsertSchema(cashRegisters).omit({
      id: true,
      restaurantId: true,
      currentBalance: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      name: z.string().min(1, "Nome da caixa \xE9 obrigat\xF3rio"),
      branchId: z.string().optional().nullable(),
      initialBalance: z.string().optional(),
      isActive: z.number().optional()
    });
    updateCashRegisterSchema = z.object({
      name: z.string().min(1, "Nome da caixa \xE9 obrigat\xF3rio").optional(),
      isActive: z.number().optional()
    });
    cashRegisterShiftStatusEnum = pgEnum("cash_register_shift_status", ["aberto", "fechado"]);
    cashRegisterShifts = pgTable("cash_register_shifts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      cashRegisterId: varchar("cash_register_id").notNull().references(() => cashRegisters.id, { onDelete: "restrict" }),
      openedByUserId: varchar("opened_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
      closedByUserId: varchar("closed_by_user_id").references(() => users.id, { onDelete: "restrict" }),
      status: cashRegisterShiftStatusEnum("status").notNull().default("aberto"),
      openingAmount: decimal("opening_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
      closingAmountExpected: decimal("closing_amount_expected", { precision: 10, scale: 2 }).default("0.00"),
      closingAmountCounted: decimal("closing_amount_counted", { precision: 10, scale: 2 }).default("0.00"),
      difference: decimal("difference", { precision: 10, scale: 2 }).default("0.00"),
      totalRevenues: decimal("total_revenues", { precision: 10, scale: 2 }).default("0.00"),
      totalExpenses: decimal("total_expenses", { precision: 10, scale: 2 }).default("0.00"),
      openedAt: timestamp("opened_at").defaultNow(),
      closedAt: timestamp("closed_at"),
      notes: text("notes")
    });
    insertCashRegisterShiftSchema = createInsertSchema(cashRegisterShifts).omit({
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
      closedAt: true
    }).extend({
      branchId: z.string().optional().nullable(),
      cashRegisterId: z.string().min(1, "Caixa registradora \xE9 obrigat\xF3ria"),
      openingAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor de abertura inv\xE1lido"),
      notes: z.string().optional()
    });
    closeCashRegisterShiftSchema = z.object({
      closingAmountCounted: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor contado inv\xE1lido"),
      notes: z.string().optional()
    });
    transactionTypeEnum = pgEnum("transaction_type", ["receita", "despesa", "ajuste"]);
    transactionOriginEnum = pgEnum("transaction_origin", ["pdv", "web", "manual"]);
    financialCategories = pgTable("financial_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      type: transactionTypeEnum("type").notNull(),
      name: varchar("name", { length: 200 }).notNull(),
      description: text("description"),
      isDefault: integer("is_default").notNull().default(0),
      isArchived: integer("is_archived").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertFinancialCategorySchema = createInsertSchema(financialCategories).omit({
      id: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      type: z.enum(["receita", "despesa", "ajuste"]),
      name: z.string().min(1, "Nome da categoria \xE9 obrigat\xF3rio"),
      branchId: z.string().optional().nullable(),
      description: z.string().optional(),
      isDefault: z.number().optional(),
      isArchived: z.number().optional()
    });
    financialTransactions = pgTable("financial_transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      cashRegisterId: varchar("cash_register_id").references(() => cashRegisters.id, { onDelete: "restrict" }),
      shiftId: varchar("shift_id").references(() => cashRegisterShifts.id, { onDelete: "restrict" }),
      categoryId: varchar("category_id").notNull().references(() => financialCategories.id, { onDelete: "restrict" }),
      recordedByUserId: varchar("recorded_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
      type: transactionTypeEnum("type").notNull(),
      origin: transactionOriginEnum("origin").notNull().default("manual"),
      description: varchar("description", { length: 500 }),
      paymentMethod: paymentMethodEnum("payment_method").notNull(),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      referenceOrderId: varchar("reference_order_id").references(() => orders.id, { onDelete: "set null" }),
      occurredAt: timestamp("occurred_at").notNull(),
      note: text("note"),
      totalInstallments: integer("total_installments").default(1),
      installmentNumber: integer("installment_number").default(1),
      parentTransactionId: varchar("parent_transaction_id").references(() => financialTransactions.id, { onDelete: "cascade" }),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({
      id: true,
      restaurantId: true,
      recordedByUserId: true,
      createdAt: true
    }).extend({
      branchId: z.string().optional().nullable(),
      cashRegisterId: z.string().optional().nullable(),
      shiftId: z.string().optional().nullable(),
      categoryId: z.string().min(1, "Categoria \xE9 obrigat\xF3ria"),
      type: z.enum(["receita", "despesa", "ajuste"]),
      origin: z.enum(["pdv", "web", "manual"]).default("manual"),
      description: z.string().optional(),
      paymentMethod: z.enum(["dinheiro", "multicaixa", "transferencia", "cartao"]),
      amount: z.string().min(1, "Valor \xE9 obrigat\xF3rio"),
      referenceOrderId: z.string().optional().nullable(),
      occurredAt: z.string().min(1, "Data e hora s\xE3o obrigat\xF3rias"),
      note: z.string().optional(),
      totalInstallments: z.number().int().optional(),
      installmentNumber: z.number().int().optional(),
      parentTransactionId: z.string().optional().nullable(),
      installments: z.number().int().min(1).max(36).optional()
    });
    expenses = pgTable("expenses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      categoryId: varchar("category_id").notNull().references(() => financialCategories.id, { onDelete: "restrict" }),
      transactionId: varchar("transaction_id").references(() => financialTransactions.id, { onDelete: "restrict" }),
      description: varchar("description", { length: 500 }).notNull(),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      paymentMethod: paymentMethodEnum("payment_method").notNull(),
      occurredAt: timestamp("occurred_at").notNull(),
      recordedByUserId: varchar("recorded_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
      note: text("note"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertExpenseSchema = createInsertSchema(expenses).omit({
      id: true,
      restaurantId: true,
      transactionId: true,
      recordedByUserId: true,
      createdAt: true
    }).extend({
      branchId: z.string().optional().nullable(),
      categoryId: z.string().min(1, "Categoria \xE9 obrigat\xF3ria"),
      description: z.string().min(1, "Descri\xE7\xE3o \xE9 obrigat\xF3ria"),
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido"),
      paymentMethod: z.enum(["dinheiro", "multicaixa", "transferencia", "cartao"]),
      occurredAt: z.string().min(1, "Data e hora s\xE3o obrigat\xF3rias"),
      note: z.string().optional()
    });
    updateExpenseSchema = z.object({
      categoryId: z.string().min(1, "Categoria \xE9 obrigat\xF3ria").optional(),
      description: z.string().min(1, "Descri\xE7\xE3o \xE9 obrigat\xF3ria").optional(),
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido").optional(),
      paymentMethod: z.enum(["dinheiro", "multicaixa", "transferencia", "cartao"]).optional(),
      occurredAt: z.string().min(1, "Data e hora s\xE3o obrigat\xF3rias").optional(),
      note: z.string().optional()
    });
    cashRegistersRelations = relations(cashRegisters, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [cashRegisters.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [cashRegisters.branchId],
        references: [branches.id]
      }),
      transactions: many(financialTransactions),
      shifts: many(cashRegisterShifts)
    }));
    cashRegisterShiftsRelations = relations(cashRegisterShifts, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [cashRegisterShifts.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [cashRegisterShifts.branchId],
        references: [branches.id]
      }),
      cashRegister: one(cashRegisters, {
        fields: [cashRegisterShifts.cashRegisterId],
        references: [cashRegisters.id]
      }),
      openedBy: one(users, {
        fields: [cashRegisterShifts.openedByUserId],
        references: [users.id]
      }),
      closedBy: one(users, {
        fields: [cashRegisterShifts.closedByUserId],
        references: [users.id]
      }),
      transactions: many(financialTransactions)
    }));
    financialCategoriesRelations = relations(financialCategories, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [financialCategories.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [financialCategories.branchId],
        references: [branches.id]
      }),
      transactions: many(financialTransactions)
    }));
    financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [financialTransactions.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [financialTransactions.branchId],
        references: [branches.id]
      }),
      cashRegister: one(cashRegisters, {
        fields: [financialTransactions.cashRegisterId],
        references: [cashRegisters.id]
      }),
      shift: one(cashRegisterShifts, {
        fields: [financialTransactions.shiftId],
        references: [cashRegisterShifts.id]
      }),
      category: one(financialCategories, {
        fields: [financialTransactions.categoryId],
        references: [financialCategories.id]
      }),
      recordedBy: one(users, {
        fields: [financialTransactions.recordedByUserId],
        references: [users.id]
      }),
      referenceOrder: one(orders, {
        fields: [financialTransactions.referenceOrderId],
        references: [orders.id]
      })
    }));
    expensesRelations = relations(expenses, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [expenses.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [expenses.branchId],
        references: [branches.id]
      }),
      category: one(financialCategories, {
        fields: [expenses.categoryId],
        references: [financialCategories.id]
      }),
      transaction: one(financialTransactions, {
        fields: [expenses.transactionId],
        references: [financialTransactions.id]
      }),
      recordedBy: one(users, {
        fields: [expenses.recordedByUserId],
        references: [users.id]
      })
    }));
    stockMovementTypeEnum = pgEnum("stock_movement_type", [
      "entrada",
      // Entrada de mercadoria
      "saida",
      // Saída de mercadoria
      "ajuste",
      // Ajuste manual de estoque
      "transferencia"
      // Transferência entre filiais
    ]);
    inventoryCategories = pgTable("inventory_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 200 }).notNull(),
      description: text("description"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertInventoryCategorySchema = createInsertSchema(inventoryCategories).omit({
      id: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      name: z.string().min(1, "Nome da categoria \xE9 obrigat\xF3rio"),
      description: z.string().optional()
    });
    updateInventoryCategorySchema = z.object({
      name: z.string().min(1, "Nome da categoria \xE9 obrigat\xF3rio").optional(),
      description: z.string().optional()
    });
    measurementUnits = pgTable("measurement_units", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 100 }).notNull(),
      abbreviation: varchar("abbreviation", { length: 20 }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertMeasurementUnitSchema = createInsertSchema(measurementUnits).omit({
      id: true,
      restaurantId: true,
      createdAt: true
    }).extend({
      name: z.string().min(1, "Nome da unidade \xE9 obrigat\xF3rio"),
      abbreviation: z.string().min(1, "Abrevia\xE7\xE3o \xE9 obrigat\xF3ria")
    });
    updateMeasurementUnitSchema = z.object({
      name: z.string().min(1, "Nome da unidade \xE9 obrigat\xF3rio").optional(),
      abbreviation: z.string().min(1, "Abrevia\xE7\xE3o \xE9 obrigat\xF3ria").optional()
    });
    inventoryItems = pgTable("inventory_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      categoryId: varchar("category_id").references(() => inventoryCategories.id, { onDelete: "set null" }),
      unitId: varchar("unit_id").notNull().references(() => measurementUnits.id, { onDelete: "restrict" }),
      name: varchar("name", { length: 200 }).notNull(),
      description: text("description"),
      sku: varchar("sku", { length: 100 }),
      costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull().default("0"),
      minStock: decimal("min_stock", { precision: 10, scale: 2 }).default("0"),
      maxStock: decimal("max_stock", { precision: 10, scale: 2 }).default("0"),
      reorderPoint: decimal("reorder_point", { precision: 10, scale: 2 }).default("0"),
      isActive: integer("is_active").notNull().default(1),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
      id: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      categoryId: z.string().optional().nullable(),
      unitId: z.string().min(1, "Unidade de medida \xE9 obrigat\xF3ria"),
      name: z.string().min(1, "Nome do produto \xE9 obrigat\xF3rio"),
      description: z.string().optional(),
      sku: z.string().optional(),
      costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o de custo inv\xE1lido").optional(),
      minStock: z.string().regex(/^\d+(\.\d{1,2})?$/, "Estoque m\xEDnimo inv\xE1lido").optional(),
      maxStock: z.string().regex(/^\d+(\.\d{1,2})?$/, "Estoque m\xE1ximo inv\xE1lido").optional(),
      reorderPoint: z.string().regex(/^\d+(\.\d{1,2})?$/, "Ponto de recompra inv\xE1lido").optional(),
      isActive: z.number().optional()
    });
    updateInventoryItemSchema = z.object({
      categoryId: z.string().optional().nullable(),
      unitId: z.string().min(1, "Unidade de medida \xE9 obrigat\xF3ria").optional(),
      name: z.string().min(1, "Nome do produto \xE9 obrigat\xF3rio").optional(),
      description: z.string().optional(),
      sku: z.string().optional(),
      costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o de custo inv\xE1lido").optional(),
      minStock: z.string().regex(/^\d+(\.\d{1,2})?$/, "Estoque m\xEDnimo inv\xE1lido").optional(),
      maxStock: z.string().regex(/^\d+(\.\d{1,2})?$/, "Estoque m\xE1ximo inv\xE1lido").optional(),
      reorderPoint: z.string().regex(/^\d+(\.\d{1,2})?$/, "Ponto de recompra inv\xE1lido").optional(),
      isActive: z.number().optional()
    });
    branchStock = pgTable("branch_stock", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),
      inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
      quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default("0"),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    stockMovements = pgTable("stock_movements", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),
      inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
      movementType: stockMovementTypeEnum("movement_type").notNull(),
      quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
      previousQuantity: decimal("previous_quantity", { precision: 10, scale: 2 }).notNull(),
      newQuantity: decimal("new_quantity", { precision: 10, scale: 2 }).notNull(),
      unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).default("0"),
      totalCost: decimal("total_cost", { precision: 10, scale: 2 }).default("0"),
      reason: text("reason"),
      referenceId: varchar("reference_id", { length: 100 }),
      fromBranchId: varchar("from_branch_id").references(() => branches.id, { onDelete: "set null" }),
      toBranchId: varchar("to_branch_id").references(() => branches.id, { onDelete: "set null" }),
      recordedByUserId: varchar("recorded_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertStockMovementSchema = createInsertSchema(stockMovements).omit({
      id: true,
      restaurantId: true,
      recordedByUserId: true,
      previousQuantity: true,
      newQuantity: true,
      createdAt: true
    }).extend({
      branchId: z.string().optional(),
      inventoryItemId: z.string().min(1, "Produto \xE9 obrigat\xF3rio"),
      movementType: z.enum(["entrada", "saida", "ajuste", "transferencia"]),
      quantity: z.string().regex(/^\d+(\.\d{1,2})?$/, "Quantidade inv\xE1lida"),
      unitCost: z.string().regex(/^\d+(\.\d{1,2})?$/, "Custo unit\xE1rio inv\xE1lido").optional(),
      totalCost: z.string().regex(/^\d+(\.\d{1,2})?$/, "Custo total inv\xE1lido").optional(),
      reason: z.string().optional(),
      referenceId: z.string().optional(),
      fromBranchId: z.string().optional().nullable(),
      toBranchId: z.string().optional().nullable()
    });
    inventoryCategoriesRelations = relations(inventoryCategories, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [inventoryCategories.restaurantId],
        references: [restaurants.id]
      }),
      items: many(inventoryItems)
    }));
    measurementUnitsRelations = relations(measurementUnits, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [measurementUnits.restaurantId],
        references: [restaurants.id]
      }),
      items: many(inventoryItems)
    }));
    inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [inventoryItems.restaurantId],
        references: [restaurants.id]
      }),
      category: one(inventoryCategories, {
        fields: [inventoryItems.categoryId],
        references: [inventoryCategories.id]
      }),
      unit: one(measurementUnits, {
        fields: [inventoryItems.unitId],
        references: [measurementUnits.id]
      }),
      branchStocks: many(branchStock),
      movements: many(stockMovements)
    }));
    branchStockRelations = relations(branchStock, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [branchStock.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [branchStock.branchId],
        references: [branches.id]
      }),
      inventoryItem: one(inventoryItems, {
        fields: [branchStock.inventoryItemId],
        references: [inventoryItems.id]
      })
    }));
    stockMovementsRelations = relations(stockMovements, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [stockMovements.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [stockMovements.branchId],
        references: [branches.id]
      }),
      inventoryItem: one(inventoryItems, {
        fields: [stockMovements.inventoryItemId],
        references: [inventoryItems.id]
      }),
      fromBranch: one(branches, {
        fields: [stockMovements.fromBranchId],
        references: [branches.id]
      }),
      toBranch: one(branches, {
        fields: [stockMovements.toBranchId],
        references: [branches.id]
      }),
      recordedBy: one(users, {
        fields: [stockMovements.recordedByUserId],
        references: [users.id]
      })
    }));
    recipeIngredients = pgTable("recipe_ingredients", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      menuItemId: varchar("menu_item_id").notNull().references(() => menuItems.id, { onDelete: "cascade" }),
      inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
      quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertRecipeIngredientSchema = createInsertSchema(recipeIngredients).omit({
      id: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      menuItemId: z.string().min(1, "Item do menu \xE9 obrigat\xF3rio"),
      inventoryItemId: z.string().min(1, "Ingrediente \xE9 obrigat\xF3rio"),
      quantity: z.string().regex(/^\d+(\.\d{1,3})?$/, "Quantidade inv\xE1lida")
    });
    updateRecipeIngredientSchema = z.object({
      quantity: z.string().regex(/^\d+(\.\d{1,3})?$/, "Quantidade inv\xE1lida").optional()
    });
    recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [recipeIngredients.restaurantId],
        references: [restaurants.id]
      }),
      menuItem: one(menuItems, {
        fields: [recipeIngredients.menuItemId],
        references: [menuItems.id]
      }),
      inventoryItem: one(inventoryItems, {
        fields: [recipeIngredients.inventoryItemId],
        references: [inventoryItems.id]
      })
    }));
    customersRelations = relations(customers, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [customers.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [customers.branchId],
        references: [branches.id]
      }),
      orders: many(orders),
      loyaltyTransactions: many(loyaltyTransactions),
      couponUsages: many(couponUsages),
      sessions: many(customerSessions)
    }));
    customerSessionsRelations = relations(customerSessions, ({ one }) => ({
      customer: one(customers, {
        fields: [customerSessions.customerId],
        references: [customers.id]
      }),
      restaurant: one(restaurants, {
        fields: [customerSessions.restaurantId],
        references: [restaurants.id]
      })
    }));
    loyaltyProgramsRelations = relations(loyaltyPrograms, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [loyaltyPrograms.restaurantId],
        references: [restaurants.id]
      })
    }));
    loyaltyTransactionsRelations = relations(loyaltyTransactions, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [loyaltyTransactions.restaurantId],
        references: [restaurants.id]
      }),
      customer: one(customers, {
        fields: [loyaltyTransactions.customerId],
        references: [customers.id]
      }),
      order: one(orders, {
        fields: [loyaltyTransactions.orderId],
        references: [orders.id]
      }),
      createdByUser: one(users, {
        fields: [loyaltyTransactions.createdBy],
        references: [users.id]
      })
    }));
    couponsRelations = relations(coupons, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [coupons.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [coupons.branchId],
        references: [branches.id]
      }),
      createdByUser: one(users, {
        fields: [coupons.createdBy],
        references: [users.id]
      }),
      usages: many(couponUsages),
      orders: many(orders)
    }));
    couponUsagesRelations = relations(couponUsages, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [couponUsages.restaurantId],
        references: [restaurants.id]
      }),
      coupon: one(coupons, {
        fields: [couponUsages.couponId],
        references: [coupons.id]
      }),
      customer: one(customers, {
        fields: [couponUsages.customerId],
        references: [customers.id]
      }),
      order: one(orders, {
        fields: [couponUsages.orderId],
        references: [orders.id]
      })
    }));
    subscriptionPlanEnum = pgEnum("subscription_plan", ["basico", "profissional", "empresarial", "enterprise"]);
    subscriptionStatusEnum = pgEnum("subscription_status", ["trial", "ativa", "cancelada", "suspensa", "expirada"]);
    subscriptionPaymentStatusEnum = pgEnum("subscription_payment_status", ["pendente", "pago", "falhou", "reembolsado"]);
    billingIntervalEnum = pgEnum("billing_interval", ["mensal", "anual"]);
    subscriptionPlans = pgTable("subscription_plans", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name", { length: 100 }).notNull(),
      // Básico, Profissional, Empresarial, Enterprise
      slug: varchar("slug", { length: 50 }).notNull().unique(),
      // basico, profissional, empresarial, enterprise
      description: text("description"),
      priceMonthlyKz: decimal("price_monthly_kz", { precision: 10, scale: 2 }).notNull(),
      // Preço mensal em Kwanzas
      priceAnnualKz: decimal("price_annual_kz", { precision: 10, scale: 2 }).notNull(),
      // Preço anual em Kwanzas
      priceMonthlyUsd: decimal("price_monthly_usd", { precision: 10, scale: 2 }).notNull(),
      // Preço mensal em USD
      priceAnnualUsd: decimal("price_annual_usd", { precision: 10, scale: 2 }).notNull(),
      // Preço anual em USD
      stripePriceIdMonthly: varchar("stripe_price_id_monthly", { length: 255 }),
      // Stripe Price ID para mensal
      stripePriceIdAnnual: varchar("stripe_price_id_annual", { length: 255 }),
      // Stripe Price ID para anual
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
      features: jsonb("features"),
      // Array de features incluídas: ['pdv', 'fidelidade', 'cupons', etc]
      isActive: integer("is_active").notNull().default(1),
      // 0 = inativo, 1 = ativo
      displayOrder: integer("display_order").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      name: z.string().min(1, "Nome do plano \xE9 obrigat\xF3rio"),
      slug: z.string().min(1, "Slug \xE9 obrigat\xF3rio"),
      priceMonthlyKz: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido"),
      priceAnnualKz: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido"),
      priceMonthlyUsd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido"),
      priceAnnualUsd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido")
    });
    updateSubscriptionPlanSchema = z.object({
      name: z.string().min(1, "Nome do plano \xE9 obrigat\xF3rio").optional(),
      description: z.string().optional(),
      priceMonthlyKz: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido").optional(),
      priceAnnualKz: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido").optional(),
      priceMonthlyUsd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido").optional(),
      priceAnnualUsd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Pre\xE7o inv\xE1lido").optional(),
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
      displayOrder: z.number().int().optional()
    });
    subscriptions = pgTable("subscriptions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }).unique(),
      planId: varchar("plan_id").notNull().references(() => subscriptionPlans.id, { onDelete: "restrict" }),
      status: subscriptionStatusEnum("status").notNull().default("trial"),
      billingInterval: billingIntervalEnum("billing_interval").notNull().default("mensal"),
      currency: varchar("currency", { length: 3 }).notNull().default("AOA"),
      // AOA ou USD
      stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
      stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
      currentPeriodStart: timestamp("current_period_start").notNull(),
      currentPeriodEnd: timestamp("current_period_end").notNull(),
      trialStart: timestamp("trial_start"),
      trialEnd: timestamp("trial_end"),
      canceledAt: timestamp("canceled_at"),
      cancelAtPeriodEnd: integer("cancel_at_period_end").notNull().default(0),
      // 0 = não, 1 = sim
      autoRenew: integer("auto_renew").notNull().default(1),
      // 0 = não renova, 1 = renova automaticamente
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertSubscriptionSchema = z.object({
      planId: z.string().min(1, "Plano \xE9 obrigat\xF3rio"),
      billingInterval: z.enum(["mensal", "anual"]).default("mensal"),
      currency: z.enum(["AOA", "USD"]).default("AOA")
    });
    updateSubscriptionSchema = z.object({
      planId: z.string().optional(),
      status: z.enum(["trial", "ativa", "cancelada", "suspensa", "expirada"]).optional(),
      billingInterval: z.enum(["mensal", "anual"]).optional(),
      cancelAtPeriodEnd: z.number().optional(),
      autoRenew: z.number().optional()
    });
    superAdminCreateSubscriptionSchema = z.object({
      planId: z.string().min(1, "Plano \xE9 obrigat\xF3rio"),
      billingInterval: z.enum(["mensal", "anual"]),
      currency: z.enum(["AOA", "USD"]),
      status: z.enum(["trial", "ativa", "cancelada", "suspensa", "expirada"]).default("trial")
    });
    superAdminUpdateSubscriptionSchema = z.object({
      planId: z.string().optional(),
      status: z.enum(["trial", "ativa", "cancelada", "suspensa", "expirada"]).optional(),
      billingInterval: z.enum(["mensal", "anual"]).optional(),
      currency: z.enum(["AOA", "USD"]).optional(),
      cancelAtPeriodEnd: z.number().optional(),
      autoRenew: z.number().optional()
    });
    subscriptionPayments = pgTable("subscription_payments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "cascade" }),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      currency: varchar("currency", { length: 3 }).notNull().default("KZ"),
      // KZ ou USD
      status: subscriptionPaymentStatusEnum("status").notNull().default("pendente"),
      paymentMethod: varchar("payment_method", { length: 100 }),
      // stripe, multicaixa, transferencia
      stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
      stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
      billingPeriodStart: timestamp("billing_period_start").notNull(),
      billingPeriodEnd: timestamp("billing_period_end").notNull(),
      paidAt: timestamp("paid_at"),
      failedAt: timestamp("failed_at"),
      failureReason: text("failure_reason"),
      receiptUrl: text("receipt_url"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertSubscriptionPaymentSchema = createInsertSchema(subscriptionPayments).omit({
      id: true,
      restaurantId: true,
      createdAt: true
    }).extend({
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido"),
      billingPeriodStart: z.string(),
      billingPeriodEnd: z.string()
    });
    subscriptionUsage = pgTable("subscription_usage", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "cascade" }),
      periodStart: timestamp("period_start").notNull(),
      periodEnd: timestamp("period_end").notNull(),
      branchesCount: integer("branches_count").notNull().default(0),
      tablesCount: integer("tables_count").notNull().default(0),
      menuItemsCount: integer("menu_items_count").notNull().default(0),
      ordersCount: integer("orders_count").notNull().default(0),
      usersCount: integer("users_count").notNull().default(0),
      lastCalculatedAt: timestamp("last_calculated_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertSubscriptionUsageSchema = createInsertSchema(subscriptionUsage).omit({
      id: true,
      restaurantId: true,
      createdAt: true
    }).extend({
      periodStart: z.string(),
      periodEnd: z.string()
    });
    subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
      subscriptions: many(subscriptions)
    }));
    subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
      restaurant: one(restaurants, {
        fields: [subscriptions.restaurantId],
        references: [restaurants.id]
      }),
      plan: one(subscriptionPlans, {
        fields: [subscriptions.planId],
        references: [subscriptionPlans.id]
      }),
      payments: many(subscriptionPayments),
      usageRecords: many(subscriptionUsage)
    }));
    subscriptionPaymentsRelations = relations(subscriptionPayments, ({ one }) => ({
      subscription: one(subscriptions, {
        fields: [subscriptionPayments.subscriptionId],
        references: [subscriptions.id]
      }),
      restaurant: one(restaurants, {
        fields: [subscriptionPayments.restaurantId],
        references: [restaurants.id]
      })
    }));
    subscriptionUsageRelations = relations(subscriptionUsage, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [subscriptionUsage.restaurantId],
        references: [restaurants.id]
      }),
      subscription: one(subscriptions, {
        fields: [subscriptionUsage.subscriptionId],
        references: [subscriptions.id]
      })
    }));
    notificationTypeEnum = pgEnum("notification_type", [
      "new_order",
      // Novo pedido recebido
      "order_status",
      // Mudança de status do pedido
      "order_cancelled",
      // Pedido cancelado
      "low_stock",
      // Estoque baixo
      "new_customer",
      // Novo cliente cadastrado
      "payment_received",
      // Pagamento recebido
      "subscription_alert",
      // Alerta de subscrição (expirando, limite atingido)
      "system"
      // Notificação do sistema
    ]);
    notificationChannelEnum = pgEnum("notification_channel", [
      "in_app",
      // Notificação dentro do app
      "whatsapp",
      // WhatsApp via Twilio
      "email",
      // Email (futuro)
      "push"
      // Push notification (futuro)
    ]);
    notifications = pgTable("notifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      branchId: varchar("branch_id").references(() => branches.id, { onDelete: "cascade" }),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
      // null = notificação para todos os admins
      type: notificationTypeEnum("type").notNull(),
      title: varchar("title", { length: 200 }).notNull(),
      message: text("message").notNull(),
      data: jsonb("data"),
      // Dados adicionais (orderId, customerId, etc.)
      isRead: integer("is_read").notNull().default(0),
      // 0 = não lida, 1 = lida
      readAt: timestamp("read_at"),
      channel: notificationChannelEnum("channel").notNull().default("in_app"),
      sentAt: timestamp("sent_at"),
      // Quando foi enviada via WhatsApp/Email
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_notifications_restaurant").on(table.restaurantId),
      index("idx_notifications_user").on(table.userId),
      index("idx_notifications_unread").on(table.restaurantId, table.isRead)
    ]);
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      restaurantId: true,
      isRead: true,
      readAt: true,
      sentAt: true,
      createdAt: true
    }).extend({
      title: z.string().min(1, "T\xEDtulo \xE9 obrigat\xF3rio"),
      message: z.string().min(1, "Mensagem \xE9 obrigat\xF3ria"),
      type: z.enum(["new_order", "order_status", "order_cancelled", "low_stock", "new_customer", "payment_received", "subscription_alert", "system"]),
      channel: z.enum(["in_app", "whatsapp", "email", "push"]).default("in_app"),
      branchId: z.string().optional(),
      userId: z.string().optional(),
      data: z.any().optional()
    });
    notificationPreferences = pgTable("notification_preferences", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
      // null = configuração padrão do restaurante
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
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => [
      index("idx_notification_prefs_restaurant").on(table.restaurantId),
      index("idx_notification_prefs_user").on(table.userId)
    ]);
    insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
      id: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true
    });
    updateNotificationPreferencesSchema = z.object({
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
      whatsappNotificationNumber: z.string().optional()
    });
    customerNotificationPreferences = pgTable("customer_notification_preferences", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }).unique(),
      orderStatusEnabled: integer("order_status_enabled").notNull().default(1),
      // Receber atualizações de status
      promotionsEnabled: integer("promotions_enabled").notNull().default(0),
      // Receber promoções
      whatsappEnabled: integer("whatsapp_enabled").notNull().default(1),
      // Receber via WhatsApp
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    updateCustomerNotificationPreferencesSchema = z.object({
      orderStatusEnabled: z.number().min(0).max(1).optional(),
      promotionsEnabled: z.number().min(0).max(1).optional(),
      whatsappEnabled: z.number().min(0).max(1).optional()
    });
    notificationsRelations = relations(notifications, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [notifications.restaurantId],
        references: [restaurants.id]
      }),
      branch: one(branches, {
        fields: [notifications.branchId],
        references: [branches.id]
      }),
      user: one(users, {
        fields: [notifications.userId],
        references: [users.id]
      })
    }));
    notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
      restaurant: one(restaurants, {
        fields: [notificationPreferences.restaurantId],
        references: [restaurants.id]
      }),
      user: one(users, {
        fields: [notificationPreferences.userId],
        references: [users.id]
      })
    }));
    customerNotificationPreferencesRelations = relations(customerNotificationPreferences, ({ one }) => ({
      customer: one(customers, {
        fields: [customerNotificationPreferences.customerId],
        references: [customers.id]
      })
    }));
    linkAnalytics = pgTable("link_analytics", {
      id: serial("id").primaryKey(),
      restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
      timestamp: timestamp("timestamp").defaultNow().notNull(),
      source: varchar("source", { length: 255 }),
      // 'direct', 'whatsapp', 'instagram', 'facebook', 'qrcode', etc
      referrer: text("referrer"),
      userAgent: text("user_agent"),
      ipAddress: varchar("ip_address", { length: 45 }),
      sessionId: varchar("session_id", { length: 255 }),
      converted: integer("converted").notNull().default(0),
      // 1 if resulted in an order
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_link_analytics_restaurant_id").on(table.restaurantId),
      index("idx_link_analytics_timestamp").on(table.timestamp),
      index("idx_link_analytics_session_id").on(table.sessionId)
    ]);
    insertLinkAnalyticsSchema = createInsertSchema(linkAnalytics).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
async function initializeConnection() {
  if (poolInstance && dbInstance) {
    return;
  }
  if (initPromise) {
    return initPromise;
  }
  initPromise = (async () => {
    if (isNeonDatabase) {
      const { Pool, neonConfig } = await import("@neondatabase/serverless");
      const { drizzle } = await import("drizzle-orm/neon-serverless");
      const ws = (await import("ws")).default;
      neonConfig.webSocketConstructor = ws;
      neonConfig.wsProxy = (host) => host + "/v2";
      neonConfig.useSecureWebSocket = true;
      neonConfig.pipelineTLS = false;
      neonConfig.pipelineConnect = false;
      if (process.env.NODE_ENV === "development") {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      }
      poolInstance = new Pool({
        connectionString: url,
        max: 10,
        idleTimeoutMillis: 3e4,
        connectionTimeoutMillis: 1e4
      });
      dbInstance = drizzle({ client: poolInstance, schema: schema_exports });
    } else {
      const { Pool } = await import("pg");
      const { drizzle } = await import("drizzle-orm/node-postgres");
      poolInstance = new Pool({
        connectionString: url,
        max: 10,
        idleTimeoutMillis: 3e4,
        connectionTimeoutMillis: 1e4,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
      });
      dbInstance = drizzle(poolInstance, { schema: schema_exports });
    }
  })();
  return initPromise;
}
var url, isNeonDatabase, poolInstance, dbInstance, initPromise, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    url = process.env.DATABASE_URL;
    if (!url || url.trim() === "") {
      throw new Error(
        "DATABASE_URL is not configured. Please set the DATABASE_URL environment variable with your PostgreSQL connection string."
      );
    }
    isNeonDatabase = url.includes("neon.tech") || url.includes("neon.cloud");
    poolInstance = null;
    dbInstance = null;
    initPromise = null;
    pool = new Proxy({}, {
      get(target, prop) {
        if (!poolInstance) {
          initializeConnection();
        }
        return poolInstance[prop];
      }
    });
    db = new Proxy({}, {
      get(target, prop) {
        if (!dbInstance) {
          initializeConnection();
        }
        return dbInstance[prop];
      }
    });
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  getSession: () => getSession,
  hashPassword: () => hashPassword,
  isAuthenticated: () => isAuthenticated,
  setupAuth: () => setupAuth,
  verifyPassword: () => verifyPassword
});
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    console.error("\u26A0\uFE0F  SESSION_SECRET is not set!");
    console.error("\u{1F527} Please set SESSION_SECRET in your environment variables.");
    console.error(`\u{1F4A1} Generate a secure secret with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`);
    throw new Error("SESSION_SECRET must be set");
  }
  if (sessionSecret.length < 32) {
    console.warn("\u26A0\uFE0F  SESSION_SECRET is too short (minimum 32 characters recommended)");
  }
  const isProduction = process.env.NODE_ENV === "production";
  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: sessionTtl,
      // Ensure the cookie domain is not set, allowing it to work with subdomains
      domain: void 0
    }
  });
}
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
      async (email, password, done) => {
        try {
          console.log("[AUTH] Login attempt for email:", email);
          const user = await storage.getUserByEmail(email);
          console.log("[AUTH] User found:", !!user, user ? `role: ${user.role}` : "no user");
          if (!user) {
            console.log("[AUTH] Login failed: User not found");
            return done(null, false, { message: "Email ou senha incorretos" });
          }
          const isValidPassword = await verifyPassword(password, user.password);
          console.log("[AUTH] Password valid:", isValidPassword);
          if (!isValidPassword) {
            console.log("[AUTH] Login failed: Invalid password");
            return done(null, false, { message: "Email ou senha incorretos" });
          }
          console.log("[AUTH] Login successful for user:", user.id);
          return done(null, user);
        } catch (error) {
          console.error("[AUTH] Login error:", error);
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });
  passport.deserializeUser(async (id, cb) => {
    try {
      const user = await storage.getUser(id);
      if (process.env.NODE_ENV === "production" || process.env.DEBUG_AUTH === "true") {
        console.log("[AUTH] Deserializing user:", {
          userId: id,
          userFound: !!user,
          userRole: user?.role,
          hasRole: user ? "role" in user : false
        });
      }
      if (user && !user.role) {
        console.error("[AUTH] CRITICAL: User loaded from database missing role field!", {
          userId: user.id,
          email: user.email,
          restaurantId: user.restaurantId,
          userKeys: Object.keys(user)
        });
        console.error("[AUTH] ACTION REQUIRED: Run the SQL repair script (scripts/repair-user-roles.sql) to fix this user's role.");
        console.error("[AUTH] This user will have LIMITED ACCESS (kitchen menu only) until role is manually set.");
      }
      cb(null, user);
    } catch (error) {
      console.error("[AUTH] Error deserializing user:", error);
      cb(error);
    }
  });
}
var SALT_ROUNDS, isAuthenticated;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    SALT_ROUNDS = 10;
    isAuthenticated = (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      if (process.env.NODE_ENV === "production" || process.env.DEBUG_AUTH === "true") {
        console.log("[AUTH] isAuthenticated check failed:", {
          hasSession: !!req.session,
          sessionID: req.sessionID,
          authenticated: req.isAuthenticated(),
          path: req.path
        });
      }
      res.status(401).json({ message: "N\xE3o autenticado" });
    };
  }
});

// server/initDb.ts
var initDb_exports = {};
__export(initDb_exports, {
  ensureTablesExist: () => ensureTablesExist
});
import { sql as sql2 } from "drizzle-orm";
async function ensureTablesExist() {
  if (isInitialized) {
    return;
  }
  if (initPromise2) {
    return initPromise2;
  }
  initPromise2 = (async () => {
    try {
      await initializeConnection();
      console.log("Ensuring database tables exist...");
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE restaurant_status AS ENUM ('pendente', 'ativo', 'suspenso'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'manager', 'cashier', 'waiter', 'kitchen'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pendente', 'em_preparo', 'pronto', 'servido', 'cancelado'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE order_type AS ENUM ('mesa', 'delivery', 'takeout', 'balcao', 'pdv'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('nao_pago', 'parcial', 'pago'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('dinheiro', 'multicaixa', 'transferencia', 'cartao'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE discount_type AS ENUM ('valor', 'percentual'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE bill_split_type AS ENUM ('igual', 'por_pessoa', 'personalizado'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN
        ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cancelado';
      EXCEPTION WHEN others THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
      EXCEPTION WHEN others THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cashier';
      EXCEPTION WHEN others THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'waiter';
      EXCEPTION WHEN others THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS restaurants (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(100) UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE, 
        phone VARCHAR(50), 
        address TEXT, 
        logo_url TEXT,
        business_hours TEXT,
        description TEXT,
        status restaurant_status NOT NULL DEFAULT 'pendente', 
        created_at TIMESTAMP DEFAULT NOW(), 
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN slug VARCHAR(100) UNIQUE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN logo_url TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN business_hours TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN description TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN primary_color VARCHAR(7) DEFAULT '#EA580C'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#DC2626'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN accent_color VARCHAR(7) DEFAULT '#0891B2'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN hero_image_url TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN whatsapp_number VARCHAR(50); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE restaurants ADD COLUMN is_open INTEGER NOT NULL DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE, 
        email VARCHAR(255) NOT NULL UNIQUE, 
        password VARCHAR(255) NOT NULL, 
        first_name VARCHAR(100), 
        last_name VARCHAR(100), 
        role user_role NOT NULL DEFAULT 'admin', 
        created_at TIMESTAMP DEFAULT NOW(), 
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE users ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS branches (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, 
        name VARCHAR(200) NOT NULL, 
        address TEXT, 
        phone VARCHAR(50), 
        is_active INTEGER NOT NULL DEFAULT 1, 
        is_main INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(), 
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE users ADD COLUMN active_branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY, 
        sess JSONB NOT NULL, 
        expire TIMESTAMP NOT NULL
      );`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS tables (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, 
        number INTEGER NOT NULL, 
        qr_code TEXT NOT NULL, 
        is_occupied INTEGER NOT NULL DEFAULT 0, 
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_number_unique; 
      EXCEPTION WHEN undefined_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_restaurant_branch_number_unique; 
      EXCEPTION WHEN undefined_object THEN null; END $$;`);
      await db.execute(sql2`DROP INDEX IF EXISTS tables_restaurant_branch_number_idx;`);
      await db.execute(sql2`CREATE UNIQUE INDEX IF NOT EXISTS tables_restaurant_branch_number_idx 
        ON tables (restaurant_id, COALESCE(branch_id, ''), number);`);
      await db.execute(sql2`DO $$ BEGIN
        CREATE TYPE table_status AS ENUM ('livre', 'ocupada', 'em_andamento', 'aguardando_pagamento', 'encerrada');
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN status table_status NOT NULL DEFAULT 'livre'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN current_session_id VARCHAR; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN position_x REAL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN position_y REAL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN customer_name VARCHAR(200); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN customer_count INTEGER DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN last_activity TIMESTAMP; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN is_occupied INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN capacity INTEGER; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE tables ADD COLUMN area VARCHAR(100); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN
        CREATE TYPE shift_status AS ENUM ('aberto', 'fechado');
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS financial_shifts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        operator_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status shift_status NOT NULL DEFAULT 'aberto',
        opening_balance DECIMAL(10, 2) DEFAULT 0,
        closing_balance DECIMAL(10, 2) DEFAULT 0,
        expected_balance DECIMAL(10, 2) DEFAULT 0,
        discrepancy DECIMAL(10, 2) DEFAULT 0,
        notes TEXT,
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS table_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id VARCHAR NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        customer_name VARCHAR(200),
        customer_count INTEGER,
        total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        status table_status NOT NULL DEFAULT 'ocupada',
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP,
        notes TEXT
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE table_sessions ADD COLUMN shift_id VARCHAR REFERENCES financial_shifts(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE table_sessions ADD COLUMN operator_id VARCHAR REFERENCES users(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE table_sessions ADD COLUMN session_totals JSONB; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE table_sessions ADD COLUMN closing_snapshot JSONB; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE table_sessions ADD COLUMN closed_by_id VARCHAR REFERENCES users(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE guest_status AS ENUM ('ativo', 'aguardando_conta', 'pago', 'saiu'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS table_guests (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
        table_id VARCHAR NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(200),
        seat_number INTEGER,
        status guest_status NOT NULL DEFAULT 'ativo',
        subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
        paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        token VARCHAR(100) UNIQUE,
        device_info TEXT,
        joined_at TIMESTAMP DEFAULT NOW(),
        left_at TIMESTAMP
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS table_payments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id VARCHAR NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
        session_id VARCHAR REFERENCES table_sessions(id) ON DELETE CASCADE,
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE table_payments ADD COLUMN operator_id VARCHAR REFERENCES users(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE table_payments ADD COLUMN payment_source VARCHAR(100); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE table_payments ADD COLUMN method_details JSONB; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE table_payments ADD COLUMN reconciliation_batch_id VARCHAR(100); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS table_bill_splits (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
        table_id VARCHAR NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        split_type bill_split_type NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        split_count INTEGER NOT NULL DEFAULT 1,
        allocations JSONB,
        is_finalized INTEGER NOT NULL DEFAULT 0,
        created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finalized_at TIMESTAMP
      );`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS idx_table_bill_splits_session ON table_bill_splits(session_id);`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS idx_table_bill_splits_table ON table_bill_splits(table_id);`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS idx_table_bill_splits_restaurant ON table_bill_splits(restaurant_id);`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS idx_table_bill_splits_created_at ON table_bill_splits(created_at);`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, 
        name VARCHAR(100) NOT NULL, 
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE categories ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE categories ADD COLUMN branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE categories ADD COLUMN image_url TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE categories ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE categories ADD COLUMN is_visible INTEGER NOT NULL DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, 
        category_id VARCHAR NOT NULL REFERENCES categories(id) ON DELETE CASCADE, 
        name VARCHAR(200) NOT NULL, 
        description TEXT, 
        price DECIMAL(10, 2) NOT NULL, 
        image_url TEXT, 
        is_available INTEGER NOT NULL DEFAULT 1, 
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN is_visible INTEGER NOT NULL DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN original_price DECIMAL(10, 2); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN is_new INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN tags TEXT[]; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE menu_items ADD COLUMN preparation_time INTEGER; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        table_id VARCHAR REFERENCES tables(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        order_type order_type NOT NULL DEFAULT 'mesa',
        customer_name VARCHAR(200), 
        customer_phone VARCHAR(50),
        delivery_address TEXT,
        order_notes TEXT,
        status order_status NOT NULL DEFAULT 'pendente', 
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        paid_amount DECIMAL(10, 2) DEFAULT 0,
        is_synced INTEGER DEFAULT 1,
        created_by VARCHAR REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(), 
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN restaurant_id VARCHAR REFERENCES restaurants(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN order_type order_type NOT NULL DEFAULT 'mesa'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN delivery_address TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN delivery_notes TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN order_notes TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ALTER COLUMN table_id DROP NOT NULL; 
      EXCEPTION WHEN others THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN payment_method payment_method; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN paid_amount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN is_synced INTEGER DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN created_by VARCHAR REFERENCES users(id); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN order_title VARCHAR(200); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN discount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN discount_type discount_type DEFAULT 'valor'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN service_charge DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN payment_status payment_status NOT NULL DEFAULT 'nao_pago'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN change_amount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN service_name VARCHAR(200); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN packaging_fee DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN table_session_id VARCHAR REFERENCES table_sessions(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN guest_id VARCHAR REFERENCES table_guests(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN refund_amount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN cancellation_reason TEXT; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMP; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN cancelled_by VARCHAR REFERENCES users(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN closed_by VARCHAR REFERENCES users(id); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE customer_tier AS ENUM ('bronze', 'prata', 'ouro', 'platina'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL,
        name VARCHAR(200) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        cpf VARCHAR(14),
        birth_date TIMESTAMP,
        address TEXT,
        loyalty_points INTEGER NOT NULL DEFAULT 0,
        tier customer_tier DEFAULT 'bronze',
        total_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
        visit_count INTEGER NOT NULL DEFAULT 0,
        last_visit TIMESTAMP,
        notes TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE loyalty_transaction_type AS ENUM ('ganho', 'resgate', 'expiracao', 'ajuste', 'bonus'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN customer_id VARCHAR REFERENCES customers(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL,
        code VARCHAR(50) NOT NULL,
        description TEXT,
        discount_type discount_type NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        min_order_value DECIMAL(10, 2) DEFAULT 0,
        max_discount DECIMAL(10, 2),
        valid_from TIMESTAMP NOT NULL,
        valid_until TIMESTAMP NOT NULL,
        max_uses INTEGER,
        max_uses_per_customer INTEGER DEFAULT 1,
        current_uses INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        applicable_order_types TEXT[],
        created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      const hasTimesUsed = await db.execute(sql2`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'times_used'
      `);
      if (hasTimesUsed.rows.length > 0) {
        await db.execute(sql2`ALTER TABLE coupons RENAME COLUMN times_used TO current_uses;`);
      }
      const hasUsageLimit = await db.execute(sql2`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'usage_limit'
      `);
      if (hasUsageLimit.rows.length > 0) {
        await db.execute(sql2`ALTER TABLE coupons RENAME COLUMN usage_limit TO max_uses;`);
      }
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE coupons ADD COLUMN max_uses_per_customer INTEGER DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      const hasCurrentUses = await db.execute(sql2`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'current_uses'
      `);
      if (hasCurrentUses.rows.length === 0) {
        await db.execute(sql2`ALTER TABLE coupons ADD COLUMN current_uses INTEGER NOT NULL DEFAULT 0;`);
      }
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN coupon_id VARCHAR REFERENCES coupons(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN coupon_discount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN loyalty_points_earned INTEGER DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN loyalty_points_redeemed INTEGER DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE orders ADD COLUMN loyalty_discount_amount DECIMAL(10, 2) DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        order_id VARCHAR NOT NULL REFERENCES orders(id) ON DELETE CASCADE, 
        menu_item_id VARCHAR NOT NULL REFERENCES menu_items(id), 
        quantity INTEGER NOT NULL, 
        price DECIMAL(10, 2) NOT NULL, 
        notes TEXT, 
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE order_items ADD COLUMN guest_id VARCHAR REFERENCES table_guests(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE option_group_type AS ENUM ('single', 'multiple'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS option_groups (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        menu_item_id VARCHAR NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        unit VARCHAR(50),
        type option_group_type NOT NULL DEFAULT 'single',
        is_required INTEGER NOT NULL DEFAULT 0,
        min_selections INTEGER NOT NULL DEFAULT 0,
        max_selections INTEGER NOT NULL DEFAULT 1,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE option_groups ADD COLUMN unit VARCHAR(50); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS options (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        option_group_id VARCHAR NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        price_adjustment DECIMAL(10, 2) NOT NULL DEFAULT 0,
        is_available INTEGER NOT NULL DEFAULT 1,
        is_recommended INTEGER NOT NULL DEFAULT 0,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE options ADD COLUMN is_recommended INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS order_item_options (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_item_id VARCHAR NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
        option_id VARCHAR NOT NULL REFERENCES options(id),
        option_name VARCHAR(200) NOT NULL,
        option_group_name VARCHAR(200) NOT NULL,
        price_adjustment DECIMAL(10, 2) NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, 
        subject VARCHAR(255) NOT NULL, 
        content TEXT NOT NULL, 
        sent_by VARCHAR NOT NULL, 
        is_read INTEGER NOT NULL DEFAULT 0, 
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS menu_visits (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        visit_source VARCHAR(50) NOT NULL DEFAULT 'qr_code',
        ip_address VARCHAR(50),
        user_agent TEXT,
        referrer TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS customer_reviews (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        order_id VARCHAR REFERENCES orders(id) ON DELETE SET NULL,
        customer_name VARCHAR(200),
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN
        CREATE TYPE transaction_type AS ENUM ('receita', 'despesa', 'ajuste');
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN
        ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'ajuste';
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN
        CREATE TYPE transaction_origin AS ENUM ('pdv', 'web', 'manual');
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN
        CREATE TYPE cash_register_shift_status AS ENUM ('aberto', 'fechado');
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS cash_registers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        current_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS financial_categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        type transaction_type NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        is_default INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS cash_register_shifts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        cash_register_id VARCHAR NOT NULL REFERENCES cash_registers(id) ON DELETE RESTRICT,
        opened_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        closed_by_user_id VARCHAR REFERENCES users(id) ON DELETE RESTRICT,
        status cash_register_shift_status NOT NULL DEFAULT 'aberto',
        opening_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        closing_amount_expected DECIMAL(10, 2) DEFAULT 0.00,
        closing_amount_counted DECIMAL(10, 2) DEFAULT 0.00,
        difference DECIMAL(10, 2) DEFAULT 0.00,
        total_revenues DECIMAL(10, 2) DEFAULT 0.00,
        total_expenses DECIMAL(10, 2) DEFAULT 0.00,
        opened_at TIMESTAMP DEFAULT NOW(),
        closed_at TIMESTAMP,
        notes TEXT
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS financial_transactions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        cash_register_id VARCHAR REFERENCES cash_registers(id) ON DELETE RESTRICT,
        shift_id VARCHAR REFERENCES cash_register_shifts(id) ON DELETE RESTRICT,
        category_id VARCHAR NOT NULL REFERENCES financial_categories(id) ON DELETE RESTRICT,
        recorded_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        type transaction_type NOT NULL,
        origin transaction_origin NOT NULL DEFAULT 'manual',
        description VARCHAR(500),
        payment_method payment_method NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        reference_order_id VARCHAR REFERENCES orders(id) ON DELETE SET NULL,
        occurred_at TIMESTAMP NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN origin transaction_origin NOT NULL DEFAULT 'manual'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN description VARCHAR(500); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN reference_order_id VARCHAR REFERENCES orders(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE financial_transactions ALTER COLUMN cash_register_id DROP NOT NULL; 
      EXCEPTION WHEN others THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN total_installments INTEGER DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN installment_number INTEGER DEFAULT 1; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE financial_transactions ADD COLUMN parent_transaction_id VARCHAR REFERENCES financial_transactions(id) ON DELETE CASCADE; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        category_id VARCHAR NOT NULL REFERENCES financial_categories(id) ON DELETE RESTRICT,
        transaction_id VARCHAR REFERENCES financial_transactions(id) ON DELETE RESTRICT,
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method payment_method NOT NULL,
        occurred_at TIMESTAMP NOT NULL,
        recorded_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        CREATE TYPE stock_movement_type AS ENUM ('entrada', 'saida', 'ajuste', 'transferencia'); 
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS inventory_categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS measurement_units (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        abbreviation VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS inventory_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        category_id VARCHAR REFERENCES inventory_categories(id) ON DELETE SET NULL,
        unit_id VARCHAR NOT NULL REFERENCES measurement_units(id) ON DELETE RESTRICT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        sku VARCHAR(100),
        cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        min_stock DECIMAL(10, 2) DEFAULT 0,
        max_stock DECIMAL(10, 2) DEFAULT 0,
        reorder_point DECIMAL(10, 2) DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS branch_stock (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        inventory_item_id VARCHAR NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
        quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE UNIQUE INDEX IF NOT EXISTS branch_stock_restaurant_branch_item_idx 
        ON branch_stock (restaurant_id, branch_id, inventory_item_id);`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS stock_movements (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        inventory_item_id VARCHAR NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
        movement_type stock_movement_type NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        previous_quantity DECIMAL(10, 2) NOT NULL,
        new_quantity DECIMAL(10, 2) NOT NULL,
        unit_cost DECIMAL(10, 2) DEFAULT 0,
        total_cost DECIMAL(10, 2) DEFAULT 0,
        reason TEXT,
        reference_id VARCHAR(100),
        from_branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL,
        to_branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL,
        recorded_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        menu_item_id VARCHAR NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        inventory_item_id VARCHAR NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
        quantity DECIMAL(10, 3) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE UNIQUE INDEX IF NOT EXISTS recipe_ingredients_menu_inventory_idx 
        ON recipe_ingredients (menu_item_id, inventory_item_id);`);
      await db.execute(sql2`DO $$ BEGIN 
        CREATE TYPE customer_tier AS ENUM ('bronze', 'prata', 'ouro', 'platina'); 
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        CREATE TYPE loyalty_transaction_type AS ENUM ('ganho', 'resgate', 'expiracao', 'ajuste', 'bonus'); 
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE SET NULL,
        name VARCHAR(200) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        cpf VARCHAR(14),
        birth_date TIMESTAMP,
        address TEXT,
        loyalty_points INTEGER NOT NULL DEFAULT 0,
        tier customer_tier DEFAULT 'bronze',
        total_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
        visit_count INTEGER NOT NULL DEFAULT 0,
        last_visit TIMESTAMP,
        notes TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS customers_phone_idx ON customers (restaurant_id, phone);`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS loyalty_programs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        is_active INTEGER NOT NULL DEFAULT 1,
        points_per_currency DECIMAL(10, 2) NOT NULL DEFAULT 1,
        currency_per_point DECIMAL(10, 2) NOT NULL DEFAULT 0.10,
        min_points_to_redeem INTEGER NOT NULL DEFAULT 100,
        max_points_per_order INTEGER,
        points_expiration_days INTEGER,
        birthday_bonus_points INTEGER DEFAULT 0,
        bronze_tier_min_spent DECIMAL(10, 2) DEFAULT 0,
        silver_tier_min_spent DECIMAL(10, 2) DEFAULT 5000,
        gold_tier_min_spent DECIMAL(10, 2) DEFAULT 15000,
        platinum_tier_min_spent DECIMAL(10, 2) DEFAULT 50000,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS customer_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id VARCHAR NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        otp_code VARCHAR(6),
        otp_expires_at TIMESTAMP,
        otp_attempts INTEGER NOT NULL DEFAULT 0,
        device_info TEXT,
        ip_address VARCHAR(50),
        last_active_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS customer_sessions_token_idx ON customer_sessions (token);`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS customer_sessions_customer_idx ON customer_sessions (customer_id, is_active);`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS loyalty_transactions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        customer_id VARCHAR NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        order_id VARCHAR REFERENCES orders(id) ON DELETE SET NULL,
        type loyalty_transaction_type NOT NULL,
        points INTEGER NOT NULL,
        description VARCHAR(500),
        expires_at TIMESTAMP,
        created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS loyalty_transactions_customer_idx ON loyalty_transactions (customer_id, created_at DESC);`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE coupons ADD COLUMN applicable_order_types TEXT[]; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE coupons ADD COLUMN created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      const nullValidFrom = await db.execute(sql2`
        SELECT COUNT(*) as count FROM coupons WHERE valid_from IS NULL
      `);
      const nullValidUntil = await db.execute(sql2`
        SELECT COUNT(*) as count FROM coupons WHERE valid_until IS NULL
      `);
      const nullFromCount = Number(nullValidFrom.rows[0]?.count ?? 0);
      const nullUntilCount = Number(nullValidUntil.rows[0]?.count ?? 0);
      if (nullFromCount > 0) {
        console.warn(`Warning: Found ${nullFromCount} coupons with NULL valid_from, setting to current time`);
        await db.execute(sql2`UPDATE coupons SET valid_from = NOW() WHERE valid_from IS NULL;`);
      }
      if (nullUntilCount > 0) {
        console.warn(`Warning: Found ${nullUntilCount} coupons with NULL valid_until, setting to 30 days from now`);
        await db.execute(sql2`UPDATE coupons SET valid_until = NOW() + INTERVAL '30 days' WHERE valid_until IS NULL;`);
      }
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE coupons ALTER COLUMN valid_from SET NOT NULL; 
      EXCEPTION WHEN others THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE coupons ALTER COLUMN valid_until SET NOT NULL; 
      EXCEPTION WHEN others THEN null; END $$;`);
      await db.execute(sql2`CREATE UNIQUE INDEX IF NOT EXISTS coupons_restaurant_code_idx ON coupons (restaurant_id, code);`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS coupon_usages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        coupon_id VARCHAR NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        customer_id VARCHAR REFERENCES customers(id) ON DELETE SET NULL,
        order_id VARCHAR REFERENCES orders(id) ON DELETE SET NULL,
        discount_applied DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS coupon_usages_coupon_idx ON coupon_usages (coupon_id);`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS coupon_usages_customer_idx ON coupon_usages (customer_id);`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE subscription_status AS ENUM ('trial', 'ativa', 'cancelada', 'suspensa', 'expirada'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE subscription_payment_status AS ENUM ('pendente', 'pago', 'falhado', 'cancelado'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN CREATE TYPE billing_interval AS ENUM ('mensal', 'anual'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS subscription_plans (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        price_monthly_kz DECIMAL(10, 2) NOT NULL DEFAULT 0,
        price_annual_kz DECIMAL(10, 2) NOT NULL DEFAULT 0,
        price_monthly_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
        price_annual_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
        stripe_price_id_monthly VARCHAR(255),
        stripe_price_id_annual VARCHAR(255),
        trial_days INTEGER NOT NULL DEFAULT 0,
        max_branches INTEGER NOT NULL DEFAULT 1,
        max_tables INTEGER NOT NULL DEFAULT 10,
        max_menu_items INTEGER NOT NULL DEFAULT 50,
        max_orders_per_month INTEGER NOT NULL DEFAULT 1000,
        max_users INTEGER NOT NULL DEFAULT 2,
        history_retention_days INTEGER NOT NULL DEFAULT 30,
        features JSONB,
        is_active INTEGER NOT NULL DEFAULT 1,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscription_plans ADD COLUMN stripe_price_id_monthly VARCHAR(255); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscription_plans ADD COLUMN stripe_price_id_annual VARCHAR(255); 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscription_plans ADD COLUMN max_customers INTEGER NOT NULL DEFAULT 100; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscription_plans ADD COLUMN has_loyalty_program INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscription_plans ADD COLUMN max_active_coupons INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscription_plans ADD COLUMN has_coupon_system INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscription_plans ADD COLUMN has_expense_tracking INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscription_plans ADD COLUMN max_expense_categories INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscription_plans ADD COLUMN has_inventory_module INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscription_plans ADD COLUMN max_inventory_items INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscription_plans ADD COLUMN has_stock_transfers INTEGER NOT NULL DEFAULT 0; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
        plan_id VARCHAR NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
        status subscription_status NOT NULL DEFAULT 'trial',
        billing_interval billing_interval NOT NULL DEFAULT 'mensal',
        currency VARCHAR(3) NOT NULL DEFAULT 'AOA',
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        current_period_start TIMESTAMP NOT NULL,
        current_period_end TIMESTAMP NOT NULL,
        trial_start TIMESTAMP,
        trial_end TIMESTAMP,
        canceled_at TIMESTAMP,
        cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
        auto_renew INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        ALTER TABLE subscriptions ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'AOA'; 
      EXCEPTION WHEN duplicate_column THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS subscription_payments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_id VARCHAR NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'KZ',
        status subscription_payment_status NOT NULL DEFAULT 'pendente',
        payment_method VARCHAR(100),
        stripe_payment_intent_id VARCHAR(255),
        stripe_invoice_id VARCHAR(255),
        reference_number VARCHAR(100),
        notes TEXT,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS subscription_usage (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
        subscription_id VARCHAR NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
        current_branches INTEGER NOT NULL DEFAULT 0,
        current_tables INTEGER NOT NULL DEFAULT 0,
        current_menu_items INTEGER NOT NULL DEFAULT 0,
        current_users INTEGER NOT NULL DEFAULT 0,
        orders_this_month INTEGER NOT NULL DEFAULT 0,
        last_calculated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`DO $$ BEGIN 
        CREATE TYPE notification_type AS ENUM ('new_order', 'order_status', 'order_cancelled', 'low_stock', 'new_customer', 'payment_received', 'subscription_alert', 'system'); 
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`DO $$ BEGIN 
        CREATE TYPE notification_channel AS ENUM ('in_app', 'whatsapp', 'email', 'push'); 
      EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
        user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
        type notification_type NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read INTEGER NOT NULL DEFAULT 0,
        read_at TIMESTAMP,
        channel notification_channel NOT NULL DEFAULT 'in_app',
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS idx_notifications_restaurant ON notifications (restaurant_id);`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id);`);
      await db.execute(sql2`CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (restaurant_id, is_read);`);
      await db.execute(sql2`CREATE TABLE IF NOT EXISTS notification_preferences (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
        in_app_enabled INTEGER NOT NULL DEFAULT 1,
        whatsapp_enabled INTEGER NOT NULL DEFAULT 0,
        email_enabled INTEGER NOT NULL DEFAULT 0,
        new_order_enabled INTEGER NOT NULL DEFAULT 1,
        order_status_enabled INTEGER NOT NULL DEFAULT 1,
        low_stock_enabled INTEGER NOT NULL DEFAULT 1,
        payment_enabled INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`);
      const superAdminEmail = "superadmin@nabancada.com";
      const checkSuperAdmin = await db.execute(sql2`SELECT id FROM users WHERE email = ${superAdminEmail} AND role = 'superadmin'`);
      if (checkSuperAdmin.rows.length === 0) {
        console.log("Creating initial super admin user...");
        const defaultPassword = "SuperAdmin123!";
        const hashedPassword = await hashPassword(defaultPassword);
        await db.execute(sql2`
          INSERT INTO users (email, password, first_name, last_name, role, restaurant_id)
          VALUES (${superAdminEmail}, ${hashedPassword}, 'Super', 'Admin', 'superadmin', NULL)
        `);
        console.log("Super admin user created successfully!");
        console.log("Email: superadmin@nabancada.com");
        console.log("Password: SuperAdmin123!");
        console.log("IMPORTANT: Please change this password after first login!");
      }
      const checkPlans = await db.execute(sql2`SELECT COUNT(*) as count FROM subscription_plans`);
      const planCount = parseInt(checkPlans.rows[0].count);
      if (planCount === 0) {
        console.log("Seeding subscription plans...");
        const plans = [
          {
            name: "B\xE1sico",
            slug: "basico",
            description: "Ideal para pequenos restaurantes, lanchonetes e food trucks. Inclui funcionalidades essenciais para come\xE7ar.",
            priceMonthlyKz: "15000.00",
            priceAnnualKz: "144000.00",
            priceMonthlyUsd: "18.00",
            priceAnnualUsd: "172.80",
            trialDays: 14,
            maxBranches: 1,
            maxTables: 10,
            maxMenuItems: 50,
            maxOrdersPerMonth: 500,
            maxUsers: 2,
            historyRetentionDays: 30,
            features: JSON.stringify([
              "pdv",
              "gestao_mesas",
              "menu_digital",
              "qr_code",
              "cozinha_tempo_real",
              "relatorios_basicos",
              "impressao_recibos",
              "suporte_email"
            ]),
            isActive: 1,
            displayOrder: 1
          },
          {
            name: "Profissional",
            slug: "profissional",
            description: "Ideal para restaurantes m\xE9dios e cafeterias estabelecidas. Inclui sistema de fidelidade e cupons.",
            priceMonthlyKz: "35000.00",
            priceAnnualKz: "336000.00",
            priceMonthlyUsd: "42.00",
            priceAnnualUsd: "403.20",
            trialDays: 14,
            maxBranches: 3,
            maxTables: 30,
            maxMenuItems: 150,
            maxOrdersPerMonth: 2e3,
            maxUsers: 5,
            historyRetentionDays: 90,
            features: JSON.stringify([
              "pdv",
              "gestao_mesas",
              "menu_digital",
              "qr_code",
              "cozinha_tempo_real",
              "relatorios_basicos",
              "impressao_recibos",
              "fidelidade",
              "cupons",
              "gestao_clientes",
              "delivery_takeout",
              "relatorios_avancados",
              "dashboard_analytics",
              "gestao_despesas",
              "multi_filial",
              "suporte_prioritario"
            ]),
            isActive: 1,
            displayOrder: 2
          },
          {
            name: "Empresarial",
            slug: "empresarial",
            description: "Ideal para redes de restaurantes e franquias. Funcionalidades completas e multi-filial.",
            priceMonthlyKz: "70000.00",
            priceAnnualKz: "672000.00",
            priceMonthlyUsd: "84.00",
            priceAnnualUsd: "806.40",
            trialDays: 14,
            maxBranches: 10,
            maxTables: 100,
            maxMenuItems: 999999,
            maxOrdersPerMonth: 1e4,
            maxUsers: 15,
            historyRetentionDays: 365,
            features: JSON.stringify([
              "pdv",
              "gestao_mesas",
              "menu_digital",
              "qr_code",
              "cozinha_tempo_real",
              "relatorios_basicos",
              "impressao_recibos",
              "fidelidade",
              "cupons",
              "gestao_clientes",
              "delivery_takeout",
              "relatorios_avancados",
              "dashboard_analytics",
              "gestao_despesas",
              "multi_filial",
              "inventario",
              "relatorios_financeiros",
              "api_integracoes",
              "exportacao_dados",
              "customizacao_visual",
              "multiplos_turnos",
              "suporte_whatsapp"
            ]),
            isActive: 1,
            displayOrder: 3
          },
          {
            name: "Enterprise",
            slug: "enterprise",
            description: "Solu\xE7\xE3o personalizada para grandes cadeias e grupos de restaurantes. Tudo ilimitado com suporte dedicado.",
            priceMonthlyKz: "150000.00",
            priceAnnualKz: "1440000.00",
            priceMonthlyUsd: "180.00",
            priceAnnualUsd: "1728.00",
            trialDays: 30,
            maxBranches: 999999,
            maxTables: 999999,
            maxMenuItems: 999999,
            maxOrdersPerMonth: 999999,
            maxUsers: 999999,
            historyRetentionDays: 999999,
            features: JSON.stringify([
              "tudo_ilimitado",
              "servidor_dedicado",
              "white_label",
              "integracao_personalizada",
              "treinamento_presencial",
              "sla_garantido",
              "suporte_24_7",
              "gerente_conta_dedicado"
            ]),
            isActive: 1,
            displayOrder: 4
          }
        ];
        for (const plan of plans) {
          await db.execute(sql2`
            INSERT INTO subscription_plans (
              name, slug, description,
              price_monthly_kz, price_annual_kz,
              price_monthly_usd, price_annual_usd,
              trial_days, max_branches, max_tables, max_menu_items,
              max_orders_per_month, max_users, history_retention_days,
              features, is_active, display_order
            ) VALUES (
              ${plan.name}, ${plan.slug}, ${plan.description},
              ${plan.priceMonthlyKz}, ${plan.priceAnnualKz},
              ${plan.priceMonthlyUsd}, ${plan.priceAnnualUsd},
              ${plan.trialDays}, ${plan.maxBranches}, ${plan.maxTables}, ${plan.maxMenuItems},
              ${plan.maxOrdersPerMonth}, ${plan.maxUsers}, ${plan.historyRetentionDays},
              ${plan.features}::jsonb, ${plan.isActive}, ${plan.displayOrder}
            )
          `);
        }
        console.log("\u2705 Subscription plans seeded successfully!");
        console.log("  \u{1F949} B\xE1sico: 15.000 Kz/m\xEAs");
        console.log("  \u{1F948} Profissional: 35.000 Kz/m\xEAs");
        console.log("  \u{1F947} Empresarial: 70.000 Kz/m\xEAs");
        console.log("  \u{1F48E} Enterprise: 150.000 Kz/m\xEAs");
      }
      isInitialized = true;
      console.log("Database tables ensured successfully!");
      try {
        await db.execute(sql2`
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(20);
        `);
        await db.execute(sql2`
          CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
        `);
        await db.execute(sql2`
          CREATE INDEX IF NOT EXISTS idx_orders_created_restaurant ON orders(restaurant_id, created_at DESC);
        `);
        console.log("\u2705 Migration: order_number column added successfully!");
      } catch (migrationError) {
        console.log("\u26A0\uFE0F Migration note:", migrationError instanceof Error ? migrationError.message : String(migrationError));
      }
    } catch (error) {
      console.error("Error ensuring tables exist:", error);
      initPromise2 = null;
      throw error;
    }
  })();
  return initPromise2;
}
var isInitialized, initPromise2;
var init_initDb = __esm({
  "server/initDb.ts"() {
    "use strict";
    init_db();
    init_auth();
    isInitialized = false;
    initPromise2 = null;
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  and: () => and2,
  db: () => db,
  desc: () => desc2,
  eq: () => eq2,
  menuItems: () => menuItems,
  or: () => or2,
  orderItemAuditLogs: () => orderItemAuditLogs,
  orderItems: () => orderItems,
  orders: () => orders,
  printHistory: () => printHistory,
  printerConfigurations: () => printerConfigurations,
  sql: () => sql4,
  storage: () => storage,
  tableGuests: () => tableGuests
});
import { eq, desc, sql as sql3, and, gte, or, isNull, isNotNull, inArray, ne, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { eq as eq2, and as and2, or as or2, desc as desc2, sql as sql4 } from "drizzle-orm";
function generateSlug(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_db();
    DatabaseStorage = class {
      // Restaurant operations
      async getRestaurants() {
        return await db.select().from(restaurants).orderBy(restaurants.createdAt);
      }
      async getRestaurantById(id) {
        const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
        return restaurant;
      }
      async getRestaurantByEmail(email) {
        const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.email, email));
        return restaurant;
      }
      async getRestaurantBySlug(slug) {
        const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
        return restaurant;
      }
      async updateRestaurantSlug(restaurantId, slug) {
        const [updated] = await db.update(restaurants).set({ slug, updatedAt: /* @__PURE__ */ new Date() }).where(eq(restaurants.id, restaurantId)).returning();
        return updated;
      }
      async updateRestaurantAppearance(restaurantId, data) {
        const [updated] = await db.update(restaurants).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(restaurants.id, restaurantId)).returning();
        return updated;
      }
      async createRestaurant(data) {
        const bcrypt2 = await import("bcrypt");
        const hashedPassword = await bcrypt2.hash(data.password, 10);
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
          description: data.description
        }).returning();
        const mainBranch = await this.createBranch(restaurant.id, {
          name: `${restaurant.name} - Matriz`,
          address: data.address,
          phone: data.phone,
          isActive: 1,
          isMain: 1
        });
        const [adminUser] = await db.insert(users).values({
          restaurantId: restaurant.id,
          activeBranchId: mainBranch.id,
          email: data.email,
          password: hashedPassword,
          firstName: data.name,
          role: "admin"
        }).returning();
        return { restaurant, adminUser };
      }
      async updateRestaurantStatus(id, status) {
        const [updated] = await db.update(restaurants).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(restaurants.id, id)).returning();
        return updated;
      }
      async deleteRestaurant(id) {
        await db.delete(restaurants).where(eq(restaurants.id, id));
      }
      async generateMissingSlugs() {
        const allRestaurants = await db.select().from(restaurants);
        const restaurantsWithoutSlug = allRestaurants.filter((r) => !r.slug);
        for (const restaurant of restaurantsWithoutSlug) {
          let slug = generateSlug(restaurant.name);
          let counter = 1;
          while (await this.getRestaurantBySlug(slug)) {
            slug = `${generateSlug(restaurant.name)}-${counter}`;
            counter++;
          }
          await db.update(restaurants).set({ slug, updatedAt: /* @__PURE__ */ new Date() }).where(eq(restaurants.id, restaurant.id));
          console.log(`\u2705 Generated slug "${slug}" for restaurant "${restaurant.name}"`);
        }
        if (restaurantsWithoutSlug.length > 0) {
          console.log(`\u{1F4DD} Generated ${restaurantsWithoutSlug.length} missing slug(s)`);
        }
      }
      // Branch operations
      async getBranches(restaurantId) {
        return await db.select().from(branches).where(eq(branches.restaurantId, restaurantId)).orderBy(desc(branches.isMain), branches.createdAt);
      }
      async getBranchById(id) {
        const [branch] = await db.select().from(branches).where(eq(branches.id, id));
        return branch;
      }
      async createBranch(restaurantId, data) {
        const [branch] = await db.insert(branches).values({
          restaurantId,
          name: data.name,
          address: data.address,
          phone: data.phone,
          isActive: data.isActive ?? 1,
          isMain: data.isMain ?? 0
        }).returning();
        return branch;
      }
      async updateBranch(restaurantId, id, data) {
        const existing = await this.getBranchById(id);
        if (!existing) {
          throw new Error("Branch not found");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("Unauthorized: Branch does not belong to your restaurant");
        }
        const [updated] = await db.update(branches).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(branches.id, id)).returning();
        return updated;
      }
      async deleteBranch(restaurantId, id) {
        const existing = await this.getBranchById(id);
        if (!existing) {
          throw new Error("Branch not found");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("Unauthorized: Branch does not belong to your restaurant");
        }
        if (existing.isMain === 1) {
          throw new Error("Cannot delete main branch");
        }
        await db.delete(branches).where(eq(branches.id, id));
      }
      async ensureMainBranch(restaurantId) {
        const existingBranches = await this.getBranches(restaurantId);
        const mainBranch = existingBranches.find((b) => b.isMain === 1);
        if (mainBranch) {
          return mainBranch;
        }
        const restaurant = await this.getRestaurantById(restaurantId);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        return await this.createBranch(restaurantId, {
          name: `${restaurant.name} - Matriz`,
          address: restaurant.address || void 0,
          phone: restaurant.phone || void 0,
          isActive: 1,
          isMain: 1
        });
      }
      // User operations
      async getUser(id) {
        await this.ensureTables();
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByEmail(email) {
        await this.ensureTables();
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
      }
      async createUser(userData) {
        await this.ensureTables();
        const [user] = await db.insert(users).values(userData).returning();
        return user;
      }
      async getAllUsers(restaurantId) {
        await this.ensureTables();
        if (restaurantId === null) {
          return await db.select().from(users).orderBy(users.createdAt);
        }
        return await db.select().from(users).where(eq(users.restaurantId, restaurantId)).orderBy(users.createdAt);
      }
      async deleteUser(restaurantId, id) {
        const existing = await this.getUser(id);
        if (!existing) {
          throw new Error("User not found");
        }
        if (restaurantId !== null && existing.restaurantId !== restaurantId) {
          throw new Error("Unauthorized: User does not belong to your restaurant");
        }
        await db.delete(users).where(eq(users.id, id));
      }
      async updateUser(restaurantId, id, data) {
        const existing = await this.getUser(id);
        if (!existing) {
          throw new Error("User not found");
        }
        if (restaurantId !== null) {
          if (existing.restaurantId !== restaurantId) {
            throw new Error("Unauthorized: User does not belong to your restaurant");
          }
          if (data.role === "superadmin") {
            throw new Error("Unauthorized: Cannot promote users to superadmin");
          }
        }
        const [updated] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
        return updated;
      }
      async updateUserPassword(userId, hashedPassword) {
        const [updated] = await db.update(users).set({ password: hashedPassword, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
        return updated;
      }
      async updateUserActiveBranch(userId, branchId) {
        const [updated] = await db.update(users).set({ activeBranchId: branchId, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
        return updated;
      }
      async getRestaurantAdmins(restaurantId) {
        await this.ensureTables();
        return await db.select().from(users).where(and(eq(users.restaurantId, restaurantId), eq(users.role, "admin"))).orderBy(users.createdAt);
      }
      async resetRestaurantAdminCredentials(restaurantId, userId, data) {
        await this.ensureTables();
        const existing = await this.getUser(userId);
        if (!existing) {
          throw new Error("Usu\xE1rio n\xE3o encontrado");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("Usu\xE1rio n\xE3o pertence a este restaurante");
        }
        if (existing.role !== "admin") {
          throw new Error("Apenas administradores de restaurantes podem ter credenciais resetadas");
        }
        if (data.email) {
          const existingEmailUser = await this.getUserByEmail(data.email);
          if (existingEmailUser && existingEmailUser.id !== userId) {
            throw new Error("Email j\xE1 est\xE1 em uso por outro usu\xE1rio");
          }
        }
        const updateData = { updatedAt: /* @__PURE__ */ new Date() };
        if (data.email) updateData.email = data.email;
        if (data.password) updateData.password = data.password;
        const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
        return updated;
      }
      async getUsersPaginated(restaurantId, options2) {
        await this.ensureTables();
        const { page, limit, search, role } = options2;
        const offset = (page - 1) * limit;
        const conditions = [];
        if (restaurantId !== null) {
          conditions.push(eq(users.restaurantId, restaurantId));
        }
        if (role && role !== "all") {
          conditions.push(eq(users.role, role));
        }
        if (search && search.trim()) {
          const searchTerm = `%${search.trim().toLowerCase()}%`;
          conditions.push(
            or(
              sql3`LOWER(${users.email}) LIKE ${searchTerm}`,
              sql3`LOWER(${users.firstName}) LIKE ${searchTerm}`,
              sql3`LOWER(${users.lastName}) LIKE ${searchTerm}`
            )
          );
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
        const [countResult] = await db.select({ count: sql3`count(*)::int` }).from(users).where(whereClause);
        const total = countResult?.count || 0;
        const totalPages = Math.ceil(total / limit);
        const result = await db.select().from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
        return {
          users: result,
          total,
          page,
          totalPages
        };
      }
      // User audit operations
      async createUserAuditLog(log2) {
        await this.ensureTables();
        const [auditLog] = await db.insert(userAuditLogs).values(log2).returning();
        return auditLog;
      }
      async getUserAuditLogs(restaurantId, options2) {
        await this.ensureTables();
        const conditions = [];
        if (restaurantId !== null) {
          conditions.push(eq(userAuditLogs.restaurantId, restaurantId));
        }
        if (options2?.userId) {
          conditions.push(
            or(
              eq(userAuditLogs.actorId, options2.userId),
              eq(userAuditLogs.targetUserId, options2.userId)
            )
          );
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
        const queryLimit = options2?.limit || 100;
        return await db.select().from(userAuditLogs).where(whereClause).orderBy(desc(userAuditLogs.createdAt)).limit(queryLimit);
      }
      async ensureTables() {
        const { ensureTablesExist: ensureTablesExist2 } = await Promise.resolve().then(() => (init_initDb(), initDb_exports));
        await ensureTablesExist2();
      }
      // Table operations
      async getTables(restaurantId, branchId) {
        if (branchId) {
          const sharedTables = await db.select().from(tables).where(and(eq(tables.restaurantId, restaurantId), isNull(tables.branchId))).orderBy(tables.number);
          const branchTables = await db.select().from(tables).where(and(eq(tables.restaurantId, restaurantId), eq(tables.branchId, branchId))).orderBy(tables.number);
          const overriddenNumbers = new Set(branchTables.map((t) => t.number));
          const result = [
            ...branchTables,
            ...sharedTables.filter((t) => !overriddenNumbers.has(t.number))
          ];
          return result.sort((a, b) => a.number - b.number);
        }
        return await db.select().from(tables).where(eq(tables.restaurantId, restaurantId)).orderBy(tables.number);
      }
      async getTableById(id) {
        const [table] = await db.select().from(tables).where(eq(tables.id, id));
        return table;
      }
      async getTableByNumber(tableNumber) {
        const [table] = await db.select().from(tables).where(eq(tables.number, tableNumber));
        return table;
      }
      async createTable(restaurantId, branchId, table) {
        const conditions = branchId ? and(
          eq(tables.restaurantId, restaurantId),
          eq(tables.branchId, branchId),
          eq(tables.number, table.number)
        ) : and(
          eq(tables.restaurantId, restaurantId),
          eq(tables.number, table.number)
        );
        const [existingTable] = await db.select().from(tables).where(conditions);
        if (existingTable) {
          throw new Error(`J\xE1 existe uma mesa com o n\xFAmero ${table.number} nesta ${branchId ? "filial" : "unidade"}`);
        }
        const [newTable] = await db.insert(tables).values({
          restaurantId,
          branchId,
          number: table.number,
          capacity: table.capacity,
          area: table.area,
          qrCode: table.qrCode
        }).returning();
        return newTable;
      }
      async deleteTable(restaurantId, id) {
        const existing = await this.getTableById(id);
        if (!existing) {
          throw new Error("Table not found");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("Unauthorized: Table does not belong to your restaurant");
        }
        await db.delete(tables).where(eq(tables.id, id));
      }
      async updateTableOccupancy(restaurantId, id, isOccupied) {
        const existing = await this.getTableById(id);
        if (!existing) {
          throw new Error("Table not found");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("Unauthorized: Table does not belong to your restaurant");
        }
        await db.update(tables).set({ isOccupied: isOccupied ? 1 : 0 }).where(eq(tables.id, id));
      }
      async updateTableStatus(restaurantId, tableId, status, data) {
        const existing = await this.getTableById(tableId);
        if (!existing) {
          throw new Error("Table not found");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("Unauthorized: Table does not belong to your restaurant");
        }
        const updateData = {
          status,
          lastActivity: /* @__PURE__ */ new Date(),
          isOccupied: status !== "livre" ? 1 : 0
        };
        if (data?.customerName !== void 0) {
          updateData.customerName = data.customerName;
        }
        if (data?.customerCount !== void 0) {
          updateData.customerCount = data.customerCount;
        }
        const [updated] = await db.update(tables).set(updateData).where(eq(tables.id, tableId)).returning();
        return updated;
      }
      async getTablesWithOrders(restaurantId, branchId) {
        const allTables = await this.getTables(restaurantId, branchId);
        const sessionIds = allTables.filter((t) => t.currentSessionId).map((t) => t.currentSessionId);
        let guestsByTable = /* @__PURE__ */ new Map();
        if (sessionIds.length > 0) {
          const allGuests = await db.select().from(tableGuests).where(inArray(tableGuests.sessionId, sessionIds));
          for (const guest of allGuests) {
            const tableData = guestsByTable.get(guest.tableId) || { count: 0, awaitingBill: 0 };
            tableData.count++;
            if (guest.status === "aguardando_conta") {
              tableData.awaitingBill++;
            }
            guestsByTable.set(guest.tableId, tableData);
          }
        }
        const tablesWithOrders = await Promise.all(
          allTables.map(async (table) => {
            const tableOrders = await db.select().from(orders).leftJoin(orderItems, eq(orders.id, orderItems.orderId)).leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(and(
              eq(orders.tableId, table.id),
              eq(orders.restaurantId, restaurantId),
              or(
                eq(orders.status, "pendente"),
                eq(orders.status, "em_preparo"),
                eq(orders.status, "pronto")
              )
            )).orderBy(desc(orders.createdAt));
            const groupedOrders = tableOrders.reduce((acc, row) => {
              const orderId = row.orders.id;
              let order = acc.find((o) => o.id === orderId);
              if (!order) {
                order = {
                  ...row.orders,
                  orderItems: []
                };
                acc.push(order);
              }
              if (row.order_items) {
                order.orderItems.push({
                  ...row.order_items,
                  menuItem: row.menu_items
                });
              }
              return acc;
            }, []);
            const guestData = guestsByTable.get(table.id) || { count: 0, awaitingBill: 0 };
            return {
              ...table,
              orders: groupedOrders,
              guestsAwaitingBill: guestData.awaitingBill,
              guestCount: guestData.count
            };
          })
        );
        return tablesWithOrders;
      }
      async startTableSession(restaurantId, tableId, sessionData) {
        const table = await this.getTableById(tableId);
        if (!table) {
          throw new Error("Table not found");
        }
        const [session2] = await db.insert(tableSessions).values({
          tableId,
          restaurantId,
          customerName: sessionData.customerName,
          customerCount: sessionData.customerCount,
          status: "ocupada"
        }).returning();
        await db.update(tables).set({
          status: "ocupada",
          currentSessionId: session2.id,
          customerName: sessionData.customerName,
          customerCount: sessionData.customerCount || 0,
          lastActivity: /* @__PURE__ */ new Date(),
          isOccupied: 1
        }).where(eq(tables.id, tableId));
        return session2;
      }
      async endTableSession(restaurantId, tableId) {
        const table = await this.getTableById(tableId);
        if (!table || !table.currentSessionId) {
          throw new Error("No active session found");
        }
        await db.update(tableSessions).set({
          status: "encerrada",
          endedAt: /* @__PURE__ */ new Date()
        }).where(eq(tableSessions.id, table.currentSessionId));
        await db.update(tables).set({
          status: "livre",
          currentSessionId: null,
          totalAmount: "0",
          customerName: null,
          customerCount: 0,
          lastActivity: /* @__PURE__ */ new Date(),
          isOccupied: 0
        }).where(eq(tables.id, tableId));
      }
      async addTablePayment(restaurantId, payment) {
        const table = await this.getTableById(payment.tableId);
        if (!table) {
          throw new Error("Table not found");
        }
        const [newPayment] = await db.insert(tablePayments).values({
          ...payment,
          restaurantId
        }).returning();
        if (table.currentSessionId) {
          const session2 = await db.select().from(tableSessions).where(eq(tableSessions.id, table.currentSessionId)).limit(1);
          if (session2.length > 0) {
            const currentPaid = parseFloat(session2[0].paidAmount || "0");
            const newPaid = currentPaid + parseFloat(payment.amount);
            await db.update(tableSessions).set({ paidAmount: newPaid.toFixed(2) }).where(eq(tableSessions.id, table.currentSessionId));
          }
        }
        return newPayment;
      }
      async getTableSessions(restaurantId, tableId) {
        let query = db.select().from(tableSessions).where(eq(tableSessions.restaurantId, restaurantId));
        if (tableId) {
          query = query.where(and(
            eq(tableSessions.restaurantId, restaurantId),
            eq(tableSessions.tableId, tableId)
          ));
        }
        return await query.orderBy(desc(tableSessions.startedAt));
      }
      async getTablePayments(restaurantId, tableId, sessionId) {
        const conditions = [eq(tablePayments.restaurantId, restaurantId)];
        if (tableId) {
          conditions.push(eq(tablePayments.tableId, tableId));
        }
        if (sessionId) {
          conditions.push(eq(tablePayments.sessionId, sessionId));
        }
        return await db.select().from(tablePayments).where(and(...conditions)).orderBy(desc(tablePayments.createdAt));
      }
      async calculateTableTotal(restaurantId, tableId) {
        const tableOrders = await db.select().from(orders).where(and(
          eq(orders.tableId, tableId),
          eq(orders.restaurantId, restaurantId),
          or(
            eq(orders.status, "pendente"),
            eq(orders.status, "em_preparo"),
            eq(orders.status, "pronto")
          )
        ));
        const total = tableOrders.reduce((sum, order) => {
          return sum + parseFloat(order.totalAmount || "0");
        }, 0);
        await db.update(tables).set({ totalAmount: total.toFixed(2) }).where(eq(tables.id, tableId));
        if (tableOrders.length > 0) {
          const table = await this.getTableById(tableId);
          if (table?.currentSessionId) {
            await db.update(tableSessions).set({ totalAmount: total.toFixed(2) }).where(eq(tableSessions.id, table.currentSessionId));
          }
        }
        return total;
      }
      // Category operations
      async getCategories(restaurantId, branchId) {
        if (branchId) {
          return await db.select().from(categories).where(
            and(
              eq(categories.restaurantId, restaurantId),
              or(
                isNull(categories.branchId),
                eq(categories.branchId, branchId)
              )
            )
          ).orderBy(categories.displayOrder, categories.name);
        }
        return await db.select().from(categories).where(eq(categories.restaurantId, restaurantId)).orderBy(categories.displayOrder, categories.name);
      }
      async getCategoryById(id) {
        const [category] = await db.select().from(categories).where(eq(categories.id, id));
        return category;
      }
      async createCategory(restaurantId, branchId, category) {
        const [newCategory] = await db.insert(categories).values({
          restaurantId,
          branchId,
          ...category
        }).returning();
        return newCategory;
      }
      async updateCategory(restaurantId, id, data) {
        const existing = await this.getCategoryById(id);
        if (!existing) {
          throw new Error("Category not found");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("Unauthorized: Category does not belong to your restaurant");
        }
        const [updated] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
        return updated;
      }
      async deleteCategory(restaurantId, id) {
        const existing = await this.getCategoryById(id);
        if (!existing) {
          throw new Error("Category not found");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("Unauthorized: Category does not belong to your restaurant");
        }
        await db.delete(categories).where(eq(categories.id, id));
      }
      // Menu item operations
      async getMenuItems(restaurantId, branchId) {
        let results;
        if (branchId) {
          results = await db.select().from(menuItems).leftJoin(categories, eq(menuItems.categoryId, categories.id)).where(
            and(
              eq(menuItems.restaurantId, restaurantId),
              or(
                isNull(menuItems.branchId),
                eq(menuItems.branchId, branchId)
              )
            )
          ).orderBy(categories.displayOrder, categories.name, menuItems.displayOrder, menuItems.name);
        } else {
          results = await db.select().from(menuItems).leftJoin(categories, eq(menuItems.categoryId, categories.id)).where(eq(menuItems.restaurantId, restaurantId)).orderBy(categories.displayOrder, categories.name, menuItems.displayOrder, menuItems.name);
        }
        const items = results.map((row) => ({
          ...row.menu_items,
          category: row.categories || {
            id: "",
            restaurantId: row.menu_items.restaurantId,
            branchId: null,
            name: "Sem Categoria",
            description: null,
            displayOrder: 0,
            isActive: true
          }
        }));
        const itemsWithOptions = await Promise.all(
          items.map(async (item) => {
            const optionGroups2 = await this.getOptionGroupsByMenuItem(item.id);
            return {
              ...item,
              optionGroups: optionGroups2.length > 0 ? optionGroups2 : void 0
            };
          })
        );
        return itemsWithOptions;
      }
      async getMenuItemById(id) {
        const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
        return item;
      }
      async createMenuItem(restaurantId, branchId, item) {
        const [newItem] = await db.insert(menuItems).values({
          restaurantId,
          branchId,
          ...item
        }).returning();
        return newItem;
      }
      async updateMenuItem(restaurantId, id, item) {
        const existing = await this.getMenuItemById(id);
        if (!existing) {
          throw new Error("Menu item not found");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("Unauthorized: Menu item does not belong to your restaurant");
        }
        const [updated] = await db.update(menuItems).set(item).where(eq(menuItems.id, id)).returning();
        return updated;
      }
      async deleteMenuItem(restaurantId, id) {
        const existing = await this.getMenuItemById(id);
        if (!existing) {
          throw new Error("Menu item not found");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("Unauthorized: Menu item does not belong to your restaurant");
        }
        await db.delete(menuItems).where(eq(menuItems.id, id));
      }
      async reorderCategories(restaurantId, orderedIds) {
        for (let i = 0; i < orderedIds.length; i++) {
          const categoryId = orderedIds[i];
          const category = await this.getCategoryById(categoryId);
          if (category && category.restaurantId === restaurantId) {
            await db.update(categories).set({ displayOrder: i }).where(eq(categories.id, categoryId));
          }
        }
      }
      async reorderMenuItems(restaurantId, categoryId, orderedIds) {
        for (let i = 0; i < orderedIds.length; i++) {
          const itemId = orderedIds[i];
          const item = await this.getMenuItemById(itemId);
          if (item && item.restaurantId === restaurantId && item.categoryId === categoryId) {
            await db.update(menuItems).set({ displayOrder: i }).where(eq(menuItems.id, itemId));
          }
        }
      }
      // Order operations
      async getKitchenOrders(restaurantId, branchId) {
        let allOrders;
        if (branchId) {
          const branchTables = await this.getTables(restaurantId, branchId);
          const tableIds = branchTables.map((t) => t.id);
          const branchCondition = or(eq(orders.branchId, branchId), isNull(orders.branchId));
          const tableCondition = tableIds.length > 0 ? or(inArray(orders.tableId, tableIds), isNull(orders.tableId)) : sql3`true`;
          allOrders = await db.select().from(orders).leftJoin(customers, eq(orders.customerId, customers.id)).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            branchCondition,
            // CRÍTICO: Garante isolamento de filial
            tableCondition
          )).orderBy(desc(orders.createdAt));
        } else {
          allOrders = await db.select().from(orders).leftJoin(customers, eq(orders.customerId, customers.id)).leftJoin(tables, eq(orders.tableId, tables.id)).where(eq(orders.restaurantId, restaurantId)).orderBy(desc(orders.createdAt));
        }
        const ordersWithItems = await Promise.all(
          allOrders.map(async (orderRow) => {
            const items = await db.select().from(orderItems).leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(eq(orderItems.orderId, orderRow.orders.id));
            const itemsWithOptions = await Promise.all(
              items.map(async (item) => {
                const options2 = await db.select().from(orderItemOptions).where(eq(orderItemOptions.orderItemId, item.order_items.id));
                return {
                  ...item.order_items,
                  menuItem: item.menu_items,
                  options: options2
                };
              })
            );
            return {
              ...orderRow.orders,
              customer: orderRow.customers,
              table: orderRow.tables,
              orderItems: itemsWithOptions
            };
          })
        );
        return ordersWithItems;
      }
      async getRecentOrders(restaurantId, branchId, limit) {
        let results;
        if (branchId) {
          const branchTables = await this.getTables(restaurantId, branchId);
          const tableIds = branchTables.map((t) => t.id);
          const branchCondition = or(eq(orders.branchId, branchId), isNull(orders.branchId));
          const tableCondition = tableIds.length > 0 ? or(inArray(orders.tableId, tableIds), isNull(orders.tableId)) : sql3`true`;
          results = await db.select().from(orders).leftJoin(customers, eq(orders.customerId, customers.id)).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            branchCondition,
            // CRÍTICO: Garante isolamento de filial
            tableCondition
          )).orderBy(desc(orders.createdAt)).limit(limit);
        } else {
          results = await db.select().from(orders).leftJoin(customers, eq(orders.customerId, customers.id)).leftJoin(tables, eq(orders.tableId, tables.id)).where(eq(orders.restaurantId, restaurantId)).orderBy(desc(orders.createdAt)).limit(limit);
        }
        return results.map((row) => ({
          ...row.orders,
          customer: row.customers,
          table: row.tables ? { number: row.tables.number } : null
        }));
      }
      async getOrdersByTableId(restaurantId, tableId) {
        const table = await this.getTableById(tableId);
        if (!table) {
          throw new Error("Table not found");
        }
        if (table.restaurantId !== restaurantId) {
          throw new Error("Unauthorized: Table does not belong to your restaurant");
        }
        const tableOrders = await db.select().from(orders).where(eq(orders.tableId, tableId)).orderBy(desc(orders.createdAt));
        const ordersWithItems = await Promise.all(
          tableOrders.map(async (order) => {
            const items = await db.select().from(orderItems).leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(eq(orderItems.orderId, order.id));
            const itemsWithOptions = await Promise.all(
              items.map(async (item) => {
                const options2 = await db.select().from(orderItemOptions).where(eq(orderItemOptions.orderItemId, item.order_items.id));
                return {
                  ...item.order_items,
                  menuItem: item.menu_items,
                  options: options2
                };
              })
            );
            return {
              ...order,
              orderItems: itemsWithOptions
            };
          })
        );
        return ordersWithItems;
      }
      async searchOrders(restaurantId, searchTerm) {
        const trimmedSearch = searchTerm.trim();
        const foundOrders = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(
          and(
            eq(orders.restaurantId, restaurantId),
            or(
              eq(orders.id, trimmedSearch),
              sql3`LOWER(${orders.customerName}) LIKE LOWER(${`%${trimmedSearch}%`})`,
              sql3`${orders.customerPhone} LIKE ${`%${trimmedSearch}%`}`
            )
          )
        ).orderBy(desc(orders.createdAt)).limit(20);
        const ordersWithItems = await Promise.all(
          foundOrders.map(async (row) => {
            const items = await db.select().from(orderItems).leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(eq(orderItems.orderId, row.orders.id));
            const itemsWithOptions = await Promise.all(
              items.map(async (item) => {
                const options2 = await db.select().from(orderItemOptions).where(eq(orderItemOptions.orderItemId, item.order_items.id));
                return {
                  ...item.order_items,
                  menuItem: item.menu_items,
                  options: options2
                };
              })
            );
            return {
              ...row.orders,
              table: row.tables,
              orderItems: itemsWithOptions
            };
          })
        );
        return ordersWithItems;
      }
      async createOrder(order, items) {
        let restaurantId;
        if (order.orderType === "mesa" && order.tableId) {
          const table = await this.getTableById(order.tableId);
          if (!table) {
            throw new Error("Table not found");
          }
          restaurantId = table.restaurantId;
        } else {
          restaurantId = order.restaurantId;
        }
        if (items.length > 0) {
          const itemChecks = await Promise.all(
            items.map((item) => this.getMenuItemById(item.menuItemId))
          );
          for (const menuItem of itemChecks) {
            if (!menuItem) {
              throw new Error("Menu item not found");
            }
            if (menuItem.restaurantId !== restaurantId) {
              throw new Error("Menu items must belong to the same restaurant");
            }
          }
        }
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
        const discount = parseFloat(order.discount || "0");
        const serviceCharge = parseFloat(order.serviceCharge || "0");
        const deliveryFee = parseFloat(order.deliveryFee || "0");
        let totalAmount = subtotal;
        if (order.discountType === "percentual") {
          totalAmount -= subtotal * discount / 100;
        } else {
          totalAmount -= discount;
        }
        totalAmount += serviceCharge + deliveryFee;
        totalAmount = Math.max(0, totalAmount);
        const [newOrder] = await db.insert(orders).values({
          ...order,
          tableId: order.tableId || null,
          subtotal: subtotal.toFixed(2),
          totalAmount: totalAmount.toFixed(2)
        }).returning();
        if (items.length > 0) {
          for (const item of items) {
            const { selectedOptions, ...itemData } = item;
            const [createdItem] = await db.insert(orderItems).values({
              ...itemData,
              orderId: newOrder.id
            }).returning();
            if (selectedOptions && selectedOptions.length > 0) {
              const optionsToInsert = selectedOptions.map((opt) => ({
                orderItemId: createdItem.id,
                optionId: opt.optionId,
                optionName: opt.optionName,
                optionGroupName: opt.optionGroupName,
                priceAdjustment: opt.priceAdjustment,
                quantity: opt.quantity
              }));
              await db.insert(orderItemOptions).values(optionsToInsert);
            }
          }
        }
        if (order.orderType === "mesa" && order.tableId) {
          await this.updateTableOccupancy(restaurantId, order.tableId, true);
          await this.calculateTableTotal(restaurantId, order.tableId);
        }
        return newOrder;
      }
      async updateOrderStatus(restaurantId, id, status, userId) {
        const [orderData] = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(eq(orders.id, id));
        if (!orderData || !orderData.orders) {
          throw new Error("Order not found");
        }
        if (orderData.orders.tableId && orderData.tables) {
          if (orderData.tables.restaurantId !== restaurantId) {
            throw new Error("Unauthorized: Order does not belong to your restaurant");
          }
        } else {
          if (orderData.orders.restaurantId !== restaurantId) {
            throw new Error("Unauthorized: Order does not belong to your restaurant");
          }
        }
        const previousStatus = orderData.orders.status;
        if (status === "servido" && previousStatus !== "servido") {
          if (!userId) {
            throw new Error("User ID is required when marking order as served");
          }
          if (!orderData.orders.branchId) {
            console.log("[STOCK] Order has no branchId, skipping stock deduction");
          }
        }
        const needsStockDeduction = status === "servido" && previousStatus !== "servido" && orderData.orders.branchId && userId;
        if (needsStockDeduction) {
          return await db.transaction(async (tx) => {
            await this.deductStockForOrder(restaurantId, orderData.orders.branchId, id, userId, tx);
            const [updated] = await tx.update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
            return updated;
          });
        } else {
          const [updated] = await db.update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
          return updated;
        }
      }
      async deleteOrder(restaurantId, id) {
        const [orderData] = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(eq(orders.id, id));
        if (!orderData || !orderData.orders) {
          throw new Error("Order not found");
        }
        if (orderData.orders.tableId && orderData.tables) {
          if (orderData.tables.restaurantId !== restaurantId) {
            throw new Error("Unauthorized: Order does not belong to your restaurant");
          }
        } else {
          if (orderData.orders.restaurantId !== restaurantId) {
            throw new Error("Unauthorized: Order does not belong to your restaurant");
          }
        }
        if (orderData.orders.paymentStatus === "pago") {
          throw new Error("Cannot delete paid orders");
        }
        await db.delete(orderItemOptions).where(
          eq(
            orderItemOptions.orderItemId,
            db.select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.orderId, id))
          )
        );
        await db.delete(orderItems).where(eq(orderItems.orderId, id));
        await db.delete(orders).where(eq(orders.id, id));
        if (orderData.orders.tableId) {
          const remainingOrders = await db.select().from(orders).where(eq(orders.tableId, orderData.orders.tableId));
          if (remainingOrders.length === 0) {
            await this.updateTableOccupancy(restaurantId, orderData.orders.tableId, false);
          }
        }
      }
      async getOrderById(restaurantId, id) {
        const [orderData] = await db.select().from(orders).leftJoin(customers, eq(orders.customerId, customers.id)).leftJoin(tables, eq(orders.tableId, tables.id)).where(eq(orders.id, id));
        if (!orderData || !orderData.orders) {
          return void 0;
        }
        if (orderData.orders.tableId && orderData.tables) {
          if (orderData.tables.restaurantId !== restaurantId) {
            throw new Error("Unauthorized: Order does not belong to your restaurant");
          }
        } else {
          if (orderData.orders.restaurantId !== restaurantId) {
            throw new Error("Unauthorized: Order does not belong to your restaurant");
          }
        }
        const items = await db.select().from(orderItems).leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(eq(orderItems.orderId, id));
        const itemsWithOptions = await Promise.all(
          items.map(async (item) => {
            const options2 = await db.select().from(orderItemOptions).where(eq(orderItemOptions.orderItemId, item.order_items.id));
            return {
              ...item.order_items,
              menuItem: item.menu_items,
              options: options2
            };
          })
        );
        return {
          ...orderData.orders,
          customer: orderData.customers,
          table: orderData.tables,
          orderItems: itemsWithOptions
        };
      }
      async updateOrderMetadata(restaurantId, id, data) {
        const order = await this.getOrderById(restaurantId, id);
        if (!order) {
          throw new Error("Order not found");
        }
        if (order.orderType === "delivery" && data.deliveryAddress === "") {
          throw new Error("Delivery address is required for delivery orders");
        }
        const [updated] = await db.update(orders).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
        return updated;
      }
      async addOrderItem(restaurantId, orderId, item) {
        return db.transaction(async (tx) => {
          const [orderData] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
          if (!orderData) {
            throw new Error("Order not found");
          }
          const menuItem = await this.getMenuItemById(item.menuItemId);
          if (!menuItem) {
            throw new Error("Menu item not found");
          }
          if (menuItem.restaurantId !== restaurantId) {
            throw new Error("Menu item does not belong to your restaurant");
          }
          const { selectedOptions, ...itemData } = item;
          const [createdItem] = await tx.insert(orderItems).values({
            ...itemData,
            orderId
          }).returning();
          if (selectedOptions && selectedOptions.length > 0) {
            const optionsToInsert = selectedOptions.map((opt) => ({
              orderItemId: createdItem.id,
              optionId: opt.optionId,
              optionName: opt.optionName,
              optionGroupName: opt.optionGroupName,
              priceAdjustment: opt.priceAdjustment,
              quantity: opt.quantity
            }));
            await tx.insert(orderItemOptions).values(optionsToInsert);
          }
          await this.calculateOrderTotal(orderId);
          return createdItem;
        });
      }
      async updateOrderItemQuantity(restaurantId, orderId, itemId, quantity) {
        return db.transaction(async (tx) => {
          const [orderData] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
          if (!orderData) {
            throw new Error("Order not found");
          }
          if (quantity < 1) {
            throw new Error("Quantity must be at least 1");
          }
          const [updated] = await tx.update(orderItems).set({ quantity }).where(and(eq(orderItems.id, itemId), eq(orderItems.orderId, orderId))).returning();
          if (!updated) {
            throw new Error("Order item not found");
          }
          await this.calculateOrderTotal(orderId);
          return updated;
        });
      }
      async removeOrderItem(restaurantId, orderId, itemId) {
        return db.transaction(async (tx) => {
          const [orderData] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
          if (!orderData) {
            throw new Error("Order not found");
          }
          await tx.delete(orderItems).where(and(eq(orderItems.id, itemId), eq(orderItems.orderId, orderId)));
          const remainingItems = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
          if (remainingItems.length === 0 && orderData.orderType === "mesa" && orderData.tableId) {
            await this.updateTableOccupancy(orderData.restaurantId, orderData.tableId, false);
          }
          await this.calculateOrderTotal(orderId);
        });
      }
      async applyDiscount(restaurantId, orderId, discount, discountType) {
        const order = await this.getOrderById(restaurantId, orderId);
        if (!order) {
          throw new Error("Order not found");
        }
        const discountValue = parseFloat(discount);
        if (discountValue < 0) {
          throw new Error("Discount cannot be negative");
        }
        const subtotal = parseFloat(order.subtotal || "0");
        if (discountType === "percentual" && discountValue > 100) {
          throw new Error("Discount percentage cannot exceed 100%");
        }
        if (discountType === "valor" && discountValue > subtotal) {
          throw new Error("Discount value cannot exceed order subtotal");
        }
        const [updated] = await db.update(orders).set({
          discount,
          discountType,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(orders.id, orderId)).returning();
        return this.calculateOrderTotal(orderId);
      }
      async applyServiceCharge(restaurantId, orderId, serviceCharge, serviceName) {
        const order = await this.getOrderById(restaurantId, orderId);
        if (!order) {
          throw new Error("Order not found");
        }
        const chargeValue = parseFloat(serviceCharge);
        if (chargeValue < 0) {
          throw new Error("Service charge cannot be negative");
        }
        const [updated] = await db.update(orders).set({
          serviceCharge,
          serviceName: serviceName || null,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(orders.id, orderId)).returning();
        return this.calculateOrderTotal(orderId);
      }
      async applyDeliveryFee(restaurantId, orderId, deliveryFee) {
        const order = await this.getOrderById(restaurantId, orderId);
        if (!order) {
          throw new Error("Order not found");
        }
        if (order.orderType !== "delivery") {
          throw new Error("Delivery fee can only be applied to delivery orders");
        }
        const feeValue = parseFloat(deliveryFee);
        if (feeValue < 0) {
          throw new Error("Delivery fee cannot be negative");
        }
        const [updated] = await db.update(orders).set({
          deliveryFee,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(orders.id, orderId)).returning();
        return this.calculateOrderTotal(orderId);
      }
      async applyPackagingFee(restaurantId, orderId, packagingFee) {
        const order = await this.getOrderById(restaurantId, orderId);
        if (!order) {
          throw new Error("Order not found");
        }
        const feeValue = parseFloat(packagingFee);
        if (feeValue < 0) {
          throw new Error("Packaging fee cannot be negative");
        }
        const [updated] = await db.update(orders).set({
          packagingFee,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(orders.id, orderId)).returning();
        return this.calculateOrderTotal(orderId);
      }
      async recordPayment(restaurantId, orderId, data, userId) {
        const order = await this.getOrderById(restaurantId, orderId);
        if (!order) {
          throw new Error("Order not found");
        }
        const paymentAmount = parseFloat(data.amount);
        if (paymentAmount <= 0) {
          throw new Error("Payment amount must be greater than zero");
        }
        const currentPaid = parseFloat(order.paidAmount || "0");
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
        let paymentStatus = "nao_pago";
        const tolerance = 0.01;
        if (newPaidAmount < tolerance) {
          paymentStatus = "nao_pago";
        } else if (newPaidAmount < total - tolerance) {
          paymentStatus = "parcial";
        } else {
          paymentStatus = "pago";
        }
        return await db.transaction(async (tx) => {
          const [lockedOrder] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
          if (!lockedOrder) {
            throw new Error("Order not found");
          }
          const [updated] = await tx.update(orders).set({
            paidAmount: newPaidAmount.toFixed(2),
            changeAmount: Math.max(0, changeAmount).toFixed(2),
            paymentStatus,
            paymentMethod: data.paymentMethod,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(orders.id, orderId)).returning();
          if (userId) {
            const saleCategoryResults = await tx.select().from(financialCategories).where(and(
              eq(financialCategories.restaurantId, restaurantId),
              eq(financialCategories.type, "receita"),
              eq(financialCategories.name, "Vendas PDV")
            )).limit(1);
            let categoryId = saleCategoryResults[0]?.id;
            if (!categoryId) {
              const [category] = await tx.insert(financialCategories).values({
                restaurantId,
                branchId: order.branchId || null,
                type: "receita",
                name: "Vendas PDV",
                description: "Receita de vendas atrav\xE9s do PDV",
                isDefault: 1
              }).returning();
              categoryId = category.id;
            }
            let cashRegisterId = null;
            let shiftId = null;
            if (data.paymentMethod === "dinheiro") {
              const activeCashRegisters = await this.getCashRegistersWithActiveShift(restaurantId, order.branchId || null);
              if (activeCashRegisters.length > 0) {
                const cashRegister = activeCashRegisters[0];
                const activeShift = await this.getActiveCashRegisterShift(cashRegister.id, restaurantId);
                if (activeShift && cashRegister) {
                  cashRegisterId = cashRegister.id;
                  shiftId = activeShift.id;
                  await tx.update(cashRegisters).set({
                    currentBalance: sql3`${cashRegisters.currentBalance} + ${parseFloat(data.amount)}`,
                    updatedAt: /* @__PURE__ */ new Date()
                  }).where(eq(cashRegisters.id, cashRegister.id));
                }
              }
            }
            await tx.insert(financialTransactions).values({
              restaurantId,
              recordedByUserId: userId,
              branchId: order.branchId || null,
              cashRegisterId,
              shiftId,
              categoryId,
              type: "receita",
              origin: order.orderType === "pdv" || order.orderType === "balcao" ? "pdv" : "web",
              description: `Venda - Pedido #${orderId.substring(0, 8)}`,
              paymentMethod: data.paymentMethod,
              amount: data.amount,
              referenceOrderId: orderId,
              occurredAt: /* @__PURE__ */ new Date(),
              note: order.orderNotes || null
            });
          }
          if (paymentStatus === "pago" && updated.customerId) {
            const orderTotal = Number(updated.totalAmount ?? 0);
            const [customer] = await tx.select().from(customers).where(eq(customers.id, updated.customerId));
            if (customer) {
              const currentTotalSpent = Number(customer.totalSpent ?? 0);
              const currentVisitCount = Number(customer.visitCount ?? 0);
              const newTotalSpent = currentTotalSpent + orderTotal;
              const newVisitCount = currentVisitCount + 1;
              const customerUpdate = {
                totalSpent: newTotalSpent.toFixed(2),
                visitCount: newVisitCount,
                lastVisit: /* @__PURE__ */ new Date(),
                updatedAt: /* @__PURE__ */ new Date()
              };
              const activeLoyaltyPrograms = await tx.select().from(loyaltyPrograms).where(and(
                eq(loyaltyPrograms.restaurantId, restaurantId),
                eq(loyaltyPrograms.isActive, 1)
              )).limit(1);
              let pointsEarned = 0;
              if (activeLoyaltyPrograms.length > 0 && !lockedOrder.loyaltyPointsEarned) {
                const program = activeLoyaltyPrograms[0];
                const pointsPerCurrency = Number(program.pointsPerCurrency ?? 1);
                pointsEarned = Math.floor(orderTotal * pointsPerCurrency);
                if (program.maxPointsPerOrder && pointsEarned > program.maxPointsPerOrder) {
                  pointsEarned = program.maxPointsPerOrder;
                }
                if (pointsEarned > 0) {
                  await tx.insert(loyaltyTransactions).values({
                    restaurantId,
                    customerId: updated.customerId,
                    orderId: updated.id,
                    type: "ganho",
                    points: pointsEarned,
                    description: `Pontos ganhos em compra de ${orderTotal.toFixed(2)} Kz`,
                    createdBy: userId || null
                  });
                  const currentPoints = Number(customer.loyaltyPoints ?? 0);
                  const newPoints = currentPoints + pointsEarned;
                  customerUpdate.loyaltyPoints = newPoints;
                  let newTier = "bronze";
                  const platinumMin = Number(program.platinumTierMinSpent ?? 5e4);
                  const goldMin = Number(program.goldTierMinSpent ?? 15e3);
                  const silverMin = Number(program.silverTierMinSpent ?? 5e3);
                  if (newTotalSpent >= platinumMin) {
                    newTier = "platina";
                  } else if (newTotalSpent >= goldMin) {
                    newTier = "ouro";
                  } else if (newTotalSpent >= silverMin) {
                    newTier = "prata";
                  }
                  customerUpdate.tier = newTier;
                  await tx.update(orders).set({
                    loyaltyPointsEarned: pointsEarned,
                    updatedAt: /* @__PURE__ */ new Date()
                  }).where(eq(orders.id, orderId));
                }
              }
              await tx.update(customers).set(customerUpdate).where(eq(customers.id, updated.customerId));
            }
          }
          return updated;
        });
      }
      async calculateOrderTotal(orderId) {
        const [result] = await db.select({
          subtotal: sql3`
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
        }).from(orderItems).where(eq(orderItems.orderId, orderId));
        const subtotal = parseFloat(result?.subtotal || "0");
        const [currentOrder] = await db.select().from(orders).where(eq(orders.id, orderId));
        if (!currentOrder) {
          throw new Error("Order not found");
        }
        let total = subtotal;
        if (currentOrder.discountType === "percentual") {
          const discountPercent = Math.min(parseFloat(currentOrder.discount || "0"), 100);
          const discountAmount = subtotal * discountPercent / 100;
          total -= discountAmount;
        } else {
          const discountValue = parseFloat(currentOrder.discount || "0");
          total -= Math.min(discountValue, subtotal);
        }
        total = Math.max(0, total);
        total -= parseFloat(currentOrder.couponDiscount || "0");
        total -= parseFloat(currentOrder.loyaltyDiscountAmount || "0");
        total = Math.max(0, total);
        total += parseFloat(currentOrder.serviceCharge || "0");
        total += parseFloat(currentOrder.deliveryFee || "0");
        total += parseFloat(currentOrder.packagingFee || "0");
        total = Math.round(total * 100) / 100;
        const [updated] = await db.update(orders).set({
          subtotal: subtotal.toFixed(2),
          totalAmount: total.toFixed(2),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(orders.id, orderId)).returning();
        return updated;
      }
      async cancelOrder(restaurantId, orderId, cancellationReason, userId) {
        return await db.transaction(async (tx) => {
          const [order] = await tx.select().from(orders).where(and(
            eq(orders.id, orderId),
            eq(orders.restaurantId, restaurantId)
          )).for("update");
          if (!order) {
            throw new Error("Pedido n\xE3o encontrado");
          }
          if (order.status === "cancelado" || order.cancellationReason && order.cancellationReason !== "") {
            throw new Error("Pedido j\xE1 est\xE1 cancelado");
          }
          if (order.customerId && order.paymentStatus === "pago") {
            const [customer] = await tx.select().from(customers).where(eq(customers.id, order.customerId));
            if (customer) {
              const currentTotalSpent = Number(customer.totalSpent ?? 0);
              const currentVisitCount = Number(customer.visitCount ?? 0);
              const orderTotal = Number(order.totalAmount ?? 0);
              const newTotalSpent = Math.max(0, currentTotalSpent - orderTotal);
              const newVisitCount = Math.max(0, currentVisitCount - 1);
              const customerUpdate = {
                totalSpent: newTotalSpent.toFixed(2),
                visitCount: newVisitCount,
                updatedAt: /* @__PURE__ */ new Date()
              };
              const pointsEarned = order.loyaltyPointsEarned || 0;
              const pointsRedeemed = order.loyaltyPointsRedeemed || 0;
              if (pointsEarned > 0 || pointsRedeemed > 0) {
                const currentPoints = Number(customer.loyaltyPoints ?? 0);
                const pointsAdjustment = -pointsEarned + pointsRedeemed;
                const newPoints = Math.max(0, currentPoints + pointsAdjustment);
                customerUpdate.loyaltyPoints = newPoints;
                const loyaltyProgram = await this.getLoyaltyProgram(restaurantId);
                let newTier = "bronze";
                if (loyaltyProgram) {
                  const platinumMin = Number(loyaltyProgram.platinumTierMinSpent ?? 5e4);
                  const goldMin = Number(loyaltyProgram.goldTierMinSpent ?? 15e3);
                  const silverMin = Number(loyaltyProgram.silverTierMinSpent ?? 5e3);
                  if (newTotalSpent >= platinumMin) {
                    newTier = "platina";
                  } else if (newTotalSpent >= goldMin) {
                    newTier = "ouro";
                  } else if (newTotalSpent >= silverMin) {
                    newTier = "prata";
                  }
                }
                customerUpdate.tier = newTier;
                if (pointsEarned > 0) {
                  await tx.insert(loyaltyTransactions).values({
                    restaurantId,
                    customerId: order.customerId,
                    orderId: order.id,
                    type: "ajuste",
                    points: -pointsEarned,
                    description: `Estorno de pontos ganhos - Pedido #${order.id.substring(0, 8)} cancelado: ${cancellationReason}`,
                    createdBy: userId || null
                  });
                }
                if (pointsRedeemed > 0) {
                  await tx.insert(loyaltyTransactions).values({
                    restaurantId,
                    customerId: order.customerId,
                    orderId: order.id,
                    type: "ajuste",
                    points: pointsRedeemed,
                    description: `Devolu\xE7\xE3o de pontos resgatados - Pedido #${order.id.substring(0, 8)} cancelado: ${cancellationReason}`,
                    createdBy: userId || null
                  });
                }
              }
              await tx.update(customers).set(customerUpdate).where(eq(customers.id, order.customerId));
            }
          }
          const paidAmount = parseFloat(order.paidAmount || "0");
          if (paidAmount > 0 && userId) {
            let refundCategoryResults = await tx.select().from(financialCategories).where(and(
              eq(financialCategories.restaurantId, restaurantId),
              eq(financialCategories.type, "despesa"),
              eq(financialCategories.name, "Estornos e Reembolsos")
            )).limit(1);
            let refundCategoryId = refundCategoryResults[0]?.id;
            if (!refundCategoryId) {
              const [category] = await tx.insert(financialCategories).values({
                restaurantId,
                branchId: order.branchId || null,
                type: "despesa",
                name: "Estornos e Reembolsos",
                description: "Estornos de pedidos cancelados",
                isDefault: 0
              }).returning();
              refundCategoryId = category.id;
            }
            let cashRegisterId = null;
            let shiftId = null;
            if (order.paymentMethod === "dinheiro") {
              const activeCashRegisters = await this.getCashRegistersWithActiveShift(restaurantId, order.branchId || null);
              if (activeCashRegisters.length > 0) {
                const cashRegister = activeCashRegisters[0];
                const activeShift = await this.getActiveCashRegisterShift(cashRegister.id, restaurantId);
                if (activeShift && cashRegister) {
                  cashRegisterId = cashRegister.id;
                  shiftId = activeShift.id;
                  await tx.update(cashRegisters).set({
                    currentBalance: sql3`${cashRegisters.currentBalance} - ${paidAmount}`,
                    updatedAt: /* @__PURE__ */ new Date()
                  }).where(eq(cashRegisters.id, cashRegister.id));
                }
              }
            }
            await tx.insert(financialTransactions).values({
              restaurantId,
              recordedByUserId: userId,
              branchId: order.branchId || null,
              cashRegisterId,
              shiftId,
              categoryId: refundCategoryId,
              type: "despesa",
              origin: order.orderType === "pdv" || order.orderType === "balcao" ? "pdv" : "web",
              description: `Estorno - Pedido #${orderId.substring(0, 8)} cancelado: ${cancellationReason}`,
              paymentMethod: order.paymentMethod || "dinheiro",
              amount: paidAmount.toFixed(2),
              referenceOrderId: orderId,
              occurredAt: /* @__PURE__ */ new Date(),
              note: `Cancelamento: ${cancellationReason}`
            });
          }
          if (order.status === "servido" && order.branchId && userId) {
            const orderItemsWithMenu = await tx.select().from(orderItems).leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(eq(orderItems.orderId, orderId));
            const orderWithItems = {
              ...order,
              orderItems: orderItemsWithMenu.map((item) => ({
                ...item.order_items,
                menuItem: item.menu_items
              }))
            };
            await this.restoreStockForOrder(restaurantId, order.branchId, orderWithItems, userId, tx);
          }
          const [cancelledOrder] = await tx.update(orders).set({
            status: "cancelado",
            cancellationReason,
            cancelledAt: /* @__PURE__ */ new Date(),
            cancelledBy: userId || null,
            refundAmount: paidAmount.toFixed(2),
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(orders.id, orderId)).returning();
          return cancelledOrder;
        });
      }
      // Stats operations
      async getTodayStats(restaurantId, branchId) {
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        let todayStatsQuery;
        if (branchId) {
          todayStatsQuery = await db.select({
            completedOrders: sql3`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
            completedRevenue: sql3`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
            cancelledOrders: sql3`cast(count(*) filter (where ${orders.status} = 'cancelado') as int)`,
            cancelledRevenue: sql3`cast(coalesce(sum(case when (${orders.status} = 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`
          }).from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), isNull(orders.tableId)),
            gte(orders.createdAt, today)
          ));
        } else {
          todayStatsQuery = await db.select({
            completedOrders: sql3`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
            completedRevenue: sql3`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
            cancelledOrders: sql3`cast(count(*) filter (where ${orders.status} = 'cancelado') as int)`,
            cancelledRevenue: sql3`cast(coalesce(sum(case when (${orders.status} = 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`
          }).from(orders).where(and(
            eq(orders.restaurantId, restaurantId),
            gte(orders.createdAt, today)
          ));
        }
        const todayStats = todayStatsQuery[0] || { completedOrders: 0, completedRevenue: "0", cancelledOrders: 0, cancelledRevenue: "0" };
        const todayOrders = todayStats.completedOrders;
        const todaySales = parseFloat(todayStats.completedRevenue) || 0;
        const todayCancelledOrders = todayStats.cancelledOrders;
        const todayCancelledRevenue = parseFloat(todayStats.cancelledRevenue) || 0;
        let yesterdayStatsQuery;
        if (branchId) {
          yesterdayStatsQuery = await db.select({
            completedOrders: sql3`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
            completedRevenue: sql3`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`
          }).from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), isNull(orders.tableId)),
            gte(orders.createdAt, yesterday),
            sql3`${orders.createdAt} < ${today}`
          ));
        } else {
          yesterdayStatsQuery = await db.select({
            completedOrders: sql3`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
            completedRevenue: sql3`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`
          }).from(orders).where(and(
            eq(orders.restaurantId, restaurantId),
            gte(orders.createdAt, yesterday),
            sql3`${orders.createdAt} < ${today}`
          ));
        }
        const yesterdayStats = yesterdayStatsQuery[0] || { completedOrders: 0, completedRevenue: "0" };
        const yesterdayOrders = yesterdayStats.completedOrders;
        const yesterdaySales = parseFloat(yesterdayStats.completedRevenue) || 0;
        const todaySalesNum = Number(todaySales) || 0;
        const yesterdaySalesNum = Number(yesterdaySales) || 0;
        const salesChange = yesterdaySalesNum > 0 ? (todaySalesNum - yesterdaySalesNum) / yesterdaySalesNum * 100 : todaySalesNum > 0 ? 100 : 0;
        const ordersChange = yesterdayOrders > 0 ? (todayOrders - yesterdayOrders) / yesterdayOrders * 100 : todayOrders > 0 ? 100 : 0;
        let activeTables;
        if (branchId) {
          activeTables = await db.select().from(tables).where(and(
            eq(tables.restaurantId, restaurantId),
            eq(tables.branchId, branchId),
            eq(tables.isOccupied, 1)
          ));
        } else {
          activeTables = await db.select().from(tables).where(and(
            eq(tables.restaurantId, restaurantId),
            eq(tables.isOccupied, 1)
          ));
        }
        const totalOrdersIncludingCancelled = todayOrders + todayCancelledOrders;
        const cancellationRate = totalOrdersIncludingCancelled > 0 ? todayCancelledOrders / totalOrdersIncludingCancelled * 100 : 0;
        let todayOrderIdsQuery;
        if (branchId) {
          todayOrderIdsQuery = await db.select({ id: orders.id }).from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), isNull(orders.tableId)),
            sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, today)
          ));
        } else {
          todayOrderIdsQuery = await db.select({ id: orders.id }).from(orders).where(and(
            eq(orders.restaurantId, restaurantId),
            sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, today)
          ));
        }
        const todayOrderIds = todayOrderIdsQuery.map((row) => row.id);
        let topDishes = [];
        if (todayOrderIds.length > 0) {
          const dishStats = await db.select({
            menuItemId: orderItems.menuItemId,
            count: sql3`cast(sum(${orderItems.quantity}) as int)`,
            revenue: sql3`cast(sum(${orderItems.quantity} * ${orderItems.price}) as text)`
          }).from(orderItems).where(sql3`${orderItems.orderId} = ANY(ARRAY[${sql3.join(todayOrderIds.map((id) => sql3`${id}`), sql3`, `)}])`).groupBy(orderItems.menuItemId).orderBy(desc(sql3`sum(${orderItems.quantity})`)).limit(5);
          topDishes = await Promise.all(
            dishStats.map(async (stat) => {
              const item = await this.getMenuItemById(stat.menuItemId);
              return {
                menuItem: item,
                count: stat.count,
                totalRevenue: parseFloat(stat.revenue).toFixed(2)
              };
            })
          );
        }
        return {
          todaySales: todaySales.toFixed(2),
          todayOrders,
          activeTables: activeTables.length,
          yesterdaySales: yesterdaySales.toFixed(2),
          yesterdayOrders,
          salesChange: isNaN(salesChange) ? 0 : Math.round(salesChange * 10) / 10,
          ordersChange: isNaN(ordersChange) ? 0 : Math.round(ordersChange * 10) / 10,
          cancelledOrders: todayCancelledOrders,
          cancelledRevenue: todayCancelledRevenue.toFixed(2),
          cancellationRate: isNaN(cancellationRate) ? 0 : Math.round(cancellationRate * 10) / 10,
          topDishes
        };
      }
      async getCustomDateRangeStats(restaurantId, branchId, startDate, endDate) {
        const periodStart = startDate;
        const periodEnd = endDate;
        let periodStatsQuery;
        if (branchId) {
          periodStatsQuery = await db.select({
            completedOrders: sql3`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
            completedRevenue: sql3`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
            cancelledOrders: sql3`cast(count(*) filter (where ${orders.status} = 'cancelado') as int)`,
            cancelledRevenue: sql3`cast(coalesce(sum(case when (${orders.status} = 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`
          }).from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), isNull(orders.tableId)),
            gte(orders.createdAt, periodStart),
            sql3`${orders.createdAt} <= ${periodEnd}`
          ));
        } else {
          periodStatsQuery = await db.select({
            completedOrders: sql3`cast(count(*) filter (where ${orders.status} IS DISTINCT FROM 'cancelado') as int)`,
            completedRevenue: sql3`cast(coalesce(sum(case when (${orders.status} IS DISTINCT FROM 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`,
            cancelledOrders: sql3`cast(count(*) filter (where ${orders.status} = 'cancelado') as int)`,
            cancelledRevenue: sql3`cast(coalesce(sum(case when (${orders.status} = 'cancelado') AND (${orders.totalAmount} IS NOT NULL) then ${orders.totalAmount} else 0 end), 0) as text)`
          }).from(orders).where(and(
            eq(orders.restaurantId, restaurantId),
            gte(orders.createdAt, periodStart),
            sql3`${orders.createdAt} <= ${periodEnd}`
          ));
        }
        const periodStats = periodStatsQuery[0] || { completedOrders: 0, completedRevenue: "0", cancelledOrders: 0, cancelledRevenue: "0" };
        const totalOrders = periodStats.completedOrders;
        const totalSales = parseFloat(periodStats.completedRevenue) || 0;
        const periodCancelledOrders = periodStats.cancelledOrders;
        const periodCancelledRevenue = parseFloat(periodStats.cancelledRevenue) || 0;
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        const totalOrdersIncludingCancelled = totalOrders + periodCancelledOrders;
        const cancellationRate = totalOrdersIncludingCancelled > 0 ? periodCancelledOrders / totalOrdersIncludingCancelled * 100 : 0;
        let orderIdsQuery;
        if (branchId) {
          orderIdsQuery = await db.select({ id: orders.id }).from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), isNull(orders.tableId)),
            sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, periodStart),
            sql3`${orders.createdAt} <= ${periodEnd}`
          ));
        } else {
          orderIdsQuery = await db.select({ id: orders.id }).from(orders).where(and(
            eq(orders.restaurantId, restaurantId),
            sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, periodStart),
            sql3`${orders.createdAt} <= ${periodEnd}`
          ));
        }
        const orderIds = orderIdsQuery.map((row) => row.id);
        let topDishes = [];
        if (orderIds.length > 0) {
          const dishStats = await db.select({
            menuItemId: orderItems.menuItemId,
            count: sql3`cast(sum(${orderItems.quantity}) as int)`,
            revenue: sql3`cast(sum(${orderItems.quantity} * ${orderItems.price}) as text)`
          }).from(orderItems).where(sql3`${orderItems.orderId} = ANY(ARRAY[${sql3.join(orderIds.map((id) => sql3`${id}`), sql3`, `)}])`).groupBy(orderItems.menuItemId).orderBy(desc(sql3`sum(${orderItems.quantity})`)).limit(10);
          topDishes = await Promise.all(
            dishStats.map(async (stat) => {
              const item = await this.getMenuItemById(stat.menuItemId);
              return {
                menuItem: item,
                count: stat.count,
                totalRevenue: parseFloat(stat.revenue).toFixed(2)
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
          periodEnd
        };
      }
      async getHistoricalStats(restaurantId, branchId, days) {
        const result = [];
        const today = /* @__PURE__ */ new Date();
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
            dayOrdersData = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
              eq(orders.restaurantId, restaurantId),
              or(eq(tables.branchId, branchId), isNull(orders.tableId)),
              sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
              gte(orders.createdAt, dayStart),
              sql3`${orders.createdAt} <= ${dayEnd}`
            ));
          } else {
            dayOrdersData = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
              eq(orders.restaurantId, restaurantId),
              sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
              gte(orders.createdAt, dayStart),
              sql3`${orders.createdAt} <= ${dayEnd}`
            ));
          }
          const dayOrders = dayOrdersData.map((row) => row.orders);
          const daySales = dayOrders.reduce(
            (sum, order) => sum + parseFloat(order.totalAmount),
            0
          );
          result.push({
            date: dayStart.toISOString(),
            sales: daySales,
            orders: dayOrders.length
          });
        }
        return result;
      }
      async getSalesHeatmapData(restaurantId, branchId, days) {
        const today = /* @__PURE__ */ new Date();
        today.setHours(23, 59, 59, 999);
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        let ordersData;
        if (branchId) {
          ordersData = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), isNull(orders.tableId)),
            sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, startDate),
            sql3`${orders.createdAt} <= ${today}`
          ));
        } else {
          ordersData = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, startDate),
            sql3`${orders.createdAt} <= ${today}`
          ));
        }
        const allOrders = ordersData.map((row) => row.orders);
        const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\xE1b"];
        const heatmapMap = /* @__PURE__ */ new Map();
        for (const order of allOrders) {
          if (!order.createdAt) continue;
          const orderDate = new Date(order.createdAt);
          const dayOfWeek = orderDate.getDay();
          const hour = orderDate.getHours();
          const dayName = dayNames[dayOfWeek];
          const key = `${dayName}-${hour}`;
          heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
        }
        const result = [];
        for (const dayName of dayNames) {
          for (let hour = 0; hour < 24; hour++) {
            const key = `${dayName}-${hour}`;
            result.push({
              day: dayName,
              hour,
              value: heatmapMap.get(key) || 0
            });
          }
        }
        return result;
      }
      async getKitchenStats(restaurantId, branchId, period) {
        const periodEnd = /* @__PURE__ */ new Date();
        periodEnd.setHours(23, 59, 59, 999);
        const periodStart = /* @__PURE__ */ new Date();
        periodStart.setHours(0, 0, 0, 0);
        switch (period) {
          case "daily":
            break;
          case "weekly":
            periodStart.setDate(periodStart.getDate() - 7);
            break;
          case "monthly":
            periodStart.setMonth(periodStart.getMonth() - 1);
            break;
          case "quarterly":
            periodStart.setMonth(periodStart.getMonth() - 3);
            break;
          case "yearly":
            periodStart.setFullYear(periodStart.getFullYear() - 1);
            break;
        }
        let periodOrdersData;
        if (branchId) {
          periodOrdersData = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), isNull(orders.tableId)),
            sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, periodStart),
            sql3`${orders.createdAt} <= ${periodEnd}`
          ));
        } else {
          periodOrdersData = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, periodStart),
            sql3`${orders.createdAt} <= ${periodEnd}`
          ));
        }
        const periodOrders = periodOrdersData.map((row) => row.orders);
        const totalOrders = periodOrders.length;
        const totalRevenue = periodOrders.reduce(
          (sum, order) => sum + parseFloat(order.totalAmount),
          0
        );
        const daysInPeriod = Math.max(1, Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1e3 * 60 * 60 * 24)));
        const averageOrdersPerDay = totalOrders / daysInPeriod;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const orderIds = periodOrders.map((o) => o.id);
        let topDishes = [];
        if (orderIds.length > 0) {
          const dishStats = await db.select({
            menuItemId: orderItems.menuItemId,
            count: sql3`cast(sum(${orderItems.quantity}) as int)`,
            revenue: sql3`cast(sum(${orderItems.quantity} * ${orderItems.price}) as text)`
          }).from(orderItems).where(sql3`${orderItems.orderId} = ANY(ARRAY[${sql3.join(orderIds.map((id) => sql3`${id}`), sql3`, `)}])`).groupBy(orderItems.menuItemId).orderBy(desc(sql3`sum(${orderItems.quantity})`)).limit(10);
          topDishes = await Promise.all(
            dishStats.map(async (stat) => {
              const item = await this.getMenuItemById(stat.menuItemId);
              return {
                menuItem: item,
                count: stat.count,
                totalRevenue: parseFloat(stat.revenue).toFixed(2)
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
          periodEnd
        };
      }
      // Super admin stats
      async getSuperAdminStats() {
        const allRestaurants = await this.getRestaurants();
        const totalRestaurants = allRestaurants.length;
        const activeRestaurants = allRestaurants.filter((r) => r.status === "ativo").length;
        const pendingRestaurants = allRestaurants.filter((r) => r.status === "pendente").length;
        const suspendedRestaurants = allRestaurants.filter((r) => r.status === "suspenso").length;
        const allOrders = await db.select().from(orders).where(ne(orders.status, "cancelado"));
        const totalRevenue = allOrders.reduce(
          (sum, order) => sum + parseFloat(order.totalAmount),
          0
        );
        return {
          totalRestaurants,
          activeRestaurants,
          pendingRestaurants,
          suspendedRestaurants,
          totalRevenue: totalRevenue.toFixed(2)
        };
      }
      async getSuperAdminAnalytics() {
        const allOrders = await db.select().from(orders).where(ne(orders.status, "cancelado"));
        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
        const averageTicket = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";
        const allCustomers = await db.select().from(customers);
        const totalCustomers = allCustomers.length;
        const now = /* @__PURE__ */ new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1e3);
        const recentOrders = allOrders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);
        const previousOrders = allOrders.filter((o) => {
          const date = new Date(o.createdAt);
          return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        });
        const recentRevenue = recentOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
        const previousRevenue = previousOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
        const revenueGrowth = previousRevenue > 0 ? (recentRevenue - previousRevenue) / previousRevenue * 100 : 0;
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          const monthOrders = allOrders.filter((o) => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= monthDate && orderDate <= monthEnd;
          });
          const revenue = monthOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
          monthlyRevenue.push({
            month: monthDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
            revenue
          });
        }
        const allRestaurants = await this.getRestaurants();
        const revenueByRestaurant = allRestaurants.map((restaurant) => {
          const restaurantOrders = allOrders.filter((o) => o.restaurantId === restaurant.id);
          const revenue = restaurantOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
          return {
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            revenue,
            ordersCount: restaurantOrders.length
          };
        }).sort((a, b) => b.revenue - a.revenue);
        return {
          totalOrders,
          averageTicket,
          totalCustomers,
          revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
          monthlyRevenue,
          revenueByRestaurant
        };
      }
      async getRestaurantRankings() {
        const allRestaurants = await this.getRestaurants();
        const allOrders = await db.select().from(orders).where(ne(orders.status, "cancelado"));
        const topByRevenue = allRestaurants.map((restaurant) => {
          const restaurantOrders = allOrders.filter((o) => o.restaurantId === restaurant.id);
          const revenue = restaurantOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
          const ordersCount = restaurantOrders.length;
          const averageTicket = ordersCount > 0 ? revenue / ordersCount : 0;
          return { restaurant, revenue, ordersCount, averageTicket };
        }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
        const topByOrders = allRestaurants.map((restaurant) => {
          const restaurantOrders = allOrders.filter((o) => o.restaurantId === restaurant.id);
          const ordersCount = restaurantOrders.length;
          const revenue = restaurantOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
          return { restaurant, ordersCount, revenue };
        }).sort((a, b) => b.ordersCount - a.ordersCount).slice(0, 10);
        const now = /* @__PURE__ */ new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1e3);
        const topByGrowth = allRestaurants.map((restaurant) => {
          const recentOrders = allOrders.filter(
            (o) => o.restaurantId === restaurant.id && new Date(o.createdAt) >= thirtyDaysAgo
          );
          const previousOrders = allOrders.filter((o) => {
            const date = new Date(o.createdAt);
            return o.restaurantId === restaurant.id && date >= sixtyDaysAgo && date < thirtyDaysAgo;
          });
          const currentRevenue = recentOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
          const previousRevenue = previousOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
          const growthRate = previousRevenue > 0 ? (currentRevenue - previousRevenue) / previousRevenue * 100 : 0;
          return { restaurant, growthRate, currentRevenue, previousRevenue };
        }).sort((a, b) => b.growthRate - a.growthRate).slice(0, 10);
        return { topByRevenue, topByOrders, topByGrowth };
      }
      async getRestaurantDetails(restaurantId) {
        const restaurant = await this.getRestaurantById(restaurantId);
        if (!restaurant) {
          throw new Error("Restaurante n\xE3o encontrado");
        }
        const restaurantOrders = await db.select().from(orders).where(eq(orders.restaurantId, restaurantId));
        const activeOrders = restaurantOrders.filter((o) => o.status !== "cancelado");
        const cancelledOrders = restaurantOrders.filter((o) => o.status === "cancelado");
        const totalOrders = activeOrders.length;
        const totalRevenue = activeOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
        const averageTicket = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";
        const restaurantCustomers = await db.select().from(customers).where(eq(customers.restaurantId, restaurantId));
        const restaurantMenuItems = await db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
        const restaurantTables = await db.select().from(tables).where(eq(tables.restaurantId, restaurantId));
        const restaurantBranches = await db.select().from(branches).where(eq(branches.restaurantId, restaurantId));
        const restaurantUsers = await db.select().from(users).where(eq(users.restaurantId, restaurantId));
        const revenueHistory = [];
        for (let i = 29; i >= 0; i--) {
          const date = /* @__PURE__ */ new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          const dayOrders = activeOrders.filter((o) => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= date && orderDate < nextDate;
          });
          const revenue = dayOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
          revenueHistory.push({
            date: date.toLocaleDateString("pt-BR"),
            revenue,
            orders: dayOrders.length
          });
        }
        const paymentMethodsMap = /* @__PURE__ */ new Map();
        activeOrders.forEach((order) => {
          const method = order.paymentMethod || "n\xE3o especificado";
          const existing = paymentMethodsMap.get(method) || { count: 0, total: 0 };
          paymentMethodsMap.set(method, {
            count: existing.count + 1,
            total: existing.total + parseFloat(order.totalAmount)
          });
        });
        const paymentMethods = Array.from(paymentMethodsMap.entries()).map(([method, data]) => ({
          method,
          count: data.count,
          total: data.total.toFixed(2)
        }));
        const allOrderItems = await db.select().from(orderItems).leftJoin(orders, eq(orderItems.orderId, orders.id)).leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(and(
          eq(orders.restaurantId, restaurantId),
          ne(orders.status, "cancelado")
        ));
        const productMap = /* @__PURE__ */ new Map();
        allOrderItems.forEach((item) => {
          if (item.menu_items) {
            const name = item.menu_items.name;
            const existing = productMap.get(name) || { name, quantity: 0, revenue: 0 };
            productMap.set(name, {
              name,
              quantity: existing.quantity + item.order_items.quantity,
              revenue: existing.revenue + parseFloat(item.order_items.totalPrice)
            });
          }
        });
        const topProducts = Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 10).map((p) => ({ ...p, revenue: p.revenue.toFixed(2) }));
        const recentOrders = restaurantOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);
        const recentActivity = recentOrders.map((order) => ({
          action: `Pedido ${order.status === "cancelado" ? "cancelado" : "criado"} - ${order.orderTitle || `#${order.id.slice(0, 8)}`}`,
          timestamp: new Date(order.createdAt),
          user: order.customerName || void 0
        }));
        return {
          restaurant,
          metrics: {
            totalOrders,
            totalRevenue: totalRevenue.toFixed(2),
            averageTicket,
            cancelledOrders: cancelledOrders.length,
            totalCustomers: restaurantCustomers.length,
            totalMenuItems: restaurantMenuItems.length,
            totalTables: restaurantTables.length,
            totalBranches: restaurantBranches.length,
            totalUsers: restaurantUsers.length
          },
          revenueHistory,
          paymentMethods,
          topProducts,
          recentActivity
        };
      }
      async getSuperAdminFinancialOverview(startDate, endDate) {
        const end = endDate || /* @__PURE__ */ new Date();
        const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1e3);
        const allOrders = await db.select().from(orders).where(and(
          ne(orders.status, "cancelado"),
          gte(orders.createdAt, start),
          sql3`${orders.createdAt} <= ${end}`
        ));
        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
        const methodMap = /* @__PURE__ */ new Map();
        allOrders.forEach((order) => {
          const method = order.paymentMethod || "n\xE3o especificado";
          methodMap.set(method, (methodMap.get(method) || 0) + parseFloat(order.totalAmount));
        });
        const revenueByMethod = Array.from(methodMap.entries()).map(([method, total]) => ({
          method,
          total: total.toFixed(2),
          percentage: totalRevenue > 0 ? total / totalRevenue * 100 : 0
        }));
        const allRestaurants = await this.getRestaurants();
        const revenueByRestaurant = allRestaurants.map((restaurant) => {
          const restaurantOrders = allOrders.filter((o) => o.restaurantId === restaurant.id);
          const revenue = restaurantOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
          return {
            restaurantName: restaurant.name,
            revenue: revenue.toFixed(2),
            orders: restaurantOrders.length
          };
        }).filter((r) => parseFloat(r.revenue) > 0).sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue));
        const dailyRevenue = [];
        const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1e3));
        for (let i = 0; i < days; i++) {
          const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1e3);
          const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1e3);
          const dayOrders = allOrders.filter((o) => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= date && orderDate < nextDate;
          });
          const revenue = dayOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
          dailyRevenue.push({
            date: date.toLocaleDateString("pt-BR"),
            revenue,
            orders: dayOrders.length
          });
        }
        const allShifts = await db.select().from(financialShifts).leftJoin(restaurants, eq(financialShifts.restaurantId, restaurants.id)).where(and(
          gte(financialShifts.startedAt, start),
          sql3`${financialShifts.startedAt} <= ${end}`
        ));
        const shiftsMap = /* @__PURE__ */ new Map();
        allShifts.forEach((shift) => {
          if (shift.restaurants) {
            const name = shift.restaurants.name;
            const existing = shiftsMap.get(name) || { totalShifts: 0, totalDiscrepancies: 0 };
            shiftsMap.set(name, {
              totalShifts: existing.totalShifts + 1,
              totalDiscrepancies: existing.totalDiscrepancies + parseFloat(shift.financial_shifts.discrepancy || "0")
            });
          }
        });
        const shifts = Array.from(shiftsMap.entries()).map(([restaurantName, data]) => ({
          restaurantName,
          totalShifts: data.totalShifts,
          totalDiscrepancies: data.totalDiscrepancies.toFixed(2)
        }));
        return {
          totalRevenue: totalRevenue.toFixed(2),
          totalOrders,
          revenueByMethod,
          revenueByRestaurant,
          dailyRevenue,
          shifts
        };
      }
      // Reports operations
      async getSalesReport(restaurantId, branchId, startDate, endDate) {
        let periodOrders;
        if (branchId) {
          periodOrders = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), sql3`${orders.tableId} IS NULL`),
            sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, startDate),
            sql3`${orders.createdAt} <= ${endDate}`
          ));
        } else {
          periodOrders = await db.select().from(orders).where(and(
            eq(orders.restaurantId, restaurantId),
            sql3`${orders.status} IS DISTINCT FROM 'cancelado'`,
            gte(orders.createdAt, startDate),
            sql3`${orders.createdAt} <= ${endDate}`
          ));
        }
        const periodOrdersRaw = periodOrders.map((row) => row.orders || row);
        const totalOrders = periodOrdersRaw.length;
        const totalSales = periodOrdersRaw.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
        const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
        const ordersByType = ["mesa", "delivery", "takeout"].map((type) => {
          const typeOrders = periodOrdersRaw.filter((o) => o.orderType === type);
          const revenue = typeOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
          return {
            type,
            count: typeOrders.length,
            revenue: revenue.toFixed(2)
          };
        });
        const ordersByStatus = ["pendente", "em_preparo", "pronto", "servido"].map((status) => {
          const statusOrders = periodOrdersRaw.filter((o) => o.status === status);
          return {
            status,
            count: statusOrders.length
          };
        });
        const salesByDayMap = /* @__PURE__ */ new Map();
        periodOrdersRaw.forEach((order) => {
          const dateKey = order.createdAt.toISOString().split("T")[0];
          const existing = salesByDayMap.get(dateKey) || { sales: 0, orders: 0 };
          salesByDayMap.set(dateKey, {
            sales: existing.sales + parseFloat(order.totalAmount),
            orders: existing.orders + 1
          });
        });
        const salesByDay = Array.from(salesByDayMap.entries()).map(([date, data]) => ({
          date,
          sales: data.sales.toFixed(2),
          orders: data.orders
        })).sort((a, b) => a.date.localeCompare(b.date));
        return {
          totalSales: totalSales.toFixed(2),
          totalOrders,
          averageTicket: averageTicket.toFixed(2),
          ordersByType,
          ordersByStatus,
          salesByDay
        };
      }
      async getCancelledOrdersStats(restaurantId, branchId, startDate, endDate) {
        let cancelledOrdersData;
        if (branchId) {
          cancelledOrdersData = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), sql3`${orders.tableId} IS NULL`),
            eq(orders.status, "cancelado"),
            gte(orders.createdAt, startDate),
            sql3`${orders.createdAt} <= ${endDate}`
          )).orderBy(desc(orders.createdAt));
        } else {
          cancelledOrdersData = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            eq(orders.status, "cancelado"),
            gte(orders.createdAt, startDate),
            sql3`${orders.createdAt} <= ${endDate}`
          )).orderBy(desc(orders.createdAt));
        }
        const cancelledOrdersRaw = cancelledOrdersData.map((row) => row.orders || row);
        const totalCancelled = cancelledOrdersRaw.length;
        const totalLostRevenue = cancelledOrdersRaw.reduce(
          (sum, order) => sum + parseFloat(order.totalAmount),
          0
        );
        const cancelledOrders = await Promise.all(
          cancelledOrdersData.map(async (orderRow) => {
            const items = await db.select().from(orderItems).leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(eq(orderItems.orderId, orderRow.orders.id));
            return {
              ...orderRow.orders,
              table: orderRow.tables ? { number: orderRow.tables.number } : null,
              orderItems: items.map((item) => ({
                ...item.order_items,
                menuItem: item.menu_items
              }))
            };
          })
        );
        return {
          totalCancelled,
          totalLostRevenue: totalLostRevenue.toFixed(2),
          cancelledOrders
        };
      }
      async getOrdersReport(restaurantId, branchId, startDate, endDate, status, orderType) {
        let baseConditions = [
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startDate),
          sql3`${orders.createdAt} <= ${endDate}`
        ];
        if (status === "cancelado") {
          baseConditions.push(eq(orders.status, "cancelado"));
        } else if (status && status !== "todos") {
          baseConditions.push(eq(orders.status, status));
        } else {
          baseConditions.push(ne(orders.status, "cancelado"));
        }
        if (orderType && orderType !== "todos") {
          baseConditions.push(eq(orders.orderType, orderType));
        }
        let ordersData;
        if (branchId) {
          ordersData = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            ...baseConditions,
            or(
              and(eq(tables.branchId, branchId), sql3`${orders.tableId} IS NOT NULL`),
              sql3`${orders.tableId} IS NULL`
            )
          )).orderBy(desc(orders.createdAt));
        } else {
          ordersData = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(...baseConditions)).orderBy(desc(orders.createdAt));
        }
        const ordersWithItems = await Promise.all(
          ordersData.map(async (orderRow) => {
            const items = await db.select().from(orderItems).leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(eq(orderItems.orderId, orderRow.orders.id));
            return {
              ...orderRow.orders,
              table: orderRow.tables ? { number: orderRow.tables.number } : null,
              orderItems: items.map((item) => ({
                ...item.order_items,
                menuItem: item.menu_items
              }))
            };
          })
        );
        return ordersWithItems;
      }
      async getProductsReport(restaurantId, branchId, startDate, endDate) {
        let periodOrdersRaw;
        if (branchId) {
          periodOrdersRaw = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), sql3`${orders.tableId} IS NULL`),
            gte(orders.createdAt, startDate),
            sql3`${orders.createdAt} <= ${endDate}`
          ));
        } else {
          periodOrdersRaw = await db.select().from(orders).where(and(
            eq(orders.restaurantId, restaurantId),
            gte(orders.createdAt, startDate),
            sql3`${orders.createdAt} <= ${endDate}`
          ));
        }
        const periodOrders = periodOrdersRaw.map((row) => row.orders || row);
        const orderIds = periodOrders.map((o) => o.id);
        let topProducts = [];
        if (orderIds.length > 0) {
          const productStats = await db.select({
            menuItemId: orderItems.menuItemId,
            quantity: sql3`cast(sum(${orderItems.quantity}) as int)`,
            revenue: sql3`cast(sum(${orderItems.quantity} * ${orderItems.price}) as text)`,
            ordersCount: sql3`cast(count(distinct ${orderItems.orderId}) as int)`
          }).from(orderItems).where(sql3`${orderItems.orderId} = ANY(ARRAY[${sql3.join(orderIds.map((id) => sql3`${id}`), sql3`, `)}])`).groupBy(orderItems.menuItemId).orderBy(desc(sql3`sum(${orderItems.quantity})`)).limit(20);
          topProducts = await Promise.all(
            productStats.map(async (stat) => {
              const item = await this.getMenuItemById(stat.menuItemId);
              return {
                menuItem: item,
                quantity: stat.quantity,
                revenue: parseFloat(stat.revenue).toFixed(2),
                ordersCount: stat.ordersCount
              };
            })
          );
        }
        const categoryRevenue = /* @__PURE__ */ new Map();
        if (orderIds.length > 0) {
          const categoryStats = await db.select({
            categoryId: menuItems.categoryId,
            menuItemId: orderItems.menuItemId,
            revenue: sql3`cast(sum(${orderItems.quantity} * ${orderItems.price}) as text)`
          }).from(orderItems).leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(sql3`${orderItems.orderId} = ANY(ARRAY[${sql3.join(orderIds.map((id) => sql3`${id}`), sql3`, `)}])`).groupBy(menuItems.categoryId, orderItems.menuItemId);
          for (const stat of categoryStats) {
            const category = await this.getCategoryById(stat.categoryId);
            if (category) {
              const existing = categoryRevenue.get(category.name) || { revenue: 0, items: /* @__PURE__ */ new Set() };
              existing.revenue += parseFloat(stat.revenue);
              existing.items.add(stat.menuItemId);
              categoryRevenue.set(category.name, existing);
            }
          }
        }
        const productsByCategory = Array.from(categoryRevenue.entries()).map(([categoryName, data]) => ({
          categoryName,
          totalRevenue: data.revenue.toFixed(2),
          itemsCount: data.items.size
        })).sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue));
        return {
          topProducts,
          productsByCategory
        };
      }
      async getPerformanceReport(restaurantId, branchId, startDate, endDate) {
        let periodOrdersRaw;
        if (branchId) {
          periodOrdersRaw = await db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(
            eq(orders.restaurantId, restaurantId),
            or(eq(tables.branchId, branchId), sql3`${orders.tableId} IS NULL`),
            gte(orders.createdAt, startDate),
            sql3`${orders.createdAt} <= ${endDate}`
          ));
        } else {
          periodOrdersRaw = await db.select().from(orders).where(and(
            eq(orders.restaurantId, restaurantId),
            gte(orders.createdAt, startDate),
            sql3`${orders.createdAt} <= ${endDate}`
          ));
        }
        const periodOrders = periodOrdersRaw.map((row) => row.orders || row);
        let totalPrepTime = 0;
        let prepTimeCount = 0;
        periodOrders.forEach((order) => {
          if (order.updatedAt && order.createdAt) {
            const prepTime = (order.updatedAt.getTime() - order.createdAt.getTime()) / 1e3 / 60;
            totalPrepTime += prepTime;
            prepTimeCount++;
          }
        });
        const averagePrepTime = prepTimeCount > 0 ? totalPrepTime / prepTimeCount : 0;
        const completedOrders = periodOrders.filter((o) => o.status === "servido").length;
        const completionRate = periodOrders.length > 0 ? completedOrders / periodOrders.length * 100 : 0;
        const hourCounts = /* @__PURE__ */ new Map();
        periodOrders.forEach((order) => {
          const hour = order.createdAt.getHours();
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });
        const peakHours = Array.from(hourCounts.entries()).map(([hour, orders2]) => ({ hour, orders: orders2 })).sort((a, b) => b.orders - a.orders).slice(0, 10);
        const tableStats = /* @__PURE__ */ new Map();
        periodOrdersRaw.forEach((row) => {
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
        const topTables = Array.from(tableStats.entries()).map(([tableNumber, data]) => ({
          tableNumber,
          orders: data.orders,
          revenue: data.revenue.toFixed(2)
        })).sort((a, b) => b.orders - a.orders).slice(0, 10);
        return {
          averagePrepTime: averagePrepTime.toFixed(1),
          completionRate: completionRate.toFixed(1),
          peakHours,
          topTables
        };
      }
      // Sales/Vendas operations
      async getOrdersForSales(restaurantId, branchId, startDate, endDate, orderStatus, paymentStatus, orderType, orderBy, periodFilter) {
        let query = db.select({
          order: orders,
          tableNumber: tables.number
        }).from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).$dynamic();
        const conditions = [
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startDate),
          sql3`${orders.createdAt} <= ${endDate}`
        ];
        if (periodFilter && periodFilter !== "all") {
          if (periodFilter === "morning") {
            conditions.push(sql3`EXTRACT(HOUR FROM ${orders.createdAt}) >= 6 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 12`);
          } else if (periodFilter === "afternoon") {
            conditions.push(sql3`EXTRACT(HOUR FROM ${orders.createdAt}) >= 12 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 18`);
          } else if (periodFilter === "night") {
            conditions.push(sql3`EXTRACT(HOUR FROM ${orders.createdAt}) >= 18 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 24`);
          }
        }
        if (branchId) {
          conditions.push(
            or(
              eq(tables.branchId, branchId),
              sql3`${orders.tableId} IS NULL`
            )
          );
        }
        if (orderStatus && orderStatus !== "all") {
          conditions.push(eq(orders.status, orderStatus));
        }
        if (paymentStatus && paymentStatus !== "all") {
          conditions.push(eq(orders.paymentStatus, paymentStatus));
        }
        if (orderType && orderType !== "all") {
          conditions.push(eq(orders.orderType, orderType));
        }
        query = query.where(and(...conditions));
        if (orderBy === "updated") {
          query = query.orderBy(desc(orders.updatedAt));
        } else {
          query = query.orderBy(desc(orders.createdAt));
        }
        const results = await query;
        return results.map((row) => ({
          ...row.order,
          tableNumber: row.tableNumber
        }));
      }
      async getSalesStats(restaurantId, branchId, startDate, endDate, orderStatus, paymentStatus, orderType, periodFilter) {
        const baseConditions = [
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startDate),
          sql3`${orders.createdAt} <= ${endDate}`
        ];
        if (periodFilter && periodFilter !== "all") {
          if (periodFilter === "morning") {
            baseConditions.push(sql3`EXTRACT(HOUR FROM ${orders.createdAt}) >= 6 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 12`);
          } else if (periodFilter === "afternoon") {
            baseConditions.push(sql3`EXTRACT(HOUR FROM ${orders.createdAt}) >= 12 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 18`);
          } else if (periodFilter === "night") {
            baseConditions.push(sql3`EXTRACT(HOUR FROM ${orders.createdAt}) >= 18 AND EXTRACT(HOUR FROM ${orders.createdAt}) < 24`);
          }
        }
        if (branchId) {
          baseConditions.push(
            or(
              eq(tables.branchId, branchId),
              sql3`${orders.tableId} IS NULL`
            )
          );
        }
        if (orderStatus && orderStatus !== "all") {
          baseConditions.push(eq(orders.status, orderStatus));
        }
        if (paymentStatus && paymentStatus !== "all") {
          baseConditions.push(eq(orders.paymentStatus, paymentStatus));
        }
        if (orderType && orderType !== "all") {
          baseConditions.push(eq(orders.orderType, orderType));
        }
        let allQuery = db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(...baseConditions)).$dynamic();
        const allResults = await allQuery;
        const allOrders = allResults.map((row) => row.orders);
        const cancelledOrdersList = allOrders.filter((o) => o.status === "cancelado");
        const cancelledOrders = cancelledOrdersList.length;
        const cancelledRevenue = cancelledOrdersList.reduce(
          (sum, order) => sum + parseFloat(order.totalAmount),
          0
        );
        const validConditions = [
          ...baseConditions,
          // Exclude cancelled orders in the query
          sql3`${orders.status} != 'cancelado'`
        ];
        let validQuery = db.select().from(orders).leftJoin(tables, eq(orders.tableId, tables.id)).where(and(...validConditions)).$dynamic();
        const validResults = await validQuery;
        const validOrders = validResults.map((row) => row.orders);
        const totalOrders = validOrders.length;
        const totalRevenue = validOrders.reduce(
          (sum, order) => sum + parseFloat(order.totalAmount),
          0
        );
        const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const paidOrders = validOrders.filter((o) => o.paymentStatus === "pago").length;
        const pendingOrders = validOrders.filter((o) => o.paymentStatus === "nao_pago").length;
        return {
          totalOrders,
          totalRevenue,
          averageTicket,
          paidOrders,
          pendingOrders,
          cancelledOrders,
          cancelledRevenue
        };
      }
      // Message operations
      async getMessages(restaurantId) {
        return await db.select().from(messages).where(eq(messages.restaurantId, restaurantId)).orderBy(desc(messages.createdAt));
      }
      async getAllMessages() {
        const results = await db.select().from(messages).leftJoin(restaurants, eq(messages.restaurantId, restaurants.id)).orderBy(desc(messages.createdAt));
        return results.map((row) => ({
          ...row.messages,
          restaurant: row.restaurants
        }));
      }
      async createMessage(message) {
        const [newMessage] = await db.insert(messages).values(message).returning();
        return newMessage;
      }
      async markMessageAsRead(id) {
        const [updated] = await db.update(messages).set({ isRead: 1 }).where(eq(messages.id, id)).returning();
        return updated;
      }
      // Option Group operations
      async getOptionGroupsByMenuItem(menuItemId) {
        const groups = await db.select().from(optionGroups).where(eq(optionGroups.menuItemId, menuItemId)).orderBy(optionGroups.displayOrder, optionGroups.createdAt);
        const result = await Promise.all(
          groups.map(async (group) => {
            const opts = await this.getOptionsByGroupId(group.id);
            return {
              ...group,
              options: opts
            };
          })
        );
        return result;
      }
      async getOptionGroupById(id) {
        const [group] = await db.select().from(optionGroups).where(eq(optionGroups.id, id));
        return group;
      }
      async createOptionGroup(menuItemId, groupData) {
        const [newGroup] = await db.insert(optionGroups).values({
          menuItemId,
          ...groupData
        }).returning();
        return newGroup;
      }
      async updateOptionGroup(id, data) {
        const [updated] = await db.update(optionGroups).set(data).where(eq(optionGroups.id, id)).returning();
        return updated;
      }
      async deleteOptionGroup(id) {
        await db.delete(optionGroups).where(eq(optionGroups.id, id));
      }
      // Option operations
      async getOptionsByGroupId(groupId) {
        return await db.select().from(options).where(eq(options.optionGroupId, groupId)).orderBy(options.displayOrder, options.createdAt);
      }
      async getOptionById(id) {
        const [option] = await db.select().from(options).where(eq(options.id, id));
        return option;
      }
      async createOption(groupId, optionData) {
        const [newOption] = await db.insert(options).values({
          optionGroupId: groupId,
          ...optionData
        }).returning();
        return newOption;
      }
      async updateOption(id, data) {
        const [updated] = await db.update(options).set(data).where(eq(options.id, id)).returning();
        return updated;
      }
      async deleteOption(id) {
        await db.delete(options).where(eq(options.id, id));
      }
      // Order Item Option operations
      async createOrderItemOptions(orderItemId, opts) {
        if (opts.length === 0) return [];
        const values = opts.map((opt) => ({
          ...opt,
          orderItemId
        }));
        const created = await db.insert(orderItemOptions).values(values).returning();
        return created;
      }
      async getOrderItemOptions(orderItemId) {
        return await db.select().from(orderItemOptions).where(eq(orderItemOptions.orderItemId, orderItemId)).orderBy(orderItemOptions.createdAt);
      }
      // Financial Shift operations
      async getActiveShift(restaurantId, branchId, operatorId) {
        const conditions = [
          eq(financialShifts.restaurantId, restaurantId),
          eq(financialShifts.operatorId, operatorId),
          eq(financialShifts.status, "aberto")
        ];
        if (branchId) {
          conditions.push(eq(financialShifts.branchId, branchId));
        } else {
          conditions.push(isNull(financialShifts.branchId));
        }
        const [shift] = await db.select().from(financialShifts).where(and(...conditions));
        return shift;
      }
      async getAllShifts(restaurantId, branchId, startDate, endDate) {
        let conditions = [eq(financialShifts.restaurantId, restaurantId)];
        if (branchId) {
          conditions.push(eq(financialShifts.branchId, branchId));
        } else {
          conditions.push(isNull(financialShifts.branchId));
        }
        if (startDate) {
          conditions.push(gte(financialShifts.startedAt, startDate));
        }
        if (endDate) {
          conditions.push(sql3`${financialShifts.endedAt} <= ${endDate}`);
        }
        return await db.select().from(financialShifts).where(and(...conditions)).orderBy(desc(financialShifts.startedAt));
      }
      async getShiftById(id) {
        const [shift] = await db.select().from(financialShifts).where(eq(financialShifts.id, id));
        return shift;
      }
      async createShift(restaurantId, branchId, shift) {
        const [newShift] = await db.insert(financialShifts).values({
          restaurantId,
          branchId,
          ...shift
        }).returning();
        return newShift;
      }
      async closeShift(id, closingBalance, notes) {
        const shift = await this.getShiftById(id);
        if (!shift) throw new Error("Turno n\xE3o encontrado");
        const openingBalance = parseFloat(shift.openingBalance || "0");
        const expectedBalance = parseFloat(shift.expectedBalance || "0");
        const closing = parseFloat(closingBalance);
        const discrepancy = closing - expectedBalance;
        const [updated] = await db.update(financialShifts).set({
          status: "fechado",
          closingBalance,
          discrepancy: discrepancy.toFixed(2),
          endedAt: /* @__PURE__ */ new Date(),
          notes: notes || shift.notes
        }).where(eq(financialShifts.id, id)).returning();
        return updated;
      }
      // Financial Event operations
      async createFinancialEvent(restaurantId, event) {
        const [newEvent] = await db.insert(financialEvents).values({
          restaurantId,
          ...event
        }).returning();
        return newEvent;
      }
      async getFinancialEvents(restaurantId, branchId, filters) {
        let conditions = [eq(financialEvents.restaurantId, restaurantId)];
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
          if (filters.endDate) conditions.push(sql3`${financialEvents.createdAt} <= ${filters.endDate}`);
        }
        return await db.select().from(financialEvents).where(and(...conditions)).orderBy(desc(financialEvents.createdAt));
      }
      // Order Adjustment operations
      async createOrderAdjustment(restaurantId, adjustment) {
        const [newAdjustment] = await db.insert(orderAdjustments).values({
          restaurantId,
          ...adjustment
        }).returning();
        return newAdjustment;
      }
      async getOrderAdjustments(orderId) {
        return await db.select().from(orderAdjustments).where(eq(orderAdjustments.orderId, orderId)).orderBy(desc(orderAdjustments.createdAt));
      }
      // Payment Event operations
      async createPaymentEvent(restaurantId, event) {
        const [newEvent] = await db.insert(paymentEvents).values({
          restaurantId,
          ...event
        }).returning();
        return newEvent;
      }
      async getPaymentEvents(restaurantId, filters) {
        let conditions = [eq(paymentEvents.restaurantId, restaurantId)];
        if (filters) {
          if (filters.orderId) conditions.push(eq(paymentEvents.orderId, filters.orderId));
          if (filters.sessionId) conditions.push(eq(paymentEvents.sessionId, filters.sessionId));
          if (filters.startDate) conditions.push(gte(paymentEvents.createdAt, filters.startDate));
          if (filters.endDate) conditions.push(sql3`${paymentEvents.createdAt} <= ${filters.endDate}`);
        }
        return await db.select().from(paymentEvents).where(and(...conditions)).orderBy(desc(paymentEvents.createdAt));
      }
      // Report Aggregation operations
      async createReportAggregation(restaurantId, aggregation) {
        const [newAggregation] = await db.insert(reportAggregations).values({
          restaurantId,
          ...aggregation
        }).returning();
        return newAggregation;
      }
      async getReportAggregations(restaurantId, branchId, periodType, startDate, endDate) {
        let conditions = [
          eq(reportAggregations.restaurantId, restaurantId),
          eq(reportAggregations.periodType, periodType)
        ];
        if (branchId) {
          conditions.push(eq(reportAggregations.branchId, branchId));
        } else {
          conditions.push(isNull(reportAggregations.branchId));
        }
        if (startDate) {
          conditions.push(gte(reportAggregations.periodStart, startDate));
        }
        if (endDate) {
          conditions.push(sql3`${reportAggregations.periodEnd} <= ${endDate}`);
        }
        return await db.select().from(reportAggregations).where(and(...conditions)).orderBy(desc(reportAggregations.periodStart));
      }
      async getLatestAggregation(restaurantId, branchId, periodType) {
        let conditions = [
          eq(reportAggregations.restaurantId, restaurantId),
          eq(reportAggregations.periodType, periodType)
        ];
        if (branchId) {
          conditions.push(eq(reportAggregations.branchId, branchId));
        } else {
          conditions.push(isNull(reportAggregations.branchId));
        }
        const [latest] = await db.select().from(reportAggregations).where(and(...conditions)).orderBy(desc(reportAggregations.periodStart)).limit(1);
        return latest;
      }
      // Menu Visit operations
      async recordMenuVisit(restaurantId, visit) {
        const [newVisit] = await db.insert(menuVisits).values({
          restaurantId,
          ...visit
        }).returning();
        return newVisit;
      }
      async getMenuVisitStats(restaurantId, branchId, startDate, endDate) {
        let conditions = [
          eq(menuVisits.restaurantId, restaurantId),
          gte(menuVisits.createdAt, startDate),
          sql3`${menuVisits.createdAt} <= ${endDate}`
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
        const allVisits = await db.select().from(menuVisits).where(and(...conditions));
        const totalVisits = allVisits.length;
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const visitsToday = allVisits.filter((v) => v.createdAt && new Date(v.createdAt) >= today).length;
        const visitsBySourceMap = {};
        allVisits.forEach((visit) => {
          const source = visit.visitSource || "unknown";
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
      async createCustomerReview(restaurantId, review) {
        const [newReview] = await db.insert(customerReviews).values({
          restaurantId,
          ...review
        }).returning();
        return newReview;
      }
      async getCustomerReviews(restaurantId, branchId, limit, startDate, endDate) {
        let conditions = [eq(customerReviews.restaurantId, restaurantId)];
        if (branchId !== null) {
          conditions.push(eq(customerReviews.branchId, branchId));
        }
        if (startDate) {
          conditions.push(gte(customerReviews.createdAt, startDate));
        }
        if (endDate) {
          conditions.push(sql3`${customerReviews.createdAt} <= ${endDate}`);
        }
        let query = db.select().from(customerReviews).where(and(...conditions)).orderBy(desc(customerReviews.createdAt));
        if (limit) {
          query = query.limit(limit);
        }
        return await query;
      }
      async getAverageRating(restaurantId, branchId, startDate, endDate) {
        const reviews = await this.getCustomerReviews(restaurantId, branchId, void 0, startDate, endDate);
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return Math.round(sum / reviews.length * 10) / 10;
      }
      // Dashboard Stats
      async getDashboardStats(restaurantId, branchId, startDate, endDate, orderType) {
        let orderConditions = [
          eq(orders.restaurantId, restaurantId),
          eq(orders.paymentStatus, "pago"),
          ne(orders.status, "cancelado"),
          gte(orders.createdAt, startDate),
          sql3`${orders.createdAt} <= ${endDate}`
        ];
        if (branchId !== null) {
          orderConditions.push(or(
            eq(orders.branchId, branchId),
            sql3`${orders.branchId} IS NULL`
          ));
        }
        if (orderType && orderType !== "all") {
          if (orderType === "pdv") {
            orderConditions.push(or(
              eq(orders.orderType, "pdv"),
              eq(orders.orderType, "balcao")
            ));
          } else if (orderType === "web") {
            orderConditions.push(or(
              eq(orders.orderType, "mesa"),
              eq(orders.orderType, "delivery"),
              eq(orders.orderType, "takeout")
            ));
          }
        }
        const periodOrders = await db.select().from(orders).where(and(...orderConditions));
        const totalOrders = periodOrders.length;
        const totalRevenue = periodOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
        const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const salesByDayMap = {};
        periodOrders.forEach((order) => {
          const dateKey = order.createdAt?.toISOString().split("T")[0] || "";
          if (!salesByDayMap[dateKey]) {
            salesByDayMap[dateKey] = { sales: 0, orders: 0, pdv: 0, web: 0 };
          }
          const revenue = parseFloat(order.totalAmount);
          salesByDayMap[dateKey].sales += revenue;
          salesByDayMap[dateKey].orders += 1;
          if (order.orderType === "pdv" || order.orderType === "balcao") {
            salesByDayMap[dateKey].pdv += revenue;
          } else {
            salesByDayMap[dateKey].web += revenue;
          }
        });
        const salesByDay = Object.entries(salesByDayMap).map(([date, data]) => ({
          date,
          ...data
        })).sort((a, b) => a.date.localeCompare(b.date));
        const uniquePhones = /* @__PURE__ */ new Set();
        periodOrders.forEach((order) => {
          if (order.customerPhone) {
            uniquePhones.add(order.customerPhone);
          }
        });
        const newCustomers = uniquePhones.size;
        const reviews = await this.getCustomerReviews(restaurantId, branchId, void 0, startDate, endDate);
        const averageRating = await this.getAverageRating(restaurantId, branchId, startDate, endDate);
        const totalReviews = reviews.length;
        const orderIds = periodOrders.map((o) => o.id);
        let topProducts = [];
        if (orderIds.length > 0) {
          const items = await db.select({
            menuItemId: orderItems.menuItemId,
            quantity: orderItems.quantity,
            name: menuItems.name
          }).from(orderItems).leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(inArray(orderItems.orderId, orderIds));
          const productMap = {};
          items.forEach((item) => {
            const name = item.name || "Unknown";
            if (!productMap[name]) {
              productMap[name] = { name, quantity: 0 };
            }
            productMap[name].quantity += item.quantity || 0;
          });
          topProducts = Object.values(productMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
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
      async getCashRegisters(restaurantId, branchId) {
        let conditions = [eq(cashRegisters.restaurantId, restaurantId)];
        if (branchId !== null) {
          conditions.push(eq(cashRegisters.branchId, branchId));
        }
        return await db.select().from(cashRegisters).where(and(...conditions)).orderBy(desc(cashRegisters.createdAt));
      }
      async getCashRegisterById(id, restaurantId) {
        const [cashRegister] = await db.select().from(cashRegisters).where(and(
          eq(cashRegisters.id, id),
          eq(cashRegisters.restaurantId, restaurantId)
        )).limit(1);
        return cashRegister;
      }
      async createCashRegister(restaurantId, data) {
        const initialBalance = data.initialBalance || "0.00";
        const [newRegister] = await db.insert(cashRegisters).values({
          restaurantId,
          branchId: data.branchId || null,
          name: data.name,
          initialBalance,
          currentBalance: initialBalance,
          isActive: data.isActive ?? 1
        }).returning();
        return newRegister;
      }
      async updateCashRegister(id, restaurantId, data) {
        const [updated] = await db.update(cashRegisters).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(and(
          eq(cashRegisters.id, id),
          eq(cashRegisters.restaurantId, restaurantId)
        )).returning();
        return updated;
      }
      async deleteCashRegister(id, restaurantId) {
        await db.delete(cashRegisters).where(and(
          eq(cashRegisters.id, id),
          eq(cashRegisters.restaurantId, restaurantId)
        ));
      }
      // Financial Category operations
      async getFinancialCategories(restaurantId, branchId, type) {
        let conditions = [
          eq(financialCategories.restaurantId, restaurantId),
          eq(financialCategories.isArchived, 0)
        ];
        if (branchId !== null) {
          conditions.push(
            or(
              eq(financialCategories.branchId, branchId),
              isNull(financialCategories.branchId)
            )
          );
        }
        if (type) {
          conditions.push(eq(financialCategories.type, type));
        }
        return await db.select().from(financialCategories).where(and(...conditions)).orderBy(desc(financialCategories.isDefault), financialCategories.name);
      }
      async createFinancialCategory(restaurantId, data) {
        const [newCategory] = await db.insert(financialCategories).values({
          restaurantId,
          ...data,
          branchId: data.branchId || null
        }).returning();
        return newCategory;
      }
      async deleteFinancialCategory(id, restaurantId) {
        const usageCount = await db.select({ count: sql3`count(*)` }).from(financialTransactions).where(eq(financialTransactions.categoryId, id));
        if (usageCount[0].count > 0) {
          return {
            success: false,
            message: "Categoria n\xE3o pode ser exclu\xEDda pois possui lan\xE7amentos associados"
          };
        }
        await db.delete(financialCategories).where(and(
          eq(financialCategories.id, id),
          eq(financialCategories.restaurantId, restaurantId)
        ));
        return { success: true };
      }
      // Financial Transaction operations
      async createFinancialTransaction(restaurantId, userId, data) {
        let activeShift = void 0;
        if (data.cashRegisterId) {
          activeShift = await this.getActiveCashRegisterShift(data.cashRegisterId, restaurantId);
          if (!activeShift) {
            throw new Error("N\xE3o existe um turno aberto para esta caixa. Abra um turno antes de registrar lan\xE7amentos.");
          }
        }
        const amount = parseFloat(data.amount);
        const amountChange = data.type === "despesa" ? -amount : amount;
        const [transaction] = await db.transaction(async (tx) => {
          const [newTransaction] = await tx.insert(financialTransactions).values({
            restaurantId,
            recordedByUserId: userId,
            branchId: data.branchId || null,
            cashRegisterId: data.cashRegisterId || null,
            shiftId: data.shiftId || (activeShift?.id || null),
            categoryId: data.categoryId,
            type: data.type,
            origin: data.origin || "manual",
            description: data.description,
            paymentMethod: data.paymentMethod,
            amount: data.amount,
            referenceOrderId: data.referenceOrderId || null,
            occurredAt: new Date(data.occurredAt),
            note: data.note,
            totalInstallments: data.totalInstallments || 1,
            installmentNumber: data.installmentNumber || 1,
            parentTransactionId: data.parentTransactionId || null
          }).returning();
          if (data.cashRegisterId) {
            await tx.update(cashRegisters).set({
              currentBalance: sql3`${cashRegisters.currentBalance} + ${amountChange}`,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(cashRegisters.id, data.cashRegisterId));
          }
          return [newTransaction];
        });
        return transaction;
      }
      async getFinancialTransactions(restaurantId, branchId, filters) {
        let conditions = [eq(financialTransactions.restaurantId, restaurantId)];
        if (branchId !== null) {
          conditions.push(
            or(
              eq(financialTransactions.branchId, branchId),
              isNull(financialTransactions.branchId)
            )
          );
        }
        if (filters?.startDate) {
          conditions.push(gte(financialTransactions.occurredAt, filters.startDate));
        }
        if (filters?.endDate) {
          conditions.push(sql3`${financialTransactions.occurredAt} <= ${filters.endDate}`);
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
        const results = await db.select({
          transaction: financialTransactions,
          cashRegister: cashRegisters,
          category: financialCategories,
          recordedBy: users
        }).from(financialTransactions).leftJoin(cashRegisters, eq(financialTransactions.cashRegisterId, cashRegisters.id)).leftJoin(financialCategories, eq(financialTransactions.categoryId, financialCategories.id)).leftJoin(users, eq(financialTransactions.recordedByUserId, users.id)).where(and(...conditions)).orderBy(desc(financialTransactions.occurredAt));
        return results.map((r) => ({
          ...r.transaction,
          cashRegister: r.cashRegister,
          category: r.category,
          recordedBy: r.recordedBy
        }));
      }
      async deleteFinancialTransaction(id, restaurantId) {
        const [transaction] = await db.select().from(financialTransactions).where(and(
          eq(financialTransactions.id, id),
          eq(financialTransactions.restaurantId, restaurantId)
        )).limit(1);
        if (!transaction) {
          throw new Error("Transa\xE7\xE3o n\xE3o encontrada");
        }
        const amount = parseFloat(transaction.amount);
        const amountChange = transaction.type === "receita" ? -amount : amount;
        await db.transaction(async (tx) => {
          await tx.delete(financialTransactions).where(eq(financialTransactions.id, id));
          await tx.update(cashRegisters).set({
            currentBalance: sql3`${cashRegisters.currentBalance} + ${amountChange}`,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(cashRegisters.id, transaction.cashRegisterId));
        });
      }
      async getFinancialSummary(restaurantId, branchId, startDate, endDate, cashRegisterId) {
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
        const registers = await db.select().from(cashRegisters).where(and(...registerConditions));
        const totalBalance = registers.reduce((sum, r) => sum + parseFloat(r.currentBalance), 0);
        const cashRegisterBalances = registers.map((r) => ({
          id: r.id,
          name: r.name,
          balance: r.currentBalance
        }));
        let transactionConditions = [eq(financialTransactions.restaurantId, restaurantId)];
        if (branchId !== null) {
          transactionConditions.push(
            or(
              eq(financialTransactions.branchId, branchId),
              isNull(financialTransactions.branchId)
            )
          );
        }
        if (startDate) {
          transactionConditions.push(gte(financialTransactions.occurredAt, startDate));
        }
        if (endDate) {
          transactionConditions.push(sql3`${financialTransactions.occurredAt} <= ${endDate}`);
        }
        if (cashRegisterId) {
          transactionConditions.push(eq(financialTransactions.cashRegisterId, cashRegisterId));
        }
        const transactions = await db.select().from(financialTransactions).where(and(...transactionConditions));
        const totalIncome = transactions.filter((t) => t.type === "receita").reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalExpense = transactions.filter((t) => t.type === "despesa").reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const netResult = totalIncome - totalExpense;
        return {
          totalBalance: totalBalance.toFixed(2),
          cashRegisterBalances,
          totalIncome: totalIncome.toFixed(2),
          totalExpense: totalExpense.toFixed(2),
          netResult: netResult.toFixed(2)
        };
      }
      // Cash Register Shift operations
      async getCashRegisterShifts(restaurantId, branchId, filters) {
        let conditions = [eq(cashRegisterShifts.restaurantId, restaurantId)];
        if (branchId !== null) {
          conditions.push(
            or(
              eq(cashRegisterShifts.branchId, branchId),
              isNull(cashRegisterShifts.branchId)
            )
          );
        }
        if (filters?.cashRegisterId) {
          conditions.push(eq(cashRegisterShifts.cashRegisterId, filters.cashRegisterId));
        }
        if (filters?.status) {
          conditions.push(eq(cashRegisterShifts.status, filters.status));
        }
        const openedByUsers = alias(users, "openedByUsers");
        const closedByUsers = alias(users, "closedByUsers");
        const results = await db.select({
          shift: cashRegisterShifts,
          cashRegister: cashRegisters,
          openedBy: openedByUsers,
          closedBy: closedByUsers
        }).from(cashRegisterShifts).leftJoin(cashRegisters, eq(cashRegisterShifts.cashRegisterId, cashRegisters.id)).leftJoin(openedByUsers, eq(cashRegisterShifts.openedByUserId, openedByUsers.id)).leftJoin(closedByUsers, eq(cashRegisterShifts.closedByUserId, closedByUsers.id)).where(and(...conditions)).orderBy(desc(cashRegisterShifts.openedAt));
        return results.map((r) => ({
          ...r.shift,
          cashRegister: r.cashRegister,
          openedBy: r.openedBy,
          closedBy: r.closedBy || void 0
        }));
      }
      async getActiveCashRegisterShift(cashRegisterId, restaurantId) {
        const [shift] = await db.select().from(cashRegisterShifts).where(and(
          eq(cashRegisterShifts.cashRegisterId, cashRegisterId),
          eq(cashRegisterShifts.restaurantId, restaurantId),
          eq(cashRegisterShifts.status, "aberto")
        )).limit(1);
        return shift;
      }
      async getCashRegistersWithActiveShift(restaurantId, branchId) {
        let conditions = [
          eq(cashRegisters.restaurantId, restaurantId),
          eq(cashRegisters.isActive, 1)
        ];
        if (branchId !== null) {
          conditions.push(eq(cashRegisters.branchId, branchId));
        }
        const registers = await db.select().from(cashRegisters).where(and(...conditions));
        const registersWithShifts = [];
        for (const register of registers) {
          const activeShift = await this.getActiveCashRegisterShift(register.id, restaurantId);
          if (activeShift) {
            registersWithShifts.push(register);
          }
        }
        return registersWithShifts;
      }
      async openCashRegisterShift(restaurantId, userId, data) {
        const existingShift = await this.getActiveCashRegisterShift(data.cashRegisterId, restaurantId);
        if (existingShift) {
          throw new Error("J\xE1 existe um turno aberto para esta caixa. Feche o turno atual antes de abrir um novo.");
        }
        return await db.transaction(async (tx) => {
          const [shift] = await tx.insert(cashRegisterShifts).values({
            restaurantId,
            openedByUserId: userId,
            branchId: data.branchId || null,
            cashRegisterId: data.cashRegisterId,
            openingAmount: data.openingAmount,
            notes: data.notes
          }).returning();
          const openingCategoryResults = await tx.select().from(financialCategories).where(and(
            eq(financialCategories.restaurantId, restaurantId),
            eq(financialCategories.type, "ajuste"),
            eq(financialCategories.isDefault, 1)
          )).limit(1);
          let categoryId = openingCategoryResults[0]?.id;
          if (!categoryId) {
            const [category] = await tx.insert(financialCategories).values({
              restaurantId,
              branchId: data.branchId || null,
              type: "ajuste",
              name: "Abertura de Caixa",
              description: "Valor inicial ao abrir o caixa",
              isDefault: 1
            }).returning();
            categoryId = category.id;
          }
          await tx.insert(financialTransactions).values({
            restaurantId,
            recordedByUserId: userId,
            branchId: data.branchId || null,
            cashRegisterId: data.cashRegisterId,
            shiftId: shift.id,
            categoryId,
            type: "ajuste",
            origin: "manual",
            description: "Abertura do caixa",
            paymentMethod: "dinheiro",
            amount: data.openingAmount,
            referenceOrderId: null,
            occurredAt: /* @__PURE__ */ new Date(),
            note: data.notes
          });
          await tx.update(cashRegisters).set({
            currentBalance: sql3`${cashRegisters.currentBalance} + ${data.openingAmount}`,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(cashRegisters.id, data.cashRegisterId));
          return shift;
        });
      }
      async closeCashRegisterShift(shiftId, restaurantId, userId, data) {
        const [shift] = await db.select().from(cashRegisterShifts).where(and(
          eq(cashRegisterShifts.id, shiftId),
          eq(cashRegisterShifts.restaurantId, restaurantId),
          eq(cashRegisterShifts.status, "aberto")
        )).limit(1);
        if (!shift) {
          throw new Error("Turno n\xE3o encontrado ou j\xE1 fechado.");
        }
        const allTransactions = await db.select().from(financialTransactions).where(eq(financialTransactions.shiftId, shiftId));
        const cashTransactions = allTransactions.filter(
          (t) => t.paymentMethod === "dinheiro"
        );
        const totalRevenues = cashTransactions.filter((t) => t.type === "receita").reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalExpenses = cashTransactions.filter((t) => t.type === "despesa").reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalAdjustments = cashTransactions.filter((t) => t.type === "ajuste").reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const closingAmountExpected = totalRevenues - totalExpenses + totalAdjustments;
        const closingAmountCounted = parseFloat(data.closingAmountCounted);
        const difference = closingAmountCounted - closingAmountExpected;
        const [closedShift] = await db.update(cashRegisterShifts).set({
          status: "fechado",
          closedByUserId: userId,
          closingAmountExpected: closingAmountExpected.toFixed(2),
          closingAmountCounted: data.closingAmountCounted,
          difference: difference.toFixed(2),
          totalRevenues: totalRevenues.toFixed(2),
          totalExpenses: totalExpenses.toFixed(2),
          closedAt: /* @__PURE__ */ new Date(),
          notes: data.notes || shift.notes
        }).where(eq(cashRegisterShifts.id, shiftId)).returning();
        return closedShift;
      }
      async getCashRegisterShiftById(id) {
        const [shift] = await db.select().from(cashRegisterShifts).where(eq(cashRegisterShifts.id, id)).limit(1);
        return shift;
      }
      async getFinancialTransactionById(id) {
        const [transaction] = await db.select().from(financialTransactions).where(eq(financialTransactions.id, id)).limit(1);
        return transaction;
      }
      // Expense operations
      async getExpenses(restaurantId, branchId, filters) {
        let conditions = [eq(expenses.restaurantId, restaurantId)];
        if (branchId !== null) {
          conditions.push(
            or(
              eq(expenses.branchId, branchId),
              isNull(expenses.branchId)
            )
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
          conditions.push(sql3`${expenses.occurredAt} <= ${endOfDay}`);
        }
        const results = await db.select({
          expense: expenses,
          category: financialCategories,
          recordedBy: users,
          transaction: financialTransactions
        }).from(expenses).leftJoin(financialCategories, eq(expenses.categoryId, financialCategories.id)).leftJoin(users, eq(expenses.recordedByUserId, users.id)).leftJoin(financialTransactions, eq(expenses.transactionId, financialTransactions.id)).where(and(...conditions)).orderBy(desc(expenses.occurredAt));
        return results.map((r) => ({
          ...r.expense,
          category: r.category,
          recordedBy: r.recordedBy,
          transaction: r.transaction || void 0
        }));
      }
      async getExpenseById(id) {
        const [expense] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
        return expense;
      }
      async createExpense(restaurantId, branchId, userId, data) {
        return await db.transaction(async (tx) => {
          const amountDecimal = parseFloat(data.amount).toFixed(2);
          const [transaction] = await tx.insert(financialTransactions).values({
            restaurantId,
            recordedByUserId: userId,
            branchId: branchId || null,
            cashRegisterId: null,
            shiftId: null,
            categoryId: data.categoryId,
            type: "despesa",
            origin: "manual",
            description: data.description,
            paymentMethod: data.paymentMethod,
            amount: amountDecimal,
            referenceOrderId: null,
            occurredAt: new Date(data.occurredAt),
            note: data.note || null
          }).returning();
          const [newExpense] = await tx.insert(expenses).values({
            restaurantId,
            branchId: branchId || null,
            categoryId: data.categoryId,
            transactionId: transaction.id,
            description: data.description,
            amount: amountDecimal,
            paymentMethod: data.paymentMethod,
            occurredAt: new Date(data.occurredAt),
            recordedByUserId: userId,
            note: data.note || null
          }).returning();
          return newExpense;
        });
      }
      async updateExpense(restaurantId, id, data) {
        const existing = await this.getExpenseById(id);
        if (!existing) {
          throw new Error("Despesa n\xE3o encontrada");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("N\xE3o autorizado");
        }
        return await db.transaction(async (tx) => {
          const updateData = {};
          if (data.categoryId) updateData.categoryId = data.categoryId;
          if (data.description) updateData.description = data.description;
          if (data.amount) updateData.amount = parseFloat(data.amount).toFixed(2);
          if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
          if (data.occurredAt) updateData.occurredAt = new Date(data.occurredAt);
          if (data.note !== void 0) updateData.note = data.note;
          await tx.update(expenses).set(updateData).where(eq(expenses.id, id));
          if (existing.transactionId) {
            const txUpdateData = {};
            if (data.categoryId) txUpdateData.categoryId = data.categoryId;
            if (data.description) txUpdateData.description = data.description;
            if (data.amount) txUpdateData.amount = parseFloat(data.amount).toFixed(2);
            if (data.paymentMethod) txUpdateData.paymentMethod = data.paymentMethod;
            if (data.occurredAt) txUpdateData.occurredAt = new Date(data.occurredAt);
            if (data.note !== void 0) txUpdateData.note = data.note;
            await tx.update(financialTransactions).set(txUpdateData).where(eq(financialTransactions.id, existing.transactionId));
          }
          const updated = await this.getExpenseById(id);
          if (!updated) {
            throw new Error("Erro ao atualizar despesa");
          }
          return updated;
        });
      }
      async deleteExpense(restaurantId, id) {
        const existing = await this.getExpenseById(id);
        if (!existing) {
          throw new Error("Despesa n\xE3o encontrada");
        }
        if (existing.restaurantId !== restaurantId) {
          throw new Error("N\xE3o autorizado");
        }
        await db.transaction(async (tx) => {
          if (existing.transactionId) {
            await tx.delete(financialTransactions).where(eq(financialTransactions.id, existing.transactionId));
          }
          await tx.delete(expenses).where(eq(expenses.id, id));
        });
      }
      // Financial Reports
      async getFinancialReport(restaurantId, branchId, startDate, endDate) {
        let conditions = [
          eq(financialTransactions.restaurantId, restaurantId),
          gte(financialTransactions.occurredAt, startDate)
        ];
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        conditions.push(sql3`${financialTransactions.occurredAt} <= ${endOfDay}`);
        if (branchId !== null) {
          conditions.push(
            or(
              eq(financialTransactions.branchId, branchId),
              isNull(financialTransactions.branchId)
            )
          );
        }
        const transactions = await db.select({
          transaction: financialTransactions,
          category: financialCategories
        }).from(financialTransactions).leftJoin(financialCategories, eq(financialTransactions.categoryId, financialCategories.id)).where(and(...conditions));
        const totalRevenue = transactions.filter((t) => t.transaction.type === "receita").reduce((sum, t) => sum + parseFloat(t.transaction.amount), 0);
        const totalExpenses = transactions.filter((t) => t.transaction.type === "despesa").reduce((sum, t) => sum + parseFloat(t.transaction.amount), 0);
        const totalAdjustments = transactions.filter((t) => t.transaction.type === "ajuste").reduce((sum, t) => sum + parseFloat(t.transaction.amount), 0);
        const netBalance = totalRevenue - totalExpenses + totalAdjustments;
        const revenueByMethodMap = {};
        transactions.filter((t) => t.transaction.type === "receita").forEach((t) => {
          const method = t.transaction.paymentMethod;
          if (!revenueByMethodMap[method]) {
            revenueByMethodMap[method] = 0;
          }
          revenueByMethodMap[method] += parseFloat(t.transaction.amount);
        });
        const revenueByMethod = Object.entries(revenueByMethodMap).map(([method, total]) => ({
          method,
          total: total.toFixed(2)
        }));
        const expensesByCategoryMap = {};
        transactions.filter((t) => t.transaction.type === "despesa").forEach((t) => {
          const category = t.category?.name || "Sem categoria";
          if (!expensesByCategoryMap[category]) {
            expensesByCategoryMap[category] = 0;
          }
          expensesByCategoryMap[category] += parseFloat(t.transaction.amount);
        });
        const expensesByCategory = Object.entries(expensesByCategoryMap).map(([category, total]) => ({
          category,
          total: total.toFixed(2)
        }));
        const transactionsByDayMap = {};
        transactions.forEach((t) => {
          const date = new Date(t.transaction.occurredAt).toISOString().split("T")[0];
          if (!transactionsByDayMap[date]) {
            transactionsByDayMap[date] = { revenue: 0, expenses: 0 };
          }
          if (t.transaction.type === "receita") {
            transactionsByDayMap[date].revenue += parseFloat(t.transaction.amount);
          } else if (t.transaction.type === "despesa") {
            transactionsByDayMap[date].expenses += parseFloat(t.transaction.amount);
          }
        });
        const transactionsByDay = Object.entries(transactionsByDayMap).map(([date, data]) => ({
          date,
          revenue: data.revenue.toFixed(2),
          expenses: data.expenses.toFixed(2)
        })).sort((a, b) => a.date.localeCompare(b.date));
        return {
          totalRevenue: totalRevenue.toFixed(2),
          totalExpenses: totalExpenses.toFixed(2),
          totalAdjustments: totalAdjustments.toFixed(2),
          netBalance: netBalance.toFixed(2),
          revenueByMethod,
          expensesByCategory,
          transactionsByDay
        };
      }
      // Inventory Category operations
      async getInventoryCategories(restaurantId) {
        return await db.select().from(inventoryCategories).where(eq(inventoryCategories.restaurantId, restaurantId)).orderBy(inventoryCategories.name);
      }
      async createInventoryCategory(restaurantId, data) {
        const [category] = await db.insert(inventoryCategories).values({ ...data, restaurantId }).returning();
        return category;
      }
      async updateInventoryCategory(id, restaurantId, data) {
        const [category] = await db.update(inventoryCategories).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(
          and(
            eq(inventoryCategories.id, id),
            eq(inventoryCategories.restaurantId, restaurantId)
          )
        ).returning();
        return category;
      }
      async deleteInventoryCategory(id, restaurantId) {
        await db.delete(inventoryCategories).where(
          and(
            eq(inventoryCategories.id, id),
            eq(inventoryCategories.restaurantId, restaurantId)
          )
        );
      }
      // Measurement Unit operations
      async getMeasurementUnits(restaurantId) {
        return await db.select().from(measurementUnits).where(eq(measurementUnits.restaurantId, restaurantId)).orderBy(measurementUnits.name);
      }
      async createMeasurementUnit(restaurantId, data) {
        const [unit] = await db.insert(measurementUnits).values({ ...data, restaurantId }).returning();
        return unit;
      }
      async updateMeasurementUnit(id, restaurantId, data) {
        const [unit] = await db.update(measurementUnits).set(data).where(
          and(
            eq(measurementUnits.id, id),
            eq(measurementUnits.restaurantId, restaurantId)
          )
        ).returning();
        return unit;
      }
      async deleteMeasurementUnit(id, restaurantId) {
        await db.delete(measurementUnits).where(
          and(
            eq(measurementUnits.id, id),
            eq(measurementUnits.restaurantId, restaurantId)
          )
        );
      }
      // Inventory Item operations
      async getInventoryItems(restaurantId, filters) {
        let conditions = [eq(inventoryItems.restaurantId, restaurantId)];
        if (filters?.categoryId) {
          conditions.push(eq(inventoryItems.categoryId, filters.categoryId));
        }
        if (filters?.isActive !== void 0) {
          conditions.push(eq(inventoryItems.isActive, filters.isActive));
        }
        const items = await db.select({
          item: inventoryItems,
          category: inventoryCategories,
          unit: measurementUnits
        }).from(inventoryItems).leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id)).innerJoin(measurementUnits, eq(inventoryItems.unitId, measurementUnits.id)).where(and(...conditions)).orderBy(inventoryItems.name);
        return items.map((row) => ({
          ...row.item,
          category: row.category,
          unit: row.unit
        }));
      }
      async getInventoryItemById(id) {
        const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
        return item;
      }
      async createInventoryItem(restaurantId, data) {
        const itemData = {
          ...data,
          restaurantId
        };
        if (data.costPrice) itemData.costPrice = parseFloat(data.costPrice).toFixed(2);
        if (data.minStock) itemData.minStock = parseFloat(data.minStock).toFixed(2);
        if (data.maxStock) itemData.maxStock = parseFloat(data.maxStock).toFixed(2);
        if (data.reorderPoint) itemData.reorderPoint = parseFloat(data.reorderPoint).toFixed(2);
        const [item] = await db.insert(inventoryItems).values(itemData).returning();
        return item;
      }
      async updateInventoryItem(id, restaurantId, data) {
        const updateData = {};
        if (data.name) updateData.name = data.name;
        if (data.description !== void 0) updateData.description = data.description;
        if (data.sku !== void 0) updateData.sku = data.sku;
        if (data.categoryId !== void 0) updateData.categoryId = data.categoryId;
        if (data.unitId) updateData.unitId = data.unitId;
        if (data.costPrice) updateData.costPrice = parseFloat(data.costPrice).toFixed(2);
        if (data.minStock) updateData.minStock = parseFloat(data.minStock).toFixed(2);
        if (data.maxStock) updateData.maxStock = parseFloat(data.maxStock).toFixed(2);
        if (data.reorderPoint) updateData.reorderPoint = parseFloat(data.reorderPoint).toFixed(2);
        if (data.isActive !== void 0) updateData.isActive = data.isActive;
        updateData.updatedAt = /* @__PURE__ */ new Date();
        const [updated] = await db.update(inventoryItems).set(updateData).where(
          and(
            eq(inventoryItems.id, id),
            eq(inventoryItems.restaurantId, restaurantId)
          )
        ).returning();
        return updated;
      }
      async deleteInventoryItem(id, restaurantId) {
        await db.delete(inventoryItems).where(
          and(
            eq(inventoryItems.id, id),
            eq(inventoryItems.restaurantId, restaurantId)
          )
        );
      }
      // Branch Stock operations
      async getBranchStock(restaurantId, branchId) {
        const stocks = await db.select({
          stock: branchStock,
          item: inventoryItems,
          category: inventoryCategories,
          unit: measurementUnits
        }).from(branchStock).innerJoin(inventoryItems, eq(branchStock.inventoryItemId, inventoryItems.id)).leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id)).innerJoin(measurementUnits, eq(inventoryItems.unitId, measurementUnits.id)).where(
          and(
            eq(branchStock.restaurantId, restaurantId),
            eq(branchStock.branchId, branchId)
          )
        ).orderBy(inventoryItems.name);
        return stocks.map((row) => ({
          ...row.stock,
          inventoryItem: {
            ...row.item,
            category: row.category,
            unit: row.unit
          }
        }));
      }
      async getStockByItemId(restaurantId, branchId, inventoryItemId) {
        const [stock] = await db.select().from(branchStock).where(
          and(
            eq(branchStock.restaurantId, restaurantId),
            eq(branchStock.branchId, branchId),
            eq(branchStock.inventoryItemId, inventoryItemId)
          )
        );
        return stock;
      }
      async updateBranchStock(restaurantId, branchId, inventoryItemId, quantity) {
        const existing = await this.getStockByItemId(restaurantId, branchId, inventoryItemId);
        if (existing) {
          const [updated] = await db.update(branchStock).set({
            quantity: parseFloat(quantity).toFixed(2),
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(branchStock.id, existing.id)).returning();
          return updated;
        } else {
          const [created] = await db.insert(branchStock).values({
            restaurantId,
            branchId,
            inventoryItemId,
            quantity: parseFloat(quantity).toFixed(2)
          }).returning();
          return created;
        }
      }
      // Stock Movement operations
      async getStockMovements(restaurantId, branchId, filters) {
        let conditions = [
          eq(stockMovements.restaurantId, restaurantId),
          eq(stockMovements.branchId, branchId)
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
          conditions.push(sql3`${stockMovements.createdAt} <= ${endOfDay}`);
        }
        const movements = await db.select({
          movement: stockMovements,
          item: inventoryItems,
          user: users
        }).from(stockMovements).innerJoin(inventoryItems, eq(stockMovements.inventoryItemId, inventoryItems.id)).innerJoin(users, eq(stockMovements.recordedByUserId, users.id)).where(and(...conditions)).orderBy(desc(stockMovements.createdAt));
        return movements.map((row) => ({
          ...row.movement,
          inventoryItem: row.item,
          recordedBy: row.user
        }));
      }
      async createStockMovement(restaurantId, userId, data) {
        const branchId = data.branchId;
        if (!branchId) {
          throw new Error("Branch ID \xE9 obrigat\xF3rio para movimento de estoque");
        }
        return await db.transaction(async (tx) => {
          const currentStock = await this.getStockByItemId(
            restaurantId,
            branchId,
            data.inventoryItemId
          );
          const currentQuantity = currentStock ? parseFloat(currentStock.quantity) : 0;
          const movementQuantity = parseFloat(data.quantity);
          let newQuantity = currentQuantity;
          switch (data.movementType) {
            case "entrada":
              newQuantity = currentQuantity + movementQuantity;
              break;
            case "saida":
              newQuantity = currentQuantity - movementQuantity;
              if (newQuantity < 0) {
                throw new Error("Estoque insuficiente para realizar esta sa\xEDda");
              }
              break;
            case "ajuste":
              newQuantity = movementQuantity;
              break;
            case "transferencia":
              if (data.fromBranchId === data.branchId) {
                newQuantity = currentQuantity - movementQuantity;
                if (newQuantity < 0) {
                  throw new Error("Estoque insuficiente para realizar esta transfer\xEAncia");
                }
              } else if (data.toBranchId === data.branchId) {
                newQuantity = currentQuantity + movementQuantity;
              }
              break;
          }
          const [movement] = await tx.insert(stockMovements).values({
            inventoryItemId: data.inventoryItemId,
            branchId,
            movementType: data.movementType,
            fromBranchId: data.fromBranchId || null,
            toBranchId: data.toBranchId || null,
            restaurantId,
            recordedByUserId: userId,
            previousQuantity: currentQuantity.toFixed(2),
            newQuantity: newQuantity.toFixed(2),
            quantity: movementQuantity.toFixed(2),
            unitCost: data.unitCost ? parseFloat(data.unitCost).toFixed(2) : "0",
            totalCost: data.totalCost ? parseFloat(data.totalCost).toFixed(2) : "0",
            reason: data.reason || null,
            referenceId: data.referenceId || null
          }).returning();
          await this.updateBranchStock(
            restaurantId,
            branchId,
            data.inventoryItemId,
            newQuantity.toFixed(2)
          );
          if (data.movementType === "transferencia" && data.fromBranchId && data.toBranchId) {
            if (data.fromBranchId !== data.branchId && data.toBranchId !== data.branchId) {
              throw new Error("Transfer\xEAncia inv\xE1lida: a filial de origem ou destino deve ser a filial atual");
            }
            const otherBranchId = data.branchId === data.fromBranchId ? data.toBranchId : data.fromBranchId;
            const otherStock = await this.getStockByItemId(
              restaurantId,
              otherBranchId,
              data.inventoryItemId
            );
            const otherCurrentQuantity = otherStock ? parseFloat(otherStock.quantity) : 0;
            const otherNewQuantity = data.branchId === data.fromBranchId ? otherCurrentQuantity + movementQuantity : otherCurrentQuantity - movementQuantity;
            if (otherNewQuantity < 0) {
              throw new Error("Estoque insuficiente na filial de origem");
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
      async getInventoryStats(restaurantId, branchId) {
        const stocks = await this.getBranchStock(restaurantId, branchId);
        const totalValue = stocks.reduce((sum, stock) => {
          const quantity = parseFloat(stock.quantity);
          const costPrice = parseFloat(stock.inventoryItem.costPrice);
          return sum + quantity * costPrice;
        }, 0);
        const totalItems = stocks.length;
        const lowStockItems = stocks.filter((stock) => {
          const quantity = parseFloat(stock.quantity);
          const minStock = parseFloat(stock.inventoryItem.minStock);
          return quantity > 0 && quantity <= minStock;
        }).length;
        const outOfStockItems = stocks.filter((stock) => {
          return parseFloat(stock.quantity) === 0;
        }).length;
        return {
          totalValue: totalValue.toFixed(2),
          totalItems,
          lowStockItems,
          outOfStockItems
        };
      }
      // Recipe Ingredients operations
      async getRecipeIngredients(restaurantId, menuItemId, tx) {
        const executor = tx || db;
        const ingredients = await executor.select().from(recipeIngredients).leftJoin(inventoryItems, eq(recipeIngredients.inventoryItemId, inventoryItems.id)).leftJoin(measurementUnits, eq(inventoryItems.unitId, measurementUnits.id)).where(
          and(
            eq(recipeIngredients.restaurantId, restaurantId),
            eq(recipeIngredients.menuItemId, menuItemId)
          )
        ).orderBy(inventoryItems.name);
        return ingredients.map((row) => ({
          ...row.recipe_ingredients,
          inventoryItem: {
            ...row.inventory_items,
            unit: row.measurement_units
          }
        }));
      }
      async addRecipeIngredient(restaurantId, data) {
        const [ingredient] = await db.insert(recipeIngredients).values({
          ...data,
          restaurantId
        }).returning();
        return ingredient;
      }
      async updateRecipeIngredient(id, restaurantId, data) {
        const [updated] = await db.update(recipeIngredients).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(
          and(
            eq(recipeIngredients.id, id),
            eq(recipeIngredients.restaurantId, restaurantId)
          )
        ).returning();
        return updated;
      }
      async deleteRecipeIngredient(id, restaurantId) {
        await db.delete(recipeIngredients).where(
          and(
            eq(recipeIngredients.id, id),
            eq(recipeIngredients.restaurantId, restaurantId)
          )
        );
      }
      async getMenuItemRecipeCost(restaurantId, menuItemId) {
        const ingredients = await this.getRecipeIngredients(restaurantId, menuItemId);
        const totalCost = ingredients.reduce((sum, ingredient) => {
          const quantity = parseFloat(ingredient.quantity || "0");
          const costPrice = parseFloat(ingredient.inventoryItem.costPrice || "0");
          if (isNaN(quantity) || isNaN(costPrice)) {
            return sum;
          }
          return sum + quantity * costPrice;
        }, 0);
        return totalCost.toFixed(2);
      }
      async checkStockAvailability(restaurantId, branchId, menuItemId, quantity) {
        const ingredients = await this.getRecipeIngredients(restaurantId, menuItemId);
        const missingItems = [];
        for (const ingredient of ingredients) {
          const stock = await this.getStockByItemId(restaurantId, branchId, ingredient.inventoryItemId);
          const required = parseFloat(ingredient.quantity) * quantity;
          const available = stock ? parseFloat(stock.quantity) : 0;
          if (available < required) {
            missingItems.push({
              itemName: ingredient.inventoryItem.name,
              required: required.toFixed(2),
              available: available.toFixed(2)
            });
          }
        }
        return {
          available: missingItems.length === 0,
          missingItems
        };
      }
      async deductStockForOrder(restaurantId, branchId, orderId, userId, tx) {
        const order = await this.getOrderById(restaurantId, orderId);
        if (!order) {
          throw new Error("Pedido n\xE3o encontrado");
        }
        if (tx) {
          for (const orderItem of order.orderItems) {
            const ingredients = await this.getRecipeIngredients(restaurantId, orderItem.menuItemId, tx);
            if (ingredients.length === 0) {
              console.log(`Prato ${orderItem.menuItemId} n\xE3o possui receita cadastrada, pulando baixa de estoque`);
              continue;
            }
            for (const ingredient of ingredients) {
              const quantityToDeduct = parseFloat(ingredient.quantity) * orderItem.quantity;
              if (quantityToDeduct <= 0) {
                continue;
              }
              const [currentStock] = await tx.select().from(branchStock).where(
                and(
                  eq(branchStock.branchId, branchId),
                  eq(branchStock.inventoryItemId, ingredient.inventoryItemId)
                )
              );
              const previousQty = currentStock ? parseFloat(currentStock.quantity) : 0;
              const newQty = previousQty - quantityToDeduct;
              await tx.insert(stockMovements).values({
                restaurantId,
                branchId,
                inventoryItemId: ingredient.inventoryItemId,
                movementType: "saida",
                quantity: quantityToDeduct.toFixed(2),
                previousQuantity: previousQty.toFixed(2),
                newQuantity: newQty.toFixed(2),
                reason: `Venda - Pedido #${orderId.substring(0, 8)}`,
                referenceId: orderId,
                recordedByUserId: userId
              });
              if (currentStock) {
                await tx.update(branchStock).set({
                  quantity: newQty.toFixed(2),
                  updatedAt: /* @__PURE__ */ new Date()
                }).where(eq(branchStock.id, currentStock.id));
              }
            }
          }
        } else {
          for (const orderItem of order.orderItems) {
            const ingredients = await this.getRecipeIngredients(restaurantId, orderItem.menuItemId);
            if (ingredients.length === 0) {
              console.log(`Prato ${orderItem.menuItemId} n\xE3o possui receita cadastrada, pulando baixa de estoque`);
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
                movementType: "saida",
                quantity: quantityToDeduct.toFixed(2),
                reason: `Venda - Pedido #${orderId.substring(0, 8)}`,
                referenceId: orderId
              });
            }
          }
        }
      }
      async restoreStockForOrder(restaurantId, branchId, order, userId, tx) {
        for (const orderItem of order.orderItems) {
          const ingredients = await this.getRecipeIngredients(restaurantId, orderItem.menuItemId, tx);
          if (ingredients.length === 0) {
            console.log(`Prato ${orderItem.menuItemId} n\xE3o possui receita cadastrada, pulando devolu\xE7\xE3o de estoque`);
            continue;
          }
          for (const ingredient of ingredients) {
            const quantityToRestore = parseFloat(ingredient.quantity) * orderItem.quantity;
            if (quantityToRestore <= 0) {
              continue;
            }
            const [currentStock] = await tx.select().from(branchStock).where(
              and(
                eq(branchStock.branchId, branchId),
                eq(branchStock.inventoryItemId, ingredient.inventoryItemId)
              )
            );
            const previousQty = currentStock ? parseFloat(currentStock.quantity) : 0;
            const newQty = previousQty + quantityToRestore;
            await tx.insert(stockMovements).values({
              restaurantId,
              branchId,
              inventoryItemId: ingredient.inventoryItemId,
              movementType: "entrada",
              quantity: quantityToRestore.toFixed(2),
              previousQuantity: previousQty.toFixed(2),
              newQuantity: newQty.toFixed(2),
              reason: `Devolu\xE7\xE3o - Pedido #${order.id.substring(0, 8)} cancelado`,
              referenceId: order.id,
              recordedByUserId: userId
            });
            if (currentStock) {
              await tx.update(branchStock).set({
                quantity: newQty.toFixed(2),
                updatedAt: /* @__PURE__ */ new Date()
              }).where(eq(branchStock.id, currentStock.id));
            }
          }
        }
      }
      // ===== CUSTOMER OPERATIONS =====
      async getCustomers(restaurantId, branchId, filters) {
        let conditions = [eq(customers.restaurantId, restaurantId)];
        if (branchId !== void 0 && branchId !== null) {
          conditions.push(or(eq(customers.branchId, branchId), isNull(customers.branchId)));
        }
        if (filters?.isActive !== void 0) {
          conditions.push(eq(customers.isActive, filters.isActive));
        }
        let query = db.select().from(customers).where(and(...conditions));
        const results = await query.orderBy(desc(customers.createdAt));
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          return results.filter(
            (c) => c.name.toLowerCase().includes(searchTerm) || c.phone?.toLowerCase().includes(searchTerm) || c.email?.toLowerCase().includes(searchTerm) || c.cpf?.toLowerCase().includes(searchTerm)
          );
        }
        return results;
      }
      async getCustomerById(id) {
        const [customer] = await db.select().from(customers).where(eq(customers.id, id));
        return customer;
      }
      async getCustomerByPhone(restaurantId, phone) {
        const [customer] = await db.select().from(customers).where(and(eq(customers.restaurantId, restaurantId), eq(customers.phone, phone)));
        return customer;
      }
      async getCustomerByCpf(restaurantId, cpf) {
        const [customer] = await db.select().from(customers).where(and(eq(customers.restaurantId, restaurantId), eq(customers.cpf, cpf)));
        return customer;
      }
      async createCustomer(restaurantId, branchId, data) {
        const [customer] = await db.insert(customers).values({
          ...data,
          restaurantId,
          branchId
        }).returning();
        return customer;
      }
      async updateCustomer(id, restaurantId, data) {
        const [updated] = await db.update(customers).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(customers.id, id), eq(customers.restaurantId, restaurantId))).returning();
        return updated;
      }
      async deleteCustomer(id, restaurantId) {
        await db.delete(customers).where(and(eq(customers.id, id), eq(customers.restaurantId, restaurantId)));
      }
      async updateCustomerTier(customerId, restaurantId) {
        const customer = await this.getCustomerById(customerId);
        if (!customer) {
          throw new Error("Cliente n\xE3o encontrado");
        }
        const program = await this.getLoyaltyProgram(restaurantId);
        if (!program) {
          return customer;
        }
        const totalSpent = parseFloat(customer.totalSpent);
        let newTier = "bronze";
        if (totalSpent >= parseFloat(program.platinumTierMinSpent || "0")) {
          newTier = "platina";
        } else if (totalSpent >= parseFloat(program.goldTierMinSpent || "0")) {
          newTier = "ouro";
        } else if (totalSpent >= parseFloat(program.silverTierMinSpent || "0")) {
          newTier = "prata";
        }
        if (newTier !== customer.tier) {
          const [updated] = await db.update(customers).set({ tier: newTier, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customers.id, customerId)).returning();
          return updated;
        }
        return customer;
      }
      async getCustomerStats(restaurantId, branchId) {
        let conditions = [eq(customers.restaurantId, restaurantId)];
        if (branchId) {
          conditions.push(or(eq(customers.branchId, branchId), isNull(customers.branchId)));
        }
        const allCustomers = await db.select().from(customers).where(and(...conditions));
        const now = /* @__PURE__ */ new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const stats = {
          totalCustomers: allCustomers.length,
          activeCustomers: allCustomers.filter((c) => c.isActive === 1).length,
          newThisMonth: allCustomers.filter((c) => c.createdAt && c.createdAt >= firstDayOfMonth).length,
          topCustomers: []
        };
        const topCustomersData = allCustomers.sort((a, b) => parseFloat(b.totalSpent) - parseFloat(a.totalSpent)).slice(0, 5).map((c) => ({
          ...c,
          orderCount: c.visitCount
        }));
        stats.topCustomers = topCustomersData;
        return stats;
      }
      // ===== CUSTOMER SESSION OPERATIONS (Multi-device Authentication) =====
      async getOrCreateCustomerByPhone(restaurantId, phone) {
        const normalizedPhone = phone.replace(/[\s\-\(\)]/g, "");
        let customer = await this.getCustomerByPhone(restaurantId, normalizedPhone);
        if (!customer) {
          const [newCustomer] = await db.insert(customers).values({
            restaurantId,
            phone: normalizedPhone,
            name: `Cliente ${normalizedPhone.slice(-4)}`,
            // Temporary name using last 4 digits
            isActive: 1
          }).returning();
          return newCustomer;
        }
        return customer;
      }
      async createCustomerSession(customerId, restaurantId, deviceInfo, ipAddress) {
        const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
        const token = `cs_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1e3);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
        await db.update(customerSessions).set({ isActive: 0 }).where(
          and(
            eq(customerSessions.customerId, customerId),
            eq(customerSessions.restaurantId, restaurantId),
            eq(customerSessions.isActive, 1),
            isNull(customerSessions.otpCode)
            // Keep sessions that already verified
          )
        );
        const [session2] = await db.insert(customerSessions).values({
          customerId,
          restaurantId,
          token,
          otpCode,
          otpExpiresAt,
          otpAttempts: 0,
          deviceInfo,
          ipAddress,
          expiresAt,
          isActive: 1
        }).returning();
        return session2;
      }
      async verifyCustomerOtp(customerId, restaurantId, otpCode) {
        const [session2] = await db.select().from(customerSessions).where(
          and(
            eq(customerSessions.customerId, customerId),
            eq(customerSessions.restaurantId, restaurantId),
            eq(customerSessions.isActive, 1),
            isNotNull(customerSessions.otpCode)
          )
        ).orderBy(desc(customerSessions.createdAt)).limit(1);
        if (!session2) {
          return null;
        }
        if (session2.otpExpiresAt && new Date(session2.otpExpiresAt) < /* @__PURE__ */ new Date()) {
          await db.update(customerSessions).set({ isActive: 0 }).where(eq(customerSessions.id, session2.id));
          return null;
        }
        if (session2.otpAttempts >= 3) {
          await db.update(customerSessions).set({ isActive: 0 }).where(eq(customerSessions.id, session2.id));
          return null;
        }
        if (session2.otpCode !== otpCode) {
          const newAttempts = session2.otpAttempts + 1;
          await db.update(customerSessions).set({ otpAttempts: newAttempts }).where(eq(customerSessions.id, session2.id));
          if (newAttempts >= 3) {
            await db.update(customerSessions).set({ isActive: 0 }).where(eq(customerSessions.id, session2.id));
          }
          return null;
        }
        const newToken = `cs_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const [verifiedSession] = await db.update(customerSessions).set({
          token: newToken,
          otpCode: null,
          otpExpiresAt: null,
          otpAttempts: 0,
          lastActiveAt: /* @__PURE__ */ new Date()
        }).where(eq(customerSessions.id, session2.id)).returning();
        return verifiedSession;
      }
      async getCustomerSessionByToken(token) {
        const [result] = await db.select().from(customerSessions).innerJoin(customers, eq(customerSessions.customerId, customers.id)).where(
          and(
            eq(customerSessions.token, token),
            eq(customerSessions.isActive, 1),
            isNull(customerSessions.otpCode)
            // Only return verified sessions
          )
        ).limit(1);
        if (!result) {
          return null;
        }
        if (result.customer_sessions.expiresAt < /* @__PURE__ */ new Date()) {
          await db.update(customerSessions).set({ isActive: 0 }).where(eq(customerSessions.id, result.customer_sessions.id));
          return null;
        }
        await db.update(customerSessions).set({ lastActiveAt: /* @__PURE__ */ new Date() }).where(eq(customerSessions.id, result.customer_sessions.id));
        return {
          ...result.customer_sessions,
          customer: result.customers
        };
      }
      async refreshCustomerSession(token) {
        const sessionData = await this.getCustomerSessionByToken(token);
        if (!sessionData) {
          return null;
        }
        const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
        const [refreshedSession] = await db.update(customerSessions).set({
          expiresAt: newExpiresAt,
          lastActiveAt: /* @__PURE__ */ new Date()
        }).where(eq(customerSessions.token, token)).returning();
        return refreshedSession;
      }
      async invalidateCustomerSession(token) {
        await db.update(customerSessions).set({ isActive: 0 }).where(eq(customerSessions.token, token));
      }
      async invalidateAllCustomerSessions(customerId) {
        await db.update(customerSessions).set({ isActive: 0 }).where(eq(customerSessions.customerId, customerId));
      }
      async cleanupExpiredSessions() {
        await db.update(customerSessions).set({ isActive: 0 }).where(
          and(
            eq(customerSessions.isActive, 1),
            lt(customerSessions.expiresAt, /* @__PURE__ */ new Date())
          )
        );
      }
      // ===== LOYALTY PROGRAM OPERATIONS =====
      async getLoyaltyProgram(restaurantId) {
        const [program] = await db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.restaurantId, restaurantId));
        return program;
      }
      async createOrUpdateLoyaltyProgram(restaurantId, data) {
        const existing = await this.getLoyaltyProgram(restaurantId);
        if (existing) {
          const [updated] = await db.update(loyaltyPrograms).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(loyaltyPrograms.id, existing.id)).returning();
          return updated;
        } else {
          const [created] = await db.insert(loyaltyPrograms).values({ ...data, restaurantId }).returning();
          return created;
        }
      }
      // ===== LOYALTY TRANSACTION OPERATIONS =====
      async getLoyaltyTransactions(restaurantId, customerId, filters) {
        let conditions = [eq(loyaltyTransactions.restaurantId, restaurantId)];
        if (customerId) {
          conditions.push(eq(loyaltyTransactions.customerId, customerId));
        }
        if (filters?.startDate) {
          conditions.push(gte(loyaltyTransactions.createdAt, filters.startDate));
        }
        if (filters?.endDate) {
          conditions.push(sql3`${loyaltyTransactions.createdAt} <= ${filters.endDate}`);
        }
        const transactions = await db.select().from(loyaltyTransactions).leftJoin(customers, eq(loyaltyTransactions.customerId, customers.id)).where(and(...conditions)).orderBy(desc(loyaltyTransactions.createdAt));
        return transactions.map((t) => ({
          ...t.loyalty_transactions,
          customer: t.customers
        }));
      }
      async createLoyaltyTransaction(restaurantId, data) {
        const [transaction] = await db.insert(loyaltyTransactions).values({ ...data, restaurantId }).returning();
        await db.update(customers).set({
          loyaltyPoints: sql3`${customers.loyaltyPoints} + ${data.points}`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(customers.id, data.customerId));
        return transaction;
      }
      async calculateLoyaltyPoints(restaurantId, orderValue) {
        const program = await this.getLoyaltyProgram(restaurantId);
        if (!program || program.isActive !== 1) {
          return 0;
        }
        const pointsPerCurrency = parseFloat(program.pointsPerCurrency);
        return Math.floor(orderValue * pointsPerCurrency);
      }
      async redeemLoyaltyPoints(restaurantId, customerId, points, orderId, userId) {
        const customer = await this.getCustomerById(customerId);
        if (!customer) {
          throw new Error("Cliente n\xE3o encontrado");
        }
        if (customer.loyaltyPoints < points) {
          throw new Error("Pontos insuficientes");
        }
        const program = await this.getLoyaltyProgram(restaurantId);
        if (!program || program.isActive !== 1) {
          throw new Error("Programa de fidelidade n\xE3o est\xE1 ativo");
        }
        if (points < program.minPointsToRedeem) {
          throw new Error(`M\xEDnimo de ${program.minPointsToRedeem} pontos necess\xE1rio para resgate`);
        }
        const currencyPerPoint = parseFloat(program.currencyPerPoint);
        const discountAmount = points * currencyPerPoint;
        const transaction = await this.createLoyaltyTransaction(restaurantId, {
          customerId,
          orderId: orderId || null,
          type: "resgate",
          points: -points,
          description: `Resgate de ${points} pontos`,
          createdBy: userId || null
        });
        return { transaction, discountAmount };
      }
      // ===== COUPON OPERATIONS =====
      async getCoupons(restaurantId, branchId, filters) {
        let conditions = [eq(coupons.restaurantId, restaurantId)];
        if (branchId !== void 0 && branchId !== null) {
          conditions.push(or(eq(coupons.branchId, branchId), isNull(coupons.branchId)));
        }
        if (filters?.isActive !== void 0) {
          conditions.push(eq(coupons.isActive, filters.isActive));
        }
        if (filters?.code) {
          conditions.push(eq(coupons.code, filters.code.toUpperCase()));
        }
        return await db.select().from(coupons).where(and(...conditions)).orderBy(desc(coupons.createdAt));
      }
      async getCouponById(id) {
        const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
        return coupon;
      }
      async getCouponByCode(restaurantId, code) {
        const [coupon] = await db.select().from(coupons).where(and(eq(coupons.restaurantId, restaurantId), eq(coupons.code, code.toUpperCase())));
        return coupon;
      }
      async createCoupon(restaurantId, branchId, data, userId) {
        const [coupon] = await db.insert(coupons).values({
          ...data,
          restaurantId,
          branchId,
          code: data.code.toUpperCase(),
          validFrom: new Date(data.validFrom),
          validUntil: new Date(data.validUntil),
          createdBy: userId || null
        }).returning();
        return coupon;
      }
      async updateCoupon(id, restaurantId, data) {
        const updateData = { ...data, updatedAt: /* @__PURE__ */ new Date() };
        if (data.code) {
          updateData.code = data.code.toUpperCase();
        }
        if (data.validFrom) {
          updateData.validFrom = new Date(data.validFrom);
        }
        if (data.validUntil) {
          updateData.validUntil = new Date(data.validUntil);
        }
        const [updated] = await db.update(coupons).set(updateData).where(and(eq(coupons.id, id), eq(coupons.restaurantId, restaurantId))).returning();
        return updated;
      }
      async deleteCoupon(id, restaurantId) {
        await db.delete(coupons).where(and(eq(coupons.id, id), eq(coupons.restaurantId, restaurantId)));
      }
      async validateCoupon(restaurantId, code, orderValue, orderType, customerId) {
        const coupon = await this.getCouponByCode(restaurantId, code);
        if (!coupon) {
          return { valid: false, message: "Cupom n\xE3o encontrado" };
        }
        if (coupon.isActive !== 1) {
          return { valid: false, message: "Cupom inativo" };
        }
        const now = /* @__PURE__ */ new Date();
        if (coupon.validFrom > now) {
          return { valid: false, message: "Cupom ainda n\xE3o v\xE1lido" };
        }
        if (coupon.validUntil < now) {
          return { valid: false, message: "Cupom expirado" };
        }
        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
          return { valid: false, message: "Cupom atingiu limite de usos" };
        }
        if (orderValue < parseFloat(coupon.minOrderValue || "0")) {
          return {
            valid: false,
            message: `Pedido m\xEDnimo de ${coupon.minOrderValue} necess\xE1rio`
          };
        }
        if (orderType && coupon.applicableOrderTypes && coupon.applicableOrderTypes.length > 0) {
          if (!coupon.applicableOrderTypes.includes(orderType)) {
            return { valid: false, message: "Cupom n\xE3o v\xE1lido para este tipo de pedido" };
          }
        }
        if (customerId && coupon.maxUsesPerCustomer) {
          const usageCount = await db.select({ count: sql3`count(*)` }).from(couponUsages).where(
            and(
              eq(couponUsages.couponId, coupon.id),
              eq(couponUsages.customerId, customerId)
            )
          );
          if (usageCount[0].count >= coupon.maxUsesPerCustomer) {
            return { valid: false, message: "Voc\xEA j\xE1 atingiu o limite de usos deste cupom" };
          }
        }
        let discountAmount = 0;
        if (coupon.discountType === "valor") {
          discountAmount = parseFloat(coupon.discountValue);
        } else {
          discountAmount = orderValue * parseFloat(coupon.discountValue) / 100;
          if (coupon.maxDiscount) {
            discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
          }
        }
        return { valid: true, coupon, discountAmount };
      }
      async applyCoupon(restaurantId, couponId, orderId, customerId, discountApplied) {
        const [usage] = await db.insert(couponUsages).values({
          restaurantId,
          couponId,
          orderId,
          customerId: customerId || null,
          discountApplied: discountApplied?.toFixed(2) || "0"
        }).returning();
        await db.update(coupons).set({ currentUses: sql3`${coupons.currentUses} + 1` }).where(eq(coupons.id, couponId));
        return usage;
      }
      // ===== COUPON USAGE OPERATIONS =====
      async getCouponUsages(restaurantId, filters) {
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
          conditions.push(sql3`${couponUsages.createdAt} <= ${filters.endDate}`);
        }
        const usages = await db.select().from(couponUsages).leftJoin(coupons, eq(couponUsages.couponId, coupons.id)).leftJoin(customers, eq(couponUsages.customerId, customers.id)).leftJoin(orders, eq(couponUsages.orderId, orders.id)).where(and(...conditions)).orderBy(desc(couponUsages.createdAt));
        return usages.map((u) => ({
          ...u.coupon_usages,
          coupon: u.coupons,
          customer: u.customers || void 0,
          order: u.orders || void 0
        }));
      }
      async getCouponStats(restaurantId, branchId) {
        let conditions = [eq(coupons.restaurantId, restaurantId)];
        if (branchId) {
          conditions.push(or(eq(coupons.branchId, branchId), isNull(coupons.branchId)));
        }
        const allCoupons = await db.select().from(coupons).where(and(...conditions));
        const now = /* @__PURE__ */ new Date();
        const activeCoupons = allCoupons.filter(
          (c) => c.isActive === 1 && c.validFrom <= now && c.validUntil >= now
        );
        let usageConditions = [eq(couponUsages.restaurantId, restaurantId)];
        const allUsages = await db.select().from(couponUsages).where(and(...usageConditions));
        const totalDiscount = allUsages.reduce((sum, usage) => sum + parseFloat(usage.discountApplied), 0).toFixed(2);
        const couponUsageMap = /* @__PURE__ */ new Map();
        allUsages.forEach((usage) => {
          const existing = couponUsageMap.get(usage.couponId) || { count: 0, total: 0 };
          couponUsageMap.set(usage.couponId, {
            count: existing.count + 1,
            total: existing.total + parseFloat(usage.discountApplied)
          });
        });
        const topCoupons = Array.from(couponUsageMap.entries()).map(([couponId, stats]) => ({
          coupon: allCoupons.find((c) => c.id === couponId),
          usageCount: stats.count,
          totalDiscount: stats.total.toFixed(2)
        })).filter((item) => item.coupon).sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);
        return {
          totalCoupons: allCoupons.length,
          activeCoupons: activeCoupons.length,
          totalUsages: allUsages.length,
          totalDiscount,
          topCoupons
        };
      }
      // Order-Customer-Coupon-Loyalty integration methods
      async linkCustomerToOrder(restaurantId, orderId, customerId) {
        const [updated] = await db.update(orders).set({ customerId, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurantId))).returning();
        if (!updated) {
          throw new Error("Pedido n\xE3o encontrado");
        }
        return updated;
      }
      async applyCouponToOrder(restaurantId, orderId, couponId, discountAmount) {
        const order = await this.getOrderById(restaurantId, orderId);
        if (!order) {
          throw new Error("Pedido n\xE3o encontrado");
        }
        const subtotal = parseFloat(order.subtotal || "0");
        const discount = Math.min(discountAmount, subtotal);
        await db.update(orders).set({
          couponId,
          couponDiscount: discount.toFixed(2),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurantId)));
        await this.applyCoupon(restaurantId, couponId, orderId, order.customerId || void 0, discount);
        return this.calculateOrderTotal(orderId);
      }
      async redeemLoyaltyPointsForOrder(restaurantId, customerId, points, orderId, userId) {
        const result = await this.redeemLoyaltyPoints(restaurantId, customerId, points, orderId, userId);
        await db.update(orders).set({
          loyaltyPointsRedeemed: points,
          loyaltyDiscountAmount: result.discountAmount.toFixed(2),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurantId)));
        const order = await this.calculateOrderTotal(orderId);
        return {
          order,
          transaction: result.transaction,
          discountAmount: result.discountAmount
        };
      }
      async getLoyaltyStats(restaurantId) {
        const allTransactions = await db.select().from(loyaltyTransactions).where(eq(loyaltyTransactions.restaurantId, restaurantId));
        const totalPointsEarned = allTransactions.filter((t) => t.type === "ganho" || t.type === "bonus").reduce((sum, t) => sum + t.points, 0);
        const totalPointsRedeemed = allTransactions.filter((t) => t.type === "resgate" || t.type === "expiracao").reduce((sum, t) => sum + Math.abs(t.points), 0);
        const allCustomers = await db.select().from(customers).where(eq(customers.restaurantId, restaurantId));
        const activeCustomers = allCustomers.filter((c) => (c.loyaltyPoints || 0) > 0).length;
        const tierDistribution = {
          bronze: allCustomers.filter((c) => c.tier === "bronze").length,
          prata: allCustomers.filter((c) => c.tier === "prata").length,
          ouro: allCustomers.filter((c) => c.tier === "ouro").length,
          platina: allCustomers.filter((c) => c.tier === "platina").length
        };
        return {
          totalPointsEarned,
          totalPointsRedeemed,
          activeCustomers,
          tierDistribution
        };
      }
      // Subscription Plan operations
      async getSubscriptionPlans() {
        return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, 1)).orderBy(subscriptionPlans.displayOrder);
      }
      async getAllSubscriptionPlans() {
        return await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.displayOrder);
      }
      async getSubscriptionPlanById(id) {
        const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
        return plan;
      }
      async getSubscriptionPlanBySlug(slug) {
        const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, slug));
        return plan;
      }
      async updateSubscriptionPlan(id, data) {
        const [updated] = await db.update(subscriptionPlans).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(subscriptionPlans.id, id)).returning();
        return updated;
      }
      async seedSubscriptionPlans() {
        const plansData = [
          {
            name: "B\xE1sico",
            slug: "basico",
            description: "Ideal para pequenos restaurantes, lanchonetes e food trucks. Inclui funcionalidades essenciais para come\xE7ar.",
            priceMonthlyKz: "15000.00",
            priceAnnualKz: "144000.00",
            priceMonthlyUsd: "18.00",
            priceAnnualUsd: "172.80",
            trialDays: 14,
            maxBranches: 1,
            maxTables: 10,
            maxMenuItems: 50,
            maxOrdersPerMonth: 500,
            maxUsers: 2,
            historyRetentionDays: 30,
            features: [
              "pdv",
              "gestao_mesas",
              "menu_digital",
              "qr_code",
              "cozinha_tempo_real",
              "relatorios_basicos",
              "impressao_recibos",
              "suporte_email"
            ],
            isActive: 1,
            displayOrder: 1
          },
          {
            name: "Profissional",
            slug: "profissional",
            description: "Ideal para restaurantes m\xE9dios e cafeterias estabelecidas. Inclui sistema de fidelidade e cupons.",
            priceMonthlyKz: "35000.00",
            priceAnnualKz: "336000.00",
            priceMonthlyUsd: "42.00",
            priceAnnualUsd: "403.20",
            trialDays: 14,
            maxBranches: 3,
            maxTables: 30,
            maxMenuItems: 150,
            maxOrdersPerMonth: 2e3,
            maxUsers: 5,
            historyRetentionDays: 90,
            features: [
              "pdv",
              "gestao_mesas",
              "menu_digital",
              "qr_code",
              "cozinha_tempo_real",
              "relatorios_basicos",
              "impressao_recibos",
              "fidelidade",
              "cupons",
              "gestao_clientes",
              "delivery_takeout",
              "relatorios_avancados",
              "dashboard_analytics",
              "gestao_despesas",
              "multi_filial",
              "suporte_prioritario"
            ],
            isActive: 1,
            displayOrder: 2
          },
          {
            name: "Empresarial",
            slug: "empresarial",
            description: "Ideal para redes de restaurantes e franquias. Funcionalidades completas e multi-filial.",
            priceMonthlyKz: "70000.00",
            priceAnnualKz: "672000.00",
            priceMonthlyUsd: "84.00",
            priceAnnualUsd: "806.40",
            trialDays: 14,
            maxBranches: 10,
            maxTables: 100,
            maxMenuItems: 999999,
            maxOrdersPerMonth: 1e4,
            maxUsers: 15,
            historyRetentionDays: 365,
            features: [
              "pdv",
              "gestao_mesas",
              "menu_digital",
              "qr_code",
              "cozinha_tempo_real",
              "relatorios_basicos",
              "impressao_recibos",
              "fidelidade",
              "cupons",
              "gestao_clientes",
              "delivery_takeout",
              "relatorios_avancados",
              "dashboard_analytics",
              "gestao_despesas",
              "multi_filial",
              "inventario",
              "relatorios_financeiros",
              "api_integracoes",
              "exportacao_dados",
              "customizacao_visual",
              "multiplos_turnos",
              "suporte_whatsapp"
            ],
            isActive: 1,
            displayOrder: 3
          },
          {
            name: "Enterprise",
            slug: "enterprise",
            description: "Solu\xE7\xE3o personalizada para grandes cadeias e grupos de restaurantes. Tudo ilimitado com suporte dedicado.",
            priceMonthlyKz: "150000.00",
            priceAnnualKz: "1440000.00",
            priceMonthlyUsd: "180.00",
            priceAnnualUsd: "1728.00",
            trialDays: 30,
            maxBranches: 999999,
            maxTables: 999999,
            maxMenuItems: 999999,
            maxOrdersPerMonth: 999999,
            maxUsers: 999999,
            historyRetentionDays: 999999,
            features: [
              "tudo_ilimitado",
              "servidor_dedicado",
              "white_label",
              "integracao_personalizada",
              "treinamento_presencial",
              "sla_garantido",
              "suporte_24_7",
              "gerente_conta_dedicado"
            ],
            isActive: 1,
            displayOrder: 4
          }
        ];
        for (const plan of plansData) {
          await db.insert(subscriptionPlans).values(plan);
        }
      }
      // Subscription operations
      async getSubscriptionByRestaurantId(restaurantId) {
        const result = await db.select().from(subscriptions).leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id)).where(eq(subscriptions.restaurantId, restaurantId)).limit(1);
        if (result.length === 0 || !result[0].subscription_plans) {
          return void 0;
        }
        return {
          ...result[0].subscriptions,
          plan: result[0].subscription_plans
        };
      }
      async createSubscription(restaurantId, data) {
        const [subscription] = await db.insert(subscriptions).values({
          ...data,
          restaurantId
        }).returning();
        return subscription;
      }
      async updateSubscription(restaurantId, data) {
        const [updated] = await db.update(subscriptions).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(subscriptions.restaurantId, restaurantId)).returning();
        if (!updated) {
          throw new Error("Subscri\xE7\xE3o n\xE3o encontrada");
        }
        return updated;
      }
      async cancelSubscription(restaurantId) {
        const [canceled] = await db.update(subscriptions).set({
          status: "cancelada",
          canceledAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(subscriptions.restaurantId, restaurantId)).returning();
        if (!canceled) {
          throw new Error("Subscri\xE7\xE3o n\xE3o encontrada");
        }
        return canceled;
      }
      async checkSubscriptionLimits(restaurantId) {
        const subscriptionData = await this.getSubscriptionByRestaurantId(restaurantId);
        if (!subscriptionData) {
          throw new Error("Restaurante n\xE3o possui subscri\xE7\xE3o ativa");
        }
        const { plan, ...subscription } = subscriptionData;
        const branchesCount = await db.select({ count: sql3`count(*)` }).from(branches).where(eq(branches.restaurantId, restaurantId)).then((result) => Number(result[0]?.count || 0));
        const tablesCount = await db.select({ count: sql3`count(*)` }).from(tables).where(eq(tables.restaurantId, restaurantId)).then((result) => Number(result[0]?.count || 0));
        const menuItemsCount = await db.select({ count: sql3`count(*)` }).from(menuItems).where(eq(menuItems.restaurantId, restaurantId)).then((result) => Number(result[0]?.count || 0));
        const usersCount = await db.select({ count: sql3`count(*)` }).from(users).where(eq(users.restaurantId, restaurantId)).then((result) => Number(result[0]?.count || 0));
        const startOfMonth = /* @__PURE__ */ new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const ordersThisMonth = await db.select({ count: sql3`count(*)` }).from(orders).where(
          and(
            eq(orders.restaurantId, restaurantId),
            gte(orders.createdAt, startOfMonth),
            ne(orders.status, "cancelado")
          )
        ).then((result) => Number(result[0]?.count || 0));
        const customersCount = await db.select({ count: sql3`count(*)` }).from(customers).where(eq(customers.restaurantId, restaurantId)).then((result) => Number(result[0]?.count || 0));
        const activeCouponsCount = await db.select({ count: sql3`count(*)` }).from(coupons).where(
          and(
            eq(coupons.restaurantId, restaurantId),
            eq(coupons.isActive, 1)
          )
        ).then((result) => Number(result[0]?.count || 0));
        const inventoryItemsCount = await db.select({ count: sql3`count(*)` }).from(inventoryItems).where(eq(inventoryItems.restaurantId, restaurantId)).then((result) => Number(result[0]?.count || 0));
        const usage = {
          branches: branchesCount,
          tables: tablesCount,
          menuItems: menuItemsCount,
          users: usersCount,
          ordersThisMonth,
          customers: customersCount,
          activeCoupons: activeCouponsCount,
          inventoryItems: inventoryItemsCount
        };
        const isUnlimited = (limit) => limit >= 999999;
        const withinLimits = {
          branches: isUnlimited(plan.maxBranches) || branchesCount < plan.maxBranches,
          tables: isUnlimited(plan.maxTables) || tablesCount < plan.maxTables,
          menuItems: isUnlimited(plan.maxMenuItems) || menuItemsCount < plan.maxMenuItems,
          users: isUnlimited(plan.maxUsers) || usersCount < plan.maxUsers,
          orders: isUnlimited(plan.maxOrdersPerMonth) || ordersThisMonth < plan.maxOrdersPerMonth,
          customers: isUnlimited(plan.maxCustomers) || customersCount < plan.maxCustomers,
          coupons: isUnlimited(plan.maxActiveCoupons) || activeCouponsCount < plan.maxActiveCoupons,
          inventoryItems: isUnlimited(plan.maxInventoryItems) || inventoryItemsCount < plan.maxInventoryItems
        };
        return {
          plan,
          subscription,
          usage,
          withinLimits,
          canAddBranch: withinLimits.branches,
          canAddTable: withinLimits.tables,
          canAddMenuItem: withinLimits.menuItems,
          canAddUser: withinLimits.users,
          canCreateOrder: withinLimits.orders,
          canAddCustomer: withinLimits.customers,
          canAddCoupon: withinLimits.coupons,
          canAddInventoryItem: withinLimits.inventoryItems
        };
      }
      // Subscription Payment operations
      async getSubscriptionPayments(restaurantId) {
        return await db.select().from(subscriptionPayments).where(eq(subscriptionPayments.restaurantId, restaurantId)).orderBy(desc(subscriptionPayments.createdAt));
      }
      async createSubscriptionPayment(restaurantId, data) {
        const [payment] = await db.insert(subscriptionPayments).values({
          ...data,
          restaurantId
        }).returning();
        return payment;
      }
      // Subscription Usage operations
      async updateSubscriptionUsage(restaurantId, subscriptionId) {
        const subscriptionData = await this.getSubscriptionByRestaurantId(restaurantId);
        if (!subscriptionData) {
          throw new Error("Subscri\xE7\xE3o n\xE3o encontrada");
        }
        const { plan: _, ...subscription } = subscriptionData;
        const branchesCount = await db.select({ count: sql3`count(*)` }).from(branches).where(eq(branches.restaurantId, restaurantId)).then((result) => Number(result[0]?.count || 0));
        const tablesCount = await db.select({ count: sql3`count(*)` }).from(tables).where(eq(tables.restaurantId, restaurantId)).then((result) => Number(result[0]?.count || 0));
        const menuItemsCount = await db.select({ count: sql3`count(*)` }).from(menuItems).where(eq(menuItems.restaurantId, restaurantId)).then((result) => Number(result[0]?.count || 0));
        const usersCount = await db.select({ count: sql3`count(*)` }).from(users).where(eq(users.restaurantId, restaurantId)).then((result) => Number(result[0]?.count || 0));
        const ordersCount = await db.select({ count: sql3`count(*)` }).from(orders).where(
          and(
            eq(orders.restaurantId, restaurantId),
            gte(orders.createdAt, subscription.currentPeriodStart),
            ne(orders.status, "cancelado")
          )
        ).then((result) => Number(result[0]?.count || 0));
        const [usage] = await db.insert(subscriptionUsage).values({
          restaurantId,
          subscriptionId,
          periodStart: subscription.currentPeriodStart,
          periodEnd: subscription.currentPeriodEnd,
          branchesCount,
          tablesCount,
          menuItemsCount,
          ordersCount,
          usersCount,
          lastCalculatedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: [subscriptionUsage.restaurantId, subscriptionUsage.subscriptionId],
          set: {
            branchesCount,
            tablesCount,
            menuItemsCount,
            ordersCount,
            usersCount,
            lastCalculatedAt: /* @__PURE__ */ new Date()
          }
        }).returning();
        return usage;
      }
      // SuperAdmin Subscription operations
      async getAllSubscriptions() {
        const result = await db.select().from(subscriptions).leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id)).leftJoin(restaurants, eq(subscriptions.restaurantId, restaurants.id)).orderBy(desc(subscriptions.createdAt));
        return result.filter((r) => r.subscription_plans && r.restaurants).map((r) => ({
          ...r.subscriptions,
          plan: r.subscription_plans,
          restaurant: r.restaurants
        }));
      }
      async getSubscriptionById(id) {
        const result = await db.select().from(subscriptions).leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id)).leftJoin(restaurants, eq(subscriptions.restaurantId, restaurants.id)).where(eq(subscriptions.id, id)).limit(1);
        if (result.length === 0 || !result[0].subscription_plans || !result[0].restaurants) {
          return void 0;
        }
        return {
          ...result[0].subscriptions,
          plan: result[0].subscription_plans,
          restaurant: result[0].restaurants
        };
      }
      async updateSubscriptionById(id, data) {
        const [updated] = await db.update(subscriptions).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(subscriptions.id, id)).returning();
        if (!updated) {
          throw new Error("Subscri\xE7\xE3o n\xE3o encontrada");
        }
        return updated;
      }
      async cancelSubscriptionById(id) {
        const [canceled] = await db.update(subscriptions).set({
          status: "cancelada",
          canceledAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(subscriptions.id, id)).returning();
        if (!canceled) {
          throw new Error("Subscri\xE7\xE3o n\xE3o encontrada");
        }
        return canceled;
      }
      // ===== NOTIFICATION OPERATIONS =====
      async getNotifications(restaurantId, userId, limit = 50) {
        const conditions = [eq(notifications.restaurantId, restaurantId)];
        if (userId) {
          conditions.push(
            or(
              eq(notifications.userId, userId),
              isNull(notifications.userId)
            )
          );
        }
        return await db.select().from(notifications).where(and(...conditions)).orderBy(desc(notifications.createdAt)).limit(limit);
      }
      async getUnreadNotificationsCount(restaurantId, userId) {
        const conditions = [
          eq(notifications.restaurantId, restaurantId),
          eq(notifications.isRead, 0)
        ];
        if (userId) {
          conditions.push(
            or(
              eq(notifications.userId, userId),
              isNull(notifications.userId)
            )
          );
        }
        const result = await db.select({ count: sql3`count(*)` }).from(notifications).where(and(...conditions));
        return Number(result[0]?.count || 0);
      }
      async createNotification(restaurantId, data) {
        const [notification] = await db.insert(notifications).values({
          ...data,
          restaurantId
        }).returning();
        return notification;
      }
      async markNotificationAsRead(restaurantId, notificationId) {
        const [updated] = await db.update(notifications).set({
          isRead: 1,
          readAt: /* @__PURE__ */ new Date()
        }).where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.restaurantId, restaurantId)
          )
        ).returning();
        if (!updated) {
          throw new Error("Notifica\xE7\xE3o n\xE3o encontrada");
        }
        return updated;
      }
      async markAllNotificationsAsRead(restaurantId, userId) {
        const conditions = [
          eq(notifications.restaurantId, restaurantId),
          eq(notifications.isRead, 0)
        ];
        if (userId) {
          conditions.push(
            or(
              eq(notifications.userId, userId),
              isNull(notifications.userId)
            )
          );
        }
        await db.update(notifications).set({
          isRead: 1,
          readAt: /* @__PURE__ */ new Date()
        }).where(and(...conditions));
      }
      async deleteNotification(restaurantId, notificationId) {
        await db.delete(notifications).where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.restaurantId, restaurantId)
          )
        );
      }
      async deleteOldNotifications(restaurantId, daysOld) {
        const cutoffDate = /* @__PURE__ */ new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await db.delete(notifications).where(
          and(
            eq(notifications.restaurantId, restaurantId),
            lt(notifications.createdAt, cutoffDate)
          )
        ).returning();
        return result.length;
      }
      // ===== NOTIFICATION PREFERENCES OPERATIONS =====
      async getNotificationPreferences(restaurantId, userId) {
        const conditions = [eq(notificationPreferences.restaurantId, restaurantId)];
        if (userId) {
          conditions.push(eq(notificationPreferences.userId, userId));
        } else {
          conditions.push(isNull(notificationPreferences.userId));
        }
        const [prefs] = await db.select().from(notificationPreferences).where(and(...conditions));
        return prefs;
      }
      async upsertNotificationPreferences(restaurantId, userId, data) {
        const existing = await this.getNotificationPreferences(restaurantId, userId || void 0);
        if (existing) {
          const [updated] = await db.update(notificationPreferences).set({
            ...data,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(notificationPreferences.id, existing.id)).returning();
          return updated;
        } else {
          const [created] = await db.insert(notificationPreferences).values({
            restaurantId,
            userId,
            ...data
          }).returning();
          return created;
        }
      }
      // ===== CUSTOMER NOTIFICATION PREFERENCES OPERATIONS =====
      async getCustomerNotificationPreferences(customerId) {
        const [prefs] = await db.select().from(customerNotificationPreferences).where(eq(customerNotificationPreferences.customerId, customerId));
        return prefs;
      }
      async upsertCustomerNotificationPreferences(customerId, data) {
        const existing = await this.getCustomerNotificationPreferences(customerId);
        if (existing) {
          const [updated] = await db.update(customerNotificationPreferences).set({
            ...data,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(customerNotificationPreferences.id, existing.id)).returning();
          return updated;
        } else {
          const [created] = await db.insert(customerNotificationPreferences).values({
            customerId,
            ...data
          }).returning();
          return created;
        }
      }
      // ===== TABLE GUEST OPERATIONS =====
      async getTableGuests(sessionId) {
        return await db.select().from(tableGuests).where(eq(tableGuests.sessionId, sessionId)).orderBy(tableGuests.seatNumber);
      }
      async getTableGuestById(id) {
        const [guest] = await db.select().from(tableGuests).where(eq(tableGuests.id, id));
        return guest;
      }
      async getTableGuestByToken(token) {
        const [guest] = await db.select().from(tableGuests).where(eq(tableGuests.token, token));
        return guest;
      }
      async createTableGuest(restaurantId, data) {
        try {
          const existingGuests = await db.select().from(tableGuests).where(eq(tableGuests.sessionId, data.sessionId));
          const guestNumber = existingGuests.length + 1;
          console.log("Creating guest:", {
            restaurantId,
            sessionId: data.sessionId,
            tableId: data.tableId,
            name: data.name,
            guestNumber,
            existingGuestsCount: existingGuests.length
          });
          const [guest] = await db.insert(tableGuests).values({
            ...data,
            restaurantId,
            guestNumber
          }).returning();
          console.log("Guest created successfully:", guest.id);
          return guest;
        } catch (error) {
          console.error("Error creating guest:", error);
          throw new Error(`Failed to create guest: ${error.message}`);
        }
      }
      async updateTableGuest(id, data) {
        const updateData = { ...data };
        if (data.status === "saiu") {
          updateData.leftAt = /* @__PURE__ */ new Date();
        }
        const [updated] = await db.update(tableGuests).set(updateData).where(eq(tableGuests.id, id)).returning();
        return updated;
      }
      async removeTableGuest(id) {
        await db.delete(tableGuests).where(eq(tableGuests.id, id));
      }
      async calculateGuestSubtotal(guestId) {
        const items = await this.getGuestOrderItems(guestId);
        let subtotal = 0;
        for (const item of items) {
          const itemPrice = parseFloat(item.menuItem.price || "0");
          subtotal += itemPrice * item.quantity;
        }
        await db.update(tableGuests).set({ subtotal: subtotal.toFixed(2) }).where(eq(tableGuests.id, guestId));
        return subtotal.toFixed(2);
      }
      async recalculateGuestTotal(restaurantId, guestId) {
        const guest = await this.getTableGuestById(guestId);
        if (!guest || guest.restaurantId !== restaurantId) {
          throw new Error("Cliente n\xE3o encontrado ou n\xE3o pertence a este restaurante");
        }
        await this.calculateGuestSubtotal(guestId);
      }
      // ===== BILL SPLIT OPERATIONS =====
      async getBillSplits(sessionId) {
        return await db.select().from(tableBillSplits).where(eq(tableBillSplits.sessionId, sessionId)).orderBy(desc(tableBillSplits.createdAt));
      }
      async getBillSplitById(id) {
        const [split] = await db.select().from(tableBillSplits).where(eq(tableBillSplits.id, id));
        return split;
      }
      async createBillSplit(restaurantId, data) {
        const [split] = await db.insert(tableBillSplits).values({
          ...data,
          restaurantId
        }).returning();
        return split;
      }
      async updateBillSplit(id, data) {
        const [updated] = await db.update(tableBillSplits).set(data).where(eq(tableBillSplits.id, id)).returning();
        return updated;
      }
      async finalizeBillSplit(id) {
        const [finalized] = await db.update(tableBillSplits).set({
          isFinalized: 1,
          finalizedAt: /* @__PURE__ */ new Date()
        }).where(eq(tableBillSplits.id, id)).returning();
        return finalized;
      }
      async deleteBillSplit(id) {
        await db.delete(tableBillSplits).where(eq(tableBillSplits.id, id));
      }
      // ===== GUEST PAYMENT OPERATIONS =====
      async getGuestPayments(sessionId) {
        return await db.select().from(guestPayments).where(eq(guestPayments.sessionId, sessionId)).orderBy(desc(guestPayments.createdAt));
      }
      async getGuestPaymentsByGuest(guestId) {
        return await db.select().from(guestPayments).where(eq(guestPayments.guestId, guestId)).orderBy(desc(guestPayments.createdAt));
      }
      async createGuestPayment(restaurantId, data) {
        const [payment] = await db.insert(guestPayments).values({
          ...data,
          restaurantId
        }).returning();
        const guest = await this.getTableGuestById(data.guestId);
        if (guest) {
          const currentPaid = parseFloat(guest.paidAmount || "0");
          const newPaid = currentPaid + parseFloat(data.amount);
          await db.update(tableGuests).set({ paidAmount: newPaid.toFixed(2) }).where(eq(tableGuests.id, data.guestId));
          const subtotal = parseFloat(guest.subtotal || "0");
          if (newPaid >= subtotal) {
            await db.update(tableGuests).set({ status: "pago" }).where(eq(tableGuests.id, data.guestId));
          }
        }
        return payment;
      }
      // ===== ORDER-GUEST LINK OPERATIONS =====
      async linkOrderItemToGuest(orderItemId, guestId) {
        await db.update(orderItems).set({ guestId }).where(eq(orderItems.id, orderItemId));
        await this.calculateGuestSubtotal(guestId);
      }
      async unlinkOrderItemFromGuest(orderItemId) {
        const [item] = await db.select().from(orderItems).where(eq(orderItems.id, orderItemId));
        if (item?.guestId) {
          const oldGuestId = item.guestId;
          await db.update(orderItems).set({ guestId: null }).where(eq(orderItems.id, orderItemId));
          await this.calculateGuestSubtotal(oldGuestId);
        }
      }
      async getGuestOrderItems(guestId) {
        const items = await db.select({
          orderItem: orderItems,
          menuItem: menuItems
        }).from(orderItems).innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(eq(orderItems.guestId, guestId));
        return items.map((row) => ({
          ...row.orderItem,
          menuItem: row.menuItem
        }));
      }
      // ===== PRINTER CONFIGURATION METHODS =====
      async getPrinterConfigurations(restaurantId, branchId) {
        let query = db.select().from(printerConfigurations).where(eq(printerConfigurations.restaurantId, restaurantId));
        if (branchId) {
          query = query.where(
            or(
              eq(printerConfigurations.branchId, branchId),
              isNull(printerConfigurations.branchId)
            )
          );
        }
        return await query.orderBy(desc(printerConfigurations.createdAt));
      }
      async getPrinterConfigurationById(restaurantId, id) {
        const [config] = await db.select().from(printerConfigurations).where(
          and(
            eq(printerConfigurations.id, id),
            eq(printerConfigurations.restaurantId, restaurantId)
          )
        );
        return config;
      }
      async createPrinterConfiguration(restaurantId, data) {
        const [config] = await db.insert(printerConfigurations).values({
          ...data,
          restaurantId
        }).returning();
        return config;
      }
      async updatePrinterConfiguration(restaurantId, id, data) {
        const [config] = await db.update(printerConfigurations).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(
          and(
            eq(printerConfigurations.id, id),
            eq(printerConfigurations.restaurantId, restaurantId)
          )
        ).returning();
        if (!config) {
          throw new Error("Configura\xE7\xE3o de impressora n\xE3o encontrada");
        }
        return config;
      }
      async deletePrinterConfiguration(restaurantId, id) {
        await db.delete(printerConfigurations).where(
          and(
            eq(printerConfigurations.id, id),
            eq(printerConfigurations.restaurantId, restaurantId)
          )
        );
      }
      async getActivePrintersByType(restaurantId, printerType, branchId) {
        let query = db.select().from(printerConfigurations).where(
          and(
            eq(printerConfigurations.restaurantId, restaurantId),
            eq(printerConfigurations.printerType, printerType),
            eq(printerConfigurations.isActive, 1)
          )
        );
        if (branchId) {
          query = query.where(
            or(
              eq(printerConfigurations.branchId, branchId),
              isNull(printerConfigurations.branchId)
            )
          );
        }
        return await query;
      }
      // ===== PRINT HISTORY METHODS =====
      async getPrintHistory(restaurantId, limit = 50) {
        return await db.select().from(printHistory).where(eq(printHistory.restaurantId, restaurantId)).orderBy(desc(printHistory.printedAt)).limit(limit);
      }
      async createPrintHistory(restaurantId, data) {
        const [history] = await db.insert(printHistory).values({
          ...data,
          restaurantId
        }).returning();
        return history;
      }
      async getPrintHistoryByOrder(restaurantId, orderId) {
        return await db.select().from(printHistory).where(
          and(
            eq(printHistory.restaurantId, restaurantId),
            eq(printHistory.orderId, orderId)
          )
        ).orderBy(desc(printHistory.printedAt));
      }
      async getPrintStatistics(restaurantId, days = 7) {
        const startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - days);
        const stats = await db.select({
          printerType: printHistory.printerType,
          totalPrints: sql3`count(*)`,
          successfulPrints: sql3`count(*) filter (where ${printHistory.success} = 1)`,
          failedPrints: sql3`count(*) filter (where ${printHistory.success} = 0)`
        }).from(printHistory).where(
          and(
            eq(printHistory.restaurantId, restaurantId),
            gte(printHistory.printedAt, startDate)
          )
        ).groupBy(printHistory.printerType);
        return stats;
      }
      // ===== TABLE MANAGEMENT METHODS =====
      async getTableById(tableId) {
        const [table] = await db.select().from(tables).where(eq(tables.id, tableId));
        return table;
      }
      async openTable(tableId, customerCount) {
        const [table] = await db.update(tables).set({
          status: "ocupada",
          isOccupied: 1,
          customerCount: customerCount || 1,
          lastActivity: /* @__PURE__ */ new Date()
        }).where(eq(tables.id, tableId)).returning();
        return table;
      }
      async validateTableForOrder(tableId, restaurantId) {
        const [table] = await db.select().from(tables).where(
          and(
            eq(tables.id, tableId),
            eq(tables.restaurantId, restaurantId)
          )
        );
        return table;
      }
    };
    storage = new DatabaseStorage();
  }
});

// load-env.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
try {
  const envFilePath = path.join(__dirname, ".env");
  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, "utf8");
    envContent.split("\n").forEach((line) => {
      line = line.trim();
      if (line && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
    console.log("\u2713 Loaded .env file");
  }
} catch (error) {
  console.warn("Could not load .env file:", error.message);
}
try {
  const envFile = path.join(__dirname, ".cache/replit/env/latest.json");
  if (fs.existsSync(envFile)) {
    const data = JSON.parse(fs.readFileSync(envFile, "utf8"));
    const env = data.environment || {};
    const dbVars = ["DATABASE_URL", "PGHOST", "PGUSER", "PGPASSWORD", "PGDATABASE", "PGPORT"];
    dbVars.forEach((key) => {
      if (env[key] && !process.env[key]) {
        process.env[key] = env[key];
      }
    });
    console.log("\u2713 Loaded Replit environment cache");
  }
} catch (error) {
  console.warn("Could not load Replit environment cache:", error.message);
}

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/orderNumberGenerator.ts
init_db();
init_schema();
import { sql as sql5, and as and3, gte as gte2, eq as eq3 } from "drizzle-orm";
function getCurrentShift() {
  const now = /* @__PURE__ */ new Date();
  const hour = now.getHours();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  if (hour >= 6 && hour < 14) {
    return {
      start: new Date(today.setHours(6, 0, 0, 0)),
      end: new Date(today.setHours(14, 0, 0, 0)),
      name: "manha"
    };
  } else if (hour >= 14 && hour < 22) {
    return {
      start: new Date(today.setHours(14, 0, 0, 0)),
      end: new Date(today.setHours(22, 0, 0, 0)),
      name: "tarde"
    };
  } else {
    const nightStart = new Date(today);
    nightStart.setHours(22, 0, 0, 0);
    const nightEnd = new Date(today);
    if (hour < 6) {
      nightStart.setDate(nightStart.getDate() - 1);
    } else {
      nightEnd.setDate(nightEnd.getDate() + 1);
    }
    nightEnd.setHours(6, 0, 0, 0);
    return {
      start: nightStart,
      end: nightEnd,
      name: "noite"
    };
  }
}
var ORDER_TYPE_PREFIX = {
  mesa: "M",
  delivery: "D",
  balcao: "B"
};
async function generateOrderNumber(restaurantId, orderType) {
  const prefix = ORDER_TYPE_PREFIX[orderType];
  const shift = getCurrentShift();
  try {
    const lastOrder = await db.select({ orderNumber: orders.orderNumber }).from(orders).where(
      and3(
        eq3(orders.restaurantId, restaurantId),
        eq3(orders.orderType, orderType),
        gte2(orders.createdAt, shift.start)
      )
    ).orderBy(sql5`${orders.createdAt} DESC`).limit(1);
    let nextNumber = 1;
    if (lastOrder.length > 0 && lastOrder[0].orderNumber) {
      const lastNumber = parseInt(lastOrder[0].orderNumber.substring(1));
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    const formattedNumber = `${prefix}${nextNumber.toString().padStart(3, "0")}`;
    return formattedNumber;
  } catch (error) {
    console.error("Error generating order number:", error);
    const randomNum = Math.floor(Math.random() * 999) + 1;
    return `${prefix}${randomNum.toString().padStart(3, "0")}`;
  }
}

// server/routes.ts
init_auth();

// server/planLimits.ts
var PlanLimitError = class extends Error {
  constructor(message, limitType, current, max) {
    super(message);
    this.limitType = limitType;
    this.current = current;
    this.max = max;
    this.name = "PlanLimitError";
  }
};
var PlanFeatureError = class extends Error {
  constructor(message, featureName) {
    super(message);
    this.featureName = featureName;
    this.name = "PlanFeatureError";
  }
};
async function checkCanAddCustomer(storage2, restaurantId) {
  const limits = await storage2.checkSubscriptionLimits(restaurantId);
  if (!limits.canAddCustomer) {
    throw new PlanLimitError(
      `Limite de clientes atingido. O plano ${limits.plan.name} permite at\xE9 ${limits.plan.maxCustomers} clientes e voc\xEA j\xE1 possui ${limits.usage.customers}.`,
      "customers",
      limits.usage.customers,
      limits.plan.maxCustomers
    );
  }
}
async function checkCanUseLoyaltyProgram(storage2, restaurantId) {
  const limits = await storage2.checkSubscriptionLimits(restaurantId);
  if (!limits.plan.hasLoyaltyProgram) {
    throw new PlanFeatureError(
      `O programa de fidelidade n\xE3o est\xE1 dispon\xEDvel no plano ${limits.plan.name}. Fa\xE7a upgrade para o plano Profissional ou superior.`,
      "loyalty"
    );
  }
}
async function checkCanUseCouponSystem(storage2, restaurantId) {
  const limits = await storage2.checkSubscriptionLimits(restaurantId);
  if (!limits.plan.hasCouponSystem) {
    throw new PlanFeatureError(
      `O sistema de cupons n\xE3o est\xE1 dispon\xEDvel no plano ${limits.plan.name}. Fa\xE7a upgrade para o plano Profissional ou superior.`,
      "coupons"
    );
  }
}
async function checkCanCreateCoupon(storage2, restaurantId) {
  const limits = await storage2.checkSubscriptionLimits(restaurantId);
  if (!limits.plan.hasCouponSystem) {
    throw new PlanFeatureError(
      `O sistema de cupons n\xE3o est\xE1 dispon\xEDvel no plano ${limits.plan.name}. Fa\xE7a upgrade para o plano Profissional ou superior.`,
      "coupons"
    );
  }
  if (!limits.canAddCoupon) {
    throw new PlanLimitError(
      `Limite de cupons ativos atingido. O plano ${limits.plan.name} permite at\xE9 ${limits.plan.maxActiveCoupons} cupons ativos e voc\xEA j\xE1 possui ${limits.usage.activeCoupons}.`,
      "coupons",
      limits.usage.activeCoupons,
      limits.plan.maxActiveCoupons
    );
  }
}
async function checkCanUseExpenseTracking(storage2, restaurantId) {
  const limits = await storage2.checkSubscriptionLimits(restaurantId);
  if (!limits.plan.hasExpenseTracking) {
    throw new PlanFeatureError(
      `A gest\xE3o de despesas n\xE3o est\xE1 dispon\xEDvel no plano ${limits.plan.name}. Fa\xE7a upgrade para o plano Profissional ou superior.`,
      "expenses"
    );
  }
}
async function checkCanUseInventoryModule(storage2, restaurantId) {
  const limits = await storage2.checkSubscriptionLimits(restaurantId);
  if (!limits.plan.hasInventoryModule) {
    throw new PlanFeatureError(
      `O m\xF3dulo de invent\xE1rio n\xE3o est\xE1 dispon\xEDvel no plano ${limits.plan.name}. Fa\xE7a upgrade para o plano Empresarial ou superior.`,
      "inventory"
    );
  }
}
async function checkCanAddInventoryItem(storage2, restaurantId) {
  const limits = await storage2.checkSubscriptionLimits(restaurantId);
  if (!limits.plan.hasInventoryModule) {
    throw new PlanFeatureError(
      `O m\xF3dulo de invent\xE1rio n\xE3o est\xE1 dispon\xEDvel no plano ${limits.plan.name}. Fa\xE7a upgrade para o plano Empresarial ou superior.`,
      "inventory"
    );
  }
  if (!limits.canAddInventoryItem) {
    throw new PlanLimitError(
      `Limite de itens de invent\xE1rio atingido. O plano ${limits.plan.name} permite at\xE9 ${limits.plan.maxInventoryItems} itens e voc\xEA j\xE1 possui ${limits.usage.inventoryItems}.`,
      "inventoryItems",
      limits.usage.inventoryItems,
      limits.plan.maxInventoryItems
    );
  }
}

// server/routes.ts
init_schema();
import passport2 from "passport";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import multer from "multer";
import path2 from "path";
import { nanoid } from "nanoid";
import fs2 from "fs/promises";
import twilio from "twilio";
import { z as z2 } from "zod";
var twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;
var TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "";
async function sendWhatsAppOTP(phoneNumber, otpCode, restaurantName) {
  if (!twilioClient) {
    console.log("[WHATSAPP] Twilio not configured, skipping WhatsApp message");
    return false;
  }
  try {
    let formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
    if (!formattedPhone.startsWith("+")) {
      if (formattedPhone.startsWith("244")) {
        formattedPhone = "+" + formattedPhone;
      } else {
        formattedPhone = "+244" + formattedPhone;
      }
    }
    let fromNumber = TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber.startsWith("whatsapp:")) {
      fromNumber = "whatsapp:" + (fromNumber.startsWith("+") ? fromNumber : "+" + fromNumber);
    }
    const message = await twilioClient.messages.create({
      body: `\u{1F510} *${restaurantName}*

Seu c\xF3digo de verifica\xE7\xE3o \xE9: *${otpCode}*

Este c\xF3digo expira em 10 minutos.

Se voc\xEA n\xE3o solicitou este c\xF3digo, ignore esta mensagem.`,
      from: fromNumber,
      to: `whatsapp:${formattedPhone}`
    });
    console.log(`[WHATSAPP] OTP sent successfully to ${formattedPhone}, SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error("[WHATSAPP] Error sending OTP:", error.message);
    return false;
  }
}
var orderStatusMessages = {
  pendente: { emoji: "\u{1F4DD}", message: "Seu pedido foi recebido e est\xE1 aguardando confirma\xE7\xE3o." },
  em_preparo: { emoji: "\u{1F468}\u200D\u{1F373}", message: "Seu pedido est\xE1 sendo preparado!" },
  pronto: { emoji: "\u2705", message: "Seu pedido est\xE1 pronto! Aguardando entrega/retirada." },
  servido: { emoji: "\u{1F37D}\uFE0F", message: "Seu pedido foi entregue. Bom apetite!" }
};
async function sendWhatsAppOrderStatus(phoneNumber, restaurantName, orderNumber, status) {
  if (!twilioClient) {
    console.log("[WHATSAPP] Twilio not configured, skipping order status message");
    return false;
  }
  const statusInfo = orderStatusMessages[status];
  if (!statusInfo) {
    console.log(`[WHATSAPP] Unknown status: ${status}, skipping message`);
    return false;
  }
  try {
    let formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
    if (!formattedPhone.startsWith("+")) {
      if (formattedPhone.startsWith("244")) {
        formattedPhone = "+" + formattedPhone;
      } else {
        formattedPhone = "+244" + formattedPhone;
      }
    }
    let fromNumber = TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber.startsWith("whatsapp:")) {
      fromNumber = "whatsapp:" + (fromNumber.startsWith("+") ? fromNumber : "+" + fromNumber);
    }
    const message = await twilioClient.messages.create({
      body: `${statusInfo.emoji} *${restaurantName}*

*Pedido #${orderNumber}*
${statusInfo.message}

Obrigado pela prefer\xEAncia!`,
      from: fromNumber,
      to: `whatsapp:${formattedPhone}`
    });
    console.log(`[WHATSAPP] Order status sent to ${formattedPhone}, SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error("[WHATSAPP] Error sending order status:", error.message);
    return false;
  }
}
var restaurantStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "client/public/uploads/restaurants");
  },
  filename: (req, file, cb) => {
    const ext = path2.extname(file.originalname);
    const filename = `${nanoid()}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});
var uploadRestaurantImage = multer({
  storage: restaurantStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path2.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (file.mimetype === "image/svg+xml" || path2.extname(file.originalname).toLowerCase() === ".svg") {
      return cb(new Error("Arquivos SVG n\xE3o s\xE3o permitidos por motivos de seguran\xE7a"));
    }
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Apenas imagens s\xE3o permitidas (jpeg, jpg, png, gif, webp)"));
    }
  }
});
var menuItemStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "client/public/uploads/menu-items");
  },
  filename: (req, file, cb) => {
    const ext = path2.extname(file.originalname);
    const filename = `${nanoid()}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});
var uploadMenuItemImage = multer({
  storage: menuItemStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path2.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (file.mimetype === "image/svg+xml" || path2.extname(file.originalname).toLowerCase() === ".svg") {
      return cb(new Error("Arquivos SVG n\xE3o s\xE3o permitidos por motivos de seguran\xE7a"));
    }
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Apenas imagens s\xE3o permitidas (jpeg, jpg, png, gif, webp)"));
    }
  }
});
var profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "client/public/uploads/profile-images");
  },
  filename: (req, file, cb) => {
    const ext = path2.extname(file.originalname);
    const filename = `${nanoid()}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});
var uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: 2 * 1024 * 1024
    // 2MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path2.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (file.mimetype === "image/svg+xml" || path2.extname(file.originalname).toLowerCase() === ".svg") {
      return cb(new Error("Arquivos SVG n\xE3o s\xE3o permitidos por motivos de seguran\xE7a"));
    }
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Apenas imagens s\xE3o permitidas (jpeg, jpg, png, gif, webp)"));
    }
  }
});
async function deleteOldImage(imageUrl, type = "restaurants") {
  if (!imageUrl) return;
  try {
    const filename = imageUrl.split("/").pop();
    if (!filename) return;
    const filePath = path2.join(`client/public/uploads/${type}`, filename);
    await fs2.unlink(filePath);
  } catch (error) {
    console.log("Could not delete old image:", error);
  }
}
function isAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "N\xE3o autenticado" });
  }
  const user = req.user;
  if (user.role !== "admin" && user.role !== "superadmin" && user.role !== "manager") {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores podem realizar esta a\xE7\xE3o." });
  }
  if ((user.role === "admin" || user.role === "manager") && !user.restaurantId) {
    return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
  }
  next();
}
function isOperational(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "N\xE3o autenticado" });
  }
  const user = req.user;
  const allowedRoles = ["admin", "superadmin", "manager", "cashier", "waiter"];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ message: "Acesso negado. Voc\xEA n\xE3o tem permiss\xE3o para esta a\xE7\xE3o." });
  }
  if (user.role !== "superadmin" && !user.restaurantId) {
    return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
  }
  next();
}
function isCashierOrAbove(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "N\xE3o autenticado" });
  }
  const user = req.user;
  const allowedRoles = ["admin", "superadmin", "manager", "cashier"];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ message: "Acesso negado. Voc\xEA n\xE3o tem permiss\xE3o para esta a\xE7\xE3o." });
  }
  if (user.role !== "superadmin" && !user.restaurantId) {
    return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
  }
  next();
}
function isSuperAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "N\xE3o autenticado" });
  }
  const user = req.user;
  if (user.role !== "superadmin") {
    return res.status(403).json({ message: "Acesso negado. Apenas super administradores podem realizar esta a\xE7\xE3o." });
  }
  next();
}
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.use("/api/public", (req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });
  app2.post("/api/restaurants/register", async (req, res) => {
    try {
      const data = insertRestaurantSchema.parse(req.body);
      const existingRestaurant = await storage.getRestaurantByEmail(data.email);
      if (existingRestaurant) {
        return res.status(400).json({ message: "Email j\xE1 cadastrado" });
      }
      const selectedPlan = await storage.getSubscriptionPlanById(data.planId);
      if (!selectedPlan) {
        return res.status(400).json({ message: "Plano de subscri\xE7\xE3o n\xE3o encontrado" });
      }
      if (!selectedPlan.isActive) {
        return res.status(400).json({ message: "Plano de subscri\xE7\xE3o n\xE3o est\xE1 ativo" });
      }
      const { restaurant, adminUser } = await storage.createRestaurant(data);
      try {
        const currentDate = /* @__PURE__ */ new Date();
        const trialEndDate = new Date(currentDate);
        trialEndDate.setDate(trialEndDate.getDate() + 30);
        await storage.createSubscription(restaurant.id, {
          planId: data.planId,
          status: "trial",
          billingInterval: "mensal",
          // Default to monthly
          currency: "AOA",
          // Default to AOA
          currentPeriodStart: currentDate,
          currentPeriodEnd: trialEndDate,
          trialEnd: trialEndDate
        });
      } catch (subscriptionError) {
        console.error("Error creating subscription for new restaurant:", subscriptionError);
        try {
          await storage.deleteUser(restaurant.id, adminUser.id);
          await storage.deleteRestaurant(restaurant.id);
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
        return res.status(500).json({ message: "Erro ao criar subscri\xE7\xE3o. Por favor, tente novamente." });
      }
      res.json({
        message: "Cadastro realizado com sucesso! Aguarde aprova\xE7\xE3o do super administrador.",
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          email: restaurant.email,
          status: restaurant.status
        }
      });
    } catch (error) {
      console.error("Restaurant registration error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      res.status(500).json({ message: "Erro ao cadastrar restaurante", details: errorMessage });
    }
  });
  app2.post("/api/auth/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
    }
    passport2.authenticate("local", async (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer login" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Email ou senha incorretos" });
      }
      if (user.role !== "superadmin" && user.restaurantId) {
        const restaurant = await storage.getRestaurantById(user.restaurantId);
        if (!restaurant) {
          return res.status(403).json({ message: "Restaurante n\xE3o encontrado" });
        }
        if (restaurant.status !== "ativo") {
          return res.status(403).json({ message: "Restaurante ainda n\xE3o foi aprovado ou est\xE1 suspenso" });
        }
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Erro ao fazer login" });
        }
        const userWithoutPassword = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          restaurantId: user.restaurantId,
          activeBranchId: user.activeBranchId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      req.session.destroy((destroyErr) => {
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    });
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        restaurantId: user.restaurantId,
        activeBranchId: user.activeBranchId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usu\xE1rio" });
    }
  });
  app2.patch("/api/auth/profile", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      const data = updateProfileSchema.parse(req.body);
      if (data.email) {
        const existingUser = await storage.getUserByEmail(data.email);
        if (existingUser && existingUser.id !== currentUser.id) {
          return res.status(400).json({ message: "Email j\xE1 est\xE1 em uso por outro usu\xE1rio" });
        }
      }
      const restaurantId = currentUser.role === "superadmin" ? null : currentUser.restaurantId || null;
      const updatedUser = await storage.updateUser(restaurantId, currentUser.id, data);
      const userWithoutPassword = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        restaurantId: updatedUser.restaurantId,
        activeBranchId: updatedUser.activeBranchId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  });
  app2.patch("/api/auth/password", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      const data = updatePasswordSchema.parse(req.body);
      const user = await storage.getUser(currentUser.id);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      const { verifyPassword: verifyPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const isValidPassword = await verifyPassword2(data.currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }
      const hashedPassword = await hashPassword(data.newPassword);
      await storage.updateUserPassword(currentUser.id, hashedPassword);
      res.json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar senha" });
    }
  });
  app2.post("/api/auth/profile-image", isAuthenticated, uploadProfileImage.single("image"), async (req, res) => {
    try {
      const currentUser = req.user;
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
      }
      const imageUrl = `/uploads/profile-images/${req.file.filename}`;
      const user = await storage.getUser(currentUser.id);
      if (user?.profileImageUrl) {
        await deleteOldImage(user.profileImageUrl, "profile-images");
      }
      const restaurantId = currentUser.role === "superadmin" ? null : currentUser.restaurantId || null;
      await storage.updateUser(restaurantId, currentUser.id, { profileImageUrl: imageUrl });
      res.json({ imageUrl });
    } catch (error) {
      if (req.file) {
        await fs2.unlink(req.file.path).catch(() => {
        });
      }
      res.status(500).json({ message: error.message || "Erro ao fazer upload da imagem" });
    }
  });
  app2.patch("/api/auth/active-branch", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      const { branchId } = req.body;
      if (branchId) {
        const branch = await storage.getBranchById(branchId);
        if (!branch) {
          return res.status(404).json({ message: "Filial n\xE3o encontrada" });
        }
        if (branch.restaurantId !== currentUser.restaurantId) {
          return res.status(403).json({ message: "Filial n\xE3o pertence ao seu restaurante" });
        }
      }
      const updatedUser = await storage.updateUserActiveBranch(currentUser.id, branchId || null);
      const userWithoutPassword = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        restaurantId: updatedUser.restaurantId,
        activeBranchId: updatedUser.activeBranchId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar filial ativa" });
    }
  });
  app2.get("/api/branches", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const branches2 = await storage.getBranches(currentUser.restaurantId);
      res.json(branches2);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar filiais" });
    }
  });
  app2.post("/api/branches", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      if (currentUser.role !== "superadmin") {
        const subscription = await storage.getSubscriptionByRestaurantId(currentUser.restaurantId);
        if (subscription) {
          const plan = await storage.getSubscriptionPlanById(subscription.planId);
          if (plan && plan.maxBranches !== null) {
            const currentBranches = await storage.getBranches(currentUser.restaurantId);
            if (currentBranches.length >= plan.maxBranches) {
              return res.status(403).json({
                message: `Limite de filiais atingido. Seu plano permite at\xE9 ${plan.maxBranches} filiais. Fa\xE7a upgrade para adicionar mais.`
              });
            }
          }
        }
      }
      const data = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(currentUser.restaurantId, data);
      res.json(branch);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao criar filial" });
    }
  });
  app2.patch("/api/branches/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const data = updateBranchSchema.parse(req.body);
      const branch = await storage.updateBranch(currentUser.restaurantId, req.params.id, data);
      res.json(branch);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar filial" });
    }
  });
  app2.delete("/api/branches/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deleteBranch(currentUser.restaurantId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar filial";
      res.status(500).json({ message: errorMessage });
    }
  });
  app2.get("/api/superadmin/restaurants", isSuperAdmin, async (req, res) => {
    try {
      const restaurants2 = await storage.getRestaurants();
      const enrichedRestaurants = await Promise.all(
        restaurants2.map(async (restaurant) => {
          const subscription = await storage.getSubscriptionByRestaurantId(restaurant.id);
          if (subscription) {
            const plan = await storage.getSubscriptionPlanById(subscription.planId);
            return {
              ...restaurant,
              subscription: {
                id: subscription.id,
                status: subscription.status,
                billingInterval: subscription.billingInterval,
                currentPeriodEnd: subscription.currentPeriodEnd
              },
              plan: plan ? {
                id: plan.id,
                name: plan.name,
                maxUsers: plan.maxUsers,
                maxBranches: plan.maxBranches,
                maxTables: plan.maxTables,
                maxMenuItems: plan.maxMenuItems
              } : null
            };
          }
          return {
            ...restaurant,
            subscription: null,
            plan: null
          };
        })
      );
      res.json(enrichedRestaurants);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar restaurantes" });
    }
  });
  app2.patch("/api/superadmin/restaurants/:id/status", isSuperAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pendente", "ativo", "suspenso"].includes(status)) {
        return res.status(400).json({ message: "Status inv\xE1lido" });
      }
      const restaurant = await storage.updateRestaurantStatus(req.params.id, status);
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar status do restaurante" });
    }
  });
  app2.delete("/api/superadmin/restaurants/:id", isSuperAdmin, async (req, res) => {
    try {
      await storage.deleteRestaurant(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar restaurante" });
    }
  });
  app2.get("/api/superadmin/restaurants/:id/admins", isSuperAdmin, async (req, res) => {
    try {
      const admins = await storage.getRestaurantAdmins(req.params.id);
      const adminsWithoutPassword = admins.map((admin) => ({
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        restaurantId: admin.restaurantId,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }));
      res.json(adminsWithoutPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar administradores do restaurante";
      res.status(500).json({ message: errorMessage });
    }
  });
  app2.patch("/api/superadmin/restaurants/:restaurantId/admins/:userId/credentials", isSuperAdmin, async (req, res) => {
    try {
      const data = resetRestaurantAdminCredentialsSchema.parse(req.body);
      const updateData = {};
      if (data.email) updateData.email = data.email;
      if (data.newPassword) {
        updateData.password = await hashPassword(data.newPassword);
      }
      const updatedUser = await storage.resetRestaurantAdminCredentials(
        req.params.restaurantId,
        req.params.userId,
        updateData
      );
      const userWithoutPassword = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        restaurantId: updatedUser.restaurantId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };
      res.json({
        success: true,
        message: "Credenciais atualizadas com sucesso",
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      const errorMessage = error instanceof Error ? error.message : "Erro ao resetar credenciais";
      res.status(500).json({ message: errorMessage });
    }
  });
  app2.patch("/api/restaurants/slug", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const data = updateRestaurantSlugSchema.parse(req.body);
      const existingRestaurant = await storage.getRestaurantBySlug(data.slug);
      if (existingRestaurant && existingRestaurant.id !== currentUser.restaurantId) {
        return res.status(400).json({ message: "Este slug j\xE1 est\xE1 em uso por outro restaurante" });
      }
      const restaurant = await storage.updateRestaurantSlug(currentUser.restaurantId, data.slug);
      res.json(restaurant);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar slug do restaurante" });
    }
  });
  app2.patch("/api/restaurants/appearance", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const data = updateRestaurantAppearanceSchema.parse(req.body);
      const restaurant = await storage.updateRestaurantAppearance(currentUser.restaurantId, data);
      res.json(restaurant);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar apar\xEAncia do restaurante" });
    }
  });
  app2.put("/api/restaurants/:id/business-hours", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      const { id } = req.params;
      if (!currentUser.restaurantId || currentUser.restaurantId !== id) {
        return res.status(403).json({ message: "N\xE3o autorizado" });
      }
      const { businessHours, isOpen } = req.body;
      const restaurant = await storage.updateRestaurantAppearance(id, {
        businessHours,
        isOpen
      });
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar hor\xE1rios de funcionamento" });
    }
  });
  app2.patch("/api/restaurants/:restaurantId/toggle-open", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      const { restaurantId } = req.params;
      if (currentUser.role !== "superadmin" && currentUser.restaurantId !== restaurantId) {
        return res.status(403).json({ message: "N\xE3o autorizado" });
      }
      const { isOpen } = req.body;
      const restaurant = await storage.updateRestaurantAppearance(restaurantId, { isOpen });
      res.json({
        message: isOpen ? "Restaurante aberto" : "Restaurante fechado",
        restaurant
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar status do restaurante" });
    }
  });
  app2.post("/api/restaurants/upload-logo", isAdmin, uploadRestaurantImage.single("logo"), async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }
      const currentRestaurant = await storage.getRestaurantById(currentUser.restaurantId);
      if (currentRestaurant?.logoUrl) {
        await deleteOldImage(currentRestaurant.logoUrl);
      }
      const logoUrl = `/uploads/restaurants/${req.file.filename}`;
      const restaurant = await storage.updateRestaurantAppearance(currentUser.restaurantId, { logoUrl });
      res.json({
        message: "Logo atualizado com sucesso",
        logoUrl,
        restaurant
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer upload do logo";
      res.status(500).json({ message: errorMessage });
    }
  });
  app2.post("/api/restaurants/upload-hero", isAdmin, uploadRestaurantImage.single("heroImage"), async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }
      const currentRestaurant = await storage.getRestaurantById(currentUser.restaurantId);
      if (currentRestaurant?.heroImageUrl) {
        await deleteOldImage(currentRestaurant.heroImageUrl);
      }
      const heroImageUrl = `/uploads/restaurants/${req.file.filename}`;
      const restaurant = await storage.updateRestaurantAppearance(currentUser.restaurantId, { heroImageUrl });
      res.json({
        message: "Foto de capa atualizada com sucesso",
        heroImageUrl,
        restaurant
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer upload da foto de capa";
      res.status(500).json({ message: errorMessage });
    }
  });
  app2.patch("/api/restaurants/:restaurantId/business-hours", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      const { restaurantId } = req.params;
      const { businessHours, isOpen } = req.body;
      if (currentUser.role !== "superadmin" && currentUser.restaurantId !== restaurantId) {
        return res.status(403).json({ message: "Sem permiss\xE3o para atualizar este restaurante" });
      }
      const updates = {};
      if (businessHours !== void 0) updates.businessHours = businessHours;
      if (isOpen !== void 0) updates.isOpen = isOpen;
      const restaurant = await storage.updateRestaurantAppearance(restaurantId, updates);
      res.json({
        message: "Hor\xE1rios atualizados com sucesso",
        restaurant
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar hor\xE1rios";
      res.status(500).json({ message: errorMessage });
    }
  });
  app2.get("/api/superadmin/stats", isSuperAdmin, async (req, res) => {
    try {
      const stats = await storage.getSuperAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estat\xEDsticas" });
    }
  });
  app2.get("/api/superadmin/analytics", isSuperAdmin, async (req, res) => {
    try {
      const analytics = await storage.getSuperAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      app2.get("/api/analytics/link/:restaurantId", async (req2, res2) => {
        try {
          const restaurantId = parseInt(req2.params.restaurantId);
          if (!restaurantId) {
            return res2.status(400).json({ error: "Restaurant ID inv\xE1lido" });
          }
          const summaryResult = await db.execute(sql4`
        SELECT 
          COUNT(*) as total_clicks,
          COUNT(DISTINCT session_id) as unique_visitors,
          COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '7 days') as clicks_this_week,
          COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '30 days') as clicks_this_month,
          COUNT(*) FILTER (WHERE converted = 1) as total_conversions,
          CASE 
            WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE converted = 1)::numeric / COUNT(*)) * 100, 2)
            ELSE 0
          END as conversion_rate,
          MAX(timestamp) as last_accessed
        FROM link_analytics
        WHERE restaurant_id = ${restaurantId}
      `);
          const sourcesResult = await db.execute(sql4`
        SELECT 
          COALESCE(source, 'Direto') as source,
          COUNT(*) as clicks
        FROM link_analytics
        WHERE restaurant_id = ${restaurantId}
        GROUP BY source
        ORDER BY clicks DESC
        LIMIT 3
      `);
          const summary = summaryResult.rows[0] || {
            total_clicks: 0,
            unique_visitors: 0,
            clicks_this_week: 0,
            clicks_this_month: 0,
            total_conversions: 0,
            conversion_rate: 0,
            last_accessed: null
          };
          const topSources = sourcesResult.rows || [];
          res2.json({
            totalClicks: parseInt(summary.total_clicks) || 0,
            uniqueVisitors: parseInt(summary.unique_visitors) || 0,
            clicksThisWeek: parseInt(summary.clicks_this_week) || 0,
            clicksThisMonth: parseInt(summary.clicks_this_month) || 0,
            conversionRate: parseFloat(summary.conversion_rate) || 0,
            lastAccessed: summary.last_accessed,
            topSources: topSources.map((s) => ({
              source: s.source,
              clicks: parseInt(s.clicks)
            })),
            recentClicks: []
          });
        } catch (error2) {
          console.error("Error fetching link analytics:", error2);
          res2.status(500).json({ error: "Erro ao buscar analytics" });
        }
      });
      app2.post("/api/analytics/link/track", async (req2, res2) => {
        try {
          const { restaurantId, source, sessionId } = req2.body;
          if (!restaurantId) {
            return res2.status(400).json({ error: "Restaurant ID obrigat\xF3rio" });
          }
          const referrer = req2.headers.referer || req2.headers.referrer;
          const userAgent = req2.headers["user-agent"];
          const ipAddress = req2.ip || req2.connection.remoteAddress;
          await db.insert(linkAnalytics).values({
            restaurantId: parseInt(restaurantId),
            source: source || "direct",
            referrer,
            userAgent,
            ipAddress,
            sessionId: sessionId || `session_${Date.now()}`,
            converted: 0,
            timestamp: /* @__PURE__ */ new Date()
          });
          res2.json({ success: true });
        } catch (error2) {
          console.error("Error tracking link click:", error2);
          res2.status(500).json({ error: "Erro ao registrar clique" });
        }
      });
      app2.post("/api/analytics/link/convert", async (req2, res2) => {
        try {
          const { sessionId, restaurantId } = req2.body;
          if (!sessionId || !restaurantId) {
            return res2.status(400).json({ error: "Session ID e Restaurant ID obrigat\xF3rios" });
          }
          await db.execute(sql4`
        UPDATE link_analytics 
        SET converted = 1
        WHERE session_id = ${sessionId} 
        AND restaurant_id = ${parseInt(restaurantId)}
        AND converted = 0
      `);
          res2.json({ success: true });
        } catch (error2) {
          console.error("Error marking conversion:", error2);
          res2.status(500).json({ error: "Erro ao marcar convers\xE3o" });
        }
      });
      res.status(500).json({ message: "Erro ao buscar analytics" });
    }
  });
  app2.get("/api/superadmin/rankings", isSuperAdmin, async (req, res) => {
    try {
      const rankings = await storage.getRestaurantRankings();
      res.json(rankings);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar rankings" });
    }
  });
  app2.get("/api/superadmin/restaurants/:id/details", isSuperAdmin, async (req, res) => {
    try {
      const details = await storage.getRestaurantDetails(req.params.id);
      res.json(details);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar detalhes do restaurante";
      res.status(500).json({ message: errorMessage });
    }
  });
  app2.get("/api/superadmin/restaurants/:id/usage", isSuperAdmin, async (req, res) => {
    try {
      const restaurant = await storage.getRestaurantById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante n\xE3o encontrado" });
      }
      const usage = await storage.checkSubscriptionLimits(req.params.id);
      const normalizedPlan = {
        ...usage.plan,
        maxUsers: usage.plan.maxUsers >= 999999 ? null : usage.plan.maxUsers,
        maxBranches: usage.plan.maxBranches >= 999999 ? null : usage.plan.maxBranches,
        maxTables: usage.plan.maxTables >= 999999 ? null : usage.plan.maxTables,
        maxMenuItems: usage.plan.maxMenuItems >= 999999 ? null : usage.plan.maxMenuItems,
        maxOrdersPerMonth: usage.plan.maxOrdersPerMonth >= 999999 ? null : usage.plan.maxOrdersPerMonth
      };
      const normalizedWithinLimits = {
        users: normalizedPlan.maxUsers === null ? true : usage.usage.users < normalizedPlan.maxUsers,
        branches: normalizedPlan.maxBranches === null ? true : usage.usage.branches < normalizedPlan.maxBranches,
        tables: normalizedPlan.maxTables === null ? true : usage.usage.tables < normalizedPlan.maxTables,
        menuItems: normalizedPlan.maxMenuItems === null ? true : usage.usage.menuItems < normalizedPlan.maxMenuItems,
        orders: normalizedPlan.maxOrdersPerMonth === null ? true : usage.usage.ordersThisMonth < normalizedPlan.maxOrdersPerMonth
      };
      res.json({
        ...usage,
        plan: normalizedPlan,
        withinLimits: normalizedWithinLimits
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar uso do restaurante";
      if (error instanceof Error && error.message.includes("n\xE3o possui subscri\xE7\xE3o")) {
        return res.status(404).json({ message: "Restaurante n\xE3o possui subscri\xE7\xE3o ativa" });
      }
      res.status(500).json({ message: errorMessage });
    }
  });
  app2.get("/api/superadmin/financial-overview", isSuperAdmin, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : void 0;
      const end = endDate ? new Date(endDate) : void 0;
      const overview = await storage.getSuperAdminFinancialOverview(start, end);
      res.json(overview);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar vis\xE3o financeira" });
    }
  });
  app2.get("/api/superadmin/messages", isSuperAdmin, async (req, res) => {
    try {
      const messages2 = await storage.getAllMessages();
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });
  app2.post("/api/superadmin/messages", isSuperAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      const { restaurantId, subject, content } = req.body;
      if (!restaurantId || !subject || !content) {
        return res.status(400).json({ message: "Dados incompletos" });
      }
      const message = await storage.createMessage({
        restaurantId,
        subject,
        content,
        sentBy: `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
      });
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar mensagem" });
    }
  });
  app2.get("/api/messages", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const messages2 = await storage.getMessages(currentUser.restaurantId);
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });
  app2.patch("/api/messages/:id/read", isAdmin, async (req, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Erro ao marcar mensagem como lida" });
    }
  });
  app2.get("/api/superadmin/subscriptions", isSuperAdmin, async (req, res) => {
    try {
      const subscriptions2 = await storage.getAllSubscriptions();
      res.json(subscriptions2);
    } catch (error) {
      console.error("SuperAdmin subscriptions fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar subscri\xE7\xF5es" });
    }
  });
  app2.get("/api/superadmin/subscriptions/:id", isSuperAdmin, async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionById(req.params.id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscri\xE7\xE3o n\xE3o encontrada" });
      }
      res.json(subscription);
    } catch (error) {
      console.error("SuperAdmin subscription fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar subscri\xE7\xE3o" });
    }
  });
  app2.post("/api/superadmin/restaurants/:restaurantId/subscription", isSuperAdmin, async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const restaurant = await storage.getRestaurantById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante n\xE3o encontrado" });
      }
      const existingSubscription = await storage.getSubscriptionByRestaurantId(restaurantId);
      if (existingSubscription) {
        return res.status(409).json({ message: "Restaurante j\xE1 possui uma subscri\xE7\xE3o. Use PATCH para modificar." });
      }
      const validatedData = superAdminCreateSubscriptionSchema.parse(req.body);
      const plan = await storage.getSubscriptionPlanById(validatedData.planId);
      if (!plan) {
        return res.status(404).json({ message: "Plano n\xE3o encontrado" });
      }
      const now = /* @__PURE__ */ new Date();
      const trialDays = plan.trialDays || 0;
      const trialStart = trialDays > 0 && validatedData.status === "trial" ? now : null;
      const trialEnd = trialDays > 0 && validatedData.status === "trial" ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1e3) : null;
      const periodStart = trialEnd || now;
      const periodEnd = new Date(periodStart);
      if (validatedData.billingInterval === "anual") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
      const subscriptionData = {
        planId: validatedData.planId,
        billingInterval: validatedData.billingInterval,
        currency: validatedData.currency,
        status: validatedData.status,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        trialStart,
        trialEnd,
        autoRenew: 1,
        cancelAtPeriodEnd: 0
      };
      const subscription = await storage.createSubscription(restaurantId, subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("SuperAdmin subscription creation error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar subscri\xE7\xE3o" });
    }
  });
  app2.patch("/api/superadmin/subscriptions/:id", isSuperAdmin, async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionById(req.params.id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscri\xE7\xE3o n\xE3o encontrada" });
      }
      const cleanedBody = Object.fromEntries(
        Object.entries(req.body).filter(([_, value]) => value !== "" && value !== null && value !== void 0)
      );
      const validatedData = superAdminUpdateSubscriptionSchema.parse(cleanedBody);
      const updated = await storage.updateSubscriptionById(req.params.id, validatedData);
      res.json(updated);
    } catch (error) {
      console.error("SuperAdmin subscription update error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar subscri\xE7\xE3o" });
    }
  });
  app2.delete("/api/superadmin/subscriptions/:id", isSuperAdmin, async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionById(req.params.id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscri\xE7\xE3o n\xE3o encontrada" });
      }
      const cancelled = await storage.cancelSubscriptionById(req.params.id);
      res.json(cancelled);
    } catch (error) {
      console.error("SuperAdmin subscription cancel error:", error);
      res.status(500).json({ message: "Erro ao cancelar subscri\xE7\xE3o" });
    }
  });
  app2.post("/api/superadmin/subscriptions/:id/payments", isSuperAdmin, async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionById(req.params.id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscri\xE7\xE3o n\xE3o encontrada" });
      }
      const validatedData = insertSubscriptionPaymentSchema.parse(req.body);
      const payment = await storage.createSubscriptionPayment(subscription.restaurantId, validatedData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("SuperAdmin subscription payment creation error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao registrar pagamento" });
    }
  });
  app2.get("/api/users", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      const restaurantId = currentUser.role === "superadmin" ? null : currentUser.restaurantId || null;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const search = req.query.search;
      const role = req.query.role;
      const result = await storage.getUsersPaginated(restaurantId, { page, limit, search, role });
      const usersWithoutPassword = result.users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        restaurantId: user.restaurantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
      res.json({
        users: usersWithoutPassword,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Erro ao buscar usu\xE1rios" });
    }
  });
  app2.post("/api/users", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      const data = insertUserSchema.parse(req.body);
      if (currentUser.role === "admin") {
        data.restaurantId = currentUser.restaurantId;
      }
      if (currentUser.role !== "superadmin" && data.restaurantId) {
        const subscription = await storage.getSubscriptionByRestaurantId(data.restaurantId);
        if (subscription) {
          const plan = await storage.getSubscriptionPlanById(subscription.planId);
          if (plan && plan.maxUsers !== null) {
            const currentUsers = await storage.getAllUsers(data.restaurantId);
            if (currentUsers.length >= plan.maxUsers) {
              return res.status(403).json({
                message: `Limite de usu\xE1rios atingido. Seu plano permite at\xE9 ${plan.maxUsers} usu\xE1rios. Fa\xE7a upgrade para adicionar mais.`
              });
            }
          }
        }
      }
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email j\xE1 cadastrado" });
      }
      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword
      });
      await storage.createUserAuditLog({
        restaurantId: user.restaurantId || null,
        actorId: currentUser.id,
        targetUserId: user.id,
        action: "user_created",
        details: {
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        },
        ipAddress: (req.ip || req.socket.remoteAddress || "").slice(0, 45),
        userAgent: req.headers["user-agent"] || null
      });
      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        restaurantId: user.restaurantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("User creation error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao criar usu\xE1rio" });
    }
  });
  app2.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (currentUser.id === req.params.id) {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel deletar o pr\xF3prio usu\xE1rio" });
      }
      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      const restaurantId = currentUser.role === "superadmin" ? null : currentUser.restaurantId || null;
      await storage.deleteUser(restaurantId, req.params.id);
      await storage.createUserAuditLog({
        restaurantId: targetUser.restaurantId || null,
        actorId: currentUser.id,
        targetUserId: null,
        // User was deleted
        action: "user_deleted",
        details: {
          deletedUserId: req.params.id,
          deletedEmail: targetUser.email,
          deletedRole: targetUser.role
        },
        ipAddress: (req.ip || req.socket.remoteAddress || "").slice(0, 45),
        userAgent: req.headers["user-agent"] || null
      });
      res.json({ success: true });
    } catch (error) {
      console.error("User deletion error:", error);
      res.status(500).json({ message: "Erro ao deletar usu\xE1rio" });
    }
  });
  app2.patch("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      const data = updateUserSchema.parse(req.body);
      const beforeUser = await storage.getUser(req.params.id);
      if (!beforeUser) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (data.email) {
        const existingUser = await storage.getUserByEmail(data.email);
        if (existingUser && existingUser.id !== req.params.id) {
          return res.status(400).json({ message: "Email j\xE1 est\xE1 em uso por outro usu\xE1rio" });
        }
      }
      const restaurantId = currentUser.role === "superadmin" ? null : currentUser.restaurantId || null;
      const updatedUser = await storage.updateUser(restaurantId, req.params.id, data);
      const action = data.role && data.role !== beforeUser.role ? "role_changed" : "user_updated";
      await storage.createUserAuditLog({
        restaurantId: updatedUser.restaurantId || null,
        actorId: currentUser.id,
        targetUserId: updatedUser.id,
        action,
        details: {
          before: {
            email: beforeUser.email,
            firstName: beforeUser.firstName,
            lastName: beforeUser.lastName,
            role: beforeUser.role
          },
          after: {
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            role: updatedUser.role
          },
          changes: data
        },
        ipAddress: (req.ip || req.socket.remoteAddress || "").slice(0, 45),
        userAgent: req.headers["user-agent"] || null
      });
      const userWithoutPassword = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        restaurantId: updatedUser.restaurantId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("User update error:", error);
      res.status(500).json({ message: "Erro ao atualizar usu\xE1rio" });
    }
  });
  app2.patch("/api/users/:id/reset-password", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      const data = adminResetPasswordSchema.parse(req.body);
      if (currentUser.id === req.params.id) {
        return res.status(400).json({ message: "Use a op\xE7\xE3o de alterar senha pessoal para mudar sua pr\xF3pria senha" });
      }
      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (currentUser.role !== "superadmin") {
        if (targetUser.restaurantId !== currentUser.restaurantId) {
          return res.status(403).json({ message: "Acesso negado. Usu\xE1rio n\xE3o pertence ao seu restaurante." });
        }
      }
      const hashedPassword = await hashPassword(data.newPassword);
      await storage.updateUserPassword(req.params.id, hashedPassword);
      await storage.createUserAuditLog({
        restaurantId: targetUser.restaurantId || null,
        actorId: currentUser.id,
        targetUserId: targetUser.id,
        action: "password_reset",
        details: {
          targetEmail: targetUser.email,
          resetBy: currentUser.email
        },
        ipAddress: (req.ip || req.socket.remoteAddress || "").slice(0, 45),
        userAgent: req.headers["user-agent"] || null
      });
      res.json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Erro ao resetar senha" });
    }
  });
  app2.get("/api/public/menu-items/:menuItemId/option-groups", async (req, res) => {
    try {
      const groups = await storage.getOptionGroupsByMenuItem(req.params.menuItemId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar grupos de op\xE7\xF5es" });
    }
  });
  app2.get("/api/public/restaurants/:restaurantId", async (req, res) => {
    try {
      const restaurantId = req.params.restaurantId;
      const restaurant = await storage.getRestaurantById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante n\xE3o encontrado" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar restaurante" });
    }
  });
  app2.get("/api/public/restaurants/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const restaurant = await storage.getRestaurantBySlug(slug);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante n\xE3o encontrado" });
      }
      if (restaurant.status !== "ativo") {
        return res.status(403).json({ message: "Restaurante n\xE3o est\xE1 ativo" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar restaurante" });
    }
  });
  app2.get("/api/public/tables/:number", async (req, res) => {
    try {
      const tableNumber = parseInt(req.params.number);
      if (isNaN(tableNumber)) {
        return res.status(400).json({ message: "N\xFAmero de mesa inv\xE1lido" });
      }
      const table = await storage.getTableByNumber(tableNumber);
      if (!table) {
        return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar mesa" });
    }
  });
  app2.get("/api/public/menu-items/:restaurantId", async (req, res) => {
    try {
      const restaurantId = req.params.restaurantId;
      const menuItems2 = await storage.getMenuItems(restaurantId);
      const availableItems = menuItems2.filter((item) => item.isAvailable === 1);
      if (menuItems2.length > 0 && availableItems.length === 0) {
      }
      res.json(availableItems);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar menu" });
    }
  });
  app2.get("/api/public/orders/table/:tableId", async (req, res) => {
    try {
      const tableId = req.params.tableId;
      const table = await storage.getTableById(tableId);
      if (!table) {
        return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
      }
      const orders2 = await storage.getOrdersByTableId(table.restaurantId, tableId);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pedidos" });
    }
  });
  app2.post("/api/public/tables/:number/join", async (req, res) => {
    try {
      const tableNumber = parseInt(req.params.number);
      if (isNaN(tableNumber)) {
        return res.status(400).json({ message: "N\xFAmero de mesa inv\xE1lido" });
      }
      const table = await storage.getTableByNumber(tableNumber);
      if (!table) {
        return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
      }
      let sessionId = table.currentSessionId || "";
      if (!sessionId) {
        const session2 = await storage.startTableSession(table.restaurantId, table.id, {
          customerName: req.body.name || "Cliente",
          customerCount: 1
        });
        sessionId = session2.id;
      }
      const { name, deviceInfo } = req.body;
      const token = nanoid(32);
      const guest = await storage.createTableGuest(table.restaurantId, {
        sessionId,
        tableId: table.id,
        name: name || void 0,
        token,
        deviceInfo: deviceInfo || req.headers["user-agent"]
      });
      broadcastToClients({
        type: "guest_joined",
        data: {
          tableId: table.id,
          tableNumber: table.number,
          guest,
          restaurantId: table.restaurantId
        }
      });
      res.json({
        guest,
        token,
        table: {
          id: table.id,
          number: table.number,
          restaurantId: table.restaurantId
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao entrar na mesa" });
    }
  });
  app2.get("/api/public/guest/:token", async (req, res) => {
    try {
      const guest = await storage.getTableGuestByToken(req.params.token);
      if (!guest) {
        return res.status(404).json({ message: "Sess\xE3o expirada ou inv\xE1lida" });
      }
      const table = await storage.getTableById(guest.tableId);
      res.json({
        guest,
        table: table ? {
          id: table.id,
          number: table.number,
          restaurantId: table.restaurantId
        } : null
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar informa\xE7\xF5es" });
    }
  });
  app2.post("/api/public/tables/:number/request-bill", async (req, res) => {
    try {
      const tableNumber = parseInt(req.params.number);
      if (isNaN(tableNumber)) {
        return res.status(400).json({ message: "N\xFAmero de mesa inv\xE1lido" });
      }
      const table = await storage.getTableByNumber(tableNumber);
      if (!table) {
        return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
      }
      if (!table.currentSessionId) {
        return res.status(400).json({ message: "Mesa n\xE3o possui sess\xE3o ativa" });
      }
      const { guestToken, guestName } = req.body;
      if (guestToken) {
        const guest = await storage.getTableGuestByToken(guestToken);
        if (guest && guest.tableId === table.id) {
          await storage.updateTableGuest(guest.id, { status: "aguardando_conta" });
        }
      }
      broadcastToClients({
        type: "bill_requested",
        data: {
          tableId: table.id,
          tableNumber: table.number,
          sessionId: table.currentSessionId,
          restaurantId: table.restaurantId,
          guestName: guestName || "Cliente",
          requestedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      res.json({
        success: true,
        message: "Conta solicitada! Um atendente vir\xE1 em breve.",
        tableNumber: table.number
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao solicitar conta" });
    }
  });
  app2.get("/api/public/tables/:number/status", async (req, res) => {
    try {
      const tableNumber = parseInt(req.params.number);
      if (isNaN(tableNumber)) {
        return res.status(400).json({ message: "N\xFAmero de mesa inv\xE1lido" });
      }
      const table = await storage.getTableByNumber(tableNumber);
      if (!table) {
        return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
      }
      let guests = [];
      let totalAmount = "0";
      if (table.currentSessionId) {
        guests = await storage.getTableGuests(table.currentSessionId);
        totalAmount = table.totalAmount || "0";
      }
      res.json({
        table: {
          id: table.id,
          number: table.number,
          status: table.status,
          restaurantId: table.restaurantId
        },
        guests,
        totalAmount,
        hasActiveSession: !!table.currentSessionId
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar status da mesa" });
    }
  });
  app2.get("/api/public/restaurants/:slug/orders/search", async (req, res) => {
    try {
      const slug = req.params.slug;
      const searchTerm = req.query.q;
      if (!searchTerm || searchTerm.trim().length === 0) {
        return res.status(400).json({ message: "Termo de busca \xE9 obrigat\xF3rio" });
      }
      const restaurant = await storage.getRestaurantBySlug(slug);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante n\xE3o encontrado" });
      }
      const orders2 = await storage.searchOrders(restaurant.id, searchTerm);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pedidos" });
    }
  });
  app2.post("/api/public/orders", async (req, res) => {
    try {
      const { items, couponCode, redeemPoints, ...orderData } = req.body;
      let validatedOrder = publicOrderSchema.parse(orderData);
      const validatedItems = z2.array(publicOrderItemSchema).parse(items);
      if (!validatedOrder.orderType) {
        if (validatedOrder.tableId) {
          validatedOrder = { ...validatedOrder, orderType: "mesa" };
        } else if (validatedOrder.deliveryAddress) {
          validatedOrder = { ...validatedOrder, orderType: "delivery" };
        } else {
          validatedOrder = { ...validatedOrder, orderType: "takeout" };
        }
      }
      if (validatedOrder.orderType === "mesa") {
        if (!validatedOrder.tableId) {
          return res.status(400).json({ message: "Mesa \xE9 obrigat\xF3ria para pedidos do tipo mesa" });
        }
        const table = await storage.getTableById(validatedOrder.tableId);
        if (!table) {
          return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
        }
        if (table.status === "livre") {
          await storage.openTable(validatedOrder.tableId, validatedOrder.customerCount);
          console.log(`[TABLE] Mesa ${table.number} aberta automaticamente via QR Code`);
        }
      }
      if (validatedOrder.orderType === "delivery") {
        if (!validatedOrder.deliveryAddress) {
          return res.status(400).json({ message: "Endere\xE7o de entrega \xE9 obrigat\xF3rio para delivery" });
        }
        if (!validatedOrder.customerName?.trim()) {
          return res.status(400).json({ message: "Nome \xE9 obrigat\xF3rio para delivery" });
        }
        if (!validatedOrder.customerPhone?.trim()) {
          return res.status(400).json({ message: "Telefone \xE9 obrigat\xF3rio para delivery" });
        }
        if (validatedOrder.tableId) {
          return res.status(400).json({ message: "Pedidos delivery n\xE3o podem estar associados a uma mesa" });
        }
      }
      if (validatedOrder.orderType === "takeout") {
        if (!validatedOrder.customerName?.trim()) {
          return res.status(400).json({ message: "Nome \xE9 obrigat\xF3rio para retirada" });
        }
        if (!validatedOrder.customerPhone?.trim()) {
          return res.status(400).json({ message: "Telefone \xE9 obrigat\xF3rio para retirada" });
        }
        if (validatedOrder.tableId) {
          return res.status(400).json({ message: "Pedidos para retirada n\xE3o podem estar associados a uma mesa" });
        }
      }
      if (!validatedOrder.customerId && validatedOrder.customerPhone) {
        const existingCustomer = await storage.getCustomerByPhone(
          validatedOrder.restaurantId,
          validatedOrder.customerPhone.trim()
        );
        if (existingCustomer) {
          validatedOrder = { ...validatedOrder, customerId: existingCustomer.id };
        }
      }
      const verifiedItems = [];
      let orderTotal = 0;
      for (const item of validatedItems) {
        const menuItem = await storage.getMenuItemById(item.menuItemId);
        if (!menuItem) {
          return res.status(400).json({ message: `Item do menu n\xE3o encontrado: ${item.menuItemId}` });
        }
        const serverPrice = parseFloat(menuItem.price);
        let optionsPrice = 0;
        if (item.selectedOptions && item.selectedOptions.length > 0) {
          const optionGroups2 = await storage.getOptionGroupsByMenuItem(item.menuItemId);
          const allOptions = optionGroups2.flatMap((group) => group.options);
          for (const selectedOpt of item.selectedOptions) {
            const dbOption = allOptions.find((opt) => opt.id === selectedOpt.optionId);
            if (dbOption) {
              const optionPrice = parseFloat(dbOption.priceAdjustment || "0");
              optionsPrice += optionPrice * (selectedOpt.quantity || 1);
            }
          }
        }
        const verifiedItemPrice = (serverPrice + optionsPrice).toFixed(2);
        const itemTotal = parseFloat(verifiedItemPrice) * item.quantity;
        orderTotal += itemTotal;
        verifiedItems.push({
          ...item,
          price: verifiedItemPrice
          // Override with verified price
        });
      }
      let couponDiscount = 0;
      let appliedCouponId = null;
      if (couponCode && validatedOrder.restaurantId) {
        const couponResult = await storage.validateCoupon(
          validatedOrder.restaurantId,
          couponCode,
          orderTotal,
          validatedOrder.orderType,
          validatedOrder.customerId || void 0
        );
        if (couponResult.valid && couponResult.discountAmount) {
          couponDiscount = Math.min(couponResult.discountAmount, orderTotal);
          appliedCouponId = couponResult.coupon?.id || null;
          validatedOrder = {
            ...validatedOrder,
            couponId: appliedCouponId
          };
        }
      }
      let loyaltyDiscount = 0;
      let pointsToRedeem = 0;
      if (redeemPoints && redeemPoints > 0 && validatedOrder.customerId && validatedOrder.restaurantId) {
        const customer = await storage.getCustomerById(validatedOrder.customerId);
        const loyaltyProgram = await storage.getLoyaltyProgram(validatedOrder.restaurantId);
        if (customer && loyaltyProgram && loyaltyProgram.isActive === 1) {
          const availablePoints = customer.loyaltyPoints || 0;
          const minPoints = loyaltyProgram.minPointsToRedeem || 100;
          const currencyPerPoint = parseFloat(loyaltyProgram.currencyPerPoint || "0.10");
          const requestedPoints = Math.max(0, Math.floor(redeemPoints));
          const cappedPoints = Math.min(requestedPoints, availablePoints);
          if (cappedPoints >= minPoints) {
            const remainingTotal = orderTotal - couponDiscount;
            const maxPointsForOrder = Math.floor(remainingTotal / currencyPerPoint);
            pointsToRedeem = Math.min(cappedPoints, maxPointsForOrder);
            loyaltyDiscount = pointsToRedeem * currencyPerPoint;
            loyaltyDiscount = Math.min(loyaltyDiscount, remainingTotal);
          }
        }
      }
      const order = await storage.createOrder(validatedOrder, verifiedItems);
      if (appliedCouponId && couponDiscount > 0) {
        await storage.applyCoupon(
          validatedOrder.restaurantId,
          appliedCouponId,
          order.id,
          validatedOrder.customerId || void 0,
          couponDiscount
        );
      }
      if (pointsToRedeem > 0 && validatedOrder.customerId && loyaltyDiscount > 0) {
        await storage.redeemLoyaltyPointsForOrder(
          validatedOrder.restaurantId,
          validatedOrder.customerId,
          pointsToRedeem,
          order.id,
          ""
          // No user for public orders
        );
      }
      broadcastToClients({ type: "new_order", data: order });
      res.json({
        ...order,
        couponDiscountApplied: couponDiscount,
        loyaltyDiscountApplied: loyaltyDiscount,
        pointsRedeemed: pointsToRedeem
      });
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message, errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar pedido" });
    }
  });
  app2.post("/api/public/customers", async (req, res) => {
    try {
      const { restaurantId, ...customerData } = req.body;
      if (!restaurantId) {
        return res.status(400).json({ message: "ID do restaurante \xE9 obrigat\xF3rio" });
      }
      const validatedData = insertCustomerSchema.parse(customerData);
      if (validatedData.phone) {
        const existing = await storage.getCustomerByPhone(restaurantId, validatedData.phone);
        if (existing) {
          return res.status(400).json({ message: "J\xE1 existe um cliente cadastrado com este telefone" });
        }
      }
      const customer = await storage.createCustomer(
        restaurantId,
        null,
        validatedData
      );
      res.json(customer);
    } catch (error) {
      console.error("Public customer registration error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao cadastrar cliente" });
    }
  });
  app2.get("/api/public/customers/lookup", async (req, res) => {
    try {
      const { restaurantId, phone } = req.query;
      if (!restaurantId || !phone) {
        return res.status(400).json({ message: "restaurantId e phone s\xE3o obrigat\xF3rios" });
      }
      const customer = await storage.getCustomerByPhone(restaurantId, phone);
      if (!customer) {
        return res.json({ found: false });
      }
      const loyaltyProgram = await storage.getLoyaltyProgram(restaurantId);
      let maxRedeemablePoints = 0;
      let maxDiscountAmount = 0;
      if (loyaltyProgram && loyaltyProgram.isActive === 1) {
        const minPoints = loyaltyProgram.minPointsToRedeem || 100;
        const currencyPerPoint = parseFloat(loyaltyProgram.currencyPerPoint || "0.10");
        if (customer.loyaltyPoints >= minPoints) {
          maxRedeemablePoints = customer.loyaltyPoints;
          maxDiscountAmount = maxRedeemablePoints * currencyPerPoint;
        }
      }
      res.json({
        found: true,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          loyaltyPoints: customer.loyaltyPoints,
          tier: customer.tier,
          totalSpent: customer.totalSpent,
          visitCount: customer.visitCount
        },
        loyalty: loyaltyProgram ? {
          isActive: loyaltyProgram.isActive === 1,
          pointsPerCurrency: loyaltyProgram.pointsPerCurrency,
          currencyPerPoint: loyaltyProgram.currencyPerPoint,
          minPointsToRedeem: loyaltyProgram.minPointsToRedeem,
          maxRedeemablePoints,
          maxDiscountAmount
        } : null
      });
    } catch (error) {
      console.error("Customer lookup error:", error);
      res.status(500).json({ message: "Erro ao buscar cliente" });
    }
  });
  app2.post("/api/public/coupons/validate", async (req, res) => {
    try {
      const { restaurantId, code, orderValue, orderType, customerId } = req.body;
      if (!restaurantId || !code || orderValue === void 0) {
        return res.status(400).json({ message: "restaurantId, code e orderValue s\xE3o obrigat\xF3rios" });
      }
      const result = await storage.validateCoupon(
        restaurantId,
        code,
        parseFloat(orderValue),
        orderType,
        customerId
      );
      res.json(result);
    } catch (error) {
      console.error("Coupon validation error:", error);
      res.status(500).json({ message: "Erro ao validar cupom" });
    }
  });
  app2.get("/api/public/loyalty/calculate", async (req, res) => {
    try {
      const { restaurantId, orderValue } = req.query;
      if (!restaurantId || !orderValue) {
        return res.status(400).json({ message: "restaurantId e orderValue s\xE3o obrigat\xF3rios" });
      }
      const loyaltyProgram = await storage.getLoyaltyProgram(restaurantId);
      if (!loyaltyProgram || loyaltyProgram.isActive !== 1) {
        return res.json({
          active: false,
          pointsToEarn: 0,
          message: "Programa de fidelidade n\xE3o est\xE1 ativo"
        });
      }
      const pointsPerCurrency = parseFloat(loyaltyProgram.pointsPerCurrency || "1");
      const orderValueNum = parseFloat(orderValue);
      const pointsToEarn = Math.floor(orderValueNum * pointsPerCurrency);
      res.json({
        active: true,
        pointsToEarn,
        pointsPerCurrency,
        currencyPerPoint: loyaltyProgram.currencyPerPoint,
        minPointsToRedeem: loyaltyProgram.minPointsToRedeem
      });
    } catch (error) {
      console.error("Loyalty calculation error:", error);
      res.status(500).json({ message: "Erro ao calcular pontos" });
    }
  });
  app2.post("/api/public/customer-auth/request-otp", async (req, res) => {
    try {
      const { phone, restaurantId } = req.body;
      if (!phone || !restaurantId) {
        return res.status(400).json({ message: "Telefone e ID do restaurante s\xE3o obrigat\xF3rios" });
      }
      const restaurant = await storage.getRestaurantById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante n\xE3o encontrado" });
      }
      const customer = await storage.getOrCreateCustomerByPhone(restaurantId, phone);
      const deviceInfo = req.headers["user-agent"] || "Unknown device";
      const ipAddress = req.ip || req.socket.remoteAddress || "Unknown";
      const session2 = await storage.createCustomerSession(
        customer.id,
        restaurantId,
        deviceInfo,
        ipAddress
      );
      const otpCode = session2.otpCode || "";
      const whatsappSent = otpCode ? await sendWhatsAppOTP(phone, otpCode, restaurant.name) : false;
      console.log(`[CUSTOMER AUTH] OTP for ${phone}: ${otpCode}, WhatsApp sent: ${whatsappSent}`);
      res.json({
        success: true,
        message: whatsappSent ? "C\xF3digo de verifica\xE7\xE3o enviado para o seu WhatsApp" : "C\xF3digo de verifica\xE7\xE3o enviado",
        customerId: customer.id,
        whatsappSent,
        // DEV ONLY: Return OTP in response if WhatsApp failed (for testing)
        ...!whatsappSent && process.env.NODE_ENV === "development" && { otpCode }
      });
    } catch (error) {
      console.error("Customer auth request error:", error);
      res.status(500).json({ message: "Erro ao solicitar c\xF3digo de verifica\xE7\xE3o" });
    }
  });
  app2.post("/api/public/customer-auth/verify", async (req, res) => {
    try {
      const { phone, restaurantId, otpCode } = req.body;
      if (!phone || !restaurantId || !otpCode) {
        return res.status(400).json({ message: "Telefone, ID do restaurante e c\xF3digo s\xE3o obrigat\xF3rios" });
      }
      const customer = await storage.getCustomerByPhone(restaurantId, phone.replace(/[\s\-\(\)]/g, ""));
      if (!customer) {
        return res.status(404).json({ message: "Cliente n\xE3o encontrado" });
      }
      const session2 = await storage.verifyCustomerOtp(customer.id, restaurantId, otpCode);
      if (!session2) {
        return res.status(401).json({ message: "C\xF3digo inv\xE1lido ou expirado" });
      }
      const loyaltyProgram = await storage.getLoyaltyProgram(restaurantId);
      res.json({
        success: true,
        token: session2.token,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          loyaltyPoints: customer.loyaltyPoints,
          tier: customer.tier,
          totalSpent: customer.totalSpent,
          visitCount: customer.visitCount
        },
        loyalty: loyaltyProgram && loyaltyProgram.isActive === 1 ? {
          isActive: true,
          pointsPerCurrency: loyaltyProgram.pointsPerCurrency,
          currencyPerPoint: loyaltyProgram.currencyPerPoint,
          minPointsToRedeem: loyaltyProgram.minPointsToRedeem
        } : null,
        expiresAt: session2.expiresAt
      });
    } catch (error) {
      console.error("Customer auth verify error:", error);
      res.status(500).json({ message: "Erro ao verificar c\xF3digo" });
    }
  });
  app2.get("/api/public/customer-auth/me", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ authenticated: false, message: "Token n\xE3o fornecido" });
      }
      const sessionData = await storage.getCustomerSessionByToken(token);
      if (!sessionData) {
        return res.status(401).json({ authenticated: false, message: "Sess\xE3o inv\xE1lida ou expirada" });
      }
      const { customer } = sessionData;
      const loyaltyProgram = await storage.getLoyaltyProgram(sessionData.restaurantId);
      res.json({
        authenticated: true,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          loyaltyPoints: customer.loyaltyPoints,
          tier: customer.tier,
          totalSpent: customer.totalSpent,
          visitCount: customer.visitCount
        },
        loyalty: loyaltyProgram && loyaltyProgram.isActive === 1 ? {
          isActive: true,
          pointsPerCurrency: loyaltyProgram.pointsPerCurrency,
          currencyPerPoint: loyaltyProgram.currencyPerPoint,
          minPointsToRedeem: loyaltyProgram.minPointsToRedeem
        } : null
      });
    } catch (error) {
      console.error("Customer auth check error:", error);
      res.status(500).json({ message: "Erro ao verificar sess\xE3o" });
    }
  });
  app2.post("/api/public/customer-auth/refresh", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token n\xE3o fornecido" });
      }
      const refreshedSession = await storage.refreshCustomerSession(token);
      if (!refreshedSession) {
        return res.status(401).json({ message: "Sess\xE3o inv\xE1lida ou expirada" });
      }
      res.json({
        success: true,
        expiresAt: refreshedSession.expiresAt
      });
    } catch (error) {
      console.error("Customer auth refresh error:", error);
      res.status(500).json({ message: "Erro ao renovar sess\xE3o" });
    }
  });
  app2.post("/api/public/customer-auth/logout", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(400).json({ message: "Token n\xE3o fornecido" });
      }
      await storage.invalidateCustomerSession(token);
      res.json({
        success: true,
        message: "Logout realizado com sucesso"
      });
    } catch (error) {
      console.error("Customer auth logout error:", error);
      res.status(500).json({ message: "Erro ao fazer logout" });
    }
  });
  app2.get("/api/public/customers/:customerId/orders", async (req, res) => {
    try {
      const { customerId } = req.params;
      const { restaurantId } = req.query;
      if (!restaurantId) {
        return res.status(400).json({ message: "restaurantId \xE9 obrigat\xF3rio" });
      }
      const customer = await storage.getCustomerById(customerId);
      if (!customer || customer.restaurantId !== restaurantId) {
        return res.status(404).json({ message: "Cliente n\xE3o encontrado" });
      }
      const orders2 = await db.query.orders.findMany({
        where: (orders3, { eq: eq4, and: and4 }) => and4(
          eq4(orders3.restaurantId, restaurantId),
          eq4(orders3.customerId, customerId)
        ),
        with: {
          orderItems: {
            with: {
              menuItem: true
            }
          }
        },
        orderBy: (orders3, { desc: desc3 }) => [desc3(orders3.createdAt)],
        limit: 50
        // Last 50 orders
      });
      const formattedOrders = orders2.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        orderType: order.orderType,
        totalAmount: order.totalAmount,
        subtotal: order.subtotal,
        createdAt: order.createdAt,
        items: order.orderItems?.map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItem?.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        })) || [],
        pointsEarned: order.loyaltyPointsEarned || 0,
        pointsRedeemed: order.loyaltyPointsRedeemed || 0
      }));
      res.json(formattedOrders);
    } catch (error) {
      console.error("Customer orders fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar pedidos do cliente" });
    }
  });
  app2.get("/api/public/orders/:orderId/status", async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await db.query.orders.findFirst({
        where: (orders2, { eq: eq4 }) => eq4(orders2.id, orderId),
        with: {
          orderItems: {
            with: {
              menuItem: true
            }
          }
        }
      });
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      res.json({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        orderType: order.orderType,
        totalAmount: order.totalAmount,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        createdAt: order.createdAt,
        items: order.orderItems?.map((item) => ({
          name: item.menuItem?.name,
          quantity: item.quantity,
          price: item.price
        })) || []
      });
    } catch (error) {
      console.error("Order status fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar status do pedido" });
    }
  });
  app2.get("/api/public/customers/:customerId/coupons", async (req, res) => {
    try {
      const { customerId } = req.params;
      const { restaurantId } = req.query;
      if (!restaurantId) {
        return res.status(400).json({ message: "restaurantId \xE9 obrigat\xF3rio" });
      }
      const customer = await storage.getCustomerById(customerId);
      if (!customer || customer.restaurantId !== restaurantId) {
        return res.status(404).json({ message: "Cliente n\xE3o encontrado" });
      }
      const allCoupons = await storage.getCoupons(
        restaurantId,
        null,
        { isActive: 1 }
      );
      const now = /* @__PURE__ */ new Date();
      const availableCoupons = allCoupons.filter((coupon) => {
        if (coupon.isActive !== 1) return false;
        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) return false;
        return true;
      });
      const formattedCoupons = availableCoupons.map((coupon) => ({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        applicableOrderTypes: coupon.applicableOrderTypes,
        isActive: coupon.isActive === 1,
        maxUses: coupon.maxUses,
        currentUses: coupon.currentUses,
        remainingUses: coupon.maxUses ? coupon.maxUses - coupon.currentUses : null
      }));
      res.json(formattedCoupons);
    } catch (error) {
      console.error("Customer coupons fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar cupons do cliente" });
    }
  });
  app2.get("/api/tables", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const tables2 = await storage.getTables(restaurantId, branchId);
      res.json(tables2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });
  app2.post("/api/tables", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      if (currentUser.role !== "superadmin") {
        const subscription = await storage.getSubscriptionByRestaurantId(restaurantId);
        if (subscription) {
          const plan = await storage.getSubscriptionPlanById(subscription.planId);
          if (plan && plan.maxTables !== null) {
            const currentTables = await storage.getTables(restaurantId, null);
            if (currentTables.length >= plan.maxTables) {
              return res.status(403).json({
                message: `Limite de mesas atingido. Seu plano permite at\xE9 ${plan.maxTables} mesas. Fa\xE7a upgrade para adicionar mais.`
              });
            }
          }
        }
      }
      const data = insertTableSchema.parse(req.body);
      const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : `https://${req.hostname}`;
      const qrCodeUrl = `${baseUrl}/mesa/${data.number}`;
      const qrCode = await QRCode.toDataURL(qrCodeUrl, {
        width: 300,
        margin: 2
      });
      const branchId = currentUser.activeBranchId || null;
      const table = await storage.createTable(restaurantId, branchId, {
        number: data.number,
        capacity: data.capacity,
        area: data.area,
        qrCode
      });
      broadcastToClients({ type: "table_created", data: table });
      res.json(table);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao criar mesa" });
    }
  });
  app2.delete("/api/tables/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      await storage.deleteTable(restaurantId, req.params.id);
      broadcastToClients({ type: "table_deleted", data: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete table" });
    }
  });
  app2.get("/api/tables/with-orders", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const tables2 = await storage.getTablesWithOrders(restaurantId, branchId);
      res.json(tables2);
    } catch (error) {
      console.error("Tables with orders error:", error);
      res.status(500).json({ message: "Failed to fetch tables with orders" });
    }
  });
  app2.get("/api/tables/open", isOperational, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const tables2 = await storage.getTablesWithOrders(restaurantId, branchId);
      const openTables = tables2.filter((table) => table.status !== "livre");
      res.json(openTables);
    } catch (error) {
      console.error("Error fetching open tables:", error);
      res.status(500).json({ message: "Failed to fetch open tables", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.patch("/api/tables/:id/status", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const { status, customerName, customerCount } = req.body;
      const updatedTable = await storage.updateTableStatus(
        restaurantId,
        req.params.id,
        status,
        { customerName, customerCount }
      );
      broadcastToClients({ type: "table_status_updated", data: updatedTable });
      res.json(updatedTable);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to update table status" });
    }
  });
  app2.patch("/api/tables/:id/position", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { x, y } = req.body;
      if (x === void 0 || y === void 0) {
        return res.status(400).json({ message: "Coordenadas x e y s\xE3o obrigat\xF3rias" });
      }
      if (typeof x !== "number" || typeof y !== "number") {
        return res.status(400).json({ message: "Coordenadas devem ser n\xFAmeros" });
      }
      if (x < 0 || x > 100 || y < 0 || y > 100) {
        return res.status(400).json({ message: "Coordenadas devem estar entre 0 e 100" });
      }
      await db.execute(
        sql4`UPDATE tables SET position_x = ${x}, position_y = ${y} WHERE id = ${id}`
      );
      const checkResult = await db.execute(
        sql4`SELECT id FROM tables WHERE id = ${id}`
      );
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
      }
      res.json({ message: "Posi\xE7\xE3o atualizada com sucesso", x, y });
    } catch (error) {
      console.error("[TABLES] Error updating table position:", error.message);
      res.status(500).json({ message: "Erro ao atualizar posi\xE7\xE3o da mesa" });
    }
  });
  app2.post("/api/tables/:id/start-session", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const { customerName, customerCount } = req.body;
      const session2 = await storage.startTableSession(restaurantId, req.params.id, {
        customerName,
        customerCount
      });
      await storage.calculateTableTotal(restaurantId, req.params.id);
      broadcastToClients({ type: "table_session_started", data: session2 });
      res.json(session2);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to start table session" });
    }
  });
  app2.post("/api/tables/:id/end-session", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      await storage.endTableSession(restaurantId, req.params.id);
      const updatedTable = await storage.getTableById(req.params.id);
      broadcastToClients({ type: "table_session_ended", data: updatedTable });
      res.json({ success: true, table: updatedTable });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to end table session" });
    }
  });
  app2.post("/api/tables/:id/close-session", isOperational, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      if (currentUser.role === "waiter") {
        return res.status(403).json({ message: "Gar\xE7ons n\xE3o podem fechar mesas. Solicite ao caixa." });
      }
      await storage.endTableSession(restaurantId, req.params.id);
      const updatedTable = await storage.getTableById(req.params.id);
      broadcastToClients({ type: "table_session_ended", data: updatedTable });
      res.json({ success: true, table: updatedTable });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to close table session" });
    }
  });
  app2.post("/api/tables/:id/payment", isOperational, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      if (currentUser.role === "waiter") {
        return res.status(403).json({ message: "Gar\xE7ons n\xE3o podem registrar pagamentos. Solicite ao caixa." });
      }
      const restaurantId = currentUser.restaurantId;
      const { amount, paymentMethod, notes, receivedAmount } = req.body;
      const table = await storage.getTableById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
      }
      const payment = await storage.addTablePayment(restaurantId, {
        tableId: req.params.id,
        sessionId: table.currentSessionId,
        amount,
        paymentMethod,
        notes: receivedAmount ? `Valor recebido: ${receivedAmount}. ${notes || ""}` : notes
      });
      broadcastToClients({ type: "table_payment_added", data: payment });
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to record payment" });
    }
  });
  app2.post("/api/tables/:id/payments", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const { amount, paymentMethod, notes, sessionId } = req.body;
      const table = await storage.getTableById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
      }
      const payment = await storage.addTablePayment(restaurantId, {
        tableId: req.params.id,
        sessionId: sessionId || table.currentSessionId,
        amount,
        paymentMethod,
        notes
      });
      broadcastToClients({ type: "table_payment_added", data: payment });
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to add payment" });
    }
  });
  app2.get("/api/tables/sessions/:sessionId/audit-logs", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const { sessionId } = req.params;
      const logs = await db.query.orderItemAuditLogs.findMany({
        where: (logs2, { eq: eq4, and: and4 }) => and4(
          eq4(logs2.sessionId, sessionId),
          eq4(logs2.restaurantId, restaurantId)
        ),
        with: {
          actor: {
            columns: {
              id: true,
              name: true
            }
          },
          sourceGuest: {
            columns: {
              id: true,
              guestName: true,
              guestNumber: true
            }
          },
          targetGuest: {
            columns: {
              id: true,
              guestName: true,
              guestNumber: true
            }
          }
        },
        orderBy: (logs2, { desc: desc3 }) => [desc3(logs2.createdAt)]
      });
      const formattedLogs = logs.map((log2) => ({
        id: log2.id,
        action: log2.action,
        actorName: log2.actor?.name || "Usu\xE1rio desconhecido",
        sourceGuestName: log2.sourceGuest?.guestName,
        sourceGuestNumber: log2.sourceGuest?.guestNumber,
        targetGuestName: log2.targetGuest?.guestName,
        targetGuestNumber: log2.targetGuest?.guestNumber,
        itemDetails: log2.itemDetails,
        reason: log2.reason,
        createdAt: log2.createdAt
      }));
      res.json(formattedLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Erro ao buscar hist\xF3rico de auditoria" });
    }
  });
  app2.get("/api/tables/:id/sessions", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const sessions2 = await storage.getTableSessions(restaurantId, req.params.id);
      res.json(sessions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch table sessions" });
    }
  });
  app2.get("/api/tables/:id/payments", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const payments = await storage.getTablePayments(restaurantId, req.params.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch table payments" });
    }
  });
  app2.get("/api/tables/:id/guests", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const table = await storage.getTableById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
      }
      if (!table.currentSessionId) {
        return res.json([]);
      }
      const guests = await storage.getTableGuests(table.currentSessionId);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar clientes da mesa" });
    }
  });
  app2.post("/api/tables/:id/guests", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const table = await storage.getTableById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
      }
      if (!table.currentSessionId) {
        return res.status(400).json({ message: "Mesa n\xE3o possui sess\xE3o ativa" });
      }
      const { name, seatNumber } = req.body;
      const guest = await storage.createTableGuest(restaurantId, {
        sessionId: table.currentSessionId,
        tableId: table.id,
        name,
        seatNumber
      });
      broadcastToClients({ type: "guest_joined", data: { tableId: table.id, guest } });
      res.json(guest);
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao adicionar cliente" });
    }
  });
  app2.patch("/api/tables/:id/guests/:guestId", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const guest = await storage.getTableGuestById(req.params.guestId);
      if (!guest) {
        return res.status(404).json({ message: "Cliente n\xE3o encontrado" });
      }
      const { name, seatNumber, status } = req.body;
      const updatedGuest = await storage.updateTableGuest(req.params.guestId, { name, seatNumber, status });
      broadcastToClients({ type: "guest_updated", data: { tableId: req.params.id, guest: updatedGuest } });
      res.json(updatedGuest);
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao atualizar cliente" });
    }
  });
  app2.delete("/api/tables/:id/guests/:guestId", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.removeTableGuest(req.params.guestId);
      broadcastToClients({ type: "guest_left", data: { tableId: req.params.id, guestId: req.params.guestId } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Erro ao remover cliente" });
    }
  });
  app2.get("/api/tables/:id/orders-by-guest", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const table = await storage.getTableById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: "Mesa n\xE3o encontrada" });
      }
      const orders2 = await storage.getOrdersByTableId(table.restaurantId, table.id);
      const guests = table.currentSessionId ? await storage.getTableGuests(table.currentSessionId) : [];
      const ordersByGuest = guests.map((guest) => ({
        guest,
        orders: orders2.filter((order) => order.guestId === guest.id),
        subtotal: orders2.filter((order) => order.guestId === guest.id && order.status !== "cancelado").reduce((sum, order) => sum + parseFloat(order.totalAmount), 0).toFixed(2)
      }));
      const anonymousOrders = orders2.filter((order) => !order.guestId);
      res.json({
        ordersByGuest,
        anonymousOrders,
        totalAmount: orders2.filter((o) => o.status !== "cancelado").reduce((sum, o) => sum + parseFloat(o.totalAmount), 0).toFixed(2)
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pedidos por cliente" });
    }
  });
  app2.get("/api/tables/:id/bill-splits", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const table = await storage.getTableById(req.params.id);
      if (!table || !table.currentSessionId) {
        return res.json([]);
      }
      const splits = await storage.getBillSplits(table.currentSessionId);
      res.json(splits);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar divis\xF5es de conta" });
    }
  });
  app2.post("/api/tables/:id/bill-splits", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const table = await storage.getTableById(req.params.id);
      if (!table || !table.currentSessionId) {
        return res.status(400).json({ message: "Mesa sem sess\xE3o ativa" });
      }
      const { splitType, totalAmount, splitCount, allocations } = req.body;
      const split = await storage.createBillSplit(restaurantId, {
        sessionId: table.currentSessionId,
        tableId: table.id,
        splitType,
        totalAmount,
        splitCount: splitCount || 1,
        allocations,
        createdBy: currentUser.id
      });
      broadcastToClients({ type: "bill_split_created", data: { tableId: table.id, split } });
      res.json(split);
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao criar divis\xE3o de conta" });
    }
  });
  app2.patch("/api/tables/:id/bill-splits/:splitId", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const { allocations, isFinalized } = req.body;
      const updatedSplit = await storage.updateBillSplit(req.params.splitId, { allocations, isFinalized });
      broadcastToClients({ type: "bill_split_updated", data: { tableId: req.params.id, split: updatedSplit } });
      res.json(updatedSplit);
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao atualizar divis\xE3o" });
    }
  });
  app2.post("/api/tables/:id/bill-splits/:splitId/finalize", isCashierOrAbove, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const finalizedSplit = await storage.finalizeBillSplit(req.params.splitId);
      broadcastToClients({ type: "bill_split_finalized", data: { tableId: req.params.id, split: finalizedSplit } });
      res.json(finalizedSplit);
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao finalizar divis\xE3o" });
    }
  });
  app2.get("/api/financial-shifts", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associa\xE7\xE3o a um restaurante." });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      const shifts = await storage.getAllShifts(restaurantId, branchId, startDate, endDate);
      res.json(shifts);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar turnos" });
    }
  });
  app2.get("/api/financial-shifts/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associa\xE7\xE3o a um restaurante." });
      }
      const shift = await storage.getShiftById(req.params.id);
      if (!shift) {
        return res.status(404).json({ message: "Turno n\xE3o encontrado" });
      }
      if (shift.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado a este turno" });
      }
      res.json(shift);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar turno" });
    }
  });
  app2.post("/api/financial-shifts", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associa\xE7\xE3o a um restaurante." });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const { openingBalance, notes } = req.body;
      const shift = await storage.createShift(restaurantId, branchId, {
        operatorId: currentUser.id,
        branchId,
        openingBalance: openingBalance || "0",
        notes
      });
      res.json(shift);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar turno" });
    }
  });
  app2.patch("/api/financial-shifts/:id/close", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associa\xE7\xE3o a um restaurante." });
      }
      const { closingBalance, notes } = req.body;
      if (!closingBalance) {
        return res.status(400).json({ message: "Saldo de fechamento \xE9 obrigat\xF3rio" });
      }
      const shift = await storage.getShiftById(req.params.id);
      if (!shift) {
        return res.status(404).json({ message: "Turno n\xE3o encontrado" });
      }
      if (shift.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado a este turno" });
      }
      const closedShift = await storage.closeShift(req.params.id, closingBalance, notes);
      res.json(closedShift);
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao fechar turno" });
    }
  });
  app2.get("/api/financial-events", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associa\xE7\xE3o a um restaurante." });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const filters = {};
      if (req.query.sessionId) filters.sessionId = req.query.sessionId;
      if (req.query.orderId) filters.orderId = req.query.orderId;
      if (req.query.tableId) filters.tableId = req.query.tableId;
      if (req.query.eventType) filters.eventType = req.query.eventType;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate);
      const events = await storage.getFinancialEvents(restaurantId, branchId, filters);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar eventos financeiros" });
    }
  });
  app2.post("/api/financial-events", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associa\xE7\xE3o a um restaurante." });
      }
      const restaurantId = currentUser.restaurantId;
      const event = await storage.createFinancialEvent(restaurantId, req.body);
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar evento financeiro" });
    }
  });
  app2.get("/api/order-adjustments/:orderId", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associa\xE7\xE3o a um restaurante." });
      }
      const adjustments = await storage.getOrderAdjustments(req.params.orderId);
      res.json(adjustments);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar ajustes" });
    }
  });
  app2.post("/api/order-adjustments", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associa\xE7\xE3o a um restaurante." });
      }
      const restaurantId = currentUser.restaurantId;
      const adjustment = await storage.createOrderAdjustment(restaurantId, {
        ...req.body,
        appliedBy: currentUser.id
      });
      res.json(adjustment);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar ajuste" });
    }
  });
  app2.get("/api/payment-events", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associa\xE7\xE3o a um restaurante." });
      }
      const restaurantId = currentUser.restaurantId;
      const filters = {};
      if (req.query.orderId) filters.orderId = req.query.orderId;
      if (req.query.sessionId) filters.sessionId = req.query.sessionId;
      if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate);
      const paymentEvents2 = await storage.getPaymentEvents(restaurantId, filters);
      res.json(paymentEvents2);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar eventos de pagamento" });
    }
  });
  app2.get("/api/report-aggregations", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associa\xE7\xE3o a um restaurante." });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const periodType = req.query.periodType || "daily";
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      const aggregations = await storage.getReportAggregations(
        restaurantId,
        branchId,
        periodType,
        startDate,
        endDate
      );
      res.json(aggregations);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar agrega\xE7\xF5es de relat\xF3rio" });
    }
  });
  app2.get("/api/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const categories2 = await storage.getCategories(restaurantId, branchId);
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(restaurantId, branchId, data);
      res.json(category);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  app2.patch("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const data = updateCategorySchema.parse(req.body);
      const category = await storage.updateCategory(restaurantId, req.params.id, data);
      res.json(category);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  app2.delete("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      await storage.deleteCategory(restaurantId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  app2.post("/api/categories/reorder", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ message: "orderedIds must be an array" });
      }
      await storage.reorderCategories(restaurantId, orderedIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reorder categories" });
    }
  });
  app2.get("/api/menu-items", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const menuItems2 = await storage.getMenuItems(restaurantId, branchId);
      res.json(menuItems2);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  app2.post("/api/menu-items", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      if (currentUser.role !== "superadmin") {
        const subscription = await storage.getSubscriptionByRestaurantId(restaurantId);
        if (subscription) {
          const plan = await storage.getSubscriptionPlanById(subscription.planId);
          if (plan && plan.maxMenuItems !== null) {
            const currentMenuItems = await storage.getMenuItems(restaurantId, null);
            if (currentMenuItems.length >= plan.maxMenuItems) {
              return res.status(403).json({
                message: `Limite de produtos atingido. Seu plano permite at\xE9 ${plan.maxMenuItems} produtos. Fa\xE7a upgrade para adicionar mais.`
              });
            }
          }
        }
      }
      const branchId = currentUser.activeBranchId || null;
      const data = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(restaurantId, branchId, data);
      res.json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });
  app2.patch("/api/menu-items/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const data = updateMenuItemSchema.parse(req.body);
      const menuItem = await storage.updateMenuItem(restaurantId, req.params.id, data);
      res.json(menuItem);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });
  app2.delete("/api/menu-items/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      await storage.deleteMenuItem(restaurantId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });
  app2.post("/api/menu-items/:id/image", isAdmin, uploadMenuItemImage.single("image"), async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
      }
      const restaurantId = currentUser.restaurantId;
      const menuItemId = req.params.id;
      const menuItem = await storage.getMenuItemById(menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Item do menu n\xE3o encontrado" });
      }
      if (menuItem.restaurantId !== restaurantId) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      if (menuItem.imageUrl) {
        await deleteOldImage(menuItem.imageUrl, "menu-items");
      }
      const imageUrl = `/uploads/menu-items/${req.file.filename}`;
      const updated = await storage.updateMenuItem(restaurantId, menuItemId, { imageUrl });
      res.json({ imageUrl: updated.imageUrl });
    } catch (error) {
      console.error("Error uploading menu item image:", error);
      res.status(500).json({ message: "Erro ao fazer upload da imagem" });
    }
  });
  app2.post("/api/menu-items/reorder", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const { categoryId, orderedIds } = req.body;
      if (!categoryId || !Array.isArray(orderedIds)) {
        return res.status(400).json({ message: "categoryId and orderedIds are required" });
      }
      await storage.reorderMenuItems(restaurantId, categoryId, orderedIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reorder menu items" });
    }
  });
  app2.get("/api/menu-items/:id/recipe", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const menuItem = await storage.getMenuItemById(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato n\xE3o encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "N\xE3o autorizado" });
      }
      const ingredients = await storage.getRecipeIngredients(currentUser.restaurantId, req.params.id);
      const cost = await storage.getMenuItemRecipeCost(currentUser.restaurantId, req.params.id);
      res.json({ ingredients, cost });
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Erro ao buscar receita" });
    }
  });
  app2.post("/api/menu-items/:id/recipe", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const menuItem = await storage.getMenuItemById(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato n\xE3o encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "N\xE3o autorizado" });
      }
      const inventoryItem = await storage.getInventoryItemById(req.body.inventoryItemId);
      if (!inventoryItem) {
        return res.status(404).json({ message: "Ingrediente n\xE3o encontrado" });
      }
      if (inventoryItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Ingrediente n\xE3o pertence ao seu restaurante" });
      }
      const data = {
        menuItemId: req.params.id,
        inventoryItemId: req.body.inventoryItemId,
        quantity: String(parseFloat(req.body.quantity || "0"))
      };
      if (parseFloat(data.quantity) <= 0) {
        return res.status(400).json({ message: "Quantidade deve ser maior que zero" });
      }
      const ingredient = await storage.addRecipeIngredient(currentUser.restaurantId, data);
      res.json(ingredient);
    } catch (error) {
      console.error("Error adding ingredient:", error);
      res.status(500).json({ message: "Erro ao adicionar ingrediente" });
    }
  });
  app2.patch("/api/recipe-ingredients/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const data = { quantity: req.body.quantity };
      const ingredient = await storage.updateRecipeIngredient(req.params.id, currentUser.restaurantId, data);
      res.json(ingredient);
    } catch (error) {
      console.error("Error updating ingredient:", error);
      res.status(500).json({ message: "Erro ao atualizar ingrediente" });
    }
  });
  app2.delete("/api/recipe-ingredients/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deleteRecipeIngredient(req.params.id, currentUser.restaurantId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      res.status(500).json({ message: "Erro ao deletar ingrediente" });
    }
  });
  app2.get("/api/menu-items/:menuItemId/option-groups", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const menuItem = await storage.getMenuItemById(req.params.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato n\xE3o encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "N\xE3o autorizado: Este prato n\xE3o pertence ao seu restaurante" });
      }
      const groups = await storage.getOptionGroupsByMenuItem(req.params.menuItemId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching option groups:", error);
      res.status(500).json({ message: "Erro ao buscar grupos de op\xE7\xF5es", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/menu-items/:menuItemId/option-groups", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const menuItem = await storage.getMenuItemById(req.params.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato n\xE3o encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "N\xE3o autorizado: Este prato n\xE3o pertence ao seu restaurante" });
      }
      const data = insertOptionGroupSchema.parse(req.body);
      const group = await storage.createOptionGroup(req.params.menuItemId, data);
      res.json(group);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Validation error creating option group:", error.errors);
        return res.status(400).json({ message: error.errors[0].message, errors: error.errors });
      }
      console.error("Error creating option group:", error);
      res.status(500).json({ message: "Erro ao criar grupo de op\xE7\xF5es", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.patch("/api/option-groups/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const group = await storage.getOptionGroupById(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Grupo de op\xE7\xF5es n\xE3o encontrado" });
      }
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato n\xE3o encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "N\xE3o autorizado: Este grupo n\xE3o pertence ao seu restaurante" });
      }
      const data = updateOptionGroupSchema.parse(req.body);
      const updatedGroup = await storage.updateOptionGroup(req.params.id, data);
      res.json(updatedGroup);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar grupo de op\xE7\xF5es" });
    }
  });
  app2.delete("/api/option-groups/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const group = await storage.getOptionGroupById(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Grupo de op\xE7\xF5es n\xE3o encontrado" });
      }
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato n\xE3o encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "N\xE3o autorizado: Este grupo n\xE3o pertence ao seu restaurante" });
      }
      await storage.deleteOptionGroup(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir grupo de op\xE7\xF5es" });
    }
  });
  app2.get("/api/option-groups/:groupId/options", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const group = await storage.getOptionGroupById(req.params.groupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo de op\xE7\xF5es n\xE3o encontrado" });
      }
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato n\xE3o encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "N\xE3o autorizado: Este grupo n\xE3o pertence ao seu restaurante" });
      }
      const options2 = await storage.getOptionsByGroupId(req.params.groupId);
      res.json(options2);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar op\xE7\xF5es" });
    }
  });
  app2.post("/api/option-groups/:groupId/options", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const group = await storage.getOptionGroupById(req.params.groupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo de op\xE7\xF5es n\xE3o encontrado" });
      }
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato n\xE3o encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "N\xE3o autorizado: Este grupo n\xE3o pertence ao seu restaurante" });
      }
      const data = insertOptionSchema.parse(req.body);
      const option = await storage.createOption(req.params.groupId, data);
      res.json(option);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao criar op\xE7\xE3o" });
    }
  });
  app2.patch("/api/options/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const option = await storage.getOptionById(req.params.id);
      if (!option) {
        return res.status(404).json({ message: "Op\xE7\xE3o n\xE3o encontrada" });
      }
      const group = await storage.getOptionGroupById(option.optionGroupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo de op\xE7\xF5es n\xE3o encontrado" });
      }
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato n\xE3o encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "N\xE3o autorizado: Esta op\xE7\xE3o n\xE3o pertence ao seu restaurante" });
      }
      const data = updateOptionSchema.parse(req.body);
      const updatedOption = await storage.updateOption(req.params.id, data);
      res.json(updatedOption);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar op\xE7\xE3o" });
    }
  });
  app2.delete("/api/options/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const option = await storage.getOptionById(req.params.id);
      if (!option) {
        return res.status(404).json({ message: "Op\xE7\xE3o n\xE3o encontrada" });
      }
      const group = await storage.getOptionGroupById(option.optionGroupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo de op\xE7\xF5es n\xE3o encontrado" });
      }
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato n\xE3o encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "N\xE3o autorizado: Esta op\xE7\xE3o n\xE3o pertence ao seu restaurante" });
      }
      await storage.deleteOption(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir op\xE7\xE3o" });
    }
  });
  app2.get("/api/orders/kitchen", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const orders2 = await storage.getKitchenOrders(restaurantId, branchId);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/recent", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const orders2 = await storage.getRecentOrders(restaurantId, branchId, 10);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent orders" });
    }
  });
  app2.get("/api/orders", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const orders2 = await storage.getKitchenOrders(restaurantId, branchId);
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/orders", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      const { items, ...orderData } = req.body;
      console.log("Creating order with data:", JSON.stringify({ orderData, items }, null, 2));
      const validatedOrder = insertOrderSchema.parse({
        ...orderData,
        createdBy: currentUser.id,
        branchId: currentUser.activeBranchId || null
      });
      const validatedItems = z2.array(publicOrderItemSchema).parse(items);
      const orderNumber = await generateOrderNumber(
        currentUser.restaurantId,
        validatedOrder.orderType
      );
      const order = await storage.createOrder({
        ...validatedOrder,
        orderNumber
      }, validatedItems);
      broadcastToClients({ type: "new_order", data: order });
      try {
        const kitchenPrinters = await storage.getActivePrintersByType(
          currentUser.restaurantId,
          "kitchen",
          currentUser.activeBranchId || void 0
        );
        const autoPrintPrinters = kitchenPrinters.filter((p) => p.autoPrint === 1);
        if (autoPrintPrinters.length > 0) {
          broadcastToClients({
            type: "auto_print_order",
            data: {
              order,
              printers: autoPrintPrinters
            }
          });
          console.log(`[AUTO-PRINT] Triggered for order ${orderNumber} on ${autoPrintPrinters.length} printer(s)`);
        }
      } catch (printError) {
        console.error("[AUTO-PRINT] Error checking printers:", printError);
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Validation error:", error.errors);
        const firstError = error.errors[0];
        const field = firstError.path.join(".");
        return res.status(400).json({
          message: `${field}: ${firstError.message}`,
          errors: error.errors
        });
      }
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.patch("/api/orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const { status } = req.body;
      if (!["pendente", "em_preparo", "pronto", "servido"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const order = await storage.updateOrderStatus(restaurantId, req.params.id, status, currentUser.id);
      if (status === "servido") {
        if (order.tableId) {
          await storage.updateTableOccupancy(restaurantId, order.tableId, false);
          broadcastToClients({
            type: "table_freed",
            data: { tableId: order.tableId }
          });
        }
      }
      broadcastToClients({
        type: "order_status_updated",
        data: { id: order.id, status: order.status }
      });
      if (order.customerPhone) {
        const restaurant = await storage.getRestaurantById(restaurantId);
        if (restaurant) {
          sendWhatsAppOrderStatus(
            order.customerPhone,
            restaurant.name,
            order.id.substring(0, 8).toUpperCase(),
            status
          ).catch((err) => console.error("[WHATSAPP] Failed to send order status:", err));
        }
      }
      res.json(order);
    } catch (error) {
      console.error("Order status update error:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  app2.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Erro ao buscar pedido" });
    }
  });
  app2.put("/api/orders/:id/metadata", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel editar pedido j\xE1 servido" });
      }
      const data = updateOrderMetadataSchema.parse(req.body);
      const updated = await storage.updateOrderMetadata(restaurantId, req.params.id, data);
      broadcastToClients({
        type: "order_updated",
        data: { id: updated.id }
      });
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error updating order metadata:", error);
      res.status(500).json({ message: "Erro ao atualizar metadados do pedido" });
    }
  });
  app2.post("/api/orders/:id/items", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel adicionar itens a pedido j\xE1 servido" });
      }
      const item = publicOrderItemSchema.parse(req.body);
      const created = await storage.addOrderItem(restaurantId, req.params.id, item);
      broadcastToClients({
        type: "order_items_changed",
        data: { orderId: req.params.id }
      });
      res.json(created);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error adding order item:", error);
      res.status(500).json({ message: "Erro ao adicionar item ao pedido" });
    }
  });
  app2.put("/api/orders/:id/items/:itemId", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel editar pedido j\xE1 servido" });
      }
      const { quantity } = updateOrderItemQuantitySchema.parse(req.body);
      const updated = await storage.updateOrderItemQuantity(
        restaurantId,
        req.params.id,
        req.params.itemId,
        quantity
      );
      broadcastToClients({
        type: "order_items_changed",
        data: { orderId: req.params.id }
      });
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error updating order item:", error);
      res.status(500).json({ message: "Erro ao atualizar item do pedido" });
    }
  });
  app2.delete("/api/orders/:id/items/:itemId", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel remover itens de pedido j\xE1 servido" });
      }
      await storage.removeOrderItem(restaurantId, req.params.id, req.params.itemId);
      broadcastToClients({
        type: "order_items_changed",
        data: { orderId: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing order item:", error);
      res.status(500).json({ message: "Erro ao remover item do pedido" });
    }
  });
  app2.patch("/api/order-items/:itemId/reassign", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const { newGuestId, reason } = reassignOrderItemSchema.parse(req.body);
      const orderItem = await db.query.orderItems.findFirst({
        where: (items, { eq: eq4 }) => eq4(items.id, req.params.itemId),
        with: {
          order: true
        }
      });
      if (!orderItem) {
        return res.status(404).json({ message: "Item do pedido n\xE3o encontrado" });
      }
      if (orderItem.order.restaurantId !== restaurantId) {
        return res.status(403).json({ message: "Item n\xE3o pertence a este restaurante" });
      }
      if (orderItem.order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel mover itens de pedido j\xE1 servido" });
      }
      if (orderItem.order.paymentStatus === "pago") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel mover itens de pedido j\xE1 pago" });
      }
      const newGuest = await db.query.tableGuests.findFirst({
        where: (guests, { eq: eq4, and: and4 }) => and4(
          eq4(guests.id, newGuestId),
          eq4(guests.restaurantId, restaurantId)
        )
      });
      if (!newGuest) {
        return res.status(404).json({ message: "Cliente destino n\xE3o encontrado" });
      }
      if (orderItem.order.tableSessionId !== newGuest.sessionId) {
        return res.status(400).json({ message: "Cliente destino est\xE1 em outra sess\xE3o/mesa" });
      }
      if (newGuest.status === "pago" || newGuest.status === "saiu") {
        return res.status(400).json({ message: "Cliente destino j\xE1 pagou ou saiu" });
      }
      const oldGuestId = orderItem.guestId;
      await db.update(orderItems).set({ guestId: newGuestId }).where(eq2(orderItems.id, req.params.itemId));
      const menuItem = await db.query.menuItems.findFirst({
        where: (items, { eq: eq4 }) => eq4(items.id, orderItem.menuItemId)
      });
      if (oldGuestId) {
        await storage.recalculateGuestTotal(restaurantId, oldGuestId);
      }
      await storage.recalculateGuestTotal(restaurantId, newGuestId);
      await db.insert(orderItemAuditLogs).values({
        restaurantId,
        orderItemId: orderItem.id,
        orderId: orderItem.orderId,
        sessionId: orderItem.order.tableSessionId,
        action: "item_reassigned",
        actorUserId: currentUser.id,
        sourceGuestId: oldGuestId,
        targetGuestId: newGuestId,
        itemDetails: {
          menuItemName: menuItem?.name || "Item desconhecido",
          quantity: orderItem.quantity,
          price: orderItem.price
        },
        oldValue: {
          guestId: oldGuestId,
          guestNumber: oldGuestId ? (await db.query.tableGuests.findFirst({
            where: (guests, { eq: eq4 }) => eq4(guests.id, oldGuestId)
          }))?.guestNumber : null
        },
        newValue: {
          guestId: newGuestId,
          guestNumber: newGuest.guestNumber
        },
        reason: reason || "Movido via interface",
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      broadcastToClients({
        type: "order_items_changed",
        data: {
          orderId: orderItem.orderId,
          sessionId: orderItem.order.tableSessionId,
          oldGuestId,
          newGuestId
        }
      });
      res.json({
        success: true,
        message: "Item movido com sucesso",
        oldGuestId,
        newGuestId
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error reassigning order item:", error);
      res.status(500).json({ message: "Erro ao mover item do pedido" });
    }
  });
  app2.put("/api/orders/:id/discount", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel aplicar desconto a pedido j\xE1 servido" });
      }
      const { discount, discountType } = applyDiscountSchema.parse(req.body);
      const updated = await storage.applyDiscount(restaurantId, req.params.id, discount, discountType);
      broadcastToClients({
        type: "order_totals_changed",
        data: { orderId: req.params.id, totalAmount: updated.totalAmount }
      });
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error applying discount:", error);
      res.status(500).json({ message: "Erro ao aplicar desconto" });
    }
  });
  app2.put("/api/orders/:id/service-charge", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel aplicar taxa de servi\xE7o a pedido j\xE1 servido" });
      }
      const { serviceCharge, serviceName } = applyServiceChargeSchema.parse(req.body);
      const updated = await storage.applyServiceCharge(restaurantId, req.params.id, serviceCharge, serviceName);
      broadcastToClients({
        type: "order_totals_changed",
        data: { orderId: req.params.id, totalAmount: updated.totalAmount }
      });
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error applying service charge:", error);
      res.status(500).json({ message: "Erro ao aplicar taxa de servi\xE7o" });
    }
  });
  app2.put("/api/orders/:id/delivery-fee", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel aplicar taxa de entrega a pedido j\xE1 servido" });
      }
      const { deliveryFee } = applyDeliveryFeeSchema.parse(req.body);
      const updated = await storage.applyDeliveryFee(restaurantId, req.params.id, deliveryFee);
      broadcastToClients({
        type: "order_totals_changed",
        data: { orderId: req.params.id, totalAmount: updated.totalAmount }
      });
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error applying delivery fee:", error);
      res.status(500).json({ message: "Erro ao aplicar taxa de entrega" });
    }
  });
  app2.put("/api/orders/:id/packaging-fee", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel aplicar taxa de embalagem a pedido j\xE1 servido" });
      }
      const { packagingFee } = applyPackagingFeeSchema.parse(req.body);
      const updated = await storage.applyPackagingFee(restaurantId, req.params.id, packagingFee);
      broadcastToClients({
        type: "order_totals_changed",
        data: { orderId: req.params.id, totalAmount: updated.totalAmount }
      });
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error applying packaging fee:", error);
      res.status(500).json({ message: "Erro ao aplicar taxa de embalagem" });
    }
  });
  app2.post("/api/orders/:id/payments", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel registrar pagamento para pedido j\xE1 servido" });
      }
      const payment = recordPaymentSchema.parse(req.body);
      const updated = await storage.recordPayment(restaurantId, req.params.id, payment, currentUser.id);
      if (updated.paymentStatus === "pago") {
        broadcastToClients({
          type: "order_payment_completed",
          data: {
            orderId: req.params.id,
            totalAmount: updated.totalAmount,
            paymentMethod: updated.paymentMethod
          }
        });
      } else {
        broadcastToClients({
          type: "order_payment_recorded",
          data: {
            orderId: req.params.id,
            paidAmount: updated.paidAmount,
            paymentStatus: updated.paymentStatus
          }
        });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error recording payment:", error);
      res.status(500).json({ message: "Erro ao registrar pagamento" });
    }
  });
  app2.post("/api/orders/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "cancelado" || order.cancellationReason && order.cancellationReason !== "") {
        return res.status(400).json({ message: "Pedido j\xE1 est\xE1 cancelado" });
      }
      const { cancellationReason } = cancelOrderSchema.parse(req.body);
      const cancelled = await storage.cancelOrder(restaurantId, req.params.id, cancellationReason, currentUser.id);
      broadcastToClients({
        type: "order_cancelled",
        data: {
          orderId: req.params.id,
          cancellationReason
        }
      });
      res.json(cancelled);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error cancelling order:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao cancelar pedido";
      res.status(500).json({ message: errorMessage });
    }
  });
  app2.put("/api/orders/:id/customer", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel vincular cliente a pedido j\xE1 servido" });
      }
      const { customerId } = linkCustomerSchema.parse(req.body);
      const customer = await storage.getCustomerById(customerId);
      if (!customer || customer.restaurantId !== restaurantId) {
        return res.status(404).json({ message: "Cliente n\xE3o encontrado" });
      }
      const updated = await storage.linkCustomerToOrder(restaurantId, req.params.id, customerId);
      broadcastToClients({
        type: "order_customer_linked",
        data: { orderId: req.params.id, customerId }
      });
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error linking customer:", error);
      res.status(500).json({ message: "Erro ao vincular cliente ao pedido" });
    }
  });
  app2.post("/api/orders/:id/coupon", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel aplicar cupom a pedido j\xE1 servido" });
      }
      const { couponCode } = applyCouponSchema.parse(req.body);
      const subtotal = parseFloat(order.subtotal || "0");
      const validation = await storage.validateCoupon(
        restaurantId,
        couponCode,
        subtotal,
        order.orderType,
        order.customerId || void 0
      );
      if (!validation.valid || !validation.coupon) {
        return res.status(400).json({ message: validation.message || "Cupom inv\xE1lido" });
      }
      const updated = await storage.applyCouponToOrder(restaurantId, req.params.id, validation.coupon.id, validation.discountAmount || 0);
      broadcastToClients({
        type: "order_coupon_applied",
        data: {
          orderId: req.params.id,
          couponId: validation.coupon.id,
          totalAmount: updated.totalAmount
        }
      });
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error applying coupon:", error);
      res.status(500).json({ message: "Erro ao aplicar cupom" });
    }
  });
  app2.post("/api/orders/:id/loyalty/redeem", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      if (order.status === "servido") {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel resgatar pontos em pedido j\xE1 servido" });
      }
      if (!order.customerId) {
        return res.status(400).json({ message: "Pedido n\xE3o possui cliente vinculado" });
      }
      const { pointsToRedeem } = redeemLoyaltyPointsSchema.parse(req.body);
      const customer = await storage.getCustomerById(order.customerId);
      if (!customer || customer.restaurantId !== restaurantId) {
        return res.status(404).json({ message: "Cliente n\xE3o encontrado" });
      }
      const availablePoints = customer.loyaltyPoints || 0;
      if (pointsToRedeem > availablePoints) {
        return res.status(400).json({
          message: `Pontos insuficientes. Dispon\xEDvel: ${availablePoints}, Solicitado: ${pointsToRedeem}`
        });
      }
      const loyaltyProgram = await storage.getLoyaltyProgram(restaurantId);
      if (!loyaltyProgram || !loyaltyProgram.isActive) {
        return res.status(400).json({ message: "Programa de fidelidade n\xE3o est\xE1 ativo" });
      }
      const minPoints = loyaltyProgram.minPointsToRedeem || 100;
      if (pointsToRedeem < minPoints) {
        return res.status(400).json({
          message: `M\xEDnimo de pontos para resgate: ${minPoints}`
        });
      }
      const result = await storage.redeemLoyaltyPointsForOrder(
        restaurantId,
        order.customerId,
        pointsToRedeem,
        req.params.id,
        currentUser.id
      );
      const updated = result.order;
      broadcastToClients({
        type: "loyalty_points_redeemed",
        data: {
          orderId: req.params.id,
          customerId: order.customerId,
          pointsRedeemed: pointsToRedeem,
          totalAmount: updated.totalAmount
        }
      });
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error redeeming loyalty points:", error);
      res.status(500).json({ message: "Erro ao resgatar pontos de fidelidade" });
    }
  });
  app2.get("/api/orders/:id/print", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const allOrders = await storage.getKitchenOrders(restaurantId, branchId);
      const order = allOrders.find((o) => o.id === req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
      }
      const restaurant = await storage.getRestaurantById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante n\xE3o encontrado" });
      }
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=pedido-${order.id.slice(0, 8)}.pdf`);
      doc.pipe(res);
      const statusLabels = {
        "pendente": "Pendente",
        "em_preparo": "Em Preparo",
        "pronto": "Pronto",
        "servido": "Servido"
      };
      const typeLabels = {
        "mesa": "Mesa",
        "delivery": "Delivery",
        "takeout": "Retirada"
      };
      doc.fontSize(20).font("Helvetica-Bold").text(restaurant.name.toUpperCase(), { align: "center" });
      doc.fontSize(10).font("Helvetica").text("COMANDA DE PEDIDO", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(8).text("\u2550".repeat(85), { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).font("Helvetica-Bold").text(`Pedido #${order.id.slice(0, 8).toUpperCase()}`, { align: "left" });
      doc.fontSize(10).font("Helvetica");
      const orderDate = new Date(order.createdAt);
      const dateStr = orderDate.toLocaleDateString("pt-AO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      const timeStr = orderDate.toLocaleTimeString("pt-AO", {
        hour: "2-digit",
        minute: "2-digit"
      });
      doc.text(`Data: ${dateStr}  |  Hora: ${timeStr}`);
      doc.text(`Tipo: ${typeLabels[order.orderType] || order.orderType}`);
      doc.text(`Status: ${statusLabels[order.status] || order.status}`);
      if (order.table) {
        doc.text(`Mesa: ${order.table.number}`);
      }
      if (order.customerName) {
        doc.text(`Cliente: ${order.customerName}`);
      }
      if (order.customerPhone) {
        doc.text(`Telefone: ${order.customerPhone}`);
      }
      doc.moveDown(0.5);
      doc.fontSize(8).text("\u2500".repeat(85));
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica-Bold").text("ITENS DO PEDIDO");
      doc.moveDown(0.5);
      let totalAmount = 0;
      order.orderItems.forEach((item, index2) => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        totalAmount += itemTotal;
        doc.fontSize(10).font("Helvetica-Bold").text(`${item.quantity}x ${item.menuItem.name}`);
        doc.fontSize(9).font("Helvetica").text(`   Kz ${parseFloat(item.price).toFixed(2)} cada`, { continued: true }).text(`Kz ${itemTotal.toFixed(2)}`, { align: "right" });
        if (item.notes) {
          doc.fontSize(8).fillColor("#666666").text(`   Obs: ${item.notes}`);
          doc.fillColor("#000000");
        }
        if (index2 < order.orderItems.length - 1) {
          doc.moveDown(0.3);
        }
      });
      doc.moveDown(0.5);
      doc.fontSize(8).text("\u2500".repeat(85));
      doc.moveDown(0.5);
      doc.fontSize(12).font("Helvetica-Bold").text("TOTAL:", { continued: true }).text(`Kz ${totalAmount.toFixed(2)}`, { align: "right" });
      doc.moveDown(1);
      doc.fontSize(8).text("\u2550".repeat(85), { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(8).font("Helvetica").fillColor("#666666").text("Documento gerado automaticamente pelo sistema NaBancada", { align: "center" });
      doc.end();
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar PDF do pedido" });
    }
  });
  app2.delete("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      try {
        await storage.deleteOrder(restaurantId, req.params.id);
        broadcastToClients({
          type: "order_deleted",
          data: { orderId: req.params.id }
        });
        res.json({ message: "Pedido cancelado com sucesso" });
      } catch (error) {
        if (error.message === "Order not found") {
          return res.status(404).json({ message: "Pedido n\xE3o encontrado" });
        }
        if (error.message.includes("Unauthorized") || error.message.includes("not belong")) {
          return res.status(403).json({ message: "N\xE3o autorizado a cancelar este pedido" });
        }
        if (error.message === "Cannot delete paid orders") {
          return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel cancelar pedidos j\xE1 pagos" });
        }
        throw error;
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Erro ao cancelar pedido" });
    }
  });
  app2.get("/api/stats/dashboard", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const stats = await storage.getTodayStats(restaurantId, branchId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.get("/api/stats/custom-range", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate s\xE3o obrigat\xF3rios" });
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ message: "Formato de data inv\xE1lido. Use YYYY-MM-DD" });
      }
      const start = /* @__PURE__ */ new Date(startDate + "T00:00:00.000Z");
      const end = /* @__PURE__ */ new Date(endDate + "T23:59:59.999Z");
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Datas inv\xE1lidas" });
      }
      if (start > end) {
        return res.status(400).json({ message: "A data inicial deve ser anterior \xE0 data final" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const stats = await storage.getCustomDateRangeStats(restaurantId, branchId, start, end);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom range stats" });
    }
  });
  app2.get("/api/stats/historical", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const days = parseInt(req.query.days) || 7;
      if (days < 1 || days > 365) {
        return res.status(400).json({ message: "Days must be between 1 and 365" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const stats = await storage.getHistoricalStats(restaurantId, branchId, days);
      res.json(stats);
    } catch (error) {
      console.error("Historical stats error:", error);
      res.status(500).json({ message: "Failed to fetch historical stats" });
    }
  });
  app2.get("/api/stats/heatmap", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const days = parseInt(req.query.days) || 30;
      if (days < 1 || days > 365) {
        return res.status(400).json({ message: "Days must be between 1 and 365" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const heatmapData = await storage.getSalesHeatmapData(restaurantId, branchId, days);
      res.json(heatmapData);
    } catch (error) {
      console.error("Heatmap data error:", error);
      res.status(500).json({ message: "Failed to fetch heatmap data" });
    }
  });
  app2.get("/api/stats/kitchen", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const period = req.query.period || "daily";
      if (!["daily", "weekly", "monthly", "quarterly", "yearly"].includes(period)) {
        return res.status(400).json({ message: "Invalid period. Must be one of: daily, weekly, monthly, quarterly, yearly" });
      }
      const stats = await storage.getKitchenStats(restaurantId, branchId, period);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch kitchen stats" });
    }
  });
  app2.get("/api/reports/sales", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate s\xE3o obrigat\xF3rios" });
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ message: "Formato de data inv\xE1lido. Use YYYY-MM-DD" });
      }
      const start = /* @__PURE__ */ new Date(startDate + "T00:00:00.000Z");
      const end = /* @__PURE__ */ new Date(endDate + "T23:59:59.999Z");
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Datas inv\xE1lidas" });
      }
      if (start > end) {
        return res.status(400).json({ message: "A data inicial deve ser anterior \xE0 data final" });
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const report = await storage.getSalesReport(restaurantId, branchId, start, end);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar relat\xF3rio de vendas" });
    }
  });
  app2.get("/api/reports/orders", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const { startDate, endDate, status, orderType } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate s\xE3o obrigat\xF3rios" });
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ message: "Formato de data inv\xE1lido. Use YYYY-MM-DD" });
      }
      const start = /* @__PURE__ */ new Date(startDate + "T00:00:00.000Z");
      const end = /* @__PURE__ */ new Date(endDate + "T23:59:59.999Z");
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Datas inv\xE1lidas" });
      }
      if (start > end) {
        return res.status(400).json({ message: "A data inicial deve ser anterior \xE0 data final" });
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const report = await storage.getOrdersReport(
        restaurantId,
        branchId,
        start,
        end,
        status,
        orderType
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar relat\xF3rio de pedidos" });
    }
  });
  app2.get("/api/reports/products", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate s\xE3o obrigat\xF3rios" });
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ message: "Formato de data inv\xE1lido. Use YYYY-MM-DD" });
      }
      const start = /* @__PURE__ */ new Date(startDate + "T00:00:00.000Z");
      const end = /* @__PURE__ */ new Date(endDate + "T23:59:59.999Z");
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Datas inv\xE1lidas" });
      }
      if (start > end) {
        return res.status(400).json({ message: "A data inicial deve ser anterior \xE0 data final" });
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const report = await storage.getProductsReport(restaurantId, branchId, start, end);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar relat\xF3rio de produtos" });
    }
  });
  app2.get("/api/reports/performance", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate s\xE3o obrigat\xF3rios" });
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ message: "Formato de data inv\xE1lido. Use YYYY-MM-DD" });
      }
      const start = /* @__PURE__ */ new Date(startDate + "T00:00:00.000Z");
      const end = /* @__PURE__ */ new Date(endDate + "T23:59:59.999Z");
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Datas inv\xE1lidas" });
      }
      if (start > end) {
        return res.status(400).json({ message: "A data inicial deve ser anterior \xE0 data final" });
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const report = await storage.getPerformanceReport(restaurantId, branchId, start, end);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar relat\xF3rio de performance" });
    }
  });
  app2.get("/api/reports/cancelled", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate s\xE3o obrigat\xF3rios" });
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ message: "Formato de data inv\xE1lido. Use YYYY-MM-DD" });
      }
      const start = /* @__PURE__ */ new Date(startDate + "T00:00:00.000Z");
      const end = /* @__PURE__ */ new Date(endDate + "T23:59:59.999Z");
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Datas inv\xE1lidas" });
      }
      if (start > end) {
        return res.status(400).json({ message: "A data inicial deve ser anterior \xE0 data final" });
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const stats = await storage.getCancelledOrdersStats(restaurantId, branchId, start, end);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar estat\xEDsticas de cancelamentos" });
    }
  });
  app2.get("/api/sales", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const {
        dateFilter,
        periodFilter,
        orderBy,
        orderStatus,
        paymentStatus,
        orderType,
        customFrom,
        customTo
      } = req.query;
      let startDate;
      let endDate;
      if (dateFilter === "custom" && customFrom) {
        startDate = new Date(customFrom);
        endDate = customTo ? new Date(customTo) : /* @__PURE__ */ new Date();
      } else if (dateFilter === "today") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === "yesterday") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === "7days") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === "30days") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = /* @__PURE__ */ new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const orders2 = await storage.getOrdersForSales(
        restaurantId,
        branchId,
        startDate,
        endDate,
        orderStatus || "all",
        paymentStatus || "all",
        orderType || "all",
        orderBy || "created",
        periodFilter
      );
      res.json(orders2);
    } catch (error) {
      console.error("Sales API error:", error);
      res.status(500).json({ message: "Erro ao buscar vendas" });
    }
  });
  app2.get("/api/sales/stats", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const {
        dateFilter,
        periodFilter,
        orderBy,
        orderStatus,
        paymentStatus,
        orderType,
        customFrom,
        customTo
      } = req.query;
      let startDate;
      let endDate;
      if (dateFilter === "custom" && customFrom) {
        startDate = new Date(customFrom);
        endDate = customTo ? new Date(customTo) : /* @__PURE__ */ new Date();
      } else if (dateFilter === "today") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === "yesterday") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === "7days") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === "30days") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = /* @__PURE__ */ new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      }
      if (periodFilter && periodFilter !== "all") {
        if (periodFilter === "morning") {
          startDate.setHours(6, 0, 0, 0);
          endDate.setHours(11, 59, 59, 999);
        } else if (periodFilter === "afternoon") {
          startDate.setHours(12, 0, 0, 0);
          endDate.setHours(17, 59, 59, 999);
        } else if (periodFilter === "night") {
          startDate.setHours(18, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
        }
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const stats = await storage.getSalesStats(
        restaurantId,
        branchId,
        startDate,
        endDate,
        orderStatus || "all",
        paymentStatus || "all",
        orderType || "all",
        periodFilter
      );
      res.json(stats);
    } catch (error) {
      console.error("Sales stats API error:", error);
      res.status(500).json({ message: "Erro ao buscar estat\xEDsticas" });
    }
  });
  app2.get("/api/dashboard/stats", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const {
        dateFilter,
        orderType,
        customFrom,
        customTo
      } = req.query;
      const validOrderTypes = ["all", "pdv", "web"];
      const validatedOrderType = orderType || "all";
      if (!validOrderTypes.includes(validatedOrderType)) {
        return res.status(400).json({ message: "orderType deve ser 'all', 'pdv' ou 'web'" });
      }
      let startDate;
      let endDate;
      if (dateFilter === "custom" && customFrom) {
        startDate = new Date(customFrom);
        endDate = customTo ? new Date(customTo) : /* @__PURE__ */ new Date();
      } else if (dateFilter === "today") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === "yesterday") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === "7days") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === "30days") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = /* @__PURE__ */ new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const stats = await storage.getDashboardStats(
        restaurantId,
        branchId,
        startDate,
        endDate,
        validatedOrderType
      );
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats API error:", error);
      res.status(500).json({ message: "Erro ao buscar estat\xEDsticas do dashboard" });
    }
  });
  app2.post("/api/menu-visits", async (req, res) => {
    try {
      const visitSchema = z2.object({
        restaurantId: z2.string(),
        branchId: z2.string().nullish(),
        visitSource: z2.string().optional(),
        ipAddress: z2.string().optional(),
        userAgent: z2.string().optional(),
        referrer: z2.string().optional()
      });
      const validatedData = visitSchema.parse(req.body);
      const visit = await storage.recordMenuVisit(validatedData.restaurantId, {
        branchId: validatedData.branchId || null,
        visitSource: validatedData.visitSource || "qr_code",
        ipAddress: validatedData.ipAddress,
        userAgent: validatedData.userAgent,
        referrer: validatedData.referrer
      });
      res.json(visit);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      console.error("Menu visit recording error:", error);
      res.status(500).json({ message: "Erro ao registrar visita" });
    }
  });
  app2.get("/api/menu-visits/stats", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const { dateFilter, customFrom, customTo } = req.query;
      let startDate;
      let endDate;
      if (dateFilter === "custom" && customFrom) {
        startDate = new Date(customFrom);
        endDate = customTo ? new Date(customTo) : /* @__PURE__ */ new Date();
      } else if (dateFilter === "7days") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === "30days") {
        startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = /* @__PURE__ */ new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const stats = await storage.getMenuVisitStats(restaurantId, branchId, startDate, endDate);
      res.json(stats);
    } catch (error) {
      console.error("Menu visit stats error:", error);
      res.status(500).json({ message: "Erro ao buscar estat\xEDsticas de visitas" });
    }
  });
  app2.post("/api/reviews", async (req, res) => {
    try {
      const reviewSchema = z2.object({
        restaurantId: z2.string(),
        branchId: z2.string().nullish(),
        orderId: z2.string().nullish(),
        customerName: z2.string().optional(),
        rating: z2.number().int().min(1).max(5),
        comment: z2.string().optional()
      });
      const validatedData = reviewSchema.parse(req.body);
      const review = await storage.createCustomerReview(validatedData.restaurantId, {
        branchId: validatedData.branchId || null,
        orderId: validatedData.orderId || null,
        customerName: validatedData.customerName,
        rating: validatedData.rating,
        comment: validatedData.comment
      });
      res.json(review);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      console.error("Review creation error:", error);
      res.status(500).json({ message: "Erro ao criar avalia\xE7\xE3o" });
    }
  });
  app2.get("/api/reviews", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const { limit } = req.query;
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const reviews = await storage.getCustomerReviews(
        restaurantId,
        branchId,
        limit ? parseInt(limit) : void 0
      );
      res.json(reviews);
    } catch (error) {
      console.error("Reviews fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar avalia\xE7\xF5es" });
    }
  });
  app2.get("/api/financial/cash-registers", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const registers = await storage.getCashRegisters(restaurantId, branchId);
      res.json(registers);
    } catch (error) {
      console.error("Cash registers fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar caixas registradoras" });
    }
  });
  app2.post("/api/financial/cash-registers", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const registerSchema = z2.object({
        name: z2.string().min(1, "Nome da caixa \xE9 obrigat\xF3rio"),
        branchId: z2.string().optional().nullable(),
        initialBalance: z2.string().optional(),
        isActive: z2.number().optional()
      });
      const validatedData = registerSchema.parse(req.body);
      const newRegister = await storage.createCashRegister(currentUser.restaurantId, {
        name: validatedData.name,
        branchId: validatedData.branchId || currentUser.activeBranchId || null,
        initialBalance: validatedData.initialBalance,
        isActive: validatedData.isActive
      });
      res.json(newRegister);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      console.error("Cash register creation error:", error);
      res.status(500).json({ message: "Erro ao criar caixa registradora" });
    }
  });
  app2.patch("/api/financial/cash-registers/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const updatedRegister = await storage.updateCashRegister(
        req.params.id,
        currentUser.restaurantId,
        req.body
      );
      if (!updatedRegister) {
        return res.status(404).json({ message: "Caixa registradora n\xE3o encontrada" });
      }
      res.json(updatedRegister);
    } catch (error) {
      console.error("Cash register update error:", error);
      res.status(500).json({ message: "Erro ao atualizar caixa registradora" });
    }
  });
  app2.delete("/api/financial/cash-registers/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deleteCashRegister(req.params.id, currentUser.restaurantId);
      res.json({ message: "Caixa registradora exclu\xEDda com sucesso" });
    } catch (error) {
      console.error("Cash register delete error:", error);
      res.status(500).json({ message: "Erro ao excluir caixa registradora" });
    }
  });
  app2.get("/api/cash-register-shifts", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const cashRegisterId = req.query.cashRegisterId;
      const status = req.query.status;
      const shifts = await storage.getCashRegisterShifts(restaurantId, branchId, {
        cashRegisterId,
        status
      });
      res.json(shifts);
    } catch (error) {
      console.error("Cash register shifts fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar turnos de caixa" });
    }
  });
  app2.get("/api/cash-register-shifts/active-registers", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const registers = await storage.getCashRegistersWithActiveShift(restaurantId, branchId);
      res.json(registers);
    } catch (error) {
      console.error("Active cash registers fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar caixas com turno aberto" });
    }
  });
  app2.post("/api/cash-register-shifts", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const shiftSchema = z2.object({
        cashRegisterId: z2.string().min(1, "Caixa registradora \xE9 obrigat\xF3ria"),
        openingAmount: z2.string().regex(/^\d+(\.\d{1,2})?$/, "Valor de abertura inv\xE1lido"),
        branchId: z2.string().optional().nullable(),
        notes: z2.string().optional()
      });
      const validatedData = shiftSchema.parse(req.body);
      const newShift = await storage.openCashRegisterShift(
        currentUser.restaurantId,
        currentUser.id,
        {
          cashRegisterId: validatedData.cashRegisterId,
          openingAmount: validatedData.openingAmount,
          branchId: validatedData.branchId || currentUser.activeBranchId || null,
          notes: validatedData.notes
        }
      );
      res.json(newShift);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      console.error("Cash register shift open error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao abrir turno de caixa" });
    }
  });
  app2.patch("/api/cash-register-shifts/:id/close", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const closeSchema = z2.object({
        closingAmountCounted: z2.string().regex(/^\d+(\.\d{1,2})?$/, "Valor contado inv\xE1lido"),
        notes: z2.string().optional()
      });
      const validatedData = closeSchema.parse(req.body);
      const closedShift = await storage.closeCashRegisterShift(
        req.params.id,
        currentUser.restaurantId,
        currentUser.id,
        validatedData
      );
      res.json(closedShift);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      console.error("Cash register shift close error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao fechar turno de caixa" });
    }
  });
  app2.get("/api/financial/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const type = req.query.type;
      const categories2 = await storage.getFinancialCategories(restaurantId, branchId, type);
      res.json(categories2);
    } catch (error) {
      console.error("Financial categories fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });
  app2.post("/api/financial/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const categorySchema = z2.object({
        type: z2.enum(["receita", "despesa"]),
        name: z2.string().min(1, "Nome da categoria \xE9 obrigat\xF3rio"),
        branchId: z2.string().optional().nullable(),
        description: z2.string().optional(),
        isDefault: z2.number().optional()
      });
      const validatedData = categorySchema.parse(req.body);
      const newCategory = await storage.createFinancialCategory(currentUser.restaurantId, {
        ...validatedData,
        branchId: validatedData.branchId || null
      });
      res.json(newCategory);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      console.error("Financial category creation error:", error);
      res.status(500).json({ message: "Erro ao criar categoria" });
    }
  });
  app2.delete("/api/financial/categories/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const result = await storage.deleteFinancialCategory(req.params.id, currentUser.restaurantId);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      res.json({ message: "Categoria exclu\xEDda com sucesso" });
    } catch (error) {
      console.error("Financial category delete error:", error);
      res.status(500).json({ message: "Erro ao excluir categoria" });
    }
  });
  app2.get("/api/financial/transactions", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const filters = {};
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate);
      }
      if (req.query.cashRegisterId) {
        filters.cashRegisterId = req.query.cashRegisterId;
      }
      if (req.query.paymentMethod) {
        filters.paymentMethod = req.query.paymentMethod;
      }
      if (req.query.type) {
        filters.type = req.query.type;
      }
      const transactions = await storage.getFinancialTransactions(restaurantId, branchId, filters);
      res.json(transactions);
    } catch (error) {
      console.error("Financial transactions fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar lan\xE7amentos" });
    }
  });
  app2.post("/api/financial/transactions", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const transactionSchema = z2.object({
        cashRegisterId: z2.string().min(1, "Caixa registradora \xE9 obrigat\xF3ria"),
        categoryId: z2.string().min(1, "Categoria \xE9 obrigat\xF3ria"),
        type: z2.enum(["receita", "despesa", "ajuste"]),
        origin: z2.enum(["pdv", "web", "manual"]).optional(),
        description: z2.string().optional(),
        paymentMethod: z2.enum(["dinheiro", "multicaixa", "transferencia", "cartao"]),
        amount: z2.string().min(1, "Valor \xE9 obrigat\xF3rio"),
        occurredAt: z2.string().min(1, "Data e hora s\xE3o obrigat\xF3rias"),
        note: z2.string().optional(),
        branchId: z2.string().optional().nullable(),
        installments: z2.number().int().min(1).max(36).optional()
      });
      const validatedData = transactionSchema.parse(req.body);
      const installments = validatedData.installments || 1;
      if (installments > 1) {
        const totalAmount = parseFloat(validatedData.amount);
        const installmentAmount = totalAmount / installments;
        const occurredAt = new Date(validatedData.occurredAt);
        const transactions = [];
        let parentTransactionId = null;
        for (let i = 1; i <= installments; i++) {
          const transaction = await storage.createFinancialTransaction(
            currentUser.restaurantId,
            currentUser.id,
            {
              cashRegisterId: validatedData.cashRegisterId,
              categoryId: validatedData.categoryId,
              type: validatedData.type,
              origin: validatedData.origin || "manual",
              description: `${validatedData.description || ""} (Parte ${i}/${installments})`.trim(),
              paymentMethod: validatedData.paymentMethod,
              amount: installmentAmount.toFixed(2),
              occurredAt: occurredAt.toISOString(),
              note: validatedData.note,
              branchId: validatedData.branchId || currentUser.activeBranchId || null,
              totalInstallments: installments,
              installmentNumber: i,
              parentTransactionId: i === 1 ? null : parentTransactionId
            }
          );
          if (i === 1) {
            parentTransactionId = transaction.id;
          }
          transactions.push(transaction);
        }
        res.json({
          success: true,
          transactions,
          message: `Pagamento dividido em ${installments} partes`
        });
      } else {
        const newTransaction = await storage.createFinancialTransaction(
          currentUser.restaurantId,
          currentUser.id,
          {
            ...validatedData,
            branchId: validatedData.branchId || currentUser.activeBranchId || null,
            origin: validatedData.origin || "manual",
            totalInstallments: 1,
            installmentNumber: 1,
            parentTransactionId: null
          }
        );
        res.json(newTransaction);
      }
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      console.error("Financial transaction creation error:", error);
      res.status(500).json({ message: "Erro ao criar lan\xE7amento" });
    }
  });
  app2.delete("/api/financial/transactions/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deleteFinancialTransaction(req.params.id, currentUser.restaurantId);
      res.json({ message: "Lan\xE7amento exclu\xEDdo e saldo revertido com sucesso" });
    } catch (error) {
      console.error("Financial transaction delete error:", error);
      res.status(500).json({ message: "Erro ao excluir lan\xE7amento" });
    }
  });
  app2.get("/api/financial/summary", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      let restaurantId;
      if (currentUser.role === "superadmin") {
        const queryRestaurantId = req.query.restaurantId;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }
      const branchId = currentUser.role === "superadmin" ? null : currentUser.activeBranchId || null;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      const cashRegisterId = req.query.cashRegisterId;
      const summary = await storage.getFinancialSummary(
        restaurantId,
        branchId,
        startDate,
        endDate,
        cashRegisterId
      );
      res.json(summary);
    } catch (error) {
      console.error("Financial summary fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar resumo financeiro" });
    }
  });
  app2.get("/api/expenses", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseExpenseTracking(storage, currentUser.restaurantId);
      const branchId = currentUser.activeBranchId || null;
      const filters = {};
      if (req.query.categoryId) {
        filters.categoryId = req.query.categoryId;
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate);
      }
      const expenses2 = await storage.getExpenses(currentUser.restaurantId, branchId, filters);
      res.json(expenses2);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Expenses fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar despesas" });
    }
  });
  app2.post("/api/expenses", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseExpenseTracking(storage, currentUser.restaurantId);
      const expenseSchema = z2.object({
        categoryId: z2.string().min(1, "Categoria \xE9 obrigat\xF3ria"),
        description: z2.string().min(1, "Descri\xE7\xE3o \xE9 obrigat\xF3ria"),
        amount: z2.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inv\xE1lido"),
        paymentMethod: z2.enum(["dinheiro", "multicaixa", "transferencia", "cartao"]),
        occurredAt: z2.string().min(1, "Data e hora s\xE3o obrigat\xF3rias"),
        note: z2.string().optional()
      });
      const validatedData = expenseSchema.parse(req.body);
      const branchId = currentUser.activeBranchId || null;
      const newExpense = await storage.createExpense(
        currentUser.restaurantId,
        branchId,
        currentUser.id,
        validatedData
      );
      res.json(newExpense);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Expense creation error:", error);
      res.status(500).json({ message: "Erro ao criar despesa" });
    }
  });
  app2.put("/api/expenses/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const updateSchema = z2.object({
        categoryId: z2.string().min(1).optional(),
        description: z2.string().min(1).optional(),
        amount: z2.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        paymentMethod: z2.enum(["dinheiro", "multicaixa", "transferencia", "cartao"]).optional(),
        occurredAt: z2.string().min(1).optional(),
        note: z2.string().optional()
      });
      const validatedData = updateSchema.parse(req.body);
      const updatedExpense = await storage.updateExpense(
        currentUser.restaurantId,
        req.params.id,
        validatedData
      );
      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Expense update error:", error);
      res.status(500).json({ message: "Erro ao atualizar despesa" });
    }
  });
  app2.delete("/api/expenses/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deleteExpense(currentUser.restaurantId, req.params.id);
      res.json({ message: "Despesa exclu\xEDda com sucesso" });
    } catch (error) {
      console.error("Expense delete error:", error);
      res.status(500).json({ message: "Erro ao excluir despesa" });
    }
  });
  app2.get("/api/financial/reports", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      if (!req.query.startDate || !req.query.endDate) {
        return res.status(400).json({ message: "Data inicial e final s\xE3o obrigat\xF3rias" });
      }
      const branchId = currentUser.activeBranchId || null;
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      const report = await storage.getFinancialReport(
        currentUser.restaurantId,
        branchId,
        startDate,
        endDate
      );
      res.json(report);
    } catch (error) {
      console.error("Financial report fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar relat\xF3rio financeiro" });
    }
  });
  app2.get("/api/financial/reports/comparison", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      if (!req.query.startDate || !req.query.endDate) {
        return res.status(400).json({ message: "Data inicial e final s\xE3o obrigat\xF3rias" });
      }
      const branchId = currentUser.activeBranchId || null;
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
      const previousEndDate = new Date(startDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);
      const previousStartDate = new Date(previousEndDate);
      previousStartDate.setDate(previousStartDate.getDate() - periodDays + 1);
      const [currentReport, previousReport] = await Promise.all([
        storage.getFinancialReport(currentUser.restaurantId, branchId, startDate, endDate),
        storage.getFinancialReport(currentUser.restaurantId, branchId, previousStartDate, previousEndDate)
      ]);
      const currentRevenue = parseFloat(currentReport.totalRevenue);
      const previousRevenue = parseFloat(previousReport.totalRevenue);
      const currentExpenses = parseFloat(currentReport.totalExpenses);
      const previousExpenses = parseFloat(previousReport.totalExpenses);
      const currentBalance = parseFloat(currentReport.netBalance);
      const previousBalance = parseFloat(previousReport.netBalance);
      const currentMargin = currentRevenue > 0 ? currentBalance / currentRevenue * 100 : 0;
      const previousMargin = previousRevenue > 0 ? previousBalance / previousRevenue * 100 : 0;
      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return (current - previous) / Math.abs(previous) * 100;
      };
      res.json({
        current: currentReport,
        previous: previousReport,
        changes: {
          revenue: calculateChange(currentRevenue, previousRevenue),
          expenses: calculateChange(currentExpenses, previousExpenses),
          balance: calculateChange(currentBalance, previousBalance),
          margin: currentMargin - previousMargin
        },
        sparklines: {
          revenue: currentReport.transactionsByDay.map((d) => parseFloat(d.revenue)),
          expenses: currentReport.transactionsByDay.map((d) => parseFloat(d.expenses)),
          balance: currentReport.transactionsByDay.map((d) => parseFloat(d.revenue) - parseFloat(d.expenses))
        },
        periodDays,
        previousPeriod: {
          startDate: previousStartDate.toISOString(),
          endDate: previousEndDate.toISOString()
        }
      });
    } catch (error) {
      console.error("Financial comparison report error:", error);
      res.status(500).json({ message: "Erro ao buscar compara\xE7\xE3o financeira" });
    }
  });
  app2.get("/api/inventory/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseInventoryModule(storage, currentUser.restaurantId);
      const categories2 = await storage.getInventoryCategories(currentUser.restaurantId);
      res.json(categories2);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Inventory categories fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar categorias de invent\xE1rio" });
    }
  });
  app2.post("/api/inventory/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseInventoryModule(storage, currentUser.restaurantId);
      const data = insertInventoryCategorySchema.parse(req.body);
      const category = await storage.createInventoryCategory(currentUser.restaurantId, data);
      res.json(category);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Inventory category create error:", error);
      res.status(500).json({ message: "Erro ao criar categoria de invent\xE1rio" });
    }
  });
  app2.put("/api/inventory/categories/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const data = updateInventoryCategorySchema.parse(req.body);
      const category = await storage.updateInventoryCategory(req.params.id, currentUser.restaurantId, data);
      res.json(category);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Inventory category update error:", error);
      res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
  });
  app2.delete("/api/inventory/categories/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deleteInventoryCategory(req.params.id, currentUser.restaurantId);
      res.json({ message: "Categoria deletada com sucesso" });
    } catch (error) {
      console.error("Inventory category delete error:", error);
      res.status(500).json({ message: "Erro ao deletar categoria" });
    }
  });
  app2.get("/api/inventory/units", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const units = await storage.getMeasurementUnits(currentUser.restaurantId);
      res.json(units);
    } catch (error) {
      console.error("Measurement units fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar unidades de medida" });
    }
  });
  app2.post("/api/inventory/units", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const data = insertMeasurementUnitSchema.parse(req.body);
      const unit = await storage.createMeasurementUnit(currentUser.restaurantId, data);
      res.json(unit);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Measurement unit create error:", error);
      res.status(500).json({ message: "Erro ao criar unidade de medida" });
    }
  });
  app2.put("/api/inventory/units/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const data = updateMeasurementUnitSchema.parse(req.body);
      const unit = await storage.updateMeasurementUnit(req.params.id, currentUser.restaurantId, data);
      res.json(unit);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Measurement unit update error:", error);
      res.status(500).json({ message: "Erro ao atualizar unidade" });
    }
  });
  app2.delete("/api/inventory/units/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deleteMeasurementUnit(req.params.id, currentUser.restaurantId);
      res.json({ message: "Unidade deletada com sucesso" });
    } catch (error) {
      console.error("Measurement unit delete error:", error);
      res.status(500).json({ message: "Erro ao deletar unidade" });
    }
  });
  app2.get("/api/inventory/items", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseInventoryModule(storage, currentUser.restaurantId);
      const filters = {};
      if (req.query.categoryId) filters.categoryId = req.query.categoryId;
      if (req.query.isActive) filters.isActive = parseInt(req.query.isActive);
      const items = await storage.getInventoryItems(currentUser.restaurantId, filters);
      res.json(items);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Inventory items fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar itens de invent\xE1rio" });
    }
  });
  app2.get("/api/inventory/items/:id", isAdmin, async (req, res) => {
    try {
      const item = await storage.getInventoryItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item n\xE3o encontrado" });
      }
      res.json(item);
    } catch (error) {
      console.error("Inventory item fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar item" });
    }
  });
  app2.post("/api/inventory/items", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanAddInventoryItem(storage, currentUser.restaurantId);
      const data = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(currentUser.restaurantId, data);
      res.json(item);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Inventory item create error:", error);
      res.status(500).json({ message: "Erro ao criar item de invent\xE1rio" });
    }
  });
  app2.put("/api/inventory/items/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const data = updateInventoryItemSchema.parse(req.body);
      const item = await storage.updateInventoryItem(req.params.id, currentUser.restaurantId, data);
      res.json(item);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Inventory item update error:", error);
      res.status(500).json({ message: "Erro ao atualizar item" });
    }
  });
  app2.delete("/api/inventory/items/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deleteInventoryItem(req.params.id, currentUser.restaurantId);
      res.json({ message: "Item deletado com sucesso" });
    } catch (error) {
      console.error("Inventory item delete error:", error);
      res.status(500).json({ message: "Erro ao deletar item" });
    }
  });
  app2.get("/api/inventory/stock", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId || !currentUser.activeBranchId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante ou filial" });
      }
      const stocks = await storage.getBranchStock(currentUser.restaurantId, currentUser.activeBranchId);
      res.json(stocks);
    } catch (error) {
      console.error("Branch stock fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar estoque" });
    }
  });
  app2.get("/api/inventory/movements", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId || !currentUser.activeBranchId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante ou filial" });
      }
      const filters = {};
      if (req.query.inventoryItemId) filters.inventoryItemId = req.query.inventoryItemId;
      if (req.query.movementType) filters.movementType = req.query.movementType;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate);
      const movements = await storage.getStockMovements(
        currentUser.restaurantId,
        currentUser.activeBranchId,
        filters
      );
      res.json(movements);
    } catch (error) {
      console.error("Stock movements fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar movimenta\xE7\xF5es" });
    }
  });
  app2.post("/api/inventory/movements", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId || !currentUser.activeBranchId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante ou filial" });
      }
      const data = insertStockMovementSchema.parse(req.body);
      if (!data.branchId) {
        data.branchId = currentUser.activeBranchId;
      }
      const movement = await storage.createStockMovement(
        currentUser.restaurantId,
        currentUser.id,
        data
      );
      res.json(movement);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Stock movement create error:", error);
      res.status(500).json({ message: "Erro ao criar movimenta\xE7\xE3o" });
    }
  });
  app2.get("/api/inventory/stats", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId || !currentUser.activeBranchId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante ou filial" });
      }
      const stats = await storage.getInventoryStats(currentUser.restaurantId, currentUser.activeBranchId);
      res.json(stats);
    } catch (error) {
      console.error("Inventory stats fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar estat\xEDsticas" });
    }
  });
  app2.get("/api/customers", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const { search, isActive } = req.query;
      const filters = {};
      if (search) filters.search = search;
      if (isActive !== void 0) filters.isActive = parseInt(isActive);
      const customers2 = await storage.getCustomers(
        currentUser.restaurantId,
        currentUser.activeBranchId,
        filters
      );
      res.json(customers2);
    } catch (error) {
      console.error("Customers fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar clientes" });
    }
  });
  app2.get("/api/customers/stats", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const stats = await storage.getCustomerStats(
        currentUser.restaurantId,
        currentUser.activeBranchId || null
      );
      res.json(stats);
    } catch (error) {
      console.error("Customer stats fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar estat\xEDsticas de clientes" });
    }
  });
  app2.get("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const customer = await storage.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Cliente n\xE3o encontrado" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Customer fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar cliente" });
    }
  });
  app2.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanAddCustomer(storage, currentUser.restaurantId);
      const validatedData = insertCustomerSchema.parse(req.body);
      if (validatedData.phone) {
        const existing = await storage.getCustomerByPhone(currentUser.restaurantId, validatedData.phone);
        if (existing) {
          return res.status(400).json({ message: "J\xE1 existe um cliente com este telefone" });
        }
      }
      if (validatedData.cpf) {
        const existing = await storage.getCustomerByCpf(currentUser.restaurantId, validatedData.cpf);
        if (existing) {
          return res.status(400).json({ message: "J\xE1 existe um cliente com este CPF" });
        }
      }
      const customer = await storage.createCustomer(
        currentUser.restaurantId,
        currentUser.activeBranchId || null,
        validatedData
      );
      res.status(201).json(customer);
    } catch (error) {
      console.error("Customer creation error:", error);
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar cliente" });
    }
  });
  app2.put("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const validatedData = updateCustomerSchema.parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, currentUser.restaurantId, validatedData);
      res.json(customer);
    } catch (error) {
      console.error("Customer update error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar cliente" });
    }
  });
  app2.delete("/api/customers/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deleteCustomer(req.params.id, currentUser.restaurantId);
      res.status(204).send();
    } catch (error) {
      console.error("Customer deletion error:", error);
      res.status(500).json({ message: "Erro ao excluir cliente" });
    }
  });
  app2.get("/api/loyalty/program", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseLoyaltyProgram(storage, currentUser.restaurantId);
      const program = await storage.getLoyaltyProgram(currentUser.restaurantId);
      res.json(program || null);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Loyalty program fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar programa de fidelidade" });
    }
  });
  app2.post("/api/loyalty/program", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseLoyaltyProgram(storage, currentUser.restaurantId);
      const validatedData = insertLoyaltyProgramSchema.parse(req.body);
      const program = await storage.createOrUpdateLoyaltyProgram(currentUser.restaurantId, validatedData);
      res.json(program);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Loyalty program creation error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar/atualizar programa de fidelidade" });
    }
  });
  app2.get("/api/loyalty/transactions", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseLoyaltyProgram(storage, currentUser.restaurantId);
      const { customerId, startDate, endDate } = req.query;
      const filters = {};
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      const transactions = await storage.getLoyaltyTransactions(
        currentUser.restaurantId,
        customerId,
        filters
      );
      res.json(transactions);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Loyalty transactions fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar transa\xE7\xF5es de fidelidade" });
    }
  });
  app2.get("/api/loyalty/stats", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseLoyaltyProgram(storage, currentUser.restaurantId);
      const stats = await storage.getLoyaltyStats(currentUser.restaurantId);
      res.json(stats);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Loyalty stats fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar estat\xEDsticas de fidelidade" });
    }
  });
  app2.post("/api/loyalty/redeem", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseLoyaltyProgram(storage, currentUser.restaurantId);
      const { customerId, points, orderId } = req.body;
      if (!customerId || !points) {
        return res.status(400).json({ message: "customerId e points s\xE3o obrigat\xF3rios" });
      }
      const result = await storage.redeemLoyaltyPoints(
        currentUser.restaurantId,
        customerId,
        parseInt(points),
        orderId,
        currentUser.id
      );
      res.json(result);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Loyalty redeem error:", error);
      res.status(400).json({ message: error.message || "Erro ao resgatar pontos" });
    }
  });
  app2.get("/api/coupons", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseCouponSystem(storage, currentUser.restaurantId);
      const { isActive, code } = req.query;
      const filters = {};
      if (isActive !== void 0) filters.isActive = parseInt(isActive);
      if (code) filters.code = code;
      const coupons2 = await storage.getCoupons(
        currentUser.restaurantId,
        currentUser.activeBranchId,
        filters
      );
      res.json(coupons2);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Coupons fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar cupons" });
    }
  });
  app2.get("/api/coupons/stats", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseCouponSystem(storage, currentUser.restaurantId);
      const stats = await storage.getCouponStats(
        currentUser.restaurantId,
        currentUser.activeBranchId || null
      );
      res.json(stats);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Coupon stats fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar estat\xEDsticas de cupons" });
    }
  });
  app2.get("/api/coupons/:id", isAuthenticated, async (req, res) => {
    try {
      const coupon = await storage.getCouponById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Cupom n\xE3o encontrado" });
      }
      res.json(coupon);
    } catch (error) {
      console.error("Coupon fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar cupom" });
    }
  });
  app2.post("/api/coupons", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanCreateCoupon(storage, currentUser.restaurantId);
      const validatedData = insertCouponSchema.parse(req.body);
      const existing = await storage.getCouponByCode(currentUser.restaurantId, validatedData.code);
      if (existing) {
        return res.status(400).json({ message: "J\xE1 existe um cupom com este c\xF3digo" });
      }
      const coupon = await storage.createCoupon(
        currentUser.restaurantId,
        currentUser.activeBranchId || null,
        validatedData,
        currentUser.id
      );
      res.status(201).json(coupon);
    } catch (error) {
      console.error("Coupon creation error:", error);
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar cupom" });
    }
  });
  app2.put("/api/coupons/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const validatedData = updateCouponSchema.parse(req.body);
      const coupon = await storage.updateCoupon(req.params.id, currentUser.restaurantId, validatedData);
      res.json(coupon);
    } catch (error) {
      console.error("Coupon update error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar cupom" });
    }
  });
  app2.delete("/api/coupons/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deleteCoupon(req.params.id, currentUser.restaurantId);
      res.status(204).send();
    } catch (error) {
      console.error("Coupon deletion error:", error);
      res.status(500).json({ message: "Erro ao excluir cupom" });
    }
  });
  app2.post("/api/coupons/validate", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await checkCanUseCouponSystem(storage, currentUser.restaurantId);
      const { code, orderValue, orderType, customerId } = req.body;
      if (!code || orderValue === void 0) {
        return res.status(400).json({ message: "code e orderValue s\xE3o obrigat\xF3rios" });
      }
      const result = await storage.validateCoupon(
        currentUser.restaurantId,
        code,
        parseFloat(orderValue),
        orderType,
        customerId
      );
      res.json(result);
    } catch (error) {
      if (error.name === "PlanLimitError" || error.name === "PlanFeatureError") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Coupon validation error:", error);
      res.status(500).json({ message: "Erro ao validar cupom" });
    }
  });
  app2.get("/api/coupon-usages", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const { couponId, customerId, startDate, endDate } = req.query;
      const filters = {};
      if (couponId) filters.couponId = couponId;
      if (customerId) filters.customerId = customerId;
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      const usages = await storage.getCouponUsages(currentUser.restaurantId, filters);
      res.json(usages);
    } catch (error) {
      console.error("Coupon usages fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar usos de cupons" });
    }
  });
  app2.get("/api/subscription-plans", async (req, res) => {
    try {
      let plans = await storage.getSubscriptionPlans();
      if (plans.length === 0) {
        console.log("\u26A0\uFE0F  No subscription plans found. Auto-seeding...");
        await storage.seedSubscriptionPlans();
        plans = await storage.getSubscriptionPlans();
        console.log(`\u2705 Auto-seeded ${plans.length} subscription plans`);
      }
      res.json(plans);
    } catch (error) {
      console.error("Subscription plans fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar planos de subscri\xE7\xE3o" });
    }
  });
  app2.get("/api/subscription-plans/:id", async (req, res) => {
    try {
      const plan = await storage.getSubscriptionPlanById(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Plano n\xE3o encontrado" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Subscription plan fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar plano de subscri\xE7\xE3o" });
    }
  });
  app2.get("/api/superadmin/subscription-plans", isSuperAdmin, async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Subscription plans fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar planos de subscri\xE7\xE3o" });
    }
  });
  app2.patch("/api/superadmin/subscription-plans/:id", isSuperAdmin, async (req, res) => {
    try {
      const plan = await storage.getSubscriptionPlanById(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Plano n\xE3o encontrado" });
      }
      const validatedData = updateSubscriptionPlanSchema.parse(req.body);
      const updatedPlan = await storage.updateSubscriptionPlan(req.params.id, validatedData);
      res.json(updatedPlan);
    } catch (error) {
      console.error("Subscription plan update error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar plano" });
    }
  });
  app2.get("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const subscription = await storage.getSubscriptionByRestaurantId(currentUser.restaurantId);
      if (!subscription) {
        return res.status(404).json({ message: "Subscri\xE7\xE3o n\xE3o encontrada" });
      }
      res.json(subscription);
    } catch (error) {
      console.error("Subscription fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar subscri\xE7\xE3o" });
    }
  });
  app2.post("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      if (currentUser.role !== "admin" && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Apenas administradores podem criar subscri\xE7\xF5es" });
      }
      const existingSubscription = await storage.getSubscriptionByRestaurantId(currentUser.restaurantId);
      if (existingSubscription) {
        return res.status(409).json({ message: "Restaurante j\xE1 possui uma subscri\xE7\xE3o ativa. Use PATCH para alterar." });
      }
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const plan = await storage.getSubscriptionPlanById(validatedData.planId);
      if (!plan) {
        return res.status(404).json({ message: "Plano n\xE3o encontrado" });
      }
      const now = /* @__PURE__ */ new Date();
      const trialDays = plan.trialDays || 0;
      const trialStart = trialDays > 0 ? now : null;
      const trialEnd = trialDays > 0 ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1e3) : null;
      const periodStart = trialEnd || now;
      const periodEnd = new Date(periodStart);
      if (validatedData.billingInterval === "anual") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
      const subscriptionData = {
        planId: validatedData.planId,
        billingInterval: validatedData.billingInterval,
        currency: validatedData.currency,
        status: trialDays > 0 ? "trial" : "ativa",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        trialStart,
        trialEnd,
        autoRenew: 1,
        cancelAtPeriodEnd: 0
      };
      const subscription = await storage.createSubscription(currentUser.restaurantId, subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Subscription creation error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar subscri\xE7\xE3o" });
    }
  });
  app2.patch("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      if (currentUser.role !== "admin" && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Apenas administradores podem atualizar subscri\xE7\xF5es" });
      }
      const validatedData = updateSubscriptionSchema.parse(req.body);
      let updateData = {};
      if (validatedData.planId || validatedData.billingInterval) {
        const currentSubscription = await storage.getSubscriptionByRestaurantId(currentUser.restaurantId);
        if (!currentSubscription) {
          return res.status(404).json({ message: "Subscri\xE7\xE3o n\xE3o encontrada" });
        }
        let planId = validatedData.planId || currentSubscription.planId;
        let billingInterval = validatedData.billingInterval || currentSubscription.billingInterval;
        const plan = await storage.getSubscriptionPlanById(planId);
        if (!plan) {
          return res.status(404).json({ message: "Plano n\xE3o encontrado" });
        }
        const now = /* @__PURE__ */ new Date();
        const periodEnd = new Date(now);
        if (billingInterval === "anual") {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }
        updateData.planId = planId;
        updateData.billingInterval = billingInterval;
        updateData.currentPeriodStart = now;
        updateData.currentPeriodEnd = periodEnd;
        updateData.trialStart = null;
        updateData.trialEnd = null;
        updateData.status = "ativa";
      } else {
        updateData = { ...validatedData };
      }
      const subscription = await storage.updateSubscription(currentUser.restaurantId, updateData);
      res.json(subscription);
    } catch (error) {
      console.error("Subscription update error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      if (error.message === "Subscri\xE7\xE3o n\xE3o encontrada") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao atualizar subscri\xE7\xE3o" });
    }
  });
  app2.delete("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      if (currentUser.role !== "admin" && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Apenas administradores podem cancelar subscri\xE7\xF5es" });
      }
      const subscription = await storage.cancelSubscription(currentUser.restaurantId);
      res.json(subscription);
    } catch (error) {
      console.error("Subscription cancellation error:", error);
      if (error.message === "Subscri\xE7\xE3o n\xE3o encontrada") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao cancelar subscri\xE7\xE3o" });
    }
  });
  app2.get("/api/subscription/limits", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const limits = await storage.checkSubscriptionLimits(currentUser.restaurantId);
      res.json(limits);
    } catch (error) {
      console.error("Subscription limits check error:", error);
      if (error.message === "Restaurante n\xE3o possui subscri\xE7\xE3o ativa") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao verificar limites de subscri\xE7\xE3o" });
    }
  });
  app2.get("/api/subscription/payments", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const payments = await storage.getSubscriptionPayments(currentUser.restaurantId);
      res.json(payments);
    } catch (error) {
      console.error("Subscription payments fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar pagamentos de subscri\xE7\xE3o" });
    }
  });
  app2.post("/api/subscription/payments", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      if (currentUser.role !== "admin" && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Apenas administradores podem registrar pagamentos" });
      }
      const validatedData = insertSubscriptionPaymentSchema.parse(req.body);
      const payment = await storage.createSubscriptionPayment(currentUser.restaurantId, validatedData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Subscription payment creation error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao registrar pagamento" });
    }
  });
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const notifications2 = await storage.getNotifications(currentUser.restaurantId, currentUser.id, limit);
      res.json(notifications2);
    } catch (error) {
      console.error("Notifications fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar notifica\xE7\xF5es" });
    }
  });
  app2.get("/api/notifications/count", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const count = await storage.getUnreadNotificationsCount(currentUser.restaurantId, currentUser.id);
      res.json({ count });
    } catch (error) {
      console.error("Notifications count error:", error);
      res.status(500).json({ message: "Erro ao contar notifica\xE7\xF5es" });
    }
  });
  app2.post("/api/notifications", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(currentUser.restaurantId, validatedData);
      const broadcastFn = global.broadcastToRestaurant;
      if (broadcastFn) {
        broadcastFn(currentUser.restaurantId, {
          type: "new_notification",
          data: notification
        });
      }
      res.status(201).json(notification);
    } catch (error) {
      console.error("Notification creation error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar notifica\xE7\xE3o" });
    }
  });
  app2.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const notification = await storage.markNotificationAsRead(currentUser.restaurantId, req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Mark notification read error:", error);
      if (error.message === "Notifica\xE7\xE3o n\xE3o encontrada") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao marcar notifica\xE7\xE3o como lida" });
    }
  });
  app2.patch("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.markAllNotificationsAsRead(currentUser.restaurantId, currentUser.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      res.status(500).json({ message: "Erro ao marcar todas notifica\xE7\xF5es como lidas" });
    }
  });
  app2.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deleteNotification(currentUser.restaurantId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete notification error:", error);
      if (error.message === "Notifica\xE7\xE3o n\xE3o encontrada") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao deletar notifica\xE7\xE3o" });
    }
  });
  app2.get("/api/notification-preferences", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const preferences = await storage.getNotificationPreferences(currentUser.restaurantId, currentUser.id);
      res.json(preferences || {
        newOrderInApp: true,
        newOrderWhatsapp: false,
        newOrderEmail: false,
        orderStatusInApp: true,
        orderStatusWhatsapp: false,
        orderStatusEmail: false,
        lowStockInApp: true,
        lowStockWhatsapp: false,
        lowStockEmail: false,
        newCustomerInApp: true,
        newCustomerWhatsapp: false,
        newCustomerEmail: false,
        paymentInApp: true,
        paymentWhatsapp: false,
        paymentEmail: false,
        subscriptionInApp: true,
        subscriptionWhatsapp: false,
        subscriptionEmail: false,
        systemInApp: true,
        systemWhatsapp: false,
        systemEmail: false
      });
    } catch (error) {
      console.error("Notification preferences fetch error:", error);
      res.status(500).json({ message: "Erro ao buscar prefer\xEAncias de notifica\xE7\xE3o" });
    }
  });
  app2.patch("/api/notification-preferences", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const validatedData = updateNotificationPreferencesSchema.parse(req.body);
      const preferences = await storage.upsertNotificationPreferences(
        currentUser.restaurantId,
        currentUser.id,
        validatedData
      );
      res.json(preferences);
    } catch (error) {
      console.error("Notification preferences update error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar prefer\xEAncias de notifica\xE7\xE3o" });
    }
  });
  app2.get("/api/printer-configurations", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      const restaurantId = currentUser.restaurantId;
      if (!restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const configs = await storage.getPrinterConfigurations(restaurantId, currentUser.activeBranchId || void 0);
      res.json(configs);
    } catch (error) {
      console.error("Error fetching printer configurations:", error);
      res.status(500).json({ message: "Erro ao buscar configura\xE7\xF5es de impressoras" });
    }
  });
  app2.post("/api/printer-configurations", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      const restaurantId = currentUser.restaurantId;
      if (!restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const data = insertPrinterConfigurationSchema.parse(req.body);
      const config = await storage.createPrinterConfiguration(restaurantId, {
        ...data,
        branchId: data.branchId || currentUser.activeBranchId || null,
        userId: data.userId || null
      });
      broadcastToClients({ type: "printer_config_created", data: config });
      res.json(config);
    } catch (error) {
      console.error("Error creating printer configuration:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao criar configura\xE7\xE3o de impressora" });
    }
  });
  app2.patch("/api/printer-configurations/:id", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      const restaurantId = currentUser.restaurantId;
      if (!restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const data = updatePrinterConfigurationSchema.parse(req.body);
      const config = await storage.updatePrinterConfiguration(restaurantId, req.params.id, data);
      broadcastToClients({ type: "printer_config_updated", data: config });
      res.json(config);
    } catch (error) {
      console.error("Error updating printer configuration:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar configura\xE7\xE3o de impressora" });
    }
  });
  app2.delete("/api/printer-configurations/:id", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      const restaurantId = currentUser.restaurantId;
      if (!restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      await storage.deletePrinterConfiguration(restaurantId, req.params.id);
      broadcastToClients({ type: "printer_config_deleted", data: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting printer configuration:", error);
      res.status(500).json({ message: "Erro ao deletar configura\xE7\xE3o de impressora" });
    }
  });
  app2.get("/api/print-history", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      const restaurantId = currentUser.restaurantId;
      if (!restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const { limit = "50" } = req.query;
      const history = await storage.getPrintHistory(restaurantId, parseInt(limit));
      res.json(history);
    } catch (error) {
      console.error("Error fetching print history:", error);
      res.status(500).json({ message: "Erro ao buscar hist\xF3rico de impress\xF5es" });
    }
  });
  app2.post("/api/print-history", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      const restaurantId = currentUser.restaurantId;
      if (!restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const data = insertPrintHistorySchema.parse(req.body);
      const history = await storage.createPrintHistory(restaurantId, {
        ...data,
        branchId: data.branchId || currentUser.activeBranchId || null,
        userId: data.userId || currentUser.id
      });
      res.json(history);
    } catch (error) {
      console.error("Error recording print history:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao registrar impress\xE3o" });
    }
  });
  app2.get("/api/print-statistics", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      const restaurantId = currentUser.restaurantId;
      if (!restaurantId) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o associado a um restaurante" });
      }
      const { days = "7" } = req.query;
      const stats = await storage.getPrintStatistics(restaurantId, parseInt(days));
      res.json(stats);
    } catch (error) {
      console.error("Error fetching print statistics:", error);
      res.status(500).json({ message: "Erro ao buscar estat\xEDsticas de impress\xE3o" });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clientsByRestaurant = /* @__PURE__ */ new Map();
  const clients = /* @__PURE__ */ new Set();
  const clientRestaurantMap = /* @__PURE__ */ new WeakMap();
  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "auth" && message.restaurantId) {
          const restaurantId = message.restaurantId;
          clientRestaurantMap.set(ws, restaurantId);
          if (!clientsByRestaurant.has(restaurantId)) {
            clientsByRestaurant.set(restaurantId, /* @__PURE__ */ new Set());
          }
          clientsByRestaurant.get(restaurantId).add(ws);
          ws.send(JSON.stringify({ type: "auth_success", restaurantId }));
        }
      } catch (error) {
      }
    });
    ws.on("close", () => {
      clients.delete(ws);
      const restaurantId = clientRestaurantMap.get(ws);
      if (restaurantId) {
        const restaurantClients = clientsByRestaurant.get(restaurantId);
        if (restaurantClients) {
          restaurantClients.delete(ws);
          if (restaurantClients.size === 0) {
            clientsByRestaurant.delete(restaurantId);
          }
        }
      }
    });
    ws.on("error", (error) => {
      clients.delete(ws);
      const restaurantId = clientRestaurantMap.get(ws);
      if (restaurantId) {
        const restaurantClients = clientsByRestaurant.get(restaurantId);
        if (restaurantClients) {
          restaurantClients.delete(ws);
        }
      }
    });
  });
  function broadcastToClients(message) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
  function broadcastToRestaurant(restaurantId, message) {
    const restaurantClients = clientsByRestaurant.get(restaurantId);
    if (!restaurantClients) return;
    const messageStr = JSON.stringify(message);
    restaurantClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
  global.broadcastToRestaurant = broadcastToRestaurant;
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    // Only enable these plugins in development mode on Replit
    ...process.env.NODE_ENV === "development" && process.env.REPL_ID !== void 0 ? [
      runtimeErrorOverlay(),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    },
    dedupe: ["react", "react-dom"]
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "react-router": ["wouter"],
          "ui-lib": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"]
        }
      }
    },
    chunkSizeWarningLimit: 2e3,
    sourcemap: false,
    minify: "esbuild"
    // esbuild é mais rápido e usa menos memória que terser
  },
  server: {
    // Desabilita cache em desenvolvimento
    headers: {
      "Cache-Control": "no-store"
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options2) => {
        viteLogger.error(msg, options2);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url2 = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url2, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  if (req.path === "/sw.js" || req.path === "/version.json" || req.path === "/manifest.json") {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  } else if (req.path === "/" || req.path === "/index.html" || req.path.endsWith(".html")) {
    res.setHeader("Cache-Control", "no-cache, must-revalidate");
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    const { ensureTablesExist: ensureTablesExist2 } = await Promise.resolve().then(() => (init_initDb(), initDb_exports));
    await ensureTablesExist2();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error instanceof Error ? error.message : error);
    console.error("The application requires a database connection to run.");
    console.error("Please ensure DATABASE_URL environment variable is set with your PostgreSQL connection string.");
    process.exit(1);
  }
  const server = await registerRoutes(app);
  try {
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    await storage2.generateMissingSlugs();
  } catch (error) {
    console.error("Error generating missing slugs:", error);
  }
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`NaBancada server running on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
})();
