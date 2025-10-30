#!/bin/bash
set -e

# Script para restaurar o placeholder __VERSION__ após o build
# Isso permite que o próximo build funcione corretamente

SW_FILE="client/public/sw.js"

echo "🔄 Restaurando placeholder __VERSION__ no Service Worker..."

# Verificar se o arquivo existe
if [ ! -f "$SW_FILE" ]; then
  echo "❌ Erro: Arquivo $SW_FILE não encontrado"
  exit 1
fi

# Substituir versão por __VERSION__
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/const APP_VERSION = 'v[0-9]*';/const APP_VERSION = '__VERSION__';/g" "$SW_FILE"
else
  # Linux
  sed -i "s/const APP_VERSION = 'v[0-9]*';/const APP_VERSION = '__VERSION__';/g" "$SW_FILE"
fi

# Verificar se a restauração funcionou
if grep -q "__VERSION__" "$SW_FILE"; then
  echo "✅ Placeholder restaurado com sucesso"
else
  echo "❌ Erro: Falha ao restaurar placeholder"
  exit 1
fi
