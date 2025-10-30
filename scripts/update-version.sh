#!/bin/bash

# Script para atualizar a versão do Service Worker antes do build
# Este script substitui __VERSION__ por um timestamp único

VERSION="v$(date +%s)"
SW_FILE="client/public/sw.js"

echo "🔄 Atualizando versão do Service Worker para: $VERSION"

# Substituir __VERSION__ pelo timestamp
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/__VERSION__/$VERSION/g" "$SW_FILE"
else
  # Linux
  sed -i "s/__VERSION__/$VERSION/g" "$SW_FILE"
fi

echo "✅ Service Worker atualizado com versão $VERSION"
echo "📝 Versão: $VERSION" > dist/public/version.txt

# Criar diretório se não existir
mkdir -p dist/public

# Criar arquivo version.json
cat > dist/public/version.json << EOF
{
  "version": "$VERSION",
  "buildTime": $(date +%s),
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "✅ Arquivo version.json criado"
