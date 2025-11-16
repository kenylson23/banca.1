import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, Clock, Eye } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import type { MenuItem, Category, Restaurant } from "@shared/schema";

export function PreviewTab() {
  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/auth/user'],
  });

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ['/api/public/restaurants', currentUser?.restaurantId],
    enabled: !!currentUser?.restaurantId,
  });

  const { data: menuItems, isLoading } = useQuery<Array<MenuItem & { category: Category }>>({
    queryKey: ["/api/menu-items"],
  });

  const groupedByCategory = menuItems?.reduce((acc, item) => {
    const categoryName = item.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, Array<MenuItem & { category: Category }>>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Pré-visualização</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize como seu cardápio aparece para os clientes
          </p>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Pré-visualização</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize como seu cardápio aparece para os clientes
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Eye className="h-3 w-3" />
          Modo de visualização
        </Badge>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/40">
          <div className="max-w-7xl mx-auto">
            <header className="border-b bg-background">
              <div className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
                <div className="flex-1 min-w-0 mr-2">
                  <h1 className="text-lg sm:text-xl font-semibold truncate">
                    {restaurant?.name || "Seu Restaurante"}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                    {restaurant?.address && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{restaurant.address}</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </header>

            <main className="px-4 sm:px-6 py-6 sm:py-8 bg-background">
              {restaurant?.description && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardDescription className="text-sm sm:text-base">
                      {restaurant.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {!menuItems || menuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <p>Nenhum item disponível no momento</p>
                  <p className="text-sm mt-1">Adicione pratos para visualizá-los aqui</p>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {Object.entries(groupedByCategory || {}).map(([categoryName, categoryItems]) => (
                    <div key={categoryName}>
                      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                        {categoryName}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {categoryItems
                          .filter(item => item.isAvailable === 1)
                          .map((item) => (
                            <Card key={item.id} className="hover-elevate active-elevate-2">
                              {item.imageUrl && (
                                <div className="aspect-video w-full overflow-hidden bg-muted">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base sm:text-lg">
                                  {item.name}
                                </CardTitle>
                                {item.description && (
                                  <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                                    {item.description}
                                  </CardDescription>
                                )}
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2 justify-between items-center">
                                  <span className="text-lg sm:text-xl font-bold text-primary">
                                    {formatKwanza(item.price)}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    Ver detalhes
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                      {categoryItems.filter(item => item.isAvailable === 1).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">Nenhum item disponível nesta categoria</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Esta é uma pré-visualização de como seus clientes verão o cardápio
            </p>
            <p className="text-xs text-muted-foreground">
              Apenas itens marcados como "disponíveis" são exibidos. As personalizações e opções
              aparecem quando o cliente clica em um prato.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
