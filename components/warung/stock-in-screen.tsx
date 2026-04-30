"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PackagePlus, Plus, Trash2 } from "lucide-react";
import { api, type Product, type Supplier, type StockIn, ApiError } from "@/lib/warung/api";
import { formatDate, formatRupiah } from "@/lib/warung/format";

interface DraftLine { productId: number; quantity: number; unitCost: number }

export function StockInScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [history, setHistory] = useState<StockIn[] | null>(null);
  const [supplierId, setSupplierId] = useState<string>("");
  const [receivedDate, setReceivedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>("");
  const [lines, setLines] = useState<DraftLine[]>([{ productId: 0, quantity: 1, unitCost: 0 }]);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const [prods, supps, hist] = await Promise.all([
      api.products.list(), api.suppliers.list(), api.stockIns.list(50),
    ]);
    setProducts(prods);
    setSuppliers(supps);
    setHistory(hist);
    if (prods.length > 0 && lines[0].productId === 0) {
      setLines([{ productId: prods[0].id, quantity: 1, unitCost: Number(prods[0].purchasePrice) }]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load().catch(console.error); }, [load]);

  const total = useMemo(() => lines.reduce((s, l) => s + l.quantity * l.unitCost, 0), [lines]);

  function addLine() {
    const first = products[0];
    setLines((cur) => [...cur, { productId: first?.id ?? 0, quantity: 1, unitCost: Number(first?.purchasePrice ?? 0) }]);
  }

  function updateLine(i: number, patch: Partial<DraftLine>) {
    setLines((cur) =>
      cur.map((l, idx) => {
        if (idx !== i) return l;
        const next = { ...l, ...patch };
        if (patch.productId !== undefined) {
          const prod = products.find((p) => p.id === patch.productId);
          if (prod) next.unitCost = Number(prod.purchasePrice);
        }
        return next;
      }),
    );
  }

  function removeLine(i: number) {
    setLines((cur) => cur.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (lines.some((l) => !l.productId || l.quantity <= 0)) {
      toast.error("Lengkapi semua baris item");
      return;
    }
    setSubmitting(true);
    try {
      await api.stockIns.create({
        supplierId: supplierId ? Number(supplierId) : null,
        receivedDate,
        notes: notes || undefined,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitCost: l.unitCost.toFixed(2) })),
      });
      toast.success("Stok masuk berhasil dicatat");
      const first = products[0];
      setLines([{ productId: first?.id ?? 0, quantity: 1, unitCost: Number(first?.purchasePrice ?? 0) }]);
      setNotes("");
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal mencatat stok masuk");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" /> Catat Stok Masuk
          </CardTitle>
          <CardDescription>Kulakan / restock produk dari supplier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder="Pilih supplier (opsional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tanpa supplier</SelectItem>
                  {suppliers.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Terima</Label>
              <Input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Item</Label>
              <Button type="button" size="sm" variant="outline" onClick={addLine} className="gap-1 h-8">
                <Plus className="h-3 w-3" /> Tambah Baris
              </Button>
            </div>
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center">
                <Select value={String(line.productId)} onValueChange={(v) => updateLine(i, { productId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} value={line.quantity} placeholder="Qty"
                  onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })} />
                <Input type="number" min={0} value={line.unitCost} placeholder="Harga beli"
                  onChange={(e) => updateLine(i, { unitCost: Number(e.target.value) })} />
                <Button type="button" size="icon" variant="ghost" className="h-9 w-9"
                  onClick={() => removeLine(i)} disabled={lines.length === 1}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Catatan (opsional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          <Separator />
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={submitting || products.length === 0}>
            {submitting ? "Menyimpan..." : "Simpan Stok Masuk"}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Riwayat Stok Masuk</CardTitle>
          <CardDescription>50 entri terbaru</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!history ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={2}><Skeleton className="h-7 w-full" /></TableCell></TableRow>
                ))
              ) : history.length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">Belum ada data.</TableCell></TableRow>
              ) : (
                history.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm">{formatDate(s.receivedDate)}</TableCell>
                    <TableCell className="text-right font-medium">{formatRupiah(Number(s.totalCost))}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
