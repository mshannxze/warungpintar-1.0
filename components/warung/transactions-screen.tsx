"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transactions } from "@/lib/warung/mock-data";
import { formatDateTime, formatRupiah } from "@/lib/warung/format";
import type { Transaction } from "@/lib/warung/types";

export function TransactionsScreen() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions
      .filter((t) => {
        if (!q) return true;
        return (
          t.id.toLowerCase().includes(q) ||
          t.cashierName.toLowerCase().includes(q) ||
          t.items.some((i) => i.productName.toLowerCase().includes(q))
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [search]);

  return (
    <Card>
      <CardHeader className="gap-3">
        <div>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>
            Semua transaksi penjualan dari semua kasir
          </CardDescription>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID, kasir, atau produk…"
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Bayar</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell>{formatDateTime(t.createdAt)}</TableCell>
                  <TableCell>{t.cashierName}</TableCell>
                  <TableCell>
                    {t.items.length} produk ·{" "}
                    {t.items.reduce((s, i) => s + i.quantity, 0)} qty
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t.paymentMethod.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatRupiah(t.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setActive(t)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Detail Transaksi</SheetTitle>
            <SheetDescription>{active?.id}</SheetDescription>
          </SheetHeader>
          {active && (
            <div className="px-4 pb-6 space-y-4">
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Kasir:</span>{" "}
                  {active.cashierName}
                </p>
                <p>
                  <span className="text-muted-foreground">Tanggal:</span>{" "}
                  {formatDateTime(active.createdAt)}
                </p>
                <p>
                  <span className="text-muted-foreground">Metode:</span>{" "}
                  {active.paymentMethod.toUpperCase()}
                </p>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {active.items.map((i) => (
                      <TableRow key={i.productId}>
                        <TableCell>
                          <div className="text-sm">{i.productName}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatRupiah(i.unitPrice)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {i.quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatRupiah(i.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pendapatan</span>
                  <span>{formatRupiah(active.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modal (HPP)</span>
                  <span>{formatRupiah(active.totalCost)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t">
                  <span>Laba Kotor</span>
                  <span className="text-emerald-600">
                    {formatRupiah(active.totalAmount - active.totalCost)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
