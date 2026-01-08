# ✅ Integração do BillSplitPanel no TableDialogPOSModern

**Data:** 2026-01-03  
**Status:** ✅ Completo  
**Objetivo:** Adicionar funcionalidade de divisão de conta com drag-drop diretamente no diálogo principal de mesas

---

## 🎯 O Que Foi Feito

Integrei o componente `BillSplitPanel` (com drag-drop de itens) diretamente no `TableDialogPOSModern`, criando uma nova aba dedicada à divisão de conta.

---

## 📋 Alterações Implementadas

### **1. Importações Adicionadas**

```typescript
// client/src/components/table-dialog/TableDialogPOSModern.tsx

import { BillSplitPanel } from '@/components/BillSplitPanel';
import { Split } from 'lucide-react';
```

---

### **2. Nova Seção de Navegação**

**Tipo atualizado:**
```typescript
type NavigationSection = 'overview' | 'guests' | 'orders' | 'payment' | 'split' | 'history';
```

**Nova aba adicionada:**
```typescript
const navigationItems: NavigationItem[] = [
  // ... itens existentes
  {
    id: 'split',
    label: 'Divisão',
    icon: <Split className="w-5 h-5" />,
    badge: guestsCount > 1 ? guestsCount : undefined,  // Badge só aparece com 2+ convidados
    shortcut: '5',
  },
  {
    id: 'history',
    label: 'Histórico',
    icon: <History className="w-5 h-5" />,
    shortcut: '6',  // Atualizado de '5' para '6'
  },
];
```

---

### **3. Nova Seção Split com BillSplitPanel**

```typescript
{activeSection === 'split' && (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Divisão de Conta</h2>
        <p className="text-muted-foreground">
          Arraste itens entre convidados para reorganizar ou dividir a conta
        </p>
      </div>
    </div>
    
    {/* Estados Vazios */}
    {currentTable?.status === 'livre' ? (
      // Mesa livre - mostrar mensagem
    ) : guestsCount === 0 ? (
      // Sem convidados - botão para adicionar
    ) : guestsCount === 1 ? (
      // Apenas 1 convidado - não pode dividir
    ) : (
      // 2+ convidados - mostrar BillSplitPanel
      <BillSplitPanel
        tableId={table?.id || ''}
        sessionId={currentTable?.currentSessionId}
        totalAmount={totalAmount}
      />
    )}
  </div>
)}
```

---

### **4. Atalhos de Teclado Atualizados**

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  // Section navigation shortcuts (1-6) - era (1-5)
  if (e.key >= '1' && e.key <= '6') {
    const sections: NavigationSection[] = [
      'overview', 'guests', 'orders', 'payment', 'split', 'history'
    ];
    setActiveSection(sections[parseInt(e.key) - 1]);
    return;
  }
  // ... resto dos atalhos
};
```

---

### **5. Botão "Dividir Conta" Atualizado no Rodapé**

**Antes:** Navegava para `/tables/:id/checkout?step=1&split=true`

**Agora:** Abre a aba "Divisão" no mesmo diálogo

```typescript
<Button 
  variant="outline" 
  size="lg"
  onClick={() => setActiveSection('split')}  // Muda para aba Split
  disabled={currentTable?.status === 'livre' || ordersCount === 0 || guestsCount < 2}
  className="gap-2"
>
  <Split className="w-5 h-5" />
  Dividir Conta
</Button>
```

---

## 🎨 Interface Visual

### **Nova Aba na Sidebar**

```
┌────────────────────────┐
│  Mesa 5                │
│  🟢 Ocupada            │
├────────────────────────┤
│  👥 2    💰 125 Kz    │
│  ⏱️ 1h 30min          │
├────────────────────────┤
│  [1] 📊 Visão Geral   │
│  [2] 👥 Pessoas (2)   │
│  [3] 🛒 Pedidos (5)   │
│  [4] 💳 Pagamento     │
│  [5] 🔀 Divisão (2)   │  ← NOVO
│  [6] 📜 Histórico     │
└────────────────────────┘
```

---

### **Tela de Divisão - Estados**

#### **Estado 1: Mesa Livre**
```
┌─────────────────────────────────────┐
│  Divisão de Conta                   │
├─────────────────────────────────────┤
│                                     │
│        🔀 (ícone grande)            │
│        Mesa Livre                   │
│   Inicie uma sessão para dividir    │
│                                     │
└─────────────────────────────────────┘
```

#### **Estado 2: Sem Convidados**
```
┌─────────────────────────────────────┐
│  Divisão de Conta                   │
├─────────────────────────────────────┤
│                                     │
│        👥 (ícone grande)            │
│        Nenhum Convidado             │
│   Adicione pessoas à mesa           │
│                                     │
│    [➕ Adicionar Pessoa]            │
│                                     │
└─────────────────────────────────────┘
```

#### **Estado 3: Apenas 1 Convidado**
```
┌─────────────────────────────────────┐
│  Divisão de Conta                   │
├─────────────────────────────────────┤
│                                     │
│        ⚠️ (ícone laranja)           │
│        Apenas 1 Convidado           │
│   Adicione mais pessoas para        │
│   ativar a divisão de conta         │
│                                     │
│    [➕ Adicionar Pessoa]            │
│                                     │
└─────────────────────────────────────┘
```

#### **Estado 4: 2+ Convidados - BillSplitPanel Ativo** ✅
```
┌────────────────────────────────────────────────────┐
│  Divisão de Conta                                  │
│  Arraste itens entre convidados para reorganizar   │
├────────────────────────────────────────────────────┤
│                                                     │
│  📊 Convidados                                     │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐      │
│  │ 👤 João         │  │ 👤 Maria        │      │
│  │ 💰 50 Kz        │  │ 💰 75 Kz        │      │
│  │ 🟢 Ativo        │  │ 🟢 Ativo        │      │
│  │                 │  │                 │      │
│  │ [ZONA DROP]     │  │ [ZONA DROP]     │      │
│  │ ⋮⋮ 🍔 50 Kz    │  │ ⋮⋮ 🥤 15 Kz    │      │
│  │                 │  │ ⋮⋮ 🍟 20 Kz    │      │
│  │                 │  │ ⋮⋮ 🍰 40 Kz    │      │
│  │                 │  │                 │      │
│  │ [💳 Pagar]      │  │ [💳 Pagar]      │      │
│  └──────────────────┘  └──────────────────┘      │
│                                                     │
│  [📜 Ver Histórico de Movimentações]              │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## 🎯 Funcionalidades Disponíveis

### **Na Nova Aba "Divisão":**

✅ **Drag & Drop de Itens**
- Arrastar itens entre convidados
- Visual feedback ao arrastar (50% opacidade)
- Zona de destino destacada ao passar mouse

✅ **Gestão de Convidados**
- Ver todos os convidados da mesa
- Status de cada um (Ativo, Pediu Conta, Pago, Saiu)
- Total gasto por convidado

✅ **Movimentação com Auditoria**
- Diálogo de motivo ao mover item
- Motivos pré-definidos ou personalizados
- Registro completo de todas movimentações

✅ **Pagamento Individual**
- Botão "Pagar" em cada convidado
- Suporte a múltiplos métodos de pagamento
- Impressão de conta individual

✅ **Histórico**
- Botão "Ver Histórico de Movimentações"
- Auditoria completa de tudo que foi movido
- Data, hora, usuário, motivo

✅ **Estados Vazios Informativos**
- Mensagens claras quando não pode dividir
- Botões de ação para resolver (ex: Adicionar Pessoa)
- Ícones visuais para cada estado

---

## ⌨️ Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| **1** | Visão Geral |
| **2** | Pessoas |
| **3** | Pedidos |
| **4** | Pagamento |
| **5** | **Divisão** ← NOVO |
| **6** | Histórico (era 5) |

---

## 🔐 Regras de Negócio

### **Quando a Aba "Divisão" Está Disponível:**

| Condição | Aba Visível? | Botão Habilitado? | O Que Mostra |
|----------|--------------|-------------------|--------------|
| Mesa livre | ✅ Sim | ❌ Não | Mensagem "Mesa Livre" |
| Sem convidados | ✅ Sim | ❌ Não | Botão "Adicionar Pessoa" |
| 1 convidado | ✅ Sim | ❌ Não | Mensagem "Precisa 2+" |
| 2+ convidados | ✅ Sim | ✅ Sim | BillSplitPanel completo |

### **Badge na Aba:**
- Mostra número de convidados **apenas se >= 2**
- Exemplo: "Divisão (3)" quando há 3 convidados
- Sem badge quando há 0 ou 1 convidado

### **Botão "Dividir Conta" no Rodapé:**
- **Desabilitado** se: mesa livre, sem pedidos, ou < 2 convidados
- **Ação:** Muda para a aba "Divisão" (não navega para outra página)

---

## 📊 Comparação: Antes vs Depois

### **ANTES (Comportamento Antigo):**

```
1. Abrir mesa
2. Clicar "Dividir Conta" (rodapé)
3. ❌ Fecha diálogo
4. ❌ Navega para /tables/:id/checkout?split=true
5. ❌ Perde contexto da mesa
6. Usa table-checkout-v2 (sem drag-drop)
```

### **DEPOIS (Novo Comportamento):**

```
1. Abrir mesa
2. Opção A: Clicar aba "Divisão" (5) na sidebar
   Opção B: Clicar "Dividir Conta" no rodapé
   Opção C: Pressionar tecla "5"
3. ✅ Diálogo permanece aberto
4. ✅ Muda para aba "Divisão"
5. ✅ BillSplitPanel com drag-drop carrega
6. ✅ Contexto mantido, navegação fluida
```

---

## 🚀 Vantagens da Nova Integração

### **1. UX Melhorada**
- ✅ Não fecha o diálogo
- ✅ Não perde contexto da mesa
- ✅ Navegação mais rápida (aba vs página)
- ✅ Atalho de teclado (tecla 5)

### **2. Funcionalidade Completa**
- ✅ Drag-drop de itens (não tinha no checkout-v2)
- ✅ Auditoria de movimentações
- ✅ Histórico visível
- ✅ Pagamentos individuais

### **3. Consistência**
- ✅ Todas as funções da mesa em um lugar
- ✅ Design uniforme com outras abas
- ✅ Mesma sidebar, mesmos atalhos

### **4. Eficiência Operacional**
- ✅ Menos cliques para dividir conta
- ✅ Arrastar itens é mais rápido que selecionar
- ✅ Visualização simultânea de todos convidados

---

## 🎓 Como Usar (Guia Rápido)

### **Cenário 1: Dividir Conta Igualmente**

```
1. Abrir mesa → Tecla "5" ou aba "Divisão"
2. Ver convidados e seus totais
3. Clicar "Pagar" em cada convidado
4. Selecionar método de pagamento
5. Confirmar
```

### **Cenário 2: Mover Itens Entre Convidados**

```
1. Abrir mesa → Aba "Divisão"
2. Clicar no convidado para expandir itens
3. Arrastar item (segurar no ícone ⋮⋮)
4. Soltar em outro convidado
5. Diálogo de motivo aparece
6. Escolher motivo e confirmar
7. Totais recalculam automaticamente
```

### **Cenário 3: Ver Histórico de Movimentações**

```
1. Abrir mesa → Aba "Divisão"
2. Clicar "Ver Histórico de Movimentações"
3. Ver lista completa:
   - Quando foi movido
   - Por quem
   - De onde para onde
   - Motivo
```

---

## 📝 Arquivos Modificados

| Arquivo | Alterações |
|---------|------------|
| `client/src/components/table-dialog/TableDialogPOSModern.tsx` | • Import BillSplitPanel<br>• Nova aba "Divisão"<br>• Seção split com estados<br>• Atalhos atualizados<br>• Botão rodapé atualizado |

**Total de linhas adicionadas:** ~60 linhas  
**Total de linhas modificadas:** ~10 linhas

---

## 🧪 Testes Recomendados

### **Checklist de Testes:**

```
☐ 1. Abrir mesa livre
   ☐ Aba "Divisão" aparece
   ☐ Mostra mensagem "Mesa Livre"
   ☐ Botão "Dividir Conta" desabilitado

☐ 2. Iniciar sessão sem convidados
   ☐ Aba "Divisão" aparece
   ☐ Mostra mensagem "Nenhum Convidado"
   ☐ Botão "Adicionar Pessoa" funciona

☐ 3. Adicionar 1 convidado
   ☐ Aba "Divisão" sem badge
   ☐ Mostra mensagem "Apenas 1 Convidado"
   ☐ Botão "Dividir Conta" desabilitado

☐ 4. Adicionar 2º convidado
   ☐ Aba "Divisão" com badge (2)
   ☐ BillSplitPanel carrega
   ☐ Botão "Dividir Conta" habilitado
   ☐ Ambos convidados aparecem

☐ 5. Drag & Drop
   ☐ Ícone ⋮⋮ aparece nos itens
   ☐ Consegue arrastar item
   ☐ Zona de destino destaca ao passar
   ☐ Diálogo de motivo aparece ao soltar
   ☐ Item move após confirmar
   ☐ Totais recalculam

☐ 6. Atalhos de teclado
   ☐ Tecla "5" abre aba "Divisão"
   ☐ Tecla "6" abre aba "Histórico"
   ☐ Outros atalhos (1-4) ainda funcionam

☐ 7. Pagamento individual
   ☐ Clicar "Pagar" em convidado
   ☐ Diálogo de pagamento abre
   ☐ Processar pagamento
   ☐ Status muda para "Pago"
   ☐ Não pode mais mover itens desse convidado

☐ 8. Histórico
   ☐ Clicar "Ver Histórico"
   ☐ Diálogo abre
   ☐ Lista movimentações
   ☐ Mostra detalhes completos
```

---

## 🐛 Problemas Conhecidos

**Nenhum no momento** - Implementação baseada em componente já existente e testado (`BillSplitPanel`).

---

## 🔄 Próximas Melhorias Sugeridas

### **1. Quick Actions para Divisão**
Adicionar botões rápidos na aba:
```typescript
<div className="flex gap-2 mb-4">
  <Button onClick={dividirIgualmente}>Dividir Igualmente</Button>
  <Button onClick={dividirPorPessoa}>Cada Um Paga o Seu</Button>
</div>
```

### **2. Preview de Quanto Cada Um Vai Pagar**
Mostrar resumo no topo:
```typescript
<div className="grid grid-cols-3 gap-3 mb-4">
  {guests.map(guest => (
    <Card>
      <CardContent>
        <p>{guest.name}</p>
        <p className="text-2xl font-bold">{formatKwanza(guest.total)}</p>
      </CardContent>
    </Card>
  ))}
</div>
```

### **3. Sugestões Inteligentes**
```typescript
// Detectar padrões e sugerir:
"🤔 Parece que João e Maria pediram juntos. Agrupar?"
```

### **4. Modo Visualização Compacta**
Botão para alternar entre:
- **Lista** (atual - com drag-drop)
- **Grid** (cards menores, mais convidados visíveis)

---

## 📚 Referências

**Componentes Relacionados:**
- `client/src/components/BillSplitPanel.tsx` (750 linhas)
- `client/src/components/DraggableOrderItem.tsx` (65 linhas)
- `client/src/components/DroppableGuestZone.tsx` (35 linhas)
- `client/src/components/MoveItemReasonDialog.tsx` (179 linhas)

**Documentação:**
- `ANALISE_DIVISAO_CONTA_MESAS.md` - Análise completa do sistema
- `GUIA_MOVIMENTACAO_PEDIDOS.md` - Guia de movimentação

**Bibliotecas:**
- `@dnd-kit/core` - Drag and drop
- `@tanstack/react-query` - Estado e sincronização

---

## ✅ Conclusão

A integração do `BillSplitPanel` no `TableDialogPOSModern` foi concluída com sucesso! Agora os usuários podem:

✅ **Dividir conta** sem sair do diálogo da mesa  
✅ **Arrastar itens** entre convidados facilmente  
✅ **Ver histórico** de todas movimentações  
✅ **Pagar contas individuais** de cada convidado  
✅ **Usar atalho de teclado** (tecla 5) para acesso rápido  

**Resultado:** UX significativamente melhorada e fluxo de trabalho mais eficiente! 🎉

---

**Implementado por:** Rovo Dev  
**Data:** 2026-01-03  
**Status:** ✅ Completo e Pronto para Uso
