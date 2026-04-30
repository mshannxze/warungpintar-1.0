"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { DashboardReport } from "@/lib/warung/api";
import { formatRupiah } from "@/lib/warung/format";

type Props = { trend: DashboardReport["trend"] };

const config = {
  total: { label: "Penjualan", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function SalesTrendChart({ trend }: Props) {
  const data = trend.map((t) => ({
    label: new Date(t.day).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit" }),
    total: Number(t.total ?? 0),
    count: t.count,
  }));
  const totalWeek = data.reduce((s, d) => s + d.total, 0);
  const totalCount = data.reduce((s, d) => s + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Penjualan 7 Hari</CardTitle>
        <CardDescription>
          Total {formatRupiah(totalWeek)} dari {totalCount} transaksi minggu ini
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
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false} axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`}
              width={40}
            />
            <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatRupiah(Number(v))} />} />
            <Area type="monotone" dataKey="total" stroke="var(--chart-1)" fill="url(#fillTotal)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
