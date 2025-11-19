import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  
  const restaurants = await sql`
    SELECT id, name, slug, status 
    FROM restaurants 
    ORDER BY id 
    LIMIT 10
  `;
  
  console.log('\n=== RESTAURANTES NO BANCO ===\n');
  if (restaurants.length === 0) {
    console.log('❌ Nenhum restaurante encontrado no banco de dados.');
  } else {
    restaurants.forEach((r: any) => {
      console.log(`✓ ${r.name}`);
      console.log(`  Slug: ${r.slug}`);
      console.log(`  URL:  /r/${r.slug}`);
      console.log('');
    });
  }
  process.exit(0);
}

main().catch(console.error);
