// PostgreSQL database connection compatible with Render, Neon, and other cloud platforms
import * as schema from "@shared/schema";

const url = process.env.DATABASE_URL;
if (!url || url.trim() === '') {
  throw new Error(
    "DATABASE_URL is not configured. Please set the DATABASE_URL environment variable with your PostgreSQL connection string.",
  );
}

const isNeonDatabase = url.includes('neon.tech') || url.includes('neon.cloud');

let poolInstance: any = null;
let dbInstance: any = null;
let initPromise: Promise<void> | null = null;

async function initializeConnection() {
  if (poolInstance && dbInstance) {
    return;
  }
  
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    if (isNeonDatabase) {
      const { Pool, neonConfig } = await import('@neondatabase/serverless');
      const { drizzle } = await import('drizzle-orm/neon-serverless');
      const ws = (await import('ws')).default;
      
      neonConfig.webSocketConstructor = ws;
      neonConfig.wsProxy = (host) => host + '/v2';
      neonConfig.useSecureWebSocket = true;
      neonConfig.pipelineTLS = false;
      neonConfig.pipelineConnect = false;

      if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }

      poolInstance = new Pool({ 
        connectionString: url,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
      dbInstance = drizzle({ client: poolInstance, schema });
    } else {
      const { Pool } = await import('pg');
      const { drizzle } = await import('drizzle-orm/node-postgres');
      
      poolInstance = new Pool({
        connectionString: url,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
      dbInstance = drizzle(poolInstance, { schema });
    }
  })();

  return initPromise;
}

export const pool = new Proxy({} as any, {
  get(target, prop) {
    if (!poolInstance) {
      initializeConnection();
    }
    return (poolInstance as any)[prop];
  }
});

export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!dbInstance) {
      initializeConnection();
    }
    return (dbInstance as any)[prop];
  }
});

export { initializeConnection };
