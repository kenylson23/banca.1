import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PrintOrder } from "@/components/PrintOrder";
import { formatKwanza } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, UtensilsCrossed, Truck, ShoppingBag, MapPin, Phone, User, Award, Mail } from "lucide-react";
import type { Order, OrderItem, MenuItem, Table, Customer } from "@shared/schema";

interface PDVOrder extends Order {
  customer: Customer | null;
  table: Table | null;
  orderItems: Array<OrderItem & { menuItem: MenuItem }>;
}

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">Pedido #{order.id.slice(-8).toUpperCase()}</span>
              <OrderTypeIcon className="h-5 w-5 text-orange-500" />
            </div>
            <PrintOrder order={order} variant="default" size="sm" />
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">
                  {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "-"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <OrderTypeIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">
                  {order.table ? `Mesa ${order.table.number}` : orderTypeLabels[order.orderType as keyof typeof orderTypeLabels] || order.orderType}
                </span>
              </div>

              {(order.customer || order.customerName) && (
                <div className="space-y-2 p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-medium">{order.customer?.name || order.customerName}</span>
                    {order.customer?.tier && (
                      <Badge variant="outline" className="ml-2 capitalize">
                        {order.customer.tier}
                      </Badge>
                    )}
                  </div>
                  
                  {(order.customer?.phone || order.customerPhone) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium">{order.customer?.phone || order.customerPhone}</span>
                    </div>
                  )}
                  
                  {order.customer?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-xs">{order.customer.email}</span>
                    </div>
                  )}
                  
                  {order.customer?.loyaltyPoints !== undefined && order.customer.loyaltyPoints > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Pontos:</span>
                      <span className="font-medium text-primary">{order.customer.loyaltyPoints} pts</span>
                    </div>
                  )}
                </div>
              )}

              {order.deliveryAddress && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">Endereço:</span>
                  <span className="font-medium flex-1">{order.deliveryAddress}</span>
                </div>
              )}

              {order.orderNotes && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">Observações:</span>
                  <span className="font-medium flex-1">{order.orderNotes}</span>
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
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                      data-testid={`order-item-${item.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {item.quantity}x {item.menuItem?.name || "Item"}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Obs: {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold" data-testid={`item-total-${item.id}`}>
                        {formatKwanza(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({order.orderItems.length} {order.orderItems.length === 1 ? "item" : "itens"})
                </span>
                <span className="font-medium" data-testid="text-subtotal-value">
                  {formatKwanza(order.subtotal)}
                </span>
              </div>

              {Number(order.discount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Desconto {order.discountType === "percentual" ? `(${order.discount}%)` : ""}
                  </span>
                  <span className="font-medium text-green-600" data-testid="text-discount-value">
                    -{formatKwanza(order.discount || "0")}
                  </span>
                </div>
              )}

              {Number(order.serviceCharge || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {order.serviceName || "Taxa de Serviço"}
                  </span>
                  <span className="font-medium" data-testid="text-service-charge-value">
                    {formatKwanza(order.serviceCharge || "0")}
                  </span>
                </div>
              )}

              {Number(order.deliveryFee || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Entrega</span>
                  <span className="font-medium" data-testid="text-delivery-fee-value">
                    {formatKwanza(order.deliveryFee || "0")}
                  </span>
                </div>
              )}

              {Number(order.packagingFee || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Embalagem</span>
                  <span className="font-medium" data-testid="text-packaging-fee-value">
                    {formatKwanza(order.packagingFee || "0")}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-500" data-testid="text-total-value">
                  {formatKwanza(order.totalAmount)}
                </span>
              </div>

              {order.paymentMethod && (
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-muted-foreground">Método de Pagamento</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod.replace("_", " ")}
                  </span>
                </div>
              )}

              {Number(order.paidAmount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor Pago</span>
                  <span className="font-medium text-green-600" data-testid="text-paid-amount-value">
                    {formatKwanza(order.paidAmount || "0")}
                  </span>
                </div>
              )}

              {Number(order.changeAmount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Troco</span>
                  <span className="font-medium" data-testid="text-change-amount-value">
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
