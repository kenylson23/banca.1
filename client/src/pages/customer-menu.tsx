import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, Plus, ClipboardList, Clock, ChefHat, 
  CheckCircle, Check, Search, MessageCircle, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, Category, Order, OrderItem, Restaurant } from '@shared/schema';
import type { SelectedOption } from '@/contexts/CartContext';
import { CustomerMenuItemOptionsDialog } from '@/components/CustomerMenuItemOptionsDialog';
import { ShareOrderDialog } from '@/components/ShareOrderDialog';

export default function CustomerMenu() {
  const [, params] = useRoute('/mesa/:tableNumber');
  const tableNumber = params?.tableNumber;
  
  const { items, orderNotes, addItem, removeItem, setOrderNotes, clearCart, getTotal, getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
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
  
  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ['/api/public/restaurants', restaurantId],
    enabled: !!restaurantId,
  });
  
  const { data: tableOrders, isLoading: ordersLoading } = useQuery<Array<Order & { orderItems: Array<OrderItem & { menuItem: MenuItem }> }>>({
    queryKey: [`/api/public/orders/table/${tableId}`],
    enabled: Boolean(tableId),
  });

  useEffect(() => {
    if (!tableId || typeof window === 'undefined') return;

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

  useEffect(() => {
    if (!restaurantId || !currentTable?.branchId) return;

    apiRequest('POST', '/api/menu-visits', {
      restaurantId,
      branchId: currentTable.branchId,
      visitSource: 'qr_code',
      ipAddress: '',
      userAgent: navigator.userAgent,
      referrer: document.referrer || '',
    }).catch(() => {});
  }, [restaurantId, currentTable?.branchId]);

  const categories = menuItems
    ?.filter(item => item.isVisible === 1)
    ?.reduce((acc, item) => {
      if (!acc.find(cat => cat.id === item.category.id)) {
        acc.push(item.category);
      }
      return acc;
    }, [] as Category[])
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) || [];

  const itemsByCategory = categories.map(category => {
    const categoryItems = menuItems
      ?.filter(item => item.isVisible === 1)
      ?.filter(item => String(item.categoryId) === category.id)
      ?.filter(item => {
        const matchesSearch = !searchQuery || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
      }) || [];
    
    return {
      category,
      items: categoryItems
    };
  }).filter(group => group.items.length > 0);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: { 
      restaurantId: string; 
      tableId: string; 
      customerName: string; 
      customerPhone: string; 
      orderNotes?: string; 
      items: Array<{ 
        menuItemId: string; 
        quantity: number; 
        price: string; 
        selectedOptions?: SelectedOption[] 
      }> 
    }) => {
      const totalAmount = orderData.items.reduce((sum, item) => {
        const itemPrice = parseFloat(item.price);
        return sum + itemPrice * item.quantity;
      }, 0).toFixed(2);
      
      const requestBody = {
        restaurantId: orderData.restaurantId,
        tableId: orderData.tableId,
        orderType: 'mesa',
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        orderNotes: orderData.orderNotes || undefined,
        status: 'pendente',
        totalAmount,
        items: orderData.items,
      };
      
      const response = await apiRequest('POST', '/api/public/orders', requestBody);
      return await response.json();
    },
    onSuccess: (data) => {
      setCreatedOrder(data);
      setIsShareDialogOpen(true);
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
        return { label: 'Pendente', icon: Clock, color: 'bg-muted text-foreground' };
      case 'em_preparo':
        return { label: 'Em Preparo', icon: ChefHat, color: 'bg-foreground text-background' };
      case 'pronto':
        return { label: 'Pronto', icon: CheckCircle, color: 'bg-muted text-foreground' };
      case 'servido':
        return { label: 'Servido', icon: Check, color: 'bg-muted text-muted-foreground' };
      default:
        return { label: status, icon: Clock, color: 'bg-muted text-muted-foreground' };
    }
  };

  const handleAddMenuItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsOptionsDialogOpen(true);
  };

  const handleQuickAddToCart = (menuItem: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(menuItem, []);
    toast({
      title: 'Adicionado',
      description: `${menuItem.name} adicionado ao carrinho.`,
    });
  };

  const handleAddToCart = (menuItem: MenuItem, selectedOptions: SelectedOption[]) => {
    addItem(menuItem, selectedOptions);
    toast({
      title: 'Adicionado ao carrinho',
      description: `${menuItem.name} foi adicionado ao seu carrinho.`,
    });
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

    const orderItems = items.map(item => {
      const basePrice = parseFloat(item.menuItem.price);
      const optionsPrice = item.selectedOptions.reduce((sum, opt) => {
        return sum + parseFloat(opt.priceAdjustment) * opt.quantity;
      }, 0);
      const totalPrice = (basePrice + optionsPrice).toFixed(2);

      return {
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        price: totalPrice,
        selectedOptions: item.selectedOptions,
      };
    });

    createOrderMutation.mutate({
      restaurantId: currentTable.restaurantId,
      tableId: currentTable.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderNotes: orderNotes.trim() || undefined,
      items: orderItems,
    });
  };

  const banners = [
    {
      title: "Flash Offer",
      subtitle: "We are here with the best deserts. All items",
      bgColor: "bg-gradient-to-br from-orange-400 to-orange-500",
    },
  ];

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!tableNumber) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-muted-foreground text-lg">Mesa não identificada</p>
        <p className="text-sm text-muted-foreground">Por favor, escaneie o QR code da mesa</p>
      </div>
    );
  }

  if (menuLoading || tableLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
        <p className="text-muted-foreground">Carregando menu...</p>
      </div>
    );
  }

  if (!currentTable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-muted-foreground text-lg">Mesa {tableNumber} não encontrada</p>
        <p className="text-sm text-muted-foreground">Verifique o número da mesa e tente novamente</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-background border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 h-9 pr-8"
                  data-testid="input-search"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>

              {restaurant?.whatsappNumber && (
                <Button variant="ghost" size="icon" asChild data-testid="button-whatsapp">
                  <a
                    href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                </Button>
              )}

              <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-track-orders">
                    <ClipboardList className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh]">
                  <DialogHeader>
                    <DialogTitle data-testid="text-orders-dialog-title">Seus Pedidos</DialogTitle>
                    <DialogDescription data-testid="text-orders-dialog-description">
                      Acompanhe o status dos seus pedidos em tempo real
                    </DialogDescription>
                  </DialogHeader>
                  
                  <ScrollArea className="max-h-[65vh] pr-4">
                    {ordersLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50]"></div>
                      </div>
                    ) : !tableOrders || tableOrders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <ClipboardList className="h-12 w-12 mb-3 opacity-20" />
                        <p data-testid="text-no-orders">Nenhum pedido encontrado</p>
                        <p className="text-sm">Faça seu primeiro pedido!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <AnimatePresence>
                          {tableOrders.map((order, index) => {
                            const statusInfo = getOrderStatusInfo(order.status);
                            const StatusIcon = statusInfo.icon;
                            
                            return (
                              <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Card data-testid={`order-card-${order.id}`}>
                                  <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                      <div>
                                        <h3 className="font-semibold" data-testid={`text-order-customer-${order.id}`}>
                                          {order.customerName}
                                        </h3>
                                        <p className="text-sm text-muted-foreground" data-testid={`text-order-date-${order.id}`}>
                                          {new Date(order.createdAt!).toLocaleString('pt-BR')}
                                        </p>
                                      </div>
                                      <Badge className={statusInfo.color} data-testid={`badge-order-status-${order.id}`}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {statusInfo.label}
                                      </Badge>
                                    </div>
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
                                  </div>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="relative"
                    data-testid="button-open-cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <AnimatePresence>
                      {getItemCount() > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 bg-[#4CAF50] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                        >
                          {getItemCount()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
                  <div className="p-6 pb-4 border-b">
                    <SheetHeader>
                      <SheetTitle className="text-2xl font-bold" data-testid="text-cart-title">FOOD CART</SheetTitle>
                    </SheetHeader>
                  </div>

                  <ScrollArea className="flex-1 px-6 py-4">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
                        <p className="font-medium text-lg" data-testid="text-empty-cart">Seu carrinho está vazio</p>
                        <p className="text-sm mt-1">Adicione itens do cardápio</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <AnimatePresence>
                          {items.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex gap-4 items-start"
                              data-testid={`cart-item-${item.id}`}
                            >
                              {item.menuItem.imageUrl && (
                                <img
                                  src={item.menuItem.imageUrl}
                                  alt={item.menuItem.name}
                                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-base mb-1">{item.menuItem.name}</h4>
                                {item.selectedOptions.length > 0 && (
                                  <div className="mb-2 space-y-0.5">
                                    {item.selectedOptions.map((opt, idx) => (
                                      <p key={idx} className="text-xs text-muted-foreground">
                                        + {opt.optionName}
                                        {parseFloat(opt.priceAdjustment) !== 0 && (
                                          <span className="ml-1">
                                            ({parseFloat(opt.priceAdjustment) > 0 ? '+' : ''}
                                            {formatKwanza(opt.priceAdjustment)})
                                          </span>
                                        )}
                                      </p>
                                    ))}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-[#4CAF50] font-bold text-sm">
                                    {formatKwanza(
                                      (parseFloat(item.menuItem.price) + 
                                        item.selectedOptions.reduce((sum, opt) => sum + parseFloat(opt.priceAdjustment) * opt.quantity, 0)
                                      ) * item.quantity
                                    )}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                data-testid={`button-remove-${item.id}`}
                                className="text-[#4CAF50] hover:text-[#45a049] hover:bg-[#4CAF50]/10"
                              >
                                Remove
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        
                        <Button 
                          variant="outline"
                          className="w-full mt-6"
                          onClick={() => setIsCartOpen(false)}
                          data-testid="button-order-more"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Order More
                        </Button>
                      </div>
                    )}
                  </ScrollArea>

                  {items.length > 0 && (
                    <div className="p-6 border-t space-y-4">
                      <div className="space-y-3">
                        <Input
                          placeholder="Seu nome completo"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          data-testid="input-customer-name"
                        />
                        <Input
                          placeholder="Telefone/WhatsApp"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          data-testid="input-customer-phone"
                        />
                        <Textarea
                          placeholder="Observações do pedido (opcional)"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          rows={2}
                          data-testid="input-order-notes"
                        />
                      </div>

                      <Button
                        className="w-full h-12 bg-[#4CAF50] hover:bg-[#45a049] text-white font-semibold text-base"
                        onClick={handleConfirmOrder}
                        disabled={createOrderMutation.isPending}
                        data-testid="button-confirm-order"
                      >
                        {createOrderMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Enviando...
                          </div>
                        ) : (
                          'Place Order'
                        )}
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Banner */}
        <div className="mt-6 mb-8">
          <div className="relative overflow-hidden rounded-2xl h-56">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBannerIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 ${banners[currentBannerIndex].bgColor} p-6 flex items-center`}
              >
                <div className="flex-1">
                  <div className="bg-white w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-orange-500 font-bold text-xs">LOGO</div>
                  </div>
                  <h2 className="text-white text-3xl font-bold mb-2">
                    {banners[currentBannerIndex].title}
                  </h2>
                  <p className="text-white/90 text-sm max-w-xs">
                    {banners[currentBannerIndex].subtitle}
                  </p>
                </div>
                <div className="w-48 h-full opacity-80">
                  {/* Placeholder for food image */}
                </div>
              </motion.div>
            </AnimatePresence>
            
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentBannerIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Menu by Category */}
        {itemsByCategory.map((group) => (
          <section key={group.category.id} className="mb-10" id={`category-${group.category.id}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{group.category.name}</h2>
                <p className="text-sm text-muted-foreground">Best of the today food list update</p>
              </div>
              <Button variant="ghost" size="sm" className="text-[#4CAF50]" data-testid={`button-see-all-${group.category.id}`}>
                See All →
              </Button>
            </div>

            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {group.items.map((item) => {
                  const itemPrice = typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2);
                  const itemOriginalPrice = item.originalPrice 
                    ? (typeof item.originalPrice === 'string' ? item.originalPrice : Number(item.originalPrice).toFixed(2)) 
                    : null;
                  const hasPromo = itemOriginalPrice && parseFloat(itemOriginalPrice) > parseFloat(itemPrice);

                  return (
                    <Card
                      key={item.id}
                      className="flex-shrink-0 w-48 overflow-hidden hover-elevate cursor-pointer"
                      onClick={() => handleAddMenuItem(item)}
                      data-testid={`menu-item-${item.id}`}
                    >
                      <CardContent className="p-0">
                        {item.imageUrl && (
                          <div className="relative h-32 w-full bg-muted">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-3">
                          <h3 className="font-semibold text-sm mb-2 line-clamp-2" data-testid={`text-item-name-${item.id}`}>
                            {item.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-[#4CAF50] font-bold text-base" data-testid={`text-item-price-${item.id}`}>
                                {formatKwanza(itemPrice)}
                              </span>
                              {hasPromo && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatKwanza(itemOriginalPrice!)}
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className="h-8 bg-[#4CAF50] hover:bg-[#45a049] text-white font-medium"
                              onClick={(e) => handleQuickAddToCart(item, e)}
                              data-testid={`button-add-${item.id}`}
                            >
                              Order
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </section>
        ))}

        {itemsByCategory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
            <p className="text-sm mt-1">Tente ajustar sua busca</p>
          </div>
        )}
      </main>

      {/* Options Dialog */}
      {selectedMenuItem && (
        <CustomerMenuItemOptionsDialog
          menuItem={selectedMenuItem}
          open={isOptionsDialogOpen}
          onOpenChange={setIsOptionsDialogOpen}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Share Order Dialog */}
      {createdOrder && (
        <ShareOrderDialog
          order={createdOrder}
          restaurantName={restaurant?.name || ''}
          restaurantSlug={''}
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
        />
      )}
    </div>
  );
}
