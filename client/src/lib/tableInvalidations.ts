/**
 * Centralized Table Query Invalidations
 * 
 * This helper provides consistent and efficient cache invalidation for table-related queries.
 * Instead of manually invalidating multiple queries, use these helpers to ensure all
 * related data is properly refreshed.
 * 
 * Benefits:
 * - Reduces code duplication (5+ lines → 1 line)
 * - Prevents forgotten invalidations
 * - Type-safe with queryKeys.ts
 * - Easy to maintain and update
 * 
 * Usage:
 * ```typescript
 * // After adding a guest:
 * invalidateTableQueries(queryClient, tableId, { guests: true });
 * 
 * // After payment:
 * invalidateTableQueries(queryClient, tableId, { payments: true, withOrders: true });
 * 
 * // After closing session (invalidate everything):
 * invalidateTableQueries(queryClient, tableId, { all: true });
 * ```
 */

import { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './queryKeys';

export interface TableInvalidationOptions {
  /** Invalidate main tables list */
  tables?: boolean;
  
  /** Invalidate tables with orders view */
  withOrders?: boolean;
  
  /** Invalidate open tables */
  openTables?: boolean;
  
  /** Invalidate guests list and orders-by-guest */
  guests?: boolean;
  
  /** Invalidate payments */
  payments?: boolean;
  
  /** Invalidate bill splits */
  billSplits?: boolean;
  
  /** Invalidate sessions history */
  sessions?: boolean;
  
  /** Invalidate everything (use after major changes) */
  all?: boolean;
}

/**
 * Invalidate table-related queries based on what changed
 * 
 * @param queryClient - React Query client instance
 * @param tableId - ID of the table that changed
 * @param options - Which queries to invalidate
 */
export const invalidateTableQueries = (
  queryClient: QueryClient,
  tableId: string,
  options: TableInvalidationOptions = {}
) => {
  const {
    tables = false,
    withOrders = false,
    openTables = false,
    guests = false,
    payments = false,
    billSplits = false,
    sessions = false,
    all = false,
  } = options;

  // If "all" is true, invalidate everything
  if (all) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.all() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.withOrders() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.open() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.guests(tableId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.ordersByGuest(tableId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.payments(tableId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.billSplits(tableId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.sessions(tableId) });
    return;
  }

  // Selective invalidations
  if (tables) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.all() });
  }

  if (withOrders) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.withOrders() });
  }

  if (openTables) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.open() });
  }

  if (guests) {
    // When guests change, also invalidate orders-by-guest (they're related)
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.guests(tableId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.ordersByGuest(tableId) });
  }

  if (payments) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.payments(tableId) });
  }

  if (billSplits) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.billSplits(tableId) });
  }

  if (sessions) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.sessions(tableId) });
  }
};

/**
 * Invalidate after adding a guest
 * Common pattern: guest added → update guests, orders, and main list
 */
export const invalidateAfterGuestAdded = (queryClient: QueryClient, tableId: string) => {
  invalidateTableQueries(queryClient, tableId, {
    guests: true,
    tables: true,
    withOrders: true,
  });
};

/**
 * Invalidate after creating an order
 * Common pattern: order created → update orders, main list, and with-orders view
 */
export const invalidateAfterOrderCreated = (queryClient: QueryClient, tableId: string) => {
  invalidateTableQueries(queryClient, tableId, {
    guests: true, // orders-by-guest is included
    withOrders: true,
    tables: true,
  });
};

/**
 * Invalidate after payment
 * Common pattern: payment made → update payments, orders, and main list
 */
export const invalidateAfterPayment = (queryClient: QueryClient, tableId: string) => {
  invalidateTableQueries(queryClient, tableId, {
    payments: true,
    guests: true,
    withOrders: true,
    tables: true,
  });
};

/**
 * Invalidate after closing session
 * Common pattern: session closed → invalidate everything
 */
export const invalidateAfterSessionClosed = (queryClient: QueryClient, tableId: string) => {
  invalidateTableQueries(queryClient, tableId, { all: true });
};

/**
 * Invalidate after starting session
 * Common pattern: session started → update main list and with-orders
 */
export const invalidateAfterSessionStarted = (queryClient: QueryClient, tableId: string) => {
  invalidateTableQueries(queryClient, tableId, {
    tables: true,
    withOrders: true,
    openTables: true,
  });
};

/**
 * Invalidate after bill split operation
 * Common pattern: split created/updated → update splits and orders
 */
export const invalidateAfterBillSplit = (queryClient: QueryClient, tableId: string) => {
  invalidateTableQueries(queryClient, tableId, {
    billSplits: true,
    guests: true,
    withOrders: true,
  });
};
