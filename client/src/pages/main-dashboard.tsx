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
  | "financial-reports";

interface MainDashboardProps {
  section: Section;
}

export default function MainDashboard({ section }: MainDashboardProps) {
  const currentSection = section;

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
      default:
        return <Dashboard />;
    }
  };

  return renderContent();
}
