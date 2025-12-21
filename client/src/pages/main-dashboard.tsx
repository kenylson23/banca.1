import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { ProfileMenu } from "@/components/profile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { ChevronRight, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Dashboard from "./dashboard";
import PDV from "./pdv";
import Tables from "./tables";
import Menu from "./menu";
import Kitchen from "./kitchen";
import Users from "./users";
import Branches from "./branches";
import Reports from "./reports";
import Sales from "./sales";
import Profile from "./profile";
import Settings from "./settings";
import SuperAdmin from "./superadmin";
import FinancialDashboard from "./financial-dashboard";
import FinancialTransactionsUnified from "./financial-transactions-unified";
import FinancialCategories from "./financial-categories";
import FinancialNewTransaction from "./financial-new-transaction";
import FinancialCashRegisters from "./financial-cash-registers";
import CashShifts from "./cash-shifts";
import FinancialReports from "./financial-reports";
import Inventory from "./inventory";
import Customers from "./customers";
import Loyalty from "./loyalty";
import Coupons from "./coupons";
import PrinterSetup from "./printer-setup";
import Subscription from "./subscription";
import NotificationSettings from "./notification-settings";
import OpenTables from "./open-tables";

export type Section = 
  | "dashboard" 
  | "pdv"
  | "tables" 
  | "open-tables"
  | "menu" 
  | "kitchen" 
  | "users" 
  | "branches"
  | "reports"
  | "sales"
  | "profile" 
  | "settings"
  | "superadmin"
  | "financial-dashboard"
  | "financial"
  | "financial-categories"
  | "financial-new"
  | "financial-cash-registers"
  | "financial-shifts"
  | "expenses"
  | "financial-reports"
  | "inventory"
  | "customers"
  | "loyalty"
  | "coupons"
  | "printers"
  | "subscription"
  | "notification-settings";

interface MainDashboardProps {
  section: Section;
}

export default function MainDashboard({ section }: MainDashboardProps) {
  const currentSection = section;
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Fetch restaurant data for status badge
  const { data: restaurant, isLoading, error } = useQuery<{ 
    id: string; 
    name: string; 
    isOpen: number;
    businessHours?: string;
  }>({
    queryKey: [`/api/public/restaurants/${user?.restaurantId}`],
    enabled: !!user?.restaurantId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Detect scroll for header blur effect
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const mainContent = document.getElementById('main-content');
    mainContent?.addEventListener('scroll', handleScroll);
    return () => mainContent?.removeEventListener('scroll', handleScroll);
  }, []);

  // Get section title for breadcrumb
  const getSectionTitle = () => {
    const titles: Record<Section, string> = {
      dashboard: "Dashboard",
      pdv: "PDV - Ponto de Venda",
      tables: "Gestão de Mesas",
      "open-tables": "Mesas Abertas",
      menu: "Cardápio Digital",
      kitchen: "Cozinha",
      users: "Usuários",
      branches: "Filiais",
      reports: "Relatórios",
      sales: "Vendas",
      profile: "Perfil",
      settings: "Configurações",
      superadmin: "Super Admin",
      "financial-dashboard": "Dashboard Financeiro",
      financial: "Transações Financeiras",
      "financial-categories": "Categorias",
      "financial-new": "Nova Transação",
      "financial-cash-registers": "Caixas",
      "financial-shifts": "Turnos de Caixa",
      expenses: "Despesas",
      "financial-reports": "Relatórios Financeiros",
      inventory: "Inventário",
      customers: "Clientes",
      loyalty: "Programa de Fidelidade",
      coupons: "Cupons",
      printers: "Configuração de Impressoras",
      subscription: "Assinatura",
      "notification-settings": "Configurações de Notificação",
    };
    return titles[currentSection] || "Dashboard";
  };

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard />;
      case "pdv":
        return <PDV />;
      case "tables":
        return <Tables />;
      case "open-tables":
        return <OpenTables />;
      case "menu":
        return <Menu />;
      case "kitchen":
        return <Kitchen />;
      case "users":
        return <Users />;
      case "branches":
        return <Branches />;
      case "reports":
        return <Reports />;
      case "sales":
        return <Sales />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      case "superadmin":
        return <SuperAdmin />;
      case "financial-dashboard":
        return <FinancialDashboard />;
      case "financial":
        return <FinancialTransactionsUnified />;
      case "financial-categories":
        return <FinancialCategories />;
      case "financial-new":
        return <FinancialNewTransaction />;
      case "financial-cash-registers":
        return <FinancialCashRegisters />;
      case "financial-shifts":
        return <CashShifts />;
      case "expenses":
        return <FinancialTransactionsUnified />; // Redireciona para painel unificado
      case "financial-reports":
        return <FinancialReports />;
      case "inventory":
        return <Inventory />;
      case "customers":
        return <Customers />;
      case "loyalty":
        return <Loyalty />;
      case "coupons":
        return <Coupons />;
      case "printers":
        return <PrinterSetup />;
      case "subscription":
        return <Subscription />;
      case "notification-settings":
        return <NotificationSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo principal
      </a>
      <div className="flex h-screen w-full overflow-hidden relative">
        <AppSidebar currentSection={currentSection} />
        <div className="flex flex-col flex-1 min-w-0">
          {/* Modern Floating Header with Blur Effect */}
          <HeaderContent 
            scrolled={scrolled}
            getSectionTitle={getSectionTitle}
            restaurant={restaurant}
            user={user}
          />

          {/* Main Content with proper spacing */}
          <main 
            id="main-content" 
            className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/10 mt-16" 
            role="main"
          >
            <div className="animate-in fade-in duration-500">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Custom Menu Toggle Button Component
function MenuToggle() {
  const { toggleSidebar, state } = useSidebar();
  const isOpen = state === "expanded";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      data-testid="button-sidebar-toggle"
      className="shrink-0 h-10 w-10 rounded-xl hover:bg-accent/60 transition-all duration-200 group"
      aria-label="Toggle menu"
    >
      <div className="relative w-5 h-5 flex flex-col items-center justify-center">
        <span
          className={`
            absolute h-0.5 w-5 bg-foreground rounded-full
            transition-all duration-300 ease-in-out
            ${isOpen ? 'top-[9px] rotate-45' : 'top-1'}
          `}
        />
        <span
          className={`
            absolute h-0.5 w-5 bg-foreground rounded-full
            transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-0 scale-0' : 'top-[9px] opacity-100 scale-100'}
          `}
        />
        <span
          className={`
            absolute h-0.5 w-5 bg-foreground rounded-full
            transition-all duration-300 ease-in-out
            ${isOpen ? 'top-[9px] -rotate-45' : 'top-[17px]'}
          `}
        />
      </div>
    </Button>
  );
}

// Header Content Component
function HeaderContent({ 
  scrolled, 
  getSectionTitle, 
  restaurant,
  user 
}: { 
  scrolled: boolean;
  getSectionTitle: () => string;
  restaurant?: { id: string; name: string; isOpen: number; businessHours?: string };
  user?: any;
}) {
  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-in-out
        ${scrolled 
          ? 'bg-background/80 backdrop-blur-xl shadow-lg border-b border-border/40' 
          : 'bg-background/60 backdrop-blur-sm'
        }
      `}
      role="banner"
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section - Trigger & Breadcrumb */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <MenuToggle />
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <span className="font-medium text-foreground hidden sm:inline">Na Bancada</span>
            <ChevronRight className="h-4 w-4 shrink-0 hidden sm:inline" />
            <span className="font-medium text-foreground truncate">{getSectionTitle()}</span>
          </div>

          {/* Restaurant Status Badge */}
          {restaurant && (
            <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
              <Store className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className={`
                  h-2 w-2 rounded-full animate-pulse
                  ${restaurant.isOpen === 1 ? 'bg-green-500' : 'bg-red-500'}
                `} />
                <span className={`
                  text-xs font-medium
                  ${restaurant.isOpen === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                `}>
                  {restaurant.isOpen === 1 ? 'Aberto' : 'Fechado'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <NotificationDropdown />
          <ThemeToggle />
          <div className="h-8 w-px bg-border mx-1" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
