# 🧪 GUIA DE TESTES - LIMITAÇÃO DE PLANOS

## 📋 Pré-requisitos

1. ✅ Banco de dados atualizado (script executado)
2. ✅ Aplicação rodando localmente ou em staging
3. ✅ Acesso a 3 restaurantes com planos diferentes (ou criar novos)

---

## 🎯 CENÁRIO 1: Plano Básico (15.000 Kz/mês)

### Preparação:
```bash
# Criar restaurante com plano Básico
# OU modificar restaurante existente para usar plano Básico
```

### Testes de Acesso:

#### ✅ Deve PERMITIR acesso a:
- [ ] `/` - Dashboard principal
- [ ] `/pdv` - Ponto de Venda
- [ ] `/tables` - Gestão de Mesas
- [ ] `/menu` - Menu Digital
- [ ] `/orders` - Pedidos
- [ ] `/kitchen` - Cozinha
- [ ] `/reports` - Relatórios Básicos
- [ ] `/settings` - Configurações

#### ❌ Deve BLOQUEAR com tela elegante:
- [ ] `/customers` - Gestão de Clientes
  - Verifica: Ícone amarelo de cadeado
  - Verifica: Mensagem "não está disponível no plano Básico"
  - Verifica: Sugere "Profissional ou superior"
  - Verifica: Lista 4 benefícios
  - Verifica: Botão "Fazer Upgrade"

- [ ] `/loyalty` - Programa de Fidelidade
  - Verifica: Ícone roxo de cadeado
  - Verifica: Mensagem clara sobre o plano
  - Verifica: Benefícios: Pontos, Recompensas, Níveis, Relatórios

- [ ] `/coupons` - Sistema de Cupons
  - Verifica: Ícone laranja de cadeado
  - Verifica: Benefícios: Cupons personalizados, Campanhas, Controle, Performance

- [ ] `/inventory` - Módulo de Inventário
  - Verifica: Ícone azul de cadeado
  - Verifica: Benefícios: Controle de estoque, Alertas, Transferências, Custos

#### 🧪 Testes de API (via DevTools):
```javascript
// Tentar criar cliente via API (deve retornar 403)
fetch('/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Teste Cliente',
    phone: '912345678'
  })
}).then(r => r.json()).then(console.log);
// Esperado: 
// { 
//   message: "A gestão de clientes não está disponível...",
//   code: "FEATURE_NOT_AVAILABLE",
//   upgradeRequired: true
// }
```

---

## 🎯 CENÁRIO 2: Plano Profissional (35.000 Kz/mês)

### Preparação:
```bash
# Criar restaurante com plano Profissional
```

### Testes de Acesso:

#### ✅ Deve PERMITIR acesso a:
- [ ] Todas as páginas do Plano Básico +
- [ ] `/customers` - Gestão de Clientes (até 200)
- [ ] `/loyalty` - Programa de Fidelidade
- [ ] `/coupons` - Sistema de Cupons (até 50 ativos)
- [ ] Gestão de Despesas (se tiver a página)

#### ❌ Deve BLOQUEAR:
- [ ] `/inventory` - Módulo de Inventário
  - Verifica: Tela de bloqueio aparece
  - Verifica: Sugere "Empresarial ou superior"

#### 🧪 Testes de Funcionalidade:

**Clientes:**
```javascript
// Criar cliente (deve funcionar)
fetch('/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Cliente Profissional',
    phone: '923456789',
    email: 'teste@exemplo.com'
  })
}).then(r => r.json()).then(console.log);
// Esperado: { id: "...", name: "Cliente Profissional", ... }
```

**Limite de Clientes:**
- [ ] Criar 200 clientes
- [ ] Tentar criar o 201º (deve falhar com limite atingido)
- [ ] Verificar mensagem: "permite até 200 clientes"

**Cupons:**
- [ ] Criar cupom (deve funcionar)
- [ ] Criar 50 cupons ativos
- [ ] Tentar criar o 51º (deve falhar)

**Fidelidade:**
- [ ] Configurar programa de pontos
- [ ] Adicionar pontos a cliente
- [ ] Resgatar pontos

---

## 🎯 CENÁRIO 3: Plano Empresarial (70.000 Kz/mês)

### Testes de Acesso:

#### ✅ Deve PERMITIR acesso a TUDO:
- [ ] Todas as páginas do Profissional +
- [ ] `/inventory` - Módulo de Inventário (até 5000 itens)
- [ ] Transferências de estoque entre filiais

#### 🧪 Testes de Funcionalidade:

**Inventário:**
```javascript
// Criar item de inventário (deve funcionar)
fetch('/api/inventory/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Produto Teste',
    sku: 'TEST-001',
    unitPrice: '1000'
  })
}).then(r => r.json()).then(console.log);
```

**Limites Aumentados:**
- [ ] Verificar limite de clientes: 1000
- [ ] Verificar limite de cupons: 200
- [ ] Verificar limite de itens inventário: 5000

---

## 🎯 CENÁRIO 4: Plano Enterprise (150.000 Kz/mês)

### Testes:

#### ✅ Deve ter TUDO ILIMITADO:
- [ ] Criar mais de 1000 clientes
- [ ] Criar mais de 200 cupons
- [ ] Criar mais de 5000 itens de inventário
- [ ] Nenhuma restrição deve aparecer

---

## 📊 CHECKLIST GERAL DE UX

Para cada tela de bloqueio, verificar:

### Design:
- [ ] Ícone de cadeado visível e colorido
- [ ] Cores corretas (amarelo/roxo/laranja/azul)
- [ ] Animação smooth (fade in + scale)
- [ ] Layout responsivo (mobile + desktop)

### Conteúdo:
- [ ] Nome do plano atual mostrado
- [ ] Plano necessário indicado claramente
- [ ] 4 benefícios listados com ícones
- [ ] Descrições curtas e claras

### Ações:
- [ ] Botão "Fazer Upgrade" funciona → vai para `/subscription`
- [ ] Botão "Voltar" funciona → volta para página anterior
- [ ] Mensagens de erro no console (DevTools) são claras

### Performance:
- [ ] Página carrega rápido
- [ ] Não há erros no console
- [ ] Query de subscription cacheia corretamente

---

## 🐛 TROUBLESHOOTING

### Problema: Tela de bloqueio não aparece

**Verificar:**
```javascript
// No console do navegador
fetch('/api/subscription')
  .then(r => r.json())
  .then(console.log);

// Deve retornar:
// {
//   plan: {
//     name: "...",
//     hasLoyaltyProgram: 0/1,
//     hasCouponSystem: 0/1,
//     ...
//   }
// }
```

**Se plan está vazio:**
- Script SQL não foi executado
- Execute: `npx tsx scripts/apply-plan-updates.ts`

### Problema: API retorna 500 ao invés de 403

**Verificar logs do servidor:**
- Erro em `checkCanAddCustomer`?
- Flags do plano estão corretas no banco?

### Problema: Mensagens genéricas de erro

**Verificar:**
- `planLimits.ts` tem as verificações corretas?
- `routes.ts` está tratando PlanFeatureError?

---

## 📸 SCREENSHOTS RECOMENDADOS

Tirar screenshots de:
1. ✅ Tela de bloqueio - Clientes (amarelo)
2. ✅ Tela de bloqueio - Fidelidade (roxo)
3. ✅ Tela de bloqueio - Cupons (laranja)
4. ✅ Tela de bloqueio - Inventário (azul)
5. ✅ Página de subscription mostrando comparação de planos
6. ✅ Erro 403 no DevTools Network tab

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

### Backend:
- [x] Flags dos planos atualizadas no banco
- [ ] API retorna 403 com mensagem clara
- [ ] Código de erro estruturado (FEATURE_NOT_AVAILABLE)
- [ ] Logs no servidor são informativos

### Frontend:
- [ ] 4 páginas com bloqueio implementado
- [ ] Telas de bloqueio são bonitas e claras
- [ ] Botões funcionam corretamente
- [ ] Sem erros no console
- [ ] Performance OK (< 1s para carregar)

### UX:
- [ ] Usuário entende qual plano tem
- [ ] Usuário sabe o que precisa fazer (upgrade)
- [ ] Benefícios são atraentes
- [ ] Call-to-action é claro

---

## 📝 RELATÓRIO DE TESTE

Após concluir os testes, preencher:

**Data:** ___/___/______
**Testador:** ___________
**Ambiente:** [ ] Local [ ] Staging [ ] Produção

**Resumo:**
- Testes executados: __ / 50
- Testes passou: __
- Testes falhou: __
- Bugs encontrados: __

**Bugs/Issues:**
1. 
2. 
3. 

**Observações:**


**Status Final:** [ ] ✅ Aprovado [ ] ⚠️ Com ressalvas [ ] ❌ Reprovado
