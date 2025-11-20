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
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, Plus, ClipboardList, Clock, ChefHat, 
  CheckCircle, Check, Search, MessageCircle, ChevronLeft, Utensils, ArrowRight,
  MapPin, Phone, Mail, Facebook, Instagram
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  const filteredItems = menuItems
    ?.filter(item => item.isVisible === 1)
    ?.filter(item => {
      const matchesCategory = selectedCategory === 'all' || String(item.categoryId) === selectedCategory;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    }) || [];

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
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </Card>
            ))}
          </div>
        </div>
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
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Moderno com Cores Claras - Mesh Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/40 to-pink-50/30 dark:from-blue-950/10 dark:via-purple-950/5 dark:to-pink-950/5 -z-10" />
      
      {/* Formas decorativas com gradientes suaves */}
      <div className="fixed top-[-10%] left-[-5%] w-[70%] h-[70%] bg-gradient-to-br from-blue-100/60 to-cyan-100/40 dark:from-blue-900/10 dark:to-cyan-900/5 rounded-full blur-3xl -z-10" />
      <div className="fixed top-[20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-bl from-purple-100/50 to-pink-100/40 dark:from-purple-900/8 dark:to-pink-900/5 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-[-15%] left-[10%] w-[65%] h-[65%] bg-gradient-to-tr from-amber-50/60 to-orange-50/40 dark:from-amber-900/8 dark:to-orange-900/5 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-[10%] right-[-5%] w-[55%] h-[55%] bg-gradient-to-tl from-teal-100/50 to-emerald-100/40 dark:from-teal-900/8 dark:to-emerald-900/5 rounded-full blur-3xl -z-10" />
      
      {/* Overlay sutil para unificar */}
      <div className="fixed inset-0 bg-white/40 dark:bg-background/60 -z-10" />

      {/* Fixed Header Moderno */}
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {restaurant && (
                <Avatar className="h-10 w-10 ring-2 ring-primary/20" data-testid="avatar-restaurant">
                  <AvatarImage src={restaurant.logoUrl || undefined} alt={restaurant.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {restaurant.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col">
                <Badge variant="outline" className="text-sm font-semibold w-fit" data-testid="badge-table-number">
                  Mesa {tableNumber}
                </Badge>
                {restaurant && (
                  <span className="text-xs text-muted-foreground mt-0.5">{restaurant.name}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 h-9 pr-8"
                  data-testid="input-search"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>

              <div className="sm:hidden relative flex-1 max-w-[200px]">
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pr-8"
                  data-testid="input-search-header-mobile"
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                          className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
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
                      <SheetTitle className="text-2xl font-bold" data-testid="text-cart-title">Seu Pedido</SheetTitle>
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
                                  <span className="text-primary font-bold text-sm">
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
                                className="text-primary hover:text-primary/90 hover:bg-primary/10"
                              >
                                Remover
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
                          Adicionar Mais Itens
                        </Button>
                      </div>
                    )}
                  </ScrollArea>

                  {items.length > 0 && (
                    <div className="p-6 border-t space-y-4">
                      <div className="space-y-3">
                        <Input
                          placeholder="Seu nome"
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
                          placeholder="Observações do pedido (opcional)..."
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          rows={2}
                          data-testid="input-order-notes"
                        />
                      </div>

                      <Button
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base"
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
                          'Enviar para Cozinha'
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

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {restaurant?.logoUrl && (
                <div className="flex justify-center mb-8">
                  <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                    <AvatarImage src={restaurant.logoUrl} alt={restaurant.name} />
                    <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                      {restaurant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Utensils className="h-4 w-4" />
                <span className="text-sm font-medium">Mesa {tableNumber}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Bem-vindo ao <span className="text-primary">{restaurant?.name || 'Nosso Restaurante'}</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8">
                Explore nosso cardápio e faça seu pedido diretamente da sua mesa
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-8"
                onClick={() => {
                  const menuSection = document.getElementById('menu-section');
                  menuSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="button-see-menu"
              >
                Ver Cardápio
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            {restaurant?.businessHours && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Clock className="h-4 w-4 text-primary" />
                <span>{restaurant.businessHours}</span>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="block sm:hidden mb-4">
            <div className="relative">
              <Input
                placeholder="Buscar pratos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pr-8"
                data-testid="input-search-mobile"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {categories.length > 0 && (
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'bg-primary hover:bg-primary/90' : ''}
                  data-testid="category-all"
                >
                  Todos
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? 'bg-primary hover:bg-primary/90' : ''}
                    data-testid={`category-${category.id}`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </section>

      {/* Menu Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12" id="menu-section">
        {selectedCategory === 'all' ? (
          itemsByCategory.map((group, groupIndex) => (
            <motion.section
              key={group.category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
              className="mb-16"
              id={`category-${group.category.id}`}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">{group.category.name}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((item, itemIndex) => {
                  const itemPrice = typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2);
                  const itemOriginalPrice = item.originalPrice 
                    ? (typeof item.originalPrice === 'string' ? item.originalPrice : Number(item.originalPrice).toFixed(2)) 
                    : null;
                  const hasPromo = itemOriginalPrice && parseFloat(itemOriginalPrice) > parseFloat(itemPrice);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                    >
                      <Card
                        className="overflow-hidden hover-elevate cursor-pointer h-full flex flex-col"
                        onClick={() => handleAddMenuItem(item)}
                        data-testid={`menu-item-${item.id}`}
                      >
                        <CardContent className="p-0 flex flex-col h-full">
                          {item.imageUrl ? (
                            <div className="relative h-56 w-full bg-muted overflow-hidden">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                              {hasPromo && (
                                <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                                  Promoção
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="relative h-56 w-full bg-muted flex items-center justify-center">
                              <Utensils className="h-16 w-16 text-muted-foreground/30" />
                              {hasPromo && (
                                <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                                  Promoção
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-lg mb-2 line-clamp-2" data-testid={`text-item-name-${item.id}`}>
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-auto flex items-center justify-between gap-3">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="text-primary font-bold text-xl" data-testid={`text-item-price-${item.id}`}>
                                    {formatKwanza(itemPrice)}
                                  </span>
                                  {hasPromo && (
                                    <span className="text-sm text-muted-foreground line-through">
                                      {formatKwanza(itemOriginalPrice!)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-white font-medium"
                                onClick={(e) => handleQuickAddToCart(item, e)}
                                data-testid={`button-add-${item.id}`}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          ))
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, itemIndex) => {
              const itemPrice = typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2);
              const itemOriginalPrice = item.originalPrice 
                ? (typeof item.originalPrice === 'string' ? item.originalPrice : Number(item.originalPrice).toFixed(2)) 
                : null;
              const hasPromo = itemOriginalPrice && parseFloat(itemOriginalPrice) > parseFloat(itemPrice);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                >
                  <Card
                    className="overflow-hidden hover-elevate cursor-pointer h-full flex flex-col"
                    onClick={() => handleAddMenuItem(item)}
                    data-testid={`menu-item-${item.id}`}
                  >
                    <CardContent className="p-0 flex flex-col h-full">
                      {item.imageUrl ? (
                        <div className="relative h-56 w-full bg-muted overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          {hasPromo && (
                            <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                              Promoção
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="relative h-56 w-full bg-muted flex items-center justify-center">
                          <Utensils className="h-16 w-16 text-muted-foreground/30" />
                          {hasPromo && (
                            <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                              Promoção
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2" data-testid={`text-item-name-${item.id}`}>
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-primary font-bold text-xl" data-testid={`text-item-price-${item.id}`}>
                                {formatKwanza(itemPrice)}
                              </span>
                              {hasPromo && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatKwanza(itemOriginalPrice!)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white font-medium"
                            onClick={(e) => handleQuickAddToCart(item, e)}
                            data-testid={`button-add-${item.id}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
            <p className="text-sm mt-1">Tente ajustar sua busca ou filtro</p>
          </div>
        )}
      </main>

      {/* Seção de Horários de Funcionamento */}
      {restaurant?.businessHours && (
        <section className="py-12 sm:py-16 border-t border-border/30 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Horários de Funcionamento
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Estamos prontos para atendê-lo
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="overflow-hidden bg-card/70 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center justify-center gap-3 text-center">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-base text-foreground font-medium">{restaurant.businessHours}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Footer Moderno */}
      <footer className="bg-muted/30 border-t border-border/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6">
            {/* Sobre o Restaurante */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                {restaurant && (
                  <>
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20" data-testid="avatar-footer">
                      <AvatarImage src={restaurant.logoUrl || undefined} alt={restaurant.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {restaurant.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-base font-bold text-foreground">{restaurant.name}</h3>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fazendo pedidos direto da sua mesa através do QR Code. Experiência moderna e sem complicações.
              </p>
            </div>

            {/* Contato */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Contato</h4>
              <div className="space-y-2">
                {restaurant?.whatsappNumber && (
                  <a 
                    href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-testid="link-phone-footer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.whatsappNumber}</span>
                  </a>
                )}
                {restaurant?.email && (
                  <a 
                    href={`mailto:${restaurant.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-testid="link-email-footer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{restaurant.email}</span>
                  </a>
                )}
                {restaurant?.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground" data-testid="text-address-footer">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Redes Sociais */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Siga-nos</h4>
              <div className="flex gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-primary/10 text-primary hover-elevate active-elevate-2 transition-colors"
                  data-testid="link-facebook-footer"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-primary/10 text-primary hover-elevate active-elevate-2 transition-colors"
                  data-testid="link-instagram-footer"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                {restaurant?.whatsappNumber && (
                  <a
                    href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-primary/10 text-primary hover-elevate active-elevate-2 transition-colors"
                    data-testid="link-whatsapp-footer"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-border/50">
            <p className="text-center text-xs sm:text-sm text-muted-foreground">
              © {new Date().getFullYear()} {restaurant?.name || 'Na Bancada'}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante WhatsApp */}
      {restaurant?.whatsappNumber && (
        <a
          href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}?text=Olá! Estou na Mesa ${tableNumber} e gostaria de fazer um pedido.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-green-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
          data-testid="button-whatsapp-float"
          aria-label="Fale conosco no WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-background text-foreground px-3 py-2 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chamar garçom
          </span>
        </a>
      )}

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
      {createdOrder && restaurant && (
        <ShareOrderDialog
          order={createdOrder}
          restaurantName={restaurant.name}
          restaurantSlug={restaurant.slug || ''}
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
        />
      )}
    </div>
  );
}
