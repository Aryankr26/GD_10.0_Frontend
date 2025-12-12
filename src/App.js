// App.js
import { useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";

import { DashboardOverview } from "./components/DashboardOverview";
import { DailyDataBook } from "./components/DailyDataBook";
import TruckDriver from "./components/TruckDriver";
import MaalIn from "./components/MaalIn";
import { RokadiUpdate } from "./components/RokadiUpdate";
import { BankAccount } from "./components/BankAccount";
import { FeriwalaSection } from "./components/FeriwalaSection";
import { LabourSection } from "./components/LabourSection";
import KabadiwalaSection from "./components/KabadiwalaSection";
import { PartnershipAccount } from "./components/PartnershipAccount";
import { BusinessReports } from "./components/BusinessReports";
import { MillSection } from "./components/MillSection";
import RatesUpdate from "./components/RatesUpdate";
import { ManagerDashboard } from "./components/manager/ManagerDashboard";

import { Login } from "./components/Login";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./utils/authContext";
import { DataProvider } from "./utils/dataContext";

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  if (!isAuthenticated) return <Login />;

  // Section Renderer
  const renderSection = () => {
    if (user.role === "manager") return <ManagerDashboard />;

    switch (activeSection) {
      case "dashboard": return <DashboardOverview />;
      case "daily-book": return <DailyDataBook />;
      case "maal-in": return <MaalIn />;
      case "truck-driver": return <TruckDriver />;
      case "rokadi": return <RokadiUpdate />;
      case "bank": return <BankAccount />;
      case "labour": return <LabourSection />;
      case "feriwala": return <FeriwalaSection />;
      case "kabadiwala": return <KabadiwalaSection />;
      case "partnership": return <PartnershipAccount />;
      case "rates-update": return <RatesUpdate />;
      case "business-reports": return <BusinessReports />;
      case "mill": return <MillSection />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""} overflow-x-hidden`}>

      {/* HEADER */}
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        toggleSidebar={() => setSidebarOpen(true)}
      />

      {/* BACKDROP (Mobile only) */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-all duration-300 
        ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div className="flex">

        {/* Mobile Sidebar (Drawer) */}
        <div
          className={`fixed md:hidden top-16 left-0 z-40 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar
            isOpen={sidebarOpen}
            closeSidebar={() => setSidebarOpen(false)}
            activeSection={activeSection}
            setActiveSection={(s) => {
              setActiveSection(s);
              setSidebarOpen(false);
            }}
          />
        </div>

                {/* Desktop Sidebar */}
        <div className="hidden md:block pt-16">
          <Sidebar
            isOpen={true}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            closeSidebar={() => {}} // explicit no-op for desktop
          />
        </div>


        {/* MAIN CONTENT */}
        <main className="content flex-1 p-6 overflow-y-auto">
          {renderSection()}
        </main>
      </div>

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
