# Como Corrigir o Problema de Slugs Duplicados

## O Problema
O sistema está tentando adicionar uma restrição de unicidade na coluna `slug` da tabela `restaurants`, mas existem restaurantes sem slug (NULL), causando o erro de migração.

## Solução Rápida (3 passos simples)

### Passo 1: Executar a Correção Automática

Abra o terminal e execute este comando:

```bash
curl -X POST http://localhost:5000/api/debug/fix-slugs
```

Ou use este comando no navegador (cole na barra de endereços quando a aplicação estiver rodando):
```
http://localhost:5000/api/debug/fix-slugs
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "3 restaurante(s) atualizado(s) com slugs únicos",
  "updated": [
    "Restaurante ABC → restaurante-abc",
    "Pizzaria XYZ → pizzaria-xyz",
    "Café Exemplo → cafe-exemplo"
  ]
}
```

### Passo 2: Aplicar a Migração do Schema

Depois que todos os restaurantes tiverem slugs, execute:

```bash
npm run db:push --force
```

**Nota:** O `--force` é necessário porque o Drizzle detectou mudanças no schema que requerem confirmação.

### Passo 3: Reiniciar a Aplicação

Após a migração bem-sucedida, reinicie a aplicação para garantir que tudo está funcionando:

```bash
# A aplicação reiniciará automaticamente se você estiver usando npm run dev
```

## Verificação

Após completar os passos acima:

1. ✅ Faça login na aplicação como admin
2. ✅ Vá para a página "Menu" 
3. ✅ Clique no botão "Visualizar Menu Público"
4. ✅ Verifique se o menu público abre corretamente com o slug do seu restaurante

## O Que Foi Corrigido

### 1. Geração Automática de Slugs
Agora quando um novo restaurante é criado, o sistema:
- Gera automaticamente um slug baseado no nome do restaurante
- Garante que o slug é único
- Remove caracteres especiais e acentos
- Converte para minúsculas

**Exemplo:**
- Nome: "Pizzaria Dona Maria" → Slug: "pizzaria-dona-maria"
- Nome: "Café & Cia" → Slug: "cafe-cia"

### 2. Link Público Sincronizado
O botão "Visualizar Menu Público" na página de Menu agora:
- Usa o slug correto do restaurante
- Abre o link público `/r/seu-slug`
- Mostra mensagem de erro se o slug não estiver configurado

### 3. Validação de Unicidade
O sistema agora:
- Valida que cada slug é único no banco de dados
- Adiciona um número ao final se houver conflito (ex: "pizzaria-1", "pizzaria-2")

## Problemas Comuns

### "Erro: Cannot read properties of null"
**Solução:** Certifique-se de que a aplicação está rodando antes de executar o comando do Passo 1.

### "404 Not Found" ao chamar /api/debug/fix-slugs
**Solução:** Este endpoint só funciona em desenvolvimento. Se estiver em produção, você precisa:
1. Adicionar a variável de ambiente `DEBUG_AUTH=true`
2. OU executar o script SQL manual em `scripts/fix-restaurant-slugs.sql`

### Erro de migração persiste após o Passo 2
**Solução:** Verifique se todos os restaurantes têm slugs executando:
```bash
curl http://localhost:5000/api/debug/fix-slugs
```

Se ainda houver restaurantes sem slug, execute o Passo 1 novamente.

## Próximos Passos

Após resolver o problema de migração:

1. **Novos Restaurantes:** Terão slugs gerados automaticamente
2. **Link Público:** Cada restaurante pode compartilhar seu link `/r/seu-slug` com clientes
3. **Personalização:** Admins podem alterar o slug em Configurações se desejarem

## Suporte

Se encontrar algum problema, verifique os logs:
- Logs do servidor no terminal
- Console do navegador (F12 → Console)
- Endpoint de saúde: `http://localhost:5000/api/debug/health`
