import { useState } from 'react';
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
import { ShoppingCart, Plus, Minus, Trash2, MapPin, Phone, Clock, Bike, ShoppingBag } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, Category, Restaurant } from '@shared/schema';

export default function PublicMenu() {
  const [, params] = useRoute('/r/:slug');
  const slug = params?.slug;
  const { items, addItem, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'takeout'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
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

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      restaurantId: string;
      orderType: 'delivery' | 'takeout';
      customerName: string;
      customerPhone: string;
      deliveryAddress?: string;
      items: Array<{ menuItemId: string; quantity: number; price: string }>;
    }) => {
      const totalAmount = orderData.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);
      return apiRequest('POST', '/api/public/orders', {
        restaurantId: orderData.restaurantId,
        orderType: orderData.orderType,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        status: 'pendente',
        totalAmount,
        items: orderData.items,
      });
    },
    onSuccess: () => {
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

    const orderItems = items.map(item => ({
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
      price: item.menuItem.price,
    }));

    createOrderMutation.mutate({
      restaurantId: restaurant.id,
      orderType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
      items: orderItems,
    });
  };

  const groupedByCategory = menuItems?.reduce((acc, item) => {
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold truncate" data-testid="text-restaurant-name">{restaurant.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {restaurant.address && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{restaurant.address}</span>
                </span>
              )}
            </p>
          </div>
          
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative min-h-10 min-w-10" data-testid="button-open-cart">
                <ShoppingCart className="h-6 w-6" />
                {getItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs">
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
                      <Card key={item.menuItem.id} data-testid={`cart-item-${item.menuItem.id}`}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.menuItem.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatKwanza(item.menuItem.price)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.menuItem.id)}
                              data-testid={`button-remove-${item.menuItem.id}`}
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
                                onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                data-testid={`button-decrease-${item.menuItem.id}`}
                                className="h-8 w-8"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium" data-testid={`text-quantity-${item.menuItem.id}`}>
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                                data-testid={`button-increase-${item.menuItem.id}`}
                                className="h-8 w-8"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-semibold" data-testid={`text-item-total-${item.menuItem.id}`}>
                              {formatKwanza(parseFloat(item.menuItem.price) * item.quantity)}
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
      </header>

      <main className="container px-4 py-6">
        {restaurant.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardDescription>{restaurant.description}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {!menuItems || menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Nenhum item disponível no momento</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByCategory || {}).map(([categoryName, categoryItems]) => (
              <div key={categoryName}>
                <h2 className="text-2xl font-bold mb-4" data-testid={`text-category-${categoryName}`}>{categoryName}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map((item) => (
                    <Card key={item.id} data-testid={`menu-item-${item.id}`} className="hover-elevate active-elevate-2">
                      <CardHeader>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        {item.description && (
                          <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-primary">{formatKwanza(item.price)}</span>
                          <Button
                            onClick={() => addItem(item)}
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
    </div>
  );
}
