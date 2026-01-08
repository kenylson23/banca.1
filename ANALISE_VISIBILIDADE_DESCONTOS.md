# 🔍 Análise: Visibilidade de Descontos ao Voltar ao Step 1

**Data:** 2026-01-03  
**Questão:** Se aplicar desconto no Step 3, sair e voltar, é possível identificar que o valor reduziu?  
**Status:** ⚠️ **PROBLEMA DE UX IDENTIFICADO**

---

## 📋 Sumário Executivo

Após análise profunda dos 4 steps do checkout, identifiquei **inconsistências críticas** na visualização de descontos:

### ❌ Problemas Encontrados:
1. **Step 1 NÃO mostra descontos aplicados** (por design)
2. **Step 2 NÃO mostra descontos** (não tem breakdown)
3. **Step 3 mostra descontos** (onde são aplicados)
4. **Step 4 MOSTRA breakdown completo** com descontos visíveis ✅
5. **Usuário pode se confundir** ao voltar do Step 3 para Step 1

### ✅ O que funciona:
1. Step 4 tem visualização excelente dos descontos
2. Breakdown detalhado com cores (verde para descontos)
3. Mensagem "Você economizou X Kz" 
4. Cálculos corretos em todos os steps

---

## 🔍 Análise Detalhada por Step

### **Step 1: Seleção de Itens (❌ SEM indicação de descontos)**

**Comportamento Atual:**
```tsx
// Step 1 mostra apenas os totais por convidado SEM ajustes
<div className="text-lg font-bold text-purple-600">
  {formatKwanza(guestTotal)}  // Valor BRUTO sem descontos
</div>
```

**Código Analisado (linha 830-920):**
- ✅ Mostra lista de convidados
- ✅ Mostra itens de cada convidado
- ✅ Mostra total por convidado
- ❌ **NÃO mostra se há descontos aplicados**
- ❌ **NÃO mostra "valor original vs valor com desconto"**

**Lógica de Negócio:**
```tsx
// No Step 1, o cálculo NÃO aplica ajustes (por design)
// useEffect só restaura ajustes se currentStep > 1
if (table?.currentSessionId && tablesData && currentStep > 1) {
  // Restaurar ajustes...
}
```

**Problema:**
- User aplica desconto 10% no Step 3
- Total muda de 10.000 Kz → 9.000 Kz ✅
- User volta para Step 1
- Ve 10.000 Kz novamente (valor bruto) ❌
- **User não sabe que há desconto ativo!**

---

### **Step 2: Benefícios (❌ SEM indicação de descontos)**

**Comportamento Atual:**
```tsx
// Step 2 só mostra cupons e pontos de fidelidade
// NÃO tem resumo de totais ou descontos manuais
```

**Código:** Não mostra breakdown de valores.

**Problema:**
- ❌ Não há indicação de descontos aplicados no Step 3

---

### **Step 3: Ajustes (✅ MOSTRA descontos sendo aplicados)**

**Comportamento Atual:**
```tsx
// Step 3 tem os campos de input e mostra o total atualizado
<div className="text-3xl font-black">
  {formatKwanza(calculateTotals.finalTotal)}  // COM desconto
</div>

// Mostra breakdown:
{calculateTotals.breakdown.map((item) => (
  <div className="text-green-600">  // Verde para descontos
    ↓ {item.label}: -{formatKwanza(item.value)}
  </div>
))}
```

**Análise:**
- ✅ User vê campos de desconto
- ✅ User vê total atualizado
- ✅ User vê breakdown com setas ↓
- ✅ **Aqui está claro que há desconto!**

---

### **Step 4: Método de Pagamento (✅ EXCELENTE visualização)**

**Comportamento Atual:**
```tsx
// 🎯 MELHORIA 10: Resumo Detalhado no Step 4
<Card className="border-2 border-indigo-200">
  <CardHeader>
    <CardTitle>Revisão Final do Pedido</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex justify-between">
      <span>Subtotal</span>
      <span>{formatKwanza(calculateTotals.subtotal)}</span>
    </div>
    
    {/* 🎯 MELHORIA 12: Badge de Ajustes Aplicados */}
    {calculateTotals.breakdown.length > 0 && (
      <div className="space-y-1.5 pl-2 border-l-2 border-indigo-300">
        {calculateTotals.breakdown.map((item, idx) => (
          <div key={idx} className={cn(
            "flex justify-between text-xs",
            item.type === 'discount' && "text-green-600",  // ✅ Verde
            item.type === 'addition' && "text-orange-600"
          )}>
            <span className="flex items-center gap-1">
              {item.type === 'discount' ? '↓' : '↑'} {item.label}
            </span>
            <span className="font-medium">
              {item.value < 0 ? '-' : '+'}
              {formatKwanza(Math.abs(item.value))}
            </span>
          </div>
        ))}
      </div>
    )}
    
    <div className="flex justify-between items-center pt-1">
      <span className="font-bold text-base">TOTAL A PAGAR</span>
      <span className="font-black text-2xl text-indigo-600">
        {formatKwanza(calculateTotals.finalTotal)}
      </span>
    </div>
    
    {/* ✅ MENSAGEM DE ECONOMIA */}
    {calculateTotals.totalDiscounts > 0 && (
      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
        <Sparkles className="h-3 w-3" />
        <span>
          Você economizou {formatKwanza(calculateTotals.totalDiscounts)} 
          neste pedido!
        </span>
      </div>
    )}
  </CardContent>
</Card>
```

**Análise:**
- ✅ **Subtotal** claramente separado
- ✅ **Breakdown** com cada ajuste
- ✅ **Cores diferentes** (verde para descontos, laranja para adições)
- ✅ **Setas visuais** (↓ para descontos, ↑ para adições)
- ✅ **Total Final** em destaque
- ✅ **Mensagem de economia** quando há descontos
- ✅ **PERFEITO!**

---

## 🔴 Problema Principal

### **Cenário do Bug de UX:**

```
User está no checkout (qualquer step)
  ↓
Vai para Step 3
  ↓
Adiciona desconto de 10% (1.000 Kz)
  ↓
Total: 10.000 Kz → 9.000 Kz ✅
  ↓
User clica "Anterior" (volta Step 1)
  ↓
Step 1 mostra: 10.000 Kz ❌
  ↓
User pensa: "Cadê meu desconto?!"
  ↓
User fica confuso 😕
  ↓
User pode reaplicar desconto (duplicando!) 💥
```

### **Causa:**
Step 1 foi projetado para mostrar **valores puros sem ajustes**, mas isso cria confusão quando user já aplicou ajustes.

---

## 📊 Comparação de Visibilidade

| Step | Mostra Subtotal | Mostra Desconto | Mostra Total Final | Clareza |
|------|----------------|-----------------|-------------------|---------|
| **Step 1** | ✅ Sim (por convidado) | ❌ NÃO | ✅ Sim (bruto) | 🔴 Confuso |
| **Step 2** | ❌ NÃO | ❌ NÃO | ❌ NÃO | 🟡 Neutro |
| **Step 3** | ✅ Sim | ✅ SIM | ✅ Sim (líquido) | 🟢 Claro |
| **Step 4** | ✅ Sim | ✅ SIM (detalhado) | ✅ Sim (líquido) | 🟢 EXCELENTE |

---

## 💡 Soluções Propostas

### **Solução 1: Badge "Ajustes Ativos" no Step 1** (RECOMENDADA)

**Implementação:**

```tsx
// No Step 1, adicionar indicador de ajustes ativos
{currentStep === 1 && (discountValue || manualServiceValue) && (
  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
    <div className="flex items-center gap-2 mb-2">
      <Tag className="h-5 w-5 text-blue-600" />
      <span className="font-bold text-blue-900 dark:text-blue-100">
        Ajustes Ativos neste Pedido
      </span>
    </div>
    
    <div className="space-y-1 text-sm">
      {discountValue && (
        <div className="flex items-center justify-between text-green-600 dark:text-green-400">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Desconto {discountType === 'percentual' ? `${discountValue}%` : formatKwanza(parseFloat(discountValue))}
          </span>
          <span className="font-medium">
            -{formatKwanza(calculateDiscountValue(parseFloat(discountValue), discountType))}
          </span>
        </div>
      )}
      
      {manualServiceValue && (
        <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
          <span className="flex items-center gap-1">
            <CirclePlus className="h-3 w-3" />
            Taxa de Serviço {manualServiceType === 'percentual' ? `${manualServiceValue}%` : formatKwanza(parseFloat(manualServiceValue))}
          </span>
          <span className="font-medium">
            +{formatKwanza(calculateServiceValue(parseFloat(manualServiceValue), manualServiceType))}
          </span>
        </div>
      )}
      
      <Separator className="my-2" />
      
      <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-100">
        <span>Total Líquido:</span>
        <span className="text-lg">
          {formatKwanza(calculateTotals.finalTotal)}
        </span>
      </div>
    </div>
    
    <Button 
      variant="outline" 
      size="sm" 
      className="w-full mt-3"
      onClick={() => setCurrentStep(3)}
    >
      <Edit className="h-3 w-3 mr-2" />
      Editar Ajustes
    </Button>
  </div>
)}
```

**Benefícios:**
- ✅ User SEMPRE sabe que há ajustes ativos
- ✅ Mostra valor original E valor com ajustes
- ✅ Botão para editar facilmente
- ✅ Cores consistentes (verde = desconto, laranja = adição)
- ✅ Não quebra design do Step 1

---

### **Solução 2: Comparação Visual no Total** (COMPLEMENTAR)

```tsx
// No card de total de cada convidado no Step 1:
{(discountValue || manualServiceValue) && (
  <div className="text-right">
    {/* Valor Original (riscado) */}
    <div className="text-sm text-slate-400 line-through">
      {formatKwanza(guestTotal)}
    </div>
    {/* Valor com Desconto (destaque) */}
    <div className="text-lg font-bold text-purple-600">
      {formatKwanza(calculateGuestTotalWithAdjustments(guestTotal))}
    </div>
    <div className="text-xs text-green-600 flex items-center gap-1 justify-end">
      <ArrowDown className="h-3 w-3" />
      Economia
    </div>
  </div>
)}
```

**Benefícios:**
- ✅ Mostra claramente antes/depois
- ✅ Usuário vê que economizou
- ✅ Mantém contexto visual

---

### **Solução 3: Stepper com Indicadores** (AVANÇADA)

```tsx
// Adicionar badge no stepper quando há ajustes
const steps = [
  { number: 1, title: 'Revisar', icon: ShoppingBag },
  { number: 2, title: 'Benefícios', icon: Gift },
  { 
    number: 3, 
    title: 'Ajustes', 
    icon: Tag,
    badge: (discountValue || manualServiceValue) ? '✓' : null  // ✅ Badge
  },
  { number: 4, title: 'Pagamento', icon: CreditCard },
];

// No render do stepper:
{step.badge && (
  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
    {step.badge}
  </div>
)}
```

**Benefícios:**
- ✅ Indicador visual no stepper
- ✅ User sabe que Step 3 tem ajustes ativos
- ✅ Não intrusivo

---

### **Solução 4: Banner Flutuante** (ALTERNATIVA)

```tsx
// Banner fixo no topo quando há ajustes ativos E está no Step 1 ou 2
{currentStep < 3 && (discountValue || manualServiceValue) && (
  <div className="sticky top-0 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 shadow-lg">
    <div className="flex items-center justify-between max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <span className="font-medium text-sm">
          {discountValue && `Desconto de ${discountType === 'percentual' ? discountValue + '%' : formatKwanza(parseFloat(discountValue))} ativo`}
          {discountValue && manualServiceValue && ' • '}
          {manualServiceValue && `Taxa de ${manualServiceType === 'percentual' ? manualServiceValue + '%' : formatKwanza(parseFloat(manualServiceValue))} ativa`}
        </span>
      </div>
      <Button 
        size="sm" 
        variant="ghost" 
        className="text-white hover:bg-white/20"
        onClick={() => setCurrentStep(3)}
      >
        Ver Detalhes
      </Button>
    </div>
  </div>
)}
```

**Benefícios:**
- ✅ Sempre visível
- ✅ Não pode ser ignorado
- ✅ Link direto para editar

---

## 🧪 Cenários de Teste

### **Teste 1: Fluxo Com Desconto**
```bash
1. Ir para Step 3
2. Adicionar desconto de 10% em pedido de 10.000 Kz
3. ✅ Ver total: 9.000 Kz
4. Clicar "Anterior" (volta Step 1)
5. ✅ Ver banner "Ajustes Ativos" no topo
6. ✅ Ver "Total Líquido: 9.000 Kz" no banner
7. ✅ Ver valores dos convidados (brutos)
8. ✅ Clicar "Editar Ajustes" no banner
9. ✅ Volta para Step 3
10. ✅ Desconto ainda lá (10%)
```

### **Teste 2: Comparação Visual**
```bash
1. Step 3 - Adicionar desconto 5%
2. Voltar Step 1
3. ✅ Ver em cada convidado:
   - Valor original: 5.000 Kz (riscado)
   - Valor com desconto: 4.750 Kz (destaque)
   - "Economia" em verde
```

### **Teste 3: Sem Ajustes**
```bash
1. Step 1 sem ajustes
2. ✅ Não mostrar banner de ajustes
3. ✅ Mostrar apenas totais normais
4. ✅ UI limpa e simples
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | ANTES | DEPOIS (Com Solução 1) |
|---------|-------|------------------------|
| **Visibilidade Step 1** | 🔴 Zero indicação | 🟢 Banner claro |
| **Confusão User** | 🔴 Alta | 🟢 Zero |
| **Valor Mostrado** | 🔴 Só bruto | 🟢 Bruto + Líquido |
| **Editar Ajustes** | 🟡 Ir Step 3 | 🟢 Botão direto |
| **Consistência** | 🔴 Baixa | 🟢 Alta |
| **Risco Duplicação** | 🔴 Alto | 🟢 Zero |

---

## 🎯 Recomendação Final

### **Implementar Solução 1 + Solução 3:**

1. ✅ **Banner "Ajustes Ativos"** no Step 1 quando há descontos/taxas
2. ✅ **Badge no Stepper** para indicar Step 3 tem ajustes
3. ✅ **Manter Step 4** como está (já perfeito)

**Benefícios:**
- Banner informa claramente sobre ajustes
- Badge no stepper dá contexto visual
- Step 4 continua sendo revisão final completa
- Não quebra lógica de negócio (Step 1 continua mostrando valores brutos na lista)
- Zero confusão para o utilizador

---

## 📝 Resumo das Descobertas

### **O que funciona MUITO BEM:**
- ✅ Step 4 tem visualização EXCELENTE de descontos
- ✅ Breakdown detalhado com cores
- ✅ Mensagem "Você economizou X"
- ✅ Cálculos corretos

### **O que precisa melhorar:**
- ❌ Step 1 não indica que há ajustes ativos
- ❌ User pode ficar confuso ao voltar
- ❌ Risco de reaplicar desconto (duplicação)

### **Solução:**
- ✅ Adicionar indicador visual no Step 1
- ✅ Manter valores brutos na lista (regra de negócio)
- ✅ Mostrar "Total Líquido" separadamente
- ✅ Botão para editar ajustes

---

## ⏱️ Estimativa de Implementação

| Solução | Tempo | Complexidade | Prioridade |
|---------|-------|--------------|------------|
| **Solução 1** (Banner) | 1-2h | Baixa | 🔴 Alta |
| **Solução 2** (Comparação) | 2-3h | Média | 🟡 Média |
| **Solução 3** (Badge Stepper) | 30min | Baixa | 🟢 Baixa |
| **Solução 4** (Banner Flutuante) | 1h | Baixa | 🟡 Média |

**Recomendação:** Implementar Solução 1 + Solução 3 = **2-3 horas total**

---

## 🎉 Resultado Esperado

Após implementar as soluções:
- ✅ User SEMPRE sabe se há ajustes ativos
- ✅ Values claros: Original + Com Ajustes
- ✅ Zero confusão ao navegar entre steps
- ✅ UX consistente e transparente
- ✅ Mantém lógica de negócio do Step 1

---

**Próximo Passo Recomendado:** Implementar Solução 1 (Banner de Ajustes Ativos no Step 1)

---

**Fim da Análise**
