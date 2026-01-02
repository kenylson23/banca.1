#!/bin/bash
# Wrapper script para executar migrações com variáveis de ambiente

# Carrega as variáveis de ambiente do Replit
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Exporta variáveis do Replit Secrets se existirem
if [ ! -z "$REPLIT_DB_URL" ]; then
  export DATABASE_URL="$REPLIT_DB_URL"
fi

# Verifica se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
  # Tenta construir da configuração PG
  if [ ! -z "$PGHOST" ] && [ ! -z "$PGUSER" ] && [ ! -z "$PGDATABASE" ]; then
    if [ -z "$PGPASSWORD" ]; then
      echo "⚠️  PGPASSWORD não está definida"
    fi
    export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT:-5432}/${PGDATABASE}"
  fi
fi

# Executa o comando de migração
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Erro: DATABASE_URL não está configurada"
  echo ""
  echo "Configure uma das seguintes opções:"
  echo "  1. Defina DATABASE_URL nas Secrets do Replit"
  echo "  2. Defina PGHOST, PGUSER, PGPASSWORD, PGDATABASE"
  echo "  3. Execute: export DATABASE_URL='sua-connection-string'"
  exit 1
fi

# Executa o script de migração com as variáveis carregadas
tsx scripts/migrate-runner.ts "$@"
