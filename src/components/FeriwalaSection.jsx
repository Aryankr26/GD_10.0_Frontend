import React, { useState, useEffect } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../utils/dateFormat";

const API_URL = "https://gd-7-0-a.onrender.com";

export function FeriwalaSection() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const [balances, setBalances] = useState([]);

  const company_id = "2f762c5e-5274-4a65-aa66-15a7642a1608";
  const godown_id = "fbf61954-4d32-4cb4-92ea-d0fe3be01311";

  /* ================================
      FETCH PURCHASE RECORDS
  ================================ */
  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/feriwala/list?company_id=${company_id}&godown_id=${godown_id}`
      );

      const data = await res.json();

      if (data.success) {
        setRecords(data.records || []);
      } else {
        toast.error(data.error || "Failed to load records");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
      FETCH BALANCES
  ================================ */
  const loadBalances = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/feriwala/balances?company_id=${company_id}&godown_id=${godown_id}&date=${selectedDate}`
      );

      const data = await res.json();

      if (data.success) {
        setBalances(data.balances || []);
      } else {
        toast.error(data.error || "Failed to load balances");
      }
    } catch (err) {
      toast.error("Server error while fetching balances");
    }
  };

  useEffect(() => {
    loadRecords();
    loadBalances();
  }, []);

  useEffect(() => {
    loadBalances();
  }, [selectedDate]);

  /* ================================
      FILTER DATA BY SELECTED DATE
  ================================ */
 const format = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-CA");
};

const filtered = records.filter((r) => {
  const recordDate = new Date(r.date).toLocaleDateString("en-CA")
;
  return recordDate === selectedDate;
});

  /* ================================
      SUMMARY VALUES
  ================================ */
  const totalAmount = filtered.reduce(
    (sum, r) => sum + Number(r.total_amount || 0),
    0
  );

  const totalWeight = filtered.reduce((sum, r) => {
    if (!r.scraps) return sum;
    return (
      sum +
      r.scraps.reduce((w, item) => w + Number(item.weight || 0), 0)
    );
  }, 0);

  return (
    <div className="space-y-8">

      {/* ===================== HEADER ===================== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white mb-1">
            Feriwala Purchases
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            All purchases recorded (read-only)
          </p>
        </div>

        <Button variant="outline" onClick={() => { loadRecords(); loadBalances(); }}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* ===================== DATE FILTER ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>View records and balances</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="w-full md:w-1/3">
            <label className="text-sm">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ===================== BALANCE SECTION ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Feriwala Balances — {formatDate(selectedDate)}</CardTitle>
          <CardDescription>
            Green = Take money | Red = Give money
          </CardDescription>
        </CardHeader>

        <CardContent>
          {balances.length === 0 ? (
            <p className="text-gray-500 text-center">No balances found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {balances.map((b) => (
                <div
                  key={b.vendor_id}
                  className="border p-4 rounded-lg shadow-sm"
                >
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{filtered.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Weight (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalWeight.toFixed(2)} kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Value (₹)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              ₹{totalAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ===================== DATA TABLE ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Records</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Feriwala</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No data for selected date
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) =>
                    r.scraps.map((s, i) => (
                      <TableRow key={`${r.id}-${i}`}>
                        {i === 0 && (
                          <>
                            <TableCell rowSpan={r.scraps.length}>{formatDate(r.date)}</TableCell>
                            <TableCell rowSpan={r.scraps.length}>{r.vendor_name}</TableCell>
                          </>
                        )}

                        <TableCell>{s.material_name}</TableCell>
                        <TableCell>{s.weight} kg</TableCell>
                        <TableCell>₹{s.rate}</TableCell>
                        <TableCell>₹{s.amount}</TableCell>

                        {i === 0 && (
                          <TableCell rowSpan={r.scraps.length}>
                            <strong>₹{Number(r.total_amount).toLocaleString()}</strong>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
