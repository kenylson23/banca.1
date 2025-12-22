/**
 * Offline Database using IndexedDB via Dexie
 * 
 * Stores all critical data locally for offline operation.
 * Syncs automatically with server when connection is available.
 */

import Dexie, { Table } from 'dexie';

// Types for offline storage
export interface OfflineOrder {
  id: string;
  restaurantId: string;
  tableId?: string;
  guestId?: string;
  orderNumber: string;
  status: string;
  items: any[];
  total: string;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
  localOnly?: boolean; // Created offline, not yet on server
}

export interface OfflineTable {
  id: string;
  restaurantId: string;
  number: number;
  capacity: number;
  status: string;
  qrCode?: string;
  synced: boolean;
  updatedAt: Date;
}

export interface OfflineMenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: string;
  categoryId: string;
  imageUrl?: string;
  available: boolean;
  synced: boolean;
  updatedAt: Date;
}

export interface OfflineCustomer {
  id: string;
  restaurantId: string;
  name: string;
  phone?: string;
  email?: string;
  loyaltyPoints?: number;
  synced: boolean;
  updatedAt: Date;
}

export interface OfflinePayment {
  id: string;
  orderId: string;
  restaurantId: string;
  amount: string;
  method: string;
  status: string;
  createdAt: Date;
  synced: boolean;
  localOnly?: boolean;
}

export interface SyncOperation {
  id?: number;
  operation: 'CREATE_ORDER' | 'UPDATE_ORDER' | 'DELETE_ORDER' | 
             'CREATE_PAYMENT' | 'UPDATE_TABLE' | 'CREATE_CUSTOMER' |
             'UPDATE_CUSTOMER' | 'DELETE_ITEM';
  entity: 'order' | 'payment' | 'table' | 'customer' | 'menuItem';
  entityId: string;
  data: any;
  timestamp: number;
  synced: boolean;
  attempts: number;
  lastError?: string;
}

// Dexie Database Class
export class OfflineDB extends Dexie {
  orders!: Table<OfflineOrder, string>;
  tables!: Table<OfflineTable, string>;
  menuItems!: Table<OfflineMenuItem, string>;
  customers!: Table<OfflineCustomer, string>;
  payments!: Table<OfflinePayment, string>;
  syncQueue!: Table<SyncOperation, number>;

  constructor() {
    super('nabancada_offline');
    
    this.version(1).stores({
      orders: 'id, restaurantId, tableId, status, createdAt, synced, localOnly',
      tables: 'id, restaurantId, number, status, synced',
      menuItems: 'id, restaurantId, categoryId, available, synced',
      customers: 'id, restaurantId, phone, email, synced',
      payments: 'id, orderId, restaurantId, synced, localOnly',
      syncQueue: '++id, operation, entity, entityId, synced, timestamp'
    });
  }

  // Helper: Clear all data (for logout)
  async clearAll() {
    await Promise.all([
      this.orders.clear(),
      this.tables.clear(),
      this.menuItems.clear(),
      this.customers.clear(),
      this.payments.clear(),
      this.syncQueue.clear()
    ]);
    console.log('🗑️ Offline database cleared');
  }

  // Helper: Get database size
  async getDatabaseSize() {
    const counts = await Promise.all([
      this.orders.count(),
      this.tables.count(),
      this.menuItems.count(),
      this.customers.count(),
      this.payments.count(),
      this.syncQueue.count()
    ]);

    return {
      orders: counts[0],
      tables: counts[1],
      menuItems: counts[2],
      customers: counts[3],
      payments: counts[4],
      syncQueue: counts[5],
      total: counts.reduce((a, b) => a + b, 0)
    };
  }

  // Helper: Get sync statistics
  async getSyncStats() {
    const [pending, failed] = await Promise.all([
      this.syncQueue.where('synced').equals(false).count(),
      this.syncQueue.where('attempts').above(3).count()
    ]);

    return {
      pending,
      failed,
      lastSync: localStorage.getItem('lastSuccessfulSync')
    };
  }
}

// Singleton instance
export const offlineDB = new OfflineDB();

// Initialize database on app load
offlineDB.open().then(() => {
  console.log('✅ Offline database initialized');
  
  // Log database size
  offlineDB.getDatabaseSize().then(size => {
    console.log(`📊 Offline DB: ${size.total} records (${size.orders} orders, ${size.syncQueue} pending sync)`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize offline database:', err);
});

// Export types for use in other files
export type { Table };
