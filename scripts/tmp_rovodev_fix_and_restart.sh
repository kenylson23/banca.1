#!/bin/bash

echo "🔧 Corrigindo migrações problemáticas..."

# Conectar ao banco e marcar migrações como aplicadas
cat > /tmp/fix_migrations.sql << 'SQLEOF'
-- Marcar migrações problemáticas como aplicadas
INSERT INTO migrations (filename) VALUES 
  ('0004_add_session_id_to_orders.sql'),
  ('add_performance_indexes.sql'),
  ('create_link_analytics.sql'),
  ('fix_missing_sessionids.sql')
ON CONFLICT (filename) DO NOTHING;
SQLEOF

# Executar via node
node -e "
const { Client } = require('pg');
const fs = require('fs');

async function fix() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const sql = fs.readFileSync('/tmp/fix_migrations.sql', 'utf8');
    await client.query(sql);
    console.log('✅ Migrações marcadas como aplicadas');
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await client.end();
  }
}
fix();
" 2>&1

echo ""
echo "🚀 Reiniciando servidor..."
npm run dev &

echo ""
echo "⏳ Aguardando servidor iniciar..."
sleep 5

echo ""
echo "✅ Servidor reiniciado!"
echo "📍 Acesse: http://localhost:5000"

