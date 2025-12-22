import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

import {
  Receipt,
  Package,
  UserSquare,
  Settings,
  LogOut,
  Users,
  Handshake
} from "lucide-react";

import { useAuth } from "../../utils/authContext";
import { ExpenseManager } from "./ExpenseManager";
import MaalInManager from "./MaalInManager";
import { LabourManager } from "./LabourManager";
import { FeriwalaManager } from "./FeriwalaManager";
import { KabadiwalaManager } from "./KabadiwalaManager";

export function ManagerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("expenses");
  const [maalSubTab, setMaalSubTab] = useState("maal-in");

  const SettingsTab = () => (
    <Card className="m-4">
      <CardContent className="space-y-4 p-4">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium">{user?.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <Button variant="destructive" onClick={logout} className="w-full">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= MOBILE / APP ONLY ================= */}
      <div className="md:hidden flex flex-col h-[100dvh]">

        {/* 🔷 APP HEADER */}
        <div className="sticky top-0 z-40 bg-[#4ADE80] border-b px-4 py-3">
          <h1 className="text-xl font-bold tracking-wide text-emerald-600">
            Scrap<span className="text-gray-800">Co</span>
          </h1>
          <p className="text-xs text-gray-500">
            Godown Manager
          </p>
        </div>
          

        {/* 🔹 SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">

          {activeTab === "labour" && <LabourManager />}

          {activeTab === "expenses" && <ExpenseManager />}

          {/* ================= MAAL IN WITH 3 OPTIONS ================= */}
          {activeTab === "maal-in" && (
            <div className="space-y-4 p-3">

              {/* MINI TABS */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <Button
                  size="sm"
                  variant={maalSubTab === "maal-in" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setMaalSubTab("maal-in")}
                >
                  <Package className="h-4 w-4 mr-1" />
                  Maal In
                </Button>

                <Button
                  size="sm"
                  variant={maalSubTab === "feriwala" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setMaalSubTab("feriwala")}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Feriwala
                </Button>

                <Button
                  size="sm"
                  variant={maalSubTab === "kabadiwala" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setMaalSubTab("kabadiwala")}
                >
                  <Handshake className="h-4 w-4 mr-1" />
                  Kabadiwala
                </Button>
              </div>

              {maalSubTab === "maal-in" && <MaalInManager />}
              {maalSubTab === "feriwala" && <FeriwalaManager />}
              {maalSubTab === "kabadiwala" && <KabadiwalaManager />}
            </div>
          )}

          {activeTab === "settings" && <SettingsTab />}
        </div>

        {/* ================= BOTTOM NAV ================= */}
        <div className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t pb-[env(safe-area-inset-bottom)]">
          <div className="h-full flex items-center justify-around px-2">

            <button
              onClick={() => setActiveTab("labour")}
              className={`flex flex-col items-center text-xs ${
                activeTab === "labour" ? "text-emerald-600" : "text-gray-500"
              }`}
            >
              <UserSquare className="h-5 w-5" />
              Labour
            </button>

            <button
              onClick={() => setActiveTab("expenses")}
              className={`flex flex-col items-center text-xs ${
                activeTab === "expenses" ? "text-emerald-600" : "text-gray-500"
              }`}
            >
              <Receipt className="h-5 w-5" />
              Expense
            </button>

            <button
              onClick={() => {
                setActiveTab("maal-in");
                setMaalSubTab("maal-in");
              }}
              className={`flex flex-col items-center text-xs ${
                activeTab === "maal-in" ? "text-emerald-600" : "text-gray-500"
              }`}
            >
              <Package className="h-5 w-5" />
              Maal In
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center text-xs ${
                activeTab === "settings" ? "text-emerald-600" : "text-gray-500"
              }`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
