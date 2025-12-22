import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "../ui/table";

import { Button } from "../ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";

import { Calendar, RefreshCcw, Package } from "lucide-react";
import { formatDate } from "../../utils/dateFormat";
import { toast } from "sonner";

const API_URL = "https://gd-10-0-backend-1.onrender.com";

export default function MaalIn() {
  const [maalIn, setMaalIn] = useState([]);
  const [summary, setSummary] = useState({
    totalWeight: 0,
    totalAmount: 0,
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const company_id = "2f762c5e-5274-4a65-aa66-15a7642a1608";
  const godown_id = "fbf61954-4d32-4cb4-92ea-d0fe3be01311";

  /* ======================================================
        FETCH FROM BACKEND (REAL DATA)
  ====================================================== */
  const fetchMaalIn = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/maalin/list?company_id=${company_id}&godown_id=${godown_id}&date=${filterDate}`
      );

      const data = await res.json();

      if (!data.success) {
        toast.error("Failed to fetch Maal In");
        return;
      }

      const entries = data.maal_in;

      // Convert header-only response into detailed item rows
      let allItemRows = [];

      for (let entry of entries) {
        // Fetch items for each Maal In
        const resp = await fetch(`${API_URL}/api/maalin/${entry.id}`);
        const detail = await resp.json();

        if (detail.success) {
          detail.items.forEach((it) => {
            allItemRows.push({
              id: it.id,
              date: entry.date,
              material: it.material,
              weight: it.weight,
              rate: it.rate,
              amount: it.amount,
              supplier: entry.supplier_name,
              source: entry.source,
            });
          });
        }
      }

      setMaalIn(allItemRows);

      // SUMMARY
      const totalWeight = allItemRows.reduce(
        (s, i) => s + Number(i.weight || 0),
        0
      );
      const totalAmount = allItemRows.reduce(
        (s, i) => s + Number(i.amount || 0),
        0
      );

      setSummary({ totalWeight, totalAmount });
    } catch (err) {
      console.error(err);
      toast.error("Error loading Maal In");
    }
  };

  useEffect(() => {
    fetchMaalIn();
  }, [filterDate]);

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      setFilterDate(date.toISOString().split("T")[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Maal In Records (Owner)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Read-only view of all Maal In entries
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">{formatDate(filterDate)}</span>
                <span className="md:hidden">{new Date(filterDate).getDate()}</span>
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

          <Button variant="outline" onClick={fetchMaalIn} size="sm" className="hidden md:flex">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={fetchMaalIn} size="sm" className="md:hidden">
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Weight</CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-600 font-semibold text-xl">
            {summary.totalWeight} KG
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Amount</CardTitle>
          </CardHeader>
          <CardContent className="text-green-600 font-semibold text-xl">
            ₹{summary.totalAmount.toLocaleString()}
          </CardContent>
        </Card>
      </div>

      {/* Mobile: CARDS */}
      <div className="md:hidden space-y-3">
        {maalIn.length === 0 ? (
          <div className="text-center py-10">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No records found for {formatDate(filterDate)}</p>
            <p className="text-sm text-gray-400 mt-1">Select a different date or add new entries</p>
          </div>
        ) : (
          maalIn.map((item) => (
            <Card key={item.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-base">{item.material}</p>
                    <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    ₹{Number(item.amount).toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="font-medium">{item.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rate</p>
                    <p className="font-medium">₹{item.rate}/kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Supplier</p>
                    <p className="font-medium">{item.supplier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Source</p>
                    <p className="font-medium">{item.source}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop: TABLE */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Maal In Details</CardTitle>
          <CardDescription>Owner view — read only</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {maalIn.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">No records found for {formatDate(filterDate)}</p>
                      <p className="text-sm text-gray-400 mt-1">Select a different date or add new entries</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  maalIn.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(item.date)}</TableCell>
                      <TableCell className="font-medium">{item.material}</TableCell>
                      <TableCell>{item.weight} kg</TableCell>
                      <TableCell>₹{item.rate}/kg</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₹{Number(item.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.source}</TableCell>
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
