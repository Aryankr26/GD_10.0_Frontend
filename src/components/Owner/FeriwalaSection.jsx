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

export function FeriwalaSection() {
  const company_id = "2f762c5e-5274-4a65-aa66-15a7642a1608";
  const godown_id = "fbf61954-4d32-4cb4-92ea-d0fe3be01311";

  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [activeVendor, setActiveVendor] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [outstanding, setOutstanding] = useState(0);

  /* ===============================
     LOAD BALANCES
  =============================== */
  const loadBalances = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/feriwala/balances?company_id=${company_id}&godown_id=${godown_id}`
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
     LOAD LEDGER
  =============================== */
  const loadLedger = async (vendor) => {
    try {
      setLedgerLoading(true);
      setActiveVendor(vendor);

      const res = await fetch(
        `${API_URL}/api/feriwala/ledger?company_id=${company_id}&godown_id=${godown_id}&vendor_id=${vendor.vendor_id}`
      );

      const data = await res.json();

      if (data.success) {
        setLedger(data.ledger || []);
        setOutstanding(data.outstanding || 0);
      } else toast.error(data.error);
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
    a.download = `${activeVendor.vendor_name}_ledger.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white mb-1">
            Feriwala Ledger (Owner)
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
        placeholder="Search feriwala..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* CARDS */}
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

              <Button size="sm" className="mt-3" onClick={() => loadLedger(v)}>
                View History
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===============================
         FLOATING LEDGER
      =============================== */}
      {activeVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-black/40">

        <Card className="w-full max-w-5xl max-h-[85vh] overflow-auto">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Ledger — {activeVendor.vendor_name}</CardTitle>
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
                        <TableCell>
                          {l.type === "purchase" ? "Maal" : "Payment"}
                        </TableCell>
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
