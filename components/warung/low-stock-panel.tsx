"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";
import type { DashboardReport } from "@/lib/warung/api";

type Props = { lowStock: DashboardReport["lowStock"] };

export function LowStockPanel({ lowStock }: Props) {
  const items = [...lowStock].sort((a, b) => a.currentStock - b.currentStock);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Stok Menipis
        </CardTitle>
        <CardDescription>{items.length} produk di bawah batas minimum</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[260px] pr-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Semua stok aman 🎉</p>
          ) : (
            <ul className="space-y-3">
              {items.map((p) => {
                const empty = p.currentStock === 0;
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.sku} · min {p.minStock} {p.unit}
                      </p>
                    </div>
                    <Badge variant={empty ? "destructive" : "secondary"} className="shrink-0">
                      {p.currentStock} {p.unit}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
