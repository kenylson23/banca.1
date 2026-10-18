import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, UtensilsCrossed, Truck, ShoppingBag, MapPin, Phone, User, Award, Mail, Printer } from "lucide-react";
import type { PDVOrder } from "./types";
import { formatKwanza, PrintInvoice, PrintOrder, PrinterStatusBadge, printerService, usePrinter, useToast } from "./PreviewAdapters";

interface OrderDetailsDialogProps {
  order: PDVOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors = {
  pendente: "bg-orange-500 text-white",
  em_preparo: "bg-blue-500 text-white",
  pronto: "bg-green-500 text-white",
  servido: "bg-muted text-muted-foreground",
};

const statusLabels = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  servido: "Servido",
};

const orderTypeIcons = {
  mesa: UtensilsCrossed,
  delivery: Truck,
  balcao: ShoppingBag,
};

const orderTypeLabels = {
  mesa: "Mesa",
  delivery: "Delivery",
  takeout: "Retirada",
  balcao: "Balcão",
  pdv: "PDV",
};

const paymentStatusColors = {
  pago: "bg-green-500 text-white",
  parcial: "bg-yellow-500 text-white",
  nao_pago: "bg-orange-500 text-white",
};

const paymentStatusLabels = {
  pago: "Pago",
  parcial: "Parcial",
  nao_pago: "Não pago",
};

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null;

  const OrderTypeIcon = orderTypeIcons[order.orderType as keyof typeof orderTypeIcons] || ShoppingBag;
  const { toast } = useToast();
  const { getPrinterByType } = usePrinter();
  const [isReprinting, setIsReprinting] = React.useState(false);

  const handleReprint = async () => {
    const kitchenPrinter = getPrinterByType('kitchen');
    
    if (!kitchenPrinter) {
      toast({
        title: "Impressora não conectada",
        description: "Conecte uma impressora de cozinha nas configurações",
        variant: "destructive",
      });
      return;
    }

    setIsReprinting(true);
    try {
      await printerService.printKitchenOrder('kitchen', {
        orderNumber: order.orderNumber || order.id.slice(-6),
        orderType: order.orderType || 'balcao',
        customerName: order.customerName || undefined,
        tableNumber: order.table?.number || undefined,
        items: order.orderItems?.map((item: any) => ({
          name: item.menuItem?.name || item.name || 'Item',
          quantity: item.quantity,
          selectedOptions: item.selectedOptions || [],
        })) || [],
        notes: (order as any).orderNotes || (order as any).notes || undefined,
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
      });

      toast({
        title: "Pedido reimpresso",
        description: "Pedido enviado novamente para impressora da cozinha",
      });
    } catch (error) {
      toast({
        title: "Erro ao reimprimir",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsReprinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-[calc(100vw-1rem)] max-w-2xl flex-col overflow-hidden p-4 max-h-[calc(100dvh-1rem)] sm:w-[calc(100vw-3rem)] sm:p-6 sm:max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex min-w-0 flex-col items-stretch gap-3 pr-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="min-w-0 break-words text-orange-500">Pedido #{order.id.slice(-8).toUpperCase()}</span>
              <OrderTypeIcon className="h-5 w-5 shrink-0 text-orange-500" />
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <PrinterStatusBadge type="kitchen" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleReprint}
                disabled={isReprinting}
                className="gap-1.5"
              >
                <Printer className="h-4 w-4" />
                {isReprinting ? "Reimprimindo..." : "Reimprimir"}
              </Button>
              <PrintInvoice order={order} variant="outline" size="sm" />
              <PrintOrder order={order} variant="default" size="sm" />
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 w-full min-w-0 flex-1 max-h-[calc(90vh-120px)]">
          <div className="min-w-0 space-y-4 pr-2 sm:pr-4">
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status do Pedido</p>
                <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status de Pagamento</p>
                <Badge className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors] || paymentStatusColors.nao_pago}>
                  {paymentStatusLabels[order.paymentStatus as keyof typeof paymentStatusLabels] || "Não pago"}
                </Badge>
              </div>
            </div>

            <Separator />

              <div className="space-y-3">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="shrink-0 text-muted-foreground">Data:</span>
                <span className="min-w-0 break-words font-medium">
                  {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "-"}
                </span>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <OrderTypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="shrink-0 text-muted-foreground">Tipo:</span>
                <span className="min-w-0 break-words font-medium">
                  {order.table ? `Mesa ${order.table.number}` : orderTypeLabels[order.orderType as keyof typeof orderTypeLabels] || order.orderType}
                </span>
              </div>

              {(order.customer || order.customerName) && (
                <div className="min-w-0 space-y-2 rounded-lg border bg-muted/30 p-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="shrink-0 text-muted-foreground">Cliente:</span>
                    <span className="min-w-0 break-words font-medium">{order.customer?.name || order.customerName}</span>
                    {order.customer?.tier && (
                      <Badge variant="outline" className="ml-auto capitalize sm:ml-2">
                        {order.customer.tier}
                      </Badge>
                    )}
                  </div>
                  
                  {(order.customer?.phone || order.customerPhone) && (
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="shrink-0 text-muted-foreground">Telefone:</span>
                      <span className="min-w-0 break-all font-medium">{order.customer?.phone || order.customerPhone}</span>
                    </div>
                  )}
                  
                  {order.customer?.email && (
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="shrink-0 text-muted-foreground">Email:</span>
                      <span className="min-w-0 break-all font-medium text-xs">{order.customer.email}</span>
                    </div>
                  )}
                  
                  {order.customer?.loyaltyPoints !== undefined && order.customer.loyaltyPoints > 0 && (
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <Award className="h-4 w-4 shrink-0 text-primary" />
                      <span className="shrink-0 text-muted-foreground">Pontos:</span>
                      <span className="font-medium text-primary">{order.customer.loyaltyPoints} pts</span>
                    </div>
                  )}
                </div>
              )}

              {order.deliveryAddress && (
                <div className="flex min-w-0 items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="shrink-0 text-muted-foreground">Endereço:</span>
                  <span className="min-w-0 flex-1 break-words font-medium">{order.deliveryAddress}</span>
                </div>
              )}

              {order.orderNotes && (
                <div className="flex min-w-0 flex-wrap items-start gap-2 text-sm">
                  <span className="shrink-0 text-muted-foreground">Observações:</span>
                  <span className="min-w-0 flex-1 break-words font-medium">{order.orderNotes}</span>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Itens do Pedido</h3>
              <div className="space-y-2">
                {order.orderItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum item no pedido
                  </p>
                ) : (
                  order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex min-w-0 flex-col gap-2 rounded-md bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                      data-testid={`order-item-${item.id}`}
                    >
                       <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                           <span className="min-w-0 break-words font-medium text-sm">
                            {item.quantity}x {item.menuItem?.name || "Item"}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Obs: {item.notes}
                          </p>
                        )}
                      </div>
                       <span className="self-end whitespace-nowrap font-semibold sm:self-auto" data-testid={`item-total-${item.id}`}>
                        {formatKwanza(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex min-w-0 flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({order.orderItems.length} {order.orderItems.length === 1 ? "item" : "itens"})
                </span>
                <span className="min-w-0 break-words text-right font-medium" data-testid="text-subtotal-value">
                  {formatKwanza(order.subtotal)}
                </span>
              </div>

              {Number(order.discount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Desconto {order.discountType === "percentual" ? `(${order.discount}%)` : ""}
                  </span>
                  <span className="min-w-0 break-words text-right font-medium text-green-600" data-testid="text-discount-value">
                    -{formatKwanza(order.discount || "0")}
                  </span>
                </div>
              )}

              {Number(order.serviceCharge || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {order.serviceName || "Taxa de Serviço"}
                  </span>
                  <span className="min-w-0 break-words text-right font-medium" data-testid="text-service-charge-value">
                    {formatKwanza(order.serviceCharge || "0")}
                  </span>
                </div>
              )}

              {Number(order.deliveryFee || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Entrega</span>
                  <span className="min-w-0 break-words text-right font-medium" data-testid="text-delivery-fee-value">
                    {formatKwanza(order.deliveryFee || "0")}
                  </span>
                </div>
              )}

              {Number(order.packagingFee || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Embalagem</span>
                  <span className="min-w-0 break-words text-right font-medium" data-testid="text-packaging-fee-value">
                    {formatKwanza(order.packagingFee || "0")}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex min-w-0 flex-wrap justify-between gap-x-3 gap-y-1 text-lg font-bold">
                <span>Total</span>
                <span className="min-w-0 break-words text-right text-orange-500" data-testid="text-total-value">
                  {formatKwanza(order.totalAmount)}
                </span>
              </div>

              {order.paymentMethod && (
                <div className="flex min-w-0 flex-wrap justify-between gap-x-3 gap-y-1 pt-2 text-sm">
                  <span className="text-muted-foreground">Método de Pagamento</span>
                  <span className="min-w-0 break-words text-right font-medium capitalize">
                    {order.paymentMethod.replace("_", " ")}
                  </span>
                </div>
              )}

              {Number(order.paidAmount || 0) > 0 && (
                <div className="flex min-w-0 flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Valor Pago</span>
                  <span className="min-w-0 break-words text-right font-medium text-green-600" data-testid="text-paid-amount-value">
                    {formatKwanza(order.paidAmount || "0")}
                  </span>
                </div>
              )}

              {Number(order.changeAmount || 0) > 0 && (
                <div className="flex min-w-0 flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Troco</span>
                  <span className="min-w-0 break-words text-right font-medium" data-testid="text-change-amount-value">
                    {formatKwanza(order.changeAmount || "0")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
