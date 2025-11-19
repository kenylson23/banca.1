import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Phone, MapPin, Clock } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, Category, Restaurant } from '@shared/schema';

export default function Products() {
  const [, params] = useRoute('/r/:slug');
  const slug = params?.slug;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }) || [];


  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white dark:bg-background">
        <p className="text-gray-600 dark:text-muted-foreground text-lg" data-testid="text-invalid-link">Link inválido</p>
        <p className="text-sm text-gray-500 dark:text-muted-foreground">Verifique o link e tente novamente</p>
      </div>
    );
  }

  if (menuLoading || restaurantLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white dark:bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" data-testid="loading-spinner"></div>
        <p className="text-gray-600 dark:text-muted-foreground" data-testid="text-loading">Carregando produtos...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white dark:bg-background">
        <p className="text-gray-600 dark:text-muted-foreground text-lg" data-testid="text-restaurant-not-found">Restaurante não encontrado</p>
        <p className="text-sm text-gray-500 dark:text-muted-foreground">Verifique o link e tente novamente</p>
      </div>
    );
  }

  const whatsappNumber = restaurant.phone?.replace(/\D/g, '');
  const whatsappLink = whatsappNumber 
    ? `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Olá, venho do catálogo online!`
    : '#';

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-background border-b border-gray-200 dark:border-border shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {restaurant.logoUrl && (
                <img 
                  src={restaurant.logoUrl} 
                  alt={restaurant.name}
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-md"
                />
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground" data-testid="text-restaurant-name">
                  {restaurant.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-muted-foreground">
                  Catálogo de Produtos
                </p>
              </div>
            </div>
            
            {whatsappNumber && (
              <Button
                asChild
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-whatsapp"
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Phone className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <section className="bg-gray-50 dark:bg-muted/30 border-b border-gray-200 dark:border-border">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          {/* Search */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base bg-white dark:bg-background border-gray-300 dark:border-border"
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex items-center justify-center">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-white dark:bg-background h-auto p-1 gap-1">
                  <TabsTrigger 
                    value="all" 
                    className="text-sm whitespace-nowrap data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-primary"
                    data-testid="tab-all"
                  >
                    Todos
                  </TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="text-sm whitespace-nowrap data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-primary"
                      data-testid={`tab-${category.id}`}
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!filteredItems || filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-muted-foreground">
            <Search className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium" data-testid="text-no-products">Nenhum produto encontrado</p>
            <p className="text-sm">Tente ajustar sua busca ou filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover-elevate active-elevate-2 bg-white dark:bg-card border-gray-200 dark:border-border"
                data-testid={`product-${item.id}`}
              >
                {/* Product Image */}
                {item.imageUrl && (
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-muted">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-foreground line-clamp-2">
                    {item.name}
                  </CardTitle>
                  {item.description && (
                    <CardDescription className="text-sm text-gray-600 dark:text-muted-foreground line-clamp-2">
                      {item.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent>
                  <p 
                    className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-500"
                    data-testid={`price-${item.id}`}
                  >
                    {formatKwanza(item.price)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-muted/30 border-t border-gray-200 dark:border-border mt-12">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Restaurant Info */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-foreground mb-3">
                {restaurant.name}
              </h3>
              {restaurant.description && (
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  {restaurant.description}
                </p>
              )}
            </div>

            {/* Contact */}
            {(restaurant.phone || restaurant.address) && (
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-foreground mb-3">
                  Contato
                </h3>
                <div className="space-y-2">
                  {restaurant.phone && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-muted-foreground">
                      <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                  {restaurant.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{restaurant.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hours */}
            {restaurant.businessHours && (
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-foreground mb-3">
                  Horário
                </h3>
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-muted-foreground">
                  <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{restaurant.businessHours}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-border text-center text-sm text-gray-500 dark:text-muted-foreground">
            <p>© {new Date().getFullYear()} {restaurant.name}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
