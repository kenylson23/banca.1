import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DndContext, DragEndEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
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
  Loader2,
  ArrowRightLeft,
  History
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { PrintGuestBill } from '@/components/PrintGuestBill';
import { MoveItemDialog } from '@/components/MoveItemDialog';
import { DraggableOrderItem } from '@/components/DraggableOrderItem';
import { DroppableGuestZone } from '@/components/DroppableGuestZone';
import { AuditHistoryDialog } from '@/components/AuditHistoryDialog';
import { MoveItemReasonDialog } from '@/components/MoveItemReasonDialog';

interface TableGuest {
  id: string;
  sessionId: string;
  name: string | null;
  guestNumber: number;
  status: string;
  totalSpent: string;
  joinedAt: Date;
}

interface GuestOrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  price: string;
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
  const [moveItemDialog, setMoveItemDialog] = useState<{
    open: boolean;
    item: GuestOrderItem | null;
    currentGuest: TableGuest | null;
  }>({
    open: false,
    item: null,
    currentGuest: null,
  });
  const [draggedItem, setDraggedItem] = useState<GuestOrderItem | null>(null);
  const [auditHistoryOpen, setAuditHistoryOpen] = useState(false);
  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean;
    itemId: string;
    itemName: string;
    sourceGuestId: string;
    sourceGuestName: string;
    targetGuestId: string;
    targetGuestName: string;
  } | null>(null);

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

  const moveItemMutation = useMutation({
    mutationFn: async (data: { itemId: string; newGuestId: string; reason?: string }) => {
      const response = await apiRequest(
        'PATCH',
        `/api/order-items/${data.itemId}/reassign`,
        { 
          newGuestId: data.newGuestId,
          reason: data.reason,
        }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/sessions', sessionId, 'guests'] });
      toast({
        title: 'Item movido',
        description: 'O item foi movido com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao mover item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over) return;

    const itemId = active.id as string;
    const sourceGuestId = active.data.current?.sourceGuestId;
    const targetGuestId = over.id as string;
    const menuItemName = active.data.current?.menuItemName;

    // Don't move if dropped on same guest
    if (sourceGuestId === targetGuestId) return;

    // Check if target guest is eligible
    const targetGuest = ordersByGuest.find(g => g.guest.id === targetGuestId)?.guest;
    if (!targetGuest || targetGuest.status === 'pago' || targetGuest.status === 'saiu') {
      toast({
        title: 'Cliente inválido',
        description: 'O cliente de destino já pagou ou saiu',
        variant: 'destructive',
      });
      return;
    }

    const sourceGuest = ordersByGuest.find(g => g.guest.id === sourceGuestId)?.guest;
    
    // Open reason dialog
    setReasonDialog({
      open: true,
      itemId,
      itemName: menuItemName,
      sourceGuestId,
      sourceGuestName: sourceGuest?.name || `Cliente ${sourceGuest?.guestNumber}`,
      targetGuestId,
      targetGuestName: targetGuest.name || `Cliente ${targetGuest.guestNumber}`,
    });
  };

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
        guestName: og.guest.name || `Cliente ${og.guest.guestNumber}`,
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
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={(event) => {
        const item = event.active.data.current as GuestOrderItem;
        setDraggedItem(item);
      }}
    >
      <div className="space-y-4">
        {/* History Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAuditHistoryOpen(true)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            Ver Histórico de Alterações
          </Button>
        </div>

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
                                {guestData.guest.name || `Cliente ${guestData.guest.guestNumber}`}
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
                          <div className="flex gap-2 mt-2">
                            <PrintGuestBill
                              guest={guestData.guest}
                              orders={guestData.orders}
                              totalAmount={Number(guestData.totalAmount)}
                              tableName={`Mesa ${tableId}`}
                              variant="outline"
                              size="sm"
                            />
                            {guestData.guest.status !== 'pago' && (
                              <Button
                                size="sm"
                                variant="outline"
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
                      </div>

                      {selectedGuest === guestData.guest.id && guestData.orders.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm font-medium mb-3 flex items-center gap-2">
                            <span>Itens Consumidos:</span>
                            {ordersByGuest.length > 1 && (
                              <span className="text-xs text-muted-foreground font-normal">
                                (Arraste para mover)
                              </span>
                            )}
                          </div>
                          <DroppableGuestZone
                            guestId={guestData.guest.id}
                            disabled={guestData.guest.status === 'pago'}
                          >
                            <div className="space-y-1">
                              {guestData.orders.map((order) => (
                                <div key={order.orderId}>
                                  {order.items.map((item) => (
                                    <DraggableOrderItem
                                      key={item.id}
                                      id={item.id}
                                      menuItemName={item.menuItemName}
                                      quantity={item.quantity}
                                      totalPrice={item.totalPrice}
                                      guestId={guestData.guest.id}
                                      disabled={guestData.guest.status === 'pago' || ordersByGuest.length === 1}
                                    />
                                  ))}
                                </div>
                              ))}
                            </div>
                          </DroppableGuestZone>
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
                      <span>{og.guest.name || `Cliente ${og.guest.guestNumber}`}</span>
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

      {/* Move Item Dialog */}
      {moveItemDialog.item && moveItemDialog.currentGuest && (
        <MoveItemDialog
          open={moveItemDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setMoveItemDialog({ open: false, item: null, currentGuest: null });
            }
          }}
          item={moveItemDialog.item}
          currentGuest={moveItemDialog.currentGuest}
          availableGuests={ordersByGuest.map((og) => og.guest)}
          sessionId={sessionId || ''}
        />
      )}

      {/* Audit History Dialog */}
      <AuditHistoryDialog
        open={auditHistoryOpen}
        onOpenChange={setAuditHistoryOpen}
        sessionId={sessionId || ''}
      />

      {/* Move Item Reason Dialog (for drag & drop) */}
      {reasonDialog && (
        <MoveItemReasonDialog
          open={reasonDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setReasonDialog(null);
            }
          }}
          itemName={reasonDialog.itemName}
          sourceGuestName={reasonDialog.sourceGuestName}
          targetGuestName={reasonDialog.targetGuestName}
          onConfirm={(reason) => {
            moveItemMutation.mutate({
              itemId: reasonDialog.itemId,
              newGuestId: reasonDialog.targetGuestId,
              reason,
            });
            setReasonDialog(null);
          }}
          onCancel={() => {
            setReasonDialog(null);
          }}
        />
      )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedItem ? (
          <div className="bg-background border rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {draggedItem.quantity}x {draggedItem.menuItemName}
              </span>
              <span className="text-sm font-medium ml-4">
                {formatKwanza(draggedItem.totalPrice)}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
