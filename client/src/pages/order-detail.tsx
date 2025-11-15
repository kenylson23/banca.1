import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ArrowLeft, Plus, Trash2, DollarSign, Percent, 
  UtensilsCrossed, Clock, Edit2, Check, X, Printer, Package 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatKwanza } from "@/lib/formatters";
import { format } from "date-fns";
import { PrintOrder } from "@/components/PrintOrder";
import type { Order, OrderItem, MenuItem } from "@shared/schema";

interface OrderDetail extends Order {
  orderItems: Array<OrderItem & { menuItem: MenuItem }>;
}

const statusColors = {
  pendente: "bg-chart-4 text-chart-4-foreground",
  em_preparo: "bg-chart-2 text-chart-2-foreground",
  pronto: "bg-chart-3 text-chart-3-foreground",
  servido: "bg-muted text-muted-foreground",
};

const statusLabels = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  servido: "Servido",
};

const orderTypeLabels = {
  mesa: "Mesa",
  delivery: "Delivery",
  takeout: "Retirada",
  balcao: "Balcão",
  pdv: "PDV",
};

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const [, setLocation] = useLocation();
  const orderId = params?.id;
  const { toast } = useToast();
  
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const { data: order, isLoading } = useQuery<OrderDetail>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  useEffect(() => {
    if (order) {
      setTitle(order.orderTitle || "");
      setCustomerName(order.customerName || "");
      setCustomerPhone(order.customerPhone || "");
    }
  }, [order]);

  useEffect(() => {
    if (!order?.createdAt) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const created = new Date(order.createdAt!).getTime();
      const diff = Math.floor((now - created) / 1000);
      setElapsedTime(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.createdAt]);

  const updateMetadataMutation = useMutation({
    mutationFn: async (data: { orderTitle?: string; customerName?: string; customerPhone?: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/metadata`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Atualizado com sucesso" });
      setEditingTitle(false);
      setEditingCustomer(false);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: { menuItemId: string; quantity: number; price: string }) => {
      const response = await apiRequest("POST", `/api/orders/${orderId}/items`, {
        ...item,
        notes: "",
        selectedOptions: [],
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Item adicionado" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar item", variant: "destructive" });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("DELETE", `/api/orders/${orderId}/items/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Item removido" });
    },
    onError: () => {
      toast({ title: "Erro ao remover item", variant: "destructive" });
    },
  });

  const updateItemQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/items/${itemId}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar quantidade", variant: "destructive" });
    },
  });

  const applyDiscountMutation = useMutation({
    mutationFn: async (data: { discount: string; discountType: "valor" | "percentual" }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/discount`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Desconto aplicado" });
    },
    onError: () => {
      toast({ title: "Erro ao aplicar desconto", variant: "destructive" });
    },
  });

  const applyServiceChargeMutation = useMutation({
    mutationFn: async (data: { serviceCharge: string; serviceName?: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/service-charge`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Taxa de serviço aplicada" });
    },
    onError: () => {
      toast({ title: "Erro ao aplicar taxa de serviço", variant: "destructive" });
    },
  });

  const applyPackagingFeeMutation = useMutation({
    mutationFn: async (packagingFee: string) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/packaging-fee`, { packagingFee });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Taxa de embalagem aplicada" });
    },
    onError: () => {
      toast({ title: "Erro ao aplicar taxa de embalagem", variant: "destructive" });
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async (data: { amount: string; paymentMethod: string; receivedAmount?: string }) => {
      const response = await apiRequest("POST", `/api/orders/${orderId}/payments`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Pagamento registrado" });
      setPaymentDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao registrar pagamento", 
        description: error.message || "Não foi possível registrar o pagamento.",
        variant: "destructive" 
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Status atualizado" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    },
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Pedido não encontrado</p>
        <Button onClick={() => setLocation("/pdv")} data-testid="button-back-to-pdv">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao PDV
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/pdv")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[order.orderType as keyof typeof statusColors] || "bg-muted"}>
            {orderTypeLabels[order.orderType as keyof typeof orderTypeLabels] || order.orderType}
          </Badge>
          <span className="text-sm text-muted-foreground">1</span>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
          {statusLabels[order.status as keyof typeof statusLabels]}
        </Badge>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {order.createdAt && format(new Date(order.createdAt), "dd/MM/yy HH:mm")}
          </div>
          <Badge variant="secondary" className="gap-2">
            <Clock className="h-3 w-3" />
            {formatTime(elapsedTime)}
          </Badge>
          <PrintOrder 
            order={order} 
            variant="ghost"
            size="icon"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {editingTitle ? (
                    <>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Adicionar título"
                        data-testid="input-order-title"
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateMetadataMutation.mutate({ orderTitle: title })}
                        data-testid="button-save-title"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingTitle(false);
                          setTitle(order.orderTitle || "");
                        }}
                        data-testid="button-cancel-title"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground flex-1">
                        {order.orderTitle || "Adicionar título"}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingTitle(true)}
                        data-testid="button-edit-title"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  AO-{order.id.slice(0, 10).toUpperCase()}
                </div>

                <Separator />

                <div className="space-y-2">
                  {editingCustomer ? (
                    <div className="space-y-2">
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nome do cliente"
                        data-testid="input-customer-name"
                      />
                      <Input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Telefone do cliente"
                        data-testid="input-customer-phone"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateMetadataMutation.mutate({ customerName, customerPhone })}
                          data-testid="button-save-customer"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCustomer(false);
                            setCustomerName(order.customerName || "");
                            setCustomerPhone(order.customerPhone || "");
                          }}
                          data-testid="button-cancel-customer"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground"
                      onClick={() => setEditingCustomer(true)}
                      data-testid="button-add-customer"
                    >
                      {order.customerName || "Adicionar um nome de cliente"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Produtos
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="button-add-product">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Produto</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-2">
                      {menuItems.filter(item => item.isAvailable === 1).map((item) => (
                        <Card
                          key={item.id}
                          className="hover-elevate cursor-pointer"
                          onClick={() => {
                            addItemMutation.mutate({
                              menuItemId: item.id,
                              quantity: 1,
                              price: item.price,
                            });
                          }}
                          data-testid={`add-menu-item-${item.id}`}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{item.name}</p>
                              </div>
                              <Badge variant="secondary">{formatKwanza(item.price)}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {order.orderItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Adicione produtos antes de aceitar o pedido
                </div>
              ) : (
                <div className="space-y-2">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                      <div className="flex items-center gap-2 flex-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateItemQuantityMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                            } else {
                              removeItemMutation.mutate(item.id);
                            }
                          }}
                          data-testid={`decrease-item-${item.id}`}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center" data-testid={`item-quantity-${item.id}`}>
                          {item.quantity}x
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => updateItemQuantityMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                          data-testid={`increase-item-${item.id}`}
                        >
                          +
                        </Button>
                        <span className="flex-1">{item.menuItem.name}</span>
                      </div>
                      <span className="font-medium">{formatKwanza(Number(item.price) * item.quantity)}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => removeItemMutation.mutate(item.id)}
                        data-testid={`remove-item-${item.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal Produtos ({order.orderItems.length})</span>
                  <span className="text-sm" data-testid="text-subtotal">{formatKwanza(order.subtotal)}</span>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex-1" data-testid="button-discount">
                        <Percent className="h-4 w-4 mr-2" />
                        Desconto
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Aplicar Desconto</DialogTitle>
                      </DialogHeader>
                      <DiscountForm
                        onSubmit={(data) => applyDiscountMutation.mutate(data)}
                        currentDiscount={Number(order.discount || 0)}
                        currentType={order.discountType || "valor"}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex-1" data-testid="button-service">
                        <Plus className="h-4 w-4 mr-2" />
                        Serviço
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Serviço</DialogTitle>
                      </DialogHeader>
                      <ServiceChargeForm
                        onSubmit={(data) => applyServiceChargeMutation.mutate(data)}
                        currentCharge={Number(order.serviceCharge || 0)}
                        currentName={order.serviceName || ""}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex-1" data-testid="button-packaging">
                        <Package className="h-4 w-4 mr-2" />
                        Embalagem
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Embalagem:</DialogTitle>
                      </DialogHeader>
                      <PackagingFeeForm
                        onSubmit={(value) => applyPackagingFeeMutation.mutate(value)}
                        currentFee={Number(order.packagingFee || 0)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {Number(order.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Desconto ({order.discountType === "percentual" ? `${order.discount}%` : "Valor"})</span>
                    <span>-{formatKwanza(order.discount || 0)}</span>
                  </div>
                )}

                {Number(order.serviceCharge || 0) > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Taxa de Serviço{order.serviceName ? ` (${order.serviceName})` : ""}</span>
                    <span>+{formatKwanza(order.serviceCharge || 0)}</span>
                  </div>
                )}

                {Number(order.packagingFee || 0) > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Embalagem</span>
                    <span>+{formatKwanza(order.packagingFee || 0)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        order.paymentStatus === "pago"
                          ? "bg-chart-3 text-chart-3-foreground"
                          : order.paymentStatus === "parcial"
                          ? "bg-chart-4 text-chart-4-foreground"
                          : "bg-chart-1 text-chart-1-foreground"
                      }
                    >
                      {order.paymentStatus === "pago" ? "Pago" : order.paymentStatus === "parcial" ? "Parcial" : "Não pago"}
                    </Badge>
                    <span className="font-semibold">Total</span>
                  </div>
                  <span className="text-2xl font-bold" data-testid="text-total">
                    {formatKwanza(order.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      <div className="border-t p-4 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setLocation("/pdv")}
          data-testid="button-cancel"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="flex-1"
              disabled={order.orderItems.length === 0 || order.paymentStatus === "pago"}
              data-testid="button-pay"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Pagar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
            </DialogHeader>
            <PaymentForm
              onSubmit={(data) => recordPaymentMutation.mutate(data)}
              totalAmount={Number(order.totalAmount)}
              paidAmount={Number(order.paidAmount || 0)}
              isPending={recordPaymentMutation.isPending}
            />
          </DialogContent>
        </Dialog>
        <Button
          variant="default"
          className="flex-1"
          disabled={order.orderItems.length === 0 || order.status !== "pendente"}
          onClick={() => updateStatusMutation.mutate("em_preparo")}
          data-testid="button-accept"
        >
          <Check className="h-4 w-4 mr-2" />
          Aceitar
        </Button>
      </div>
    </div>
  );
}

function DiscountForm({
  onSubmit,
  currentDiscount,
  currentType,
}: {
  onSubmit: (data: { discount: string; discountType: "valor" | "percentual" }) => void;
  currentDiscount: number;
  currentType: "valor" | "percentual";
}) {
  const [discount, setDiscount] = useState(currentDiscount.toString());
  const [discountType, setDiscountType] = useState<"valor" | "percentual">(currentType);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Desconto</Label>
        <Select value={discountType} onValueChange={(v: "valor" | "percentual") => setDiscountType(v)}>
          <SelectTrigger data-testid="select-discount-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="valor">Valor Fixo</SelectItem>
            <SelectItem value="percentual">Percentual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Valor do Desconto</Label>
        <Input
          type="number"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          placeholder="0.00"
          data-testid="input-discount-value"
        />
      </div>
      <Button
        onClick={() => onSubmit({ discount, discountType })}
        className="w-full"
        data-testid="button-apply-discount"
      >
        Aplicar Desconto
      </Button>
    </div>
  );
}

function ServiceChargeForm({
  onSubmit,
  currentCharge,
  currentName,
}: {
  onSubmit: (data: { serviceCharge: string; serviceName?: string }) => void;
  currentCharge: number;
  currentName: string;
}) {
  const [charge, setCharge] = useState(currentCharge.toString());
  const [name, setName] = useState(currentName);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome (opcional)"
          data-testid="input-service-name"
        />
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        <Input
          type="number"
          value={charge}
          onChange={(e) => setCharge(e.target.value)}
          placeholder="0"
          className="pl-8"
          data-testid="input-service-charge"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setCharge(currentCharge.toString());
            setName(currentName);
          }}
          className="flex-1"
          data-testid="button-cancel-service"
        >
          Cancelar
        </Button>
        <Button
          onClick={() => onSubmit({ serviceCharge: charge, serviceName: name || undefined })}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          data-testid="button-apply-service"
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}

function PackagingFeeForm({
  onSubmit,
  currentFee,
}: {
  onSubmit: (value: string) => void;
  currentFee: number;
}) {
  const [fee, setFee] = useState(currentFee.toString());

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="number"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          placeholder="0"
          data-testid="input-packaging-fee"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => setFee(currentFee.toString())}
          className="flex-1"
          data-testid="button-cancel-packaging"
        >
          Cancelar
        </Button>
        <Button
          onClick={() => onSubmit(fee)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          data-testid="button-apply-packaging"
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}

function PaymentForm({
  onSubmit,
  totalAmount,
  paidAmount,
  isPending,
}: {
  onSubmit: (data: { amount: string; paymentMethod: string; receivedAmount?: string }) => void;
  totalAmount: number;
  paidAmount: number;
  isPending?: boolean;
}) {
  const remaining = totalAmount - paidAmount;
  const [amount, setAmount] = useState(remaining.toString());
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [receivedAmount, setReceivedAmount] = useState("");

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-md bg-muted">
        <div className="flex justify-between text-sm mb-2">
          <span>Total:</span>
          <span className="font-semibold">{formatKwanza(totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Pago:</span>
          <span className="font-semibold">{formatKwanza(paidAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Restante:</span>
          <span className="font-bold text-lg">{formatKwanza(remaining)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Método de Pagamento</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger data-testid="select-payment-method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="multicaixa">Multicaixa</SelectItem>
            <SelectItem value="transferencia">Transferência</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Valor a Pagar</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          data-testid="input-payment-amount"
        />
      </div>

      {paymentMethod === "dinheiro" && (
        <div className="space-y-2">
          <Label>Valor Recebido (opcional)</Label>
          <Input
            type="number"
            value={receivedAmount}
            onChange={(e) => setReceivedAmount(e.target.value)}
            placeholder="0.00"
            data-testid="input-received-amount"
          />
          {receivedAmount && Number(receivedAmount) > Number(amount) && (
            <p className="text-sm text-muted-foreground">
              Troco: {formatKwanza(Number(receivedAmount) - Number(amount))}
            </p>
          )}
        </div>
      )}

      <Button
        onClick={() => onSubmit({ amount, paymentMethod, receivedAmount: receivedAmount || undefined })}
        className="w-full"
        disabled={isPending || Number(amount) <= 0}
        data-testid="button-confirm-payment"
      >
        {isPending ? "Processando..." : "Confirmar Pagamento"}
      </Button>
    </div>
  );
}
