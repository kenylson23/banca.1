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
  UtensilsCrossed, Star, Sparkles, Flame, Leaf, Wheat, X, MessageCircle, Search 
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
  
  // Black and white theme for public menu only
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'customer-menu-bw-theme';
    style.innerHTML = `
      .customer-menu-bw {
        --foreground: 0 0% 9%;
        --primary: 0 0% 9%;
        --primary-foreground: 0 0% 100%;
        --secondary: 0 0% 96%;
        --secondary-foreground: 0 0% 9%;
        --muted: 0 0% 96%;
        --muted-foreground: 0 0% 45%;
        --accent: 0 0% 96%;
        --accent-foreground: 0 0% 9%;
        --destructive: 0 0% 20%;
        --destructive-foreground: 0 0% 100%;
        --border: 0 0% 90%;
        --input: 0 0% 90%;
        --ring: 0 0% 9%;
        --card: 0 0% 100%;
        --card-foreground: 0 0% 9%;
        --popover: 0 0% 100%;
        --popover-foreground: 0 0% 9%;
        --sidebar-primary: 0 0% 9%;
        --sidebar-primary-foreground: 0 0% 100%;
        --sidebar-accent: 0 0% 96%;
        --sidebar-accent-foreground: 0 0% 9%;
        --sidebar-ring: 0 0% 9%;
      }
      
      .dark .customer-menu-bw {
        --background: 0 0% 0%;
        --foreground: 0 0% 98%;
        --border: 0 0% 20%;
        --card: 0 0% 10%;
        --card-foreground: 0 0% 98%;
        --popover: 0 0% 10%;
        --popover-foreground: 0 0% 98%;
        --primary: 0 0% 98%;
        --primary-foreground: 0 0% 0%;
        --secondary: 0 0% 20%;
        --secondary-foreground: 0 0% 98%;
        --muted: 0 0% 15%;
        --muted-foreground: 0 0% 60%;
        --accent: 0 0% 20%;
        --accent-foreground: 0 0% 98%;
        --destructive: 0 0% 80%;
        --destructive-foreground: 0 0% 0%;
        --input: 0 0% 20%;
        --ring: 0 0% 98%;
        --sidebar-primary: 0 0% 98%;
        --sidebar-primary-foreground: 0 0% 0%;
        --sidebar-accent: 0 0% 15%;
        --sidebar-accent-foreground: 0 0% 98%;
        --sidebar-ring: 0 0% 98%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('customer-menu-bw-theme');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
  const { items, orderNotes, addItem, updateQuantity, removeItem, setOrderNotes, clearCart, getTotal, getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<'menu' | 'cart' | 'orders'>('menu');
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
          color: 'bg-muted text-foreground',
        };
      case 'em_preparo':
        return {
          label: 'Em Preparo',
          icon: ChefHat,
          color: 'bg-foreground text-background',
        };
      case 'pronto':
        return {
          label: 'Pronto',
          icon: CheckCircle,
          color: 'bg-muted text-foreground',
        };
      case 'servido':
        return {
          label: 'Servido',
          icon: Check,
          color: 'bg-muted text-muted-foreground',
        };
      default:
        return {
          label: status,
          icon: Clock,
          color: 'bg-muted text-muted-foreground',
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
    <div className="customer-menu-bw min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 w-full border-b bg-background"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="container px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold leading-tight" data-testid="text-restaurant-name">
                  {restaurant?.name || 'NaBancada'}
                </h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge className="text-xs h-5 px-2" data-testid="badge-restaurant-status">
                    Aberto
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {restaurant?.whatsappNumber && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${restaurant.whatsappNumber.replace(/\D/g, '')}&text=${encodeURIComponent(`👋 Olá, venho de ${window.location.origin} \nEu quero fazer o próximo pedido:\n`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-whatsapp"
                >
                  <Button variant="outline" size="icon" className="min-h-10 min-w-10">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </a>
              )}
              
              <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" data-testid="button-track-orders" className="min-h-10 min-w-10">
                    <ClipboardList className="h-5 w-5" />
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
                  <ShoppingCart className="h-5 w-5" />
                  <AnimatePresence>
                    {getItemCount() > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2"
                      >
                        <Badge 
                          className="h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
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
        </div>
      </motion.header>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="sticky top-[61px] z-40 bg-background border-b">
          <ScrollArea className="w-full">
            <div className="container px-4 sm:px-6 flex gap-6 py-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`text-sm font-bold transition-colors whitespace-nowrap pb-2 ${
                  selectedCategory === 'all'
                    ? 'text-foreground border-b-2 border-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                data-testid="filter-all"
              >
                Pratos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(String(category.id))}
                  className={`text-sm font-bold transition-colors whitespace-nowrap pb-2 ${
                    selectedCategory === String(category.id)
                      ? 'text-foreground border-b-2 border-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={`filter-${category.id}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Menu Items */}
      <main className="container px-4 sm:px-6 py-4 pb-24">
        {groupedByCategory && Object.entries(groupedByCategory).map(([categoryName, items], catIndex) => (
          <motion.div 
            key={categoryName} 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
          >
            <h2 className="text-xl font-bold mb-4" data-testid={`text-category-${categoryName}`}>
              {categoryName}
            </h2>
            
            <div className="space-y-4">
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
                    className={`${item.isAvailable === 0 ? 'opacity-60' : ''}`}
                    data-testid={`card-menu-item-${item.id}`}
                  >
                    <div className="flex gap-4 py-4 border-b">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base leading-tight mb-1" data-testid={`text-menu-item-name-${item.id}`}>
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3" data-testid={`text-menu-item-description-${item.id}`}>
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          {hasDiscount && (
                            <>
                              <Badge 
                                className="font-bold text-xs px-2 py-0.5"
                                data-testid={`badge-discount-${item.id}`}
                              >
                                -{discountPercentage}%
                              </Badge>
                              <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${item.id}`}>
                                {formatKwanza(item.originalPrice!)}
                              </span>
                            </>
                          )}
                          <span className="text-base font-bold" data-testid={`text-menu-item-price-${item.id}`}>
                            {formatKwanza(item.price)}
                          </span>
                        </div>
                      </div>
                      
                      {item.imageUrl && (
                        <div className="relative w-28 h-28 flex-shrink-0">
                          <div className="w-full h-full overflow-hidden rounded-lg bg-muted">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              data-testid={`img-menu-item-${item.id}`}
                            />
                          </div>
                          {item.isAvailable === 0 ? (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                              <span className="text-xs text-white font-medium">Indisponível</span>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                              onClick={() => setSelectedMenuItem(item)}
                              data-testid={`button-add-${item.id}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
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

      {/* Bottom Navigation */}
      <TubelightNavBar
        items={navItems}
        activeItem={activeView === 'menu' ? 'Menu' : activeView === 'cart' ? 'Carrinho' : 'Pedidos'}
        onItemClick={handleNavClick}
      />
    </div>
  );
}
