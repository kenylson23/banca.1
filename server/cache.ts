/**
 * Distributed cache with Redis support for horizontal scaling
 * 
 * Automatically uses Redis if REDIS_URL is set, otherwise falls back to in-memory.
 * Redis allows multiple app instances to share the same cache.
 */

import type Redis from 'ioredis';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Redis client (lazy loaded)
let redisClient: Redis | null = null;

async function getRedisClient(): Promise<Redis | null> {
  if (redisClient !== null) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null; // No Redis configured
  }

  try {
    const { default: IORedis } = await import('ioredis');
    redisClient = new IORedis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    return null;
  }
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout | null;
  private useRedis: boolean = false;

  constructor() {
    this.cache = new Map();
    
    // Check if Redis is available
    getRedisClient().then(client => {
      if (client) {
        this.useRedis = true;
        console.log('🚀 Cache: Using Redis (distributed)');
      } else {
        console.log('💾 Cache: Using in-memory (single instance only)');
      }
    });

    // Cleanup expired entries every 5 minutes (only for in-memory)
    this.cleanupInterval = setInterval(() => {
      if (!this.useRedis) {
        this.cleanup();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Get value from cache (async for Redis support)
   */
  async get<T>(key: string): Promise<T | null> {
    const redis = await getRedisClient();
    
    if (redis && this.useRedis) {
      try {
        const value = await redis.get(key);
        if (!value) return null;
        return JSON.parse(value) as T;
      } catch (error) {
        console.error('❌ Redis get error:', error);
        // Fallback to in-memory
      }
    }

    // In-memory fallback
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
   * Set value in cache with TTL (async for Redis support)
   */
  async set<T>(key: string, data: T, ttl: number = 60000): Promise<void> {
    const redis = await getRedisClient();
    
    if (redis && this.useRedis) {
      try {
        const ttlSeconds = Math.ceil(ttl / 1000);
        await redis.setex(key, ttlSeconds, JSON.stringify(data));
        return;
      } catch (error) {
        console.error('❌ Redis set error:', error);
        // Fallback to in-memory
      }
    }

    // In-memory fallback
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Delete specific key (async for Redis support)
   */
  async delete(key: string): Promise<void> {
    const redis = await getRedisClient();
    
    if (redis && this.useRedis) {
      try {
        await redis.del(key);
        return;
      } catch (error) {
        console.error('❌ Redis delete error:', error);
      }
    }

    // In-memory fallback
    this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern (async for Redis support)
   */
  async deletePattern(pattern: string): Promise<void> {
    const redis = await getRedisClient();
    
    if (redis && this.useRedis) {
      try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        return;
      } catch (error) {
        console.error('❌ Redis deletePattern error:', error);
      }
    }

    // In-memory fallback
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache (async for Redis support)
   */
  async clear(): Promise<void> {
    const redis = await getRedisClient();
    
    if (redis && this.useRedis) {
      try {
        await redis.flushdb();
        return;
      } catch (error) {
        console.error('❌ Redis clear error:', error);
      }
    }

    // In-memory fallback
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
   * Get cache statistics (async for Redis support)
   */
  async getStats() {
    const redis = await getRedisClient();
    
    if (redis && this.useRedis) {
      try {
        const info = await redis.info('stats');
        const dbsize = await redis.dbsize();
        
        return {
          total: dbsize,
          valid: dbsize, // Redis auto-expires, so all keys are valid
          expired: 0
        };
      } catch (error) {
        console.error('❌ Redis getStats error:', error);
      }
    }

    // In-memory fallback
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
  const cached = await cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch from database
  const data = await fetchFn();
  
  // Store in cache
  await cache.set(key, data, ttl);
  
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
