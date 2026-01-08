# Correção: Erro ao Fechar Mesa com Valores Pendentes

## Problema Identificado

Ao tentar fechar uma mesa com valores pendentes de pagamento, o sistema retornava erro 400:
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
```

## Causa Raiz

O backend estava corretamente validando e retornando informações detalhadas sobre valores pendentes:
- `pendingAmount`: Valor total pendente
- `unpaidGuests`: Lista de convidados com valores não pagos
- `canForceClose`: Se o usuário tem permissão para forçar fechamento
- `warnings`: Avisos adicionais

**Porém**, o frontend não estava preservando e tratando adequadamente essas informações do erro 400.

## Correções Implementadas

### 1. **queryClient.ts** - Preservar propriedades do erro
```typescript
const error = new Error(errorData.message || res.statusText) as Error & {
  status?: number;
  [key: string]: any;
};
Object.assign(error, { status: res.status, ...errorData });
```

**Antes**: Apenas `message` era preservada  
**Depois**: Todas as propriedades do erro (status, pendingAmount, unpaidGuests, etc.) são preservadas

### 2. **useTableMutations.ts** - Tratamento inteligente de erros
```typescript
onError: (error: any) => {
  if (error.status === 400 && error.pendingAmount) {
    const guestsList = error.unpaidGuests?.length > 0
      ? error.unpaidGuests.map((g: any) => `${g.name}: ${g.pending} Kz`).join(', ')
      : '';
    
    toast({
      title: 'Atenção: Valores Pendentes',
      description: `Mesa possui ${error.pendingAmount} Kz pendente de pagamento. ${guestsList}`,
      variant: 'destructive',
    });
  }
}
```

### 3. **TableDialogPOSModern.tsx** - Mesma lógica + melhoria na construção do erro
```typescript
if (!res.ok) {
  const errorData = await res.json();
  const error = new Error(errorData.message || errorData.error || 'Erro ao fechar mesa') as Error & {
    status?: number;
    [key: string]: any;
  };
  Object.assign(error, { status: res.status, ...errorData });
  throw error;
}
```

### 4. **TableCheckoutDialog.tsx** - Atualização de parâmetros
```typescript
// Mutation atualizada para aceitar forceClose
mutationFn: async ({ tableId, forceClose = false }: { tableId: string; forceClose?: boolean }) => {
  return apiRequest('POST', `/api/tables/${tableId}/close-session`, { forceClose });
}

// Chamada atualizada
await closeSessionMutation.mutateAsync({ tableId: table.id });
```

## Resultado

Agora, quando o usuário tenta fechar uma mesa com valores pendentes:

1. ✅ **Toast informativo** é exibido com:
   - Valor total pendente
   - Lista de convidados com valores não pagos
   - Cada convidado e seu valor pendente

2. ✅ **Usuário é informado claramente** do problema antes de tentar forçar o fechamento

3. ✅ **Base para funcionalidade futura**: Sistema já está preparado para implementar botão "Forçar Fechamento" para admins (verificando `error.canForceClose`)

## Exemplo de Mensagem ao Usuário

**Antes:**
```
❌ Erro ao encerrar sessão
Mesa não possui sessão ativa
```

**Depois:**
```
⚠️ Atenção: Valores Pendentes
Mesa possui 250.00 Kz pendente de pagamento.
• João Silva: 150.00 Kz
• Maria Santos: 100.00 Kz
```

## Arquivos Modificados

- `client/src/lib/queryClient.ts`
- `client/src/components/table-dialog/hooks/useTableMutations.ts`
- `client/src/components/table-dialog/TableDialogPOSModern.tsx`
- `client/src/components/tables/TableCheckoutDialog.tsx`

## Próximos Passos (Opcional)

1. Implementar diálogo de confirmação para "Forçar Fechamento" (apenas para admins)
2. Adicionar opção de registrar pagamento diretamente do erro
3. Melhorar UX com botões de ação rápida no toast
