import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileMenu } from "@/components/profile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
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
import FinancialTransactions from "./financial-transactions";
import FinancialCategories from "./financial-categories";
import FinancialNewTransaction from "./financial-new-transaction";
import FinancialCashRegisters from "./financial-cash-registers";
import CashShifts from "./cash-shifts";
import Expenses from "./expenses";
import FinancialReports from "./financial-reports";
import Inventory from "./inventory";

export type Section = 
  | "dashboard" 
  | "pdv"
  | "tables" 
  | "menu" 
  | "kitchen" 
  | "users" 
  | "branches"
  | "reports"
  | "sales"
  | "profile" 
  | "settings"
  | "superadmin"
  | "financial"
  | "financial-categories"
  | "financial-new"
  | "financial-cash-registers"
  | "financial-shifts"
  | "expenses"
  | "financial-reports"
  | "inventory";

interface MainDashboardProps {
  section: Section;
}

export default function MainDashboard({ section }: MainDashboardProps) {
  const currentSection = section;

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard />;
      case "pdv":
        return <PDV />;
      case "tables":
        return <Tables />;
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
      case "financial":
        return <FinancialTransactions />;
      case "financial-categories":
        return <FinancialCategories />;
      case "financial-new":
        return <FinancialNewTransaction />;
      case "financial-cash-registers":
        return <FinancialCashRegisters />;
      case "financial-shifts":
        return <CashShifts />;
      case "expenses":
        return <Expenses />;
      case "financial-reports":
        return <FinancialReports />;
      case "inventory":
        return <Inventory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo principal
      </a>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar currentSection={currentSection} />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between px-6 py-4 border-b border-sidebar-border bg-background shadow-sm z-10" role="banner">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-bold tracking-tight capitalize" data-testid="text-current-section">
                {currentSection === "dashboard" ? "Dashboard" :
                 currentSection === "pdv" ? "PDV" :
                 currentSection === "tables" ? "Mesas" :
                 currentSection === "menu" ? "Menu" :
                 currentSection === "kitchen" ? "Cozinha" :
                 currentSection === "users" ? "Usuários" :
                 currentSection === "branches" ? "Unidades" :
                 currentSection === "reports" ? "Relatórios" :
                 currentSection === "sales" ? "Vendas" :
                 currentSection === "profile" ? "Perfil" :
                 currentSection === "settings" ? "Configurações" :
                 currentSection === "superadmin" ? "Super Admin" :
                 currentSection === "financial" ? "Lançamentos" :
                 currentSection === "financial-categories" ? "Categorias Financeiras" :
                 currentSection === "financial-new" ? "Novo Lançamento" :
                 currentSection === "financial-cash-registers" ? "Caixa" :
                 currentSection === "financial-shifts" ? "Turnos de Caixa" :
                 currentSection === "expenses" ? "Despesas" :
                 currentSection === "financial-reports" ? "Relatórios Financeiros" :
                 currentSection === "inventory" ? "Inventário" : ""}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ProfileMenu />
              <ThemeToggle />
            </div>
          </header>
          <main id="main-content" className="flex-1 overflow-auto bg-muted/20" role="main">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
