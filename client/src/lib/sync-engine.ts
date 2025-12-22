/**
 * Sync Engine - Automatic Synchronization
 * 
 * Handles bidirectional sync between local IndexedDB and server.
 * Runs automatically when connection is detected.
 */

import { offlineManager } from './offline-manager';
import { offlineDB } from './offline-db';
import type { SyncOperation } from './offline-db';

type SyncEventType = 'sync_start' | 'sync_complete' | 'sync_error' | 'online' | 'offline';
type SyncEventListener = (data?: any) => void;

export class SyncEngine {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<SyncEventType, Set<SyncEventListener>> = new Map();
  private lastSyncAttempt: number = 0;
  private syncRetryDelay: number = 30000; // 30 seconds
  private maxRetries: number = 5;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for connectivity changes
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Try to sync every 30 seconds if online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, this.syncRetryDelay);

    // Initial sync if online
    if (this.isOnline) {
      setTimeout(() => this.sync(), 2000); // Wait 2s after page load
    }

    console.log(`🔄 Sync Engine initialized (${this.isOnline ? 'online' : 'offline'})`);
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  on(event: SyncEventType, listener: SyncEventListener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: SyncEventType, listener: SyncEventListener) {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emit(event: SyncEventType, data?: any) {
    this.eventListeners.get(event)?.forEach(listener => listener(data));
  }

  // ============================================================================
  // CONNECTIVITY HANDLERS
  // ============================================================================

  private handleOnline() {
    console.log('✅ Connection restored - Starting sync');
    this.isOnline = true;
    this.emit('online');
    
    // Immediate sync when coming back online
    setTimeout(() => this.sync(), 500);
  }

  private handleOffline() {
    console.log('🔴 Connection lost - Offline mode activated');
    this.isOnline = false;
    this.emit('offline');
  }

  // ============================================================================
  // MAIN SYNC FUNCTION
  // ============================================================================

  async sync(force: boolean = false): Promise<void> {
    if (this.isSyncing && !force) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    if (!this.isOnline) {
      console.log('📴 Offline - sync skipped');
      return;
    }

    // Prevent too frequent syncs
    const now = Date.now();
    if (!force && now - this.lastSyncAttempt < 10000) {
      return; // Less than 10 seconds since last attempt
    }

    this.lastSyncAttempt = now;
    this.isSyncing = true;
    this.emit('sync_start');

    try {
      console.log('🔄 Starting synchronization...');

      // 1. Push local changes to server
      const pushResult = await this.pushLocalChanges();
      
      // 2. Pull updates from server
      const pullResult = await this.pullServerChanges();

      // 3. Cleanup old synced operations
      await offlineManager.clearSyncedOperations();

      // Update last sync timestamp
      localStorage.setItem('lastSuccessfulSync', new Date().toISOString());

      console.log(`✅ Sync complete: ${pushResult.synced} pushed, ${pullResult.fetched} fetched`);
      this.emit('sync_complete', { pushed: pushResult.synced, fetched: pullResult.fetched });

    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.emit('sync_error', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // ============================================================================
  // PUSH LOCAL CHANGES
  // ============================================================================

  private async pushLocalChanges(): Promise<{ synced: number; failed: number }> {
    const pendingOps = await offlineManager.getPendingOperations();
    
    if (pendingOps.length === 0) {
      return { synced: 0, failed: 0 };
    }

    console.log(`📤 Pushing ${pendingOps.length} pending operations to server`);

    let synced = 0;
    let failed = 0;

    for (const op of pendingOps) {
      // Skip if too many retries
      if (op.attempts >= this.maxRetries) {
        console.warn(`⚠️ Operation ${op.id} exceeded max retries, skipping`);
        failed++;
        continue;
      }

      try {
        const result = await this.executeOperation(op);
        
        if (result.success) {
          await offlineManager.markOperationSynced(op.id!, result.data);
          synced++;
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error: any) {
        console.error(`❌ Failed to sync operation ${op.id}:`, error.message);
        await offlineManager.markOperationFailed(op.id!, error.message);
        failed++;
      }
    }

    console.log(`📤 Push complete: ${synced} synced, ${failed} failed`);
    return { synced, failed };
  }

  // ============================================================================
  // EXECUTE SINGLE OPERATION
  // ============================================================================

  private async executeOperation(op: SyncOperation): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      let response: Response;

      switch (op.operation) {
        case 'CREATE_ORDER':
          response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              tableId: op.data.tableId,
              guestId: op.data.guestId,
              items: op.data.items,
              total: op.data.total,
              offlineId: op.entityId // Send offline ID for reference
            })
          });
          break;

        case 'UPDATE_ORDER':
          response = await fetch(`/api/orders/${op.entityId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              status: op.data.status,
              items: op.data.items,
              total: op.data.total
            })
          });
          break;

        case 'CREATE_PAYMENT':
          response = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              orderId: op.data.orderId,
              amount: op.data.amount,
              method: op.data.method,
              offlineId: op.entityId
            })
          });
          break;

        case 'UPDATE_TABLE':
          response = await fetch(`/api/tables/${op.entityId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(op.data)
          });
          break;

        default:
          return { success: false, error: `Unknown operation: ${op.operation}` };
      }

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // PULL SERVER CHANGES
  // ============================================================================

  private async pullServerChanges(): Promise<{ fetched: number }> {
    try {
      const lastSync = localStorage.getItem('lastSuccessfulSync');
      const since = lastSync || new Date(0).toISOString();

      console.log(`📥 Fetching changes from server since ${since}`);

      const response = await fetch(`/api/sync/changes?since=${since}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Sync data to local database
      await offlineManager.syncFromServer({
        orders: data.orders || [],
        tables: data.tables || [],
        menuItems: data.menuItems || [],
        customers: data.customers || []
      });

      const total = (data.orders?.length || 0) + 
                   (data.tables?.length || 0) + 
                   (data.menuItems?.length || 0) + 
                   (data.customers?.length || 0);

      console.log(`📥 Pull complete: ${total} records fetched`);
      return { fetched: total };

    } catch (error: any) {
      console.error('❌ Failed to pull server changes:', error);
      return { fetched: 0 };
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Force immediate sync
   */
  async forceSyncNow(): Promise<void> {
    return this.sync(true);
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    const stats = await offlineDB.getSyncStats();
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSync: stats.lastSync,
      pendingOperations: stats.pending,
      failedOperations: stats.failed
    };
  }

  /**
   * Check if online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Check if syncing
   */
  getIsSyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Destroy (cleanup)
   */
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    window.removeEventListener('online', () => this.handleOnline());
    window.removeEventListener('offline', () => this.handleOffline());
    this.eventListeners.clear();
    console.log('🔄 Sync Engine destroyed');
  }
}

// Singleton instance
export const syncEngine = new SyncEngine();

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).syncEngine = syncEngine;
  (window as any).offlineDB = offlineDB;
  (window as any).offlineManager = offlineManager;
}
