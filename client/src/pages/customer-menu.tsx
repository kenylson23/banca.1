import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Trash2, Check, ClipboardList, Clock, ChefHat, CheckCircle } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, Category, Order, OrderItem, Restaurant } from '@shared/schema';
import { MapPin, Phone, Clock as ClockIcon } from 'lucide-react';

export default function CustomerMenu() {
  const [, params] = useRoute('/mesa/:tableNumber');
  const tableNumber = params?.tableNumber;
  const { items, addItem, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const { toast } = useToast();

  const { data: menuItems, isLoading: menuLoading } = useQuery<Array<MenuItem & { category: Category }>>({
    queryKey: ['/api/public/menu-items'],
  });

  const { data: currentTable, isLoading: tableLoading } = useQuery<any>({
    queryKey: ['/api/public/tables', tableNumber],
    enabled: !!tableNumber,
  });

  const tableId = currentTable?.id;
  const restaurantId = currentTable?.restaurantId;
  
  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ['/api/public/restaurants', restaurantId],
    enabled: !!restaurantId,
  });
  
  const { data: tableOrders, isLoading: ordersLoading } = useQuery<Array<Order & { orderItems: Array<OrderItem & { menuItem: MenuItem }> }>>({
    queryKey: [`/api/public/orders/table/${tableId}`],
    enabled: Boolean(tableId),
  });

  useEffect(() => {
    if (!tableId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'order_status_updated' || message.type === 'new_order') {
        queryClient.invalidateQueries({ queryKey: [`/api/public/orders/table/${tableId}`] });
      }
    };

    return () => {
      ws.close();
    };
  }, [tableId]);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: { tableId: string; customerName: string; customerPhone: string; items: Array<{ menuItemId: string; quantity: number; price: string }> }) => {
      const totalAmount = orderData.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);
      return apiRequest('POST', '/api/public/orders', {
        tableId: orderData.tableId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        status: 'pendente',
        totalAmount,
        items: orderData.items,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Pedido enviado!',
        description: 'Seu pedido foi enviado para a cozinha.',
      });
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setIsCartOpen(false);
      if (tableId) {
        queryClient.invalidateQueries({ queryKey: [`/api/public/orders/table/${tableId}`] });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Tente novamente mais tarde.';
      toast({
        title: 'Erro ao enviar pedido',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const getOrderStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente':
        return {
          label: 'Pendente',
          icon: Clock,
          color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
        };
      case 'em_preparo':
        return {
          label: 'Em Preparo',
          icon: ChefHat,
          color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        };
      case 'pronto':
        return {
          label: 'Pronto',
          icon: CheckCircle,
          color: 'bg-green-500/10 text-green-700 dark:text-green-400',
        };
      case 'servido':
        return {
          label: 'Servido',
          icon: Check,
          color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
        };
      default:
        return {
          label: status,
          icon: Clock,
          color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
        };
    }
  };

  const handleConfirmOrder = () => {
    if (!currentTable) {
      toast({
        title: 'Mesa não encontrada',
        description: 'Não foi possível identificar a mesa.',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione itens ao carrinho antes de confirmar o pedido.',
        variant: 'destructive',
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe seu nome.',
        variant: 'destructive',
      });
      return;
    }

    if (!customerPhone.trim()) {
      toast({
        title: 'Telefone obrigatório',
        description: 'Por favor, informe seu telefone/WhatsApp.',
        variant: 'destructive',
      });
      return;
    }

    const orderItems = items.map(item => ({
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
      price: item.menuItem.price,
    }));

    createOrderMutation.mutate({
      tableId: currentTable.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: orderItems,
    });
  };

  const groupedByCategory = menuItems?.reduce((acc, item) => {
    const categoryName = item.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, Array<MenuItem & { category: Category }>>);

  if (!tableNumber) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground text-lg">Mesa não identificada</p>
        <p className="text-sm text-muted-foreground">Por favor, escaneie o QR code da mesa</p>
      </div>
    );
  }

  if (menuLoading || tableLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Carregando menu...</p>
      </div>
    );
  }

  if (!currentTable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground text-lg">Mesa {tableNumber} não encontrada</p>
        <p className="text-sm text-muted-foreground">Verifique o número da mesa e tente novamente</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold" data-testid="text-restaurant-name">NaBancada</h1>
            <p className="text-xs sm:text-sm text-muted-foreground" data-testid="text-table-number">
              Mesa {currentTable?.number || tableNumber}
            </p>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-track-orders" className="text-sm">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Rastrear Pedido</span>
                  <span className="sm:hidden">Pedidos</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle data-testid="text-orders-dialog-title">Seus Pedidos</DialogTitle>
                  <DialogDescription data-testid="text-orders-dialog-description">
                    Acompanhe o status dos seus pedidos em tempo real
                  </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[60vh] pr-4">
                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : !tableOrders || tableOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <ClipboardList className="h-12 w-12 mb-3 opacity-50" />
                      <p data-testid="text-no-orders">Nenhum pedido encontrado</p>
                      <p className="text-sm">Faça seu primeiro pedido!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tableOrders.map((order) => {
                        const statusInfo = getOrderStatusInfo(order.status);
                        const StatusIcon = statusInfo.icon;
                        
                        return (
                          <Card key={order.id} data-testid={`order-card-${order.id}`}>
                            <CardHeader>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <CardTitle className="text-base" data-testid={`text-order-customer-${order.id}`}>
                                    {order.customerName}
                                  </CardTitle>
                                  <CardDescription data-testid={`text-order-date-${order.id}`}>
                                    {new Date(order.createdAt!).toLocaleString('pt-BR')}
                                  </CardDescription>
                                </div>
                                <Badge className={statusInfo.color} data-testid={`badge-order-status-${order.id}`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusInfo.label}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {order.orderItems.map((item) => (
                                  <div key={item.id} className="flex justify-between text-sm" data-testid={`order-item-${item.id}`}>
                                    <span className="text-muted-foreground">
                                      {item.quantity}x {item.menuItem.name}
                                    </span>
                                    <span className="font-medium">
                                      {formatKwanza(parseFloat(item.price) * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <Separator className="my-3" />
                              <div className="flex justify-between font-semibold" data-testid={`text-order-total-${order.id}`}>
                                <span>Total</span>
                                <span>{formatKwanza(order.totalAmount)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative" data-testid="button-open-cart">
                  <ShoppingCart className="h-5 w-5" />
                  {getItemCount() > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      data-testid="badge-cart-count"
                    >
                      {getItemCount()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle data-testid="text-cart-title">Seu Pedido</SheetTitle>
                <SheetDescription data-testid="text-cart-description">
                  Revise os itens antes de confirmar
                </SheetDescription>
              </SheetHeader>
              
              <ScrollArea className="h-[calc(100vh-200px)] mt-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                    <p data-testid="text-empty-cart">Seu carrinho está vazio</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <Card key={item.menuItem.id} data-testid={`cart-item-${item.menuItem.id}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base" data-testid={`text-item-name-${item.menuItem.id}`}>
                            {item.menuItem.name}
                          </CardTitle>
                          <CardDescription data-testid={`text-item-price-${item.menuItem.id}`}>
                            {formatKwanza(item.menuItem.price)}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                              data-testid={`button-decrease-${item.menuItem.id}`}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center" data-testid={`text-quantity-${item.menuItem.id}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                              data-testid={`button-increase-${item.menuItem.id}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold" data-testid={`text-item-total-${item.menuItem.id}`}>
                              {formatKwanza(parseFloat(item.menuItem.price) * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.menuItem.id)}
                              data-testid={`button-remove-${item.menuItem.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {items.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="customer-name">Nome *</Label>
                      <Input
                        id="customer-name"
                        placeholder="Seu nome"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        data-testid="input-customer-name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-phone">Telefone/WhatsApp *</Label>
                      <Input
                        id="customer-phone"
                        type="tel"
                        placeholder="+244 912 345 678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        data-testid="input-customer-phone"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold" data-testid="text-cart-total">
                      {formatKwanza(getTotal())}
                    </span>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleConfirmOrder}
                    disabled={createOrderMutation.isPending}
                    data-testid="button-confirm-order"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    {createOrderMutation.isPending ? 'Enviando...' : 'Confirmar Pedido'}
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </header>

      <main className="container px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {restaurant && (
          <Card className="mb-8" data-testid="card-restaurant-info">
            <CardHeader className="text-center">
              {restaurant.logoUrl && (
                <div className="flex justify-center mb-4">
                  <img
                    src={restaurant.logoUrl}
                    alt={`Logo ${restaurant.name}`}
                    className="h-24 w-auto object-contain"
                    data-testid="img-restaurant-logo"
                  />
                </div>
              )}
              <CardTitle className="text-3xl" data-testid="text-restaurant-name">
                {restaurant.name}
              </CardTitle>
              {restaurant.description && (
                <CardDescription className="text-base mt-2" data-testid="text-restaurant-description">
                  {restaurant.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                {restaurant.address && (
                  <div className="flex items-start gap-3" data-testid="text-restaurant-address">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Endereço</p>
                      <p className="text-muted-foreground">{restaurant.address}</p>
                    </div>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-start gap-3" data-testid="text-restaurant-phone">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Contato</p>
                      <p className="text-muted-foreground">{restaurant.phone}</p>
                    </div>
                  </div>
                )}
                {restaurant.businessHours && (
                  <div className="flex items-start gap-3" data-testid="text-restaurant-hours">
                    <ClockIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Horário</p>
                      <p className="text-muted-foreground">{restaurant.businessHours}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" data-testid="text-menu-title">Menu</h2>
          <p className="text-muted-foreground" data-testid="text-menu-description">
            Escolha seus pratos favoritos e adicione ao carrinho
          </p>
        </div>

        {groupedByCategory && Object.entries(groupedByCategory).map(([categoryName, items]) => (
          <div key={categoryName} className="mb-12">
            <h3 className="text-2xl font-semibold mb-6" data-testid={`text-category-${categoryName}`}>
              {categoryName}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover-elevate"
                  data-testid={`card-menu-item-${item.id}`}
                >
                  {item.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        data-testid={`img-menu-item-${item.id}`}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle data-testid={`text-menu-item-name-${item.id}`}>
                        {item.name}
                      </CardTitle>
                      {item.isAvailable === 0 && (
                        <Badge variant="secondary" data-testid={`badge-unavailable-${item.id}`}>
                          Indisponível
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <CardDescription data-testid={`text-menu-item-description-${item.id}`}>
                        {item.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-bold" data-testid={`text-menu-item-price-${item.id}`}>
                      {formatKwanza(item.price)}
                    </span>
                    <Button
                      onClick={() => addItem(item)}
                      disabled={item.isAvailable === 0}
                      data-testid={`button-add-to-cart-${item.id}`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {(!groupedByCategory || Object.keys(groupedByCategory).length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p data-testid="text-no-items">Nenhum item disponível no momento</p>
          </div>
        )}
      </main>
    </div>
  );
}
