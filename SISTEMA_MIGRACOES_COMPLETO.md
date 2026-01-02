# Sistema de Migrações - Guia Completo

## 🎯 Resumo

Foi implementado um **sistema completo de migrações** para prevenir problemas futuros de dessincronia entre código e base de dados.

---

## 📦 O que foi criado

### 1. **Script de Migração** (`scripts/migrate-runner.ts`)

Sistema robusto que:
- ✅ Cria tabela de controle de migrações (`migrations`)
- ✅ Rastreia quais migrações já foram aplicadas
- ✅ Executa migrações pendentes automaticamente
- ✅ Usa transações para segurança
- ✅ Ignora migrações já aplicadas
- ✅ Fornece rollback em caso de erro

### 2. **Comandos npm** (adicionados ao `package.json`)

```bash
# Executar todas as migrações pendentes
npm run db:migrate

# Ver status de todas as migrações
npm run db:migrate:status

# Listar migrações (alias para status)
npm run db:migrate:list
```

### 3. **Scripts de Wrapper**

- `scripts/migrate.sh` - Carrega variáveis de ambiente e executa migrações
- Scripts temporários para aplicação imediata da migração pendente

---

## 🚀 Como Usar

### **Aplicar Migrações Pendentes**

```bash
npm run db:migrate
```

**Saída esperada:**
```
✅ Conectado à base de dados

✅ Tabela de controle de migrações verificada

📋 Encontradas 1 migração(ões) pendente(s):

   - add_discount_to_orders.sql

🔄 Aplicando migração: add_discount_to_orders.sql
✅ Migração aplicada: add_discount_to_orders.sql

✨ Todas as 1 migrações foram aplicadas com sucesso!
```

### **Verificar Status**

```bash
npm run db:migrate:status
```

**Saída esperada:**
```
📋 Status das Migrações:

Status | Ficheiro
-------|------------------------------------------------------------
✅     | add_discount_to_orders.sql
✅     | 0001_printer_configurations.sql
⏳     | future_migration.sql

====================================================================
Total: 3 | Aplicadas: 2 | Pendentes: 1
```

---

## 🔧 Aplicar a Migração Pendente (add_discount_to_orders)

### **Método 1: Via Browser Console (Mais Fácil)** ⭐

1. Aceda ao painel admin do sistema
2. Faça login como **SuperAdmin**
3. Abra Developer Tools (F12)
4. Vá para a tab **Console**
5. Cole e execute:

```javascript
fetch('/api/admin/run-migration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ migrationName: 'add_discount_to_orders' })
})
.then(res => res.json())
.then(data => console.log('✅ Resultado:', data));
```

### **Método 2: Via Render Dashboard**

1. Aceda a [dashboard.render.com](https://dashboard.render.com)
2. Clique no seu serviço **PostgreSQL**
3. Clique em **Connect** → **PSQL Command** ou **External Connection**
4. No Shell, cole o SQL:

```sql
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT '0',
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'valor';

CREATE INDEX IF NOT EXISTS idx_orders_discount 
ON orders(discount) WHERE discount > 0;
```

### **Método 3: Via psql Local**

Se tiver `psql` instalado e a `DATABASE_URL`:

```bash
psql "$DATABASE_URL" -f server/migrations/add_discount_to_orders.sql
```

### **Método 4: Via npm (Quando DATABASE_URL disponível)**

```bash
DATABASE_URL="sua-connection-string" npm run db:migrate
```

---

## 📝 Criar Novas Migrações

### 1. Criar o ficheiro SQL

```bash
touch server/migrations/YYYY-MM-DD_descricao.sql
```

**Exemplo:** `server/migrations/2026-01-02_add_user_preferences.sql`

### 2. Escrever o SQL

```sql
-- Migration: Add user preferences
-- Description: Adds preferences column to users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_users_preferences 
ON users USING gin(preferences);

COMMENT ON COLUMN users.preferences IS 'User preferences in JSON format';
```

### 3. Atualizar o Schema TypeScript

Edite `shared/schema.ts`:

```typescript
export const users = pgTable("users", {
  // ... outras colunas
  preferences: json("preferences").default({}),
});
```

### 4. Aplicar a migração

```bash
npm run db:migrate
```

---

## 🎨 Boas Práticas

### ✅ DO

- ✅ Use `IF NOT EXISTS` para evitar erros em re-execuções
- ✅ Adicione comentários explicativos no SQL
- ✅ Nomeie ficheiros com data: `YYYY-MM-DD_descricao.sql`
- ✅ Teste migrações em ambiente de desenvolvimento primeiro
- ✅ Mantenha migrações pequenas e focadas
- ✅ Adicione índices para colunas consultadas frequentemente
- ✅ Use valores DEFAULT sensatos

### ❌ DON'T

- ❌ Não delete ficheiros de migração já aplicados
- ❌ Não modifique migrações já aplicadas em produção
- ❌ Não use `DROP` sem backup
- ❌ Não faça migrações irreversíveis sem plano de rollback

---

## 🐛 Troubleshooting

### **Erro: "DATABASE_URL não está definida"**

**Solução:**
```bash
# Verificar se a variável existe
echo $DATABASE_URL

# Se não existir, configurar
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# Ou usar um dos métodos alternativos (Browser Console, Render Dashboard)
```

### **Erro: "Migration file not found"**

**Solução:**
- Verifique se o ficheiro existe em `server/migrations/`
- Confirme que o nome está correto (sem extensão no comando)

### **Erro: "already exists"**

**Não é um erro!** A migração já foi aplicada. O sistema ignora automaticamente.

### **Tabela `migrations` não existe**

O sistema cria automaticamente na primeira execução.

---

## 📊 Estrutura da Tabela de Controle

```sql
CREATE TABLE migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checksum VARCHAR(64)
);
```

---

## 🔄 Workflow de Desenvolvimento

### **Antes de fazer deploy:**

1. ✅ Atualizar schema (`shared/schema.ts`)
2. ✅ Criar migração SQL (`server/migrations/`)
3. ✅ Testar localmente
4. ✅ Commit e push
5. ✅ Executar migração em produção
6. ✅ Fazer deploy do código

### **Após deploy:**

```bash
# Em produção, executar:
npm run db:migrate

# Ou via browser console com o código fornecido
```

---

## 📚 Ficheiros Relacionados

- `scripts/migrate-runner.ts` - Script principal de migração
- `scripts/migrate.sh` - Wrapper com suporte a variáveis de ambiente
- `package.json` - Comandos npm
- `server/migrations/` - Directório de migrações SQL
- `FIX_DISCOUNT_COLUMN_ERROR.md` - Documentação específica do problema atual
- `DISCOUNT_COLUMN_FIX_SUMMARY.md` - Resumo da correção

---

## ✨ Próximos Passos

### **Imediato (URGENTE):**
1. 🔴 **Aplicar a migração pendente** `add_discount_to_orders.sql`
   - Use um dos 4 métodos descritos acima
   - Isto resolverá os erros "column discount does not exist"

### **Curto Prazo:**
2. ✅ Criar script de CI/CD que execute migrações automaticamente
3. ✅ Adicionar validação que compara schema vs BD antes de deploy

### **Médio Prazo:**
4. ✅ Migrar para Drizzle Kit com `drizzle-kit generate` + `drizzle-kit migrate`
5. ✅ Implementar sistema de rollback de migrações

---

## 🎉 Benefícios do Sistema

- ✅ **Prevenção de erros** como o atual
- ✅ **Rastreabilidade** de mudanças na BD
- ✅ **Automatização** do processo
- ✅ **Segurança** com transações
- ✅ **Facilidade** de manutenção
- ✅ **Documentação** integrada

---

**Status Atual:** ✅ Sistema implementado | ⏳ Migração pendente de aplicação

**Criado:** 2026-01-01  
**Autor:** Rovo Dev
