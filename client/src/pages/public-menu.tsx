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
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Trash2, Clock, Bike, ShoppingBag, Search, Star, TrendingUp, MapPin, Phone, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
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
        {/* Hero Skeleton */}
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

        {/* Categories Skeleton */}
        <div className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-40">
          <div className="container px-4 sm:px-6 py-4">
            <div className="flex gap-2 overflow-x-auto">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
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
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%), url('${restaurant.heroImageUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {
    background: `linear-gradient(135deg, ${restaurant?.primaryColor || '#EA580C'} 0%, ${restaurant?.secondaryColor || '#DC2626'} 100%)`,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Cart Button */}
      <div className="fixed top-4 right-4 z-50">
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl"
              data-testid="button-open-cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {getItemCount() > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold animate-in zoom-in-50"
                  variant="destructive"
                >
                  {getItemCount()}
                </Badge>
              )}
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
                  {items.map((item) => (
                    <Card key={item.id} data-testid={`cart-item-${item.id}`} className="overflow-hidden">
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
                  ))}
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
      </div>

      {/* Hero Section with Floating Logo */}
      <section className="relative">
        <div 
          className="h-[240px] sm:h-[320px] w-full"
          style={heroStyle}
        />
        
        <div className="container px-4 sm:px-6">
          <div className="relative -mt-16 sm:-mt-20 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {restaurant?.logoUrl && (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex-shrink-0 transition-transform hover:scale-105">
                  <img 
                    src={restaurant.logoUrl} 
                    alt={`${restaurant.name} logo`}
                    className="w-full h-full object-cover"
                    data-testid="img-restaurant-logo"
                  />
                </div>
              )}
              
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-restaurant-name">
                      {restaurant.name}
                    </h1>
                    <Badge 
                      variant={restaurant.isOpen ? "default" : "secondary"} 
                      className={`${restaurant.isOpen ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"} flex-shrink-0`}
                      data-testid="badge-restaurant-status"
                    >
                      {restaurant.isOpen ? "Aberto agora" : "Fechado"}
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
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {restaurant.whatsappNumber && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => window.open(`https://wa.me/${restaurant.whatsappNumber!.replace(/\D/g, '')}`, '_blank')}
                      data-testid="button-whatsapp"
                      aria-label="Contato WhatsApp"
                    >
                      <SiWhatsapp className="h-5 w-5 text-green-600" />
                    </Button>
                  )}
                  <Link href={`/r/${slug}/rastrear`}>
                    <Button variant="outline" size="sm" className="gap-2" data-testid="button-track-order">
                      Rastrear Pedido
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Category Navigation */}
      {categories.length > 0 && (
        <div className={`border-b sticky top-0 bg-white/95 backdrop-blur-sm z-40 transition-all ${showSearchBar ? 'shadow-md' : ''}`}>
          <div className="container px-4 sm:px-6 py-4 space-y-3">
            {showSearchBar && (
              <div className="relative animate-in slide-in-from-top-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                  data-testid="input-search-sticky"
                />
              </div>
            )}
            
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
        <section className="container px-4 sm:px-6 py-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="O que você está procurando?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base rounded-full shadow-sm"
              data-testid="input-search-main"
            />
          </div>
        </section>
      )}

      {/* Products Grid */}
      <main className="container px-4 sm:px-6 py-8 pb-24">
        {!menuItems || filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Search className="h-12 w-12 opacity-50" />
            </div>
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
            <p className="text-sm mt-1">Tente buscar por outro termo</p>
          </div>
        ) : selectedCategory === 'all' ? (
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryItems = filteredItems.filter(item => String(item.categoryId) === String(category.id));
              if (categoryItems.length === 0) return null;

              return (
                <div key={category.id} id={`category-${category.id}`}>
                  <h2 className="text-2xl font-bold mb-6" data-testid={`text-category-${category.name}`}>
                    {category.name}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {categoryItems.map((item) => {
                      const hasDiscount = item.originalPrice && parseFloat(item.originalPrice) > parseFloat(item.price);
                      const discountPercentage = hasDiscount 
                        ? Math.round(((parseFloat(item.originalPrice!) - parseFloat(item.price)) / parseFloat(item.originalPrice!)) * 100)
                        : 0;

                      return (
                        <Card 
                          key={item.id} 
                          data-testid={`menu-item-${item.id}`} 
                          className="group hover-elevate active-elevate-2 overflow-hidden cursor-pointer transition-all"
                          onClick={() => handleAddMenuItem(item)}
                        >
                          <CardContent className="p-0">
                            {/* Product Image */}
                            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
                              {item.imageUrl ? (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  loading="lazy"
                                  data-testid={`img-product-${item.id}`}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <UtensilsCrossed className="h-12 w-12 text-muted-foreground/20" />
                                </div>
                              )}
                              
                              {/* Discount Badge */}
                              {hasDiscount && (
                                <Badge 
                                  className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg"
                                  data-testid={`badge-discount-${item.id}`}
                                >
                                  -{discountPercentage}%
                                </Badge>
                              )}

                              {/* Add Button Overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  size="icon"
                                  className="h-12 w-12 rounded-full shadow-xl"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddMenuItem(item);
                                  }}
                                  data-testid={`button-add-${item.id}`}
                                  aria-label={`Adicionar ${item.name}`}
                                >
                                  <Plus className="h-6 w-6" />
                                </Button>
                              </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-3 sm:p-4">
                              <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1 min-h-[2.5rem]">
                                {item.name}
                              </h3>
                              {item.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex flex-col gap-1">
                                {hasDiscount && (
                                  <span className="text-xs text-muted-foreground line-through" data-testid={`text-original-price-${item.id}`}>
                                    {formatKwanza(item.originalPrice!)}
                                  </span>
                                )}
                                <span className="text-lg sm:text-xl font-bold text-primary" data-testid={`text-price-${item.id}`}>
                                  {formatKwanza(item.price)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div id={`category-${selectedCategory}`}>
            <h2 className="text-2xl font-bold mb-6" data-testid={`text-category-selected`}>
              {categories.find(c => String(c.id) === selectedCategory)?.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map((item) => {
                const hasDiscount = item.originalPrice && parseFloat(item.originalPrice) > parseFloat(item.price);
                const discountPercentage = hasDiscount 
                  ? Math.round(((parseFloat(item.originalPrice!) - parseFloat(item.price)) / parseFloat(item.originalPrice!)) * 100)
                  : 0;

                return (
                  <Card 
                    key={item.id} 
                    data-testid={`menu-item-${item.id}`} 
                    className="group hover-elevate active-elevate-2 overflow-hidden cursor-pointer transition-all"
                    onClick={() => handleAddMenuItem(item)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            data-testid={`img-product-${item.id}`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/20" />
                          </div>
                        )}
                        
                        {hasDiscount && (
                          <Badge 
                            className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg"
                            data-testid={`badge-discount-${item.id}`}
                          >
                            -{discountPercentage}%
                          </Badge>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="icon"
                            className="h-12 w-12 rounded-full shadow-xl"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddMenuItem(item);
                            }}
                            data-testid={`button-add-${item.id}`}
                            aria-label={`Adicionar ${item.name}`}
                          >
                            <Plus className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1 min-h-[2.5rem]">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {item.description}
                          </p>
                        )}
                        <div className="flex flex-col gap-1">
                          {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through" data-testid={`text-original-price-${item.id}`}>
                              {formatKwanza(item.originalPrice!)}
                            </span>
                          )}
                          <span className="text-lg sm:text-xl font-bold text-primary" data-testid={`text-price-${item.id}`}>
                            {formatKwanza(item.price)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Contact Section */}
      {(restaurant.address || restaurant.phone || restaurant.businessHours) && (
        <section className="bg-muted/30 py-12 sm:py-16 border-t">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">Informações</h3>
              <p className="text-muted-foreground">Como chegar até nós</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {restaurant.address && (
                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Endereço</h4>
                        <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {restaurant.phone && (
                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Telefone</h4>
                        <p className="text-sm text-muted-foreground">{restaurant.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {restaurant.businessHours && (
                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Horário</h4>
                        <p className="text-sm text-muted-foreground">{restaurant.businessHours}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-sm text-white/70">
                &copy; {new Date().getFullYear()} {restaurant.name}. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Powered by</span>
              <span className="text-lg font-bold text-white">OlaClick</span>
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

      {/* Floating WhatsApp Button */}
      {restaurant?.whatsappNumber && (
        <a
          href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 animate-in zoom-in-50"
          data-testid="button-whatsapp-float"
          aria-label="Contactar via WhatsApp"
        >
          <SiWhatsapp className="h-6 w-6" />
        </a>
      )}
    </div>
  );
}
