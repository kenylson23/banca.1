#!/bin/bash
set -e

# Script para atualizar a versão do Service Worker antes do build
# Este script substitui __VERSION__ por um timestamp único

VERSION="v$(date +%s)"
SW_FILE="client/public/sw.js"

echo "🔄 Atualizando versão do Service Worker para: $VERSION"

# Verificar se o arquivo sw.js existe
if [ ! -f "$SW_FILE" ]; then
  echo "❌ Erro: Arquivo $SW_FILE não encontrado"
  exit 1
fi

# Verificar se o placeholder existe
if ! grep -q "__VERSION__" "$SW_FILE"; then
  echo "❌ Erro: Placeholder __VERSION__ não encontrado em $SW_FILE"
  echo "⚠️  O arquivo já foi processado. Restaure o placeholder antes de executar."
  exit 1
fi

# Substituir __VERSION__ pelo timestamp
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/__VERSION__/$VERSION/g" "$SW_FILE"
else
  # Linux
  sed -i "s/__VERSION__/$VERSION/g" "$SW_FILE"
fi

# Verificar se a substituição funcionou
if grep -q "__VERSION__" "$SW_FILE"; then
  echo "❌ Erro: Falha ao substituir __VERSION__ em $SW_FILE"
  exit 1
fi

echo "✅ Service Worker atualizado com versão $VERSION"

# Criar diretório se não existir
mkdir -p dist/public

# Criar arquivo version.txt
echo "📝 Versão: $VERSION" > dist/public/version.txt

# Criar arquivo version.json
cat > dist/public/version.json << EOF
{
  "version": "$VERSION",
  "buildTime": $(date +%s),
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "✅ Arquivo version.json criado"
echo ""
echo "⚠️  IMPORTANTE: Após o build, restaure o placeholder com:"
echo "   ./scripts/restore-version-placeholder.sh"
