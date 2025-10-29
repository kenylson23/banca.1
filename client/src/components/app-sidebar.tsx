import { LayoutDashboard, UtensilsCrossed, QrCode, ChefHat, LogOut, Users, User, Shield, Building2, Settings } from "lucide-react";
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
    title: "Mesas",
    section: "tables" as Section,
    path: "/tables",
    icon: QrCode,
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
    <Sidebar>
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Na Bancada</h1>
          <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
        </div>

        <BranchSelector />

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={currentSection === item.section}
                    onClick={() => setLocation(item.path)}
                    data-testid={`button-${item.title.toLowerCase()}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {user?.firstName?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate" data-testid="text-user-name">
                {user?.firstName || user?.email || "Usuário"}
              </p>
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setLocation("/profile")}
              data-testid="button-profile"
            >
              <User className="h-4 w-4 mr-2" />
              Perfil
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { 
                    method: "POST",
                    credentials: "include"
                  });
                } catch (error) {
                  console.error("Erro ao fazer logout:", error);
                } finally {
                  queryClient.clear();
                  window.location.href = "/";
                }
              }}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
