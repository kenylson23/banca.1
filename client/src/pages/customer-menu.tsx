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
import { 
  ShoppingCart, Plus, Minus, Trash2, Check, ClipboardList, Clock, ChefHat, 
  CheckCircle, PackageSearch, Home, MapPin, Phone, Clock as ClockIcon, 
  UtensilsCrossed, Star, Sparkles, Flame, Leaf, Wheat, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, Category, Order, OrderItem, Restaurant } from '@shared/schema';
import type { SelectedOption } from '@/contexts/CartContext';
import { Link } from 'wouter';
import { CustomerMenuItemOptionsDialog } from '@/components/CustomerMenuItemOptionsDialog';
import { ShareOrderDialog } from '@/components/ShareOrderDialog';
import { TubelightNavBar } from '@/components/ui/tubelight-navbar';

export default function CustomerMenu() {
  const [, params] = useRoute('/mesa/:tableNumber');
  const tableNumber = params?.tableNumber;
  const { items, orderNotes, addItem, updateQuantity, removeItem, setOrderNotes, clearCart, getTotal, getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<'menu' | 'cart' | 'orders'>('menu');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const navItems = [
    { name: 'Menu', url: '#', icon: Home },
    { name: 'Carrinho', url: '#', icon: ShoppingCart },
    { name: 'Pedidos', url: '#', icon: ClipboardList },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.name === 'Menu') {
      setActiveView('menu');
      setIsCartOpen(false);
      setIsOrdersDialogOpen(false);
    } else if (item.name === 'Carrinho') {
      setActiveView('cart');
      setIsCartOpen(true);
      setIsOrdersDialogOpen(false);
    } else if (item.name === 'Pedidos') {
      setActiveView('orders');
      setIsOrdersDialogOpen(true);
      setIsCartOpen(false);
    }
  };

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

  const dietaryTags = [
    { value: 'vegetariano', label: 'Vegetariano', icon: Leaf, color: 'text-green-600' },
    { value: 'vegano', label: 'Vegano', icon: Leaf, color: 'text-green-700' },
    { value: 'sem_gluten', label: 'Sem Glúten', icon: Wheat, color: 'text-amber-600' },
    { value: 'picante', label: 'Picante', icon: Flame, color: 'text-red-600' },
  ];

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
      const matchesFilters = activeFilters.length === 0 || 
        (item.tags && activeFilters.every(filter => item.tags?.includes(filter)));
      return matchesCategory && matchesSearch && matchesFilters;
    }) || [];

  const groupedByCategory = filteredItems?.reduce((acc, item) => {
    const categoryName = item.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, Array<MenuItem & { category: Category }>>);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50 pb-20">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold truncate" data-testid="text-restaurant-name">
              {restaurant?.name || 'NaBancada'}
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-table-number">
              Mesa {currentTable?.number || tableNumber}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {restaurant?.slug ? (
              <Link href={`/r/${restaurant.slug}/rastrear`}>
                <Button variant="outline" className="min-h-10 gap-1.5" data-testid="button-track-order-page">
                  <PackageSearch className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">Rastrear</span>
                </Button>
              </Link>
            ) : restaurant ? (
              <Button 
                variant="outline" 
                className="min-h-10 gap-1.5 opacity-50 cursor-not-allowed" 
                disabled
                data-testid="button-track-order-disabled"
                title="Link de rastreamento não disponível"
              >
                <PackageSearch className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">Rastrear</span>
              </Button>
            ) : null}
            
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
                <Button variant="outline" size="icon" className="relative min-h-10 min-w-10" data-testid="button-open-cart">
                  <ShoppingCart className="h-6 w-6" />
                  <AnimatePresence>
                    {getItemCount() > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2"
                      >
                        <Badge 
                          className="h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
                          data-testid="badge-cart-count"
                        >
                          {getItemCount()}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                      <AnimatePresence>
                        {items.map((item, index) => {
                          const itemPrice = parseFloat(item.menuItem.price);
                          const optionsPrice = item.selectedOptions.reduce((sum, opt) => {
                            return sum + parseFloat(opt.priceAdjustment) * opt.quantity;
                          }, 0);
                          const totalItemPrice = (itemPrice + optionsPrice) * item.quantity;
                          
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card data-testid={`cart-item-${item.id}`}>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base sm:text-lg" data-testid={`text-item-name-${item.id}`}>
                                    {item.menuItem.name}
                                  </CardTitle>
                                  <CardDescription className="text-sm" data-testid={`text-item-price-${item.id}`}>
                                    {formatKwanza(item.menuItem.price)}
                                    {item.selectedOptions.length > 0 && (
                                      <div className="mt-1 space-y-0.5">
                                        {item.selectedOptions.map((opt, idx) => (
                                          <div key={idx} className="text-xs text-muted-foreground">
                                            • {opt.optionGroupName}: {opt.optionName}
                                            {parseFloat(opt.priceAdjustment) !== 0 && (
                                              <span className="ml-1">
                                                ({parseFloat(opt.priceAdjustment) > 0 ? '+' : ''}
                                                {formatKwanza(opt.priceAdjustment)})
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </CardDescription>
                                </CardHeader>
                                <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-10 w-10"
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      data-testid={`button-decrease-${item.id}`}
                                    >
                                      <Minus className="h-5 w-5" />
                                    </Button>
                                    <span className="w-10 text-center font-medium text-lg" data-testid={`text-quantity-${item.id}`}>
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-10 w-10"
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      data-testid={`button-increase-${item.id}`}
                                    >
                                      <Plus className="h-5 w-5" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg" data-testid={`text-item-total-${item.id}`}>
                                      {formatKwanza(totalItemPrice)}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10"
                                      onClick={() => removeItem(item.id)}
                                      data-testid={`button-remove-${item.id}`}
                                    >
                                      <Trash2 className="h-5 w-5 text-destructive" />
                                    </Button>
                                  </div>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
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
                          placeholder="Ex: sem cebola, bem passado..."
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
                      {createOrderMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Enviando...
                        </div>
                      ) : (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Confirmar Pedido
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      {/* Search and Filters */}
      <motion.section 
        className="container px-4 sm:px-6 py-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar no cardápio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
            data-testid="input-search"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="rounded-full flex-shrink-0"
                data-testid="filter-all"
              >
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === String(category.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(String(category.id))}
                  className="rounded-full flex-shrink-0 whitespace-nowrap"
                  data-testid={`filter-${category.id}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Dietary Filters */}
        <div className="flex flex-wrap gap-2">
          {dietaryTags.map(tag => {
            const Icon = tag.icon;
            const isActive = activeFilters.includes(tag.value);
            return (
              <Button
                key={tag.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(tag.value)}
                className="rounded-full gap-1.5"
                data-testid={`dietary-${tag.value}`}
              >
                <Icon className={`h-3 w-3 ${!isActive ? tag.color : ''}`} />
                {tag.label}
              </Button>
            );
          })}
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilters([])}
              className="rounded-full gap-1"
              data-testid="button-clear-filters"
            >
              <X className="h-3 w-3" />
              Limpar
            </Button>
          )}
        </div>
      </motion.section>

      {/* Menu Items */}
      <main className="container px-4 sm:px-6 py-4 pb-24">
        {groupedByCategory && Object.entries(groupedByCategory).map(([categoryName, items], catIndex) => (
          <motion.div 
            key={categoryName} 
            className="mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent flex-1" />
              <h2 className="text-xl sm:text-2xl font-bold" data-testid={`text-category-${categoryName}`}>
                {categoryName}
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent flex-1" />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, itemIndex) => {
                const hasDiscount = item.originalPrice && parseFloat(item.originalPrice) > parseFloat(item.price);
                const discountPercentage = hasDiscount 
                  ? Math.round(((parseFloat(item.originalPrice!) - parseFloat(item.price)) / parseFloat(item.originalPrice!)) * 100)
                  : 0;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: itemIndex * 0.05 }}
                  >
                    <Card 
                      className="overflow-hidden hover-elevate active-elevate-2 flex flex-col h-full"
                      data-testid={`card-menu-item-${item.id}`}
                    >
                      {item.imageUrl && (
                        <div 
                          className="relative aspect-video w-full overflow-hidden bg-muted cursor-pointer group"
                          onClick={() => setImagePreview(item.imageUrl!)}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            data-testid={`img-menu-item-${item.id}`}
                          />
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {hasDiscount && (
                              <Badge 
                                className="bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg"
                                data-testid={`badge-discount-${item.id}`}
                              >
                                -{discountPercentage}%
                              </Badge>
                            )}
                            {item.isFeatured === 1 && (
                              <Badge 
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg gap-1"
                                data-testid={`badge-featured-${item.id}`}
                              >
                                <Star className="h-3 w-3 fill-white" />
                                Destaque
                              </Badge>
                            )}
                            {item.isNew === 1 && (
                              <Badge 
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg gap-1"
                                data-testid={`badge-new-${item.id}`}
                              >
                                <Sparkles className="h-3 w-3" />
                                Novo
                              </Badge>
                            )}
                          </div>

                          {/* Dietary Tags */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="absolute top-3 right-3 flex flex-col gap-1">
                              {item.tags.map(tag => {
                                const tagInfo = dietaryTags.find(t => t.value === tag);
                                if (!tagInfo) return null;
                                const Icon = tagInfo.icon;
                                return (
                                  <div 
                                    key={tag}
                                    className="w-7 h-7 rounded-full bg-white/95 shadow-md flex items-center justify-center backdrop-blur-sm"
                                    title={tagInfo.label}
                                  >
                                    <Icon className={`h-3.5 w-3.5 ${tagInfo.color}`} />
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {item.isAvailable === 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Badge variant="secondary" className="text-lg px-4 py-2">
                                Indisponível
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <CardHeader className="flex-1">
                        <CardTitle className="text-lg sm:text-xl" data-testid={`text-menu-item-name-${item.id}`}>
                          {item.name}
                        </CardTitle>
                        {item.description && (
                          <CardDescription className="text-sm mt-2 line-clamp-2" data-testid={`text-menu-item-description-${item.id}`}>
                            {item.description}
                          </CardDescription>
                        )}
                        {item.preparationTime && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Clock className="h-3 w-3" />
                            <span>{item.preparationTime} min</span>
                          </div>
                        )}
                      </CardHeader>
                      
                      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-col gap-0.5">
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through" data-testid={`text-original-price-${item.id}`}>
                              {formatKwanza(item.originalPrice!)}
                            </span>
                          )}
                          <span className="text-xl sm:text-2xl font-bold text-primary" data-testid={`text-menu-item-price-${item.id}`}>
                            {formatKwanza(item.price)}
                          </span>
                        </div>
                        <Button
                          onClick={() => setSelectedMenuItem(item)}
                          disabled={item.isAvailable === 0}
                          className="min-h-10 px-6"
                          data-testid={`button-add-to-cart-${item.id}`}
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Adicionar
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {(!groupedByCategory || Object.keys(groupedByCategory).length === 0) && (
          <motion.div 
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
              <UtensilsCrossed className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum item encontrado</h3>
            <p className="text-sm text-gray-500" data-testid="text-no-items">
              Tente ajustar seus filtros ou busque por outro termo
            </p>
          </motion.div>
        )}
      </main>

      {/* Dialogs */}
      {selectedMenuItem && (
        <CustomerMenuItemOptionsDialog
          open={!!selectedMenuItem}
          onOpenChange={(open) => !open && setSelectedMenuItem(null)}
          menuItem={selectedMenuItem}
          onAddToCart={(menuItem, selectedOptions) => {
            addItem(menuItem, selectedOptions);
            setSelectedMenuItem(null);
            toast({
              title: 'Adicionado ao carrinho!',
              description: `${menuItem.name} foi adicionado ao seu carrinho.`,
            });
          }}
        />
      )}

      <ShareOrderDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        order={createdOrder}
        restaurantName={restaurant?.name || ''}
      />

      {/* Image Preview Modal */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95">
          <motion.div 
            className="relative aspect-video w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Preview"
                className="w-full h-full object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setImagePreview(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <TubelightNavBar
        items={navItems}
        activeItem={activeView === 'menu' ? 'Menu' : activeView === 'cart' ? 'Carrinho' : 'Pedidos'}
        onItemClick={handleNavClick}
      />
    </div>
  );
}
