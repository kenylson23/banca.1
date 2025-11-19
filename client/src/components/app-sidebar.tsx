import { LayoutDashboard, UtensilsCrossed, QrCode, ChefHat, LogOut, Users, User, Shield, Building2, Settings, BarChart3, CreditCard, TrendingUp, DollarSign, Receipt, FileText, Wallet, Package, PanelLeftClose, PanelLeft } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { Section } from "@/pages/main-dashboard";
import { BranchSelector } from "@/components/branch-selector";

const adminMenuItems = [
  {
    title: "Dashboard",
    section: "dashboard" as Section,
    path: "/dashboard",
    icon: LayoutDashboard,
  },
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
    title: "Relatórios",
    section: "reports" as Section,
    path: "/reports",
    icon: BarChart3,
  },
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
  {
    title: "Inventário",
    section: "inventory" as Section,
    path: "/inventory",
    icon: Package,
  },
  {
    title: "Configurações",
    section: "settings" as Section,
    path: "/settings",
    icon: Settings,
  },
];

const kitchenMenuItems = [
  {
    title: "Cozinha",
    section: "kitchen" as Section,
    path: "/kitchen",
    icon: ChefHat,
  },
];

const superAdminMenuItems = [
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
  
  const menuItems = user?.role === 'superadmin' 
    ? superAdminMenuItems 
    : user?.role === 'admin' 
    ? adminMenuItems 
    : kitchenMenuItems;

  return (
    <Sidebar role="navigation" aria-label="Menu principal de navegação">
      <SidebarContent>
        <div className="p-6 border-b border-sidebar-border bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-sidebar-foreground truncate">Na Bancada</h1>
              <p className="text-xs text-muted-foreground mt-1 truncate">Sistema de Gestão</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="shrink-0"
                  data-testid="button-sidebar-toggle-internal"
                  aria-label={open ? "Recolher menu lateral" : "Expandir menu lateral"}
                >
                  {open ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              {!open && (
                <TooltipContent side="right" className="font-semibold">
                  Expandir menu
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>

        <BranchSelector />

        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        isActive={currentSection === item.section}
                        onClick={() => setLocation(item.path)}
                        data-testid={`button-${item.title.toLowerCase()}`}
                        aria-label={`Navegar para ${item.title}`}
                        aria-current={currentSection === item.section ? 'page' : undefined}
                        className="h-10 px-3 rounded-lg transition-all duration-200"
                      >
                        <item.icon className="h-5 w-5 mr-3" aria-hidden="true" />
                        <span className="font-medium">{item.title}</span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {!open && (
                      <TooltipContent side="right" className="font-semibold">
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
