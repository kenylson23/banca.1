import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
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
import { CustomerLoginDialog } from '@/components/CustomerLoginDialog';
import { 
  ShoppingCart, Plus, ClipboardList, Clock, ChefHat, 
  CheckCircle, Check, Search, MessageCircle, Utensils,
  X, Minus, User, Phone as PhoneIcon, ChevronRight, ShoppingBag,
  FileText, Sparkles, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, Category, Order, OrderItem, Restaurant, OptionGroup, Option } from '@shared/schema';
import type { SelectedOption } from '@/contexts/CartContext';
import { CustomerMenuItemOptionsDialog } from '@/components/CustomerMenuItemOptionsDialog';
import { ShareOrderDialog } from '@/components/ShareOrderDialog';
import { Heart } from 'lucide-react';

type MenuItemWithOptions = MenuItem & { 
  category: Category; 
  optionGroups?: Array<OptionGroup & { options: Option[] }>;
};

// Helper para converter hex para rgba válido
const hexToRgba = (hex: string, alpha: number = 1): string => {
  // Remove # se presente
  const cleanHex = hex.replace('#', '');
  
  // Valida formato hex (3 ou 6 caracteres)
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return `rgba(234, 88, 12, ${alpha})`; // fallback orange-600
  }
  
  // Converte hex de 3 caracteres para 6
  const fullHex = cleanHex.length === 3 
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
  
  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function CustomerMenu() {
  const [, params] = useRoute('/mesa/:tableNumber');
  const tableNumber = params?.tableNumber;
  
  const { items, orderNotes, addItem, removeItem, setOrderNotes, clearCart, getTotal, getItemCount } = useCart();
  const { isAuthenticated, customer: authCustomer } = useCustomerAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemWithOptions | null>(null);
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'info' | 'review'>('cart');
  const { toast } = useToast();
  
  // Branding state para cores dinâmicas do restaurante
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    heroImageUrl?: string;
  }>({
    primaryColor: '#EA580C', // orange-600 fallback
    secondaryColor: '#DC2626', // red-600 fallback
    accentColor: '#0891B2', // cyan-600 fallback
  });

  const { data: currentTable, isLoading: tableLoading } = useQuery<any>({
    queryKey: ['/api/public/tables', tableNumber],
    enabled: !!tableNumber,
  });

  const tableId = currentTable?.id;
  const restaurantId = currentTable?.restaurantId;

  const { data: menuItems, isLoading: menuLoading } = useQuery<Array<MenuItemWithOptions>>({
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

  // Atualizar branding quando restaurante carregar
  useEffect(() => {
    if (restaurant) {
      setBranding({
        primaryColor: restaurant.primaryColor || '#EA580C',
        secondaryColor: restaurant.secondaryColor || '#DC2626',
        accentColor: restaurant.accentColor || '#0891B2',
        heroImageUrl: restaurant.heroImageUrl || undefined,
      });
    }
  }, [restaurant]);

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
      setCheckoutStep('cart');
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
        return { label: 'Pendente', icon: Clock, color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' };
      case 'em_preparo':
        return { label: 'Em Preparo', icon: ChefHat, color: 'bg-blue-50 text-blue-700 border border-blue-200' };
      case 'pronto':
        return { label: 'Pronto', icon: CheckCircle, color: 'bg-green-50 text-green-700 border border-green-200' };
      case 'servido':
        return { label: 'Servido', icon: Check, color: 'bg-gray-50 text-gray-600 border border-gray-200' };
      default:
        return { label: status, icon: Clock, color: 'bg-gray-50 text-gray-600 border border-gray-200' };
    }
  };

  const handleAddMenuItem = (item: MenuItemWithOptions) => {
    setSelectedMenuItem(item);
    setIsOptionsDialogOpen(true);
  };

  const handleQuickAddToCart = (menuItem: MenuItemWithOptions) => {
    if (menuItem.optionGroups && menuItem.optionGroups.length > 0) {
      setSelectedMenuItem(menuItem);
      setIsOptionsDialogOpen(true);
      return;
    }
    
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

  const handleProceedToInfo = () => {
    if (items.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione itens ao carrinho antes de continuar.',
        variant: 'destructive',
      });
      return;
    }
    setCheckoutStep('info');
  };

  const handleProceedToReview = () => {
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

    setCheckoutStep('review');
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <Utensils className="h-16 w-16 text-gray-300" />
        <p className="text-gray-600 text-lg font-medium">Mesa não identificada</p>
        <p className="text-sm text-gray-400">Por favor, escaneie o QR code da mesa</p>
      </div>
    );
  }

  if (menuLoading || tableLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32 bg-gray-100" />
              <Skeleton className="h-10 w-10 rounded-full bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md bg-gray-100" />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-28 rounded-full flex-shrink-0 bg-gray-100" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-2xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentTable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <Utensils className="h-16 w-16 text-gray-300" />
        <p className="text-gray-600 text-lg font-medium">Mesa {tableNumber} não encontrada</p>
        <p className="text-sm text-gray-400">Verifique o número da mesa e tente novamente</p>
      </div>
    );
  }

  // CSS variables dinâmicas baseadas nas cores do restaurante
  const brandingStyles = {
    '--brand-primary': branding.primaryColor,
    '--brand-secondary': branding.secondaryColor,
    '--brand-accent': branding.accentColor,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-gray-50 relative" style={brandingStyles}>
      {/* Fixed Header - Minimalista e Limpo */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo e Mesa */}
            <div className="flex items-center gap-3">
              {restaurant && (
                <Avatar className="h-11 w-11 sm:h-12 sm:w-12 ring-2 ring-gray-100" data-testid="avatar-restaurant">
                  <AvatarImage src={restaurant.logoUrl || undefined} alt={restaurant.name} />
                  <AvatarFallback className="bg-gray-50 text-gray-700 font-bold text-sm">
                    {restaurant.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col">
                <h1 className="text-base sm:text-lg font-bold text-gray-900">{restaurant?.name}</h1>
                <Badge variant="outline" className="text-xs font-medium w-fit border-gray-200 text-gray-600" data-testid="badge-table-number">
                  Mesa {tableNumber}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600" data-testid="button-track-orders">
                    <ClipboardList className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900" data-testid="text-orders-dialog-title">Seus Pedidos</DialogTitle>
                    <DialogDescription className="text-gray-500" data-testid="text-orders-dialog-description">
                      Acompanhe o status dos seus pedidos em tempo real
                    </DialogDescription>
                  </DialogHeader>
                  
                  <ScrollArea className="max-h-[65vh] pr-4">
                    {ordersLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
                      </div>
                    ) : !tableOrders || tableOrders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <ClipboardList className="h-12 w-12 mb-3 opacity-30" />
                        <p className="font-medium" data-testid="text-no-orders">Nenhum pedido encontrado</p>
                        <p className="text-sm mt-1">Faça seu primeiro pedido!</p>
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
                                <Card className="border-gray-100 shadow-sm" data-testid={`order-card-${order.id}`}>
                                  <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                      <div>
                                        <h3 className="font-semibold text-gray-900" data-testid={`text-order-customer-${order.id}`}>
                                          {order.customerName}
                                        </h3>
                                        <p className="text-sm text-gray-500" data-testid={`text-order-date-${order.id}`}>
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
                                          <span className="text-gray-600">
                                            {item.quantity}x {item.menuItem.name}
                                          </span>
                                          <span className="font-medium text-gray-900">
                                            {formatKwanza(parseFloat(item.price) * item.quantity)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    <Separator className="my-3 bg-gray-100" />
                                    <div className="flex justify-between font-semibold text-gray-900" data-testid={`text-order-total-${order.id}`}>
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
              
              <Button 
                size="icon"
                variant="outline"
                className="relative bg-white/90 backdrop-blur-sm border-gray-200"
                onClick={() => setIsLoginDialogOpen(true)}
                data-testid="button-open-login"
              >
                {isAuthenticated ? (
                  <>
                    <Gift className="h-5 w-5" style={{ color: branding.primaryColor }} />
                    {authCustomer && authCustomer.loyaltyPoints > 0 && (
                      <span 
                        className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center"
                        style={{ backgroundColor: branding.secondaryColor }}
                      >
                        {authCustomer.loyaltyPoints > 999 ? '999+' : authCustomer.loyaltyPoints}
                      </span>
                    )}
                  </>
                ) : (
                  <User className="h-5 w-5 text-gray-600" />
                )}
              </Button>
              
              <Sheet open={isCartOpen} onOpenChange={(open) => {
                setIsCartOpen(open);
                if (!open) setCheckoutStep('cart');
              }}>
                <SheetTrigger asChild>
                  <Button 
                    size="icon"
                    className="relative text-white"
                    style={{ backgroundColor: branding.primaryColor }}
                    data-testid="button-open-cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <AnimatePresence>
                      {getItemCount() > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                          style={{ backgroundColor: branding.secondaryColor }}
                        >
                          {getItemCount()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-white">
                  {/* Header with Steps */}
                  <div className="p-6 pb-4 border-b border-gray-100">
                    <SheetHeader className="mb-4">
                      <SheetTitle className="text-2xl font-bold text-gray-900" data-testid="text-cart-title">
                        {checkoutStep === 'cart' && 'Seu Pedido'}
                        {checkoutStep === 'info' && 'Seus Dados'}
                        {checkoutStep === 'review' && 'Revisar Pedido'}
                      </SheetTitle>
                    </SheetHeader>
                    
                    {/* Progress Steps */}
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-2 ${checkoutStep === 'cart' ? 'text-gray-900' : 'text-gray-400'}`}>
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                          style={checkoutStep === 'cart' ? { backgroundColor: branding.primaryColor } : { backgroundColor: '#f3f4f6' }}
                        >
                          1
                        </div>
                        <span className="text-xs font-medium hidden sm:inline">Itens</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                      <div className={`flex items-center gap-2 ${checkoutStep === 'info' ? 'text-gray-900' : 'text-gray-400'}`}>
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                          style={checkoutStep === 'info' ? { backgroundColor: branding.primaryColor } : { backgroundColor: '#f3f4f6' }}
                        >
                          2
                        </div>
                        <span className="text-xs font-medium hidden sm:inline">Dados</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                      <div className={`flex items-center gap-2 ${checkoutStep === 'review' ? 'text-gray-900' : 'text-gray-400'}`}>
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                          style={checkoutStep === 'review' ? { backgroundColor: branding.primaryColor } : { backgroundColor: '#f3f4f6' }}
                        >
                          3
                        </div>
                        <span className="text-xs font-medium hidden sm:inline">Revisar</span>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 px-6 py-4">
                    <AnimatePresence mode="wait">
                      {/* Step 1: Cart Items */}
                      {checkoutStep === 'cart' && (
                        <motion.div
                          key="cart"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="space-y-4"
                        >
                          {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                              <ShoppingBag className="h-16 w-16 mb-4 opacity-20" />
                              <p className="font-medium text-lg text-gray-600" data-testid="text-empty-cart">Seu carrinho está vazio</p>
                              <p className="text-sm mt-1">Adicione itens do cardápio</p>
                            </div>
                          ) : (
                            <>
                              {items.map((item, index) => {
                                const basePrice = parseFloat(item.menuItem.price);
                                const optionsPrice = item.selectedOptions.reduce((sum, opt) => {
                                  return sum + parseFloat(opt.priceAdjustment) * opt.quantity;
                                }, 0);
                                const totalPrice = (basePrice + optionsPrice) * item.quantity;

                                return (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.03 }}
                                  >
                                    <Card className="overflow-hidden border-gray-100 hover:shadow-md transition-shadow" data-testid={`cart-item-${item.id}`}>
                                      <div className="p-4">
                                        <div className="flex gap-3">
                                          {item.menuItem.imageUrl && (
                                            <img 
                                              src={item.menuItem.imageUrl} 
                                              alt={item.menuItem.name}
                                              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                              <h4 className="font-semibold text-gray-900" data-testid={`text-cart-item-name-${item.id}`}>
                                                {item.menuItem.name}
                                              </h4>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-gray-400 hover:text-red-500 flex-shrink-0 -mt-1"
                                                onClick={() => removeItem(item.id)}
                                                data-testid={`button-remove-${item.id}`}
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            {item.selectedOptions.length > 0 && (
                                              <div className="mt-1 space-y-0.5">
                                                {item.selectedOptions.map((opt, idx) => (
                                                  <p key={idx} className="text-xs text-gray-500">
                                                    • {opt.optionName} (+{formatKwanza(parseFloat(opt.priceAdjustment) * opt.quantity)})
                                                  </p>
                                                ))}
                                              </div>
                                            )}
                                            <div className="flex items-center justify-between mt-3">
                                              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-7 w-7 hover:bg-white"
                                                  onClick={() => {
                                                    if (item.quantity > 1) {
                                                      const newItem = { ...item, quantity: item.quantity - 1 };
                                                      removeItem(item.id);
                                                      addItem(item.menuItem, item.selectedOptions);
                                                    } else {
                                                      removeItem(item.id);
                                                    }
                                                  }}
                                                  data-testid={`button-decrease-${item.id}`}
                                                >
                                                  <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm font-semibold w-6 text-center text-gray-900" data-testid={`text-quantity-${item.id}`}>
                                                  {item.quantity}
                                                </span>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-7 w-7 hover:bg-white"
                                                  onClick={() => addItem(item.menuItem, item.selectedOptions)}
                                                  data-testid={`button-increase-${item.id}`}
                                                >
                                                  <Plus className="h-3 w-3" />
                                                </Button>
                                              </div>
                                              <span className="font-bold text-gray-900" data-testid={`text-item-total-${item.id}`}>
                                                {formatKwanza(totalPrice)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                  </motion.div>
                                );
                              })}
                            </>
                          )}
                        </motion.div>
                      )}

                      {/* Step 2: Customer Info */}
                      {checkoutStep === 'info' && (
                        <motion.div
                          key="info"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="space-y-5"
                        >
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Nome completo
                              </label>
                              <Input
                                placeholder="Digite seu nome"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="h-12 border-gray-200"
                                data-testid="input-customer-name"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <PhoneIcon className="h-4 w-4" />
                                Telefone/WhatsApp
                              </label>
                              <Input
                                placeholder="(XX) XXXXX-XXXX"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="h-12 border-gray-200"
                                data-testid="input-customer-phone"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Observações (opcional)
                              </label>
                              <Textarea
                                placeholder="Ex: sem cebola, bem passado, etc."
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                className="resize-none border-gray-200 min-h-24"
                                data-testid="input-order-notes"
                              />
                            </div>
                          </div>

                          <Card className="bg-gray-50 border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Sparkles className="h-4 w-4 text-gray-400" />
                                <span>Seus dados são usados apenas para este pedido</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {/* Step 3: Review */}
                      {checkoutStep === 'review' && (
                        <motion.div
                          key="review"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="space-y-5"
                        >
                          <Card className="border-gray-200">
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-gray-900 mb-3">Seus Dados</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <User className="h-4 w-4" />
                                  <span>{customerName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <PhoneIcon className="h-4 w-4" />
                                  <span>{customerPhone}</span>
                                </div>
                                {orderNotes && (
                                  <div className="flex items-start gap-2 text-gray-600 pt-2 border-t border-gray-100">
                                    <FileText className="h-4 w-4 mt-0.5" />
                                    <span className="flex-1">{orderNotes}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900">Itens do Pedido</h3>
                            {items.map((item) => {
                              const basePrice = parseFloat(item.menuItem.price);
                              const optionsPrice = item.selectedOptions.reduce((sum, opt) => {
                                return sum + parseFloat(opt.priceAdjustment) * opt.quantity;
                              }, 0);
                              const totalPrice = (basePrice + optionsPrice) * item.quantity;

                              return (
                                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-100">
                                  <div className="flex-1">
                                    <span className="font-medium text-gray-900">{item.quantity}x {item.menuItem.name}</span>
                                    {item.selectedOptions.length > 0 && (
                                      <div className="mt-1 space-y-0.5">
                                        {item.selectedOptions.map((opt, idx) => (
                                          <p key={idx} className="text-xs text-gray-500">
                                            • {opt.optionName}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-semibold text-gray-900 ml-3">
                                    {formatKwanza(totalPrice)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <Card className="bg-gray-50 border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Confira os dados antes de confirmar o pedido</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ScrollArea>

                  {/* Footer with Actions */}
                  {items.length > 0 && (
                    <div className="p-6 pt-4 border-t border-gray-100 space-y-4 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Subtotal</span>
                        <span className="font-semibold text-gray-900">{formatKwanza(getTotal())}</span>
                      </div>
                      <div className="flex items-center justify-between text-lg">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-gray-900" data-testid="text-cart-total">{formatKwanza(getTotal())}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {checkoutStep !== 'cart' && (
                          <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 h-14 text-base font-semibold border-gray-200"
                            onClick={() => setCheckoutStep(checkoutStep === 'review' ? 'info' : 'cart')}
                          >
                            Voltar
                          </Button>
                        )}
                        <Button
                          size="lg"
                          className={`h-14 text-base font-semibold text-white ${checkoutStep === 'cart' ? 'w-full' : 'flex-1'}`}
                          style={{ backgroundColor: branding.primaryColor }}
                          onClick={() => {
                            if (checkoutStep === 'cart') handleProceedToInfo();
                            else if (checkoutStep === 'info') handleProceedToReview();
                            else handleConfirmOrder();
                          }}
                          disabled={createOrderMutation.isPending}
                          data-testid="button-confirm-order"
                        >
                          {createOrderMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              Enviando...
                            </div>
                          ) : (
                            <>
                              {checkoutStep === 'cart' && 'Continuar'}
                              {checkoutStep === 'info' && 'Revisar Pedido'}
                              {checkoutStep === 'review' && 'Confirmar Pedido'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner com imagem e gradiente */}
      <div className="pt-14 sm:pt-16 relative">
        <div 
          className="relative h-48 sm:h-64 overflow-hidden"
          style={{
            backgroundImage: branding.heroImageUrl 
              ? `linear-gradient(135deg, ${hexToRgba(branding.primaryColor, 0.87)} 0%, ${hexToRgba(branding.primaryColor, 0.6)} 50%, ${hexToRgba(branding.secondaryColor, 0.8)} 100%), url('${branding.heroImageUrl}')`
              : `linear-gradient(135deg, ${hexToRgba(branding.primaryColor, 1)} 0%, ${hexToRgba(branding.secondaryColor, 1)} 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Overlay pattern */}
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Conteúdo do Hero */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center">
            <div className="text-white">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                {restaurant?.name || 'Bem-vindo'}
              </h2>
              <p className="text-lg sm:text-xl text-white/95 font-medium drop-shadow-md">
                {restaurant?.description || 'Confira nosso cardápio digital'}
              </p>
              {restaurant?.isOpen === 1 && (
                <Badge className="mt-4 bg-white/20 backdrop-blur-sm border-white/40 text-white font-semibold">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Estamos abertos
                </Badge>
              )}
            </div>
          </div>

          {/* Wave divider na parte inferior */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 48" className="w-full h-8 sm:h-12 text-gray-50">
              <path fill="currentColor" d="M0,32L80,29.3C160,27,320,21,480,21.3C640,21,800,27,960,29.3C1120,32,1280,32,1360,32L1440,32L1440,48L1360,48C1280,48,1120,48,960,48C800,48,640,48,480,48C320,48,160,48,80,48L0,48Z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Search Bar */}
          <div className="py-4 sm:py-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar no cardápio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 sm:h-14 text-base border-white rounded-full bg-white shadow-sm focus:shadow-md transition-shadow"
                data-testid="input-search-main"
              />
            </div>
          </div>

          {/* Categories - Scroll horizontal com cores dinâmicas */}
          {categories.length > 0 && (
            <div className="mb-8">
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory('all')}
                    className="rounded-full flex-shrink-0 font-semibold shadow-sm border-2"
                    style={selectedCategory === 'all' ? {
                      backgroundColor: branding.primaryColor,
                      borderColor: branding.primaryColor,
                      color: 'white'
                    } : {
                      borderColor: '#d1d5db',
                      backgroundColor: 'white',
                      color: '#6b7280'
                    }}
                    data-testid="button-category-all"
                  >
                    Todos
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant="outline"
                      onClick={() => setSelectedCategory(category.id)}
                      className="rounded-full flex-shrink-0 font-semibold shadow-sm border-2"
                      style={selectedCategory === category.id ? {
                        backgroundColor: branding.primaryColor,
                        borderColor: branding.primaryColor,
                        color: 'white'
                      } : {
                        borderColor: '#d1d5db',
                        backgroundColor: 'white',
                        color: '#6b7280'
                      }}
                      data-testid={`button-category-${category.id}`}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Menu Items - Grouped by Category */}
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-600">Nenhum item encontrado</p>
              <p className="text-sm mt-1">Tente buscar por outro termo</p>
            </div>
          ) : (
            <div className="space-y-8 pb-8">
              {categories
                .filter(cat => selectedCategory === 'all' || cat.id === selectedCategory)
                .map((category) => {
                  const categoryItems = filteredItems.filter(item => item.categoryId === category.id);
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                        <span className="text-sm text-gray-500">Ver tudo</span>
                      </div>
                      
                      <div className="space-y-3">
                        <AnimatePresence>
                          {categoryItems.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: index * 0.02 }}
                            >
                              <Card 
                                className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-100 bg-white"
                                data-testid={`menu-item-card-${item.id}`}
                              >
                                <div className="flex items-center p-3 sm:p-4 gap-4">
                                  <div 
                                    className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer"
                                    onClick={() => handleAddMenuItem(item)}
                                  >
                                    {item.imageUrl ? (
                                      <img 
                                        src={item.imageUrl} 
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Utensils className="h-8 w-8 text-gray-300" />
                                      </div>
                                    )}
                                    {item.optionGroups && item.optionGroups.length > 0 && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-1">
                                        <span className="text-[10px] text-white font-medium px-1.5">Personalizável</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div 
                                        className="min-w-0 flex-1 cursor-pointer"
                                        onClick={() => handleAddMenuItem(item)}
                                      >
                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate" data-testid={`text-item-name-${item.id}`}>
                                          {item.name}
                                        </h3>
                                        {item.description && (
                                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-1" data-testid={`text-item-description-${item.id}`}>
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-red-500 flex-shrink-0"
                                        data-testid={`button-favorite-${item.id}`}
                                      >
                                        <Heart className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2 gap-2">
                                      <span 
                                        className="text-base sm:text-lg font-bold cursor-pointer"
                                        style={{ color: branding.primaryColor }}
                                        onClick={() => handleAddMenuItem(item)}
                                        data-testid={`text-item-price-${item.id}`}
                                      >
                                        {formatKwanza(item.price)}
                                      </span>
                                      
                                      {item.isAvailable === 0 ? (
                                        <Badge variant="outline" className="border-red-200 text-red-600 text-xs">
                                          Indisponível
                                        </Badge>
                                      ) : (
                                        <Button
                                          size="sm"
                                          className="h-8 px-4 text-white text-xs font-semibold rounded-full shadow-sm"
                                          style={{ backgroundColor: branding.primaryColor }}
                                          onClick={() => handleQuickAddToCart(item)}
                                          data-testid={`button-add-${item.id}`}
                                        >
                                          <Plus className="h-3.5 w-3.5 mr-1" />
                                          Adicionar
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>

      {/* Footer com informações do restaurante */}
      {restaurant && (
        <footer 
          className="mt-12 py-8 text-white"
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(branding.primaryColor, 1)} 0%, ${hexToRgba(branding.secondaryColor, 1)} 100%)`
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold text-lg mb-3">{restaurant.name}</h3>
                {restaurant.description && (
                  <p className="text-white/90 text-sm mb-2">{restaurant.description}</p>
                )}
                {restaurant.address && (
                  <p className="text-white/80 text-sm">{restaurant.address}</p>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Contato</h4>
                {restaurant.phone && (
                  <p className="text-white/90 text-sm mb-2">
                    📞 {restaurant.phone}
                  </p>
                )}
                {restaurant.whatsappNumber && (
                  <p className="text-white/90 text-sm mb-2">
                    💬 {restaurant.whatsappNumber}
                  </p>
                )}
                {restaurant.businessHours && (
                  <p className="text-white/90 text-sm mt-3">
                    🕒 {restaurant.businessHours}
                  </p>
                )}
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-4 text-center">
              <p className="text-white/70 text-sm">
                © {new Date().getFullYear()} {restaurant.name}. Desenvolvido por NaBancada
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Botão Flutuante WhatsApp */}
      {restaurant?.whatsappNumber && (
        <a
          href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}?text=Olá! Estou na Mesa ${tableNumber} e preciso de ajuda.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-green-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
          data-testid="button-whatsapp-float"
          aria-label="Fale conosco no WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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

      {/* Customer Login Dialog */}
      {restaurantId && (
        <CustomerLoginDialog
          open={isLoginDialogOpen}
          onOpenChange={setIsLoginDialogOpen}
          restaurantId={restaurantId}
          primaryColor={branding.primaryColor}
        />
      )}
    </div>
  );
}
