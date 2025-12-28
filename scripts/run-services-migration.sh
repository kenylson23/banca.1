#!/bin/bash

# Script para executar a migration de serviços e taxas
# Usage: ./scripts/run-services-migration.sh

echo "🚀 Executando migration de Serviços e Taxas..."
echo "================================================"
echo ""

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL não está configurada"
    echo ""
    echo "Por favor, configure a variável de ambiente DATABASE_URL:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database'"
    echo ""
    exit 1
fi

echo "📋 Criando tabelas e enums..."
psql $DATABASE_URL -f server/migrations/0002_create_services_tables.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration executada com sucesso!"
    echo ""
    echo "📊 Próximos passos:"
    echo "1. Acesse /services no admin"
    echo "2. Cadastre seus serviços (ex: Taxa de Garçom, Couvert)"
    echo "3. Use no checkout - aparecerão automaticamente no Step 3"
    echo ""
else
    echo ""
    echo "❌ Erro ao executar migration"
    echo "Verifique a conexão com o banco de dados"
    echo ""
    exit 1
fi
