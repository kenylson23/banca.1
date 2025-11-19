import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

export function ProfileMenu() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
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
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="flex items-center gap-3 rounded-lg px-3 py-2 hover-elevate active-elevate-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
        data-testid="button-profile-menu"
        aria-label="Menu do usuário"
      >
        <Avatar className="h-8 w-8 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {user?.firstName?.[0] || user?.email?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start overflow-hidden">
          <p className="text-sm font-semibold text-sidebar-foreground truncate max-w-[150px]" data-testid="text-user-name-header">
            {user?.firstName || user?.email || "Usuário"}
          </p>
          {user?.email && (
            <p className="text-xs text-muted-foreground truncate max-w-[150px]" data-testid="text-user-email-header">
              {user.email}
            </p>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName || "Usuário"}
            </p>
            {user?.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setLocation("/profile")}
          data-testid="menu-item-profile"
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Ver Perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          data-testid="menu-item-logout"
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
