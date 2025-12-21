import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  UsersThree, 
  Plus as PlusIcon, 
  Eye as EyeIcon, 
  CreditCard as CreditCardIcon, 
  Trash as TrashIcon, 
  ArrowsLeftRight,
  Check as CheckIcon,
  WarningCircle,
  Star as StarIcon,
  Crown as CrownIcon,
  ArrowUp as ArrowUpIcon,
  Clock as ClockIcon,
  ShoppingBag as ShoppingBagIcon
} from '@phosphor-icons/react';
import { formatKwanza } from '@/lib/formatters';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Table } from '@shared/schema';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to generate avatar colors based on guest number
const getAvatarColor = (guestNumber: number) => {
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-purple-500',
    'from-rose-500 to-pink-500',
    'from-teal-500 to-cyan-500',
  ];
  return colors[guestNumber % colors.length];
};

// Helper to get initials from name
const getInitials = (name: string | null, guestNumber: number) => {
  if (name && name.trim()) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
  return `C${guestNumber}`;
};

interface TableGuestsManagerProps {
  table: Table;
}

interface TableGuest {
  id: string;
  sessionId: string;
  name: string | null;
  guestNumber: number;
  status: string;
  joinedAt: Date;
}

interface OrdersByGuest {
  guest: TableGuest;
  orders: any[];
  subtotal: string; // API retorna como string, não number!
}

export function TableGuestsManager({ table }: TableGuestsManagerProps) {
  const { toast } = useToast();
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

  // Fetch all guests from the table
  const { data: allGuests = [], isLoading: loadingGuests } = useQuery<TableGuest[]>({
    queryKey: [`/api/tables/${table.id}/guests`],
    enabled: !!table.id,
    onSuccess: (data) => {
      console.log('🔍 Total de clientes retornados pela API:', data.length, data);
    },
  });

  // Fetch guests with their orders
  const { data: ordersData, isLoading: loadingOrders } = useQuery<{
    ordersByGuest: OrdersByGuest[];
    anonymousOrders: any[];
    totalAmount: string;
  }>({
    queryKey: [`/api/tables/${table.id}/orders-by-guest`],
    enabled: !!table.id,
    onSuccess: (data) => {
      console.log('🔍 Pedidos por cliente da API:', data.ordersByGuest);
      console.log('🔍 Total da mesa:', data.totalAmount);
    },
  });

  const isLoading = loadingGuests || loadingOrders;
  const ordersByGuest = ordersData?.ordersByGuest || [];
  const hasAnonymousOrders = (ordersData?.anonymousOrders || []).length > 0;

  // Merge all guests with their order data
  const guestsWithOrders = allGuests.map(guest => {
    const guestOrders = ordersByGuest.find(og => og.guest.id === guest.id);
    const subtotalValue = guestOrders?.subtotal ? parseFloat(guestOrders.subtotal) : 0;
    console.log(`🔍 Cliente ${guest.name || guest.guestNumber}:`, {
      guestId: guest.id,
      encontrouPedidos: !!guestOrders,
      subtotal: guestOrders?.subtotal,
      totalAmount: subtotalValue,
      numeroPedidos: guestOrders?.orders?.length || 0,
    });
    return {
      guest,
      orders: guestOrders?.orders || [],
      totalAmount: subtotalValue,
    };
  });

  // Delete guest mutation
  const deleteGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      return apiRequest('DELETE', `/api/tables/${table.id}/guests/${guestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}/orders-by-guest`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}/guests`] });
      toast({
        title: 'Cliente removido',
        description: 'Cliente foi removido da mesa com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover cliente',
        description: error.message || 'Não foi possível remover o cliente',
        variant: 'destructive',
      });
    },
  });

  // Mark guest as paid
  const markPaidMutation = useMutation({
    mutationFn: async (guestId: string) => {
      return apiRequest('PATCH', `/api/tables/${table.id}/guests/${guestId}`, {
        status: 'pago',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}/orders-by-guest`] });
      toast({
        title: 'Status atualizado',
        description: 'Cliente marcado como pago',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message || 'Não foi possível atualizar o status',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteGuest = (guestId: string) => {
    const guest = ordersByGuest.find(og => og.guest.id === guestId);
    if (!guest) return;

    if (guest.orders.length > 0) {
      toast({
        title: 'Não é possível remover',
        description: 'Este cliente tem pedidos. Mova os pedidos primeiro.',
        variant: 'destructive',
      });
      return;
    }

    deleteGuestMutation.mutate(guestId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando clientes...
        </CardContent>
      </Card>
    );
  }

  if (guestsWithOrders.length === 0 && !hasAnonymousOrders) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <UsersThree className="w-12 h-12 text-muted-foreground" weight="duotone" />
            <div>
              <p className="font-medium text-lg">Nenhum cliente na mesa</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clientes serão adicionados automaticamente ao criar pedidos associados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tableTotal = parseFloat(ordersData?.totalAmount || '0');
  const paidGuests = guestsWithOrders.filter(g => g.guest.status === 'pago').length;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
        <CardHeader>
          <div className="flex items-center justify-between relative">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <UsersThree className="w-5 h-5 text-primary" weight="duotone" />
                <CardTitle className="text-xl">Mesa {table.number}</CardTitle>
              </div>
              <CardDescription className="flex items-center gap-2">
                <StarIcon className="w-4 h-4" weight="duotone" />
                <span>{guestsWithOrders.length} {guestsWithOrders.length === 1 ? 'cliente' : 'clientes'} na mesa</span>
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatKwanza(tableTotal)}
              </div>
              <div className="flex items-center justify-end gap-2 mt-1">
                {paidGuests > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                    <CheckIcon className="w-3 h-3 mr-1" weight="bold" />
                    {paidGuests} pago{paidGuests > 1 ? 's' : ''}
                  </Badge>
                )}
                {paidGuests < guestsWithOrders.length && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100">
                    <ClockIcon className="w-3 h-3 mr-1" weight="duotone" />
                    {guestsWithOrders.length - paidGuests} pendente{(guestsWithOrders.length - paidGuests) > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Anonymous Orders Warning */}
      {hasAnonymousOrders && (
        <Card className="border-amber-500 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <WarningCircle className="w-5 h-5 text-amber-600 mt-0.5" weight="fill" />
              <div>
                <p className="font-medium text-amber-900">Pedidos sem cliente</p>
                <p className="text-sm text-amber-700 mt-1">
                  Esta mesa tem {ordersData?.anonymousOrders.length} pedido(s) não associado a nenhum cliente.
                  Use "Mover Itens" para associá-los.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guests List */}
      <ScrollArea className="h-[500px]">
        <AnimatePresence>
          <div className="space-y-4 pr-4">
            {guestsWithOrders.map((guestData, index) => {
              const guest = guestData.guest;
              const isPaid = guest.status === 'pago';
              const hasOrders = guestData.orders.length > 0;
              const guestName = guest.name || `Cliente ${guest.guestNumber}`;
              const avatarColor = getAvatarColor(guest.guestNumber);
              const initials = getInitials(guest.name, guest.guestNumber);
              const isTopSpender = index === 0; // First guest is top spender

              return (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`
                      relative overflow-hidden transition-all duration-300 hover:shadow-lg
                      ${isPaid 
                        ? 'border-green-500/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20' 
                        : 'border-primary/20 bg-gradient-to-br from-background to-muted/20 hover:border-primary/40'
                      }
                    `}
                  >

                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Guest Header with Avatar */}
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className={`
                              relative flex-shrink-0 w-16 h-16 rounded-xl 
                              bg-gradient-to-br ${avatarColor}
                              flex items-center justify-center
                              shadow-lg
                            `}
                          >
                            <span className="text-2xl font-bold text-white">
                              {initials}
                            </span>
                            {isPaid && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-white shadow-md">
                                <CheckIcon className="w-3 h-3 text-white" weight="bold" />
                              </div>
                            )}
                          </motion.div>

                          {/* Guest Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg truncate">{guestName}</h4>
                              {isPaid && (
                                <Badge variant="default" className="bg-green-600 flex-shrink-0">
                                  <CheckIcon className="w-3 h-3 mr-1" weight="bold" />
                                  Pago
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" weight="duotone" />
                                <span>Entrou às {format(new Date(guest.joinedAt), "HH:mm", { locale: ptBR })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ShoppingBagIcon className="w-3 h-3" weight="duotone" />
                                <span>{guestData.orders.length} {guestData.orders.length === 1 ? 'pedido' : 'pedidos'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right flex-shrink-0">
                            <div className={`
                              text-2xl font-bold
                              ${isPaid 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-primary'
                              }
                            `}>
                              {formatKwanza(guestData.totalAmount)}
                            </div>
                            {guestData.totalAmount > 0 && !isPaid && (
                              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                <ArrowUpIcon className="w-3 h-3" weight="bold" />
                                <span>Pendente</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedGuest(selectedGuest === guest.id ? null : guest.id)}
                      >
                        <EyeIcon className="w-4 h-4 mr-2" weight="duotone" />
                        {selectedGuest === guest.id ? 'Ocultar' : 'Ver'} Pedidos
                      </Button>

                      {!isPaid && hasOrders && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markPaidMutation.mutate(guest.id)}
                          disabled={markPaidMutation.isPending}
                        >
                          <CreditCardIcon className="w-4 h-4 mr-2" weight="duotone" />
                          Marcar como Pago
                        </Button>
                      )}

                      {!hasOrders && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGuest(guest.id)}
                          disabled={deleteGuestMutation.isPending}
                        >
                          <TrashIcon className="w-4 h-4 mr-2 text-destructive" weight="duotone" />
                          Remover
                        </Button>
                      )}
                    </div>

                    {/* Orders List (Expanded) */}
                    {selectedGuest === guest.id && guestData.orders.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Pedidos:</h5>
                          {guestData.orders.map((order: any) => (
                            <div key={order.orderId} className="text-sm border rounded p-2 bg-background">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Badge variant="outline" className="mb-1">
                                    {order.orderStatus === 'pendente' && 'Pendente'}
                                    {order.orderStatus === 'em_preparo' && 'Em Preparo'}
                                    {order.orderStatus === 'pronto' && 'Pronto'}
                                    {order.orderStatus === 'entregue' && 'Entregue'}
                                  </Badge>
                                  <div className="space-y-1 mt-1">
                                    {order.items?.map((item: any, idx: number) => (
                                      <div key={idx}>
                                        {item.quantity}x {item.menuItemName}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="font-medium">{formatKwanza(order.totalAmount)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  </ScrollArea>
    </div>
  );
}
