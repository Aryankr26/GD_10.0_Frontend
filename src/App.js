// App.js
import { useState } from "react";
import { Toaster } from "./components/ui/sonner";

import { Login } from "./components/Owner/Login";
import { OwnersDashboard } from "./components/Owner/OwnersDashboard";
import { ManagerDashboard } from "./components/manager/ManagerDashboard";

import { AuthProvider, useAuth } from "./utils/authContext";
import { DataProvider } from "./utils/dataContext";

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  // 🔑 Owner section state (SINGLE SOURCE OF TRUTH)
  const [activeSection, setActiveSection] = useState("dashboard");

  // 🌙 Dark mode (optional, kept)
  const [darkMode, setDarkMode] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  // 👇 ROLE BASED ROUTING
  if (user.role === "manager") {
    return <ManagerDashboard />;
  }

  if (user.role === "owner") {
    return (
      <OwnersDashboard
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    );
  }

  // fallback (should never hit)
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
        <Toaster />
      </DataProvider>
    </AuthProvider>
  );
}
