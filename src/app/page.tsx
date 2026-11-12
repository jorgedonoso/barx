import AIInsights from "@/features/dashboard/ai-insights/ai-insights";
import DashboardHeader from "@/features/dashboard/DashboardHeader";
import KeyMetrics from "@/features/dashboard/key-metrics/key-metrics";
import MonthlySales from "@/features/dashboard/monthly-sales/monthly-sales";
import TopProductCategories from "@/features/dashboard/top-product-categories/top-product-categories";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      <DashboardHeader />

      <main>
        <AIInsights />
        <KeyMetrics />
        <MonthlySales />
        <TopProductCategories />
      </main>
    </div>
  );
}
