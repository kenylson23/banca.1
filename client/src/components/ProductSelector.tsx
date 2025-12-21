import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Star, Plus, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductPreviewPanel } from "@/components/ProductPreviewPanel";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatKwanza } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, Category, OptionGroup, Option } from "@shared/schema";

interface ProductSelectorProps {
  onAddToOrder: (item: {
    menuItemId: string;
    quantity: number;
    price: string;
    notes: string;
    selectedOptions: Array<{ 
      optionId: string; 
      optionGroupId: string; 
      optionName: string;
      optionGroupName: string;
      priceAdjustment: string;
      quantity: number;
    }>;
    menuItem?: MenuItem; // Pass the full MenuItem for convenience
  }) => void;
  onClose?: () => void;
}

interface MenuItemWithDetails extends MenuItem {
  category: Category;
  optionGroups?: Array<OptionGroup & { options: Option[] }>;
}

export function ProductSelector({ onAddToOrder, onClose }: ProductSelectorProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<MenuItemWithDetails | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { data: menuItems = [], isLoading } = useQuery<MenuItemWithDetails[]>({
    queryKey: ["/api/menu-items"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const toggleFavorite = (menuItemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(menuItemId)) {
        newFavorites.delete(menuItemId);
      } else {
        newFavorites.add(menuItemId);
      }
      return newFavorites;
    });
  };

  const getFilteredProducts = () => {
    let filtered = menuItems.filter(item => item.isAvailable === 1);

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory === "favorites") {
      filtered = filtered.filter(item => favorites.has(item.id));
    } else if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") {
      return menuItems.filter(item => item.isAvailable === 1).length;
    }
    if (categoryId === "favorites") {
      return favorites.size;
    }
    return menuItems.filter(
      item => item.categoryId === categoryId && item.isAvailable === 1
    ).length;
  };

  const handleQuickAdd = (item: MenuItemWithDetails) => {
    // Always open preview panel to allow customization
    setSelectedProduct(item);
    setPreviewOpen(true);
  };

  const handleProductClick = (item: MenuItemWithDetails) => {
    setSelectedProduct(item);
    setPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-products"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-selector">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1">
          <TabsTrigger value="all" data-testid="category-all" className="gap-2 flex-shrink-0">
            Todos
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
              {getCategoryCount("all")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="favorites" data-testid="category-favorites" className="gap-2 flex-shrink-0">
            <Star className="h-3 w-3" />
            Favoritos
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
              {getCategoryCount("favorites")}
            </Badge>
          </TabsTrigger>
          {categories
            .filter(cat => cat.isVisible === 1)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                data-testid={`category-${category.id}`}
                className="gap-2 flex-shrink-0"
              >
                {category.name}
                <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                  {getCategoryCount(category.id)}
                </Badge>
              </TabsTrigger>
            ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Search className="h-16 w-16 mb-4 opacity-40" />
              <p className="text-lg">Nenhum produto encontrado</p>
              {searchQuery && (
                <p className="text-sm mt-1">Tente ajustar sua busca</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((item) => (
                <Card
                  key={item.id}
                  className="group hover-elevate cursor-pointer relative overflow-hidden"
                  data-testid={`product-card-${item.id}`}
                >
                  <div onClick={() => handleProductClick(item)}>
                    {item.imageUrl ? (
                      <div className="aspect-square w-full overflow-hidden bg-muted">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square w-full bg-muted flex items-center justify-center">
                        <span className="text-4xl text-muted-foreground/40">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-3 space-y-2">
                    <div className="min-h-[40px]">
                      <h3
                        className="font-semibold text-sm line-clamp-2 leading-tight cursor-pointer"
                        onClick={() => handleProductClick(item)}
                      >
                        {item.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-lg font-bold text-primary">
                        {formatKwanza(item.price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          data-testid={`button-favorite-${item.id}`}
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              favorites.has(item.id)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(item);
                          }}
                          data-testid={`button-preview-${item.id}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="default"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAdd(item);
                          }}
                          data-testid={`button-add-${item.id}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProductPreviewPanel
        product={selectedProduct}
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedProduct(null);
        }}
        onAddToOrder={onAddToOrder}
        isFavorite={selectedProduct ? favorites.has(selectedProduct.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}
