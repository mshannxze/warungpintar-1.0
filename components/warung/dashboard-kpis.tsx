"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Banknote, Receipt, TrendingUp, AlertTriangle } from "lucide-react";
import type { DashboardReport } from "@/lib/warung/api";
import { formatRupiah, formatNumber } from "@/lib/warung/format";

export function DashboardKpis({ data }: { data: DashboardReport }) {
  const { today, lowStockCount } = data;

  const kpis = [
    {
      label: "Penjualan Hari Ini",
      value: formatRupiah(today.totalSales),
      icon: Banknote,
      tone: "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    {
      label: "Transaksi Hari Ini",
      value: formatNumber(today.transactionCount),
      icon: Receipt,
      tone: "text-sky-600 bg-sky-100 dark:bg-sky-500/15 dark:text-sky-400",
    },
    {
      label: "Laba Kotor Hari Ini",
      value: formatRupiah(today.grossProfit),
      icon: TrendingUp,
      tone: "text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400",
    },
    {
      label: "Stok Menipis",
      value: `${lowStockCount} produk`,
      icon: AlertTriangle,
      tone: "text-amber-700 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg grid place-items-center ${kpi.tone}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">{kpi.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
