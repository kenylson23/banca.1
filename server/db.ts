// Blueprint: javascript_database - PostgreSQL database connection
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let poolInstance: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function initializeConnection() {
  if (!poolInstance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    poolInstance = new Pool({ connectionString: url });
  }
  if (!dbInstance) {
    dbInstance = drizzle({ client: poolInstance, schema });
  }
}

export const pool = new Proxy({} as Pool, {
  get(target, prop) {
    initializeConnection();
    return (poolInstance as any)[prop];
  }
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    initializeConnection();
    return (dbInstance as any)[prop];
  }
});
