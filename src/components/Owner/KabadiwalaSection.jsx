import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription
} from "../ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../ui/table";
import { Button } from "../ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Calendar, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../../utils/dateFormat";

const API_URL = "https://gd-10-0-backend-1.onrender.com";
const COMPANY_ID = "2f762c5e-5274-4a65-aa66-15a7642a1608";
const GODOWN_ID = "fbf61954-4d32-4cb4-92ea-d0fe3be01311";

export function KabadiwalaSection() {
  const [entries, setEntries] = useState([]);
  const [balances, setBalances] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [summary, setSummary] = useState({
    totalWeight: 0,
    totalAmount: 0,
    paid: 0,
    pending: 0,
  });

  /* =====================================================
        FETCH OWNER LIST (SCRAP ITEMS)
  ===================================================== */
  const fetchEntries = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/kabadiwala/owner-list?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}&date=${filterDate}`
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const list = data.entries || [];
      setEntries(list);

      const totalWeight = list.reduce((s, i) => s + Number(i.weight || 0), 0);
      const totalAmount = list.reduce((s, i) => s + Number(i.amount || 0), 0);

      const paid = list
        .filter((e) => e.payment_status === "paid")
        .reduce((s, e) => s + Number(e.amount || 0), 0);

      const pending = totalAmount - paid;

      setSummary({ totalWeight, totalAmount, paid, pending });

    } catch (err) {
      console.error(err);
      toast.error("Failed to load Kabadiwala records");
    }
  };

  /* =====================================================
        FETCH BALANCES (NEW)
  ===================================================== */
  const fetchBalances = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/kabadiwala/balances?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}&date=${filterDate}`
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setBalances(data.balances || []);

    } catch (err) {
      toast.error("Failed to load balances");
    }
  };

  /* =====================================================
        INIT + DATE CHANGE
  ===================================================== */
  useEffect(() => {
    fetchEntries();
    fetchBalances();
  }, [filterDate]);

  const handleDateSelect = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setFilterDate(date.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-8">

      {/* ===================== HEADER ===================== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white mb-1">
            Kabadiwala Purchases (Owner View)
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Read-only view of all kabadiwala transactions
          </p>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(filterDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={() => { fetchEntries(); fetchBalances(); }}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* ===================== BALANCES ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Kabadiwala Balance — {formatDate(filterDate)}</CardTitle>
          <CardDescription>
            Green = Take Money | Red = Give Money
          </CardDescription>
        </CardHeader>

        <CardContent>
          {balances.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No balance records found
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {balances.map((b) => (
                <div key={b.vendor_id} className="border p-4 rounded-lg shadow-sm">
                  <p className="text-sm font-medium">{b.vendor_name}</p>

                  <p
                    className={`text-xl font-bold mt-1 ${
                      b.balance > 0 
                        ? "text-green-600"
                        : b.balance < 0 
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    ₹{Number(b.balance).toLocaleString()}
                  </p>

                  <p className="text-xs text-gray-500">
                    {b.balance > 0
                      ? "Take Money"
                      : b.balance < 0
                      ? "Give Money"
                      : "Settled"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===================== SUMMARY ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Weight</CardTitle></CardHeader>
          <CardContent className="text-blue-600 text-2xl font-semibold">
            {summary.totalWeight} KG
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Total Amount</CardTitle></CardHeader>
          <CardContent className="text-green-600 text-2xl font-semibold">
            ₹{summary.totalAmount.toLocaleString()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Paid</CardTitle></CardHeader>
          <CardContent className="text-green-700 text-2xl font-semibold">
            ₹{summary.paid.toLocaleString()}
          </CardContent>
        </Card>

       {/* <Card>
          <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent className="text-orange-600 text-2xl font-semibold">
            ₹{summary.pending.toLocaleString()}
          </CardContent>
        </Card>*/}
      </div>

      {/* ===================== SCRAP TABLE ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Kabadiwala Scrap Items</CardTitle>
          <CardDescription>Each row = one material entry</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Kabadiwala</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{formatDate(e.date)}</TableCell>
                      <TableCell>{e.kabadi_name}</TableCell>
                      <TableCell>{e.material}</TableCell>
                      <TableCell>{e.weight} KG</TableCell>
                      <TableCell>₹{e.rate}</TableCell>
                      <TableCell className="font-semibold text-green-600">₹{e.amount}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            e.payment_status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {e.payment_status.toUpperCase()}
                        </span>
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
  );
}

export default KabadiwalaSection;
