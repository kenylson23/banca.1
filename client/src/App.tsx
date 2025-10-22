import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Tables from "@/pages/tables";
import Menu from "@/pages/menu";
import Kitchen from "@/pages/kitchen";
import Users from "@/pages/users";
import Profile from "@/pages/profile";
import CustomerMenu from "@/pages/customer-menu";
import SuperAdmin from "@/pages/superadmin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      <Route path="/mesa/:tableNumber" component={CustomerMenu} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : user?.role === 'superadmin' ? (
        <>
          <Route path="/" component={SuperAdmin} />
          <Route path="/superadmin" component={SuperAdmin} />
          <Route path="/perfil" component={Profile} />
        </>
      ) : user?.role === 'kitchen' ? (
        <>
          <Route path="/" component={Kitchen} />
          <Route path="/cozinha" component={Kitchen} />
          <Route path="/perfil" component={Profile} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/mesas" component={Tables} />
          <Route path="/menu" component={Menu} />
          <Route path="/cozinha" component={Kitchen} />
          <Route path="/usuarios" component={Users} />
          <Route path="/perfil" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isLoading || !isAuthenticated) {
    return (
      <>
        <Toaster />
        <Router />
      </>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-background">
            <Router />
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
