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
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  categories as initialCategories,
  products as initialProducts,
} from "@/lib/warung/mock-data";
import type { Product } from "@/lib/warung/types";
import { formatRupiah } from "@/lib/warung/format";

type Draft = Omit<Product, "id" | "categoryName"> & { id?: number };

const emptyDraft: Draft = {
  sku: "",
  name: "",
  categoryId: initialCategories[0]?.id ?? 1,
  purchasePrice: 0,
  sellingPrice: 0,
  unit: "pcs",
  currentStock: 0,
  minStock: 0,
};

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      const matchCat =
        filterCategory === "all" || String(p.categoryId) === filterCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, filterCategory]);

  function openNew() {
    setDraft(emptyDraft);
    setOpen(true);
  }
  function openEdit(p: Product) {
    setDraft({
      id: p.id,
      sku: p.sku,
      name: p.name,
      categoryId: p.categoryId,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      unit: p.unit,
      currentStock: p.currentStock,
      minStock: p.minStock,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!draft.name.trim() || !draft.sku.trim()) {
      toast.error("Nama dan SKU wajib diisi");
      return;
    }
    if (draft.sellingPrice < draft.purchasePrice) {
      toast.warning("Harga jual lebih kecil dari harga beli");
    }
    const cat = initialCategories.find((c) => c.id === draft.categoryId);
    if (draft.id) {
      setProducts((cur) =>
        cur.map((p) =>
          p.id === draft.id
            ? {
                ...p,
                ...draft,
                id: draft.id!,
                categoryName: cat?.name ?? p.categoryName,
              }
            : p,
        ),
      );
      toast.success(`Produk "${draft.name}" diperbarui`);
    } else {
      const nextId = Math.max(0, ...products.map((p) => p.id)) + 1;
      setProducts((cur) => [
        ...cur,
        {
          ...draft,
          id: nextId,
          categoryName: cat?.name ?? "—",
        } as Product,
      ]);
      toast.success(`Produk "${draft.name}" ditambahkan`);
    }
    setOpen(false);
  }

  function handleDelete() {
    if (!confirmDelete) return;
    setProducts((cur) => cur.filter((p) => p.id !== confirmDelete.id));
    toast.success(`Produk "${confirmDelete.name}" dihapus`);
    setConfirmDelete(null);
  }

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Manajemen Produk</CardTitle>
            <CardDescription>
              {products.length} produk · {initialCategories.length} kategori
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="self-start sm:self-auto">
                <Plus className="h-4 w-4 mr-1" /> Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {draft.id ? "Edit Produk" : "Tambah Produk Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi data master produk untuk dimasukkan ke katalog.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>SKU / Barcode</Label>
                    <Input
                      value={draft.sku}
                      onChange={(e) =>
                        setDraft({ ...draft, sku: e.target.value })
                      }
                      placeholder="MNM-AQUA-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Satuan</Label>
                    <Input
                      value={draft.unit}
                      onChange={(e) =>
                        setDraft({ ...draft, unit: e.target.value })
                      }
                      placeholder="pcs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Nama Produk</Label>
                  <Input
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                    placeholder="Aqua 600ml"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select
                    value={String(draft.categoryId)}
                    onValueChange={(v) =>
                      setDraft({ ...draft, categoryId: Number(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {initialCategories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Harga Beli (Rp)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.purchasePrice}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          purchasePrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Harga Jual (Rp)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.sellingPrice}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          sellingPrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Stok Saat Ini</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.currentStock}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          currentStock: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Minimum Stok</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.minStock}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          minStock: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSave}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau SKU…"
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua kategori</SelectItem>
              {initialCategories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="hidden md:table-cell">Kategori</TableHead>
                <TableHead className="text-right">Harga Beli</TableHead>
                <TableHead className="text-right">Harga Jual</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-10"
                  >
                    Tidak ada produk yang cocok.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const low = p.currentStock <= p.minStock;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.sku}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{p.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(p.purchasePrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(p.sellingPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            p.currentStock === 0
                              ? "destructive"
                              : low
                                ? "outline"
                                : "secondary"
                          }
                          className={low && p.currentStock > 0 ? "border-amber-500 text-amber-700 dark:text-amber-400" : ""}
                        >
                          {p.currentStock} {p.unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setConfirmDelete(p)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk &quot;{confirmDelete?.name}&quot; akan dihapus dari
              katalog. Aksi ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
