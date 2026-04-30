"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { transactions, users } from "@/lib/warung/mock-data";
import { formatDateTime, formatRupiah } from "@/lib/warung/format";
import { Download } from "lucide-react";

type Period = "today" | "7d" | "30d" | "custom";

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function ReportsScreen() {
  const [period, setPeriod] = useState<Period>("7d");
  const [from, setFrom] = useState<string>(
    new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10),
  );
  const [to, setTo] = useState<string>(new Date().toISOString().slice(0, 10));
  const [cashier, setCashier] = useState<string>("all");

  const range = useMemo(() => {
    if (period === "today") {
      const d = startOfDay(new Date());
      return { from: d, to: new Date() };
    }
    if (period === "7d") {
      const t = new Date();
      const f = startOfDay(new Date(Date.now() - 6 * 86400000));
      return { from: f, to: t };
    }
    if (period === "30d") {
      const t = new Date();
      const f = startOfDay(new Date(Date.now() - 29 * 86400000));
      return { from: f, to: t };
    }
    const f = startOfDay(new Date(from));
    const t = new Date(to);
    t.setHours(23, 59, 59, 999);
    return { from: f, to: t };
  }, [period, from, to]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (t.status !== "completed") return false;
      const d = new Date(t.createdAt);
      if (d < range.from || d > range.to) return false;
      if (cashier !== "all" && t.cashierId !== cashier) return false;
      return true;
    });
  }, [range, cashier]);

  const totalRevenue = filtered.reduce((s, t) => s + t.totalAmount, 0);
  const totalCost = filtered.reduce((s, t) => s + t.totalCost, 0);
  const grossProfit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  function exportCsv() {
    const rows = [
      [
        "id",
        "tanggal",
        "kasir",
        "metode",
        "total_pendapatan",
        "total_modal",
        "laba_kotor",
        "items",
      ],
      ...filtered.map((t) => [
        t.id,
        t.createdAt,
        t.cashierName,
        t.paymentMethod,
        t.totalAmount,
        t.totalCost,
        t.totalAmount - t.totalCost,
        t.items.map((i) => `${i.productName}×${i.quantity}`).join("|"),
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "");
            return s.includes(",") || s.includes('"')
              ? `"${s.replace(/"/g, '""')}"`
              : s;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-warung-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Laporan diekspor sebagai CSV");
  }

  const cashiers = users.filter((u) => u.role === "cashier");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>
            Pilih periode, kasir, atau rentang tanggal kustom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1.5">
              <Label>Periode</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                  <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                  <SelectItem value="custom">Kustom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Dari</Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                disabled={period !== "custom"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sampai</Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                disabled={period !== "custom"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kasir</Label>
              <Select value={cashier} onValueChange={setCashier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kasir</SelectItem>
                  {cashiers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 flex flex-col">
              <Label>&nbsp;</Label>
              <Button onClick={exportCsv} variant="outline">
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total Transaksi</p>
            <p className="text-2xl font-bold mt-1">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total Pendapatan</p>
            <p className="text-2xl font-bold mt-1">
              {formatRupiah(totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total Modal (HPP)</p>
            <p className="text-2xl font-bold mt-1">{formatRupiah(totalCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Laba Kotor</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">
              {formatRupiah(grossProfit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Margin {margin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Transaksi</CardTitle>
          <CardDescription>
            {filtered.length} transaksi dalam rentang yang dipilih
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Item</TableHead>
                  <TableHead className="text-right">Pendapatan</TableHead>
                  <TableHead className="text-right">Modal</TableHead>
                  <TableHead className="text-right">Laba</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-10"
                    >
                      Tidak ada transaksi pada rentang ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-xs">
                          {t.id}
                        </TableCell>
                        <TableCell>{formatDateTime(t.createdAt)}</TableCell>
                        <TableCell>{t.cashierName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {t.paymentMethod.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {t.items.reduce((s, i) => s + i.quantity, 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(t.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatRupiah(t.totalCost)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-emerald-600">
                          {formatRupiah(t.totalAmount - t.totalCost)}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
