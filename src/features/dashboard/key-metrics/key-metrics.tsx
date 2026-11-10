"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";

interface Metrics {
  total_orders: number;
  total_items: number;
  gross_revenue: number;
  average_item_value: number;
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
    <section className="my-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight border-b border-b-purple-300">
          Key Metrics
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Overview of eCommerce performance
        </p>
      </div>

      {error && (
        <p className="mb-5 text-sm text-red-600">
          Unable to load dashboard metrics.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const value = metrics?.[card.key];

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
                {value !== undefined ? card.format(value) : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
