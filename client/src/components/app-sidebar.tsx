import { LayoutDashboard, UtensilsCrossed, QrCode, ChefHat, LogOut, Users, User } from "lucide-react";
import { Link, useLocation } from "wouter";
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

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Mesas",
    url: "/mesas",
    icon: QrCode,
  },
  {
    title: "Menu",
    url: "/menu",
    icon: UtensilsCrossed,
  },
  {
    title: "Cozinha",
    url: "/cozinha",
    icon: ChefHat,
  },
  {
    title: "Usuários",
    url: "/usuarios",
    icon: Users,
  },
];

const kitchenMenuItems = [
  {
    title: "Cozinha",
    url: "/cozinha",
    icon: ChefHat,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const menuItems = user?.role === 'admin' ? adminMenuItems : kitchenMenuItems;

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Na Bancada</h1>
          <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
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
              asChild
            >
              <Link href="/perfil" data-testid="button-profile">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                } catch (error) {
                  console.error("Erro ao fazer logout:", error);
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
