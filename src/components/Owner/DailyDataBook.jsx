import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Calendar,
  Download,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from "lucide-react";
import { formatDate, getTodayISO } from "../../utils/dateFormat";
import { toast } from "sonner";

export function DailyDataBook() {
  const todayISO = getTodayISO();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterDate, setFilterDate] = useState(todayISO);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slideDir, setSlideDir] = useState("right");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const API_URL = "https://gd-10-0-backend-1.onrender.com";
  const COMPANY_ID = "2f762c5e-5274-4a65-aa66-15a7642a1608";
  const GODOWN_ID = "fbf61954-4d32-4cb4-92ea-d0fe3be01311";

  /* ================= FETCH ================= */

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/expenses/list?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}&date=${filterDate}`
      );
      const data = await res.json();
      if (data.success) setExpenses(data.expenses || []);
      else toast.error("Failed to fetch expenses");
    } catch {
      toast.error("Error fetching expenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/expenses/summary?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}&start_date=${filterDate}&end_date=${filterDate}`
      );
      const data = await res.json();
      if (data.success) setSummary(data.summary);
    } catch {}
  };

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, [filterDate]);

  /* ================= DATE NAV ================= */

  const goToDate = (date, dir) => {
    setSlideDir(dir);
    setSelectedDate(date);
    setFilterDate(date.toLocaleDateString("en-CA"));
  };

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    goToDate(d, "left");
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    goToDate(d, "right");
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      const res = await fetch(`${API_URL}/api/expenses/delete/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Expense deleted");
        fetchExpenses();
        fetchSummary();
      } else toast.error("Delete failed");
    } catch {
      toast.error("Delete error");
    }
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/expenses/update/${editingExpense.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingExpense),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error();
      toast.success("Expense updated");
      setEditOpen(false);
      fetchExpenses();
      fetchSummary();
    } catch {
      toast.error("Update failed");
    }
  };

  const totalExpense = Number(summary?.total_amount || 0);

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white mb-1">
            Daily Data Book
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Notebook-style daily expense register
          </p>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                {filterDate === todayISO ? "Today" : formatDate(filterDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && goToDate(d, "right")}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={fetchExpenses} variant="outline">
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>

          <Button className="bg-green-600">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* NOTEBOOK */}
      <div className="relative overflow-hidden">
        <button
          onClick={prevDay}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={nextDay}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2"
        >
          <ChevronRight />
        </button>

        <div
          className={`transition-transform duration-300 ${
            slideDir === "left" ? "-translate-x-2" : "translate-x-2"
          }`}
        >
          <Card className="bg-[#fdfdfb] border-l-4 border-red-300 shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="flex justify-between">
                <span>{formatDate(filterDate)}</span>
                <span className="text-red-600">
                  Total ₹{totalExpense.toLocaleString()}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-center py-10">Loading page…</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Paid To</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Entered By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {expenses.length > 0 ? (
                      expenses.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{e.category}</TableCell>
                          <TableCell>{e.description}</TableCell>
                          <TableCell>{e.paid_to}</TableCell>
                          <TableCell>{e.payment_mode}</TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            ₹{Number(e.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>{e.created_by_name || "Manager"}</TableCell>
                          <TableCell className="text-right flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingExpense(e);
                                setEditOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(e.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No entries for this day
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>

          {editingExpense && (
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={editingExpense.category}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, category: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={editingExpense.description}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Paid To</Label>
                <Input
                  value={editingExpense.paid_to}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, paid_to: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={editingExpense.amount}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, amount: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
