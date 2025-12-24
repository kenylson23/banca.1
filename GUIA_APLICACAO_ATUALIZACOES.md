# 🚀 GUIA DE APLICAÇÃO DAS ATUALIZAÇÕES

## 📦 PASSO 1: Atualizar Banco de Dados

Você tem **3 opções** para atualizar o banco:

---

### OPÇÃO A: Via Render/Railway Dashboard (RECOMENDADO para produção)

1. **Acesse o dashboard do seu banco de dados**
   - Render: Database → Connect → Shell
   - Railway: PostgreSQL → Query

2. **Execute este SQL:**

```sql
-- Atualizar Plano Básico
UPDATE subscription_plans
SET 
  max_customers = 50,
  has_loyalty_program = 0,
  max_active_coupons = 0,
  has_coupon_system = 0,
  has_expense_tracking = 0,
  max_expense_categories = 0,
  has_inventory_module = 0,
  max_inventory_items = 0,
  has_stock_transfers = 0
WHERE slug = 'basico';

-- Atualizar Plano Profissional
UPDATE subscription_plans
SET 
  max_customers = 200,
  has_loyalty_program = 1,
  max_active_coupons = 50,
  has_coupon_system = 1,
  has_expense_tracking = 1,
  max_expense_categories = 50,
  has_inventory_module = 0,
  max_inventory_items = 0,
  has_stock_transfers = 0
WHERE slug = 'profissional';

-- Atualizar Plano Empresarial
UPDATE subscription_plans
SET 
  max_customers = 1000,
  has_loyalty_program = 1,
  max_active_coupons = 200,
  has_coupon_system = 1,
  has_expense_tracking = 1,
  max_expense_categories = 200,
  has_inventory_module = 1,
  max_inventory_items = 5000,
  has_stock_transfers = 1
WHERE slug = 'empresarial';

-- Atualizar Plano Enterprise
UPDATE subscription_plans
SET 
  max_customers = 999999,
  has_loyalty_program = 1,
  max_active_coupons = 999999,
  has_coupon_system = 1,
  has_expense_tracking = 1,
  max_expense_categories = 999999,
  has_inventory_module = 1,
  max_inventory_items = 999999,
  has_stock_transfers = 1
WHERE slug = 'enterprise';

-- Verificar resultados
SELECT 
  name,
  slug,
  max_customers,
  has_loyalty_program,
  has_coupon_system,
  has_expense_tracking,
  has_inventory_module,
  has_stock_transfers
FROM subscription_plans
ORDER BY display_order;
```

3. **Verificar saída:**
   - Deve mostrar 4 linhas (os 4 planos)
   - Básico: tudo 0
   - Profissional: loyalty, coupons, expenses = 1
   - Empresarial: tudo do Prof + inventory = 1
   - Enterprise: tudo 1

---

### OPÇÃO B: Via psql (linha de comando)

```bash
# 1. Exportar variável de ambiente
export DATABASE_URL="sua_connection_string_aqui"

# 2. Executar SQL via arquivo
psql $DATABASE_URL -f scripts/update-existing-plans.sql

# OU executar script TypeScript
npx tsx scripts/apply-plan-updates.ts
```

---

### OPÇÃO C: Desenvolvimento Local

```bash
# 1. Certifique-se que .env existe com DATABASE_URL
cat .env | grep DATABASE_URL

# 2. Execute o script
npx tsx scripts/apply-plan-updates.ts

# OU reinicie o banco local
npm run db:push
# E depois inicie o servidor (ele vai recriar os planos)
npm run dev
```

---

## ✅ VERIFICAÇÃO PÓS-ATUALIZAÇÃO

Execute esta query para confirmar:

```sql
SELECT 
  name,
  max_customers,
  has_loyalty_program,
  has_coupon_system,
  has_inventory_module
FROM subscription_plans
ORDER BY display_order;
```

**Resultado esperado:**

| name          | max_customers | loyalty | coupons | inventory |
|---------------|---------------|---------|---------|-----------|
| Básico        | 50            | 0       | 0       | 0         |
| Profissional  | 200           | 1       | 1       | 0         |
| Empresarial   | 1000          | 1       | 1       | 1         |
| Enterprise    | 999999        | 1       | 1       | 1         |

---

## 🧪 PASSO 2: Executar Testes

Agora siga o guia: **`scripts/test-plan-limits.md`**

### Teste Rápido (5 minutos):

1. **Faça login com restaurante no Plano Básico**
   
2. **Tente acessar `/customers`**
   - ✅ Deve mostrar tela de bloqueio amarela
   - ✅ Mensagem: "não está disponível no plano Básico"
   - ✅ Botão "Fazer Upgrade"

3. **Tente acessar `/loyalty`**
   - ✅ Deve mostrar tela de bloqueio roxa

4. **Tente acessar `/coupons`**
   - ✅ Deve mostrar tela de bloqueio laranja

5. **Tente acessar `/inventory`**
   - ✅ Deve mostrar tela de bloqueio azul

6. **Teste acesso permitido:**
   - ✅ `/pdv` deve funcionar normalmente
   - ✅ `/tables` deve funcionar
   - ✅ `/menu` deve funcionar

---

### Teste Completo (30 minutos):

Siga **TODO** o checklist em `scripts/test-plan-limits.md`

---

## 🐛 TROUBLESHOOTING

### ❌ Tela de bloqueio não aparece

**Causa:** Banco não foi atualizado

**Solução:**
```bash
# Verificar via API
curl -X GET https://seu-app.com/api/subscription \
  -H "Cookie: connect.sid=seu_cookie"

# Deve retornar plan.hasLoyaltyProgram = 0 para Básico
```

Se retornar null ou undefined:
- Execute novamente o SQL de atualização
- Reinicie o servidor

---

### ❌ Erro 500 ao acessar páginas

**Causa:** Colunas ainda não existem no banco

**Solução:**
```sql
-- Verificar se colunas existem
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'subscription_plans' 
  AND column_name LIKE 'has_%';

-- Deve retornar:
-- has_loyalty_program
-- has_coupon_system
-- has_expense_tracking
-- has_inventory_module
-- has_stock_transfers
```

Se não existirem, execute a migração:
```bash
npm run db:push
```

---

### ❌ Mensagens genéricas de erro

**Causa:** Cache antigo

**Solução:**
1. Limpar cache do navegador (Ctrl+Shift+R)
2. Limpar cache do servidor se houver
3. Reiniciar aplicação

---

## 📝 CHECKLIST FINAL

Antes de considerar concluído:

- [ ] SQL executado com sucesso
- [ ] Verificação retornou valores corretos
- [ ] Teste rápido passou (5 min)
- [ ] Telas de bloqueio aparecem corretamente
- [ ] Botões funcionam
- [ ] Sem erros no console
- [ ] Pronto para produção!

---

## 🚀 DEPLOY

Após testar em desenvolvimento/staging:

```bash
git add .
git commit -m "feat: adicionar bloqueio de UI e corrigir limites de planos

- Corrigido seed dos planos com flags corretas
- Adicionado bloqueio elegante em loyalty, coupons, inventory
- Script SQL para atualizar planos existentes
- Guias de teste completos"

git push origin main
```

---

## 📞 SUPORTE

Se encontrar problemas:

1. Verifique logs do servidor
2. Verifique console do navegador
3. Execute queries de verificação
4. Consulte `scripts/test-plan-limits.md`

---

## ✨ RECURSOS CRIADOS

- ✅ `server/initDb.ts` - Seed corrigido
- ✅ `client/src/pages/loyalty.tsx` - Bloqueio adicionado
- ✅ `client/src/pages/coupons.tsx` - Bloqueio adicionado
- ✅ `client/src/pages/inventory.tsx` - Bloqueio adicionado
- ✅ `scripts/update-existing-plans.sql` - SQL standalone
- ✅ `scripts/apply-plan-updates.ts` - Script TypeScript
- ✅ `scripts/test-plan-limits.md` - Guia de testes
- ✅ `GUIA_APLICACAO_ATUALIZACOES.md` - Este guia

