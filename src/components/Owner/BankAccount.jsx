import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Download } from "lucide-react";
import { formatDate } from "../../utils/dateFormat";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_API_URL;
const COMPANY_ID = "2f762c5e-5274-4a65-aa66-15a7642a1608";
const GODOWN_ID = "fbf61954-4d32-4cb4-92ea-d0fe3be01311";

export function BankAccount() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */

  const loadStatement = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/bank/statement?company_id=${COMPANY_ID}&godown_id=${GODOWN_ID}`
      );
      const data = await res.json();

      if (!data.success) throw new Error(data.error);
      setTransactions(data.transactions || []);
    } catch (err) {
      toast.error("Failed to load bank statement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatement();
  }, []);

  /* ================= FILTERS ================= */

  const credits = transactions.filter(t => t.type === "credit");
  const debits = transactions.filter(t => t.type === "debit");

  /* ================= LEDGER ================= */

  const ledger = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  let runningBalance = 0;
  const ledgerWithBalance = ledger.map((t) => {
    runningBalance += t.type === "credit"
      ? Number(t.amount)
      : -Number(t.amount);

    return { ...t, runningBalance };
  });

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Bank Account Statement</h2>
          <p className="text-gray-500">Notebook style bank register</p>
        </div>

        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="ledger">
        <TabsList>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="credit">Credit</TabsTrigger>
          <TabsTrigger value="debit">Debit</TabsTrigger>
        </TabsList>

        {/* ================= LEDGER ================= */}
        <TabsContent value="ledger">
          <Card className="bg-[#fdfdfb] border-l-4 border-blue-400">
            <CardHeader>
              <CardTitle>Bank Passbook</CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-center py-8">Loading…</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Particulars</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {ledgerWithBalance.length > 0 ? (
                      ledgerWithBalance.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{formatDate(t.date)}</TableCell>
                          <TableCell>{t.reference || t.category}</TableCell>

                          <TableCell className="text-right text-red-600">
                            {t.type === "debit" ? t.amount.toLocaleString() : "-"}
                          </TableCell>

                          <TableCell className="text-right text-green-600">
                            {t.type === "credit" ? t.amount.toLocaleString() : "-"}
                          </TableCell>

                          <TableCell className="text-right font-semibold">
                            ₹{t.runningBalance.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No entries
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= CREDIT ONLY ================= */}
        <TabsContent value="credit">
          <Card className="bg-[#fdfdfb] border-l-4 border-green-400">
            <CardHeader>
              <CardTitle>Credit Register</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Received From</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {credits.length > 0 ? (
                    credits.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{formatDate(t.date)}</TableCell>
                        <TableCell>{t.reference || t.category}</TableCell>
                        <TableCell className="text-right text-green-600">
                          ₹{t.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        No credit entries
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= DEBIT ONLY ================= */}
        <TabsContent value="debit">
          <Card className="bg-[#fdfdfb] border-l-4 border-red-400">
            <CardHeader>
              <CardTitle>Debit Register</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Paid To</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {debits.length > 0 ? (
                    debits.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{formatDate(t.date)}</TableCell>
                        <TableCell>{t.reference || t.category}</TableCell>
                        <TableCell className="text-right text-red-600">
                          ₹{t.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        No debit entries
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
