# 🖱️ Guia: Drag & Drop na Divisão de Conta

**Data:** 2026-01-03  
**Status:** ✅ Implementado

---

## 🎯 Como Funciona o Drag & Drop

O sistema de arrastar itens entre convidados está **implementado e funcional**, mas tem **condições específicas** para funcionar.

---

## ✅ **Requisitos para Arrastar Itens:**

### **1. Mesa deve ter 2+ convidados** 👥👥

```typescript
disabled={ordersByGuest.length === 1}
```

**❌ Não funciona se:**
- Mesa tem apenas 1 convidado
- Não há para onde mover os itens

**✅ Funciona se:**
- Mesa tem 2 ou mais convidados
- Há outros convidados para receber itens

---

### **2. Convidado não pode estar com status "pago"** 💰

```typescript
disabled={guestData.guest.status === 'pago'}
```

**❌ Não funciona se:**
- Convidado já pagou
- Status = "pago"
- Conta já foi fechada

**✅ Funciona se:**
- Status = "ativo" ou "aguardando_conta"
- Convidado ainda não pagou

---

### **3. Convidado deve estar expandido** 📂

```typescript
{selectedGuest === guestData.guest.id && (
  <DroppableGuestZone>
    <DraggableOrderItem />
  </DroppableGuestZone>
)}
```

**❌ Não funciona se:**
- Convidado está colapsado (fechado)
- Itens não estão visíveis

**✅ Funciona se:**
- Clicar no card do convidado para expandir
- Itens estão visíveis na lista

---

## 🎨 **Como Usar (Passo a Passo):**

### **Cenário: Mesa com 3 convidados**

```
Mesa 5 - 3 convidados
├─ João (50 Kz) - Status: Ativo
├─ Maria (75 Kz) - Status: Ativo  
└─ Pedro (25 Kz) - Status: Ativo
```

### **Passo 1: Abrir aba "Divisão"**
```
TableDialogPOSModern → Aba "Divisão" (tecla 5)
ou
BillSplitPanel diretamente
```

### **Passo 2: Expandir convidado origem**
```
Clicar no card de "João"
→ Card expande mostrando itens:
  ⋮⋮ 1x Hamburguer    50 Kz
  ⋮⋮ 1x Batatas       20 Kz
  ⋮⋮ 1x Refrigerante  10 Kz
```

### **Passo 3: Expandir convidado destino**
```
Clicar no card de "Maria"
→ Card expande mostrando sua zona de drop
```

### **Passo 4: Arrastar item**
```
1. Posicionar mouse sobre o ícone ⋮⋮ (GripVertical)
2. Clicar e segurar botão esquerdo do mouse
3. Arrastar até o card de "Maria"
4. Zona de Maria fica destacada (borda/fundo muda)
5. Soltar o mouse
```

### **Passo 5: Confirmar motivo**
```
Dialog aparece:
┌─────────────────────────────────────┐
│  Por que mover este item?           │
├─────────────────────────────────────┤
│  Item: 1x Hamburguer                │
│  De: João                           │
│  Para: Maria                        │
│                                     │
│  Motivo:                            │
│  ○ Erro de atendente                │
│  ○ Cliente trocou de lugar          │
│  ● Divisão de conta                 │
│  ○ Outro                            │
│                                     │
│  [Cancelar] [Confirmar]             │
└─────────────────────────────────────┘
```

### **Passo 6: Resultado**
```
✅ Item movido com sucesso
✅ Total de João: 50 Kz → 30 Kz
✅ Total de Maria: 75 Kz → 125 Kz
✅ Toast de confirmação aparece
✅ Registro de auditoria criado
```

---

## 🔍 **Indicadores Visuais:**

### **Item Arrastável:**
```typescript
cursor: 'grab'           // Cursor vira mãozinha
opacity: 1               // Normal
<GripVertical />         // Ícone ⋮⋮ visível
```

### **Item Sendo Arrastado:**
```typescript
cursor: 'grabbing'       // Cursor vira mão fechada
opacity: 0.5             // 50% transparente
bg: 'bg-primary/10'      // Fundo levemente colorido
shadow: 'shadow-lg'      // Sombra grande
```

### **Zona de Destino Ativa:**
```typescript
// DroppableGuestZone quando mouse passa por cima
border: 'border-primary'         // Borda colorida
bg: 'bg-primary/5'              // Fundo levemente colorido
shadow: 'shadow-inner'          // Sombra interna
```

### **Item Desabilitado:**
```typescript
cursor: 'default'        // Cursor normal
opacity: 0.5             // 50% transparente
<GripVertical />         // Ícone ⋮⋮ OCULTO
```

---

## ❌ **Por que NÃO está funcionando?**

### **Problema 1: Apenas 1 convidado**
```
❌ Situação:
Mesa tem apenas 1 convidado
João (150 Kz)

❌ Resultado:
Ícone ⋮⋮ não aparece
Cursor não muda para "grab"
Arrastar não funciona

✅ Solução:
Adicionar mais convidados à mesa
Mínimo: 2 convidados
```

---

### **Problema 2: Convidado já pagou**
```
❌ Situação:
João (Status: Pago) - 50 Kz
Maria (Status: Ativo) - 75 Kz

❌ Resultado:
Itens de João aparecem sem ícone ⋮⋮
Não pode arrastar de/para João
Cursor não muda

✅ Solução:
Só pode mover itens de convidados "ativos"
Se João já pagou, não pode mover seus itens
```

---

### **Problema 3: Convidado não expandido**
```
❌ Situação:
Card de João está colapsado (fechado)
Itens não estão visíveis

❌ Resultado:
Não há o que arrastar
Zona de drop não está disponível

✅ Solução:
Clicar no card do convidado para expandir
Clicar no card destino também para expandir
```

---

### **Problema 4: Mouse não está no ícone ⋮⋮**
```
❌ Situação:
Clicando em qualquer lugar do item
Não está clicando no ícone ⋮⋮

❌ Resultado:
Item não arrasta
Cursor não muda

✅ Solução:
Posicionar mouse EXATAMENTE sobre o ícone ⋮⋮
É uma área pequena (16x16px) no lado esquerdo
```

---

## 🧪 **Como Testar:**

### **Teste 1: Drag básico**
```
☐ Abrir mesa com 2+ convidados ativos
☐ Expandir ambos os cards
☐ Verificar ícone ⋮⋮ está visível
☐ Posicionar mouse sobre ⋮⋮
☐ Verificar cursor muda para "grab"
☐ Clicar e segurar
☐ Verificar cursor muda para "grabbing"
☐ Arrastar até outro card
☐ Verificar zona fica destacada
☐ Soltar
☐ Verificar dialog de motivo aparece
```

### **Teste 2: Visual feedback**
```
☐ Ao arrastar, item fica 50% transparente
☐ Ao passar sobre zona válida, borda destaca
☐ Ao soltar, toast de sucesso aparece
☐ Totais recalculam automaticamente
```

### **Teste 3: Casos de erro**
```
☐ Tentar arrastar com 1 convidado → Não funciona
☐ Tentar arrastar de convidado pago → Não funciona
☐ Tentar arrastar sem expandir → Não aparece itens
```

---

## 🛠️ **Debugging:**

### **Verificar se DndContext está ativo:**
```javascript
// No console do navegador:
document.querySelector('[data-dnd-context]')
// Deve retornar elemento se drag-drop está ativo
```

### **Verificar eventos de drag:**
```typescript
// Adicionar logs temporários em BillSplitPanel.tsx
onDragStart={(event) => {
  console.log('🎯 Drag iniciado:', event.active.id);
  setDraggedItem(event.active.data.current);
}}

onDragEnd={(event) => {
  console.log('✅ Drag finalizado:', event.over?.id);
  handleDragEnd(event);
}}
```

### **Verificar disabled:**
```typescript
// No componente DraggableOrderItem
console.log('Disabled?', disabled);
console.log('Status:', guestData.guest.status);
console.log('Guests count:', ordersByGuest.length);
```

---

## 📝 **Resumo Rápido:**

| Requisito | Status | O que fazer |
|-----------|--------|-------------|
| **2+ convidados** | ✅ Obrigatório | Adicionar mais pessoas |
| **Status ativo** | ✅ Obrigatório | Não pode estar pago |
| **Card expandido** | ✅ Obrigatório | Clicar para expandir |
| **Mouse no ícone ⋮⋮** | ✅ Obrigatório | Posicionar corretamente |
| **Clicar e segurar** | ✅ Necessário | Não soltar até chegar |
| **Zona destacada** | 🎨 Visual | Confirma que pode soltar |
| **Dialog de motivo** | 📝 Obrigatório | Escolher e confirmar |

---

## 🎉 **Quando Está Funcionando:**

Você saberá que o drag-drop está funcionando quando:

✅ **Ícone ⋮⋮ aparece** ao lado dos itens  
✅ **Cursor vira mãozinha** ao passar sobre ⋮⋮  
✅ **Item fica transparente** ao arrastar  
✅ **Zona de destino destaca** ao passar por cima  
✅ **Dialog de motivo aparece** ao soltar  
✅ **Toast de sucesso** após confirmar  
✅ **Totais atualizam** automaticamente  

---

## 🆘 **Se Ainda Não Funciona:**

1. **Verificar console do navegador** para erros JavaScript
2. **Confirmar que @dnd-kit está instalado**: `npm list @dnd-kit/core`
3. **Limpar cache**: Ctrl+Shift+R ou Cmd+Shift+R
4. **Testar em navegador diferente** (Chrome, Firefox, Edge)
5. **Verificar se há múltiplos DndContext** (conflito)

---

**Criado por:** Rovo Dev  
**Data:** 2026-01-03  
**Status:** ✅ Sistema Funcional
