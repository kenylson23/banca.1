import pg from "pg";

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL não está configurada.");
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function ensureTableSessionColumns() {
  await client.connect();
  await client.query("BEGIN");

  try {
    await client.query(`
      ALTER TABLE public.table_sessions
        ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'valor',
        ADD COLUMN IF NOT EXISTS service_charge DECIMAL(10, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS service_charge_type VARCHAR(20) DEFAULT 'percentual';
    `);

    await client.query("COMMIT");
    console.log(
      "Schema verificado: colunas de desconto e taxa da sessão estão disponíveis.",
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

ensureTableSessionColumns().catch((error) => {
  console.error("Falha ao atualizar as colunas de table_sessions:", error.message);
  process.exit(1);
});