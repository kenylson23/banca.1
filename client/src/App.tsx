import { Switch, Route, Redirect } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";
import { SubscriptionExpiredAlert } from "@/components/SubscriptionExpiredAlert";

// Lazy load pages for better code splitting
const Landing = lazy(() => import("@/pages/landing"));
const Login = lazy(() => import("@/pages/login"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const CustomerMenu = lazy(() => import("@/pages/customer-menu"));
const PublicMenu = lazy(() => import("@/pages/public-menu"));
const TrackOrder = lazy(() => import("@/pages/track-order"));
const MainDashboard = lazy(() => import("@/pages/main-dashboard"));
const OrderDetail = lazy(() => import("@/pages/order-detail"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/mesa/:tableNumber" component={CustomerMenu} />
        <Route path="/r/:slug/rastrear" component={TrackOrder} />
        <Route path="/r/:slug" component={PublicMenu} />
      
      <Route path="/termos" component={Terms} />
      <Route path="/privacidade" component={Privacy} />
      
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/:rest*">
            {() => <Redirect to="/login" />}
          </Route>
        </>
      ) : (
        <>
          <Route path="/" component={() => {
            if (user?.role === 'superadmin') {
              return <Redirect to="/superadmin" />;
            } else if (user?.role === 'kitchen') {
              return <Redirect to="/kitchen" />;
            } else if (user?.role === 'waiter' || user?.role === 'cashier') {
              return <Redirect to="/open-tables" />;
            } else {
              return <Redirect to="/dashboard" />;
            }
          }} />
          
          <Route path="/dashboard" component={() => {
            if (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'cashier') {
              return <MainDashboard section="dashboard" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/tables" component={() => {
            if (user?.role === 'admin' || user?.role === 'manager') {
              return <MainDashboard section="tables" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/open-tables" component={() => {
            if (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'cashier' || user?.role === 'waiter') {
              return <MainDashboard section="open-tables" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/menu" component={() => {
            if (user?.role === 'admin' || user?.role === 'manager') {
              return <MainDashboard section="menu" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/pdv" component={() => {
            if (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'cashier') {
              return <MainDashboard section="pdv" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/kitchen" component={() => {
            if (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'kitchen') {
              return <MainDashboard section="kitchen" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/users" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="users" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/branches" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="branches" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/reports" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="reports" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/sales" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="sales" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/profile" component={() => {
            return <MainDashboard section="profile" />;
          }} />
          
          <Route path="/settings" component={() => {
            if (user?.role === 'admin' || user?.role === 'superadmin') {
              return <MainDashboard section="settings" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/superadmin" component={() => {
            if (user?.role === 'superadmin') {
              return <MainDashboard section="superadmin" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/orders/:id" component={() => {
            if (user?.role === 'admin') {
              return <OrderDetail />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/financial/dashboard" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="financial-dashboard" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/financial" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="financial" />;
            }
            return <Redirect to="/" />;
          }} />
          
          {/* Redirecionar /expenses para /financial com tab de despesas */}
          <Route path="/expenses" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="financial" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/financial/categories" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="financial-categories" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/financial/new" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="financial-new" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/financial/cash-registers" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="financial-cash-registers" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/financial/shifts" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="financial-shifts" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/expenses" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="expenses" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/financial/reports" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="financial-reports" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/inventory" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="inventory" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/customers" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="customers" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/loyalty" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="loyalty" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/coupons" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="coupons" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/printers" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="printers" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/subscription" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="subscription" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/notification-settings" component={() => {
            if (user?.role === 'admin') {
              return <MainDashboard section="notification-settings" />;
            }
            return <Redirect to="/" />;
          }} />
          
          <Route path="/login">
            {() => <Redirect to="/" />}
          </Route>
        </>
      )}
      
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppContent() {
  return (
    <>
      <Toaster />
      <SubscriptionExpiredAlert />
      <Router />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <CartProvider>
            <CustomerAuthProvider>
              <AppContent />
            </CustomerAuthProvider>
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
