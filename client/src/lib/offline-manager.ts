/**
 * Offline Operations Manager
 * 
 * Handles all CRUD operations with offline-first approach.
 * Stores operations locally and queues them for sync when online.
 */

import { offlineDB, type OfflineOrder, type OfflinePayment, type OfflineTable, type SyncOperation } from './offline-db';
import { nanoid } from 'nanoid';

export class OfflineManager {
  private restaurantId: string | null = null;

  setRestaurantId(id: string) {
    this.restaurantId = id;
  }

  private generateOfflineId(): string {
    return `offline_${Date.now()}_${nanoid(8)}`;
  }

  private async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'attempts' | 'synced'>): Promise<void> {
    await offlineDB.syncQueue.add({
      ...operation,
      synced: false,
      attempts: 0,
      timestamp: Date.now()
    });
  }

  // ============================================================================
  // ORDERS
  // ============================================================================

  /**
   * Create order offline
   */
  async createOrder(orderData: {
    tableId?: string;
    guestId?: string;
    items: any[];
    total: string;
  }): Promise<OfflineOrder> {
    if (!this.restaurantId) throw new Error('Restaurant ID not set');

    const tempId = this.generateOfflineId();
    const now = new Date();

    const order: OfflineOrder = {
      id: tempId,
      restaurantId: this.restaurantId,
      tableId: orderData.tableId,
      guestId: orderData.guestId,
      orderNumber: `OFF-${Date.now().toString().slice(-6)}`,
      status: 'pending',
      items: orderData.items,
      total: orderData.total,
      createdAt: now,
      updatedAt: now,
      synced: false,
      localOnly: true
    };

    // Save to local database
    await offlineDB.orders.add(order);

    // Add to sync queue
    await this.addToSyncQueue({
      operation: 'CREATE_ORDER',
      entity: 'order',
      entityId: tempId,
      data: order,
      timestamp: Date.now()
    });

    console.log('📱 Order created offline:', tempId);
    return order;
  }

  /**
   * Update order offline
   */
  async updateOrder(orderId: string, updates: Partial<OfflineOrder>): Promise<void> {
    const updatedData = {
      ...updates,
      updatedAt: new Date(),
      synced: false
    };

    await offlineDB.orders.update(orderId, updatedData);

    await this.addToSyncQueue({
      operation: 'UPDATE_ORDER',
      entity: 'order',
      entityId: orderId,
      data: updatedData,
      timestamp: Date.now()
    });

    console.log('📱 Order updated offline:', orderId);
  }

  /**
   * Get orders (offline-first)
   */
  async getOrders(filters?: {
    status?: string;
    tableId?: string;
    limit?: number;
  }): Promise<OfflineOrder[]> {
    if (!this.restaurantId) return [];

    let query = offlineDB.orders
      .where('restaurantId')
      .equals(this.restaurantId);

    let orders = await query.toArray();

    // Apply filters
    if (filters?.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    if (filters?.tableId) {
      orders = orders.filter(o => o.tableId === filters.tableId);
    }
    if (filters?.limit) {
      orders = orders.slice(0, filters.limit);
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return orders;
  }

  /**
   * Get single order
   */
  async getOrder(orderId: string): Promise<OfflineOrder | undefined> {
    return await offlineDB.orders.get(orderId);
  }

  // ============================================================================
  // PAYMENTS
  // ============================================================================

  /**
   * Create payment offline
   */
  async createPayment(paymentData: {
    orderId: string;
    amount: string;
    method: string;
  }): Promise<OfflinePayment> {
    if (!this.restaurantId) throw new Error('Restaurant ID not set');

    const tempId = this.generateOfflineId();

    const payment: OfflinePayment = {
      id: tempId,
      orderId: paymentData.orderId,
      restaurantId: this.restaurantId,
      amount: paymentData.amount,
      method: paymentData.method,
      status: 'completed',
      createdAt: new Date(),
      synced: false,
      localOnly: true
    };

    await offlineDB.payments.add(payment);

    await this.addToSyncQueue({
      operation: 'CREATE_PAYMENT',
      entity: 'payment',
      entityId: tempId,
      data: payment,
      timestamp: Date.now()
    });

    // Update order status to paid
    await this.updateOrder(paymentData.orderId, { status: 'paid' });

    console.log('📱 Payment created offline:', tempId);
    return payment;
  }

  /**
   * Get payments for an order
   */
  async getPayments(orderId: string): Promise<OfflinePayment[]> {
    return await offlineDB.payments
      .where('orderId')
      .equals(orderId)
      .toArray();
  }

  // ============================================================================
  // TABLES
  // ============================================================================

  /**
   * Update table status offline
   */
  async updateTable(tableId: string, updates: Partial<OfflineTable>): Promise<void> {
    const updatedData = {
      ...updates,
      updatedAt: new Date(),
      synced: false
    };

    await offlineDB.tables.update(tableId, updatedData);

    await this.addToSyncQueue({
      operation: 'UPDATE_TABLE',
      entity: 'table',
      entityId: tableId,
      data: updatedData,
      timestamp: Date.now()
    });

    console.log('📱 Table updated offline:', tableId);
  }

  /**
   * Get tables (offline-first)
   */
  async getTables(): Promise<OfflineTable[]> {
    if (!this.restaurantId) return [];

    return await offlineDB.tables
      .where('restaurantId')
      .equals(this.restaurantId)
      .toArray();
  }

  // ============================================================================
  // MENU ITEMS
  // ============================================================================

  /**
   * Get menu items (offline-first)
   */
  async getMenuItems(filters?: {
    categoryId?: string;
    available?: boolean;
  }): Promise<any[]> {
    if (!this.restaurantId) return [];

    let items = await offlineDB.menuItems
      .where('restaurantId')
      .equals(this.restaurantId)
      .toArray();

    if (filters?.categoryId) {
      items = items.filter(item => item.categoryId === filters.categoryId);
    }
    if (filters?.available !== undefined) {
      items = items.filter(item => item.available === filters.available);
    }

    return items;
  }

  // ============================================================================
  // CUSTOMERS
  // ============================================================================

  /**
   * Search customers offline
   */
  async searchCustomers(query: string): Promise<any[]> {
    if (!this.restaurantId) return [];

    const customers = await offlineDB.customers
      .where('restaurantId')
      .equals(this.restaurantId)
      .toArray();

    const lowerQuery = query.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.phone?.includes(query) ||
      customer.email?.toLowerCase().includes(lowerQuery)
    );
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Sync data from server to local database
   */
  async syncFromServer(data: {
    orders?: OfflineOrder[];
    tables?: OfflineTable[];
    menuItems?: any[];
    customers?: any[];
  }): Promise<void> {
    console.log('📥 Syncing data from server to local database');

    const operations = [];

    if (data.orders) {
      operations.push(offlineDB.orders.bulkPut(data.orders));
    }
    if (data.tables) {
      operations.push(offlineDB.tables.bulkPut(data.tables));
    }
    if (data.menuItems) {
      operations.push(offlineDB.menuItems.bulkPut(data.menuItems));
    }
    if (data.customers) {
      operations.push(offlineDB.customers.bulkPut(data.customers));
    }

    await Promise.all(operations);
    console.log('✅ Local database synced');
  }

  /**
   * Get pending sync operations
   */
  async getPendingOperations(): Promise<SyncOperation[]> {
    return await offlineDB.syncQueue
      .where('synced')
      .equals(false)
      .sortBy('timestamp');
  }

  /**
   * Mark operation as synced
   */
  async markOperationSynced(operationId: number, serverData?: any): Promise<void> {
    await offlineDB.syncQueue.update(operationId, { 
      synced: true,
      lastError: undefined
    });

    // If server returned new ID, update the local entity
    if (serverData?.id) {
      const operation = await offlineDB.syncQueue.get(operationId);
      if (operation?.entityId.startsWith('offline_')) {
        // Update local entity with server ID
        switch (operation.entity) {
          case 'order':
            await offlineDB.orders.update(operation.entityId, {
              id: serverData.id,
              localOnly: false,
              synced: true
            });
            break;
          case 'payment':
            await offlineDB.payments.update(operation.entityId, {
              id: serverData.id,
              localOnly: false,
              synced: true
            });
            break;
        }
      }
    }
  }

  /**
   * Mark operation as failed
   */
  async markOperationFailed(operationId: number, error: string): Promise<void> {
    const operation = await offlineDB.syncQueue.get(operationId);
    if (operation) {
      await offlineDB.syncQueue.update(operationId, {
        attempts: operation.attempts + 1,
        lastError: error
      });
    }
  }

  /**
   * Clear synced operations (cleanup)
   */
  async clearSyncedOperations(): Promise<void> {
    const syncedOps = await offlineDB.syncQueue
      .where('synced')
      .equals(true)
      .toArray();

    if (syncedOps.length > 0) {
      await offlineDB.syncQueue.bulkDelete(syncedOps.map(op => op.id!));
      console.log(`🗑️ Cleared ${syncedOps.length} synced operations`);
    }
  }
}

// Singleton instance
export const offlineManager = new OfflineManager();
