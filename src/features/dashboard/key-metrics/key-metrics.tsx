"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import Section from "@/features/ui/Section";

interface MetricValue {
  value: number;
  change_percent: number | null;
}

interface Metrics {
  period: string;
  previous_period: string | null;
  total_orders: MetricValue;
  total_items: MetricValue;
  gross_revenue: MetricValue;
  average_item_value: MetricValue;
}

const cards = [
  {
    key: "gross_revenue",
    label: "Gross Revenue",
    icon: DollarSign,
    format: (value: number) =>
      value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
  },
  {
    key: "total_orders",
    label: "Total Orders",
    icon: ShoppingCart,
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    key: "total_items",
    label: "Items Sold",
    icon: Package,
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    key: "average_item_value",
    label: "Average Item Value",
    icon: TrendingUp,
    format: (value: number) =>
      value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
  },
] as const;

export default function KeyMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/dashboard/key-metrics");

        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }

        setMetrics(await response.json());
      } catch {
        setError(true);
      }
    }

    fetchMetrics();
  }, []);

  return (
    <Section title="Key Metrics" description="Monthly performance">
      {error && (
        <p className="mb-5 text-sm text-red-600">
          Unable to load dashboard metrics.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const metric = metrics?.[card.key];
          const change = metric?.change_percent;

          const isPositive =
            change !== null && change !== undefined && change > 0;
          const isNegative =
            change !== null && change !== undefined && change < 0;

          const TrendIcon = isPositive
            ? ArrowUp
            : isNegative
              ? ArrowDown
              : Minus;

          return (
            <div
              key={card.key}
              className="rounded border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {card.label}
                </p>

                <div className="rounded bg-purple-50 p-2.5 text-purple-500">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
              </div>

              <div className="mt-7 text-3xl font-semibold tracking-tight text-gray-900">
                {metric ? card.format(metric.value) : "—"}
              </div>

              {change !== null && change !== undefined ? (
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                      isPositive
                        ? "bg-green-100 text-green-700"
                        : isNegative
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <TrendIcon size={12} strokeWidth={2.5} />
                    {Math.abs(change).toFixed(1)}%
                  </span>

                  <span className="text-xs text-gray-500">
                    vs previous month
                  </span>
                </div>
              ) : (
                <p className="mt-3 text-xs text-gray-400">
                  No previous month comparison
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
