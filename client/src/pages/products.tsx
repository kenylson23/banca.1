import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Plus, Clock, Phone, Search, ShoppingCart, Trash2, Minus } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { MenuItem, Category, Restaurant } from '@shared/schema';

export default function Products() {
  const [, params] = useRoute('/r/:slug');
  const slug = params?.slug;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'retirada'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const { items, addItem, updateQuantity, removeItem, clearCart, getTotal, getItemCount, orderNotes, setOrderNotes } = useCart();
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
    queryKey: [`/api/public/menu-items/${restaurantId}`],
    enabled: !!restaurantId,
  });

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
    mutationFn: async (orderData: any) => {
      return await apiRequest('POST', '/api/public/orders', orderData);
    },
    onSuccess: () => {
      toast({
        title: 'Pedido criado!',
        description: 'Seu pedido foi enviado com sucesso.',
      });
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setIsCartOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar pedido',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  const handleCheckout = () => {
    if (!customerName || !customerPhone) {
      toast({
        title: 'Informações incompletas',
        description: 'Por favor, preencha seu nome e telefone.',
        variant: 'destructive',
      });
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress) {
      toast({
        title: 'Endereço necessário',
        description: 'Por favor, informe o endereço de entrega.',
        variant: 'destructive',
      });
      return;
    }

    if (!restaurant) {
      toast({
        title: 'Erro',
        description: 'Restaurante não encontrado.',
        variant: 'destructive',
      });
      return;
    }

    const orderItems = items.map(item => ({
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
      price: item.menuItem.price,
      selectedOptions: item.selectedOptions,
    }));

    const orderData = {
      restaurantId: restaurant.id,
      orderType: deliveryType,
      customerName,
      customerPhone,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
      notes: orderNotes || undefined,
      items: orderItems,
    };

    createOrderMutation.mutate(orderData);
  };

  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <p className="text-gray-600 text-lg" data-testid="text-invalid-link">Link inválido</p>
        <p className="text-sm text-gray-500">Verifique o link e tente novamente</p>
      </div>
    );
  }

  if (menuLoading || restaurantLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0FA958]" data-testid="loading-spinner"></div>
        <p className="text-gray-600" data-testid="text-loading">Carregando produtos...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <p className="text-gray-600 text-lg" data-testid="text-restaurant-not-found">Restaurante não encontrado</p>
        <p className="text-sm text-gray-500">Verifique o link e tente novamente</p>
      </div>
    );
  }

  const whatsappNumber = restaurant.phone?.replace(/\D/g, '');
  const whatsappLink = whatsappNumber 
    ? `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Olá, venho do catálogo online!`
    : '#';

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo and Restaurant Info */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {restaurant.logoUrl ? (
                <img 
                  src={restaurant.logoUrl} 
                  alt={restaurant.name}
                  className="h-24 w-24 object-contain rounded-xl"
                  data-testid="img-logo"
                />
              ) : (
                <div className="h-24 w-24 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-400">{restaurant.name[0]}</span>
                </div>
              )}
            </div>

            {/* Restaurant Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-[#222] mb-2" data-testid="text-restaurant-name">
                {restaurant.name}
              </h1>
              {restaurant.businessHours && (
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600" data-testid="text-business-hours">
                    {restaurant.businessHours}
                  </span>
                </div>
              )}
            </div>

            {/* WhatsApp Button */}
            {whatsappNumber && (
              <Button
                asChild
                className="bg-[#25D366] hover:bg-[#20BD5A] text-white border-0"
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" data-testid="button-whatsapp">
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {restaurant.heroImageUrl && (
        <section className="relative h-64 overflow-hidden">
          <img
            src={restaurant.heroImageUrl}
            alt={`${restaurant.name} - Banner`}
            className="w-full h-full object-cover"
            data-testid="img-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </section>
      )}

      {/* Search Bar */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 max-w-6xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-300 focus:border-[#0FA958] focus:ring-[#0FA958]"
              data-testid="input-search-products"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <section className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4 max-w-6xl">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="bg-transparent h-auto p-0 gap-2 justify-start overflow-x-auto flex-nowrap">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-transparent data-[state=active]:text-[#222] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#222] bg-transparent text-gray-500 hover:text-[#222] rounded-none px-4 py-2 font-medium transition-all"
                  data-testid="tab-all"
                >
                  Todos
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={String(category.id)}
                    className="data-[state=active]:bg-transparent data-[state=active]:text-[#222] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#222] bg-transparent text-gray-500 hover:text-[#222] rounded-none px-4 py-2 font-medium transition-all whitespace-nowrap"
                    data-testid={`tab-${category.id}`}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Category Sections */}
        {!filteredItems || filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-lg font-medium" data-testid="text-no-products">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div>
            {/* Show products grouped by category or just the selected category */}
            {selectedCategory === 'all' ? (
              categories.map((category) => {
                const categoryItems = filteredItems.filter(item => String(item.categoryId) === String(category.id));
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category.id} className="mb-12">
                    <h2 className="text-2xl font-bold text-[#222] mb-6" data-testid={`heading-${category.name}`}>
                      {category.name}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryItems.map((item) => {
                        const hasDiscount = false;
                        const discountPercent = 0;

                        return (
                          <Card 
                            key={item.id} 
                            className="overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                            data-testid={`product-${item.id}`}
                          >
                            {/* Product Image with Floating Add Button */}
                            <div className="relative aspect-square overflow-hidden bg-gray-50">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-6xl opacity-20">{item.name[0]}</span>
                                </div>
                              )}
                              
                              {/* Discount Badge */}
                              {hasDiscount && (
                                <Badge 
                                  className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white border-0 font-semibold"
                                  data-testid={`badge-discount-${item.id}`}
                                >
                                  -{discountPercent}%
                                </Badge>
                              )}

                              {/* Floating Add Button */}
                              <Button
                                size="icon"
                                className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#0FA958] hover:bg-[#0D8A4A] text-white shadow-lg border-0"
                                data-testid={`button-add-${item.id}`}
                                onClick={() => {
                                  addItem(item);
                                  toast({
                                    title: 'Adicionado ao carrinho!',
                                    description: `${item.name} foi adicionado ao carrinho.`,
                                  });
                                }}
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                              <h3 className="font-semibold text-[#222] mb-1 line-clamp-2 min-h-[2.5rem]">
                                {item.name}
                              </h3>
                              {item.description && (
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              <p 
                                className="text-lg font-bold text-[#222]"
                                data-testid={`price-${item.id}`}
                              >
                                {formatKwanza(item.price)}
                              </p>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => {
                  const hasDiscount = false;
                  const discountPercent = 0;

                  return (
                    <Card 
                      key={item.id} 
                      className="overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                      data-testid={`product-${item.id}`}
                    >
                      {/* Product Image with Floating Add Button */}
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl opacity-20">{item.name[0]}</span>
                          </div>
                        )}
                        
                        {/* Discount Badge */}
                        {hasDiscount && (
                          <Badge 
                            className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white border-0 font-semibold"
                            data-testid={`badge-discount-${item.id}`}
                          >
                            -{discountPercent}%
                          </Badge>
                        )}

                        {/* Floating Add Button */}
                        <Button
                          size="icon"
                          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#0FA958] hover:bg-[#0D8A4A] text-white shadow-lg border-0"
                          data-testid={`button-add-${item.id}`}
                          onClick={() => {
                            addItem(item);
                            toast({
                              title: 'Adicionado ao carrinho!',
                              description: `${item.name} foi adicionado ao carrinho.`,
                            });
                          }}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-[#222] mb-1 line-clamp-2 min-h-[2.5rem]">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <p 
                          className="text-lg font-bold text-[#222]"
                          data-testid={`price-${item.id}`}
                        >
                          {formatKwanza(item.price)}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {getItemCount() > 0 && (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-[#0FA958] hover:bg-[#0D8A4A] text-white shadow-2xl border-0 z-50"
              data-testid="button-cart-float"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-500 text-white border-0">
                  {getItemCount()}
                </Badge>
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-cart">
            <SheetHeader>
              <SheetTitle>Seu Carrinho</SheetTitle>
              <SheetDescription>
                Revise seus itens e finalize o pedido
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{item.menuItem.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatKwanza(item.menuItem.price)} × {item.quantity}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <p className="font-bold">
                          {formatKwanza(String(parseFloat(item.menuItem.price) * item.quantity))}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.id)}
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Customer Info Form */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-sm">Informações do Pedido</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nome</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome"
                    data-testid="input-customer-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Telefone</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Seu telefone"
                    data-testid="input-customer-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Pedido</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={deliveryType === 'delivery' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setDeliveryType('delivery')}
                      data-testid="button-delivery-type-delivery"
                    >
                      Delivery
                    </Button>
                    <Button
                      variant={deliveryType === 'retirada' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setDeliveryType('retirada')}
                      data-testid="button-delivery-type-retirada"
                    >
                      Retirada
                    </Button>
                  </div>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Endereço de Entrega</Label>
                    <Textarea
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Rua, número, bairro..."
                      data-testid="input-delivery-address"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="orderNotes">Observações (opcional)</Label>
                  <Textarea
                    id="orderNotes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Alguma observação sobre o pedido?"
                    data-testid="input-order-notes"
                  />
                </div>
              </div>

              {/* Total and Checkout */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-2xl text-[#0FA958]">
                    {formatKwanza(String(getTotal()))}
                  </span>
                </div>

                <Button
                  className="w-full bg-[#0FA958] hover:bg-[#0D8A4A] text-white"
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isPending}
                  data-testid="button-checkout"
                >
                  {createOrderMutation.isPending ? 'Enviando...' : 'Finalizar Pedido'}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Minimal Footer */}
      <footer className="bg-[#222] text-white mt-20">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm opacity-75">
                Crie seu menu digital com <span className="font-semibold">Na Bancada</span>
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-[#0FA958] transition-colors" data-testid="link-inicio">
                Início de {restaurant.name}
              </a>
              <a href="#" className="hover:text-[#0FA958] transition-colors" data-testid="link-report">
                Reportar algo
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
