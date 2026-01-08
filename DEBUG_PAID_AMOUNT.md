# 🔍 Debug: Verificar paidAmount dos Convidados

**Problema:** Mesmo após correção, ainda mostra pendente

---

## 🐛 Debug Ativado

Adicionei logs no console para ver os dados EXATOS dos convidados.

## 📋 Como Ver:

1. **Abrir Console** (F12)
2. **Limpar console** (Ctrl+L)
3. **Abrir Mesa 10**
4. **Ir para aba "Pagamento"**
5. **Ver logs:**

```
=== DEBUG PAGAMENTO ===
ordersByGuest: [...]
Convidado #1: {
  id: "...",
  name: "...",
  guestNumber: 1,
  status: "...",
  subtotal: "20400",
  paidAmount: "..."  ← ESTE É O CAMPO IMPORTANTE!
}
totalPaid calculado: ...
totalUnpaid: ...
======================
```

## 🎯 O Que Procurar:

### **Se paidAmount = "0" ou null:**
```
Convidado #1: {
  paidAmount: "0"  ← PROBLEMA AQUI!
}
```
**Causa:** Backend não atualizou o paidAmount do convidado
**Solução:** Verificar rota de pagamento no backend

### **Se paidAmount = "20400":**
```
Convidado #1: {
  paidAmount: "20400"  ← CORRETO!
}
totalPaid: 20400
```
**Causa:** Bug no cálculo (mas deveria estar correto)
**Solução:** Verificar se há parseFloat ou conversão errada

### **Se paidAmount está em outro campo:**
```
Convidado #1: {
  paidAmount: undefined
  paid_amount: "20400"  ← Pode estar com nome diferente
}
```
**Causa:** Nome do campo diferente
**Solução:** Ajustar para usar o campo correto

---

## ⏭️ Próximo Passo:

**Me envie o log completo que aparece no console!**

Especialmente:
- `paidAmount` do convidado
- `totalPaid calculado`
- `totalUnpaid`
