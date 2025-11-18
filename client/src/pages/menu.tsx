import { useQuery } from "@tanstack/react-query";
import { ExternalLink, UtensilsCrossed, Folder, Settings, Eye, Palette, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant } from "@shared/schema";
import { MenuItemsTab } from "@/components/menu/MenuItemsTab";
import { CategoriesTab } from "@/components/menu/CategoriesTab";
import { CustomizationsTab } from "@/components/menu/CustomizationsTab";
import { PreviewTab } from "@/components/menu/PreviewTab";
import { CustomizeMenuTab } from "@/components/menu/CustomizeMenuTab";
import { RecipesTab } from "@/components/menu/RecipesTab";

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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 gap-1">
          <TabsTrigger value="items" data-testid="tab-menu-items">
            <UtensilsCrossed className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Itens do Menu</span>
            <span className="sm:hidden">Itens</span>
          </TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">
            <Folder className="h-4 w-4 mr-2" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="recipes" data-testid="tab-recipes">
            <ChefHat className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Receitas</span>
            <span className="sm:hidden">Receitas</span>
          </TabsTrigger>
          <TabsTrigger value="customize" data-testid="tab-customize">
            <Palette className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Personalizar</span>
            <span className="sm:hidden">Custom</span>
          </TabsTrigger>
          <TabsTrigger value="options" data-testid="tab-options">
            <Settings className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Opções</span>
            <span className="sm:hidden">Opções</span>
          </TabsTrigger>
          <TabsTrigger value="preview" data-testid="tab-preview">
            <Eye className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Pré-visualização</span>
            <span className="sm:hidden">Preview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-6">
          <MenuItemsTab />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="recipes" className="mt-6">
          <RecipesTab />
        </TabsContent>

        <TabsContent value="customize" className="mt-6">
          <CustomizeMenuTab />
        </TabsContent>

        <TabsContent value="options" className="mt-6">
          <CustomizationsTab />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <PreviewTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
