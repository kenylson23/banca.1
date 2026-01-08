# 🔍 Análise de Conflitos UX - Sistema de Descontos

## 📊 Fluxo Atual Identificado

### Fontes de Dados para Descontos
1. **URL Parameters** (`?discount=X&discountType=Y`)
2. **Estado Local React** (`discountValue`, `discountType`)
3. **Sessão do Banco de Dados** (`table_sessions.discount`)

---

## ⚠️ CONFLITOS CRÍTICOS IDENTIFICADOS

### 🔴 **CONFLITO #1: Limpeza Automática no Step 1**
**Localização:** `table-checkout-v2.tsx`, linhas 131-138

```tsx
if (currentStep === 1) {
  setDiscountValue('');
  setManualServiceValue('');
  setAppliedCoupon(null);
  setLoyaltyPointsToRedeem('');
}
```

**Problema:**
- ❌ Quando o usuário volta ao Step 1, TODOS os descontos são limpos do estado local
- ❌ Mas continuam salvos no banco de dados!
- ❌ Cria inconsistência entre UI e dados reais

**Cenário Real:**
1. Usuário aplica 10% de desconto no Step 3
2. Avança para Step 4
3. Volta para Step 1 para revisar os itens
4. ❌ Desconto desaparece da UI
5. ✅ Mas está salvo no banco
6. Avança novamente para Step 3
7. ✅ Desconto reaparece (restaurado da sessão)

**Impacto UX:** ⚠️ CONFUSÃO SEVERA - O usuário não sabe se o desconto está ou não aplicado

---

### 🟡 **CONFLITO #2: Restauração Condicional (Step > 1)**
**Localização:** `table-checkout-v2.tsx`, linhas 175-199

```tsx
if (table?.currentSessionId && tablesData && currentStep > 1) {
  // Restaura descontos da sessão
}
```

**Problema:**
- ⚠️ Descontos só são restaurados se `currentStep > 1`
- ⚠️ Mas são limpos quando volta ao Step 1
- ⚠️ Ciclo vicioso de limpar/restaurar

**Cenário Real:**
1. Usuário recarrega a página no Step 1
2. ❌ Descontos NÃO são restaurados (porque está no Step 1)
3. Usuário avança para Step 2
4. ✅ Agora os descontos são restaurados
5. Volta ao Step 1
6. ❌ Descontos são limpos novamente

**Impacto UX:** ⚠️ COMPORTAMENTO IMPREVISÍVEL

---

### 🟠 **CONFLITO #3: Três Fontes de Verdade**
**Problema:**
- 📌 URL tem desconto
- 📌 Estado React tem desconto
- 📌 Banco de dados tem desconto
- ❓ Qual é a fonte da verdade?

**Ordem de Prioridade Atual:**
1. URL inicializa o estado (linha 120)
2. Sessão sobrescreve se `currentStep > 1` (linha 178)
3. Auto-save salva no banco com debounce (linha 202-220)

**Cenário de Conflito:**
1. URL diz: `discount=50&discountType=valor`
2. Banco diz: `discount=100&discountType=percentual`
3. ❓ Qual prevalece?
   - Se Step 1: URL prevalece
   - Se Step 2-4: Banco prevalece (sobrescreve)

**Impacto UX:** ⚠️ RESULTADOS INCONSISTENTES baseados no step

---

### 🟡 **CONFLITO #4: Salvamento com Debounce vs Navegação**
**Localização:** `table-checkout-v2.tsx`, linhas 202-220

**Problema:**
- Desconto é salvo após 1 segundo de inatividade
- ❌ Se usuário digitar desconto e imediatamente voltar ao Step 1...
- ❌ Desconto pode ser limpo ANTES de ser salvo no banco!

**Cenário Real:**
1. Step 3: Usuário digita "50" no campo de desconto
2. **Imediatamente** clica "Voltar" para Step 1
3. ❌ `setDiscountValue('')` é executado (linha 134)
4. ❌ Debounce é cancelado (linha 218: `clearTimeout`)
5. ❌ Desconto NUNCA é salvo no banco!

**Impacto UX:** 🔴 PERDA DE DADOS CRÍTICA

---

### 🟠 **CONFLITO #5: Recarregar Página em Steps Diferentes**

#### Cenário A: Recarregar no Step 1
- ✅ URL restaura desconto inicial
- ❌ Sessão NÃO restaura (porque Step 1)
- ❌ Se havia desconto salvo na sessão, é IGNORADO

#### Cenário B: Recarregar no Step 3
- ✅ URL restaura desconto
- ✅ Sessão também restaura
- ⚠️ Qual prevalece? (Sessão sobrescreve URL)

#### Cenário C: Recarregar sem URL params
- ❌ Step 1: Desconto zerado (mesmo se salvo no banco)
- ✅ Step 2-4: Desconto restaurado do banco

**Impacto UX:** ⚠️ COMPORTAMENTO DEPENDENTE DO CONTEXTO

---

### 🟡 **CONFLITO #6: Aplicação no Pagamento vs Sessão**
**Localização:** `server/routes.ts`, linhas 4012-4023

**Problema:**
- Descontos são salvos na **sessão** durante o fluxo
- Mas são aplicados aos **pedidos individuais** no momento do pagamento
- ⚠️ Dois locais diferentes para o mesmo dado

**Cenário Real:**
1. Usuário aplica 10% de desconto no Step 3
2. ✅ Salvo em `table_sessions.discount = '10'`
3. Usuário finaliza pagamento
4. ✅ Desconto é aplicado em **cada pedido** da sessão
5. ✅ Pedidos ficam com `orders.discount = '10'`
6. ❓ Agora temos desconto em 2 lugares:
   - `table_sessions.discount`
   - `orders.discount` (cada pedido)

**Pergunta Crítica:**
- Se usuário editar um pedido depois, qual desconto prevalece?
- Se adicionar novo pedido, desconto é aplicado automaticamente?

**Impacto UX:** ⚠️ AMBIGUIDADE NA PERSISTÊNCIA

---

## 🎯 MATRIZ DE CENÁRIOS E COMPORTAMENTOS

| Cenário | URL | Sessão DB | Estado React | Resultado Esperado | Resultado Real | Status |
|---------|-----|-----------|--------------|-------------------|----------------|--------|
| Primeira abertura Step 1 | ❌ | ✅ 50 | ❌ | Mostrar 50 | Mostrar 0 | ❌ Bug |
| Primeira abertura Step 3 | ❌ | ✅ 50 | ❌ | Mostrar 50 | Mostrar 50 | ✅ OK |
| Reload Step 1 com URL | ✅ 30 | ✅ 50 | ❌ | Mostrar 50 | Mostrar 30 | ⚠️ Ambíguo |
| Reload Step 3 com URL | ✅ 30 | ✅ 50 | ❌ | Mostrar 50 | Mostrar 50 | ✅ OK |
| Aplicar desconto e voltar Step 1 | ✅ 50 | ⏳ Salvando | ✅ 50 | Mostrar 50 | Mostrar 0 | ❌ Bug |
| Aplicar desconto e avançar Step 4 | ✅ 50 | ✅ 50 | ✅ 50 | Mostrar 50 | Mostrar 50 | ✅ OK |
| Navegar rápido Step 3→1 | ❌ | ❌ | ✅ 50 | Salvar 50 | Perder 50 | 🔴 Crítico |

---

## 💡 RECOMENDAÇÕES DE CORREÇÃO

### ✅ **SOLUÇÃO 1: Single Source of Truth**
**Prioridade:** 🔴 CRÍTICA

```tsx
// Sempre usar sessão como fonte única da verdade
// URL apenas para deep linking inicial
```

**Implementação:**
1. Remover lógica de limpeza no Step 1
2. Sempre restaurar da sessão, independente do step
3. URL serve apenas para inicialização quando não há sessão

---

### ✅ **SOLUÇÃO 2: Salvamento Imediato em Ações Críticas**
**Prioridade:** 🔴 CRÍTICA

```tsx
// Salvar IMEDIATAMENTE ao mudar de step
// Não depender apenas do debounce
```

**Implementação:**
1. Ao clicar "Voltar" ou "Avançar", salvar antes de navegar
2. Manter debounce para mudanças de campo
3. Adicionar indicador visual "Salvando..."

---

### ✅ **SOLUÇÃO 3: Indicadores Visuais de Estado**
**Prioridade:** 🟡 MÉDIA

```tsx
// Mostrar ao usuário o que está acontecendo
```

**Implementação:**
1. Badge "Desconto Aplicado: 10%" sempre visível em todos os steps
2. Indicador "💾 Salvando..." durante debounce
3. Ícone "⚠️" se houver conflito entre URL e sessão

---

### ✅ **SOLUÇÃO 4: Validação de Consistência**
**Prioridade:** 🟡 MÉDIA

```tsx
// Detectar e resolver conflitos automaticamente
```

**Implementação:**
```tsx
useEffect(() => {
  if (urlDiscount && sessionDiscount && urlDiscount !== sessionDiscount) {
    // Mostrar diálogo: "Detectamos desconto diferente. Qual usar?"
    // Ou: Sempre priorizar sessão e atualizar URL
  }
}, [urlDiscount, sessionDiscount]);
```

---

### ✅ **SOLUÇÃO 5: Modo de Revisão no Step 1**
**Prioridade:** 🟢 BAIXA

```tsx
// Step 1 como "modo leitura" com resumo dos ajustes
```

**Implementação:**
- Step 1: Mostrar resumo não-editável dos ajustes
- Banner: "💰 Desconto de 10% será aplicado no pagamento"
- Botão: "Editar Desconto" → vai direto para Step 3

---

## 🏁 CONCLUSÃO

### Status Atual: ⚠️ FUNCIONAL MAS COM RISCOS

**Funciona bem quando:**
- ✅ Usuário segue o fluxo linear (1→2→3→4)
- ✅ Não volta ao Step 1 após aplicar descontos
- ✅ Não recarrega a página no Step 1

**Falha quando:**
- ❌ Usuário navega para frente e para trás
- ❌ Recarrega no Step 1 com desconto salvo
- ❌ Edita desconto e volta rapidamente

### Urgência: 🔴 ALTA
Recomendo implementar pelo menos as **Soluções 1 e 2** antes de produção.

---

**Data da Análise:** 2026-01-03  
**Componente:** `table-checkout-v2.tsx`  
**Impacto:** Sistema de descontos e pagamentos
