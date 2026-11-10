"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlySales {
  month: string;
  total_orders: number;
  revenue: number;
}

export default function MonthlySales() {
  const [data, setData] = useState<MonthlySales[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard/monthly-sales");

        if (!response.ok) {
          throw new Error("Failed to fetch monthly sales");
        }

        setData(await response.json());
      } catch {
        setError(true);
      }
    }

    fetchData();
  }, []);

  const formatMonth = (month: string) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });

  return (
    <section className="my-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight border-b border-b-purple-300">
          Monthly Sales Trend
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Revenue and order volume over the past 12 months
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-600">Unable to load monthly sales.</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-400">Loading chart...</p>
      ) : (
        <div className="rounded border border-gray-200 bg-white p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 15, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  yAxisId="revenue"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  labelFormatter={(label) => formatMonth(String(label))}
                  formatter={(value, name) => [
                    name === "Revenue"
                      ? `$${Number(value).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : Number(value).toLocaleString("en-US"),
                    name,
                  ]}
                />

                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />

                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="total_orders"
                  name="Orders"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              Revenue
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Orders
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
