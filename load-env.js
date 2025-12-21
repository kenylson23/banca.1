import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file
try {
  const envFilePath = path.join(__dirname, '.env');
  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
    console.log('✓ Loaded .env file');
  }
} catch (error) {
  console.warn('Could not load .env file:', error.message);
}

// Load Replit environment cache
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
    console.log('✓ Loaded Replit environment cache');
  }
} catch (error) {
  console.warn('Could not load Replit environment cache:', error.message);
}
