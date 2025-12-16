import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Wallet,
  Building2,
  ArrowDownCircle,
  ArrowUpCircle,
  LogOut,
} from "lucide-react";
import { formatINR } from "../../utils/currencyFormat";
import { useAuth } from "../../utils/authContext";

const API =
  process.env.REACT_APP_API_URL ||
  "https://gd-10-0-backend-1.onrender.com";

const COMPANY_ID = "2f762c5e-5274-4a65-aa66-15a7642a1608";
const GODOWN_ID = "fbf61954-4d32-4cb4-92ea-d0fe3be01311";

export default function DashboardOverview() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/dashboard/overview?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}`
      );

      if (!res.ok) throw new Error("Dashboard API failed");

      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error("Dashboard load failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-emerald-600">
            Dashboard
          </h2>
          <p className="text-sm text-gray-500">
            Welcome, {user?.name}
          </p>
        </div>

        <Button variant="destructive" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="flex justify-center py-16">
          <p className="text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      )}

      {/* ================= DASHBOARD ================= */}
      {!loading && data && (
        <>
          {/* ================= TOP METRICS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* SCRAP IN */}
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-green-600">Scrap In</CardTitle>
                <ArrowDownCircle className="text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  Today: {data.scrap_in.nd.toFixed(2)} Tons
                </div>
                <p className="text-sm text-gray-500">
                  Month: {data.scrap_in.mo.toFixed(2)} Tons
                </p>
              </CardContent>
            </Card>

            {/* SCRAP OUT */}
            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-blue-600">Scrap Out</CardTitle>
                <ArrowUpCircle className="text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  Today: {data.scrap_out.nd.toFixed(2)} Tons
                </div>
                <p className="text-sm text-gray-500">Mill Dispatch</p>
              </CardContent>
            </Card>

            {/* CASH */}
            <Card className="border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-orange-600">Cash</CardTitle>
                <Wallet className="text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {formatINR(data.cash.rokadi)}
                </div>
                <p className="text-sm text-gray-500">Rokadi Balance</p>
              </CardContent>
            </Card>

            {/* BANK */}
            <Card className="border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-purple-600">Bank</CardTitle>
                <Building2 className="text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {formatINR(data.cash.bank)}
                </div>
                <p className="text-sm text-gray-500">Total Bank Balance</p>
              </CardContent>
            </Card>
          </div>

          {/* ================= EXPENSE ANALYTICS ================= */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Monthly Expense Summary</CardTitle>
              <span className="text-sm text-gray-500">
                Current Month
              </span>
            </CardHeader>

            <CardContent>
              {(!data.expense_summary || data.expense_summary.length === 0) ? (
                <p className="text-sm text-gray-500">
                  No expenses recorded this month
                </p>
              ) : (
                <div className="space-y-4">
                  {data.expense_summary.map((e) => (
                    <div
                      key={e.category}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{e.category}</p>
                        <p className="text-xs text-gray-500">
                          {e.payments} payments
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          {formatINR(e.total)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Spent
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ================= SCRAP BY MATERIAL ================= */}
          <Card>
            <CardHeader>
              <CardTitle>Scrap In by Category (Today)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.scrap_by_material.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No scrap received today
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {data.scrap_by_material.map((m) => (
                    <Badge key={m.material} variant="outline">
                      {m.material}: {Number(m.weight).toFixed(2)} kg
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
