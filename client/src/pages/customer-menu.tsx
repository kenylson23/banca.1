import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Trash2, Check } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { MenuItem, Category } from '@shared/schema';

export default function CustomerMenu() {
  const [, params] = useRoute('/mesa/:tableNumber');
  const tableNumber = params?.tableNumber;
  const { items, addItem, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  const { data: menuItems, isLoading: menuLoading } = useQuery<Array<MenuItem & { category: Category }>>({
    queryKey: ['/api/menu-items'],
  });

  const { data: tables } = useQuery<any[]>({
    queryKey: ['/api/tables'],
  });

  const currentTable = tables?.find((t: any) => t.number === parseInt(tableNumber || '0'));

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: { tableId: string; items: Array<{ menuItemId: string; quantity: number; price: string }> }) => {
      const totalAmount = orderData.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);
      return apiRequest('POST', '/api/orders', {
        tableId: orderData.tableId,
        status: 'pendente',
        totalAmount,
        items: orderData.items,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Pedido enviado!',
        description: 'Seu pedido foi enviado para a cozinha.',
      });
      clearCart();
      setIsCartOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: () => {
      toast({
        title: 'Erro ao enviar pedido',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

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

    const orderItems = items.map(item => ({
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
      price: item.menuItem.price,
    }));

    createOrderMutation.mutate({
      tableId: currentTable.id,
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

  if (menuLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando menu...</p>
      </div>
    );
  }

  if (!tableNumber) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Mesa não identificada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-restaurant-name">NaBancada</h1>
            <p className="text-sm text-muted-foreground" data-testid="text-table-number">Mesa {tableNumber}</p>
          </div>
          
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative" data-testid="button-open-cart">
                <ShoppingCart className="h-5 w-5" />
                {getItemCount() > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    data-testid="badge-cart-count"
                  >
                    {getItemCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle data-testid="text-cart-title">Seu Pedido</SheetTitle>
                <SheetDescription data-testid="text-cart-description">
                  Revise os itens antes de confirmar
                </SheetDescription>
              </SheetHeader>
              
              <ScrollArea className="h-[calc(100vh-200px)] mt-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                    <p data-testid="text-empty-cart">Seu carrinho está vazio</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <Card key={item.menuItem.id} data-testid={`cart-item-${item.menuItem.id}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base" data-testid={`text-item-name-${item.menuItem.id}`}>
                            {item.menuItem.name}
                          </CardTitle>
                          <CardDescription data-testid={`text-item-price-${item.menuItem.id}`}>
                            €{parseFloat(item.menuItem.price).toFixed(2)}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                              data-testid={`button-decrease-${item.menuItem.id}`}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center" data-testid={`text-quantity-${item.menuItem.id}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                              data-testid={`button-increase-${item.menuItem.id}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold" data-testid={`text-item-total-${item.menuItem.id}`}>
                              €{(parseFloat(item.menuItem.price) * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.menuItem.id)}
                              data-testid={`button-remove-${item.menuItem.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {items.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold" data-testid="text-cart-total">
                      €{getTotal().toFixed(2)}
                    </span>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleConfirmOrder}
                    disabled={createOrderMutation.isPending}
                    data-testid="button-confirm-order"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    {createOrderMutation.isPending ? 'Enviando...' : 'Confirmar Pedido'}
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" data-testid="text-menu-title">Menu</h2>
          <p className="text-muted-foreground" data-testid="text-menu-description">
            Escolha seus pratos favoritos e adicione ao carrinho
          </p>
        </div>

        {groupedByCategory && Object.entries(groupedByCategory).map(([categoryName, items]) => (
          <div key={categoryName} className="mb-12">
            <h3 className="text-2xl font-semibold mb-6" data-testid={`text-category-${categoryName}`}>
              {categoryName}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover-elevate"
                  data-testid={`card-menu-item-${item.id}`}
                >
                  {item.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        data-testid={`img-menu-item-${item.id}`}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle data-testid={`text-menu-item-name-${item.id}`}>
                        {item.name}
                      </CardTitle>
                      {item.isAvailable === 0 && (
                        <Badge variant="secondary" data-testid={`badge-unavailable-${item.id}`}>
                          Indisponível
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <CardDescription data-testid={`text-menu-item-description-${item.id}`}>
                        {item.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-bold" data-testid={`text-menu-item-price-${item.id}`}>
                      €{parseFloat(item.price).toFixed(2)}
                    </span>
                    <Button
                      onClick={() => addItem(item)}
                      disabled={item.isAvailable === 0}
                      data-testid={`button-add-to-cart-${item.id}`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {(!groupedByCategory || Object.keys(groupedByCategory).length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p data-testid="text-no-items">Nenhum item disponível no momento</p>
          </div>
        )}
      </main>
    </div>
  );
}
