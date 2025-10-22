import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  const envFile = path.join(__dirname, '.cache/replit/env/latest.json');
  if (fs.existsSync(envFile)) {
    const data = JSON.parse(fs.readFileSync(envFile, 'utf8'));
    const env = data.environment || {};
    
    const dbVars = ['DATABASE_URL', 'PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'PGPORT'];
    dbVars.forEach(key => {
      if (env[key] && !process.env[key]) {
        process.env[key] = env[key];
      }
    });
  }
} catch (error) {
  console.warn('Could not load Replit environment cache:', error.message);
}
