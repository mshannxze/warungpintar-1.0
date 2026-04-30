"use client";

import { useEffect, useState } from "react";
import { demoApi } from "@/lib/warung/demo-api";
import type { DashboardReport } from "@/lib/warung/api";
import { DashboardKpis } from "./dashboard-kpis";
import { SalesTrendChart } from "./sales-trend-chart";
import { LowStockPanel } from "./low-stock-panel";
import { TopProducts } from "./top-products";
import { Skeleton } from "@/components/ui/skeleton";

export function DemoDashboardClient() {
    const [data, setData] = useState<DashboardReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        demoApi.reports.dashboard()
            .then(setData)
            .catch((e) => setError(e.message));
    }, []);

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive">
                Gagal memuat data demo: {error}
            </div>
        );
    }

    if (!data) {
        return (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    <Skeleton className="lg:col-span-2 h-72 rounded-xl" />
                    <Skeleton className="h-72 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <Skeleton className="h-72 rounded-xl" />
                    <Skeleton className="h-72 rounded-xl" />
                </div>
            </>
        );
    }

    return (
        <>
            <DashboardKpis data={data} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2">
                    <SalesTrendChart trend={data.trend} />
                </div>
                <LowStockPanel lowStock={data.lowStock} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <TopProducts topProducts={data.topProducts} />
            </div>
        </>
    );
}
