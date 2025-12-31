import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  
  const restaurants = await sql`
    SELECT id, name, slug, status 
    FROM restaurants 
    ORDER BY id 
    LIMIT 10
  `;
  
  if (restaurants.length === 0) {
  } else {
    restaurants.forEach((r: any) => {
    });
  }
  process.exit(0);
}

main().catch(console.error);
