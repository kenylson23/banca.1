import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'nabancada.db');
const db = new Database(dbPath);

try {
  console.log('Running migration: add table position columns...');
  
  // Check if columns exist
  const tableInfo = db.prepare("PRAGMA table_info(tables)").all();
  const hasPositionX = tableInfo.some((col: any) => col.name === 'position_x');
  const hasPositionY = tableInfo.some((col: any) => col.name === 'position_y');
  
  if (!hasPositionX) {
    db.prepare("ALTER TABLE tables ADD COLUMN position_x REAL DEFAULT NULL").run();
    console.log('✓ Added position_x column');
  } else {
    console.log('✓ position_x column already exists');
  }
  
  if (!hasPositionY) {
    db.prepare("ALTER TABLE tables ADD COLUMN position_y REAL DEFAULT NULL").run();
    console.log('✓ Added position_y column');
  } else {
    console.log('✓ position_y column already exists');
  }
  
  console.log('✅ Migration completed successfully!');
} catch (error: any) {
  console.error('❌ Migration error:', error.message);
  process.exit(1);
} finally {
  db.close();
}
