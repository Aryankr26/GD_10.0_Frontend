import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { RefreshCcw, FileDown, X } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../../utils/dateFormat";

const API_URL = "https://gd-10-0-backend-1.onrender.com";
const COMPANY_ID = "2f762c5e-5274-4a65-aa66-15a7642a1608";
const GODOWN_ID = "fbf61954-4d32-4cb4-92ea-d0fe3be01311";

export function KabadiwalaSection() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [activeVendor, setActiveVendor] = useState(null);

  const [ledger, setLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [outstanding, setOutstanding] = useState(0);

  /* ===============================
     LOAD BALANCES (ALL VENDORS)
  =============================== */
  const loadBalances = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/kabadiwala/balances?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}&date=${new Date().toISOString().split("T")[0]}`
      );
      const data = await res.json();

      if (data.success) setBalances(data.balances || []);
      else toast.error(data.error);
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     LOAD LEDGER (ONE KABADIWALA)
  =============================== */
  const loadLedger = async (vendor) => {
    try {
      setLedgerLoading(true);
      setActiveVendor(vendor);

      /* 🔁 Build ledger manually from records + payments */
      const res = await fetch(
        `${API_URL}/api/kabadiwala/owner-list?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}`
      );
      const data = await res.json();

      if (!data.success) {
        toast.error("Failed to load ledger");
        return;
      }

      // filter this vendor
      const rows = data.entries.filter(
        (e) => e.kabadi_name === vendor.vendor_name
      );

      let running = 0;

      const ledgerRows = rows.map((r) => {
        running += Number(r.amount);
        return {
          date: r.date,
          type: "purchase",
          description: `${r.material} (${r.weight}kg × ₹${r.rate})`,
          amount: r.amount,
          balance: running,
        };
      });

      setLedger(ledgerRows);
      setOutstanding(running);

    } catch {
      toast.error("Server error");
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, []);

  /* ===============================
     SEARCH
  =============================== */
  const filteredVendors = useMemo(() => {
    return balances.filter((b) =>
      (b.vendor_name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [balances, search]);

  /* ===============================
     EXPORT CSV
  =============================== */
  const exportCSV = () => {
    if (!ledger.length || !activeVendor) return;

    const rows = [
      ["Date", "Type", "Description", "Amount", "Balance"],
      ...ledger.map((l) => [
        formatDate(l.date),
        l.type,
        l.description.replace(/\n/g, " | "),
        l.amount,
        l.balance,
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeVendor.vendor_name}_kabadiwala_ledger.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white mb-1">
            Kabadiwala Ledger (Owner)
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Outstanding & complete transaction history
          </p>
        </div>

        <Button variant="outline" onClick={loadBalances}>
          <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Search kabadiwala..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* VENDOR CARDS */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredVendors.map((v) => (
            <Card key={v.vendor_id}>
              <CardHeader>
                <CardTitle className="text-base">{v.vendor_name}</CardTitle>
                <CardDescription>Outstanding</CardDescription>
              </CardHeader>

              <CardContent>
                <p
                  className={`text-2xl font-bold ${
                    v.balance > 0
                      ? "text-red-600"
                      : v.balance < 0
                      ? "text-green-600"
                      : ""
                  }`}
                >
                  ₹{Number(v.balance).toLocaleString()}
                </p>

                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => loadLedger(v)}
                >
                  View History
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ===============================
         FLOATING LEDGER (MODAL)
      =============================== */}
      {activeVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-black/40">

          <Card className="w-full max-w-5xl max-h-[85vh] overflow-auto">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>
                  Ledger — {activeVendor.vendor_name}
                </CardTitle>
                <CardDescription>Notebook view</CardDescription>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={exportCSV}>
                  <FileDown className="w-4 h-4 mr-1" /> Export
                </Button>
                <Button variant="ghost" onClick={() => setActiveVendor(null)}>
                  <X />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {ledgerLoading ? (
                <p className="text-center py-6">Loading...</p>
              ) : ledger.length === 0 ? (
                <p className="text-center py-6 text-gray-500">
                  No transactions
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {ledger.map((l, i) => (
                      <TableRow key={i}>
                        <TableCell>{formatDate(l.date)}</TableCell>
                        <TableCell>Maal</TableCell>
                        <TableCell>
                          <pre className="whitespace-pre-wrap text-sm">
                            {l.description}
                          </pre>
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{Number(l.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{Number(l.balance).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <div className="mt-4 text-right font-semibold">
                Final Outstanding: ₹{Number(outstanding).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default KabadiwalaSection;
