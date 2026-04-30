"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { transactions } from "@/lib/warung/mock-data";
import { formatRupiah } from "@/lib/warung/format";

function buildSeries() {
  const days: { key: string; label: string; total: number; count: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "2-digit",
    });
    days.push({ key, label, total: 0, count: 0 });
  }
  for (const t of transactions) {
    if (t.status !== "completed") continue;
    const k = new Date(t.createdAt).toISOString().slice(0, 10);
    const day = days.find((d) => d.key === k);
    if (day) {
      day.total += t.totalAmount;
      day.count += 1;
    }
  }
  return days;
}

const config = {
  total: { label: "Penjualan", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function SalesTrendChart() {
  const data = buildSeries();
  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Penjualan 7 Hari</CardTitle>
        <CardDescription>
          Total {formatRupiah(total)} dari{" "}
          {data.reduce((s, d) => s + d.count, 0)} transaksi minggu ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[260px] w-full">
          <AreaChart data={data} margin={{ left: 8, right: 8 }}>
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`
              }
              width={40}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(v) => formatRupiah(Number(v))}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--chart-1)"
              fill="url(#fillTotal)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
