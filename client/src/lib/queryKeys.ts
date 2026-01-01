/**
 * Centralized Query Keys for React Query
 * 
 * This file provides type-safe, consistent query keys for all API endpoints.
 * Using centralized keys ensures proper cache invalidation and prevents bugs.
 * 
 * Usage:
 * ```typescript
 * // In components:
 * const { data } = useQuery({
 *   queryKey: QUERY_KEYS.tables.withOrders(),
 * });
 * 
 * // In mutations:
 * queryClient.invalidateQueries({ 
 *   queryKey: QUERY_KEYS.tables.ordersByGuest(tableId) 
 * });
 * ```
 */

export const QUERY_KEYS = {
  // Tables
  tables: {
    // All tables (basic list)
    all: () => ['/api/tables'] as const,
    
    // Tables with orders (main view)
    withOrders: () => ['/api/tables/with-orders'] as const,
    
    // Open tables only
    open: () => ['/api/tables/open'] as const,
    
    // Specific table detail
    detail: (id: string) => ['/api/tables', id] as const,
    
    // Orders grouped by guest for a table
    ordersByGuest: (id: string) => ['/api/tables', id, 'orders-by-guest'] as const,
    
    // Guests for a table
    guests: (id: string) => ['/api/tables', id, 'guests'] as const,
    
    // Payments for a table
    payments: (id: string) => ['/api/tables', id, 'payments'] as const,
    
    // Bill splits for a table
    billSplits: (id: string) => ['/api/tables', id, 'bill-splits'] as const,
    
    // Sessions history for a table
    sessions: (id: string) => ['/api/tables', id, 'sessions'] as const,
    
    // Audit logs for a session
    auditLogs: (sessionId: string) => ['/api/tables/sessions', sessionId, 'audit-logs'] as const,
  },
  
  // Orders
  orders: {
    all: () => ['/api/orders'] as const,
    detail: (id: string) => ['/api/orders', id] as const,
    byStatus: (status: string) => ['/api/orders', { status }] as const,
  },
  
  // Customers
  customers: {
    all: () => ['/api/customers'] as const,
    detail: (id: string) => ['/api/customers', id] as const,
  },
  
  // Menu
  menu: {
    all: () => ['/api/menu-items'] as const,
    categories: () => ['/api/menu-categories'] as const,
  },
  
  // Subscription
  subscription: {
    current: () => ['/api/subscription'] as const,
    plans: () => ['/api/subscription-plans'] as const,
  },
  
  // Public menu (for customers)
  publicMenu: {
    byTable: (tableNumber: string) => ['/api/public/tables', tableNumber, 'menu'] as const,
    tableStatus: (tableNumber: string) => ['/api/public/tables', tableNumber, 'status'] as const,
  },
} as const;

/**
 * Type helper to extract query key type
 * Usage: type TableKey = QueryKey<typeof QUERY_KEYS.tables.all>
 */
export type QueryKey<T extends (...args: any[]) => readonly any[]> = ReturnType<T>;
