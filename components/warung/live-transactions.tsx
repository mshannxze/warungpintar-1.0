"use client";

import { useEffect, useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt } from "lucide-react";
import { api, type Transaction } from "@/lib/warung/api";
import { formatRupiah, formatDateTime } from "@/lib/warung/format";

const paymentColor: Record<string, string> = {
  cash: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  qris: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  transfer: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
};

export function LiveTransactions() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  useEffect(() => {
    api.transactions.list({ limit: 8 }).then(setTransactions).catch(console.error);
  }, []);

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
          {!transactions ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada transaksi.</p>
          ) : (
            <ul className="space-y-3">
              {transactions.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      #{t.id.slice(0, 8)} · {t.cashierName ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatRupiah(Number(t.totalAmount))}</p>
                    <Badge variant="outline" className={`${paymentColor[t.paymentMethod] ?? ""} mt-1 border-0`}>
                      {t.paymentMethod.toUpperCase()}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
