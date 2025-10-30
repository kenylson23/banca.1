# Como corrigir o problema de slugs duplicados

## Problema
O sistema está tentando adicionar uma constraint de unicidade na coluna `slug` da tabela `restaurants`, mas existem restaurantes sem slug (NULL) ou com slugs duplicados.

## Solução

### Opção 1: Executar via interface do Replit (Recomendado)

1. Abra a aba "Database" no Replit
2. Clique em "Query" ou "Console"
3. Cole o conteúdo do arquivo `scripts/fix-restaurant-slugs.sql`
4. Execute o script
5. Depois execute: `npm run db:push --force`

### Opção 2: Via linha de comando

Se você tiver acesso ao terminal psql:

```bash
# Execute o script de correção
psql $DATABASE_URL -f scripts/fix-restaurant-slugs.sql

# Depois aplique a migração do schema
npm run db:push --force
```

### Opção 3: Atualização manual via interface web

Se preferir atualizar manualmente cada restaurante:

1. Acesse a página de configurações (/settings) como admin de cada restaurante
2. Configure um slug único para cada restaurante
3. Depois execute: `npm run db:push --force`

## Verificação

Após aplicar a correção, verifique:

```sql
-- Ver todos os restaurantes e seus slugs
SELECT id, name, slug FROM restaurants ORDER BY created_at;

-- Verificar se ainda há slugs nulos
SELECT COUNT(*) FROM restaurants WHERE slug IS NULL;

-- Verificar se há slugs duplicados
SELECT slug, COUNT(*) as count 
FROM restaurants 
GROUP BY slug 
HAVING COUNT(*) > 1;
```

## O que foi corrigido no código

1. **Geração automática de slugs**: Agora quando um restaurante é criado, um slug único é gerado automaticamente baseado no nome
2. **Validação de unicidade**: O sistema garante que não haverá slugs duplicados
3. **Menu público sincronizado**: O botão "Visualizar Menu Público" agora usa o slug correto

## Próximos passos após a correção

1. Execute `npm run db:push --force` para aplicar a constraint de unicidade
2. Reinicie a aplicação
3. Teste criando um novo restaurante e verificando se o slug é gerado automaticamente
4. Teste o link público do menu
