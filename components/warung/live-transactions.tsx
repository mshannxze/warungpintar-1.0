"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { transactions } from "@/lib/warung/mock-data";
import { formatRupiah, formatDateTime } from "@/lib/warung/format";
import { Receipt } from "lucide-react";

const paymentColor: Record<string, string> = {
  cash: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  qris: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  transfer: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
};

export function LiveTransactions() {
  const recent = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 8);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Transaksi Terbaru
        </CardTitle>
        <CardDescription>Riwayat transaksi dari semua kasir</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-3">
          <ul className="space-y-3">
            {recent.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    #{t.id} · {t.cashierName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t.items.length} item ·{" "}
                    {formatDateTime(t.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">
                    {formatRupiah(t.totalAmount)}
                  </p>
                  <Badge
                    variant="outline"
                    className={`${paymentColor[t.paymentMethod]} mt-1 border-0`}
                  >
                    {t.paymentMethod.toUpperCase()}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
