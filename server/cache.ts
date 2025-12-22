/**
 * Simple in-memory cache for performance optimization
 * 
 * This cache stores frequently accessed data to reduce database queries.
 * In production with multiple instances, consider using Redis instead.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.cache = new Map();
    
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Delete specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries
    };
  }
}

// Singleton instance
export const cache = new SimpleCache();

// Cache key generators
export const CacheKeys = {
  subscription: (restaurantId: string) => `subscription:${restaurantId}`,
  subscriptionLimits: (restaurantId: string) => `limits:${restaurantId}`,
  menu: (restaurantId: string) => `menu:${restaurantId}`,
  restaurant: (id: string) => `restaurant:${id}`,
  restaurantBySlug: (slug: string) => `restaurant:slug:${slug}`,
  user: (id: string) => `user:${id}`,
  tables: (restaurantId: string) => `tables:${restaurantId}`,
};

// Cache TTLs (in milliseconds)
export const CacheTTL = {
  subscription: 60 * 1000,        // 1 minute
  subscriptionLimits: 5 * 60 * 1000,  // 5 minutes
  menu: 10 * 60 * 1000,           // 10 minutes
  restaurant: 30 * 60 * 1000,     // 30 minutes
  user: 5 * 60 * 1000,            // 5 minutes
  tables: 30 * 1000,              // 30 seconds (changes frequently)
};

// Helper function to get or set cache
export async function getOrSet<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch from database
  const data = await fetchFn();
  
  // Store in cache
  cache.set(key, data, ttl);
  
  return data;
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Destroying cache on SIGTERM...');
  cache.destroy();
});

process.on('SIGINT', () => {
  console.log('🛑 Destroying cache on SIGINT...');
  cache.destroy();
});
