import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Dashboard from "./dashboard";
import Tables from "./tables";
import Menu from "./menu";
import Kitchen from "./kitchen";
import Users from "./users";
import Branches from "./branches";
import Reports from "./reports";
import Profile from "./profile";
import Settings from "./settings";
import SuperAdmin from "./superadmin";

export type Section = 
  | "dashboard" 
  | "tables" 
  | "menu" 
  | "kitchen" 
  | "users" 
  | "branches"
  | "reports"
  | "profile" 
  | "settings"
  | "superadmin";

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
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      case "superadmin":
        return <SuperAdmin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo principal
      </a>
      <div className="flex h-screen w-full">
        <AppSidebar currentSection={currentSection} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background" role="banner">
            <SidebarTrigger 
              data-testid="button-sidebar-toggle" 
              aria-label="Abrir menu lateral"
            />
            <h1 className="text-xl font-semibold capitalize" data-testid="text-current-section">
              {currentSection === "dashboard" ? "Dashboard" :
               currentSection === "tables" ? "Mesas" :
               currentSection === "menu" ? "Menu" :
               currentSection === "kitchen" ? "Cozinha" :
               currentSection === "users" ? "Usuários" :
               currentSection === "branches" ? "Unidades" :
               currentSection === "reports" ? "Relatórios" :
               currentSection === "profile" ? "Perfil" :
               currentSection === "settings" ? "Configurações" :
               currentSection === "superadmin" ? "Super Admin" : ""}
            </h1>
            <div className="w-10" aria-hidden="true" />
          </header>
          <main id="main-content" className="flex-1 overflow-auto bg-background" role="main">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
