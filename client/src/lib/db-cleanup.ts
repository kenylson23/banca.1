/**
 * Database Cleanup Utility
 * 
 * Handles IndexedDB cleanup and migration issues
 */

const DB_VERSION_KEY = 'nabancada_db_version';
const CURRENT_DB_VERSION = '2.0';

/**
 * Check if database needs cleanup
 */
export function needsCleanup(): boolean {
  const storedVersion = localStorage.getItem(DB_VERSION_KEY);
  return storedVersion !== CURRENT_DB_VERSION;
}

/**
 * Clean up old IndexedDB database
 */
export async function cleanupIndexedDB(): Promise<boolean> {
  try {
    console.log('🧹 Cleaning up old IndexedDB...');
    
    // Delete the old database
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('nabancada_offline');
      
      request.onsuccess = () => {
        console.log('✅ Old database deleted successfully');
        resolve();
      };
      
      request.onerror = () => {
        console.error('❌ Error deleting database');
        reject(request.error);
      };
      
      request.onblocked = () => {
        console.warn('⚠️ Database deletion blocked. This usually means another tab has the database open.');
        // Try to resolve anyway
        resolve();
      };
    });
    
    // Update version marker
    localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
    console.log('✅ Database version updated to', CURRENT_DB_VERSION);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to cleanup IndexedDB:', error);
    return false;
  }
}

/**
 * Initialize database cleanup if needed
 */
export async function initDatabaseCleanup(): Promise<void> {
  if (needsCleanup()) {
    console.log('🔄 Database schema update detected, cleaning up...');
    const success = await cleanupIndexedDB();
    
    if (success) {
      console.log('✅ Database cleanup completed successfully');
    } else {
      console.warn('⚠️ Database cleanup failed, but application will continue');
    }
  } else {
    console.log('✅ Database version is current');
  }
}
