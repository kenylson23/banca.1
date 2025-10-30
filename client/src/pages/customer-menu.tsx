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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Trash2, Check, ClipboardList, Clock, ChefHat, CheckCircle, Search } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, Category, Order, OrderItem, Restaurant } from '@shared/schema';
import { MapPin, Phone, Clock as ClockIcon } from 'lucide-react';
import { Link } from 'wouter';

export default function CustomerMenu() {
  const [, params] = useRoute('/mesa/:tableNumber');
  const tableNumber = params?.tableNumber;
  const { items, orderNotes, addItem, updateQuantity, removeItem, setOrderNotes, clearCart, getTotal, getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const { toast } = useToast();

  const { data: currentTable, isLoading: tableLoading } = useQuery<any>({
    queryKey: ['/api/public/tables', tableNumber],
    enabled: !!tableNumber,
  });

  const tableId = currentTable?.id;
  const restaurantId = currentTable?.restaurantId;

  const { data: menuItems, isLoading: menuLoading } = useQuery<Array<MenuItem & { category: Category }>>({
    queryKey: ['/api/public/menu-items', restaurantId],
    enabled: !!restaurantId,
  });
  
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
    mutationFn: async (orderData: { restaurantId: string; tableId: string; customerName: string; customerPhone: string; orderNotes?: string; items: Array<{ menuItemId: string; quantity: number; price: string }> }) => {
      const totalAmount = orderData.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);
      
      const requestBody = {
        restaurantId: orderData.restaurantId,
        tableId: orderData.tableId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        orderNotes: orderData.orderNotes || undefined,
        status: 'pendente',
        totalAmount,
        items: orderData.items,
      };
      
      console.log('[CustomerMenu] Enviando pedido:', requestBody);
      
      return apiRequest('POST', '/api/public/orders', requestBody);
    },
    onSuccess: (data) => {
      console.log('[CustomerMenu] Pedido criado com sucesso:', data);
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
      console.error('[CustomerMenu] Erro ao enviar pedido:', error);
      console.error('[CustomerMenu] Detalhes do erro:', {
        message: error?.message,
        errors: error?.errors,
        response: error?.response,
        stack: error?.stack,
      });
      
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
    console.log('[CustomerMenu] Iniciando confirmação de pedido');
    console.log('[CustomerMenu] Mesa atual:', currentTable);
    console.log('[CustomerMenu] Itens no carrinho:', items);
    console.log('[CustomerMenu] Nome:', customerName);
    console.log('[CustomerMenu] Telefone:', customerPhone);
    console.log('[CustomerMenu] Observações:', orderNotes);
    
    if (!currentTable) {
      console.error('[CustomerMenu] Mesa não encontrada');
      toast({
        title: 'Mesa não encontrada',
        description: 'Não foi possível identificar a mesa.',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      console.error('[CustomerMenu] Carrinho vazio');
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione itens ao carrinho antes de confirmar o pedido.',
        variant: 'destructive',
      });
      return;
    }

    if (!customerName.trim()) {
      console.error('[CustomerMenu] Nome não preenchido');
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe seu nome.',
        variant: 'destructive',
      });
      return;
    }

    if (!customerPhone.trim()) {
      console.error('[CustomerMenu] Telefone não preenchido');
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

    console.log('[CustomerMenu] Itens do pedido processados:', orderItems);

    createOrderMutation.mutate({
      restaurantId: currentTable.restaurantId,
      tableId: currentTable.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderNotes: orderNotes.trim() || undefined,
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top">
        <div className="container flex h-16 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-xl font-semibold truncate" data-testid="text-restaurant-name">NaBancada</h1>
            <p className="text-sm sm:text-sm text-muted-foreground" data-testid="text-table-number">
              Mesa {currentTable?.number || tableNumber}
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {restaurant?.slug && (
              <Link href={`/r/${restaurant.slug}/rastrear`}>
                <Button variant="outline" size="icon" className="min-h-10 min-w-10" data-testid="button-track-order-page">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
            )}
            
            <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-track-orders" className="text-sm min-h-10">
                  <ClipboardList className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Meus Pedidos</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl" data-testid="text-orders-dialog-title">Seus Pedidos</DialogTitle>
                  <DialogDescription className="text-sm" data-testid="text-orders-dialog-description">
                    Acompanhe o status dos seus pedidos em tempo real
                  </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[65vh] sm:max-h-[60vh] pr-2 sm:pr-4">
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
                <Button variant="outline" size="icon" className="relative min-h-10 min-w-10" data-testid="button-open-cart">
                  <ShoppingCart className="h-6 w-6" />
                  {getItemCount() > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
                      data-testid="badge-cart-count"
                    >
                      {getItemCount()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
              <div className="p-6 pb-4">
                <SheetHeader>
                  <SheetTitle className="text-xl" data-testid="text-cart-title">Seu Pedido</SheetTitle>
                  <SheetDescription className="text-sm" data-testid="text-cart-description">
                    Revise os itens antes de confirmar
                  </SheetDescription>
                </SheetHeader>
              </div>
              
              <ScrollArea className="flex-1 px-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                    <p data-testid="text-empty-cart">Seu carrinho está vazio</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-4">
                    {items.map((item) => (
                      <Card key={item.menuItem.id} data-testid={`cart-item-${item.menuItem.id}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base sm:text-lg" data-testid={`text-item-name-${item.menuItem.id}`}>
                            {item.menuItem.name}
                          </CardTitle>
                          <CardDescription className="text-sm" data-testid={`text-item-price-${item.menuItem.id}`}>
                            {formatKwanza(item.menuItem.price)}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                              data-testid={`button-decrease-${item.menuItem.id}`}
                            >
                              <Minus className="h-5 w-5" />
                            </Button>
                            <span className="w-10 text-center font-medium text-lg" data-testid={`text-quantity-${item.menuItem.id}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                              data-testid={`button-increase-${item.menuItem.id}`}
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg" data-testid={`text-item-total-${item.menuItem.id}`}>
                              {formatKwanza(parseFloat(item.menuItem.price) * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => removeItem(item.menuItem.id)}
                              data-testid={`button-remove-${item.menuItem.id}`}
                            >
                              <Trash2 className="h-5 w-5 text-destructive" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {items.length > 0 && (
                <div className="border-t bg-background p-4 sm:p-6 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="customer-name" className="text-sm font-medium">Nome *</Label>
                      <Input
                        id="customer-name"
                        placeholder="Seu nome"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        data-testid="input-customer-name"
                        className="mt-1.5 h-11 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-phone" className="text-sm font-medium">Telefone/WhatsApp *</Label>
                      <Input
                        id="customer-phone"
                        type="tel"
                        placeholder="+244 912 345 678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        data-testid="input-customer-phone"
                        className="mt-1.5 h-11 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="order-notes" className="text-sm font-medium">Observações (opcional)</Label>
                      <Textarea
                        id="order-notes"
                        placeholder="Ex: sem cebola, bem passado, entregar rápido..."
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        data-testid="input-order-notes"
                        className="mt-1.5 text-base resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-lg sm:text-xl font-semibold">Total</span>
                    <span className="text-2xl sm:text-3xl font-bold text-primary" data-testid="text-cart-total">
                      {formatKwanza(getTotal())}
                    </span>
                  </div>
                  <Button 
                    className="w-full min-h-12 text-base font-semibold" 
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

      <main className="container px-4 sm:px-6 py-6 sm:py-8 lg:py-8 pb-20">
        {restaurant && (
          <Card className="mb-6 sm:mb-8" data-testid="card-restaurant-info">
            <CardHeader className="text-center p-6 sm:p-6">
              {restaurant.logoUrl && (
                <div className="flex justify-center mb-4">
                  <img
                    src={restaurant.logoUrl}
                    alt={`Logo ${restaurant.name}`}
                    className="h-20 sm:h-24 w-auto object-contain"
                    data-testid="img-restaurant-logo"
                  />
                </div>
              )}
              <CardTitle className="text-2xl sm:text-3xl" data-testid="text-restaurant-name">
                {restaurant.name}
              </CardTitle>
              {restaurant.description && (
                <CardDescription className="text-base mt-2" data-testid="text-restaurant-description">
                  {restaurant.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 text-sm">
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

        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" data-testid="text-menu-title">Menu</h2>
          <p className="text-sm sm:text-base text-muted-foreground" data-testid="text-menu-description">
            Escolha seus pratos favoritos e adicione ao carrinho
          </p>
        </div>

        {groupedByCategory && Object.entries(groupedByCategory).map(([categoryName, items]) => (
          <div key={categoryName} className="mb-10 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 sticky top-16 sm:top-16 z-40 bg-background py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b" data-testid={`text-category-${categoryName}`}>
              {categoryName}
            </h3>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover-elevate flex flex-col"
                  data-testid={`card-menu-item-${item.id}`}
                >
                  {item.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        data-testid={`img-menu-item-${item.id}`}
                      />
                    </div>
                  )}
                  <CardHeader className="flex-1 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg sm:text-xl" data-testid={`text-menu-item-name-${item.id}`}>
                        {item.name}
                      </CardTitle>
                      {item.isAvailable === 0 && (
                        <Badge variant="secondary" className="shrink-0" data-testid={`badge-unavailable-${item.id}`}>
                          Indisponível
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <CardDescription className="text-sm mt-2 line-clamp-2" data-testid={`text-menu-item-description-${item.id}`}>
                        {item.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 pt-0">
                    <span className="text-xl sm:text-2xl font-bold text-primary" data-testid={`text-menu-item-price-${item.id}`}>
                      {formatKwanza(item.price)}
                    </span>
                    <Button
                      onClick={() => addItem(item)}
                      disabled={item.isAvailable === 0}
                      className="min-h-10 px-6"
                      data-testid={`button-add-to-cart-${item.id}`}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      <span className="font-medium">Adicionar</span>
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
