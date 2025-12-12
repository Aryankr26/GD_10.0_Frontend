import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, RefreshCcw, User, Truck, FileSpreadsheet } from "lucide-react";
import { formatINR } from "../utils/currencyFormat";
import { toast } from "sonner";
import { OwnerReadOnlyBadge } from "./OwnerBadge";

export function LabourSection() {
  const API_URL = "https://gd-7-0-a.onrender.com";
  const COMPANY_ID = "2f762c5e-5274-4a65-aa66-15a7642a1608";
  const GODOWN_ID = "fbf61954-4d32-4cb4-92ea-d0fe3be01311";

  const [activeTab, setActiveTab] = useState("labour");
  const [labours, setLabours] = useState([]);
  const [salarySummary, setSalarySummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: "",
    contact: "",
    role: "",
    worker_type: "Labour",
    daily_wage: 0,
    monthly_salary: 0,
    per_kg_rate: 0,
  });

  // Fetch all workers
  const fetchLabours = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/labour/all?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}`
      );
      const data = await res.json();
      if (res.ok && data.success) setLabours(data.labour || []);
      else toast.error(data.error || "Failed to fetch workers");
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch lifetime salary summary (owner)
  const fetchSalarySummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await fetch(
        `${API_URL}/api/labour/salary/summary?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}`
      );
      const data = await res.json();
      if (res.ok && data.success) setSalarySummary(data.summary || []);
      else toast.error(data.error || "Failed to load summary");
    } catch (err) {
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

  // Add worker
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
      } else {
        toast.error(data.error || "Failed to add worker");
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  // Delete worker
  const handleDeleteWorker = async (workerId) => {
    if (!workerId) return;
    if (!window.confirm("Delete this worker? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${API_URL}/api/labour/${workerId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Worker deleted");
        fetchLabours();
        // also refresh summary if visible
        setReloadKey((k) => k + 1);
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  const labourWorkers = (labours || []).filter((w) => w.worker_type === "Labour");
  const contractors = (labours || []).filter((w) => w.worker_type === "Contractor");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white mb-1">Labour & Contractor Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage workers and review lifetime salary summary</p>
        </div>

        <div className="flex items-center gap-3">
          <OwnerReadOnlyBadge />
          <Button onClick={fetchLabours} variant="outline" className="gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-3 w-auto">
            <TabsTrigger value="labour"><User className="w-4 h-4 mr-1" />Labours</TabsTrigger>
            <TabsTrigger value="contractor"><Truck className="w-4 h-4 mr-1" />Contractors</TabsTrigger>
            <TabsTrigger value="summary"><FileSpreadsheet className="w-4 h-4 mr-1" />Salary Summary</TabsTrigger>
          </TabsList>

          {/* Add worker dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-1" /> Add Worker</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Worker</DialogTitle></DialogHeader>

              <div className="space-y-3 py-2">
                <div>
                  <Label>Type</Label>
                  <Select value={newWorker.worker_type} onValueChange={(val) => setNewWorker({ ...newWorker, worker_type: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Labour">Labour</SelectItem>
                      <SelectItem value="Contractor">Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div><Label>Name *</Label><Input value={newWorker.name} onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })} /></div>
                <div><Label>Contact *</Label><Input value={newWorker.contact} onChange={(e) => setNewWorker({ ...newWorker, contact: e.target.value })} /></div>
                <div><Label>Role</Label><Input value={newWorker.role} onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })} /></div>

                {newWorker.worker_type === "Labour" ? (
                  <>
                    <div><Label>Daily Wage (₹)</Label><Input type="number" value={newWorker.daily_wage} onChange={(e) => setNewWorker({ ...newWorker, daily_wage: parseFloat(e.target.value) || 0 })} /></div>
                    <div><Label>Monthly Salary (₹)</Label><Input type="number" value={newWorker.monthly_salary} onChange={(e) => setNewWorker({ ...newWorker, monthly_salary: parseFloat(e.target.value) || 0 })} /></div>
                  </>
                ) : (
                  <div><Label>Per Kg Rate (₹)</Label><Input type="number" value={newWorker.per_kg_rate} onChange={(e) => setNewWorker({ ...newWorker, per_kg_rate: parseFloat(e.target.value) || 0 })} /></div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddWorker}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Labour list */}
        <TabsContent value="labour">
          <Card>
            <CardHeader><CardTitle>Labour Workers</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4 text-gray-500">Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Daily Wage</TableHead>
                      <TableHead>Monthly Salary</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {labourWorkers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No labours</TableCell>
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
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteWorker(w.id)}>
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contractors */}
        <TabsContent value="contractor">
          <Card>
            <CardHeader><CardTitle>Contractors</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Per Kg Rate</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {contractors.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center">No contractors</TableCell></TableRow>
                  ) : (
                    contractors.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.contact}</TableCell>
                        <TableCell>{c.role}</TableCell>
                        <TableCell>{formatINR(c.per_kg_rate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary summary */}
        <TabsContent value="summary">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Lifetime Salary Summary</CardTitle>
                <CardDescription>Calculated from joining date → today (auto attendance & payments)</CardDescription>
              </div>

              <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)} className="flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" /> Refresh
              </Button>
            </CardHeader>

            <CardContent>
              {summaryLoading ? (
                <p className="text-center py-6">Loading summary...</p>
              ) : salarySummary.length === 0 ? (
                <p className="text-center py-6 text-gray-500">No summary data available</p>
              ) : (
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
                    {salarySummary.map((row) => (
                      <TableRow key={row.labour_id}>
                        <TableCell>{row.labour_name}</TableCell>
                        <TableCell>{new Date(row.joining_date).toLocaleDateString()}</TableCell>
                        <TableCell>{row.present_days}</TableCell>
                        <TableCell>{formatINR(row.total_earned)}</TableCell>
                        <TableCell>{formatINR(row.total_paid)}</TableCell>
                        <TableCell className={row.net_balance >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatINR(row.net_balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
