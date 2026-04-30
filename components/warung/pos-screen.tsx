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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Minus,
  Plus,
  Printer,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import {
  categories,
  products as initialProducts,
} from "@/lib/warung/mock-data";
import type { PaymentMethod, Product } from "@/lib/warung/types";
import { formatRupiah } from "@/lib/warung/format";

interface CartItem {
  product: Product;
  quantity: number;
}

export function PosScreen() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [receipt, setReceipt] = useState<{
    id: string;
    items: CartItem[];
    total: number;
    payment: PaymentMethod;
    cashGiven: number;
    createdAt: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      const matchCat = activeCat === "all" || String(p.categoryId) === activeCat;
      return matchSearch && matchCat;
    });
  }, [products, search, activeCat]);

  const total = cart.reduce(
    (s, c) => s + c.product.sellingPrice * c.quantity,
    0,
  );
  const totalCost = cart.reduce(
    (s, c) => s + c.product.purchasePrice * c.quantity,
    0,
  );
  const change = Math.max(0, cashGiven - total);

  function addToCart(p: Product) {
    if (p.currentStock <= 0) {
      toast.error(`Stok ${p.name} habis`);
      return;
    }
    setCart((cur) => {
      const exists = cur.find((c) => c.product.id === p.id);
      if (exists) {
        if (exists.quantity + 1 > p.currentStock) {
          toast.warning(`Stok ${p.name} hanya ${p.currentStock}`);
          return cur;
        }
        return cur.map((c) =>
          c.product.id === p.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...cur, { product: p, quantity: 1 }];
    });
  }

  function changeQty(productId: number, delta: number) {
    setCart((cur) =>
      cur
        .map((c) => {
          if (c.product.id !== productId) return c;
          const next = c.quantity + delta;
          if (next > c.product.currentStock) {
            toast.warning(`Stok ${c.product.name} hanya ${c.product.currentStock}`);
            return c;
          }
          return { ...c, quantity: next };
        })
        .filter((c) => c.quantity > 0),
    );
  }

  function removeFromCart(productId: number) {
    setCart((cur) => cur.filter((c) => c.product.id !== productId));
  }

  function checkout() {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }
    if (payment === "cash" && cashGiven < total) {
      toast.error("Uang tunai kurang dari total");
      return;
    }
    const id = `trx-${Date.now().toString(36).toUpperCase()}`;
    const createdAt = new Date().toISOString();
    setProducts((cur) =>
      cur.map((p) => {
        const it = cart.find((c) => c.product.id === p.id);
        if (!it) return p;
        return { ...p, currentStock: p.currentStock - it.quantity };
      }),
    );
    setReceipt({
      id,
      items: [...cart],
      total,
      payment,
      cashGiven,
      createdAt,
    });
    toast.success(`Transaksi ${id} sukses · ${formatRupiah(total)}`);
    setCart([]);
    setCashGiven(0);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle>Pilih Produk</CardTitle>
                <CardDescription>
                  Tap produk untuk masukkan ke keranjang
                </CardDescription>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari produk / SKU…"
                  className="pl-9"
                />
              </div>
            </div>
            <Tabs value={activeCat} onValueChange={setActiveCat}>
              <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="all">Semua</TabsTrigger>
                {categories.map((c) => (
                  <TabsTrigger key={c.id} value={String(c.id)}>
                    {c.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.length === 0 ? (
                <p className="col-span-full text-center text-sm text-muted-foreground py-10">
                  Tidak ada produk yang cocok.
                </p>
              ) : (
                filtered.map((p) => {
                  const out = p.currentStock <= 0;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p)}
                      disabled={out}
                      className="group text-left rounded-lg border p-3 transition hover:border-primary hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[112px]"
                    >
                      <p className="text-sm font-medium line-clamp-2">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.sku}
                      </p>
                      <div className="flex items-end justify-between mt-2">
                        <span className="text-base font-semibold">
                          {formatRupiah(p.sellingPrice)}
                        </span>
                        <Badge
                          variant={out ? "destructive" : "secondary"}
                          className="text-[10px]"
                        >
                          {out ? "Habis" : `${p.currentStock} ${p.unit}`}
                        </Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Keranjang ({cart.length})
          </CardTitle>
          <CardDescription>
            Estimasi laba: {formatRupiah(total - totalCost)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3">
          <ScrollArea className="flex-1 max-h-[280px] pr-3">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada item dipilih
              </p>
            ) : (
              <ul className="space-y-2">
                {cart.map((c) => (
                  <li
                    key={c.product.id}
                    className="flex items-center gap-2 rounded-md border p-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {c.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRupiah(c.product.sellingPrice)} ×{" "}
                        {c.quantity} ={" "}
                        <span className="font-medium text-foreground">
                          {formatRupiah(c.quantity * c.product.sellingPrice)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => changeQty(c.product.id, -1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm">
                        {c.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => changeQty(c.product.id, 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => removeFromCart(c.product.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatRupiah(total)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatRupiah(total)}</span>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Metode Pembayaran
              </p>
              <ToggleGroup
                type="single"
                value={payment}
                onValueChange={(v) => v && setPayment(v as PaymentMethod)}
                className="grid grid-cols-3 gap-1 w-full"
              >
                <ToggleGroupItem value="cash" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  Tunai
                </ToggleGroupItem>
                <ToggleGroupItem value="qris" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  QRIS
                </ToggleGroupItem>
                <ToggleGroupItem value="transfer" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  Transfer
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {payment === "cash" && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Uang Diterima</p>
                <Input
                  type="number"
                  min={0}
                  value={cashGiven || ""}
                  onChange={(e) => setCashGiven(Number(e.target.value))}
                  placeholder="0"
                />
                {cashGiven > 0 && (
                  <p className="text-xs">
                    Kembalian:{" "}
                    <span className="font-semibold">
                      {formatRupiah(change)}
                    </span>
                  </p>
                )}
              </div>
            )}

            <Button
              className="w-full h-12 text-base"
              onClick={checkout}
              disabled={cart.length === 0}
            >
              Bayar & Cetak Struk
            </Button>
          </div>
        </CardContent>
      </Card>

      <ReceiptDialog
        receipt={receipt}
        onClose={() => setReceipt(null)}
      />
    </div>
  );
}

function ReceiptDialog({
  receipt,
  onClose,
}: {
  receipt: {
    id: string;
    items: CartItem[];
    total: number;
    payment: PaymentMethod;
    cashGiven: number;
    createdAt: string;
  } | null;
  onClose: () => void;
}) {
  if (!receipt) return null;
  const change = Math.max(0, receipt.cashGiven - receipt.total);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Struk Penjualan</DialogTitle>
          <DialogDescription className="text-center">
            Warung Madura · {receipt.id}
          </DialogDescription>
        </DialogHeader>
        <div className="font-mono text-xs space-y-2 py-2">
          <p className="text-center">
            {new Date(receipt.createdAt).toLocaleString("id-ID")}
          </p>
          <Separator />
          {receipt.items.map((it) => (
            <div key={it.product.id}>
              <p className="font-medium">{it.product.name}</p>
              <div className="flex justify-between">
                <span>
                  {it.quantity} × {formatRupiah(it.product.sellingPrice)}
                </span>
                <span>
                  {formatRupiah(it.quantity * it.product.sellingPrice)}
                </span>
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{formatRupiah(receipt.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Bayar ({receipt.payment.toUpperCase()})</span>
            <span>
              {formatRupiah(
                receipt.payment === "cash" ? receipt.cashGiven : receipt.total,
              )}
            </span>
          </div>
          {receipt.payment === "cash" && change > 0 && (
            <div className="flex justify-between">
              <span>Kembalian</span>
              <span>{formatRupiah(change)}</span>
            </div>
          )}
          <Separator />
          <p className="text-center pt-1">Terima kasih 🙏</p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-1" /> Cetak
          </Button>
          <Button className="w-full sm:w-auto" onClick={onClose}>
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
