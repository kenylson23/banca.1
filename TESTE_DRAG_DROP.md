# 🧪 Teste de Drag & Drop - Checklist

**Data:** 2026-01-03

---

## ✅ Passo a Passo para Testar

### **1. Verificar Pré-requisitos** ✓

```
☐ Mesa tem 2+ convidados
☐ Cada convidado tem pelo menos 1 pedido
☐ Convidados estão com status "ativo" (não "pago")
☐ Console do navegador aberto (F12)
```

---

### **2. Abrir a Tela de Divisão** ✓

```
☐ Abrir mesa no TableDialogPOSModern
☐ Pressionar tecla "5" ou clicar aba "Divisão"
☐ Verificar: Tela carrega sem erros
☐ Verificar: Lista de convidados aparece
```

---

### **3. IMPORTANTE: Expandir os Cards** ✓✓✓

**Este é o passo mais importante!**

```
☐ Clicar no CARD do primeiro convidado
   → Card deve expandir
   → Deve aparecer: "Itens Consumidos: (Arraste para mover)"
   → Deve aparecer: Lista de itens com ícone ⋮⋮

☐ Clicar no CARD do segundo convidado
   → Card deve expandir
   → Zona de drop fica visível

☐ Ambos cards devem estar expandidos simultaneamente
```

**Visual esperado:**

```
┌──────────────────────────────────────┐
│ 👤 João - 50 Kz                     │ ← Card expandido
│ Status: Ativo    2 pedido(s)        │
├──────────────────────────────────────┤
│ Itens Consumidos: (Arraste para     │
│ mover)                               │
│                                      │
│ ⋮⋮ 1x Hamburguer        50 Kz       │ ← Item arrastável
│ ⋮⋮ 1x Batatas           20 Kz       │ ← Item arrastável
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 👤 Maria - 75 Kz                    │ ← Card expandido
│ Status: Ativo    2 pedido(s)        │
├──────────────────────────────────────┤
│ Itens Consumidos: (Arraste para     │
│ mover)                               │
│                                      │
│ [ZONA DE DROP ATIVA]                 │ ← Pode receber
│ ⋮⋮ 1x Refrigerante      15 Kz       │
│ ⋮⋮ 1x Sobremesa         60 Kz       │
└──────────────────────────────────────┘
```

---

### **4. Testar Drag & Drop** ✓

```
☐ Posicionar mouse sobre o ícone ⋮⋮ do item
☐ Verificar: Cursor muda para mãozinha (grab)
☐ Clicar e segurar botão esquerdo
☐ Verificar: Item fica 50% transparente
☐ Verificar: Cursor muda para mão fechada (grabbing)
☐ Arrastar até o card expandido de outro convidado
☐ Verificar: Zona de destino fica destacada (borda colorida)
☐ Soltar o mouse
☐ Verificar: Dialog "Por que mover este item?" aparece
```

---

### **5. Confirmar Movimentação** ✓

```
☐ Selecionar motivo: "Divisão de conta"
☐ Clicar "Confirmar"
☐ Verificar: Toast de sucesso aparece
☐ Verificar: Item sumiu do convidado origem
☐ Verificar: Item apareceu no convidado destino
☐ Verificar: Totais recalcularam
```

---

## 🐛 Problemas Comuns

### **Problema 1: "Não vejo o ícone ⋮⋮"**

**Causa:** Cards não estão expandidos

**Solução:**
```
1. Clicar no CARD completo (não no botão)
2. Card deve expandir mostrando itens
3. Ícone ⋮⋮ aparece ao lado de cada item
```

---

### **Problema 2: "Não consigo arrastar"**

**Verificar:**
```
☐ Você tem 2+ convidados?
☐ Ambos cards estão expandidos?
☐ Mouse está EXATAMENTE sobre o ícone ⋮⋮?
☐ Status do convidado é "ativo" (não "pago")?
☐ Há erro no console? (F12)
```

---

### **Problema 3: "Cursor não muda"**

**Causa:** Item está desabilitado ou mouse não está no ícone

**Verificar no console:**
```javascript
// Cole no console do navegador:
document.querySelectorAll('[data-testid^="card-guest-"]').forEach(card => {
  console.log('Card:', card.dataset.testid);
});

// Deve mostrar todos os cards
```

---

### **Problema 4: "Cards não expandem"**

**Verificar:**
```javascript
// Cole no console:
const cards = document.querySelectorAll('[data-testid^="card-guest-"]');
console.log('Total de cards:', cards.length);
cards.forEach((card, i) => {
  console.log(`Card ${i}:`, card.className);
  card.click(); // Expandir
});
```

---

## 🔬 Debug Avançado

### **Verificar DndContext:**

```javascript
// Cole no console:
const dndContext = document.querySelector('[data-dnd-context]');
console.log('DndContext existe?', !!dndContext);
```

### **Verificar itens arrastáveis:**

```javascript
// Cole no console:
const draggableItems = document.querySelectorAll('[data-dnd-draggable]');
console.log('Total de itens arrastáveis:', draggableItems.length);
draggableItems.forEach((item, i) => {
  console.log(`Item ${i}:`, {
    id: item.dataset.dndId,
    disabled: item.hasAttribute('disabled')
  });
});
```

### **Verificar zonas de drop:**

```javascript
// Cole no console:
const dropZones = document.querySelectorAll('[data-dnd-droppable]');
console.log('Total de zonas de drop:', dropZones.length);
dropZones.forEach((zone, i) => {
  console.log(`Zona ${i}:`, zone.dataset.dndId);
});
```

---

## 📸 Screenshot do que Deve Aparecer

### **ERRADO (Cards Colapsados):**
```
┌────────────────────────────┐
│ 👤 João - 50 Kz  [Botões] │  ← Clicável mas colapsado
└────────────────────────────┘

┌────────────────────────────┐
│ 👤 Maria - 75 Kz [Botões]  │  ← Clicável mas colapsado
└────────────────────────────┘

❌ Itens NÃO estão visíveis
❌ Não tem ícone ⋮⋮
❌ Não funciona drag
```

### **CORRETO (Cards Expandidos):**
```
┌──────────────────────────────────┐
│ 👤 João - 50 Kz      [Botões]   │  ← Expandido
├──────────────────────────────────┤
│ Itens Consumidos:                │
│ ⋮⋮ 1x Hamburguer        50 Kz   │  ← Arrastável
│ ⋮⋮ 1x Batatas           20 Kz   │  ← Arrastável
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 👤 Maria - 75 Kz     [Botões]    │  ← Expandido
├──────────────────────────────────┤
│ Itens Consumidos:                │
│ ⋮⋮ 1x Refrigerante      15 Kz   │  ← Arrastável
│ ⋮⋮ 1x Sobremesa         60 Kz   │  ← Arrastável
└──────────────────────────────────┘

✅ Itens ESTÃO visíveis
✅ Ícone ⋮⋮ presente
✅ Funciona drag & drop
```

---

## ✅ Resumo Final

**Para drag-drop funcionar você DEVE:**

1. ✅ Ter 2+ convidados com pedidos
2. ✅ **EXPANDIR ambos os cards** (clicar neles)
3. ✅ Ver a mensagem "(Arraste para mover)"
4. ✅ Ver o ícone ⋮⋮ ao lado de cada item
5. ✅ Clicar EXATAMENTE no ícone ⋮⋮
6. ✅ Segurar e arrastar até outro card

**Se você fez tudo isso e ainda não funciona:**
- Tire screenshot e me mostre
- Cole resultado dos comandos de debug
- Verifique console (F12) para erros

---

**Criado por:** Rovo Dev  
**Data:** 2026-01-03
