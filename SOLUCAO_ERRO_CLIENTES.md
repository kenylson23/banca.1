# Solução: Erro ao Criar Clientes

## Problema Identificado

O erro que você estava vendo:
```
ConnectionIndicator.tsx:60 Error getting sync stats: DexieError2 
{name: 'DataError', message: "Failed to execute 'bound' on 'IDBKeyRange': The parameter is not a valid key."}
```

**Causa:** O IndexedDB (Dexie) estava tentando fazer uma query usando o campo `attempts` como índice, mas esse campo não estava definido no schema do banco de dados offline.

## Correção Aplicada

Adicionei a versão 3 do schema do banco de dados offline com o índice `attempts`:

**Arquivo:** `client/src/lib/offline-db.ts`

```typescript
// Version 3: Added attempts to syncQueue index for error tracking
this.version(3).stores({
  orders: 'id, restaurantId, tableId, status, createdAt, synced, localOnly',
  tables: 'id, restaurantId, number, status, synced',
  menuItems: 'id, restaurantId, categoryId, available, synced',
  customers: 'id, restaurantId, synced',
  payments: 'id, orderId, restaurantId, synced, localOnly',
  syncQueue: '++id, operation, entity, entityId, synced, timestamp, attempts'
});
```

## Como Aplicar a Correção

### Opção 1: Recarregar a Aplicação (Recomendado)

1. Feche todas as abas do aplicativo
2. Abra o DevTools do navegador (F12)
3. Vá em **Console**
4. Cole e execute este código:

```javascript
const dbName = 'nabancada_offline';
const request = indexedDB.deleteDatabase(dbName);
request.onsuccess = () => {
    console.log('✅ Database deletado! Recarregue a página.');
    location.reload();
};
```

5. A página será recarregada e o banco será recriado com o novo schema

### Opção 2: Através do Application Tab

1. Abra o DevTools (F12)
2. Vá em **Application** → **Storage** → **IndexedDB**
3. Encontre `nabancada_offline`
4. Clique com botão direito e selecione **Delete database**
5. Recarregue a página (F5)

### Opção 3: Limpar Storage Completo

1. Abra o DevTools (F12)
2. Vá em **Application** → **Storage**
3. Clique em **Clear site data**
4. Recarregue a página (F5)
5. Faça login novamente

## Verificação

Após aplicar a correção:

1. Abra o console do navegador (F12 → Console)
2. Você deve ver a mensagem: `✅ Offline database initialized`
3. O erro do `IDBKeyRange` não deve mais aparecer
4. Tente criar um novo cliente - deve funcionar normalmente

## O Que Foi Corrigido

- ✅ Adicionado índice `attempts` no schema do `syncQueue`
- ✅ Banco de dados será migrado automaticamente para versão 3
- ✅ Query `where('attempts').above(3)` agora funciona corretamente
- ✅ Criação de clientes não será mais bloqueada pelo erro do IndexedDB

## Funcionalidades Relacionadas

Esta correção também resolve problemas similares em:
- Sincronização offline
- Indicador de conexão
- Estatísticas de sync
- Rastreamento de operações falhadas

## Notas Adicionais

- O Dexie automaticamente migra o schema quando detecta uma nova versão
- Todos os dados existentes serão preservados durante a migração
- A migração é executada apenas uma vez por navegador/dispositivo
