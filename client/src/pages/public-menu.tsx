import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Trash2, MapPin, Phone, Clock, Bike, ShoppingBag, PackageSearch } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
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

  const hexToHSL = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 50%';

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
  };

  const customColors: Record<string, string> = {};
  if (restaurant) {
    if (restaurant.primaryColor) {
      customColors['--primary'] = hexToHSL(restaurant.primaryColor);
    }
    if (restaurant.secondaryColor) {
      customColors['--secondary'] = hexToHSL(restaurant.secondaryColor);
    }
    if (restaurant.accentColor) {
      customColors['--accent'] = hexToHSL(restaurant.accentColor);
    }
  }

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

  const groupedByCategory = menuItems
    ?.filter(item => item.isVisible === 1)
    ?.reduce((acc, item) => {
      const categoryName = item.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    }, {} as Record<string, Array<MenuItem & { category: Category }>>);

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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Carregando cardápio...</p>
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
    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url('${restaurant.heroImageUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {
    backgroundColor: restaurant?.primaryColor || '#EA580C',
  };

  return (
    <div className="min-h-screen bg-background" style={customColors as any}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold" data-testid="text-restaurant-name">{restaurant.name}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/r/${slug}/rastrear`}>
              <Button variant="outline" className="h-9 sm:h-10 gap-1.5" data-testid="button-track-order">
                <PackageSearch className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-sm">Rastrear Pedido</span>
              </Button>
            </Link>
            
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10" data-testid="button-open-cart">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                  {getItemCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center p-0 text-xs">
                      {getItemCount()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle data-testid="text-cart-title">Seu Carrinho</SheetTitle>
                <SheetDescription data-testid="text-cart-description">
                  Revise seu pedido antes de confirmar
                </SheetDescription>
              </SheetHeader>

              <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'delivery' | 'takeout')} className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="delivery" data-testid="tab-delivery">
                    <Bike className="h-4 w-4 mr-2" />
                    Delivery
                  </TabsTrigger>
                  <TabsTrigger value="takeout" data-testid="tab-takeout">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Retirada
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <ScrollArea className="flex-1 my-4 max-h-[40vh]">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mb-3 opacity-50" />
                    <p data-testid="text-empty-cart">Seu carrinho está vazio</p>
                    <p className="text-sm">Adicione itens do cardápio</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <Card key={item.id} data-testid={`cart-item-${item.id}`}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.menuItem.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatKwanza(item.menuItem.price)}
                              </p>
                              {item.selectedOptions.length > 0 && (
                                <div className="mt-1 space-y-1">
                                  {item.selectedOptions.map((opt, idx) => (
                                    <p key={idx} className="text-xs text-muted-foreground">
                                      • {opt.optionName} 
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
                            <p className="font-semibold" data-testid={`text-item-total-${item.id}`}>
                              {formatKwanza(
                                (parseFloat(item.menuItem.price) + 
                                  item.selectedOptions.reduce((sum, opt) => sum + parseFloat(opt.priceAdjustment) * opt.quantity, 0)
                                ) * item.quantity
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {items.length > 0 && (
                <div className="space-y-4 mt-4">
                  <Separator />
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Seu nome"
                        data-testid="input-customer-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                      <Input
                        id="phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+244 923 456 789"
                        data-testid="input-customer-phone"
                      />
                    </div>
                    {orderType === 'delivery' && (
                      <div>
                        <Label htmlFor="address">Endereço de Entrega *</Label>
                        <Textarea
                          id="address"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Rua, número, bairro, ponto de referência..."
                          rows={3}
                          data-testid="input-delivery-address"
                        />
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span data-testid="text-cart-total">{formatKwanza(getTotal())}</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleConfirmOrder}
                    disabled={createOrderMutation.isPending}
                    data-testid="button-confirm-order"
                  >
                    {createOrderMutation.isPending ? 'Enviando...' : 'Confirmar Pedido'}
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </header>

      <section
        className="relative flex items-center justify-center min-h-[400px] sm:min-h-[500px] pt-16"
        style={heroStyle}
      >
        <div className="container px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4">
            {restaurant.name}
          </h2>
          {restaurant.description && (
            <p className="text-lg sm:text-xl md:text-2xl mb-6 max-w-2xl mx-auto opacity-95">
              {restaurant.description}
            </p>
          )}
          {restaurant.address && (
            <div className="flex items-center justify-center gap-2 mb-6 text-sm sm:text-base">
              <MapPin className="h-4 w-4" />
              <span>{restaurant.address}</span>
            </div>
          )}
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8"
            onClick={() => {
              const menuSection = document.getElementById('cardapio');
              menuSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Ver Cardápio
          </Button>
        </div>
      </section>

      <main id="cardapio" className="container px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Nosso Cardápio</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore nossos pratos cuidadosamente preparados
          </p>
        </div>

        {!menuItems || menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Nenhum item disponível no momento</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(groupedByCategory || {}).map(([categoryName, categoryItems]) => (
              <div key={categoryName}>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" data-testid={`text-category-${categoryName}`}>{categoryName}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {categoryItems.map((item) => (
                    <Card key={item.id} data-testid={`menu-item-${item.id}`} className="hover-elevate active-elevate-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg">{item.name}</CardTitle>
                        {item.description && (
                          <CardDescription className="line-clamp-2 text-xs sm:text-sm">{item.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 justify-between items-center">
                          <span className="text-lg sm:text-xl font-bold text-primary">{formatKwanza(item.price)}</span>
                          <Button
                            onClick={() => handleAddMenuItem(item)}
                            data-testid={`button-add-${item.id}`}
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Entre em Contato</h3>
            <p className="text-muted-foreground">Estamos prontos para atendê-lo</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {restaurant.address && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Endereço</CardTitle>
                  </div>
                  <CardDescription className="text-sm">{restaurant.address}</CardDescription>
                </CardHeader>
              </Card>
            )}
            {restaurant.phone && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Telefone</CardTitle>
                  </div>
                  <CardDescription className="text-sm">{restaurant.phone}</CardDescription>
                </CardHeader>
              </Card>
            )}
            {restaurant.businessHours && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Horário</CardTitle>
                  </div>
                  <CardDescription className="text-sm">{restaurant.businessHours}</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-background border-t py-6">
        <div className="container px-4 sm:px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {restaurant.name}. Todos os direitos reservados.</p>
        </div>
      </footer>

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
    </div>
  );
}
