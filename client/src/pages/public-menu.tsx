import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, Plus, Minus, Trash2, Clock, Bike, ShoppingBag, Search, Star, 
  TrendingUp, MapPin, Phone, ChevronRight, UtensilsCrossed, Sparkles, Flame,
  Leaf, X, Filter, Wheat
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, Category, Restaurant, Order } from '@shared/schema';
import { Link } from 'wouter';
import { CustomerMenuItemOptionsDialog } from '@/components/CustomerMenuItemOptionsDialog';
import type { SelectedOption } from '@/contexts/CartContext';
import { ShareOrderDialog } from '@/components/ShareOrderDialog';

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
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowSearchBar(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = menuItems
    ?.filter(item => item.isVisible === 1)
    ?.reduce((acc, item) => {
      if (!acc.find(cat => cat.id === item.category.id)) {
        acc.push(item.category);
      }
      return acc;
    }, [] as Category[])
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) || [];

  const dietaryTags = [
    { value: 'vegetariano', label: 'Vegetariano', icon: Leaf, color: 'text-green-600' },
    { value: 'vegano', label: 'Vegano', icon: Leaf, color: 'text-green-700' },
    { value: 'sem_gluten', label: 'Sem Glúten', icon: Wheat, color: 'text-amber-600' },
    { value: 'picante', label: 'Picante', icon: Flame, color: 'text-red-600' },
  ];

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

  const scrollToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offset = 180;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground text-lg">Link inválido</p>
        <p className="text-sm text-muted-foreground">Verifique o link e tente novamente</p>
      </div>
    );
  }

  if (menuLoading || restaurantLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="relative">
          <Skeleton className="h-[240px] sm:h-[320px] w-full rounded-none" />
          <div className="container px-4 sm:px-6">
            <div className="relative -mt-16 sm:-mt-20 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-40">
          <div className="container px-4 sm:px-6 py-4">
            <div className="flex gap-2 overflow-x-auto">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>

        <main className="container px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full aspect-square" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-6 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground text-lg">Restaurante não encontrado</p>
        <p className="text-sm text-muted-foreground">Verifique o link e tente novamente</p>
      </div>
    );
  }

  const heroStyle = restaurant?.heroImageUrl ? {
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%), url('${restaurant.heroImageUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {
    background: `linear-gradient(135deg, ${restaurant?.primaryColor || '#EA580C'} 0%, ${restaurant?.secondaryColor || '#DC2626'} 100%)`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      {/* Floating Cart Button */}
      <motion.div 
        className="fixed top-4 right-4 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              className="relative h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
              data-testid="button-open-cart"
            >
              <ShoppingCart className="h-6 w-6" />
              <AnimatePresence>
                {getItemCount() > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge 
                      className="h-7 w-7 flex items-center justify-center p-0 text-xs font-bold rounded-full"
                      variant="destructive"
                    >
                      {getItemCount()}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md flex flex-col">
            <SheetHeader>
              <SheetTitle data-testid="text-cart-title">Seu Carrinho</SheetTitle>
              <SheetDescription data-testid="text-cart-description">
                Revise seu pedido antes de confirmar
              </SheetDescription>
            </SheetHeader>

            <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'delivery' | 'takeout')} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="delivery" data-testid="tab-delivery" className="gap-2">
                  <Bike className="h-4 w-4" />
                  Delivery
                </TabsTrigger>
                <TabsTrigger value="takeout" data-testid="tab-takeout" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Retirada
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <ScrollArea className="flex-1 my-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <ShoppingCart className="h-12 w-12 opacity-50" />
                  </div>
                  <p className="font-medium" data-testid="text-empty-cart">Seu carrinho está vazio</p>
                  <p className="text-sm mt-1">Adicione itens do cardápio</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card data-testid={`cart-item-${item.id}`} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              {item.menuItem.imageUrl && (
                                <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                  <img 
                                    src={item.menuItem.imageUrl} 
                                    alt={item.menuItem.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{item.menuItem.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatKwanza(item.menuItem.price)}
                                    </p>
                                    {item.selectedOptions.length > 0 && (
                                      <div className="mt-1 space-y-0.5">
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
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(item.id)}
                                    data-testid={`button-remove-${item.id}`}
                                    className="h-8 w-8 flex-shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                      data-testid={`button-decrease-${item.id}`}
                                      className="h-8 w-8"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium" data-testid={`text-quantity-${item.id}`}>
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      data-testid={`button-increase-${item.id}`}
                                      className="h-8 w-8"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <p className="font-bold" data-testid={`text-item-total-${item.id}`}>
                                    {formatKwanza(
                                      (parseFloat(item.menuItem.price) + 
                                        item.selectedOptions.reduce((sum, opt) => sum + parseFloat(opt.priceAdjustment) * opt.quantity, 0)
                                      ) * item.quantity
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>

            {items.length > 0 && (
              <div className="space-y-4 mt-auto border-t pt-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Nome *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="mt-1"
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Telefone/WhatsApp *</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+244 923 456 789"
                      className="mt-1"
                      data-testid="input-customer-phone"
                    />
                  </div>
                  {orderType === 'delivery' && (
                    <div>
                      <Label htmlFor="address" className="text-sm font-medium">Endereço de Entrega *</Label>
                      <Textarea
                        id="address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Rua, número, bairro, ponto de referência..."
                        rows={3}
                        className="mt-1"
                        data-testid="input-delivery-address"
                      />
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold" data-testid="text-cart-total">{formatKwanza(getTotal())}</span>
                </div>
                <Button
                  className="w-full h-12 text-base font-semibold"
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
                    'Confirmar Pedido'
                  )}
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </motion.div>

      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div 
          className="h-[280px] sm:h-[360px] w-full relative"
          style={heroStyle}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white opacity-60" />
        </div>
        
        <div className="container px-4 sm:px-6">
          <div className="relative -mt-20 sm:-mt-24 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
              {restaurant?.logoUrl && (
                <motion.div 
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white flex-shrink-0"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <img 
                    src={restaurant.logoUrl} 
                    alt={`${restaurant.name} logo`}
                    className="w-full h-full object-cover"
                    data-testid="img-restaurant-logo"
                  />
                </motion.div>
              )}
              
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                <motion.div 
                  className="space-y-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-restaurant-name">
                      {restaurant.name}
                    </h1>
                    <Badge 
                      variant={restaurant.isOpen ? "default" : "secondary"} 
                      className={`${restaurant.isOpen ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-400 hover:bg-gray-500 text-white"} flex-shrink-0 px-3 py-1 text-xs font-semibold`}
                      data-testid="badge-restaurant-status"
                    >
                      {restaurant.isOpen ? "● Aberto" : "● Fechado"}
                    </Badge>
                  </div>
                  
                  {restaurant.businessHours && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{restaurant.businessHours}</span>
                    </div>
                  )}

                  {restaurant.description && (
                    <p className="text-sm text-muted-foreground max-w-2xl line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-2 flex-shrink-0"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {restaurant.whatsappNumber && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-green-50 hover:border-green-500 transition-colors"
                      onClick={() => window.open(`https://wa.me/${restaurant.whatsappNumber!.replace(/\D/g, '')}`, '_blank')}
                      data-testid="button-whatsapp"
                      aria-label="Contato WhatsApp"
                    >
                      <SiWhatsapp className="h-5 w-5 text-green-600" />
                    </Button>
                  )}
                  <Link href={`/r/${slug}/rastrear`}>
                    <Button variant="outline" size="sm" className="gap-2 hover-elevate" data-testid="button-track-order">
                      Rastrear Pedido
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Filters Bar */}
      {categories.length > 0 && (
        <div className={`border-b sticky top-0 bg-white/95 backdrop-blur-sm z-40 transition-all ${showSearchBar ? 'shadow-md' : ''}`}>
          <div className="container px-4 sm:px-6 py-4 space-y-3">
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {showSearchBar && (
                  <motion.div 
                    className="flex-1 relative"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10"
                      data-testid="input-search-sticky"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button
                variant={showFilters ? "default" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="h-10 w-10 flex-shrink-0"
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {dietaryTags.map(tag => {
                    const Icon = tag.icon;
                    const isActive = activeFilters.includes(tag.value);
                    return (
                      <Button
                        key={tag.value}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter(tag.value)}
                        className="rounded-full gap-2"
                        data-testid={`filter-${tag.value}`}
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
                </motion.div>
              )}
            </AnimatePresence>
            
            <ScrollArea className="w-full" ref={categoriesRef}>
              <div className="flex gap-2 pb-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => scrollToCategory('all')}
                  className="rounded-full flex-shrink-0 font-medium"
                  data-testid="tab-all"
                >
                  Todos
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === String(category.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => scrollToCategory(String(category.id))}
                    className="rounded-full flex-shrink-0 font-medium whitespace-nowrap"
                    data-testid={`tab-${category.id}`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Search Bar (Non-sticky) */}
      {!showSearchBar && (
        <motion.section 
          className="container px-4 sm:px-6 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="O que você está procurando?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-6 h-14 text-base rounded-2xl border-2 border-gray-200 focus:border-primary transition-all shadow-sm hover:shadow-md bg-white"
              data-testid="input-search-main"
            />
          </div>
        </motion.section>
      )}

      {/* Products Grid */}
      <main className="container px-4 sm:px-6 py-8 pb-24">
        {!menuItems || filteredItems.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 shadow-inner">
              <Search className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-sm text-gray-500 max-w-sm">Tente buscar por outro termo ou navegue pelas categorias disponíveis</p>
          </motion.div>
        ) : selectedCategory === 'all' ? (
          <div className="space-y-12">
            {categories.map((category, catIndex) => {
              const categoryItems = filteredItems.filter(item => String(item.categoryId) === String(category.id));
              if (categoryItems.length === 0) return null;

              return (
                <motion.div 
                  key={category.id} 
                  id={`category-${category.id}`} 
                  className="scroll-mt-32"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent flex-1" />
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid={`text-category-${category.name}`}>
                      {category.name}
                    </h2>
                    <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent flex-1" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                    {categoryItems.map((item, itemIndex) => {
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
                            data-testid={`menu-item-${item.id}`} 
                            className="group hover-elevate active-elevate-2 overflow-hidden cursor-pointer transition-all duration-300 border-2 hover:border-primary/30 h-full flex flex-col"
                          >
                            <CardContent className="p-0 flex-1 flex flex-col">
                              <div 
                                className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
                                onClick={() => item.imageUrl && setImagePreview(item.imageUrl)}
                              >
                                {item.imageUrl ? (
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                    loading="lazy"
                                    data-testid={`img-product-${item.id}`}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                    <UtensilsCrossed className="h-14 w-14 text-gray-300" />
                                  </div>
                                )}
                                
                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                  {hasDiscount && (
                                    <Badge 
                                      className="bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg px-2.5 py-1 animate-in zoom-in-50"
                                      data-testid={`badge-discount-${item.id}`}
                                    >
                                      -{discountPercentage}%
                                    </Badge>
                                  )}
                                  {item.isFeatured === 1 && (
                                    <Badge 
                                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg px-2.5 py-1 gap-1"
                                      data-testid={`badge-featured-${item.id}`}
                                    >
                                      <Star className="h-3 w-3 fill-white" />
                                      Destaque
                                    </Badge>
                                  )}
                                  {item.isNew === 1 && (
                                    <Badge 
                                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg px-2.5 py-1 gap-1"
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

                                {/* Add Button Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                  <motion.div
                                    initial={{ scale: 0.8 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      size="icon"
                                      className="h-14 w-14 rounded-full shadow-2xl"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddMenuItem(item);
                                      }}
                                      data-testid={`button-add-${item.id}`}
                                      aria-label={`Adicionar ${item.name}`}
                                    >
                                      <Plus className="h-7 w-7" />
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>

                              <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-sm sm:text-base line-clamp-2 mb-2 text-gray-900 flex-1">
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                    {item.description}
                                  </p>
                                )}
                                {item.preparationTime && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                    <Clock className="h-3 w-3" />
                                    <span>{item.preparationTime} min</span>
                                  </div>
                                )}
                                <div className="flex flex-col gap-0.5 mt-auto">
                                  {hasDiscount && (
                                    <span className="text-xs text-gray-400 line-through" data-testid={`text-original-price-${item.id}`}>
                                      {formatKwanza(item.originalPrice!)}
                                    </span>
                                  )}
                                  <span className="text-xl sm:text-2xl font-bold text-primary" data-testid={`text-price-${item.id}`}>
                                    {formatKwanza(item.price)}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div 
            id={`category-${selectedCategory}`} 
            className="scroll-mt-32"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent flex-1" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid={`text-category-selected`}>
                {categories.find(c => String(c.id) === selectedCategory)?.name}
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent flex-1" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {filteredItems.map((item, itemIndex) => {
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
                      data-testid={`menu-item-${item.id}`} 
                      className="group hover-elevate active-elevate-2 overflow-hidden cursor-pointer transition-all duration-300 border-2 hover:border-primary/30 h-full flex flex-col"
                    >
                      <CardContent className="p-0 flex-1 flex flex-col">
                        <div 
                          className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
                          onClick={() => item.imageUrl && setImagePreview(item.imageUrl)}
                        >
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                              loading="lazy"
                              data-testid={`img-product-${item.id}`}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <UtensilsCrossed className="h-14 w-14 text-gray-300" />
                            </div>
                          )}
                          
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {hasDiscount && (
                              <Badge 
                                className="bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg px-2.5 py-1 animate-in zoom-in-50"
                                data-testid={`badge-discount-${item.id}`}
                              >
                                -{discountPercentage}%
                              </Badge>
                            )}
                            {item.isFeatured === 1 && (
                              <Badge 
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg px-2.5 py-1 gap-1"
                                data-testid={`badge-featured-${item.id}`}
                              >
                                <Star className="h-3 w-3 fill-white" />
                                Destaque
                              </Badge>
                            )}
                            {item.isNew === 1 && (
                              <Badge 
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg px-2.5 py-1 gap-1"
                                data-testid={`badge-new-${item.id}`}
                              >
                                <Sparkles className="h-3 w-3" />
                                Novo
                              </Badge>
                            )}
                          </div>

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

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <motion.div
                              initial={{ scale: 0.8 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                size="icon"
                                className="h-14 w-14 rounded-full shadow-2xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddMenuItem(item);
                                }}
                                data-testid={`button-add-${item.id}`}
                                aria-label={`Adicionar ${item.name}`}
                              >
                                <Plus className="h-7 w-7" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-bold text-sm sm:text-base line-clamp-2 mb-2 text-gray-900 flex-1">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                              {item.description}
                            </p>
                          )}
                          {item.preparationTime && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <Clock className="h-3 w-3" />
                              <span>{item.preparationTime} min</span>
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5 mt-auto">
                            {hasDiscount && (
                              <span className="text-xs text-gray-400 line-through" data-testid={`text-original-price-${item.id}`}>
                                {formatKwanza(item.originalPrice!)}
                              </span>
                            )}
                            <span className="text-xl sm:text-2xl font-bold text-primary" data-testid={`text-price-${item.id}`}>
                              {formatKwanza(item.price)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>

      {/* Contact Section */}
      {(restaurant.address || restaurant.phone || restaurant.businessHours) && (
        <motion.section 
          className="bg-gradient-to-b from-white to-gray-50 py-16 sm:py-20 border-t"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Informações</h3>
              <p className="text-gray-600 text-lg">Como chegar até nós</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {restaurant.address && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="hover-elevate border-2 transition-all duration-300 hover:border-primary/20">
                    <CardContent className="p-7">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold mb-2 text-gray-900">Endereço</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{restaurant.address}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {restaurant.phone && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="hover-elevate border-2 transition-all duration-300 hover:border-primary/20">
                    <CardContent className="p-7">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold mb-2 text-gray-900">Telefone</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{restaurant.phone}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {restaurant.businessHours && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="hover-elevate border-2 transition-all duration-300 hover:border-primary/20">
                    <CardContent className="p-7">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold mb-2 text-gray-900">Horário</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{restaurant.businessHours}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-10 border-t border-gray-800">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <p className="text-sm text-white/80 font-medium">
                &copy; {new Date().getFullYear()} {restaurant.name}
              </p>
              <p className="text-xs text-white/50 mt-1">
                Todos os direitos reservados
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-white/60">Powered by</span>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">OlaClick</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      {selectedMenuItem && (
        <CustomerMenuItemOptionsDialog
          open={isOptionsDialogOpen}
          onOpenChange={setIsOptionsDialogOpen}
          menuItem={selectedMenuItem}
          onAddToCart={handleAddToCart}
        />
      )}

      <ShareOrderDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        order={createdOrder}
        restaurantName={restaurant?.name || ''}
        restaurantSlug={slug}
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

      {/* Floating WhatsApp Button */}
      {restaurant?.whatsappNumber && (
        <motion.a
          href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all"
          data-testid="button-whatsapp-float"
          aria-label="Contactar via WhatsApp"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <SiWhatsapp className="h-6 w-6" />
        </motion.a>
      )}
    </div>
  );
}
