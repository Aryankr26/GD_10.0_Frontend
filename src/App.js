// App.js
import { useState } from "react";
import { Header } from "./components/Owner/Header";

import { DashboardOverview } from "./components/Owner/DashboardOverview";
import { DailyDataBook } from "./components/Owner/DailyDataBook";
import TruckDriver from "./components/Owner/TruckDriver";
import MaalIn from "./components/Owner/MaalIn";
import { RokadiUpdate } from "./components/Owner/RokadiUpdate";
import { BankAccount } from "./components/Owner/BankAccount";
import { FeriwalaSection } from "./components/Owner/FeriwalaSection";
import { LabourSection } from "./components/Owner/LabourSection";
import KabadiwalaSection from "./components/Owner/KabadiwalaSection";
import { PartnershipAccount } from "./components/Owner/PartnershipAccount";
import { BusinessReports } from "./components/Owner/BusinessReports";
import { MillSection } from "./components/Owner/MillSection";
import RatesUpdate from "./components/Owner/RatesUpdate";
import { ManagerDashboard } from "./components/manager/ManagerDashboard";
// App.js — add near other imports
import { OwnersDashboard } from "./components/Owner/OwnersDashboard";

import { Login } from "./components/Owner/Login";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./utils/authContext";
import { DataProvider } from "./utils/dataContext";

// Navigation menu items
export const menuItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "daily-book", label: "Daily Data Book" },
  { id: "rokadi", label: "Rokadi Update" },
  { id: "bank", label: "Bank Account" },
  { id: "labour", label: "Labour" },
  { id: "feriwala", label: "Feriwala" },
  { id: "truck-driver", label: "Truck Driver" },
  { id: "maal-in", label: "Maal In" },
  { id: "kabadiwala", label: "Kabadiwala" },
  { id: "partnership", label: "Partnership" },
  { id: "rates-update", label: "Rates Update" },
  { id: "business-reports", label: "Business Reports" },
  { id: "mill", label: "Party / Mill" },
];

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  if (!isAuthenticated) return <Login />;

  // SECTION RENDERER
  const renderSection = () => {
  if (user.role === "manager") return <ManagerDashboard />;

  if (user.role === "owner") {
    return <OwnersDashboard
      activeSection={activeSection}
      setActiveSection={setActiveSection}
    />;
  }
};


  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      {/* HEADER with menu */}
     

      {/* MAIN */}
      <main className="pt-16 p-6 overflow-y-auto">
        {renderSection()}
      </main>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
