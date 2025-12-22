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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Daily Data Book
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Notebook-style daily expense register
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">{filterDate === todayISO ? "Today" : formatDate(filterDate)}</span>
                <span className="md:hidden">{filterDate === todayISO ? "Today" : new Date(filterDate).getDate()}</span>
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

          <Button onClick={fetchExpenses} variant="outline" size="sm" className="hidden md:flex">
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={fetchExpenses} variant="outline" size="sm" className="md:hidden">
            <RefreshCcw className="w-4 h-4" />
          </Button>

          <Button className="bg-green-600 hidden md:flex" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button className="bg-green-600 md:hidden" size="sm">
            <Download className="w-4 h-4" />
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

            <CardContent className="pt-4">
              {loading ? (
                <p className="text-center py-10">Loading page…</p>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="md:hidden space-y-3">
                    {expenses.length > 0 ? (
                      expenses.map((e) => (
                        <Card key={e.id} className="border-l-4 border-l-red-400">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-base">{e.category}</p>
                                <p className="text-sm text-gray-600 mt-1">{e.description}</p>
                              </div>
                              <p className="text-lg font-bold text-red-600 ml-2">
                                ₹{Number(e.amount).toLocaleString()}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mt-3 pt-2 border-t">
                              <div>
                                <p className="text-xs text-gray-500">Paid To</p>
                                <p className="font-medium">{e.paid_to}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Mode</p>
                                <p className="font-medium">{e.payment_mode}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500">Entered By</p>
                                <p className="font-medium">{e.created_by_name || "Manager"}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3 pt-2 border-t">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingExpense(e);
                                  setEditOpen(true);
                                }}
                                className="flex-1"
                              >
                                <Edit className="w-4 h-4 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(e.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No entries for this day</p>
                        <p className="text-sm text-gray-400 mt-1">Start adding expenses to track daily spending</p>
                      </div>
                    )}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block overflow-x-auto">
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
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
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
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-10">
                              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                              <p className="text-gray-500">No entries for this day</p>
                              <p className="text-sm text-gray-400 mt-1">Start adding expenses to track daily spending</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="sticky top-0 bg-white dark:bg-gray-800 pb-3 border-b">
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-1">
            {editingExpense && (
              <div className="space-y-4 py-3">
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
          </div>

          <DialogFooter className="sticky bottom-0 bg-white dark:bg-gray-800 pt-3 border-t gap-2">
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
