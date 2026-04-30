"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { users as initialUsers } from "@/lib/warung/mock-data";
import type { AppUser, UserRole } from "@/lib/warung/types";
import { formatDate } from "@/lib/warung/format";

export function UsersScreen() {
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier" as UserRole,
  });

  function toggleActive(id: string, value: boolean) {
    setUsers((cur) =>
      cur.map((u) => (u.id === id ? { ...u, isActive: value } : u)),
    );
    toast.success(`Akun ${value ? "diaktifkan" : "dinonaktifkan"}`);
  }

  function removeUser(id: string) {
    const u = users.find((x) => x.id === id);
    setUsers((cur) => cur.filter((x) => x.id !== id));
    toast.success(`Akun ${u?.name ?? ""} dihapus`);
  }

  function addUser() {
    if (!draft.name.trim() || !draft.email.trim() || draft.password.length < 8) {
      toast.error("Lengkapi data — password min. 8 karakter");
      return;
    }
    const id = `u-${Date.now().toString(36)}`;
    setUsers((cur) => [
      ...cur,
      {
        id,
        name: draft.name,
        email: draft.email,
        role: draft.role,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]);
    toast.success(`Akun ${draft.name} (${draft.role}) dibuat`);
    setDraft({ name: "", email: "", password: "", role: "cashier" });
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Manajemen Pengguna</CardTitle>
            <CardDescription>
              {users.length} akun · {users.filter((u) => u.isActive).length} aktif
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="self-start sm:self-auto">
                <UserPlus className="h-4 w-4 mr-1" /> Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Pengguna</DialogTitle>
                <DialogDescription>
                  Buat akun baru dengan role owner atau cashier.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label>Nama</Label>
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Nama lengkap"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={draft.email}
                    onChange={(e) =>
                      setDraft({ ...draft, email: e.target.value })
                    }
                    placeholder="user@warungmadura.id"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={draft.password}
                    onChange={(e) =>
                      setDraft({ ...draft, password: e.target.value })
                    }
                    placeholder="Min. 8 karakter"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select
                    value={draft.role}
                    onValueChange={(v) =>
                      setDraft({ ...draft, role: v as UserRole })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cashier">Cashier (Kasir)</SelectItem>
                      <SelectItem value="owner">Owner (Pemilik)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button onClick={addUser}>
                  <Plus className="h-4 w-4 mr-1" /> Buat Akun
                </Button>
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-center">Aktif</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "owner" ? "default" : "secondary"}
                    >
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(u.createdAt)}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={u.isActive}
                      onCheckedChange={(v) => toggleActive(u.id, v)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeUser(u.id)}
                      disabled={u.role === "owner"}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
