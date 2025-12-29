# 🎯 GUIA VISUAL: O Que Você Deveria Ver no Diálogo de Mesas

## 📍 ONDE TESTAR

### Passo 1: Acesse o Painel Admin
```
1. Faça login como garçom/gerente/admin
2. Vá para a página "Gestão de Mesas" (/tables)
3. Clique em qualquer mesa OCUPADA
```

---

## 👁️ O QUE VOCÊ DEVERIA VER

### **ANTES da Integração (Lista Antiga):**
```
┌─────────────────────────────────┐
│ Pessoas (2)              [+]    │
├─────────────────────────────────┤
│ 1. João Silva                   │
│ 2. Convidado 1                  │
└─────────────────────────────────┘
```
❌ **Lista simples, sem ações, sem informações**

---

### **DEPOIS da Integração (Lista Nova - GuestsList):**

```
┌──────────────────────────────────────────────────────────────┐
│ Pessoas na Mesa (2)                         [+ Adicionar]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 👤 João Silva           [🥇 OURO]              ⋮   │     │
│  │    📱 +244 923...  |  🏆 250 pontos                 │     │
│  │    ──────────────────────────────────────────      │     │
│  │    Total: 12.500 Kz  |  Pago: 0  |  Pend: 12.500   │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 👤 Convidado 1          [Convidado]            ⋮   │     │
│  │    ──────────────────────────────────────────      │     │
│  │    Total: 5.000 Kz  |  Pago: 0  |  Pend: 5.000     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

✅ **Lista completa com:**
- Avatares coloridos (clientes) ou cinza (convidados)
- Badges de tier (Ouro, Prata, Bronze, Platina)
- Informações de contato e pontos
- **Subtotais individuais** (Total, Pago, Pendente)
- Menu de ações (⋮) em cada pessoa

---

## 🔘 ELEMENTOS VISUAIS DETALHADOS

### 1. **Cabeçalho da Lista**
```
┌──────────────────────────────────────────┐
│ Pessoas na Mesa (2)      [+ Adicionar]   │ ← Botão NOVO
└──────────────────────────────────────────┘
```
- Título: "Pessoas na Mesa (X)"
- Botão verde: "Adicionar" com ícone +
- Contador dinâmico de pessoas

---

### 2. **Card de Cliente Autenticado**
```
┌─────────────────────────────────────────────────────┐
│  🟠  João Silva                [🥇 OURO]        ⋮   │
│      ─────────────────────────────────────          │
│      📱 +244 923 456 789  |  🏆 250 pontos          │
│      ─────────────────────────────────────          │
│      Total: 12.500 Kz                               │
│      Pago: 0 Kz                                     │
│      Pendente: 12.500 Kz                            │
└─────────────────────────────────────────────────────┘
│                                                     │
│ 🟠 = Avatar circular colorido (gradiente laranja)  │
│ 🥇 = Badge do tier (com ícone)                      │
│ ⋮  = Menu dropdown de ações                        │
└─────────────────────────────────────────────────────┘
```

**Cores por Tier:**
- 💎 **Platina:** Roxo (`bg-purple-100 text-purple-700`)
- 🥇 **Ouro:** Amarelo (`bg-yellow-100 text-yellow-700`)
- 🥈 **Prata:** Cinza (`bg-gray-100 text-gray-700`)
- 🥉 **Bronze:** Laranja (`bg-orange-100 text-orange-700`)

---

### 3. **Card de Convidado Anônimo**
```
┌─────────────────────────────────────────────────────┐
│  ⚫  Convidado 1              [Convidado]       ⋮   │
│      ─────────────────────────────────────          │
│      Total: 5.000 Kz                                │
│      Pago: 0 Kz                                     │
│      Pendente: 5.000 Kz                             │
└─────────────────────────────────────────────────────┘
│                                                     │
│ ⚫ = Avatar circular CINZA (opacidade reduzida)     │
│ 👤 = Ícone genérico dentro do avatar                │
│ [Convidado] = Badge secundário                     │
│ Border = Pontilhado (border-dashed)                │
└─────────────────────────────────────────────────────┘
```

**Diferenças visuais:**
- Avatar cinza opaco vs colorido
- Badge "Convidado" vs Badge de tier
- Sem informações de telefone/pontos
- Border pontilhado vs sólido

---

### 4. **Menu de Ações (⋮)**

**Para Clientes:**
```
Click no ⋮ → Dropdown abre:

┌─────────────────────────────┐
│ 💳 Checkout Individual      │
│ 🗑️  Remover                 │
└─────────────────────────────┘
```

**Para Convidados:**
```
Click no ⋮ → Dropdown abre:

┌─────────────────────────────┐
│ 💳 Checkout Individual      │
│ ➕ Converter em Cliente     │
│ 🗑️  Remover                 │
└─────────────────────────────┘
```

---

### 5. **Estado Vazio**
```
┌──────────────────────────────────────────┐
│ Pessoas na Mesa (0)      [+ Adicionar]   │
├──────────────────────────────────────────┤
│                                          │
│            👥                            │
│     Nenhuma pessoa adicionada            │
│         à mesa ainda                     │
│                                          │
│      [Adicionar Pessoa]                  │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🎬 AÇÕES INTERATIVAS

### **1. Clicar no Botão "Adicionar"**
```
Modal "Adicionar Pessoa à Mesa" abre com 3 tabs:

┌────────────────────────────────────────────────────┐
│ Adicionar Pessoa à Mesa                      [X]   │
├────────────────────────────────────────────────────┤
│ [🔍 Buscar Cliente] [👤 Convidado] [➕ Novo Cliente]│
├────────────────────────────────────────────────────┤
│                                                    │
│  Tab Ativa: Buscar Cliente                        │
│                                                    │
│  [_________________]  ← Campo de busca            │
│                                                    │
│  Resultados:                                       │
│  ┌──────────────────────────────────────┐         │
│  │ 👤 João Silva  [🥇 OURO]  250 pts    │         │
│  │    📱 +244 923...                     │         │
│  └──────────────────────────────────────┘         │
│                                                    │
│  [Adicionar Cliente Selecionado]                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### **2. Clicar em "Checkout Individual"**
```
Modal "Checkout Individual" abre:

┌────────────────────────────────────────────────────┐
│ 💳 Checkout Individual                       [X]   │
├────────────────────────────────────────────────────┤
│                                                    │
│  Cliente VIP                                       │
│  ┌────────────────────────────────────────┐       │
│  │ João Silva                             │       │
│  │ Pontos Disponíveis: 🏆 250             │       │
│  └────────────────────────────────────────┘       │
│                                                    │
│  Resumo do Valor                                   │
│  ┌────────────────────────────────────────┐       │
│  │ Subtotal:          12.500 Kz           │       │
│  │ Já Pago:                0 Kz           │       │
│  │ ────────────────────────────           │       │
│  │ Total a Pagar:     12.500 Kz           │       │
│  └────────────────────────────────────────┘       │
│                                                    │
│  🎁 Resgatar Pontos                                │
│  ┌────────────────────────────────────────┐       │
│  │  [-]  [____100____]  [+]               │       │
│  │       Máx: 125 pts                     │       │
│  └────────────────────────────────────────┘       │
│                                                    │
│  ✅ Pontos a Ganhar: +125 pts                      │
│                                                    │
│  Método de Pagamento:                              │
│  ○ Dinheiro                                        │
│  ⦿ Multicaixa                                      │
│  ○ Transferência                                   │
│  ○ Cartão                                          │
│                                                    │
│  [Cancelar]  [Pagar 12.500 Kz]                    │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### **3. Clicar em "Converter em Cliente"**
```
Modal "Converter em Cliente" abre:

┌────────────────────────────────────────────────────┐
│ ➕ Converter em Cliente                      [X]   │
├────────────────────────────────────────────────────┤
│                                                    │
│  Cadastre o convidado como cliente para que       │
│  ele possa acumular pontos de fidelidade.         │
│                                                    │
│  Nome *                                            │
│  [_____________________________]                   │
│                                                    │
│  Telefone                                          │
│  [_____________________________]                   │
│                                                    │
│  Email                                             │
│  [_____________________________]                   │
│                                                    │
│  [Cancelar]  [Converter em Cliente]               │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🔍 COMO VERIFICAR SE ESTÁ FUNCIONANDO

### **Teste 1: Componente Integrado**
```bash
# Abrir DevTools → Elements → Procurar por:
<div class="space-y-3">
  <div class="flex items-center justify-between">
    <h3>Pessoas na Mesa (X)</h3>
    <button>Adicionar</button>
  </div>
</div>
```
✅ Se encontrar = GuestsList integrada

---

### **Teste 2: Botão Funcional**
```
1. Clicar no botão "Adicionar"
2. Modal deveria abrir
3. Se abre = AddGuestDialog funcionando ✅
4. Se não abre = Verificar console de erros
```

---

### **Teste 3: Subtotais Visíveis**
```
1. Mesa com pedidos existentes
2. Subtotais deveriam aparecer nos cards
3. Se aparecem = Cálculo automático funcionando ✅
```

---

## ❓ SE NÃO VER AS MUDANÇAS

### **Possível Causa 1: Cache do Navegador**
```bash
# Solução:
1. Ctrl + Shift + R (hard refresh)
2. Ou limpar cache do navegador
3. Ou abrir em janela anônima
```

### **Possível Causa 2: Build não atualizado**
```bash
# Solução:
npm run build
# Depois restart do servidor
```

### **Possível Causa 3: Arquivo não salvo**
```bash
# Verificar se TableDetailsDialogV3.tsx foi salvo
git status
# Deveria mostrar: modified: client/src/components/TableDetailsDialogV3.tsx
```

### **Possível Causa 4: Erro de Build**
```bash
# Verificar console do terminal
npm run dev
# Procurar por erros vermelhos
```

---

## 🎨 PREVIEW VISUAL COMPLETO

### **Layout Completo do Diálogo:**
```
┌──────────────────────────────────────────────────────────────┐
│  Mesa 5                                              [X]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [← Mesa 4]                                    [Mesa 6 →]   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐     │
│  │   Resumo    │  │   Pedidos   │  │ Pessoas (2)  [+]│     │
│  │   ────────  │  │   ────────  │  │ ─────────────── │     │
│  │ Total: 17.5K│  │ 3 pedidos   │  │ 👤 João Silva   │     │
│  │ Pago: 0     │  │             │  │    🥇 OURO      │     │
│  │ Pendente:   │  │             │  │    12.500 Kz ⋮  │     │
│  │   17.5K     │  │             │  │                 │     │
│  │             │  │             │  │ 👤 Convidado 1  │     │
│  │ [Checkout]  │  │             │  │    5.000 Kz  ⋮  │     │
│  └─────────────┘  └─────────────┘  └─────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Botão "Adicionar" visível no topo da lista
- [ ] Avatares coloridos para clientes
- [ ] Avatares cinza para convidados
- [ ] Badges de tier (Ouro, Prata, etc)
- [ ] Subtotais individuais visíveis
- [ ] Menu ⋮ em cada pessoa
- [ ] Clicar "Adicionar" abre modal com 3 tabs
- [ ] Clicar "Checkout" abre modal de pagamento
- [ ] Clicar "Converter" abre modal de cadastro

---

## 🚀 PRÓXIMO PASSO

**Se você NÃO vê nada disso:**
1. Verifique o console do navegador (F12)
2. Procure por erros vermelhos
3. Compartilhe o erro comigo para debug

**Se você VÊ tudo:**
1. Teste adicionar uma pessoa
2. Teste fazer checkout individual
3. Teste converter um convidado
4. Sistema está 100% funcional! 🎉

---

**Perguntas:**
- Você está vendo a lista nova?
- Qual navegador está usando?
- Há erros no console?
