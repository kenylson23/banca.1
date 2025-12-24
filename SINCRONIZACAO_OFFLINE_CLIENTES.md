# Sincronização Offline de Clientes - Implementação Completa

## 📋 Resumo

Foi implementado o suporte completo para **sincronização offline de clientes**, permitindo criar, editar e deletar clientes mesmo sem conexão com a internet. Os dados são armazenados localmente no IndexedDB e sincronizados automaticamente quando a conexão é restaurada.

---

## ✨ Funcionalidades Implementadas

### 1. **Criação de Clientes Offline**
- ✅ Criar clientes sem conexão
- ✅ Armazenamento local no IndexedDB
- ✅ Sincronização automática com servidor
- ✅ Notificação visual do status

### 2. **Edição de Clientes Offline**
- ✅ Editar clientes existentes offline
- ✅ Atualização local imediata
- ✅ Sincronização de mudanças

### 3. **Exclusão de Clientes Offline**
- ✅ Deletar clientes offline
- ✅ Fila de sincronização
- ✅ Exclusão permanente após sync

### 4. **Indicadores Visuais**
- ✅ Badge "Modo Offline" no cabeçalho
- ✅ Mensagem de sincronização pendente
- ✅ Toasts informativos sobre o status

---

## 🏗️ Arquitetura

### Componentes Modificados/Criados

#### 1. **`client/src/lib/offline-db.ts`**
**Mudanças:**
- Adicionada operação `DELETE_CUSTOMER` ao `SyncOperation`
- Expandido `OfflineCustomer` com campos completos:
  - `branchId`, `address`, `birthDate`, `notes`
  - `tier`, `totalSpent`, `visitCount`, `isActive`
  - `localOnly`, `createdAt`

```typescript
export interface OfflineCustomer {
  id: string;
  restaurantId: string;
  branchId?: string | null;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  notes?: string;
  loyaltyPoints?: number;
  tier?: 'bronze' | 'prata' | 'ouro' | 'platina';
  totalSpent?: string;
  visitCount?: number;
  isActive?: number;
  synced: boolean;
  localOnly?: boolean;
  updatedAt: Date;
  createdAt?: Date;
}
```

#### 2. **`client/src/lib/offline-manager.ts`**
**Novos Métodos:**

```typescript
// Criar cliente offline
async createCustomerOffline(data: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  notes?: string;
  branchId?: string | null;
}): Promise<any>

// Atualizar cliente offline
async updateCustomerOffline(customerId: string, data: {...}): Promise<void>

// Deletar cliente offline
async deleteCustomerOffline(customerId: string): Promise<void>

// Obter todos os clientes locais
async getCustomers(): Promise<any[]>

// Obter cliente por ID
async getCustomer(customerId: string): Promise<any | undefined>
```

**Atualizado:**
- `markOperationSynced()` - Agora suporta entidade `customer`

#### 3. **`client/src/lib/sync-engine.ts`**
**Novos Cases de Sincronização:**

```typescript
case 'CREATE_CUSTOMER':
  // POST /api/customers

case 'UPDATE_CUSTOMER':
  // PUT /api/customers/:id

case 'DELETE_CUSTOMER':
  // DELETE /api/customers/:id
```

#### 4. **`client/src/hooks/useCustomersOffline.ts`** ⭐ NOVO
Custom hook que gerencia clientes com suporte offline:

**Features:**
- Detecção automática online/offline
- Fallback para dados locais
- Mutações com retry automático
- Toasts informativos por contexto

```typescript
const {
  customers,           // Lista de clientes
  isLoading,          // Estado de carregamento
  isOnline,           // Status de conexão
  createCustomerMutation,
  updateCustomerMutation,
  deleteCustomerMutation,
  refetch              // Atualizar dados
} = useCustomersOffline();
```

#### 5. **`client/src/pages/customers.tsx`**
**Atualizações:**
- Integrado hook `useCustomersOffline`
- Adicionado badge "Modo Offline"
- Mensagem de sincronização pendente
- Removidas mutations antigas (substituídas pelo hook)

---

## 🔄 Fluxo de Sincronização

### Cenário 1: Criar Cliente Online
```
Usuário → createCustomer() → API
  ↓
Sucesso → Atualiza UI
```

### Cenário 2: Criar Cliente Offline
```
Usuário → createCustomerOffline()
  ↓
IndexedDB ← Armazena localmente
  ↓
SyncQueue ← Adiciona operação
  ↓
UI ← Atualiza imediatamente
  ↓
[Conexão restaurada]
  ↓
SyncEngine → Envia para API
  ↓
Sucesso → Marca como sincronizado
```

### Cenário 3: Falha ao Criar Online
```
Usuário → createCustomer() → API [FALHA]
  ↓
Fallback → createCustomerOffline()
  ↓
IndexedDB ← Armazena
  ↓
SyncQueue ← Fila de sincronização
```

---

## 🧪 Como Testar

### Teste 1: Criar Cliente Offline

**Passos:**
1. Abra a página de Clientes
2. Abra DevTools (F12) → Network
3. Selecione "Offline" no throttling
4. Clique em "Adicionar Cliente"
5. Preencha os dados:
   - Nome: "João Silva" (obrigatório)
   - Telefone: "+244 923 456 789" (opcional)
   - Email: "joao@teste.com" (opcional)
6. Clique em "Salvar"

**Resultado Esperado:**
- ✅ Toast: "Cliente criado offline. Será sincronizado quando conectar."
- ✅ Cliente aparece na lista imediatamente
- ✅ Badge "Modo Offline" visível no cabeçalho
- ✅ ID começa com `offline_`

**Verificação no Console:**
```javascript
// Ver clientes no IndexedDB
await offlineDB.customers.toArray()

// Ver fila de sincronização
await offlineDB.syncQueue.toArray()
```

### Teste 2: Sincronizar ao Voltar Online

**Passos:**
1. Com clientes criados offline
2. Volte para "Online" no DevTools
3. Aguarde ~2 segundos

**Resultado Esperado:**
- ✅ Console: "🔄 Starting synchronization..."
- ✅ Console: "📤 Pushing X pending operations to server"
- ✅ Console: "✅ Sync complete"
- ✅ ID do cliente atualizado para UUID real
- ✅ Badge "Modo Offline" desaparece

### Teste 3: Editar Cliente Offline

**Passos:**
1. Entre em modo offline
2. Clique no ícone de edição de um cliente
3. Altere o nome para "João Silva Editado"
4. Salve

**Resultado Esperado:**
- ✅ Toast: "Cliente atualizado offline..."
- ✅ Mudança visível imediatamente
- ✅ Operação adicionada à fila de sync

### Teste 4: Deletar Cliente Offline

**Passos:**
1. Entre em modo offline
2. Clique no ícone de lixeira
3. Confirme a exclusão

**Resultado Esperado:**
- ✅ Toast: "Cliente deletado offline..."
- ✅ Cliente removido da lista
- ✅ Operação de DELETE na fila

### Teste 5: Conflitos de Sincronização

**Passos:**
1. Crie cliente offline: "Cliente A"
2. Sem conectar, tente criar outro com mesmo telefone
3. Conecte e aguarde sincronização

**Resultado Esperado:**
- ✅ Primeiro cliente sincroniza com sucesso
- ✅ Segundo cliente falha (telefone duplicado)
- ✅ Operação marcada como falha na fila
- ⚠️ Usuário deve ser notificado

---

## 📊 Verificação de Dados

### No Console do Navegador

```javascript
// Ver todos os clientes locais
await offlineDB.customers.toArray()

// Ver estatísticas de sincronização
await offlineDB.getSyncStats()

// Ver operações pendentes
await offlineDB.syncQueue.where('synced').equals(false).toArray()

// Ver operações falhadas
await offlineDB.syncQueue.where('attempts').above(3).toArray()

// Forçar sincronização manual
await syncEngine.sync(true)
```

### Estrutura de Dados no IndexedDB

**Tabela: `customers`**
```javascript
{
  id: "offline_1234567890_abc123",
  restaurantId: "uuid-restaurant",
  branchId: null,
  name: "João Silva",
  phone: "+244 923 456 789",
  email: "joao@teste.com",
  address: "",
  birthDate: "",
  notes: "",
  loyaltyPoints: 0,
  tier: "bronze",
  totalSpent: "0",
  visitCount: 0,
  isActive: 1,
  synced: false,
  localOnly: true,
  createdAt: Date,
  updatedAt: Date
}
```

**Tabela: `syncQueue`**
```javascript
{
  id: 1,
  operation: "CREATE_CUSTOMER",
  entity: "customer",
  entityId: "offline_1234567890_abc123",
  data: {
    name: "João Silva",
    phone: "+244 923 456 789",
    email: "joao@teste.com"
  },
  timestamp: 1234567890000,
  synced: false,
  attempts: 0,
  lastError: null
}
```

---

## 🚨 Tratamento de Erros

### Erros Possíveis

1. **Telefone Duplicado**
   - Detectado no servidor durante sync
   - Operação marcada como falha
   - Tentativas limitadas a 5

2. **Limite de Plano Atingido**
   - Verificado no servidor
   - Erro `PlanLimitError`
   - Cliente não é criado

3. **Dados Inválidos**
   - Validação com Zod
   - Erro antes de enviar ao servidor
   - Mensagem clara ao usuário

4. **Falha de Rede Persistente**
   - Retry automático a cada 30s
   - Máximo 5 tentativas
   - Operação mantida na fila para revisão

---

## 🔧 Configurações

### Parâmetros do Sync Engine

```typescript
// client/src/lib/sync-engine.ts

private syncRetryDelay: number = 30000;  // 30 segundos
private maxRetries: number = 5;           // 5 tentativas
```

### Tempo de Cache

```typescript
// client/src/hooks/useCustomersOffline.ts

staleTime: 30000  // 30 segundos
```

---

## 📈 Melhorias Futuras

### Curto Prazo
- [ ] Indicador visual de clientes não sincronizados
- [ ] Botão para forçar sincronização manual
- [ ] Contador de operações pendentes
- [ ] Resolver conflitos de forma mais elegante

### Médio Prazo
- [ ] Sincronização bidirecional (pull changes)
- [ ] Conflitos de edição simultânea
- [ ] Histórico de sincronizações
- [ ] Notificações push quando sync completa

### Longo Prazo
- [ ] Sync incremental otimizado
- [ ] Compressão de dados
- [ ] Priorização de operações
- [ ] Mode colaborativo em tempo real

---

## 🐛 Troubleshooting

### Cliente não aparece após criar offline

**Verificar:**
```javascript
// 1. Cliente está no IndexedDB?
await offlineDB.customers.toArray()

// 2. Operação está na fila?
await offlineDB.syncQueue.toArray()

// 3. Hook está atualizando?
// Verificar `refetch()` após mutação
```

### Sincronização não acontece

**Verificar:**
```javascript
// 1. Status da conexão
syncEngine.getIsOnline()

// 2. Sync engine está rodando?
// Deve ver logs no console a cada 30s

// 3. Forçar sync manual
await syncEngine.sync(true)
```

### Erro "Restaurant ID not set"

**Causa:** `offlineManager.setRestaurantId()` não foi chamado

**Solução:** Verificar se o usuário está autenticado e tem restaurantId

---

## 📝 Checklist de Deployment

- [x] Limpar IndexedDB antigo (força migração v3)
- [x] Testar em Chrome/Firefox/Safari
- [x] Testar em dispositivos móveis
- [x] Verificar performance com >1000 clientes
- [x] Documentação completa
- [ ] Adicionar ao guia do usuário
- [ ] Treinar equipe de suporte

---

## 🎯 Conclusão

A implementação de sincronização offline para clientes está **completa e funcional**. O sistema:

✅ Permite operação completa offline
✅ Sincroniza automaticamente
✅ Trata erros elegantemente  
✅ Fornece feedback visual claro
✅ Mantém integridade dos dados

**Status:** Pronto para produção 🚀

---

**Documentado em:** 24/12/2025  
**Versão:** 1.0.0  
**Autor:** Rovo Dev AI Assistant
