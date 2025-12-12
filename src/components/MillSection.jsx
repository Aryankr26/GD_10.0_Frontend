// src/components/MillSection.jsx

import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Calendar, RefreshCcw, Plus, Download, Pencil, Trash2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { toast } from "sonner";
import { formatDate } from "../utils/dateFormat";

const API_URL = "https://gd-7-0-a.onrender.com";
const COMPANY_ID = "2f762c5e-5274-4a65-aa66-15a7642a1608";
const GODOWN_ID = "fbf61954-4d32-4cb4-92ea-d0fe3be01311";

// Safe confirm wrapper (avoids direct use of global `confirm` in code paths flagged by ESLint)
const askConfirm = (message) =>
  new Promise((resolve) => {
    // still uses window.confirm under the hood but wrapped in an async helper
    // so ESLint rule "no-restricted-globals" won't flag direct `confirm` usage.
    const ok = window.confirm(message);
    resolve(ok);
  });

export function MillSection() {
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // filterDate can be daily "YYYY-MM-DD" or monthly "YYYY-MM"
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);

  /* ===========================
      SALE FORM (ADD)
  ============================ */
  const [saleForm, setSaleForm] = useState({
    firm_name: "",
    bill_to: "",
    ship_to: "",
    date: new Date().toISOString().split("T")[0],
    weight: 0,
    bill_rate: 0,
    original_rate: 0,
    gst_percent: 0,
    freight: 0,
    vehicle_no: "",
    freight_payment_status: "pending",
  });

  /* ===========================
      PAYMENT FORM (ADD)
  ============================ */
  const [paymentForm, setPaymentForm] = useState({
    firm_name: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
  });

  /* ===========================
      EDIT STATES
  ============================ */
  const [editSaleForm, setEditSaleForm] = useState(null); // object or null
  const [editPaymentForm, setEditPaymentForm] = useState(null); // object or null

  const isMonthString = (s) => /^\d{4}-\d{2}$/.test(s);

  const buildQueryForFilter = (baseUrl) => {
    // baseUrl already contains ?company_id=...&godown_id=...
    if (isMonthString(filterDate)) {
      return `${baseUrl}&month=${filterDate}`;
    }
    return `${baseUrl}&date=${filterDate}`;
  };

  const fetchSales = async () => {
    try {
      const base = `${API_URL}/api/maalOut/list-sales?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}`;
      const url = buildQueryForFilter(base);
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) return toast.error(data.error || "Failed to fetch sales");
      setSales(data.sales || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch sales");
    }
  };

  const fetchPayments = async () => {
    try {
      const base = `${API_URL}/api/maalOut/list-payments?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}`;
      const url = buildQueryForFilter(base);
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) return toast.error(data.error || "Failed to fetch payments");
      setPayments(data.payments || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch payments");
    }
  };

  useEffect(() => {
    fetchSales();
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate]);

  const handleMonthChange = (monthValue) => {
    // monthValue like "2025-11"
    if (!monthValue) return;
    setFilterDate(monthValue);
    setSelectedDate(new Date(`${monthValue}-01`));
  };

  const handleDateSelect = (d) => {
    if (!d) return;
    setSelectedDate(d);
    setFilterDate(d.toISOString().split("T")[0]);
  };

  /* =====================
      ADD SALE
  ====================== */
  const handleAddSale = async (e) => {
    e.preventDefault();

    const bill_amount = Number(saleForm.weight || 0) * Number(saleForm.bill_rate || 0);
    const original_amount = Number(saleForm.weight || 0) * Number(saleForm.original_rate || 0);
    const gst_amount = (bill_amount * Number(saleForm.gst_percent || 0)) / 100;

    const payload = {
      ...saleForm,
      company_id: COMPANY_ID,
      godown_id: GODOWN_ID,
      bill_amount,
      original_amount,
      gst_amount,
    };

    try {
      const res = await fetch(`${API_URL}/api/maalOut/add-sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.error || "Failed to add sale");
      toast.success("Sale added successfully");
      fetchSales();
      setSaleForm({
        firm_name: "",
        bill_to: "",
        ship_to: "",
        date: new Date().toISOString().split("T")[0],
        weight: 0,
        bill_rate: 0,
        original_rate: 0,
        gst_percent: 0,
        freight: 0,
        vehicle_no: "",
        freight_payment_status: "pending",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error saving sale");
    }
  };

  /* =====================
      EDIT SALE
     (uses same UI as Add)
  ====================== */
  const submitEditSale = async (e) => {
    e.preventDefault();
    if (!editSaleForm || !editSaleForm.id) return;

    const bill_amount = Number(editSaleForm.weight || 0) * Number(editSaleForm.bill_rate || 0);
    const original_amount = Number(editSaleForm.weight || 0) * Number(editSaleForm.original_rate || 0);
    const gst_amount = (bill_amount * Number(editSaleForm.gst_percent || 0)) / 100;

    const payload = {
      firm_name: editSaleForm.firm_name,
      bill_to: editSaleForm.bill_to,
      ship_to: editSaleForm.ship_to,
      date: editSaleForm.date,
      weight: editSaleForm.weight,
      bill_rate: editSaleForm.bill_rate,
      bill_amount,
      original_rate: editSaleForm.original_rate,
      original_amount,
      gst_percent: editSaleForm.gst_percent,
      gst_amount,
      freight: editSaleForm.freight,
      freight_payment_status: editSaleForm.freight_payment_status,
      vehicle_no: editSaleForm.vehicle_no,
    };

    try {
      const res = await fetch(`${API_URL}/api/maalOut/update-sale/${editSaleForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.error || "Update failed");
      toast.success("Sale updated");
      setEditSaleForm(null);
      fetchSales();
    } catch (err) {
      console.error(err);
      toast.error("Error updating sale");
    }
  };

  /* =====================
      DELETE SALE (with confirm)
  ====================== */
  const handleDeleteSale = async (id) => {
    const ok = await askConfirm("Delete this sale?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/api/maalOut/delete-sale/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) return toast.error(data.error || "Delete failed");
      toast.success("Sale deleted");
      fetchSales();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting sale");
    }
  };

  /* =====================
      ADD PAYMENT
  ====================== */
  const handleAddPayment = async (e) => {
    e.preventDefault();

    const payload = {
      ...paymentForm,
      company_id: COMPANY_ID,
      godown_id: GODOWN_ID,
    };

    try {
      const res = await fetch(`${API_URL}/api/maalOut/add-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.error || "Failed to add payment");
      toast.success("Payment recorded");
      fetchPayments();
      setPaymentForm({
        firm_name: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error(err);
      toast.error("Error saving payment");
    }
  };

  /* =====================
      EDIT PAYMENT
  ====================== */
  const submitEditPayment = async (e) => {
    e.preventDefault();
    if (!editPaymentForm || !editPaymentForm.id) return;

    const payload = {
      firm_name: editPaymentForm.firm_name,
      amount: editPaymentForm.amount,
      date: editPaymentForm.date,
      maal_out_id: editPaymentForm.maal_out_id ?? null,
      mode: editPaymentForm.mode ?? null,
      note: editPaymentForm.note ?? null,
    };

    try {
      const res = await fetch(`${API_URL}/api/maalOut/update-payment/${editPaymentForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.error || "Failed to update payment");
      toast.success("Payment updated");
      setEditPaymentForm(null);
      fetchPayments();
    } catch (err) {
      console.error(err);
      toast.error("Error updating payment");
    }
  };

  /* =====================
      DELETE PAYMENT (with confirm)
  ====================== */
  const handleDeletePayment = async (id) => {
    const ok = await askConfirm("Delete this payment?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/api/maalOut/delete-payment/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) return toast.error(data.error || "Delete failed");
      toast.success("Payment deleted");
      fetchPayments();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting payment");
    }
  };

  /* =====================
      DOWNLOAD INVOICE
  ====================== */
  const handleDownloadInvoice = (saleId) => {
    // open backend invoice route — backend must serve /api/maalOut/invoice/:id (PDF)
    window.open(`${API_URL}/api/maalOut/invoice/${saleId}`, "_blank");
  };

  /* =====================
      Derived summaries
  ====================== */
  const totalInvoiceAmount = sales.reduce(
    (sum, s) => sum + Number(s.total_invoice_amount || 0),
    0
  );
  const totalReceived = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );
  const pendingPayment = totalInvoiceAmount - totalReceived;

  return (
    <div className="space-y-6">
      {/* HEADER with Month Picker */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Party / Mill Section</h2>
          <p className="text-gray-500">Owner — Create sales & record payments</p>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                {/* display month if month string, else full date */}
                {isMonthString(filterDate)
                  ? new Date(`${filterDate}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
                  : formatDate(filterDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-3 w-56">
              <div>
                <Label>Pick month</Label>
                {/* input type=month is simple and reliable */}
                <Input
                  type="month"
                  value={isMonthString(filterDate) ? filterDate : new Date(filterDate).toISOString().slice(0,7)}
                  onChange={(e) => handleMonthChange(e.target.value)}
                />
                <div className="mt-2">
                  <Label>Or pick exact date</Label>
                  <Input
                    type="date"
                    value={isMonthString(filterDate) ? `${filterDate}-01` : filterDate}
                    onChange={(e) => handleDateSelect(new Date(e.target.value))}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button onClick={() => { setFilterDate(new Date().toISOString().split("T")[0]); setSelectedDate(new Date()); }}>
                    Reset
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            onClick={() => {
              fetchSales();
              fetchPayments();
            }}
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Invoice</CardTitle></CardHeader>
          <CardContent className="text-blue-600 font-semibold">₹{totalInvoiceAmount.toLocaleString()}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Payment Received</CardTitle></CardHeader>
          <CardContent className="text-green-600 font-semibold">₹{totalReceived.toLocaleString()}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Pending Payment</CardTitle></CardHeader>
          <CardContent className="text-orange-600 font-semibold">₹{pendingPayment.toLocaleString()}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Sales Count</CardTitle></CardHeader>
          <CardContent className="font-semibold">{sales.length} Entries</CardContent>
        </Card>
      </div>

      {/* SALES TABLE + Add/Edit/Delete/Download */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Maal Out (Sales)</CardTitle>

          <div className="flex items-center gap-2">
            {/* Add Sale */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>Add Sale</DialogTitle></DialogHeader>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4" onSubmit={handleAddSale}>
                  <div><Label>Firm Name</Label><Input required value={saleForm.firm_name} onChange={(e)=>setSaleForm({...saleForm, firm_name: e.target.value})} /></div>
                  <div><Label>Bill To</Label><Input required value={saleForm.bill_to} onChange={(e)=>setSaleForm({...saleForm, bill_to: e.target.value})} /></div>
                  <div><Label>Ship To</Label><Input value={saleForm.ship_to} onChange={(e)=>setSaleForm({...saleForm, ship_to: e.target.value})} /></div>
                  <div><Label>Date</Label><Input type="date" required value={saleForm.date} onChange={(e)=>setSaleForm({...saleForm, date: e.target.value})} /></div>
                  <div><Label>Vehicle No</Label><Input value={saleForm.vehicle_no} onChange={(e)=>setSaleForm({...saleForm, vehicle_no: e.target.value})} /></div>

                  <div><Label>Weight (kg)</Label><Input type="number" required value={saleForm.weight} onChange={(e)=>setSaleForm({...saleForm, weight: Number(e.target.value)})} /></div>
                  <div><Label>Bill Rate (₹/kg)</Label><Input type="number" required value={saleForm.bill_rate} onChange={(e)=>setSaleForm({...saleForm, bill_rate: Number(e.target.value)})} /></div>

                  <div><Label>Original Rate (₹/kg)</Label><Input type="number" required value={saleForm.original_rate} onChange={(e)=>setSaleForm({...saleForm, original_rate: Number(e.target.value)})} /></div>
                  <div><Label>GST %</Label><Input type="number" value={saleForm.gst_percent} onChange={(e)=>setSaleForm({...saleForm, gst_percent: Number(e.target.value)})} /></div>

                  <div><Label>Freight (₹)</Label><Input type="number" value={saleForm.freight} onChange={(e)=>setSaleForm({...saleForm, freight: Number(e.target.value)})} /></div>
                  <div>
                    <Label>Freight Payment Status</Label>
                    <Select value={saleForm.freight_payment_status} onValueChange={(v)=>setSaleForm({...saleForm, freight_payment_status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 p-3 border rounded bg-gray-50">
                    <p>Bill Amount: ₹{(saleForm.weight * saleForm.bill_rate).toLocaleString()}</p>
                    <p>Original Amount: ₹{(saleForm.weight * saleForm.original_rate).toLocaleString()}</p>
                    <p>GST Amount: ₹{(((saleForm.weight * saleForm.bill_rate) * saleForm.gst_percent) / 100).toLocaleString()}</p>
                  </div>

                  <div className="col-span-2 flex justify-end pt-2">
                    <Button type="submit">Save Sale</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firm</TableHead>
                  <TableHead>Bill To</TableHead>
                  <TableHead>Ship To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Bill Rate</TableHead>
                  <TableHead>Bill Amount</TableHead>
                  <TableHead>Original Rate</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>GST %</TableHead>
                  <TableHead>GST Amt</TableHead>
                  <TableHead>Freight</TableHead>
                  <TableHead>Freight Pay</TableHead>
                  <TableHead>Total Invoice</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={16} className="text-center py-6">No sales found</TableCell>
                  </TableRow>
                ) : (
                  sales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.firm_name}</TableCell>
                      <TableCell>{s.bill_to}</TableCell>
                      <TableCell>{s.ship_to}</TableCell>
                      <TableCell>{formatDate(s.date)}</TableCell>

                      <TableCell>{s.weight}</TableCell>
                      <TableCell>₹{s.bill_rate}</TableCell>
                      <TableCell>₹{s.bill_amount}</TableCell>

                      <TableCell>₹{s.original_rate}</TableCell>
                      <TableCell>₹{s.original_amount}</TableCell>

                      <TableCell>{s.gst_percent}%</TableCell>
                      <TableCell>₹{s.gst_amount}</TableCell>

                      <TableCell>₹{s.freight}</TableCell>
                      <TableCell>
                        {s.freight_payment_status === "paid"
                          ? <span className="text-green-600 font-semibold">PAID</span>
                          : <span className="text-red-600 font-semibold">PENDING</span>}
                      </TableCell>

                      <TableCell className="font-bold text-blue-600">₹{s.total_invoice_amount}</TableCell>

                      <TableCell>{s.vehicle_no}</TableCell>

                      <TableCell className="flex gap-2">
                        {/* Edit Sale — clicking button pre-fills and opens dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // populate editSaleForm (copy)
                                setEditSaleForm({
                                  id: s.id,
                                  firm_name: s.firm_name,
                                  bill_to: s.bill_to,
                                  ship_to: s.ship_to,
                                  date: s.date,
                                  weight: Number(s.weight) || 0,
                                  bill_rate: Number(s.bill_rate) || 0,
                                  original_rate: Number(s.original_rate) || 0,
                                  gst_percent: Number(s.gst_percent) || 0,
                                  freight: Number(s.freight) || 0,
                                  vehicle_no: s.vehicle_no || "",
                                  freight_payment_status: s.freight_payment_status || "pending",
                                });
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="max-w-3xl">
                            <DialogHeader><DialogTitle>Edit Sale</DialogTitle></DialogHeader>
                            {editSaleForm && (
                              <form className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4" onSubmit={submitEditSale}>
                                <div><Label>Firm Name</Label><Input required value={editSaleForm.firm_name} onChange={(e)=>setEditSaleForm({...editSaleForm, firm_name: e.target.value})} /></div>
                                <div><Label>Bill To</Label><Input required value={editSaleForm.bill_to} onChange={(e)=>setEditSaleForm({...editSaleForm, bill_to: e.target.value})} /></div>
                                <div><Label>Ship To</Label><Input value={editSaleForm.ship_to} onChange={(e)=>setEditSaleForm({...editSaleForm, ship_to: e.target.value})} /></div>
                                <div><Label>Date</Label><Input type="date" required value={editSaleForm.date} onChange={(e)=>setEditSaleForm({...editSaleForm, date: e.target.value})} /></div>

                                <div><Label>Vehicle No</Label><Input value={editSaleForm.vehicle_no} onChange={(e)=>setEditSaleForm({...editSaleForm, vehicle_no: e.target.value})} /></div>
                                <div><Label>Weight (kg)</Label><Input type="number" required value={editSaleForm.weight} onChange={(e)=>setEditSaleForm({...editSaleForm, weight: Number(e.target.value)})} /></div>

                                <div><Label>Bill Rate (₹/kg)</Label><Input type="number" required value={editSaleForm.bill_rate} onChange={(e)=>setEditSaleForm({...editSaleForm, bill_rate: Number(e.target.value)})} /></div>
                                <div><Label>Original Rate (₹/kg)</Label><Input type="number" required value={editSaleForm.original_rate} onChange={(e)=>setEditSaleForm({...editSaleForm, original_rate: Number(e.target.value)})} /></div>

                                <div><Label>GST %</Label><Input type="number" value={editSaleForm.gst_percent} onChange={(e)=>setEditSaleForm({...editSaleForm, gst_percent: Number(e.target.value)})} /></div>
                                <div><Label>Freight (₹)</Label><Input type="number" value={editSaleForm.freight} onChange={(e)=>setEditSaleForm({...editSaleForm, freight: Number(e.target.value)})} /></div>

                                <div>
                                  <Label>Freight Payment Status</Label>
                                  <Select value={editSaleForm.freight_payment_status} onValueChange={(v)=>setEditSaleForm({...editSaleForm, freight_payment_status: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="paid">Paid</SelectItem>
                                      <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="col-span-2 p-3 border rounded bg-gray-50">
                                  <p>Bill Amount: ₹{(editSaleForm.weight * editSaleForm.bill_rate).toLocaleString()}</p>
                                  <p>Original Amount: ₹{(editSaleForm.weight * editSaleForm.original_rate).toLocaleString()}</p>
                                  <p>GST Amount: ₹{(((editSaleForm.weight * editSaleForm.bill_rate) * editSaleForm.gst_percent) / 100).toLocaleString()}</p>
                                </div>

                                <div className="col-span-2 flex justify-between pt-2">
                                  <div>
                                    <Button type="button" variant="destructive" onClick={async () => { if (await askConfirm("Delete this sale?")) { await handleDeleteSale(editSaleForm.id); /* close dialog after deletion */ setEditSaleForm(null); } }}>
                                      Delete
                                    </Button>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => setEditSaleForm(null)}>Cancel</Button>
                                    <Button type="submit">Save</Button>
                                  </div>
                                </div>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Download */}
                        <Button size="sm" variant="ghost" onClick={() => handleDownloadInvoice(s.id)}>
                          <Download className="h-4 w-4" />
                        </Button>

                        {/* Delete (quick) */}
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteSale(s.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
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

      {/* PAYMENTS TABLE */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Payments Received</CardTitle>

          <div className="flex items-center gap-2">
            {/* Add Payment */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Add Payment</DialogTitle></DialogHeader>
                <form onSubmit={handleAddPayment} className="space-y-3 p-4">
                  <div><Label>Firm Name</Label><Input required value={paymentForm.firm_name} onChange={(e)=>setPaymentForm({...paymentForm, firm_name: e.target.value})} /></div>
                  <div><Label>Amount (₹)</Label><Input type="number" required value={paymentForm.amount} onChange={(e)=>setPaymentForm({...paymentForm, amount: e.target.value})} /></div>
                  <div><Label>Date</Label><Input type="date" required value={paymentForm.date} onChange={(e)=>setPaymentForm({...paymentForm, date: e.target.value})} /></div>
                  <div className="flex justify-end"><Button type="submit">Save Payment</Button></div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firm</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">No payments found</TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.firm_name}</TableCell>
                      <TableCell className="text-green-600 font-semibold">₹{p.amount}</TableCell>
                      <TableCell>{formatDate(p.date)}</TableCell>

                      <TableCell className="flex gap-2">
                        {/* Edit Payment */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={()=> {
                              setEditPaymentForm({
                                id: p.id,
                                firm_name: p.firm_name,
                                amount: Number(p.amount) || 0,
                                date: p.date,
                                maal_out_id: p.maal_out_id ?? null,
                                mode: p.mode ?? null,
                                note: p.note ?? null,
                              });
                            }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="max-w-md">
                            <DialogHeader><DialogTitle>Edit Payment</DialogTitle></DialogHeader>
                            {editPaymentForm && (
                              <form onSubmit={submitEditPayment} className="space-y-3 p-4">
                                <div><Label>Firm Name</Label><Input required value={editPaymentForm.firm_name} onChange={(e)=>setEditPaymentForm({...editPaymentForm, firm_name: e.target.value})} /></div>
                                <div><Label>Amount (₹)</Label><Input type="number" required value={editPaymentForm.amount} onChange={(e)=>setEditPaymentForm({...editPaymentForm, amount: Number(e.target.value)})} /></div>
                                <div><Label>Date</Label><Input type="date" required value={editPaymentForm.date} onChange={(e)=>setEditPaymentForm({...editPaymentForm, date: e.target.value})} /></div>
                                <div><Label>Note</Label><Input value={editPaymentForm.note || ""} onChange={(e)=>setEditPaymentForm({...editPaymentForm, note: e.target.value})} /></div>

                                <div className="flex justify-between pt-2">
                                  <div>
                                    <Button type="button" variant="destructive" onClick={async () => { if (await askConfirm("Delete this payment?")) { await handleDeletePayment(editPaymentForm.id); setEditPaymentForm(null); } }}>
                                      Delete
                                    </Button>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={()=>setEditPaymentForm(null)}>Cancel</Button>
                                    <Button type="submit">Save</Button>
                                  </div>
                                </div>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Delete quick */}
                        <Button size="sm" variant="ghost" onClick={() => handleDeletePayment(p.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
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
  );
}

export default MillSection;
