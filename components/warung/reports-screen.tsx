"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { api, type SalesReport, type AppUser } from "@/lib/warung/api";
import { formatDateTime, formatRupiah } from "@/lib/warung/format";

type Period = "today" | "7d" | "30d" | "month" | "custom";

const paymentColor: Record<string, string> = {
  cash: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  qris: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  transfer: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
};

export function ReportsScreen() {
  const [period, setPeriod] = useState<Period>("7d");
  const [from, setFrom] = useState<string>(new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState<string>(new Date().toISOString().slice(0, 10));
  const [cashier, setCashier] = useState<string>("all");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.users.list().then(setUsers).catch(console.error); }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.reports.sales({
        period: period !== "custom" ? period : undefined,
        from: period === "custom" ? from : undefined,
        to: period === "custom" ? to : undefined,
        cashierId: cashier === "all" ? undefined : cashier,
      });
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [period, from, to, cashier]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const summary = report?.summary;

  const kpis = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Transaksi", value: String(summary.transactionCount) },
      { label: "Pendapatan", value: formatRupiah(summary.totalRevenue) },
      { label: "HPP", value: formatRupiah(summary.totalCost) },
      { label: "Laba Kotor", value: formatRupiah(summary.grossProfit) },
      { label: "Margin", value: `${summary.margin.toFixed(1)}%` },
    ];
  }, [summary]);

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Periode</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="7d">7 Hari</SelectItem>
                  <SelectItem value="30d">30 Hari</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {period === "custom" && (
              <>
                <div className="space-y-1.5">
                  <Label>Dari</Label>
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
                </div>
                <div className="space-y-1.5">
                  <Label>Sampai</Label>
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label>Kasir</Label>
              <Select value={cashier} onValueChange={setCashier}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kasir</SelectItem>
                  {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchReport} disabled={loading} variant="secondary">
              {loading ? "Memuat..." : "Perbarui"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-lg font-bold mt-1">{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {report && report.categoryBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Breakdown per Kategori</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Pendapatan</TableHead>
                  <TableHead className="text-right">HPP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.categoryBreakdown.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell>{c.categoryName ?? "Tanpa kategori"}</TableCell>
                    <TableCell className="text-right">{c.qty ?? 0}</TableCell>
                    <TableCell className="text-right">{formatRupiah(Number(c.revenue ?? 0))}</TableCell>
                    <TableCell className="text-right">{formatRupiah(Number(c.cost ?? 0))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>
            {report ? `${report.transactions.length} transaksi dalam periode ini` : "Memuat..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="hidden md:table-cell">Kasir</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Laba</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!report ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : report.transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Tidak ada transaksi dalam periode ini.
                  </TableCell>
                </TableRow>
              ) : (
                report.transactions.map((t) => {
                  const profit = Number(t.totalAmount) - Number(t.totalCost);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id.slice(0, 8)}…</TableCell>
                      <TableCell className="text-sm">{formatDateTime(t.createdAt)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{t.cashierName ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${paymentColor[t.paymentMethod] ?? ""} border-0`}>
                          {t.paymentMethod.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatRupiah(Number(t.totalAmount))}</TableCell>
                      <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatRupiah(profit)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
