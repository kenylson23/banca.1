import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, Plus, Minus, Trash2, Clock, Bike, ShoppingBag, Search, 
  MapPin, Phone, X, ChevronLeft, ChevronRight, Utensils, Star, ArrowRight, UserPlus, Gift, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, Category, Restaurant, Order } from '@shared/schema';
import { CustomerMenuItemOptionsDialog } from '@/components/CustomerMenuItemOptionsDialog';
import type { SelectedOption } from '@/contexts/CartContext';
import { ShareOrderDialog } from '@/components/ShareOrderDialog';
import { SiWhatsapp } from 'react-icons/si';

export default function PublicMenu() {
  const [, params] = useRoute('/r/:slug');
  const slug = params?.slug;
  const { items, addItem, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'takeout'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    address: '',
  });
  const { toast } = useToast();

  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ['/api/public/restaurants/slug', slug],
    queryFn: async () => {
      const response = await fetch(`/api/public/restaurants/slug/${slug}`);
      if (!response.ok) throw new Error('Restaurante não encontrado');
      return response.json();
    },
    enabled: !!slug,
  });

  const restaurantId = restaurant?.id;

  const { data: menuItems, isLoading: menuLoading } = useQuery<Array<MenuItem & { category: Category }>>({
    queryKey: ['/api/public/menu-items', restaurantId],
    enabled: !!restaurantId,
  });

  useEffect(() => {
    if (!restaurantId) return;

    apiRequest('POST', '/api/menu-visits', {
      restaurantId,
      branchId: null,
      visitSource: 'web',
      ipAddress: '',
      userAgent: navigator.userAgent,
      referrer: document.referrer || '',
    }).catch(() => {});
  }, [restaurantId]);

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

  const registerCustomerMutation = useMutation({
    mutationFn: async (customerData: typeof registerFormData) => {
      if (!restaurantId) throw new Error('Restaurante não encontrado');
      return await apiRequest('POST', '/api/public/customers', {
        ...customerData,
        restaurantId,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Cadastro realizado!',
        description: 'Você foi cadastrado com sucesso e já pode aproveitar os benefícios.',
      });
      setRegisterFormData({
        name: '',
        phone: '',
        email: '',
        cpf: '',
        address: '',
      });
      setIsRegisterDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cadastrar',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      restaurantId: string;
      orderType: 'delivery' | 'takeout';
      customerName: string;
      customerPhone: string;
      deliveryAddress?: string;
      items: Array<{ 
        menuItemId: string; 
        quantity: number; 
        price: string;
        selectedOptions: SelectedOption[];
      }>;
    }) => {
      const totalAmount = orderData.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);
      const response = await apiRequest('POST', '/api/public/orders', {
        restaurantId: orderData.restaurantId,
        orderType: orderData.orderType,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        status: 'pendente',
        totalAmount,
        items: orderData.items,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data && data.id) {
        setCreatedOrder(data);
        setIsShareDialogOpen(true);
        toast({
          title: 'Pedido enviado!',
          description: orderType === 'delivery' 
            ? 'Seu pedido será entregue em breve.'
            : 'Seu pedido estará pronto para retirada em breve.',
        });
        clearCart();
        setCustomerName('');
        setCustomerPhone('');
        setDeliveryAddress('');
        setIsCartOpen(false);
      } else {
        toast({
          title: 'Erro ao enviar pedido',
          description: 'Resposta inválida do servidor. Tente novamente.',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar pedido',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

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
    if (!restaurant) {
      toast({
        title: 'Erro',
        description: 'Restaurante não encontrado.',
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

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      toast({
        title: 'Endereço obrigatório',
        description: 'Por favor, informe o endereço de entrega.',
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
      restaurantId: restaurant.id,
      orderType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
      items: orderItems,
    });
  };

  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-foreground text-lg font-medium">Link inválido</p>
        <p className="text-sm text-muted-foreground">Verifique o link e tente novamente</p>
      </div>
    );
  }

  if (menuLoading || restaurantLoading) {
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

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-foreground text-lg font-medium">Restaurante não encontrado</p>
        <p className="text-sm text-muted-foreground">Verifique o link e tente novamente</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{restaurant.name}</h1>
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

              {restaurant.whatsappNumber && (
                <Button variant="ghost" size="icon" asChild data-testid="button-whatsapp">
                  <a
                    href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SiWhatsapp className="h-5 w-5 text-[#25D366]" />
                  </a>
                </Button>
              )}
              
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
                  <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b bg-background">
                    <SheetHeader>
                      <SheetTitle className="text-xl sm:text-2xl font-bold" data-testid="text-cart-title">Seu Pedido</SheetTitle>
                    </SheetHeader>
                  </div>

                  <ScrollArea className="flex-1 px-4 sm:px-6 py-3 sm:py-4">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
                        <p className="font-medium text-lg" data-testid="text-empty-cart">Seu carrinho está vazio</p>
                        <p className="text-sm mt-1">Adicione itens do cardápio</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {items.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex gap-3 items-start p-3 rounded-lg bg-muted/30 border"
                              data-testid={`cart-item-${item.id}`}
                            >
                              {item.menuItem.imageUrl && (
                                <img
                                  src={item.menuItem.imageUrl}
                                  alt={item.menuItem.name}
                                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base sm:text-lg mb-1 leading-tight">{item.menuItem.name}</h4>
                                {item.selectedOptions.length > 0 && (
                                  <div className="mb-2 space-y-0.5">
                                    {item.selectedOptions.map((opt, idx) => (
                                      <p key={idx} className="text-xs sm:text-sm text-muted-foreground">
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
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-primary font-bold text-base sm:text-lg">
                                    {formatKwanza(
                                      (parseFloat(item.menuItem.price) + 
                                        item.selectedOptions.reduce((sum, opt) => sum + parseFloat(opt.priceAdjustment) * opt.quantity, 0)
                                      ) * item.quantity
                                    )}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                    data-testid={`button-remove-${item.id}`}
                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-8 px-2 text-xs"
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        
                        <Button 
                          variant="outline"
                          className="w-full mt-4 h-11"
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
                    <div className="p-4 sm:p-6 border-t space-y-4 bg-background">
                      <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-base sm:text-lg font-semibold text-foreground">Total</span>
                          <span className="text-xl sm:text-2xl font-bold text-primary">{formatKwanza(getTotal())}</span>
                        </div>
                      </div>

                      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'delivery' | 'takeout')}>
                        <TabsList className="grid w-full grid-cols-2 h-11">
                          <TabsTrigger value="delivery" data-testid="tab-delivery" className="gap-2 text-sm sm:text-base">
                            <Bike className="h-4 w-4" />
                            Delivery
                          </TabsTrigger>
                          <TabsTrigger value="takeout" data-testid="tab-takeout" className="gap-2 text-sm sm:text-base">
                            <ShoppingBag className="h-4 w-4" />
                            Retirada
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="customer-name" className="text-sm font-medium mb-1.5 block">Nome Completo</Label>
                          <Input
                            id="customer-name"
                            placeholder="Digite seu nome"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            data-testid="input-customer-name"
                            className="h-11 text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="customer-phone" className="text-sm font-medium mb-1.5 block">Telefone/WhatsApp</Label>
                          <Input
                            id="customer-phone"
                            placeholder="Digite seu telefone"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            data-testid="input-customer-phone"
                            className="h-11 text-base"
                            type="tel"
                          />
                        </div>
                        {orderType === 'delivery' && (
                          <div>
                            <Label htmlFor="delivery-address" className="text-sm font-medium mb-1.5 block">Endereço de Entrega</Label>
                            <Textarea
                              id="delivery-address"
                              placeholder="Rua, número, bairro..."
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              rows={3}
                              data-testid="input-delivery-address"
                              className="text-base resize-none"
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full h-12 sm:h-14 bg-primary hover:bg-primary/90 text-white font-bold text-base sm:text-lg"
                        onClick={handleConfirmOrder}
                        disabled={createOrderMutation.isPending}
                        data-testid="button-confirm-order"
                      >
                        {createOrderMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Enviando...
                          </div>
                        ) : (
                          'Finalizar Pedido'
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {restaurant.logoUrl && (
                <div className="flex justify-center mb-8">
                  <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                    <AvatarImage src={restaurant.logoUrl} alt={restaurant.name} />
                    <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                      {restaurant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Bem-vindo ao <span className="text-primary">{restaurant.name}</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8">
                Experimente o melhor da nossa culinária no conforto da sua casa ou mesa
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8"
                  onClick={() => setIsRegisterDialogOpen(true)}
                  data-testid="button-register"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Cadastrar
                </Button>
                {restaurant.whatsappNumber && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8"
                    asChild
                    data-testid="button-hero-whatsapp"
                  >
                    <a
                      href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SiWhatsapp className="mr-2 h-5 w-5" />
                      Falar no WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>

            {(restaurant.address || restaurant.phone || restaurant.businessHours) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-12 flex flex-wrap gap-6 justify-center text-sm text-muted-foreground"
              >
                {restaurant.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                {restaurant.businessHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{restaurant.businessHours}</span>
                  </div>
                )}
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

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
                        className="overflow-hidden hover-elevate cursor-pointer h-full flex flex-col border-2 shadow-sm"
                        onClick={() => handleAddMenuItem(item)}
                        data-testid={`menu-item-${item.id}`}
                      >
                        <CardContent className="p-0 flex flex-col h-full">
                          {item.imageUrl ? (
                            <div className="relative aspect-square w-full bg-muted overflow-hidden">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                              {hasPromo && (
                                <Badge className="absolute top-1 right-1 bg-red-500 text-white text-[9px] px-1 py-0.5">
                                  Promo
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="relative aspect-square w-full bg-muted flex items-center justify-center">
                              <Utensils className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" />
                              {hasPromo && (
                                <Badge className="absolute top-1 right-1 bg-red-500 text-white text-[9px] px-1 py-0.5">
                                  Promo
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="p-2 sm:p-2.5 flex flex-col flex-1 gap-1">
                            <h3 className="font-bold text-xs sm:text-sm leading-tight line-clamp-2" data-testid={`text-item-name-${item.id}`}>
                              {item.name}
                            </h3>
                            <div className="mt-auto flex flex-col gap-1.5">
                              <div className="flex items-baseline gap-1 flex-wrap">
                                <span className="text-primary font-bold text-sm sm:text-base" data-testid={`text-item-price-${item.id}`}>
                                  {formatKwanza(itemPrice)}
                                </span>
                                {hasPromo && (
                                  <span className="text-[9px] sm:text-[10px] text-muted-foreground line-through">
                                    {formatKwanza(itemOriginalPrice!)}
                                  </span>
                                )}
                              </div>
                              <Button
                                size="icon"
                                className="w-full h-7 sm:h-8 bg-primary hover:bg-primary/90 text-white"
                                onClick={(e) => handleQuickAddToCart(item, e)}
                                data-testid={`button-add-${item.id}`}
                              >
                                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
                    className="overflow-hidden hover-elevate cursor-pointer h-full flex flex-col border-2 shadow-sm"
                    onClick={() => handleAddMenuItem(item)}
                    data-testid={`menu-item-${item.id}`}
                  >
                    <CardContent className="p-0 flex flex-col h-full">
                      {item.imageUrl ? (
                        <div className="relative aspect-square w-full bg-muted overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          {hasPromo && (
                            <Badge className="absolute top-1 right-1 bg-red-500 text-white text-[9px] px-1 py-0.5">
                              Promo
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="relative aspect-square w-full bg-muted flex items-center justify-center">
                          <Utensils className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" />
                          {hasPromo && (
                            <Badge className="absolute top-1 right-1 bg-red-500 text-white text-[9px] px-1 py-0.5">
                              Promo
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="p-2 sm:p-2.5 flex flex-col flex-1 gap-1">
                        <h3 className="font-bold text-xs sm:text-sm leading-tight line-clamp-2" data-testid={`text-item-name-${item.id}`}>
                          {item.name}
                        </h3>
                        <div className="mt-auto flex flex-col gap-1.5">
                          <div className="flex items-baseline gap-1 flex-wrap">
                            <span className="text-primary font-bold text-sm sm:text-base" data-testid={`text-item-price-${item.id}`}>
                              {formatKwanza(itemPrice)}
                            </span>
                            {hasPromo && (
                              <span className="text-[9px] sm:text-[10px] text-muted-foreground line-through">
                                {formatKwanza(itemOriginalPrice!)}
                              </span>
                            )}
                          </div>
                          <Button
                            size="icon"
                            className="w-full h-7 sm:h-8 bg-primary hover:bg-primary/90 text-white"
                            onClick={(e) => handleQuickAddToCart(item, e)}
                            data-testid={`button-add-${item.id}`}
                          >
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
          restaurantName={restaurant.name}
          restaurantSlug={restaurant.slug || ''}
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
        />
      )}

      {/* Customer Registration Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-register-customer">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Cadastre-se e ganhe benefícios!</DialogTitle>
            <DialogDescription className="space-y-2 text-sm">
              <p>Ao se cadastrar você terá acesso a:</p>
              <ul className="list-none space-y-1 ml-1">
                <li className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Programa de fidelidade com pontos em cada compra</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Descontos e promoções exclusivas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Bônus especial de aniversário</span>
                </li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            registerCustomerMutation.mutate(registerFormData);
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nome Completo *</Label>
                <Input
                  id="register-name"
                  placeholder="Digite seu nome completo"
                  value={registerFormData.name}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, name: e.target.value })}
                  required
                  data-testid="input-register-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-phone">Telefone</Label>
                <Input
                  id="register-phone"
                  type="tel"
                  placeholder="+244 900 000 000"
                  value={registerFormData.phone}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, phone: e.target.value })}
                  data-testid="input-register-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={registerFormData.email}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}
                  data-testid="input-register-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-cpf">CPF/BI</Label>
                <Input
                  id="register-cpf"
                  placeholder="Documento de identificação"
                  value={registerFormData.cpf}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, cpf: e.target.value })}
                  data-testid="input-register-cpf"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-address">Endereço</Label>
                <Textarea
                  id="register-address"
                  placeholder="Endereço completo"
                  value={registerFormData.address}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, address: e.target.value })}
                  rows={3}
                  data-testid="input-register-address"
                />
              </div>
            </div>
            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsRegisterDialogOpen(false);
                  setRegisterFormData({
                    name: '',
                    phone: '',
                    email: '',
                    cpf: '',
                    address: '',
                  });
                }}
                data-testid="button-cancel-register"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={registerCustomerMutation.isPending}
                data-testid="button-submit-register"
              >
                {registerCustomerMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cadastrando...
                  </div>
                ) : (
                  'Cadastrar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
