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
import { RefreshCcw, FileDown, X, Package } from "lucide-react";
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Feriwala Ledger (Owner)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Outstanding & complete transaction history
          </p>
        </div>

        <Button variant="outline" onClick={loadBalances} size="sm">
          <RefreshCcw className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Refresh</span>
        </Button>
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Search feriwala..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Mobile: CARDS */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {filteredVendors.length === 0 ? (
          <div className="text-center py-10">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No feriwala records found</p>
            <p className="text-sm text-gray-400 mt-1">Start adding vendors to track purchases</p>
          </div>
        ) : (
          filteredVendors.map((v) => (
            <Card key={v.vendor_id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-base">{v.vendor_name}</p>
                    <p className="text-xs text-gray-500">Outstanding Amount</p>
                  </div>
                  <p
                    className={`text-xl font-bold ${
                      v.balance > 0
                        ? "text-red-600"
                        : v.balance < 0
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    ₹{Number(v.balance).toLocaleString()}
                  </p>
                </div>
                <Button size="sm" className="w-full" onClick={() => loadLedger(v)}>
                  View History
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop: TABLE */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead className="text-right">Outstanding Balance</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10">
                        <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No feriwala records found</p>
                        <p className="text-sm text-gray-400 mt-1">Start adding vendors to track purchases</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors.map((v) => (
                      <TableRow key={v.vendor_id}>
                        <TableCell className="font-medium">{v.vendor_name}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`text-lg font-bold ${
                              v.balance > 0
                                ? "text-red-600"
                                : v.balance < 0
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            ₹{Number(v.balance).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => loadLedger(v)}>
                            View History
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===============================
         FLOATING LEDGER
      =============================== */}
      {activeVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-0 md:p-4">
          <Card className="w-full h-full md:h-auto md:max-w-5xl md:max-h-[85vh] flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center border-b bg-white dark:bg-gray-800 flex-shrink-0">
              <div>
                <CardTitle className="text-lg">Ledger — {activeVendor.vendor_name}</CardTitle>
                <CardDescription>Notebook view</CardDescription>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={exportCSV} size="sm" className="hidden md:flex">
                  <FileDown className="w-4 h-4 mr-1" /> Export
                </Button>
                <Button variant="outline" onClick={exportCSV} size="sm" className="md:hidden">
                  <FileDown className="w-4 h-4" />
                </Button>
                <Button variant="ghost" onClick={() => setActiveVendor(null)} size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4">
              {ledgerLoading ? (
                <p className="text-center py-6">Loading...</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
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
                        {ledger.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10">
                              <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                              <p className="text-gray-500">No transactions yet</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          ledger.map((l, i) => (
                            <TableRow key={i}>
                              <TableCell className="whitespace-nowrap">{formatDate(l.date)}</TableCell>
                              <TableCell>
                                {l.type === "purchase" ? "Maal" : "Payment"}
                              </TableCell>
                              <TableCell>
                                <pre className="whitespace-pre-wrap text-sm font-sans">
                                  {l.description}
                                </pre>
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                ₹{Number(l.amount).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-medium whitespace-nowrap">
                                ₹{Number(l.balance).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 pt-4 border-t text-right font-semibold text-lg">
                    Final Outstanding: <span className="text-red-600">₹{Number(outstanding).toLocaleString()}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
