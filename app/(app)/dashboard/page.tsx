import { DashboardKpis } from "@/components/warung/dashboard-kpis";
import { SalesTrendChart } from "@/components/warung/sales-trend-chart";
import { LowStockPanel } from "@/components/warung/low-stock-panel";
import { TopProducts } from "@/components/warung/top-products";
import { LiveTransactions } from "@/components/warung/live-transactions";

export default function DashboardPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <DashboardKpis />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <SalesTrendChart />
        </div>
        <LowStockPanel />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <LiveTransactions />
        <TopProducts />
      </div>
    </div>
  );
}
