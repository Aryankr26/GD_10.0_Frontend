import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Plus,
  RefreshCcw,
  User,
  Users,
  Truck,
  FileSpreadsheet,
  Edit,
  Trash2,
} from "lucide-react";
import { formatINR } from "../../utils/currencyFormat";
import { toast } from "sonner";
import { OwnerReadOnlyBadge } from "./OwnerBadge";

export function LabourSection() {
  const API_URL = "https://gd-10-0-backend-1.onrender.com";
  const COMPANY_ID = "2f762c5e-5274-4a65-aa66-15a7642a1608";
  const GODOWN_ID = "fbf61954-4d32-4cb4-92ea-d0fe3be01311";

  const [activeTab, setActiveTab] = useState("labour");
  const [labours, setLabours] = useState([]);
  const [salarySummary, setSalarySummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);

  const [newWorker, setNewWorker] = useState({
    name: "",
    contact: "",
    role: "",
    worker_type: "Labour",
    daily_wage: 0,
    monthly_salary: 0,
    per_kg_rate: 0,
  });

  /* ================= FETCH ================= */

  const fetchLabours = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/labour/all?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}`
      );
      const data = await res.json();
      if (res.ok && data.success) setLabours(data.labour || []);
      else toast.error(data.error || "Failed to fetch workers");
    } catch {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSalarySummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await fetch(
        `${API_URL}/api/labour/salary/summary?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}`
      );
      const data = await res.json();
      if (res.ok && data.success) setSalarySummary(data.summary || []);
      else toast.error(data.error || "Failed to load summary");
    } catch {
      toast.error("Error loading summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchLabours();
  }, []);

  useEffect(() => {
    if (activeTab === "summary") fetchSalarySummary();
  }, [activeTab, reloadKey]);

  /* ================= ADD ================= */

  const handleAddWorker = async () => {
    if (!newWorker.name || !newWorker.contact) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/labour/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: COMPANY_ID,
          godown_id: GODOWN_ID,
          ...newWorker,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Worker added");
        setIsAddDialogOpen(false);
        setNewWorker({
          name: "",
          contact: "",
          role: "",
          worker_type: "Labour",
          daily_wage: 0,
          monthly_salary: 0,
          per_kg_rate: 0,
        });
        fetchLabours();
      } else toast.error(data.error || "Failed to add worker");
    } catch {
      toast.error("Connection error");
    }
  };

  /* ================= EDIT / DELETE ================= */

  const openEditWorker = (worker) => {
    setEditingWorker({ ...worker });
    setEditOpen(true);
  };

  const handleUpdateWorker = async () => {
    try {
      const res = await fetch(`${API_URL}/api/labour/${editingWorker.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: COMPANY_ID,
          godown_id: GODOWN_ID,
          ...editingWorker,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Worker updated");
        setEditOpen(false);
        fetchLabours();
        setReloadKey((k) => k + 1);
      } else toast.error(data.error || "Update failed");
    } catch {
      toast.error("Connection error");
    }
  };

  const handleDeleteWorker = async () => {
    if (!window.confirm("Delete this worker? This cannot be undone.")) return;

    try {
      const res = await fetch(
        `${API_URL}/api/labour/${editingWorker.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Worker deleted");
        setEditOpen(false);
        fetchLabours();
        setReloadKey((k) => k + 1);
      } else toast.error(data.error || "Delete failed");
    } catch {
      toast.error("Connection error");
    }
  };

  /* ================= FILTER ================= */

  const labourWorkers = labours.filter((w) => w.worker_type === "Labour");
  const contractors = labours.filter((w) => w.worker_type === "Contractor");

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Labour & Contractor Register
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Notebook-style labour records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <OwnerReadOnlyBadge />
          <Button onClick={fetchLabours} variant="outline" size="sm" className="hidden md:flex">
            <RefreshCcw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button onClick={fetchLabours} variant="outline" size="sm" className="md:hidden">
            <RefreshCcw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 md:mr-1" />
            <span className="hidden md:inline">Add Worker</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-max mb-4">
          <TabsTrigger value="labour"><User className="w-4 h-4 mr-1" />Labours</TabsTrigger>
          <TabsTrigger value="contractor"><Truck className="w-4 h-4 mr-1" />Contractors</TabsTrigger>
          <TabsTrigger value="summary"><FileSpreadsheet className="w-4 h-4 mr-1" />Salary Summary</TabsTrigger>
        </TabsList>

        {/* NOTEBOOK PAGE */}
        <Card className="bg-[#fdfdfb] dark:bg-gray-900 border-l-4 border-red-300 shadow-md">
          <CardHeader className="border-b bg-white dark:bg-gray-800">
            <CardTitle>
              {activeTab === "labour" && "Labour Register"}
              {activeTab === "contractor" && "Contractor Register"}
              {activeTab === "summary" && "Salary Summary Register"}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4">
            {/* LABOUR */}
            <TabsContent value="labour">
              {/* Mobile: Cards */}
              <div className="md:hidden space-y-3">
                {labourWorkers.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No labours added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add a worker to get started</p>
                  </div>
                ) : (
                  labourWorkers.map((w) => (
                    <Card key={w.id} className="border-l-4 border-l-emerald-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-base">{w.name}</p>
                            <p className="text-sm text-gray-500">{w.contact}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => openEditWorker(w)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Role</p>
                            <p className="font-medium">{w.role || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Daily Wage</p>
                            <p className="font-semibold text-emerald-600">{formatINR(w.daily_wage)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Monthly Salary</p>
                            <p className="font-semibold text-emerald-600">{formatINR(w.monthly_salary)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Desktop: Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Daily Wage</TableHead>
                      <TableHead>Monthly Salary</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labourWorkers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-500">No labours added yet</p>
                          <p className="text-sm text-gray-400 mt-1">Add a worker to get started</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      labourWorkers.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell>{w.name}</TableCell>
                          <TableCell>{w.contact}</TableCell>
                          <TableCell>{w.role}</TableCell>
                          <TableCell>{formatINR(w.daily_wage)}</TableCell>
                          <TableCell>{formatINR(w.monthly_salary)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => openEditWorker(w)}>
                              <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* CONTRACTOR */}
            <TabsContent value="contractor">
              {/* Mobile: Cards */}
              <div className="md:hidden space-y-3">
                {contractors.length === 0 ? (
                  <div className="text-center py-10">
                    <Truck className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No contractors added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add a contractor to get started</p>
                  </div>
                ) : (
                  contractors.map((c) => (
                    <Card key={c.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-base">{c.name}</p>
                            <p className="text-sm text-gray-500">{c.contact}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => openEditWorker(c)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Role</p>
                            <p className="font-medium">{c.role || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Per Kg Rate</p>
                            <p className="font-semibold text-blue-600">{formatINR(c.per_kg_rate)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Desktop: Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Per Kg Rate</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          <Truck className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-500">No contractors added yet</p>
                          <p className="text-sm text-gray-400 mt-1">Add a contractor to get started</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      contractors.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.name}</TableCell>
                          <TableCell>{c.contact}</TableCell>
                          <TableCell>{c.role}</TableCell>
                          <TableCell>{formatINR(c.per_kg_rate)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => openEditWorker(c)}>
                              <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* SUMMARY */}
            <TabsContent value="summary">
              {summaryLoading ? (
                <p className="text-center py-10">Loading…</p>
              ) : (
                <>
                  {/* Mobile: Summary Cards */}
                  <div className="md:hidden space-y-3">
                    {salarySummary.length === 0 ? (
                      <div className="text-center py-10">
                        <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No salary records yet</p>
                        <p className="text-sm text-gray-400 mt-1">Records will appear after attendance</p>
                      </div>
                    ) : (
                      salarySummary.map((r) => (
                        <Card key={r.labour_id} className="border-l-4 border-l-purple-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold text-base">{r.labour_name}</p>
                                <p className="text-xs text-gray-500">
                                  Joined: {new Date(r.joining_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Days</p>
                                <p className="font-semibold text-lg">{r.present_days}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm border-t pt-2">
                              <div>
                                <p className="text-xs text-gray-500">Total Earned</p>
                                <p className="font-medium text-blue-600">{formatINR(r.total_earned)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Total Paid</p>
                                <p className="font-medium text-green-600">{formatINR(r.total_paid)}</p>
                              </div>
                              <div className="col-span-2 mt-2 pt-2 border-t">
                                <p className="text-xs text-gray-500">Remaining Amount</p>
                                <p className={`text-xl font-bold ${r.net_balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {formatINR(r.net_balance)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Joining Date</TableHead>
                          <TableHead>Present Days</TableHead>
                          <TableHead>Total Earned</TableHead>
                          <TableHead>Total Paid</TableHead>
                          <TableHead>Remaining</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salarySummary.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-10">
                              <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                              <p className="text-gray-500">No salary records yet</p>
                              <p className="text-sm text-gray-400 mt-1">Records will appear after attendance</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          salarySummary.map((r) => (
                            <TableRow key={r.labour_id}>
                              <TableCell>{r.labour_name}</TableCell>
                              <TableCell>{new Date(r.joining_date).toLocaleDateString()}</TableCell>
                              <TableCell>{r.present_days}</TableCell>
                              <TableCell>{formatINR(r.total_earned)}</TableCell>
                              <TableCell>{formatINR(r.total_paid)}</TableCell>
                              <TableCell className={r.net_balance >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                {formatINR(r.net_balance)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* EDIT DIALOG (UNCHANGED LOGIC) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="sticky top-0 bg-white dark:bg-gray-800 pb-3 border-b">
            <DialogTitle>Edit Worker</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-1">
            {editingWorker && (
              <div className="space-y-3 py-3">
                <div>
                  <Label>Name</Label>
                  <Input value={editingWorker.name} onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })} />
                </div>

                <div>
                  <Label>Contact</Label>
                  <Input value={editingWorker.contact} onChange={(e) => setEditingWorker({ ...editingWorker, contact: e.target.value })} />
                </div>

                <div>
                  <Label>Role</Label>
                  <Input value={editingWorker.role} onChange={(e) => setEditingWorker({ ...editingWorker, role: e.target.value })} />
                </div>

                {editingWorker.worker_type === "Labour" ? (
                  <>
                    <div>
                      <Label>Daily Wage</Label>
                      <Input type="number" value={editingWorker.daily_wage} onChange={(e) => setEditingWorker({ ...editingWorker, daily_wage: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Monthly Salary</Label>
                      <Input type="number" value={editingWorker.monthly_salary} onChange={(e) => setEditingWorker({ ...editingWorker, monthly_salary: Number(e.target.value) })} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Per Kg Rate</Label>
                      <Input type="number" value={editingWorker.per_kg_rate} onChange={(e) => setEditingWorker({ ...editingWorker, per_kg_rate: Number(e.target.value) })} />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="sticky bottom-0 bg-white dark:bg-gray-800 pt-3 border-t flex flex-col md:flex-row md:justify-between gap-2">
            <Button variant="destructive" onClick={handleDeleteWorker}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
            <Button onClick={handleUpdateWorker}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD WORKER DIALOG */}
<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
  <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
    <DialogHeader className="sticky top-0 bg-white dark:bg-gray-800 pb-3 border-b">
      <DialogTitle>Add Worker</DialogTitle>
    </DialogHeader>

    <div className="overflow-y-auto flex-1 px-1">
      <div className="space-y-3 py-3">
        <div>
          <Label>Worker Type</Label>
          <Select
            value={newWorker.worker_type}
            onValueChange={(val) =>
              setNewWorker({ ...newWorker, worker_type: val })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Labour">Labour</SelectItem>
              <SelectItem value="Contractor">Contractor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Name *</Label>
          <Input
            value={newWorker.name}
            onChange={(e) =>
              setNewWorker({ ...newWorker, name: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Contact *</Label>
          <Input
            value={newWorker.contact}
            onChange={(e) =>
              setNewWorker({ ...newWorker, contact: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Role</Label>
          <Input
            value={newWorker.role}
            onChange={(e) =>
              setNewWorker({ ...newWorker, role: e.target.value })
            }
          />
        </div>

        {newWorker.worker_type === "Labour" ? (
          <>
            <div>
              <Label>Daily Wage (₹)</Label>
              <Input
                type="number"
                value={newWorker.daily_wage}
                onChange={(e) =>
                  setNewWorker({
                    ...newWorker,
                    daily_wage: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <Label>Monthly Salary (₹)</Label>
              <Input
                type="number"
                value={newWorker.monthly_salary}
                onChange={(e) =>
                  setNewWorker({
                    ...newWorker,
                    monthly_salary: Number(e.target.value),
                  })
                }
              />
            </div>
          </>
        ) : (
          <div>
            <Label>Per Kg Rate (₹)</Label>
            <Input
              type="number"
              value={newWorker.per_kg_rate}
              onChange={(e) =>
                setNewWorker({
                  ...newWorker,
                  per_kg_rate: Number(e.target.value),
                })
              }
            />
          </div>
        )}
      </div>
    </div>

    <DialogFooter className="sticky bottom-0 bg-white dark:bg-gray-800 pt-3 border-t gap-2">
      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleAddWorker}>
        Add Worker
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
}
