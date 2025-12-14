import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Users, 
  Split, 
  Check, 
  Clock, 
  Receipt, 
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  UserCircle,
  ShoppingBag,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TableGuest {
  id: string;
  sessionId: string;
  guestName: string | null;
  guestNumber: number;
  status: string;
  totalSpent: string;
  joinedAt: Date;
}

interface GuestOrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface GuestOrder {
  orderId: string;
  orderStatus: string;
  totalAmount: string;
  createdAt: Date;
  items: GuestOrderItem[];
}

interface OrdersByGuest {
  guest: TableGuest;
  orders: GuestOrder[];
  totalAmount: number;
}

interface BillSplit {
  id: string;
  splitType: string;
  totalAmount: string;
  splitCount: number;
  allocations: any;
  isFinalized: number;
  createdAt: Date;
}

interface BillSplitPanelProps {
  tableId: string;
  sessionId?: string;
  totalAmount: number;
}

const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { value: 'multicaixa', label: 'Multicaixa', icon: Smartphone },
  { value: 'transferencia', label: 'Transferência', icon: Building2 },
  { value: 'cartao', label: 'Cartão', icon: CreditCard },
];

const getGuestStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ativo: 'Ativo',
    aguardando_conta: 'Pediu Conta',
    pago: 'Pago',
    saiu: 'Saiu',
  };
  return labels[status] || status;
};

const getGuestStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ativo: 'bg-blue-500',
    aguardando_conta: 'bg-orange-500',
    pago: 'bg-green-500',
    saiu: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
};

export function BillSplitPanel({ tableId, sessionId, totalAmount }: BillSplitPanelProps) {
  const { toast } = useToast();
  const [splitType, setSplitType] = useState<'igual' | 'por_pessoa' | 'personalizado'>('por_pessoa');
  const [splitCount, setSplitCount] = useState(2);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');

  const { data: ordersData, isLoading: loadingOrders } = useQuery<{ ordersByGuest: OrdersByGuest[]; anonymousOrders: any[]; totalAmount: string }>({
    queryKey: [`/api/tables/${tableId}/orders-by-guest`],
    enabled: !!tableId,
  });
  
  const ordersByGuest = ordersData?.ordersByGuest || [];

  const { data: billSplits = [], isLoading: loadingSplits } = useQuery<BillSplit[]>({
    queryKey: [`/api/tables/${tableId}/bill-splits`],
    enabled: !!tableId,
  });

  const createSplitMutation = useMutation({
    mutationFn: async (data: { splitType: string; splitCount?: number; allocations?: any }) => {
      const res = await apiRequest('POST', `/api/tables/${tableId}/bill-splits`, {
        splitType: data.splitType,
        splitCount: data.splitCount,
        totalAmount: totalAmount.toFixed(2),
        allocations: data.allocations,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/bill-splits`] });
      toast({ title: 'Divisão criada', description: 'A conta foi dividida com sucesso.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar a divisão.',
        variant: 'destructive',
      });
    },
  });

  const finalizeSplitMutation = useMutation({
    mutationFn: async ({ splitId, paymentMethod }: { splitId: string; paymentMethod: string }) => {
      const res = await apiRequest('POST', `/api/tables/${tableId}/bill-splits/${splitId}/finalize`, {
        paymentMethod,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/bill-splits`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Pagamento finalizado', description: 'A parte foi paga com sucesso.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível finalizar o pagamento.',
        variant: 'destructive',
      });
    },
  });

  const updateGuestStatusMutation = useMutation({
    mutationFn: async ({ guestId, status }: { guestId: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/tables/${tableId}/guests/${guestId}`, {
        status,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      toast({ title: 'Status atualizado' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateSplit = () => {
    if (splitType === 'igual') {
      createSplitMutation.mutate({ splitType: 'igual', splitCount });
    } else if (splitType === 'por_pessoa') {
      const allocations = ordersByGuest.map(og => ({
        guestId: og.guest.id,
        guestName: og.guest.guestName || `Cliente ${og.guest.guestNumber}`,
        amount: Number(og.totalAmount).toFixed(2),
        isPaid: og.guest.status === 'pago',
      }));
      createSplitMutation.mutate({ 
        splitType: 'por_pessoa', 
        splitCount: ordersByGuest.length,
        allocations 
      });
    }
  };

  const handleMarkAsPaid = (guestId: string) => {
    updateGuestStatusMutation.mutate({ guestId, status: 'pago' });
  };

  const isLoading = loadingOrders || loadingSplits;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const guestsAwaitingBill = ordersByGuest.filter(og => og.guest.status === 'aguardando_conta');
  const totalPaid = ordersByGuest.filter(og => og.guest.status === 'pago')
    .reduce((sum, og) => sum + Number(og.totalAmount), 0);
  const remainingAmount = totalAmount - totalPaid;

  return (
    <div className="space-y-4">
      {guestsAwaitingBill.length > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/10">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-orange-500">
                {guestsAwaitingBill.length} cliente(s) pediram a conta
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total da Mesa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKwanza(totalAmount.toFixed(2))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faltam Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingAmount > 0 ? 'text-orange-500' : 'text-green-500'}`}>
              {formatKwanza(remainingAmount.toFixed(2))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5" />
            Consumo por Cliente
          </CardTitle>
          <CardDescription>
            {ordersByGuest.length} cliente(s) nesta mesa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ordersByGuest.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <UserCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum cliente registrado</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-3">
                {ordersByGuest.map((guestData) => (
                  <Card 
                    key={guestData.guest.id} 
                    className={`hover-elevate cursor-pointer ${selectedGuest === guestData.guest.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedGuest(selectedGuest === guestData.guest.id ? null : guestData.guest.id)}
                    data-testid={`card-guest-${guestData.guest.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {guestData.guest.guestName || `Cliente ${guestData.guest.guestNumber}`}
                              </span>
                              <Badge className={getGuestStatusColor(guestData.guest.status)}>
                                {getGuestStatusLabel(guestData.guest.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <ShoppingBag className="h-3 w-3" />
                              <span>{guestData.orders.length} pedido(s)</span>
                              <span>-</span>
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(guestData.guest.joinedAt), "HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatKwanza(Number(guestData.totalAmount).toFixed(2))}
                          </div>
                          {guestData.guest.status !== 'pago' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsPaid(guestData.guest.id);
                              }}
                              disabled={updateGuestStatusMutation.isPending}
                              data-testid={`button-mark-paid-${guestData.guest.id}`}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Marcar Pago
                            </Button>
                          )}
                        </div>
                      </div>

                      {selectedGuest === guestData.guest.id && guestData.orders.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm font-medium mb-2">Itens Consumidos:</div>
                          <div className="space-y-2">
                            {guestData.orders.map((order) => (
                              <div key={order.orderId} className="space-y-1">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      {item.quantity}x {item.menuItemName}
                                    </span>
                                    <span>{formatKwanza(item.totalPrice)}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {ordersByGuest.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Split className="h-5 w-5" />
              Dividir Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo de Divisão</Label>
              <Select value={splitType} onValueChange={(v) => setSplitType(v as any)}>
                <SelectTrigger data-testid="select-split-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="por_pessoa">Por Consumo Individual</SelectItem>
                  <SelectItem value="igual">Divisão Igual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {splitType === 'igual' && (
              <div>
                <Label>Dividir em quantas partes?</Label>
                <Input
                  type="number"
                  min="2"
                  value={splitCount}
                  onChange={(e) => setSplitCount(parseInt(e.target.value) || 2)}
                  data-testid="input-split-count"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Cada parte: {formatKwanza((totalAmount / splitCount).toFixed(2))}
                </p>
              </div>
            )}

            {splitType === 'por_pessoa' && (
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm space-y-1">
                  {ordersByGuest.map((og) => (
                    <div key={og.guest.id} className="flex justify-between">
                      <span>{og.guest.guestName || `Cliente ${og.guest.guestNumber}`}</span>
                      <span className="font-medium">{formatKwanza(Number(og.totalAmount).toFixed(2))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleCreateSplit}
              disabled={createSplitMutation.isPending}
              data-testid="button-create-split"
            >
              {createSplitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Split className="h-4 w-4 mr-2" />
                  Criar Divisão
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {billSplits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Divisões Criadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {billSplits.map((split) => (
              <Card key={split.id} data-testid={`card-split-${split.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {split.splitType === 'igual' ? 'Divisão Igual' : 'Por Consumo'}
                        </span>
                        <Badge variant={split.isFinalized ? 'default' : 'secondary'}>
                          {split.isFinalized ? 'Finalizado' : 'Pendente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {split.splitCount} partes - {formatKwanza(split.totalAmount)} total
                      </p>
                    </div>
                    {!split.isFinalized && (
                      <div className="flex items-center gap-2">
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger className="w-[140px]" data-testid={`select-payment-method-${split.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                <div className="flex items-center gap-2">
                                  <method.icon className="h-4 w-4" />
                                  {method.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => finalizeSplitMutation.mutate({ 
                            splitId: split.id, 
                            paymentMethod 
                          })}
                          disabled={finalizeSplitMutation.isPending}
                          data-testid={`button-finalize-split-${split.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Finalizar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
