import { LayoutDashboard, UtensilsCrossed, QrCode, ChefHat, LogOut, Users, User, Shield, Building2, Settings, BarChart3, CreditCard, TrendingUp, DollarSign, Receipt, FileText, Wallet, Package, PanelLeftClose, PanelLeft, ChevronRight, Briefcase, DollarSignIcon, Building, UserCircle, Gift, Tag } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";
import type { Section } from "@/pages/main-dashboard";
import { BranchSelector } from "@/components/branch-selector";

type MenuItem = {
  title: string;
  section?: Section;
  path?: string;
  icon: any;
  items?: {
    title: string;
    section: Section;
    path: string;
    icon: any;
  }[];
};

const adminMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    section: "dashboard" as Section,
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Operações",
    icon: Briefcase,
    items: [
      {
        title: "PDV",
        section: "pdv" as Section,
        path: "/pdv",
        icon: CreditCard,
      },
      {
        title: "Menu",
        section: "menu" as Section,
        path: "/menu",
        icon: UtensilsCrossed,
      },
      {
        title: "Cozinha",
        section: "kitchen" as Section,
        path: "/kitchen",
        icon: ChefHat,
      },
    ],
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    items: [
      {
        title: "Vendas",
        section: "sales" as Section,
        path: "/sales",
        icon: TrendingUp,
      },
      {
        title: "Lançamentos",
        section: "financial" as Section,
        path: "/financial",
        icon: DollarSign,
      },
      {
        title: "Despesas",
        section: "expenses" as Section,
        path: "/expenses",
        icon: Receipt,
      },
      {
        title: "Caixa",
        section: "financial-cash-registers" as Section,
        path: "/financial/cash-registers",
        icon: Wallet,
      },
      {
        title: "Relatórios Financeiros",
        section: "financial-reports" as Section,
        path: "/financial/reports",
        icon: FileText,
      },
    ],
  },
  {
    title: "Gestão",
    icon: Building,
    items: [
      {
        title: "Usuários",
        section: "users" as Section,
        path: "/users",
        icon: Users,
      },
      {
        title: "Unidades",
        section: "branches" as Section,
        path: "/branches",
        icon: Building2,
      },
      {
        title: "Inventário",
        section: "inventory" as Section,
        path: "/inventory",
        icon: Package,
      },
    ],
  },
  {
    title: "Clientes",
    icon: UserCircle,
    items: [
      {
        title: "Clientes",
        section: "customers" as Section,
        path: "/customers",
        icon: Users,
      },
      {
        title: "Fidelidade",
        section: "loyalty" as Section,
        path: "/loyalty",
        icon: Gift,
      },
      {
        title: "Cupons",
        section: "coupons" as Section,
        path: "/coupons",
        icon: Tag,
      },
    ],
  },
  {
    title: "Relatórios",
    section: "reports" as Section,
    path: "/reports",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    section: "settings" as Section,
    path: "/settings",
    icon: Settings,
  },
];

const kitchenMenuItems: MenuItem[] = [
  {
    title: "Cozinha",
    section: "kitchen" as Section,
    path: "/kitchen",
    icon: ChefHat,
  },
];

const superAdminMenuItems: MenuItem[] = [
  {
    title: "Super Admin",
    section: "superadmin" as Section,
    path: "/superadmin",
    icon: Shield,
  },
  {
    title: "Configurações",
    section: "settings" as Section,
    path: "/settings",
    icon: Settings,
  },
];

interface AppSidebarProps {
  currentSection: Section;
}

export function AppSidebar({ currentSection }: AppSidebarProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toggleSidebar, open } = useSidebar();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  
  const menuItems = user?.role === 'superadmin' 
    ? superAdminMenuItems 
    : user?.role === 'admin' 
    ? adminMenuItems 
    : kitchenMenuItems;

  // Helper function to check if a category contains the active section
  const isCategoryActive = (item: MenuItem) => {
    if (item.items) {
      return item.items.some(subItem => subItem.section === currentSection);
    }
    return false;
  };

  // Toggle category open/close
  const toggleCategory = (title: string) => {
    setOpenCategories(prev => 
      prev.includes(title) 
        ? prev.filter(cat => cat !== title)
        : [...prev, title]
    );
  };

  // Auto-open category containing active section
  const isCategoryOpen = (title: string, item: MenuItem) => {
    if (isCategoryActive(item) && !openCategories.includes(title)) {
      setOpenCategories(prev => [...prev, title]);
    }
    return openCategories.includes(title);
  };

  return (
    <Sidebar collapsible="icon" role="navigation" aria-label="Menu principal de navegação" className="border-r border-sidebar-border">
      <SidebarContent className="flex flex-col h-full pt-20">
        <BranchSelector />

        <div className="flex-1 overflow-y-auto">
          <SidebarGroup className="px-3 py-4 group-data-[collapsible=icon]:px-2">
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2 group-data-[collapsible=icon]:hidden">
              Menu Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => {
                  // Item with subitems (category with dropdown)
                  if (item.items) {
                    const isActive = isCategoryActive(item);
                    const isOpen = isCategoryOpen(item.title, item);
                    
                    return (
                      <Collapsible
                        key={item.title}
                        open={isOpen}
                        onOpenChange={() => toggleCategory(item.title)}
                      >
                        <SidebarMenuItem>
                          <Tooltip>
                            <CollapsibleTrigger asChild>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton
                                  isActive={isActive}
                                  data-testid={`button-${item.title.toLowerCase()}`}
                                  className="h-10 px-3 rounded-lg transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                                >
                                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                  <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                                  <ChevronRight 
                                    className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden ${isOpen ? 'rotate-90' : ''}`}
                                    aria-hidden="true"
                                  />
                                </SidebarMenuButton>
                              </TooltipTrigger>
                            </CollapsibleTrigger>
                            {!open && (
                              <TooltipContent side="right" className="font-semibold">
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold">{item.title}</span>
                                  {item.items.map(subItem => (
                                    <span key={subItem.title} className="text-xs font-normal">
                                      • {subItem.title}
                                    </span>
                                  ))}
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    isActive={currentSection === subItem.section}
                                    onClick={() => setLocation(subItem.path)}
                                    data-testid={`button-${subItem.title.toLowerCase()}`}
                                    aria-label={`Navegar para ${subItem.title}`}
                                    aria-current={currentSection === subItem.section ? 'page' : undefined}
                                    className="transition-all duration-200"
                                  >
                                    <subItem.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span className="font-medium">{subItem.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }
                  
                  // Simple item (no subitems)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            isActive={currentSection === item.section}
                            onClick={() => item.path && setLocation(item.path)}
                            data-testid={`button-${item.title.toLowerCase()}`}
                            aria-label={`Navegar para ${item.title}`}
                            aria-current={currentSection === item.section ? 'page' : undefined}
                            className="h-10 px-3 rounded-lg transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                          >
                            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                            <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {!open && (
                          <TooltipContent side="right" className="font-semibold">
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
