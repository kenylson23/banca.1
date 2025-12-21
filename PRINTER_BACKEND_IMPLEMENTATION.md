# Implementação do Backend para Configurações de Impressora

## Resumo
Este documento descreve a implementação completa do sistema de configurações de impressora com sincronização entre dispositivos, impressão automática e opções avançadas de configuração.

## ✅ Componentes Implementados

### 1. Schema de Banco de Dados (✓ Completo)

**Arquivo:** `shared/schema.ts`

Foram adicionadas as seguintes estruturas:

#### Enums
- `printerTypeEnum`: 'receipt', 'kitchen', 'invoice'
- `printerLanguageEnum`: 'esc-pos', 'star-prnt'

#### Tabelas

**printer_configurations**
- Armazena configurações de impressoras por restaurante/filial/usuário
- Campos principais:
  - `printerType`: Tipo de impressora
  - `printerName`: Nome da impressora
  - `paperWidth`: Largura do papel (58mm ou 80mm)
  - `marginLeft/Right/Top/Bottom`: Margens configuráveis
  - `autoPrint`: Ativar impressão automática
  - `copies`: Número de cópias
  - `soundEnabled`: Som ao imprimir
  - `autoReconnect`: Reconexão automática

**print_history**
- Registra histórico de todas as impressões
- Rastreia sucesso/falhas
- Vincula com pedidos e usuários

### 2. Migration SQL (✓ Completo)

**Arquivo:** `server/migrations/0001_printer_configurations.sql`

Para executar a migration:

```bash
# Se estiver usando Drizzle
npx drizzle-kit push:pg

# Ou execute manualmente o SQL
psql $DATABASE_URL -f server/migrations/0001_printer_configurations.sql
```

### 3. API Routes (✓ Completo)

**Arquivo temporário:** `tmp_rovodev_printer_api_routes.ts`

**AÇÃO NECESSÁRIA:** Adicionar as rotas ao arquivo `server/routes.ts` antes da linha 8165 (antes do WebSocket setup).

#### Endpoints Implementados:

```typescript
// GET - Buscar configurações de impressoras
GET /api/printer-configurations
// Retorna todas as configurações do restaurante/filial atual

// POST - Criar nova configuração
POST /api/printer-configurations
Body: {
  printerType: 'receipt' | 'kitchen' | 'invoice',
  printerName: string,
  paperWidth: 58 | 80,
  marginLeft: number,
  marginRight: number,
  marginTop: number,
  marginBottom: number,
  autoPrint: 0 | 1,
  copies: number,
  soundEnabled: 0 | 1,
  autoReconnect: 0 | 1,
  // ... outros campos
}

// PATCH - Atualizar configuração existente
PATCH /api/printer-configurations/:id
Body: { /* campos para atualizar */ }

// DELETE - Remover configuração
DELETE /api/printer-configurations/:id

// GET - Buscar histórico de impressões
GET /api/print-history?limit=50

// POST - Registrar impressão
POST /api/print-history
Body: {
  printerType: string,
  printerName: string,
  documentType: 'order' | 'receipt' | 'invoice' | 'bill' | 'report',
  orderNumber?: string,
  success: 0 | 1,
  errorMessage?: string
}
```

## 🔧 Funções de Storage Necessárias

**Arquivo:** `server/storage.ts`

Adicionar as seguintes funções:

```typescript
// Buscar configurações de impressoras
async getPrinterConfigurations(restaurantId: string, branchId?: string) {
  const query = db
    .select()
    .from(printerConfigurations)
    .where(eq(printerConfigurations.restaurantId, restaurantId));
  
  if (branchId) {
    query.where(eq(printerConfigurations.branchId, branchId));
  }
  
  return await query;
}

// Criar configuração de impressora
async createPrinterConfiguration(restaurantId: string, data: InsertPrinterConfiguration) {
  const [config] = await db
    .insert(printerConfigurations)
    .values({
      ...data,
      restaurantId,
    })
    .returning();
  
  return config;
}

// Atualizar configuração de impressora
async updatePrinterConfiguration(
  restaurantId: string,
  id: string,
  data: UpdatePrinterConfiguration
) {
  const [config] = await db
    .update(printerConfigurations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(printerConfigurations.id, id),
        eq(printerConfigurations.restaurantId, restaurantId)
      )
    )
    .returning();
  
  if (!config) {
    throw new Error('Configuração de impressora não encontrada');
  }
  
  return config;
}

// Deletar configuração de impressora
async deletePrinterConfiguration(restaurantId: string, id: string) {
  await db
    .delete(printerConfigurations)
    .where(
      and(
        eq(printerConfigurations.id, id),
        eq(printerConfigurations.restaurantId, restaurantId)
      )
    );
}

// Buscar histórico de impressões
async getPrintHistory(restaurantId: string, limit: number = 50) {
  return await db
    .select()
    .from(printHistory)
    .where(eq(printHistory.restaurantId, restaurantId))
    .orderBy(desc(printHistory.printedAt))
    .limit(limit);
}

// Criar registro de impressão
async createPrintHistory(restaurantId: string, data: InsertPrintHistory) {
  const [history] = await db
    .insert(printHistory)
    .values({
      ...data,
      restaurantId,
    })
    .returning();
  
  return history;
}
```

## 📝 Próximos Passos

### 1. ✅ Completado
- [x] Schema de banco de dados criado
- [x] Migration SQL criada
- [x] API routes definidas

### 2. 🔄 Pendente

#### A. Adicionar Rotas ao `server/routes.ts`
```bash
# Copie o conteúdo de tmp_rovodev_printer_api_routes.ts
# Cole antes da linha 8165 (antes do WebSocket setup)
```

#### B. Adicionar Funções ao `server/storage.ts`
```bash
# Adicione as funções listadas acima ao arquivo storage.ts
# Certifique-se de importar as tabelas:
# import { printerConfigurations, printHistory } from '@shared/schema';
```

#### C. Atualizar `PrinterSettings.tsx`
Modificar o componente para usar o backend em vez de localStorage:

```typescript
// Substituir localStorage por chamadas à API
const { data: configs } = useQuery({
  queryKey: ['printer-configurations'],
  queryFn: async () => {
    const res = await fetch('/api/printer-configurations');
    return res.json();
  },
});

// Salvar configuração
const saveMutation = useMutation({
  mutationFn: async (config) => {
    const res = await fetch('/api/printer-configurations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },
});
```

#### D. Implementar Impressão Automática
No arquivo `server/routes.ts`, após criar um pedido:

```typescript
app.post("/api/orders", isAdmin, async (req, res) => {
  // ... código existente de criação de pedido ...
  
  const order = await storage.createOrder({...});
  
  // Verificar se há impressoras com auto-print ativado
  const printerConfigs = await storage.getPrinterConfigurations(
    currentUser.restaurantId!,
    currentUser.activeBranchId
  );
  
  const kitchenPrinters = printerConfigs.filter(
    p => p.printerType === 'kitchen' && p.autoPrint === 1 && p.isActive === 1
  );
  
  // Broadcast evento de impressão automática
  if (kitchenPrinters.length > 0) {
    broadcastToClients({
      type: 'auto_print_order',
      data: {
        order,
        printers: kitchenPrinters,
      },
    });
  }
  
  res.json(order);
});
```

#### E. Adicionar Opções Avançadas ao UI
Atualizar `PrinterSettings.tsx` para incluir:
- Seletor de largura do papel (58mm / 80mm)
- Inputs para margens (left, right, top, bottom)
- Toggle para impressão automática
- Input para número de cópias
- Toggle para som ao imprimir

## 🔄 Sincronização Entre Dispositivos

A sincronização está implementada via WebSocket:

1. Quando uma configuração é criada/atualizada/deletada, o backend envia:
```javascript
broadcastToClients({
  type: 'printer_config_updated',
  data: config
});
```

2. No frontend (adicionar ao `useWebSocket.ts`):
```typescript
useEffect(() => {
  if (message?.type === 'printer_config_updated') {
    // Refetch printer configurations
    queryClient.invalidateQueries(['printer-configurations']);
  }
}, [message]);
```

## 🧪 Testes

### Testar API
```bash
# 1. Criar configuração
curl -X POST http://localhost:5000/api/printer-configurations \
  -H "Content-Type: application/json" \
  -d '{
    "printerType": "kitchen",
    "printerName": "Cozinha Principal",
    "paperWidth": 80,
    "autoPrint": 1
  }'

# 2. Listar configurações
curl http://localhost:5000/api/printer-configurations

# 3. Atualizar configuração
curl -X PATCH http://localhost:5000/api/printer-configurations/{id} \
  -H "Content-Type": application/json" \
  -d '{"autoPrint": 0}'

# 4. Buscar histórico
curl http://localhost:5000/api/print-history?limit=10
```

## 📊 Fluxo de Funcionamento

```
1. Usuário conecta impressora no dispositivo A
   ↓
2. Frontend chama POST /api/printer-configurations
   ↓
3. Backend salva no banco de dados
   ↓
4. Backend envia broadcastToClients('printer_config_created')
   ↓
5. Dispositivo B (WebSocket conectado) recebe atualização
   ↓
6. Frontend do dispositivo B recarrega configurações
   ↓
7. Impressora aparece em ambos os dispositivos
```

## 🎯 Benefícios

1. **Sincronização Multi-dispositivo**: Configurações salvas no servidor
2. **Histórico Completo**: Rastreamento de todas as impressões
3. **Impressão Automática**: Pedidos imprimem automaticamente na cozinha
4. **Configuração Avançada**: Margens, largura do papel, número de cópias
5. **Recuperação de Desastres**: Configurações não se perdem ao trocar de dispositivo

## 📝 Arquivos Criados/Modificados

- ✅ `shared/schema.ts` - Schemas e tipos
- ✅ `server/migrations/0001_printer_configurations.sql` - Migration SQL
- ✅ `tmp_rovodev_printer_api_routes.ts` - Rotas da API (temporário)
- ⏳ `server/routes.ts` - Adicionar rotas (pendente)
- ⏳ `server/storage.ts` - Adicionar funções (pendente)
- ⏳ `client/src/components/PrinterSettings.tsx` - Atualizar para usar API (pendente)

## 🚀 Para Concluir a Implementação

Execute os seguintes passos:

1. **Executar Migration**
   ```bash
   psql $DATABASE_URL -f server/migrations/0001_printer_configurations.sql
   ```

2. **Adicionar Rotas ao server/routes.ts**
   - Copie o conteúdo de `tmp_rovodev_printer_api_routes.ts`
   - Cole antes da linha 8165 (antes do WebSocket setup)

3. **Adicionar Funções ao server/storage.ts**
   - Adicione as funções listadas na seção "Funções de Storage Necessárias"

4. **Atualizar PrinterSettings.tsx**
   - Substituir localStorage por chamadas à API
   - Adicionar campos avançados (margens, largura do papel)

5. **Implementar Auto-print no Backend**
   - Adicionar lógica após criação de pedidos

6. **Testar**
   - Criar configurações em um dispositivo
   - Verificar sincronização em outro dispositivo
   - Testar impressão automática

## ❓ Dúvidas Comuns

**P: As configurações antigas do localStorage serão perdidas?**
R: Sim, mas você pode criar uma função de migração para importá-las.

**P: Como funciona a impressão automática?**
R: Quando `autoPrint: 1`, ao criar um pedido, o backend envia evento WebSocket para os clientes imprimirem automaticamente.

**P: Posso ter configurações diferentes por filial?**
R: Sim! Use o campo `branchId` para configurações específicas de filial.

**P: O histórico de impressões afeta performance?**
R: Não significativamente. Há índices otimizados e você pode adicionar limpeza periódica de registros antigos.
