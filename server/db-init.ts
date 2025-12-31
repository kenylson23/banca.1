// Initialize database on startup
// This ensures migrations run even if they fail during build
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Only run db:push if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      resolve();
      return;
    }

    
    const drizzleKit = spawn('npx', ['drizzle-kit', 'push', '--', '--force'], {
      stdio: 'inherit',
      env: { ...process.env },
    });

    drizzleKit.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error(`Database initialization failed with code ${code}`);
        // Don't reject - app can still start if db wasn't ready
        resolve();
      }
    });

    drizzleKit.on('error', (error) => {
      console.error('Database initialization error:', error);
      resolve(); // Don't reject
    });
  });
}
