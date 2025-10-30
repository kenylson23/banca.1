import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Clock, ChefHat, CheckCircle, Check, Package } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import type { Order, OrderItem, MenuItem, Table, Restaurant } from '@shared/schema';

export default function TrackOrder() {
  const [, params] = useRoute('/r/:slug/rastrear');
  const slug = params?.slug;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ['/api/public/restaurants/slug', slug],
    queryFn: async () => {
      const response = await fetch(`/api/public/restaurants/slug/${slug}`);
      if (!response.ok) throw new Error('Restaurante não encontrado');
      return response.json();
    },
    enabled: !!slug,
  });

  const { data: orders, isLoading, error } = useQuery<Array<Order & { table: Table | null; orderItems: Array<OrderItem & { menuItem: MenuItem }> }>>({
    queryKey: ['/api/public/restaurants', slug, 'orders/search', { q: searchQuery }],
    queryFn: async () => {
      const response = await fetch(`/api/public/restaurants/${slug}/orders/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Erro ao buscar pedidos');
      return response.json();
    },
    enabled: searchQuery.length > 0 && !!slug,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchQuery(searchTerm.trim());
    }
  };

  const getOrderStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente':
        return {
          label: 'Pendente',
          icon: Clock,
          color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        };
      case 'em_preparo':
        return {
          label: 'Em Preparo',
          icon: ChefHat,
          color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
        };
      case 'pronto':
        return {
          label: 'Pronto',
          icon: CheckCircle,
          color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        };
      case 'servido':
        return {
          label: 'Servido',
          icon: Check,
          color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
        };
      default:
        return {
          label: status,
          icon: Clock,
          color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
        };
    }
  };

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-xl font-semibold mb-2">Restaurante não encontrado</p>
            <p className="text-sm text-muted-foreground">Verifique o link e tente novamente</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" data-testid="text-page-title">
            Rastrear Pedido - {restaurant.name}
          </h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Encontre seu pedido usando o número do pedido, seu nome ou telefone
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buscar Pedido</CardTitle>
            <CardDescription>
              Digite o número do pedido, nome do cliente ou telefone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Ex: João Silva, +244 912 345 678 ou ID do pedido"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
                className="flex-1"
              />
              <Button type="submit" data-testid="button-search">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Buscando pedidos...</p>
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive mb-2">Erro ao buscar pedidos</p>
              <p className="text-sm text-muted-foreground">Tente novamente mais tarde</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && searchQuery && orders && orders.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-xl font-semibold mb-2" data-testid="text-no-orders">
                Nenhum pedido encontrado
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique os dados e tente novamente
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getOrderStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={order.id} data-testid={`order-card-${order.id}`}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl" data-testid={`text-order-title-${order.id}`}>
                          {order.orderType === 'mesa' && order.table
                            ? `Pedido Mesa ${order.table.number}`
                            : order.orderType === 'delivery'
                            ? 'Pedido Delivery'
                            : 'Pedido Retirada'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {order.customerName && (
                            <span data-testid={`text-customer-name-${order.id}`}>
                              Cliente: {order.customerName}
                            </span>
                          )}
                          {order.customerPhone && (
                            <span className="block sm:inline sm:ml-4" data-testid={`text-customer-phone-${order.id}`}>
                              Tel: {order.customerPhone}
                            </span>
                          )}
                        </CardDescription>
                        <p className="text-xs text-muted-foreground mt-1" data-testid={`text-order-date-${order.id}`}>
                          {new Date(order.createdAt!).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Badge className={`${statusInfo.color} border`} data-testid={`badge-status-${order.id}`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm mb-3">Itens do Pedido</h3>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-start p-3 bg-muted/50 rounded-md"
                            data-testid={`order-item-${item.id}`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                  {item.quantity}x
                                </span>
                                <span className="font-medium">{item.menuItem.name}</span>
                              </div>
                              {item.notes && (
                                <p className="text-xs text-muted-foreground italic mt-1 ml-8">
                                  Obs: {item.notes}
                                </p>
                              )}
                            </div>
                            <span className="font-semibold ml-4">
                              {formatKwanza(parseFloat(item.price) * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.orderNotes && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3">
                        <h3 className="font-semibold text-xs text-amber-700 dark:text-amber-400 mb-2">
                          OBSERVAÇÕES DO PEDIDO
                        </h3>
                        <p className="text-sm text-foreground">{order.orderNotes}</p>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="text-2xl font-bold" data-testid={`text-total-${order.id}`}>
                        {formatKwanza(order.totalAmount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!searchQuery && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-xl font-semibold mb-2">Pronto para rastrear</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Digite seu nome, telefone ou número do pedido no campo acima para encontrar seus pedidos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
