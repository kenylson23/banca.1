# Correção: Colunas billing_period ausentes

## Problema
```
error: column "billing_period_start" does not exist
```

## Causa
A tabela `subscription_payments` não tem as colunas `billing_period_start` e `billing_period_end`.

## Solução Automática

A migration já foi criada em `server/migrations/add_billing_period_columns.sql`.

### Método 1: Reiniciar o Servidor (Mais Simples)
```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm run dev
```

O auto-migrate vai detectar e aplicar a migration automaticamente.

### Método 2: Executar via API (Se servidor já estiver rodando)
```bash
curl -X POST http://localhost:5000/api/internal/run-migrations
```

### Método 3: Forçar no banco diretamente
Se você tem acesso ao PostgreSQL:
```bash
psql $DATABASE_URL -f server/migrations/add_billing_period_columns.sql
```

## Verificar se funcionou
Após aplicar, você NÃO deve mais ver o erro no console do servidor.

## Próximos Passos
Depois de corrigir isso, volte a testar o pagamento individual seguindo o `GUIA_DEBUG_PAGAMENTO_STEP.md`.
