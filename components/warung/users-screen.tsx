"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { api, type AppUser, ApiError } from "@/lib/warung/api";
import { formatDate } from "@/lib/warung/format";

export function UsersScreen() {
  const [users, setUsers] = useState<AppUser[] | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AppUser | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "", password: "", role: "cashier" as "owner" | "cashier" });
  const [editTarget, setEditTarget] = useState<AppUser | null>(null);
  const [editDraft, setEditDraft] = useState({ name: "", role: "cashier" as "owner" | "cashier", isActive: true });
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(() => api.users.list().then(setUsers).catch(console.error), []);
  useEffect(() => { load(); }, [load]);

  async function addUser() {
    if (!draft.name.trim() || !draft.email.trim() || draft.password.length < 8) {
      toast.error("Lengkapi data — password min. 8 karakter");
      return;
    }
    setSaving(true);
    try {
      await api.users.create(draft);
      toast.success(`Akun ${draft.name} (${draft.role}) dibuat`);
      setDraft({ name: "", email: "", password: "", role: "cashier" });
      setOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal membuat akun");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(u: AppUser) {
    setEditTarget(u);
    setEditDraft({ name: u.name, role: u.role, isActive: u.isActive });
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editTarget) return;
    setSaving(true);
    try {
      await api.users.update(editTarget.id, editDraft);
      toast.success("Akun diperbarui");
      setEditOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal memperbarui akun");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await api.users.delete(confirmDelete.id);
      toast.success(`Akun ${confirmDelete.name} dihapus`);
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus akun");
    }
  }

  async function toggleActive(u: AppUser, value: boolean) {
    try {
      await api.users.update(u.id, { isActive: value });
      toast.success(`Akun ${value ? "diaktifkan" : "dinonaktifkan"}`);
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal mengubah status");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Manajemen Pengguna</CardTitle>
            <CardDescription>
              {users ? `${users.length} akun · ${users.filter((u) => u.isActive).length} aktif` : "Memuat..."}
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><UserPlus className="h-4 w-4" /> Tambah Akun</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Akun Baru</DialogTitle>
                <DialogDescription>Buat akun untuk kasir atau owner baru.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-1.5">
                  <Label>Nama</Label>
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Password (min. 8 karakter)</Label>
                  <Input type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select value={draft.role} onValueChange={(v) => setDraft({ ...draft, role: v as "owner" | "cashier" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cashier">Kasir</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button onClick={addUser} disabled={saving}>{saving ? "Menyimpan..." : "Buat Akun"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Terdaftar</TableHead>
                <TableHead>Aktif</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!users ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">Belum ada akun.</TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "owner" ? "default" : "secondary"}>{u.role}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{formatDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <Switch checked={u.isActive} onCheckedChange={(v) => toggleActive(u, v)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(u)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setConfirmDelete(u)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Akun</DialogTitle>
            <DialogDescription>{editTarget?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Nama</Label>
              <Input value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={editDraft.role} onValueChange={(v) => setEditDraft({ ...editDraft, role: v as "owner" | "cashier" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Kasir</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun &quot;{confirmDelete?.name}&quot; akan dihapus permanen.
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
