"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, RotateCcw, Search } from "lucide-react";
import { api, type Transaction, type TransactionDetail, ApiError } from "@/lib/warung/api";
import { formatDateTime, formatRupiah } from "@/lib/warung/format";

const paymentColor: Record<string, string> = {
  cash: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  qris: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  transfer: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
};

export function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<TransactionDetail | null>(null);
  const [refundTarget, setRefundTarget] = useState<Transaction | null>(null);

  const load = useCallback(() => api.transactions.list({ limit: 200 }).then(setTransactions).catch(console.error), []);
  useEffect(() => { load(); }, [load]);

  async function openDetail(t: Transaction) {
    try {
      const detail = await api.transactions.getById(t.id);
      setActive(detail);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal memuat detail");
    }
  }

  async function handleRefund() {
    if (!refundTarget) return;
    try {
      await api.transactions.refund(refundTarget.id);
      toast.success("Transaksi berhasil di-refund");
      setRefundTarget(null);
      if (active?.id === refundTarget.id) setActive(null);
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Refund gagal");
    }
  }

  const filtered = useMemo(() => {
    if (!transactions) return [];
    const q = search.toLowerCase();
    return transactions.filter((t) =>
      !q || t.id.toLowerCase().includes(q) || (t.cashierName ?? "").toLowerCase().includes(q),
    );
  }, [transactions, search]);

  return (
    <Card>
      <CardHeader className="gap-3">
        <div>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>Semua transaksi penjualan dari semua kasir</CardDescription>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID atau kasir…" className="pl-9" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="hidden md:table-cell">Kasir</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!transactions ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Tidak ada transaksi.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
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
                    <TableCell>
                      <Badge variant={t.status === "refunded" ? "destructive" : "secondary"}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openDetail(t)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {t.status === "completed" && (
                          <Button size="icon" variant="ghost" onClick={() => setRefundTarget(t)}>
                            <RotateCcw className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detail Transaksi</SheetTitle>
            <SheetDescription>#{active?.id}</SheetDescription>
          </SheetHeader>
          {active && (
            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-muted-foreground">Tanggal</p><p>{formatDateTime(active.createdAt)}</p></div>
                <div><p className="text-muted-foreground">Kasir</p><p>{active.cashierName ?? "—"}</p></div>
                <div><p className="text-muted-foreground">Metode</p><p>{active.paymentMethod.toUpperCase()}</p></div>
                <div><p className="text-muted-foreground">Status</p><p>{active.status}</p></div>
              </div>
              <div className="border rounded-lg divide-y">
                {active.items?.map((it) => (
                  <div key={it.id} className="px-3 py-2 flex justify-between gap-2">
                    <div>
                      <p className="font-medium">{it.productName ?? `Produk #${it.productId}`}</p>
                      <p className="text-xs text-muted-foreground">{it.quantity} × {formatRupiah(Number(it.unitPrice))}</p>
                    </div>
                    <p className="font-medium shrink-0">{formatRupiah(Number(it.subtotal))}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total</span><span>{formatRupiah(Number(active.totalAmount))}</span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!refundTarget} onOpenChange={(o) => !o && setRefundTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refund Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Stok produk akan dikembalikan dan status transaksi diubah ke &ldquo;refunded&rdquo;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRefund}>Ya, Refund</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
