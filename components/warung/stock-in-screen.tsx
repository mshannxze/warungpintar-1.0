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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, PackagePlus } from "lucide-react";
import {
  products as initialProducts,
  stockIns as initialStockIns,
  suppliers,
} from "@/lib/warung/mock-data";
import type { Product, StockIn } from "@/lib/warung/types";
import { formatDate, formatRupiah } from "@/lib/warung/format";

interface DraftLine {
  productId: number;
  quantity: number;
  unitCost: number;
}

export function StockInScreen() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [history, setHistory] = useState<StockIn[]>(initialStockIns);
  const [supplierId, setSupplierId] = useState<string>(
    String(suppliers[0]?.id ?? ""),
  );
  const [receivedDate, setReceivedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState<string>("");
  const [lines, setLines] = useState<DraftLine[]>([
    { productId: products[0]?.id ?? 0, quantity: 1, unitCost: products[0]?.purchasePrice ?? 0 },
  ]);

  const total = useMemo(
    () => lines.reduce((s, l) => s + l.quantity * l.unitCost, 0),
    [lines],
  );

  function addLine() {
    setLines((cur) => [
      ...cur,
      { productId: products[0]?.id ?? 0, quantity: 1, unitCost: products[0]?.purchasePrice ?? 0 },
    ]);
  }

  function updateLine(i: number, patch: Partial<DraftLine>) {
    setLines((cur) =>
      cur.map((l, idx) => {
        if (idx !== i) return l;
        const next = { ...l, ...patch };
        if (patch.productId !== undefined) {
          const prod = products.find((p) => p.id === patch.productId);
          if (prod) next.unitCost = prod.purchasePrice;
        }
        return next;
      }),
    );
  }

  function removeLine(i: number) {
    setLines((cur) => cur.filter((_, idx) => idx !== i));
  }

  function submit() {
    const supplier = suppliers.find((s) => s.id === Number(supplierId));
    if (!supplier) {
      toast.error("Pilih supplier terlebih dahulu");
      return;
    }
    if (lines.length === 0 || lines.some((l) => l.quantity <= 0)) {
      toast.error("Isi minimal 1 produk dengan jumlah > 0");
      return;
    }
    const id = `in-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();
    setProducts((cur) =>
      cur.map((p) => {
        const line = lines.find((l) => l.productId === p.id);
        if (!line) return p;
        return {
          ...p,
          currentStock: p.currentStock + line.quantity,
          purchasePrice: line.unitCost,
        };
      }),
    );
    const items = lines.map((l) => {
      const prod = products.find((p) => p.id === l.productId)!;
      return {
        productId: l.productId,
        productName: prod.name,
        quantity: l.quantity,
        unitCost: l.unitCost,
      };
    });
    setHistory((cur) => [
      {
        id,
        userId: "u-owner-1",
        userName: "Pak Imam",
        supplierId: supplier.id,
        supplierName: supplier.name,
        items,
        totalCost: total,
        receivedDate,
        notes,
        createdAt: now,
      },
      ...cur,
    ]);
    toast.success(
      `Stok masuk ${id} dicatat — ${formatRupiah(total)} dari ${supplier.name}`,
    );
    setLines([
      {
        productId: products[0]?.id ?? 0,
        quantity: 1,
        unitCost: products[0]?.purchasePrice ?? 0,
      },
    ]);
    setNotes("");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" /> Catat Stok Masuk
          </CardTitle>
          <CardDescription>
            Form pencatatan barang masuk dari supplier (kulakan).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Diterima</Label>
              <Input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Produk</TableHead>
                  <TableHead className="w-24">Jumlah</TableHead>
                  <TableHead className="w-32">Harga Beli</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((l, i) => {
                  const prod = products.find((p) => p.id === l.productId);
                  return (
                    <TableRow key={i}>
                      <TableCell>
                        <Select
                          value={String(l.productId)}
                          onValueChange={(v) =>
                            updateLine(i, { productId: Number(v) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          {prod?.sku} · stok kini {prod?.currentStock} {prod?.unit}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={l.quantity}
                          onChange={(e) =>
                            updateLine(i, { quantity: Number(e.target.value) })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={l.unitCost}
                          onChange={(e) =>
                            updateLine(i, { unitCost: Number(e.target.value) })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(l.quantity * l.unitCost)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeLine(i)}
                          disabled={lines.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <Button variant="outline" onClick={addLine}>
              <Plus className="h-4 w-4 mr-1" /> Tambah Item
            </Button>
            <p className="text-lg font-bold">
              Total: {formatRupiah(total)}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Catatan</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: pengiriman bulanan dari supplier utama"
              rows={2}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={submit} className="w-full sm:w-auto">
              Simpan Stok Masuk
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Stok Masuk</CardTitle>
          <CardDescription>
            {history.length} pencatatan terakhir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.map((h) => (
            <div key={h.id} className="rounded-lg border p-3 space-y-1">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {h.supplierName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(h.receivedDate)} · {h.userName}
                  </p>
                </div>
                <p className="text-sm font-semibold shrink-0">
                  {formatRupiah(h.totalCost)}
                </p>
              </div>
              <ul className="text-xs text-muted-foreground">
                {h.items.map((it, idx) => (
                  <li key={idx}>
                    · {it.productName} × {it.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
