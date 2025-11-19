import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, Phone, Search } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, Category, Restaurant } from '@shared/schema';

export default function Products() {
  const [, params] = useRoute('/r/:slug');
  const slug = params?.slug;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
                              {whatsappNumber && (
                                <Button
                                  size="icon"
                                  className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#0FA958] hover:bg-[#0D8A4A] text-white shadow-lg border-0"
                                  data-testid={`button-add-${item.id}`}
                                  onClick={() => {
                                    window.open(whatsappLink, '_blank');
                                  }}
                                >
                                  <Plus className="h-5 w-5" />
                                </Button>
                              )}
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
                        {whatsappNumber && (
                          <Button
                            size="icon"
                            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#0FA958] hover:bg-[#0D8A4A] text-white shadow-lg border-0"
                            data-testid={`button-add-${item.id}`}
                            onClick={() => {
                              window.open(whatsappLink, '_blank');
                            }}
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        )}
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
