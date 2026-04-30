"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Minus, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import { demoApi } from "@/lib/warung/demo-api";
import type { Category, Product, PaymentMethod } from "@/lib/warung/api";
import { formatRupiah } from "@/lib/warung/format";

interface CartItem { product: Product; quantity: number }

export function DemoPosScreen() {
    const [products, setProducts] = useState<Product[] | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState("");
    const [activeCat, setActiveCat] = useState<string>("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [payment, setPayment] = useState<PaymentMethod>("cash");
    const [cashGiven, setCashGiven] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);
    const [receipt, setReceipt] = useState<{ id: string; total: number; payment: PaymentMethod; cashGiven: number; createdAt: string } | null>(null);

    const load = useCallback(async () => {
        const [prods, cats] = await Promise.all([demoApi.products.list(), demoApi.categories.list()]);
        setProducts(prods);
        setCategories(cats);
    }, []);

    useEffect(() => { load().catch(console.error); }, [load]);

    const filtered = useMemo(() => {
        if (!products) return [];
        const q = search.toLowerCase();
        return products.filter((p) => {
            const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
            const matchCat = activeCat === "all" || String(p.categoryId) === activeCat;
            return matchSearch && matchCat;
        });
    }, [products, search, activeCat]);

    const total = cart.reduce((s, c) => s + Number(c.product.sellingPrice) * c.quantity, 0);
    const totalCost = cart.reduce((s, c) => s + Number(c.product.purchasePrice) * c.quantity, 0);
    const change = Math.max(0, cashGiven - total);

    function addToCart(p: Product) {
        if (p.currentStock <= 0) { toast.error(`Stok ${p.name} habis`); return; }
        setCart((cur) => {
            const exists = cur.find((c) => c.product.id === p.id);
            if (exists) {
                if (exists.quantity + 1 > p.currentStock) {
                    toast.warning(`Stok ${p.name} hanya ${p.currentStock}`);
                    return cur;
                }
                return cur.map((c) => c.product.id === p.id ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...cur, { product: p, quantity: 1 }];
        });
    }

    function changeQty(productId: number, delta: number) {
        setCart((cur) =>
            cur.map((c) => {
                if (c.product.id !== productId) return c;
                const next = c.quantity + delta;
                if (next > c.product.currentStock) {
                    toast.warning(`Stok ${c.product.name} hanya ${c.product.currentStock}`);
                    return c;
                }
                return { ...c, quantity: next };
            }).filter((c) => c.quantity > 0),
        );
    }

    async function checkout() {
        if (cart.length === 0) { toast.error("Keranjang masih kosong"); return; }
        if (payment === "cash" && cashGiven < total) { toast.error("Uang tunai kurang dari total"); return; }
        setSubmitting(true);
        try {
            const result = await demoApi.transactions.create({
                items: cart.map((c) => ({ productId: c.product.id, quantity: c.quantity })),
                paymentMethod: payment,
            });
            setReceipt({ id: result.id, total, payment, cashGiven, createdAt: result.createdAt });
            toast.success(`[Demo] Transaksi sukses · ${formatRupiah(total)}`);
            setCart([]);
            setCashGiven(0);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Transaksi gagal");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <Card>
                        <CardHeader className="gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <CardTitle>Pilih Produk</CardTitle>
                                    <CardDescription>Tap produk untuk masukkan ke keranjang</CardDescription>
                                </div>
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input value={search} onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari produk / SKU…" className="pl-9" />
                                </div>
                            </div>
                            <Tabs value={activeCat} onValueChange={setActiveCat}>
                                <TabsList className="flex-wrap h-auto">
                                    <TabsTrigger value="all">Semua</TabsTrigger>
                                    {categories.map((c) => (
                                        <TabsTrigger key={c.id} value={String(c.id)}>{c.name}</TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent>
                            {!products ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {filtered.length === 0 ? (
                                        <p className="col-span-full text-center text-sm text-muted-foreground py-10">
                                            Tidak ada produk yang cocok.
                                        </p>
                                    ) : (
                                        filtered.map((p) => {
                                            const out = p.currentStock <= 0;
                                            return (
                                                <button key={p.id} type="button" onClick={() => addToCart(p)} disabled={out}
                                                    className="group text-left rounded-lg border p-3 transition hover:border-primary hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[112px]">
                                                    <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{p.sku}</p>
                                                    <div className="flex items-end justify-between mt-2">
                                                        <span className="text-base font-semibold">{formatRupiah(Number(p.sellingPrice))}</span>
                                                        <Badge variant={out ? "destructive" : "secondary"} className="text-[10px]">
                                                            {out ? "Habis" : `${p.currentStock} ${p.unit}`}
                                                        </Badge>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Keranjang ({cart.length})
                        </CardTitle>
                        <CardDescription>Estimasi laba: {formatRupiah(total - totalCost)}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3">
                        <ScrollArea className="flex-1 max-h-[280px] pr-3">
                            {cart.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Belum ada item dipilih</p>
                            ) : (
                                <ul className="space-y-2">
                                    {cart.map((c) => (
                                        <li key={c.product.id} className="flex items-center gap-2 rounded-md border p-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{c.product.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatRupiah(Number(c.product.sellingPrice))} × {c.quantity} ={" "}
                                                    <span className="font-medium text-foreground">
                                                        {formatRupiah(c.quantity * Number(c.product.sellingPrice))}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => changeQty(c.product.id, -1)}>
                                                    <Minus className="h-3.5 w-3.5" />
                                                </Button>
                                                <span className="w-6 text-center text-sm">{c.quantity}</span>
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => changeQty(c.product.id, 1)}>
                                                    <Plus className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setCart((cur) => cur.filter((x) => x.product.id !== c.product.id))}>
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
                                <span>Total</span><span>{formatRupiah(total)}</span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1.5">Metode Pembayaran</p>
                                <ToggleGroup type="single" value={payment}
                                    onValueChange={(v) => v && setPayment(v as PaymentMethod)}
                                    className="grid grid-cols-3 gap-1 w-full">
                                    {(["cash", "qris", "transfer"] as const).map((m) => (
                                        <ToggleGroupItem key={m} value={m}
                                            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                            {m === "cash" ? "Tunai" : m === "qris" ? "QRIS" : "Transfer"}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                            {payment === "cash" && (
                                <div className="space-y-1.5">
                                    <p className="text-xs text-muted-foreground">Uang Diterima</p>
                                    <Input type="number" min={0} value={cashGiven || ""}
                                        onChange={(e) => setCashGiven(Number(e.target.value))} placeholder="0" />
                                    {cashGiven > 0 && (
                                        <p className="text-xs">Kembalian: <span className="font-semibold">{formatRupiah(change)}</span></p>
                                    )}
                                </div>
                            )}
                            <Button className="w-full h-12 text-base" onClick={checkout}
                                disabled={cart.length === 0 || submitting}>
                                {submitting ? "Memproses..." : "Bayar & Cetak Struk (Demo)"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transaksi Demo Berhasil ✓</DialogTitle>
                        <DialogDescription>
                            ID: #{receipt?.id.slice(0, 8)} · {formatRupiah(receipt?.total ?? 0)}
                            {receipt?.payment === "cash" && receipt.cashGiven > 0 && (
                                <span> · Kembalian {formatRupiah(receipt.cashGiven - (receipt.total ?? 0))}</span>
                            )}
                            <br />
                            <span className="text-amber-600 dark:text-amber-400 text-xs">
                                Ini adalah simulasi demo — tidak tersimpan di database.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setReceipt(null)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
