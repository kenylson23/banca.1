import { LayoutDashboard, UtensilsCrossed, QrCode, ChefHat, LogOut, Users, User, Shield, Building2, Settings, BarChart3, CreditCard, TrendingUp, DollarSign, Receipt, FileText, Wallet, Package } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { Section } from "@/pages/main-dashboard";
import { queryClient } from "@/lib/queryClient";
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
  
  const menuItems = user?.role === 'superadmin' 
    ? superAdminMenuItems 
    : user?.role === 'admin' 
    ? adminMenuItems 
    : kitchenMenuItems;

  return (
    <Sidebar role="navigation" aria-label="Menu principal de navegação">
      <SidebarContent>
        <div className="p-6 border-b border-sidebar-border bg-gradient-to-br from-primary/10 to-transparent">
          <h1 className="text-xl font-bold text-sidebar-foreground">Na Bancada</h1>
          <p className="text-xs text-muted-foreground mt-1">Sistema de Gestão</p>
        </div>

        <BranchSelector />

        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
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
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 border-t border-sidebar-border space-y-3 bg-gradient-to-t from-sidebar-accent/30 to-transparent" role="contentinfo" aria-label="Informações do usuário">
          <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate transition-colors">
            <Avatar className="h-10 w-10 border-2 border-primary/20" aria-hidden="true">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.firstName?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-sidebar-foreground truncate" data-testid="text-user-name">
                {user?.firstName || user?.email || "Usuário"}
              </p>
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2" role="group" aria-label="Ações do usuário">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-lg"
              onClick={() => setLocation("/profile")}
              data-testid="button-profile"
              aria-label="Ver perfil do usuário"
            >
              <User className="h-4 w-4 mr-1" aria-hidden="true" />
              Perfil
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-lg"
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { 
                    method: "POST",
                    credentials: "include"
                  });
                } catch (error) {
                  // Logout failed silently
                } finally {
                  queryClient.clear();
                  window.location.href = "/";
                }
              }}
              data-testid="button-logout"
              aria-label="Sair do sistema"
            >
              <LogOut className="h-4 w-4 mr-1" aria-hidden="true" />
              Sair
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
