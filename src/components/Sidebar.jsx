// components/Sidebar.jsx
import {
  LayoutDashboard,
  BookOpen,
  Wallet,
  Building2,
  Users,
  Recycle,
  Handshake,
  Factory,
  BarChart3,
  TrendingUp,
  Truck,
  Package
} from "lucide-react";
import { cn } from "./ui/utils";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "daily-book", label: "Daily Data Book", icon: BookOpen },
  { id: "rokadi", label: "Rokadi Update", icon: Wallet },
  { id: "bank", label: "Bank Account", icon: Building2 },
  { id: "labour", label: "Labour", icon: Users },
  { id: "feriwala", label: "Feriwala", icon: Recycle },
  { id: "truck-driver", label: "Truck Driver", icon: Truck },
  { id: "maal-in", label: "Maal In", icon: Package },
  { id: "kabadiwala", label: "Kabadiwala", icon: Recycle },
  { id: "partnership", label: "Partnership", icon: Handshake },
  { id: "rates-update", label: "Rates Update", icon: TrendingUp },
  { id: "business-reports", label: "Business Reports", icon: BarChart3 },
  { id: "mill", label: "Party / Mill", icon: Factory }
];

export function Sidebar({ isOpen, activeSection, setActiveSection, closeSidebar }) {
  return (
    <aside
      className={cn(
        "fixed md:static left-0 top-16 z-40 w-64 h-[calc(100vh-4rem)]",
        "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
        "shadow-lg transform transition-transform duration-300",

        // mobile slide animation
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Mobile close button */}
      <div className="md:hidden flex justify-end p-2">
        <button
          onClick={closeSidebar}
          className="p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          ✕
        </button>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                closeSidebar();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                activeSection === item.id
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
