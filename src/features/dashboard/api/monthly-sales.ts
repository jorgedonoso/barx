import "server-only";
import { bigquery } from "@/lib/bigquery";
import { redis } from "@/lib/redis";

const CACHE_KEY = "dashboard:monthly-sales";
const CACHE_TTL = 300;

export type MonthlySales = {
  month: string;
  total_orders: number;
  revenue: number;
};

export async function getMonthlySales(): Promise<MonthlySales[]> {
  const cached = await redis.get<MonthlySales[]>(CACHE_KEY);
  if (cached !== null) return cached;

  const query = `
    SELECT
      FORMAT_DATE(
        '%Y-%m',
        DATE_TRUNC(DATE(created_at), MONTH)
      ) AS month,
      COUNT(DISTINCT order_id) AS total_orders,
      ROUND(SUM(sale_price), 2) AS revenue
    FROM
      \`bigquery-public-data.thelook_ecommerce.order_items\`
    WHERE
      status IN ('Shipped', 'Complete')
      AND DATE(created_at) >= DATE_SUB(
        DATE_TRUNC(CURRENT_DATE(), MONTH),
        INTERVAL 11 MONTH
      )
    GROUP BY
      month
    ORDER BY
      month
  `;

  const [rows] = await bigquery.query({ query });

  const data = rows.map(
    (row: {
      month: string;
      total_orders: number | string;
      revenue: number | string;
    }) => ({
      month: row.month,
      total_orders: Number(row.total_orders),
      revenue: Number(row.revenue),
    }),
  );

  await redis.set(CACHE_KEY, data, { ex: CACHE_TTL });
  return data;
}
