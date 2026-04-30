"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { transactions } from "@/lib/warung/mock-data";
import { formatRupiah } from "@/lib/warung/format";
import { TrendingUp } from "lucide-react";

export function TopProducts() {
  const map = new Map<
    number,
    { name: string; qty: number; revenue: number; sku: string }
  >();
  for (const t of transactions) {
    if (t.status !== "completed") continue;
    for (const it of t.items) {
      const e = map.get(it.productId) || {
        name: it.productName,
        sku: it.sku,
        qty: 0,
        revenue: 0,
      };
      e.qty += it.quantity;
      e.revenue += it.subtotal;
      map.set(it.productId, e);
    }
  }
  const top = Array.from(map.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  const max = top[0]?.qty ?? 1;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          Produk Terlaris
        </CardTitle>
        <CardDescription>5 produk dengan kuantitas terjual tertinggi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada penjualan.</p>
        ) : (
          top.map((p, i) => (
            <div key={p.sku} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium truncate flex items-center gap-2">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {p.name}
                </span>
                <span className="text-muted-foreground shrink-0 ml-2">
                  {p.qty} terjual · {formatRupiah(p.revenue)}
                </span>
              </div>
              <Progress value={(p.qty / max) * 100} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
