"use client";

import Section from "@/features/ui/Section";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { tooltipStyles } from "../tooltip-styles";
import { Spinner } from "@/features/ui/Spinner";

interface CategoryRevenue {
  category: string;
  revenue: number;
}

export default function TopProductCategories() {
  const [data, setData] = useState<CategoryRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard/top-product-categories");

        if (!response.ok) {
          throw new Error("Failed to fetch category data");
        }

        setData(await response.json());
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Section
      title="Top Product Categories"
      description="Revenue by product category"
    >
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-red-600">Unable to load category data.</p>
      ) : (
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e5e7eb"
              />

              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />

              <YAxis
                type="category"
                dataKey="category"
                width={160}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#4b5563", fontSize: 12 }}
              />

              <Tooltip
                {...tooltipStyles}
                formatter={(value) => [
                  `$${Number(value).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                  "Revenue",
                ]}
              />

              <Bar
                dataKey="revenue"
                fill="#8b5cf6"
                radius={[0, 4, 4, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Section>
  );
}
