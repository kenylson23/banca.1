import { useQuery } from "@tanstack/react-query";
import { ExternalLink, UtensilsCrossed, FolderPlus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant } from "@shared/schema";
import { MenuItemsTab } from "@/components/menu/MenuItemsTab";
import { CategoriesTab } from "@/components/menu/CategoriesTab";
import { CustomizationsTab } from "@/components/menu/CustomizationsTab";

export default function Menu() {
  const { toast } = useToast();

  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/auth/user'],
  });

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ['/api/public/restaurants', currentUser?.restaurantId],
    enabled: !!currentUser?.restaurantId,
  });

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Gestão de Produtos</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Gerencie categorias, pratos e personalizações do restaurante
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            const publicLink = restaurant?.slug 
              ? `${window.location.origin}/r/${restaurant.slug}`
              : null;
            if (publicLink) {
              window.open(publicLink, '_blank');
            } else {
              toast({
                title: 'Link público não disponível',
                description: 'Configure o slug do restaurante em Configurações.',
                variant: 'destructive',
              });
            }
          }}
          data-testid="button-view-menu"
          disabled={!restaurant?.slug}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Visualizar Menu Público
        </Button>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items" data-testid="tab-menu-items">
            <UtensilsCrossed className="h-4 w-4 mr-2" />
            Itens do Menu
          </TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">
            <FolderPlus className="h-4 w-4 mr-2" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="customizations" data-testid="tab-customizations">
            <Settings2 className="h-4 w-4 mr-2" />
            Personalizações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-6">
          <MenuItemsTab />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="customizations" className="mt-6">
          <CustomizationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
