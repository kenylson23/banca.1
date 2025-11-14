import type { InsertOrder, Order, InsertOrderItem, OrderItem } from "@shared/schema";

const DB_NAME = "nabancada_pdv";
const DB_VERSION = 1;

const STORES = {
  ORDERS: "orders",
  ORDER_ITEMS: "order_items",
  SYNC_QUEUE: "sync_queue",
} as const;

interface PendingSync {
  id: string;
  type: "create_order" | "update_order" | "delete_order";
  data: any;
  timestamp: number;
  retries: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORES.ORDERS)) {
          const ordersStore = db.createObjectStore(STORES.ORDERS, { keyPath: "id" });
          ordersStore.createIndex("createdAt", "createdAt", { unique: false });
          ordersStore.createIndex("orderType", "orderType", { unique: false });
          ordersStore.createIndex("status", "status", { unique: false });
          ordersStore.createIndex("isSynced", "isSynced", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.ORDER_ITEMS)) {
          const orderItemsStore = db.createObjectStore(STORES.ORDER_ITEMS, { keyPath: "id" });
          orderItemsStore.createIndex("orderId", "orderId", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: "id" });
          syncStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = "readonly"): Promise<IDBObjectStore> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async saveOrder(order: Partial<Order>): Promise<void> {
    const store = await this.getStore(STORES.ORDERS, "readwrite");
    await new Promise<void>((resolve, reject) => {
      const request = store.put(order);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveOrderItems(items: Partial<OrderItem>[]): Promise<void> {
    const store = await this.getStore(STORES.ORDER_ITEMS, "readwrite");
    await Promise.all(
      items.map(
        (item) =>
          new Promise<void>((resolve, reject) => {
            const request = store.put(item);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
      )
    );
  }

  async getOrder(id: string): Promise<Order | null> {
    const store = await this.getStore(STORES.ORDERS);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getOrders(filters?: {
    orderType?: string;
    status?: string;
    isSynced?: number;
  }): Promise<Order[]> {
    const store = await this.getStore(STORES.ORDERS);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let orders = request.result as Order[];
        
        if (filters) {
          if (filters.orderType) {
            orders = orders.filter((o) => o.orderType === filters.orderType);
          }
          if (filters.status) {
            orders = orders.filter((o) => o.status === filters.status);
          }
          if (filters.isSynced !== undefined) {
            orders = orders.filter((o) => o.isSynced === filters.isSynced);
          }
        }
        
        resolve(orders);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const store = await this.getStore(STORES.ORDER_ITEMS);
    const index = store.index("orderId");
    return new Promise((resolve, reject) => {
      const request = index.getAll(orderId);
      request.onsuccess = () => resolve(request.result as OrderItem[]);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOrder(id: string): Promise<void> {
    const orderStore = await this.getStore(STORES.ORDERS, "readwrite");
    const itemStore = await this.getStore(STORES.ORDER_ITEMS, "readwrite");

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = orderStore.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      this.getOrderItems(id).then((items) =>
        Promise.all(
          items.map(
            (item) =>
              new Promise<void>((resolve, reject) => {
                const request = itemStore.delete(item.id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
              })
          )
        )
      ),
    ]);
  }

  async addToSyncQueue(item: Omit<PendingSync, "id" | "timestamp" | "retries">): Promise<void> {
    const store = await this.getStore(STORES.SYNC_QUEUE, "readwrite");
    const syncItem: PendingSync = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
    };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(syncItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<PendingSync[]> {
    const store = await this.getStore(STORES.SYNC_QUEUE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result as PendingSync[];
        items.sort((a, b) => a.timestamp - b.timestamp);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeSyncItem(id: string): Promise<void> {
    const store = await this.getStore(STORES.SYNC_QUEUE, "readwrite");
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateSyncItemRetries(id: string, retries: number): Promise<void> {
    const store = await this.getStore(STORES.SYNC_QUEUE, "readwrite");
    const item = await new Promise<PendingSync>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (item) {
      item.retries = retries;
      await new Promise<void>((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) return;

    const storeNames = [STORES.ORDERS, STORES.ORDER_ITEMS, STORES.SYNC_QUEUE];
    const transaction = this.db.transaction(storeNames, "readwrite");

    await Promise.all(
      storeNames.map(
        (storeName) =>
          new Promise<void>((resolve, reject) => {
            const request = transaction.objectStore(storeName).clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
      )
    );
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

export const indexedDB = new IndexedDBManager();

export async function syncOfflineOrders(): Promise<{ success: number; failed: number }> {
  if (typeof navigator === 'undefined' || !navigator.onLine) {
    return { success: 0, failed: 0 };
  }

  const queue = await indexedDB.getSyncQueue();
  let success = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      let response: Response | null = null;

      switch (item.type) {
        case "create_order":
          response = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.data),
          });
          break;

        case "update_order":
          response = await fetch(`/api/orders/${item.data.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.data),
          });
          break;

        case "delete_order":
          response = await fetch(`/api/orders/${item.data.id}`, {
            method: "DELETE",
          });
          break;
      }

      if (response && response.ok) {
        await indexedDB.removeSyncItem(item.id);
        
        if (item.type === "create_order" || item.type === "update_order") {
          const order = await indexedDB.getOrder(item.data.id);
          if (order) {
            order.isSynced = 1;
            await indexedDB.saveOrder(order);
          }
        } else if (item.type === "delete_order") {
          await indexedDB.deleteOrder(item.data.id);
        }
        
        success++;
      } else {
        if (item.retries < 3) {
          await indexedDB.updateSyncItemRetries(item.id, item.retries + 1);
        } else {
          await indexedDB.removeSyncItem(item.id);
        }
        failed++;
      }
    } catch (error) {
      console.error("Error syncing item:", error);
      if (item.retries < 3) {
        await indexedDB.updateSyncItemRetries(item.id, item.retries + 1);
      } else {
        await indexedDB.removeSyncItem(item.id);
      }
      failed++;
    }
  }

  return { success, failed };
}

export async function setupAutoSync(intervalMs: number = 30000): Promise<() => void> {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const sync = async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await syncOfflineOrders();
    }
  };

  await sync();
  const intervalId = setInterval(sync, intervalMs);

  window.addEventListener("online", sync);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener("online", sync);
  };
}
