import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Dashboard from "./dashboard";
import Tables from "./tables";
import Menu from "./menu";
import Kitchen from "./kitchen";
import Users from "./users";
import Profile from "./profile";
import SuperAdmin from "./superadmin";

export type Section = 
  | "dashboard" 
  | "tables" 
  | "menu" 
  | "kitchen" 
  | "users" 
  | "profile" 
  | "superadmin";

export default function MainDashboard() {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState<Section>(
    user?.role === 'superadmin' ? 'superadmin' : 
    user?.role === 'kitchen' ? 'kitchen' : 
    'dashboard'
  );

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
      case "profile":
        return <Profile />;
      case "superadmin":
        return <SuperAdmin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar currentSection={currentSection} onSectionChange={setCurrentSection} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h2 className="text-xl font-semibold capitalize" data-testid="text-current-section">
              {currentSection === "dashboard" ? "Dashboard" :
               currentSection === "tables" ? "Mesas" :
               currentSection === "menu" ? "Menu" :
               currentSection === "kitchen" ? "Cozinha" :
               currentSection === "users" ? "Usuários" :
               currentSection === "profile" ? "Perfil" :
               currentSection === "superadmin" ? "Super Admin" : ""}
            </h2>
            <div className="w-10" />
          </header>
          <main className="flex-1 overflow-auto bg-background">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
