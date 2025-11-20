import { useState, useEffect } from 'react';
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
import { 
  ShoppingCart, Plus, Minus, Trash2, Clock, Bike, ShoppingBag, Search, 
  MapPin, Phone, X, MessageCircle
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

  const scrollToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId !== 'all') {
      setTimeout(() => {
        const element = document.getElementById(`category-${categoryId}`);
        if (element) {
          const offset = 140;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <p className="text-foreground text-lg font-medium">Link inválido</p>
        <p className="text-sm text-muted-foreground">Verifique o link e tente novamente</p>
      </div>
    );
  }

  if (menuLoading || restaurantLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-black/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
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
                <div className="flex gap-4 p-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="w-24 h-24 rounded-md flex-shrink-0" />
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <p className="text-foreground text-lg font-medium">Restaurante não encontrado</p>
        <p className="text-sm text-muted-foreground">Verifique o link e tente novamente</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-black/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Name */}
            <div className="flex items-center gap-3">
              {restaurant.logoUrl ? (
                <img 
                  src={restaurant.logoUrl} 
                  alt={restaurant.name}
                  className="h-10 w-10 object-contain rounded-full border border-black/10"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                  {restaurant.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-foreground" data-testid="text-restaurant-name">
                  {restaurant.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={restaurant.isOpen ? "default" : "secondary"} 
                    className="text-xs"
                    data-testid="badge-restaurant-status"
                  >
                    {restaurant.isOpen ? 'Aberto' : 'Fechado'}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    30-40 min
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {restaurant.whatsappNumber && (
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  data-testid="button-whatsapp"
                >
                  <a
                    href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SiWhatsapp className="h-5 w-5" />
                  </a>
                </Button>
              )}
              
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="default"
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
                          className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-black"
                        >
                          {getItemCount()}
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
                        <div className="w-20 h-20 rounded-full border-2 border-black/10 flex items-center justify-center mb-4">
                          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
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
                              <Card data-testid={`cart-item-${item.id}`} className="border-black/10">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm">{item.menuItem.name}</p>
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
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 border border-black/10 rounded-full">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        data-testid={`button-decrease-${item.id}`}
                                        className="h-8 w-8 rounded-full"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-8 text-center font-medium text-sm" data-testid={`text-quantity-${item.id}`}>
                                        {item.quantity}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        data-testid={`button-increase-${item.id}`}
                                        className="h-8 w-8 rounded-full"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <p className="font-bold text-sm" data-testid={`text-item-total-${item.id}`}>
                                      {formatKwanza(
                                        (parseFloat(item.menuItem.price) + 
                                          item.selectedOptions.reduce((sum, opt) => sum + parseFloat(opt.priceAdjustment) * opt.quantity, 0)
                                        ) * item.quantity
                                      )}
                                    </p>
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Restaurant Info */}
        <div className="py-6 space-y-2">
          {restaurant.description && (
            <p className="text-sm text-muted-foreground max-w-2xl">{restaurant.description}</p>
          )}
          {restaurant.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{restaurant.address}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{restaurant.phone}</span>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {/* Search and Categories */}
        <div className="sticky top-16 bg-white z-40 py-4 space-y-4 border-b border-black/10">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-black/20"
              data-testid="input-search"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                data-testid="button-clear-search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Category Filters */}
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                className="rounded-full whitespace-nowrap"
                data-testid="button-category-all"
              >
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => scrollToCategory(category.id)}
                  className="rounded-full whitespace-nowrap"
                  data-testid={`button-category-${category.id}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Menu Items */}
        <div className="py-8">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Search className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">Nenhum produto encontrado</p>
              <p className="text-sm mt-1">Tente ajustar sua busca ou filtros</p>
            </div>
          ) : selectedCategory === 'all' && !searchQuery ? (
            <div className="space-y-12">
              {itemsByCategory.map((group) => (
                <section key={group.category.id} id={`category-${group.category.id}`} className="scroll-mt-40">
                  <h2 className="text-2xl font-bold mb-6">{group.category.name}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.items.map((item) => {
                      const itemPrice = typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2);
                      const itemOriginalPrice = item.originalPrice 
                        ? (typeof item.originalPrice === 'string' ? item.originalPrice : Number(item.originalPrice).toFixed(2)) 
                        : null;
                      const hasPromo = itemOriginalPrice && parseFloat(itemOriginalPrice) > parseFloat(itemPrice);
                      
                      return (
                        <Card 
                          key={item.id} 
                          className="overflow-hidden hover-elevate border-black/10 cursor-pointer"
                          onClick={() => handleAddMenuItem(item)}
                          data-testid={`menu-item-${item.id}`}
                        >
                          <CardContent className="p-0">
                            <div className="flex gap-4 p-4">
                              <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                  <h3 className="font-semibold text-base mb-1 line-clamp-2" data-testid={`text-item-name-${item.id}`}>
                                    {item.name}
                                  </h3>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-baseline gap-2">
                                    {hasPromo ? (
                                      <>
                                        <span className="text-lg font-bold" data-testid={`text-item-promo-price-${item.id}`}>
                                          {formatKwanza(itemPrice)}
                                        </span>
                                        <span className="text-xs text-muted-foreground line-through">
                                          {formatKwanza(itemOriginalPrice!)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-lg font-bold" data-testid={`text-item-price-${item.id}`}>
                                        {formatKwanza(itemPrice)}
                                      </span>
                                    )}
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="w-full rounded-full border-black/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddMenuItem(item);
                                    }}
                                    data-testid={`button-add-${item.id}`}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Adicionar
                                  </Button>
                                </div>
                              </div>

                              {item.imageUrl && (
                                <div className="w-24 h-24 flex-shrink-0">
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.name}
                                    className="w-full h-full object-cover rounded-md border border-black/10"
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const itemPrice = typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2);
                const itemOriginalPrice = item.originalPrice 
                  ? (typeof item.originalPrice === 'string' ? item.originalPrice : Number(item.originalPrice).toFixed(2)) 
                  : null;
                const hasPromo = itemOriginalPrice && parseFloat(itemOriginalPrice) > parseFloat(itemPrice);
                
                return (
                  <Card 
                    key={item.id} 
                    className="overflow-hidden hover-elevate border-black/10 cursor-pointer"
                    onClick={() => handleAddMenuItem(item)}
                    data-testid={`menu-item-${item.id}`}
                  >
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h3 className="font-semibold text-base mb-1 line-clamp-2" data-testid={`text-item-name-${item.id}`}>
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                              {hasPromo ? (
                                <>
                                  <span className="text-lg font-bold" data-testid={`text-item-promo-price-${item.id}`}>
                                    {formatKwanza(itemPrice)}
                                  </span>
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatKwanza(itemOriginalPrice!)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-bold" data-testid={`text-item-price-${item.id}`}>
                                  {formatKwanza(itemPrice)}
                                </span>
                              )}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full rounded-full border-black/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddMenuItem(item);
                              }}
                              data-testid={`button-add-${item.id}`}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                        </div>

                        {item.imageUrl && (
                          <div className="w-24 h-24 flex-shrink-0">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-full h-full object-cover rounded-md border border-black/10"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">{restaurant.name}</p>
            {restaurant.phone && <p>{restaurant.phone}</p>}
            {restaurant.address && <p className="mt-1">{restaurant.address}</p>}
          </div>
        </div>
      </footer>

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
    </div>
  );
}
