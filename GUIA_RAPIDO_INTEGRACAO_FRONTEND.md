# 🚀 Guia Rápido: Integração Frontend (30 minutos)

## ✅ O Backend está 100% pronto! Falta apenas conectar o frontend.

---

## 📋 CHECKLIST (3 tarefas simples)

### ✅ Tarefa 1: Integrar Auto-Detecção no Customer Menu (10 min)

**Arquivo:** `client/src/pages/customer-menu.tsx`

**Passo 1:** Adicionar import no topo
```tsx
import { useAutoDetectCustomer } from '@/hooks/useAutoDetectCustomer';
```

**Passo 2:** Adicionar hook dentro do componente (após os outros hooks)
```tsx
export default function CustomerMenu() {
  // ... hooks existentes (useParams, useQuery, etc)
  
  // ✅ ADICIONAR AQUI:
  const { isLinking } = useAutoDetectCustomer(
    table?.id, 
    table?.currentSessionId
  );
  
  // ... resto do código
}
```

**Resultado:** Cliente autenticado será automaticamente vinculado à mesa ao escanear QR Code! 🎉

---

### ✅ Tarefa 2: Armazenar guestId no Contexto (15 min)

**Arquivo:** `client/src/contexts/CustomerAuthContext.tsx`

**Passo 1:** Adicionar guestId ao estado e interface
```tsx
interface CustomerAuthContextType {
  // ... campos existentes
  guestId: string | null; // ← ADICIONAR
}

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  // ... estados existentes
  const [guestId, setGuestId] = useState<string | null>(null); // ← ADICIONAR
  
  // ... resto do código
```

**Passo 2:** Adicionar função para buscar guestId
```tsx
// Dentro do CustomerAuthProvider, após as outras funções:

const fetchMyGuestId = useCallback(async (tableId: string) => {
  if (!customer?.id) return null;
  
  try {
    const response = await fetch(`/api/tables/${tableId}/guests`);
    if (response.ok) {
      const guests = await response.json();
      const myGuest = guests.find((g: any) => g.customerId === customer.id);
      setGuestId(myGuest?.id || null);
      return myGuest?.id;
    }
  } catch (error) {
    console.error('Erro ao buscar guestId:', error);
  }
  return null;
}, [customer?.id]);
```

**Passo 3:** Buscar guestId após autenticação bem-sucedida
```tsx
// Na função de login bem-sucedido, adicionar:

const handleLoginSuccess = async (customerData: any, tableId?: string) => {
  setCustomer(customerData);
  setIsAuthenticated(true);
  
  // ✅ ADICIONAR AQUI:
  if (tableId) {
    await fetchMyGuestId(tableId);
  }
};
```

**Passo 4:** Exportar no value do Provider
```tsx
const value = {
  // ... valores existentes
  guestId, // ← ADICIONAR
  fetchMyGuestId, // ← ADICIONAR
};
```

**Passo 5:** Atualizar tipo exportado
```tsx
export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
}
```

---

### ✅ Tarefa 3: Enviar guestId ao Criar Pedido (5 min)

**Arquivo:** `client/src/pages/customer-menu.tsx`

**Passo 1:** Obter guestId do contexto
```tsx
export default function CustomerMenu() {
  // ... imports e hooks existentes
  
  const { isAuthenticated, customer, guestId } = useCustomerAuth(); // ← Adicionar guestId
  
  // ... resto do código
}
```

**Passo 2:** Incluir guestId nos items ao criar pedido
```tsx
// Procurar a função que cria o pedido (geralmente dentro de handleCheckout ou similar)
// Modificar a parte onde monta os items:

const createOrderMutation = useMutation({
  mutationFn: async (orderData: any) => {
    const response = await apiRequest('POST', '/api/public/orders', {
      ...orderData,
      items: orderData.items.map((item: any) => ({
        ...item,
        guestId: guestId, // ← ADICIONAR ESTA LINHA
      })),
    });
    return response.json();
  },
  // ... onSuccess, onError
});
```

**Resultado:** Todos os pedidos agora serão automaticamente vinculados ao guest! 🎉

---

## 🎯 VERIFICAÇÃO RÁPIDA

Após implementar as 3 tarefas, testar:

### Teste 1: Auto-Detecção
```
1. Abrir console do navegador
2. Fazer login como cliente
3. Escanear QR Code de uma mesa
4. Verificar logs: "[GUEST AUTO-DETECT] Guest criado: xxx"
5. ✅ Sucesso se aparecer log de criação
```

### Teste 2: Pedido Vinculado
```
1. Com cliente logado e vinculado
2. Adicionar item ao carrinho
3. Fazer pedido
4. Verificar no backend: order_items deve ter guestId preenchido
5. ✅ Sucesso se guestId não for null
```

### Teste 3: Subtotal Atualizado
```
1. Após fazer pedido
2. Abrir TableDetailsDialog da mesa
3. Verificar lista de guests
4. ✅ Sucesso se subtotal do guest mostrar valor correto (não zero)
```

---

## 🐛 TROUBLESHOOTING

### Problema: guestId sempre null
**Causa:** fetchMyGuestId não está sendo chamado  
**Solução:** Verificar se tableId está disponível ao chamar a função

### Problema: Pedido sem guestId
**Causa:** guestId não está sendo passado nos items  
**Solução:** Verificar se `guestId` está no contexto e sendo mapeado corretamente

### Problema: "Guest não encontrado"
**Causa:** Auto-detecção falhou  
**Solução:** 
1. Verificar se mesa tem sessão ativa (currentSessionId)
2. Verificar se cliente está autenticado
3. Ver logs do console

---

## 📝 CÓDIGO COMPLETO DE EXEMPLO

### customer-menu.tsx (trecho relevante)
```tsx
import { useAutoDetectCustomer } from '@/hooks/useAutoDetectCustomer';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

export default function CustomerMenu() {
  const { slug, tableNumber } = useParams();
  const { isAuthenticated, customer, guestId } = useCustomerAuth();
  
  // Buscar dados da mesa
  const { data: table } = useQuery({
    queryKey: [`/api/public/restaurants/${slug}/tables/${tableNumber}`],
  });
  
  // ✅ Auto-detecção de guest
  useAutoDetectCustomer(table?.id, table?.currentSessionId);
  
  // Criar pedido
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/public/orders', {
        restaurantSlug: slug,
        tableId: table?.id,
        customerId: customer?.id,
        customerName: customer?.name,
        orderType: 'mesa',
        items: orderData.items.map((item: any) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions || [],
          notes: item.notes,
          guestId: guestId, // ← VINCULA AO GUEST
        })),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Pedido realizado com sucesso!' });
    },
  });
  
  // ... resto do componente
}
```

---

## ✅ APÓS IMPLEMENTAÇÃO

Você terá:
- ✅ Auto-detecção funcionando
- ✅ Pedidos vinculados automaticamente
- ✅ Subtotais calculados em tempo real
- ✅ Checkout individual funcional
- ✅ Pontos de fidelidade corretos
- ✅ Sistema 100% operacional!

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- **ANALISE_FLUXO_MESA_COMPLETO.md** - Análise detalhada dos problemas
- **PLANO_IMPLEMENTACAO_DETALHADO.md** - Plano completo de implementação
- **RESUMO_IMPLEMENTACAO_CORRECOES.md** - Resumo executivo
- **IMPLEMENTACAO_GESTAO_GUESTS_HIBRIDA.md** - Sistema híbrido completo

---

## 🎉 BOA SORTE!

Tempo estimado: **30 minutos**  
Dificuldade: **Fácil** 🟢  
Impacto: **Crítico** 🔴

Após estas 3 simples mudanças, o sistema estará 100% funcional! 🚀
