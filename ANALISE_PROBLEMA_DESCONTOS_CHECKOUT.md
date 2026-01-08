# 🔍 Análise: Problema de Inconsistência de Descontos no Checkout

**Data:** 2026-01-03  
**Problema Reportado:** Descontos aplicados no Step 3 desaparecem ao recarregar página ou sair do diálogo  
**Status:** 🔴 **PROBLEMA CRÍTICO IDENTIFICADO**

---

## 📋 Sumário Executivo

Após análise profunda, identifiquei **problemas críticos** na persistência de ajustes (descontos e taxas de serviço) no checkout:

### ❌ Problemas Encontrados:
1. **Descontos não são salvos automaticamente** ao mudar de step
2. **Falta sincronização** entre estado local e backend
3. **Dados se perdem** ao recarregar página ou fechar diálogo
4. **Step 1 ignora ajustes** mas não há botão para salvar no Step 3
5. **Mutation de salvar não é chamada** em momento algum

### ✅ O que funciona:
1. Backend tem endpoint `/api/tables/:id/session-adjustments`
2. Storage tem método `updateSessionAdjustments()`
3. Lógica de restaurar ajustes existe (mas só funciona após Step 1)
4. Cálculos locais funcionam corretamente

---

## 🔴 Problema Principal

### **Cenário do Bug:**

```
1. User está no checkout da mesa
2. Vai para Step 3 (Ajustes)
3. Adiciona desconto de 10%
4. ✅ Vê o valor atualizado localmente
5. Vai para Step 4
6. ✅ Ainda vê o desconto aplicado
7. User recarrega a página (F5)
   OU
   User fecha diálogo e volta
8. ❌ DESCONTO DESAPARECEU!
9. ❌ Volta aos valores originais
```

### **Causa Raiz:**
**OS AJUSTES NUNCA SÃO SALVOS NO BACKEND!**

---

## 🔍 Análise Detalhada do Código

### **1. Estado Local dos Ajustes**

**Localização:** `client/src/pages/table-checkout-v2.tsx` linha 177+

```tsx
// Estados para Step 3 - Ajustes
const [discountValue, setDiscountValue] = useState('');
const [discountType, setDiscountType] = useState<'valor' | 'percentual'>('valor');
const [manualServiceValue, setManualServiceValue] = useState('');
const [manualServiceType, setManualServiceType] = useState<'valor' | 'percentual'>('percentual');
```

**Problema:** Estes estados são **apenas locais** (na memória do navegador).
- ✅ Funcionam enquanto componente está montado
- ❌ Se perdem ao desmontar componente
- ❌ Não sincronizam com backend automaticamente

---

### **2. Restauração de Ajustes (Parcialmente Implementada)**

**Localização:** `client/src/pages/table-checkout-v2.tsx` linha 177+

```tsx
useEffect(() => {
  // Só restaurar ajustes se não estiver no Step 1 (revisar)
  // No Step 1, o utilizador deve ver os valores puros, sem ajustes aplicados
  if (table?.currentSessionId && tablesData && currentStep > 1) {
    // Buscar sessão para obter os ajustes salvos
    fetch(`/api/tables/${id}/sessions`)
      .then(res => res.json())
      .then((sessions: any[]) => {
        const currentSession = sessions.find((s: any) => s.id === table.currentSessionId);
        if (currentSession) {
          // Restaurar desconto
          if (currentSession.discount && parseFloat(currentSession.discount) > 0) {
            setDiscountValue(currentSession.discount);
            setDiscountType(currentSession.discountType || 'valor');
          }
          // Restaurar taxa de serviço
          if (currentSession.serviceCharge && parseFloat(currentSession.serviceCharge) > 0) {
            setManualServiceValue(currentSession.serviceCharge);
            setManualServiceType(currentSession.serviceChargeType || 'percentual');
          }
        }
      });
  }
}, [table?.currentSessionId, tablesData, id, currentStep]);
```

**Análise:**
- ✅ Lógica de restaurar existe
- ✅ Busca dados do backend
- ❌ **SÓ funciona se currentStep > 1**
- ❌ **MAS OS DADOS NUNCA FORAM SALVOS!**

**Problema:** É como tentar ler um arquivo que nunca foi escrito!

---

### **3. Navegação Entre Steps**

**Localização:** `client/src/pages/table-checkout-v2.tsx` linha 1970+

```tsx
const handleNext = () => {
  if (currentStep < 4) {
    setCurrentStep(currentStep + 1);
  }
};

const handlePrev = () => {
  if (currentStep > 1) {
    setCurrentStep(currentStep - 1);
  }
};
```

**Problema:** 
- ❌ **NÃO salva ajustes** ao sair do Step 3
- ❌ **NÃO chama mutation** de salvar
- ❌ **NÃO há debounce** ou auto-save

---

### **4. Backend - Endpoint Existe Mas Não é Usado**

**Localização:** `server/routes.ts` linha 4337+

```typescript
// Update session adjustments (discounts, service charge)
app.put("/api/tables/:id/session-adjustments", async (req, res) => {
  try {
    const { id } = req.params;
    const { discount, discountType, serviceCharge, serviceChargeType } = req.body;

    const table = await storage.getTableById(parseInt(id));
    if (!table) {
      return res.status(404).json({ error: "Mesa não encontrada" });
    }

    if (!table.currentSessionId) {
      return res.status(400).json({ error: "Mesa não tem sessão ativa" });
    }

    // ✅ Atualizar ajustes na sessão
    await storage.updateSessionAdjustments(table.currentSessionId, {
      discount,
      discountType,
      serviceCharge,
      serviceChargeType,
    });

    res.json({ 
      success: true,
      message: "Ajustes salvos com sucesso" 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

**Análise:**
- ✅ Endpoint funciona perfeitamente
- ✅ Validações corretas
- ✅ Salva na base de dados
- ❌ **NUNCA É CHAMADO PELO FRONTEND!**

---

### **5. Storage - Método Implementado**

**Localização:** `server/storage.ts` linha 1847+

```typescript
async updateSessionAdjustments(sessionId: string, adjustments: {
  discount?: string;
  discountType?: 'valor' | 'percentual';
  serviceCharge?: string;
  serviceChargeType?: 'valor' | 'percentual';
}): Promise<void> {
  try {
    const updateData: any = {};
    
    if (adjustments.discount !== undefined) {
      updateData.discount = adjustments.discount;
    }
    if (adjustments.discountType !== undefined) {
      updateData.discountType = adjustments.discountType;
    }
    if (adjustments.serviceCharge !== undefined) {
      updateData.serviceCharge = adjustments.serviceCharge;
    }
    if (adjustments.serviceChargeType !== undefined) {
      updateData.serviceChargeType = adjustments.serviceChargeType;
    }
    
    await db.update(tableSessions)
      .set(updateData)
      .where(eq(tableSessions.id, sessionId));
    
    console.log(`✅ [SESSION ADJUSTMENTS] Ajustes salvos na sessão ${sessionId}:`, adjustments);
    
  } catch (error) {
    console.error(`❌ [SESSION ADJUSTMENTS] Erro ao salvar ajustes da sessão ${sessionId}:`, error);
    throw error;
  }
}
```

**Análise:**
- ✅ Método bem implementado
- ✅ Salva todos os campos
- ✅ Log de debug
- ❌ **NUNCA É EXECUTADO!**

---

## 📊 Fluxo Atual (Com Bugs)

### **Cenário 1: Usar Desconto e Continuar**
```
User no Step 3
  ↓
Adiciona desconto de 10%
  ↓
setDiscountValue('10')  ✅ Estado local atualizado
setDiscountType('percentual')
  ↓
Clica "Próximo"
  ↓
handleNext() executado
  ↓
❌ NÃO salva no backend
  ↓
currentStep = 4
  ↓
✅ Desconto ainda visível (estado local)
  ↓
Clica "Confirmar Pagamento"
  ↓
processPaymentMutation()
  ↓
⚠️ Pagamento usa valores locais (corretos)
  ↓
✅ Pagamento processado com desconto
  ↓
MAS sessão NÃO tem desconto salvo ❌
```

### **Cenário 2: Usar Desconto e Recarregar**
```
User no Step 3
  ↓
Adiciona desconto de 10%
  ↓
setDiscountValue('10')  ✅ Estado local
  ↓
User pressiona F5 (recarregar)
  ↓
Componente desmonta
  ↓
❌ Estado local perdido
  ↓
Componente monta novamente
  ↓
useEffect tenta restaurar:
  fetch('/api/tables/${id}/sessions')
  ↓
Busca sessão no backend
  ↓
❌ session.discount = null (nunca foi salvo!)
  ↓
❌ Desconto NÃO é restaurado
  ↓
User vê valores originais (sem desconto)
```

### **Cenário 3: Usar Desconto e Voltar ao Step 1**
```
User no Step 3
  ↓
Adiciona desconto de 10%
  ↓
Clica "Anterior" (volta Step 1)
  ↓
❌ useEffect não restaura (currentStep === 1)
  ↓
Step 1 mostra valores SEM ajustes ✅ (correto por design)
  ↓
User clica "Próximo"
  ↓
Step 2
  ↓
User clica "Próximo"
  ↓
Step 3
  ↓
❌ Campos de desconto VAZIOS!
  ↓
Estado local foi resetado
```

---

## 💡 Soluções Necessárias

### **Solução 1: Criar Mutation para Salvar Ajustes** (CRÍTICA)

**Localização:** `client/src/pages/table-checkout-v2.tsx`

```tsx
// ✅ SOLUÇÃO 1: Mutation para salvar ajustes
const saveAdjustmentsMutation = useMutation({
  mutationFn: async (adjustments: {
    discount?: string;
    discountType?: 'valor' | 'percentual';
    serviceCharge?: string;
    serviceChargeType?: 'valor' | 'percentual';
  }) => {
    const res = await apiRequest('PUT', `/api/tables/${id}/session-adjustments`, adjustments);
    return res.json();
  },
  onSuccess: () => {
    console.log('✅ Ajustes salvos com sucesso');
    queryClient.invalidateQueries({ queryKey: [`/api/tables/${id}/sessions`] });
  },
  onError: (error: any) => {
    console.error('❌ Erro ao salvar ajustes:', error);
    toast({
      title: "Erro ao salvar ajustes",
      description: error.message,
      variant: "destructive",
    });
  },
});
```

---

### **Solução 2: Auto-Save com Debounce** (RECOMENDADA)

```tsx
// ✅ SOLUÇÃO 2: Auto-save quando valores mudam
useEffect(() => {
  // Debounce de 1 segundo
  const timer = setTimeout(() => {
    if (currentStep === 3 && table?.currentSessionId) {
      const adjustments: any = {};
      
      if (discountValue) {
        adjustments.discount = discountValue;
        adjustments.discountType = discountType;
      }
      
      if (manualServiceValue) {
        adjustments.serviceCharge = manualServiceValue;
        adjustments.serviceChargeType = manualServiceType;
      }
      
      // Só salvar se houver ajustes
      if (Object.keys(adjustments).length > 0) {
        saveAdjustmentsMutation.mutate(adjustments);
      }
    }
  }, 1000); // 1 segundo de debounce
  
  return () => clearTimeout(timer);
}, [discountValue, discountType, manualServiceValue, manualServiceType, currentStep]);
```

**Benefícios:**
- ✅ Salva automaticamente após 1 segundo de inatividade
- ✅ Não requer botão "Salvar"
- ✅ UX transparente
- ✅ Dados sempre sincronizados

---

### **Solução 3: Salvar ao Mudar de Step** (ALTERNATIVA)

```tsx
const handleNext = async () => {
  // ✅ SOLUÇÃO 3: Salvar ajustes antes de avançar
  if (currentStep === 3 && table?.currentSessionId) {
    const adjustments: any = {};
    
    if (discountValue) {
      adjustments.discount = discountValue;
      adjustments.discountType = discountType;
    }
    
    if (manualServiceValue) {
      adjustments.serviceCharge = manualServiceValue;
      adjustments.serviceChargeType = manualServiceType;
    }
    
    if (Object.keys(adjustments).length > 0) {
      try {
        await saveAdjustmentsMutation.mutateAsync(adjustments);
      } catch (error) {
        // Erro já tratado pela mutation
        return; // Não avança se falhar
      }
    }
  }
  
  if (currentStep < 4) {
    setCurrentStep(currentStep + 1);
  }
};
```

**Benefícios:**
- ✅ Garante que dados são salvos antes de avançar
- ✅ Impede avanço se salvar falhar
- ✅ Simples de implementar

---

### **Solução 4: Restaurar Ajustes em Todos os Steps** (COMPLEMENTAR)

```tsx
useEffect(() => {
  // ✅ SOLUÇÃO 4: Restaurar ajustes em QUALQUER step (não só > 1)
  if (table?.currentSessionId && tablesData) {
    fetch(`/api/tables/${id}/sessions`)
      .then(res => res.json())
      .then((sessions: any[]) => {
        const currentSession = sessions.find((s: any) => s.id === table.currentSessionId);
        if (currentSession) {
          // Restaurar desconto
          if (currentSession.discount && parseFloat(currentSession.discount) > 0) {
            setDiscountValue(currentSession.discount);
            setDiscountType(currentSession.discountType || 'valor');
          }
          // Restaurar taxa de serviço
          if (currentSession.serviceCharge && parseFloat(currentSession.serviceCharge) > 0) {
            setManualServiceValue(currentSession.serviceCharge);
            setManualServiceType(currentSession.serviceChargeType || 'percentual');
          }
        }
      });
  }
  // ❌ REMOVER: && currentStep > 1
}, [table?.currentSessionId, tablesData, id]); // Sem dependência de currentStep
```

**Nota:** Os ajustes serão restaurados mas não aplicados nos cálculos do Step 1 (mantém lógica de negócio).

---

### **Solução 5: Botão Manual "Salvar Ajustes"** (FALLBACK)

```tsx
// No Step 3, adicionar botão:
<div className="flex gap-3">
  <Button
    onClick={() => {
      const adjustments: any = {};
      
      if (discountValue) {
        adjustments.discount = discountValue;
        adjustments.discountType = discountType;
      }
      
      if (manualServiceValue) {
        adjustments.serviceCharge = manualServiceValue;
        adjustments.serviceChargeType = manualServiceType;
      }
      
      saveAdjustmentsMutation.mutate(adjustments);
    }}
    disabled={saveAdjustmentsMutation.isPending}
    variant="outline"
  >
    {saveAdjustmentsMutation.isPending ? 'Salvando...' : 'Salvar Ajustes'}
  </Button>
  
  <Button onClick={handleNext}>
    Próximo
  </Button>
</div>
```

**Uso:** Como plano B se auto-save não for preferido.

---

## 🧪 Cenários de Teste

### **Teste 1: Auto-Save Funciona**
```
1. Ir para Step 3
2. Adicionar desconto de 10%
3. Aguardar 1 segundo
4. ✅ Verificar console: "Ajustes salvos com sucesso"
5. Recarregar página (F5)
6. Voltar para Step 3
7. ✅ Verificar: Desconto ainda lá (10%)
```

### **Teste 2: Navegação Preserva Dados**
```
1. Step 3 - Adicionar desconto 5%
2. Aguardar auto-save
3. Ir para Step 4
4. Voltar para Step 3
5. ✅ Verificar: Desconto 5% ainda visível
```

### **Teste 3: Fechar Diálogo Preserva**
```
1. Step 3 - Adicionar taxa de serviço 10%
2. Aguardar auto-save
3. Fechar diálogo
4. Abrir novamente
5. Ir para Step 3
6. ✅ Verificar: Taxa 10% ainda lá
```

---

## 📊 Comparação: Antes vs Depois

| Cenário | ANTES | DEPOIS (Com Soluções) |
|---------|-------|----------------------|
| **Adicionar Desconto** | ✅ Funciona localmente | ✅ Funciona e salva |
| **Recarregar Página** | ❌ Desconto perdido | ✅ Desconto mantido |
| **Fechar Diálogo** | ❌ Desconto perdido | ✅ Desconto mantido |
| **Voltar ao Step 1** | ❌ Desconto perdido | ✅ Desconto mantido |
| **Navegação Steps** | ⚠️ Inconsistente | ✅ Consistente |
| **Sincronização** | ❌ Não existe | ✅ Automática |

---

## 🎯 Prioridade de Implementação

### **URGENTE (P0) - Fazer AGORA:**
1. ✅ **Solução 1**: Criar mutation `saveAdjustmentsMutation`
2. ✅ **Solução 2**: Implementar auto-save com debounce
3. ✅ **Solução 3**: Salvar ao mudar de step

### **IMPORTANTE (P1) - Fazer em seguida:**
4. ✅ **Solução 4**: Restaurar ajustes em todos os steps
5. ✅ Testar todos os cenários
6. ✅ Adicionar logs de debug

### **OPCIONAL (P2) - Se necessário:**
7. **Solução 5**: Botão manual de salvar (como fallback)

---

## 📝 Resumo do Problema

### **Problema Principal:**
**Ajustes (descontos/taxas) não são persistidos no backend**, apenas ficam na memória local do navegador, causando perda de dados ao recarregar ou navegar.

### **Causa Raiz:**
- ✅ Backend tem endpoint funcional
- ✅ Storage tem método funcional
- ❌ **Frontend NUNCA chama o endpoint**
- ❌ **Mutation não existe**
- ❌ **Auto-save não implementado**

### **Impacto:**
- 🔴 Perda de dados do utilizador
- 🔴 Experiência inconsistente
- 🔴 Frustração ao ter que reinserir dados
- 🔴 Possível erro em pagamentos

---

## ✅ Checklist de Implementação

- [ ] Criar mutation `saveAdjustmentsMutation`
- [ ] Implementar auto-save com debounce (1 segundo)
- [ ] Salvar ajustes ao avançar do Step 3
- [ ] Remover condição `currentStep > 1` do useEffect de restauração
- [ ] Adicionar logs de debug
- [ ] Testar: adicionar desconto + recarregar página
- [ ] Testar: adicionar taxa + fechar diálogo
- [ ] Testar: navegar entre steps
- [ ] Testar: voltar ao Step 1 e avançar novamente
- [ ] Verificar console logs de salvamento
- [ ] Validar dados no backend (verificar tabela `table_sessions`)

---

## 🎉 Resultado Esperado

Após implementar as soluções:
- ✅ Descontos salvos automaticamente
- ✅ Dados persistem após reload
- ✅ Navegação consistente
- ✅ UX transparente e confiável
- ✅ Zero perda de dados

---

**Tempo Estimado de Implementação:** 2-3 horas  
**Complexidade:** Média  
**Impacto:** 🔴 Crítico para UX

---

**Próximo Passo Recomendado:** Implementar Soluções 1, 2 e 3 (Mutation + Auto-save + Salvar ao avançar)

---

**Fim da Análise**
