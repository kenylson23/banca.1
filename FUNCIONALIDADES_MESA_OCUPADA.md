# 📋 FUNCIONALIDADES DO DIÁLOGO DE MESA OCUPADA

## 🎯 Análise Completa das Funcionalidades Disponíveis

---

## 📊 **VISÃO GERAL**

Quando uma mesa está **ocupada** (status: `ocupada`, `em_andamento` ou `aguardando_pagamento`), o diálogo exibe um **dashboard completo** com múltiplas funcionalidades divididas em 3 áreas principais:

---

## 🏗️ **ESTRUTURA DO DIÁLOGO**

### Layout em 2 Colunas:
1. **Coluna Esquerda (2/3)**: Pedidos e informações principais
2. **Coluna Direita (1/3)**: Métricas, ações e sidebar

---

## 📌 **SEÇÃO 1: CABEÇALHO (Header Premium)**

### Informações Exibidas:
- ✅ **Número da Mesa** (tamanho grande, destaque)
- ✅ **Status Visual** (badge colorido com animação)
- ✅ **Capacidade da Mesa** (ex: "Capacidade: 6 pessoas")
- ✅ **Tempo de Sessão** (ex: "Aberta há 2 horas")
- ✅ **Número de Convidados** (ex: "4 convidados")
- ✅ **Navegação Entre Mesas** (botões Anterior/Próxima)
- ✅ **Atalhos de Teclado** (hints visuais: ←, →, ESC)

### Cores por Status:
- **Ocupada**: Indigo (azul-roxo) 🔵
- **Em Andamento**: Cyan (azul-claro) 🔷
- **Aguardando Pagamento**: Âmbar (laranja) 🟠

---

## 📌 **SEÇÃO 2: LISTA DE PEDIDOS (Área Principal)**

### Exibição de Cada Pedido:
- ✅ **Card Animado** (toast-style com gradiente)
- ✅ **Status do Pedido** (Novo, Confirmado, Preparando, Pronto)
- ✅ **Tempo Decorrido** (ex: "há 15 minutos")
- ✅ **Barra de Progresso** (visual de tempo)
- ✅ **Alerta de Atraso** (se > 30 minutos, fica vermelho)
- ✅ **Efeito "Novo"** (animação de pulso se < 2 minutos)
- ✅ **Lista de Itens do Pedido**:
  - Nome do item
  - Quantidade
  - Opções/Modificadores
  - Preço unitário
- ✅ **Total do Pedido** (destaque)
- ✅ **Número do Pedido** (ex: "#P0001")

### Ações por Pedido:
- 🖨️ **Imprimir** (botão no header)
- 👁️ **Ver Detalhes** (clique no card)

### Estado Vazio:
- Se não há pedidos: Mostra mensagem "Nenhum pedido ativo"

---

## 📌 **SEÇÃO 3: SIDEBAR DIREITA (Métricas + Ações)**

### 📊 **KPIs (Indicadores Chave)**

#### 1️⃣ Total de Pedidos
```
Icon: ShoppingBag (sacola)
Valor: "3 pedidos"
Cor: Indigo
```

#### 2️⃣ Valor Total
```
Icon: DollarSign (cifrão)
Valor: "12.500,00 Kz"
Cor: Emerald (verde)
Destaque: Gradiente + tamanho grande
```

#### 3️⃣ Média por Pessoa
```
Icon: TrendingUp (gráfico)
Valor: "3.125,00 Kz"
Cor: Violet
```

#### 4️⃣ Tempo de Mesa
```
Icon: Timer (cronômetro)
Valor: "2h 15m"
Cor: Cyan
```

---

### 🎬 **AÇÕES PRINCIPAIS**

#### ✅ 1. **Novo Pedido** (Primary Action)
```
Icon: Plus + ShoppingBag
Cor: Gradiente Indigo → Indigo escuro
Atalho: Tecla "N"
Ação: Redireciona para PDV com tableId
```

#### ✅ 2. **Checkout / Pagamento**
```
Icon: CreditCard
Cor: Gradiente Emerald → Verde escuro
Atalho: Tecla "P"
Ação: Redireciona para /table-checkout-v2/:tableId
```

#### ✅ 3. **Adicionar Pessoa** (Guest Management)
```
Icon: UserPlus
Cor: Violeta
Atalho: Tecla "G"
Opções:
  - Buscar cliente existente
  - Cadastro rápido (nome + telefone)
  - Convidado anônimo
```

#### ✅ 4. **Dividir Conta**
```
Icon: Split
Cor: Amber
Atalho: Tecla "S"
Ação: Expande lista de convidados com valores individuais
Mostra: Média por pessoa
```

#### ✅ 5. **QR Code Auto-Registro**
```
Icon: QrCode
Cor: Cyan
Atalho: Tecla "Q"
Ação: Gera QR Code para clientes escanearem e se registrarem
Link: /guest-register/:tableId
```

#### ✅ 6. **Mudar Status**
```
Icon: RefreshCw
Cor: Neutro
Dropdown com opções:
  - Ocupada
  - Em Andamento (Servindo)
  - Aguardando Pagamento
  - Livre (apenas se permitido)
Validação: Transições devem ser válidas
```

#### ✅ 7. **Encerrar Sessão**
```
Icon: StopCircle
Cor: Vermelho
Ação: Fecha mesa (valida pagamentos pendentes)
Modal de Confirmação:
  - Se há dívidas: Mostra alerta + opção de forçar (admin only)
  - Se tudo pago: Fecha normalmente
```

---

### 🧾 **LISTA DE CONVIDADOS (Expansível)**

Quando "Dividir Conta" está ativo:

#### Por Convidado:
- ✅ **Avatar** (inicial ou número)
- ✅ **Nome** (ou "Convidado #N")
- ✅ **Valor Individual** (média por pessoa)
- ✅ **Badge de Cliente** (se vinculado a customer)
- ✅ **Botão Remover** (ícone lixeira)

#### Ações por Convidado:
- 🗑️ **Remover da Mesa**
- 🔄 **Converter em Cliente** (se anônimo)
- 💳 **Fazer Checkout Individual**

---

## ⌨️ **ATALHOS DE TECLADO**

| Tecla | Ação | Status |
|-------|------|--------|
| **N** | Novo Pedido | ✅ Ativo |
| **P** | Checkout/Pagamento | ✅ Ativo |
| **G** | Adicionar Pessoa | ✅ Ativo |
| **S** | Dividir Conta | ✅ Ativo |
| **Q** | Mostrar QR Code | ✅ Ativo |
| **←** | Mesa Anterior | ✅ Ativo |
| **→** | Próxima Mesa | ✅ Ativo |
| **ESC** | Fechar Diálogo | ✅ Ativo |

**Proteção**: Atalhos desabilitados quando modal está aberto (exceto ESC)

---

## 🎨 **EFEITOS VISUAIS E ANIMAÇÕES**

### Animações Implementadas:
- ✅ **Gradientes Dinâmicos** no header
- ✅ **Padrão Animado** de fundo (bolinhas se movendo)
- ✅ **Pulse Effect** em pedidos novos
- ✅ **Barra de Progresso** por tempo de espera
- ✅ **Fade In/Out** ao abrir/fechar
- ✅ **Scale Animation** em cards de pedido
- ✅ **Glow Effects** ambientes sutis
- ✅ **Status Badge Pulsante** (círculo animado)

### Cores e Temas:
- **Fundo**: Dark theme (slate-900 → slate-800)
- **Texto**: Branco com opacidades variadas
- **Acentos**: Gradientes coloridos por status
- **Bordas**: Sutis com transparência

---

## 🔐 **VALIDAÇÕES E PROTEÇÕES**

### 1. **Encerrar Sessão**
- ✅ Valida se há valores pendentes
- ✅ Lista convidados com dívidas
- ✅ Apenas admin pode forçar fechamento
- ✅ Registro de auditoria

### 2. **Mudar Status**
- ✅ Valida transições permitidas
- ✅ Bloqueia mudanças inválidas
- ✅ Mensagem de erro descritiva

### 3. **Adicionar Pessoa**
- ✅ Verifica se sessão está ativa
- ✅ Optimistic update (UI responde instantaneamente)
- ✅ Rollback automático em erro

### 4. **Remover Convidado**
- ✅ Confirmação implícita
- ✅ Optimistic update
- ✅ Rollback em erro

---

## 📱 **RESPONSIVIDADE**

### Desktop (atual):
- ✅ Layout 2 colunas
- ✅ Sidebar fixa à direita
- ✅ Diálogo 90vh de altura
- ✅ Max-width: 6xl (1280px)

### Mobile (não implementado):
- ⚠️ Falta adaptação para telas pequenas
- ⚠️ Sidebar deveria colapsar
- ⚠️ Ações principais no bottom bar

---

## 🚨 **ALERTAS E NOTIFICAÇÕES**

### Tipos de Toast:
1. **Sucesso** (verde): Ação completada
2. **Erro** (vermelho): Falha na operação
3. **Aviso** (amarelo): Valores pendentes
4. **Info** (azul): Informações gerais

### Exemplos:
- ✅ "Sessão iniciada"
- ✅ "Pessoa adicionada"
- ❌ "Erro ao encerrar sessão"
- ⚠️ "Mesa possui 5.000 Kz pendente"

---

## 🔄 **FLUXOS DE TRABALHO**

### Fluxo Típico:
1. **Abrir Mesa** → Iniciar Sessão (definir pessoas)
2. **Adicionar Convidados** → Opcional (vincular clientes)
3. **Fazer Pedidos** → Botão "Novo Pedido" (N)
4. **Monitorar** → Ver status em tempo real
5. **Pagamento** → Checkout (P) ou Dividir (S)
6. **Encerrar** → Fechar sessão (valida tudo pago)

### Fluxo Alternativo (QR Code):
1. Abrir Mesa → Mostrar QR Code (Q)
2. Clientes escaneiam → Auto-registro
3. Clientes fazem pedidos pelo app
4. Pagamento individual online
5. Mesa fecha automaticamente

---

## 📈 **MÉTRICAS E ANALYTICS**

### Dados Calculados:
- ✅ **Total de Pedidos**: Count de orders
- ✅ **Valor Total**: Sum de totalPrice
- ✅ **Média por Pessoa**: Total ÷ Guests
- ✅ **Tempo de Mesa**: Now - sessionStart
- ✅ **Tempo de Espera**: Now - orderCreatedAt
- ✅ **Taxa de Ocupação**: Progress bar visual

---

## 🎯 **FUNCIONALIDADES FUTURAS (Sugestões)**

### Não Implementadas:
- ⏳ **Gorjeta Sugerida** (10%, 15%, 20%)
- ⏳ **Histórico de Pedidos** da mesa
- ⏳ **Chat com Cozinha** (perguntas sobre pedido)
- ⏳ **Preferências de Mesa** (alergias, restrições)
- ⏳ **Avaliação de Atendimento** (estrelas)
- ⏳ **Programa de Fidelidade** (pontos por mesa)
- ⏳ **Split Personalizado** (não apenas média)
- ⏳ **Imprimir Pré-Conta** (antes do pagamento)

---

## ✨ **RESUMO EXECUTIVO**

### ✅ **Funcionalidades Core (7)**
1. Novo Pedido
2. Checkout/Pagamento
3. Adicionar Pessoa
4. Dividir Conta
5. QR Code
6. Mudar Status
7. Encerrar Sessão

### 📊 **Informações Exibidas (12)**
1. Número da Mesa
2. Status
3. Capacidade
4. Tempo de Sessão
5. Convidados
6. Lista de Pedidos
7. Total de Pedidos
8. Valor Total
9. Média por Pessoa
10. Tempo de Mesa
11. Status de Cada Pedido
12. Tempo de Espera

### ⚡ **Atalhos (8)**
N, P, G, S, Q, ←, →, ESC

### 🎨 **Efeitos Visuais (8)**
Gradientes, Animações, Pulso, Progress Bar, Glow, Fade, Scale, Badge Animado

---

**Status Geral**: ✅ **COMPLETO E FUNCIONAL**

O diálogo está extremamente bem desenvolvido com:
- ✅ Design moderno e profissional
- ✅ UX intuitiva com feedback visual
- ✅ Performance otimizada
- ✅ Validações robustas
- ✅ Atalhos de teclado eficientes

**Pontos de Melhoria**:
- 📱 Adicionar responsividade mobile
- 🍴 Implementar split personalizado
- 💰 Adicionar sugestão de gorjeta
- 📊 Dashboard de histórico da mesa

---

*Documento gerado automaticamente em 29/12/2024*
