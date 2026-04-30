"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import type { DashboardReport } from "@/lib/warung/api";
import { formatRupiah } from "@/lib/warung/format";

type Props = { topProducts: DashboardReport["topProducts"] };

export function TopProducts({ topProducts }: Props) {
  const top = topProducts.slice(0, 5);
  const max = Math.max(1, ...top.map((p) => Number(p.qty ?? 0)));

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
          top.map((p, i) => {
            const qty = Number(p.qty ?? 0);
            const revenue = Number(p.revenue ?? 0);
            return (
              <div key={p.productId} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium truncate flex items-center gap-2">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    {p.productName ?? `Produk #${p.productId}`}
                  </span>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {qty} terjual · {formatRupiah(revenue)}
                  </span>
                </div>
                <Progress value={(qty / max) * 100} />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
