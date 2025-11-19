import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, UtensilsCrossed, Folder, Settings, Eye, Palette, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant } from "@shared/schema";
import { MenuItemsTab } from "@/components/menu/MenuItemsTab";
import { CategoriesTab } from "@/components/menu/CategoriesTab";
import { CustomizationsTab } from "@/components/menu/CustomizationsTab";
import { PreviewTab } from "@/components/menu/PreviewTab";
import { CustomizeMenuTab } from "@/components/menu/CustomizeMenuTab";
import { RecipesTab } from "@/components/menu/RecipesTab";
import { motion } from "framer-motion";
import { TubelightNavBar } from "@/components/ui/tubelight-navbar";

type TabValue = "items" | "categories" | "recipes" | "customize" | "options" | "preview";

export default function Menu() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabValue>("items");

  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/auth/user'],
  });

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ['/api/public/restaurants', currentUser?.restaurantId],
    enabled: !!currentUser?.restaurantId,
  });

  const navItems = [
    { name: "Itens", url: "#", icon: UtensilsCrossed },
    { name: "Categorias", url: "#", icon: Folder },
    { name: "Receitas", url: "#", icon: ChefHat },
    { name: "Personalizar", url: "#", icon: Palette },
    { name: "Opções", url: "#", icon: Settings },
    { name: "Preview", url: "#", icon: Eye },
  ];

  const tabMapping: Record<string, TabValue> = {
    "Itens": "items",
    "Categorias": "categories",
    "Receitas": "recipes",
    "Personalizar": "customize",
    "Opções": "options",
    "Preview": "preview",
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    const tabValue = tabMapping[item.name];
    if (tabValue) {
      setActiveTab(tabValue);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "items":
        return <MenuItemsTab />;
      case "categories":
        return <CategoriesTab />;
      case "recipes":
        return <RecipesTab />;
      case "customize":
        return <CustomizeMenuTab />;
      case "options":
        return <CustomizationsTab />;
      case "preview":
        return <PreviewTab />;
      default:
        return <MenuItemsTab />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-4 p-4 sm:p-6">
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Gestão de Produtos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
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
        </motion.div>

        <div className="flex justify-center">
          <TubelightNavBar
            items={navItems}
            activeItem={Object.keys(tabMapping).find(key => tabMapping[key] === activeTab)}
            onItemClick={handleNavClick}
            className="relative"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}
