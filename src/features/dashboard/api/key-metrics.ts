import "server-only";
import { bigquery } from "@/lib/bigquery";
import { redis } from "@/lib/redis";

const CACHE_KEY = "dashboard:key-metrics";
const CACHE_TTL = 300;

type Metric = { value: number; change_percent: number | null };

export type KeyMetrics = {
  period: string;
  previous_period: string | null;
  total_orders: Metric;
  total_items: Metric;
  gross_revenue: Metric;
  average_item_value: Metric;
};

const toChange = (value: unknown) => (value === null ? null : Number(value));

export async function getKeyMetrics(): Promise<KeyMetrics> {
  const cached = await redis.get<KeyMetrics>(CACHE_KEY);
  if (cached) return cached;

  const query = `
    WITH filtered AS (
      SELECT
        order_id,
        sale_price,
        DATE(created_at) AS order_date
      FROM
        \`bigquery-public-data.thelook_ecommerce.order_items\`
      WHERE
        status IN ('Shipped', 'Complete')
    ),
    latest_month AS (
      SELECT
        DATE_SUB(
          DATE_TRUNC(MAX(order_date), MONTH),
          INTERVAL 1 MONTH
        ) AS month_start
      FROM filtered
    ),
    monthly AS (
      SELECT
        DATE_TRUNC(order_date, MONTH) AS month,
        COUNT(DISTINCT order_id) AS total_orders,
        COUNT(*) AS total_items,
        ROUND(SUM(sale_price), 2) AS gross_revenue,
        ROUND(AVG(sale_price), 2) AS average_item_value
      FROM filtered
      GROUP BY month
    )
    SELECT
      FORMAT_DATE('%Y-%m', curr.month) AS period,
      FORMAT_DATE('%Y-%m', previous.month) AS previous_period,

      curr.total_orders,
      ROUND(SAFE_DIVIDE(
        curr.total_orders - previous.total_orders,
        previous.total_orders
      ) * 100, 1) AS orders_change,

      curr.total_items,
      ROUND(SAFE_DIVIDE(
        curr.total_items - previous.total_items,
        previous.total_items
      ) * 100, 1) AS items_change,

      curr.gross_revenue,
      ROUND(SAFE_DIVIDE(
        curr.gross_revenue - previous.gross_revenue,
        previous.gross_revenue
      ) * 100, 1) AS revenue_change,

      curr.average_item_value,
      ROUND(SAFE_DIVIDE(
        curr.average_item_value - previous.average_item_value,
        previous.average_item_value
      ) * 100, 1) AS item_value_change

    FROM latest_month
    JOIN monthly AS curr
      ON curr.month = latest_month.month_start
    LEFT JOIN monthly AS previous
      ON previous.month = DATE_SUB(
        latest_month.month_start,
        INTERVAL 1 MONTH
      )
  `;

  const [rows] = await bigquery.query({ query });
  const row = rows[0];

  if (!row) {
    throw new Error("No monthly metrics found");
  }

  const data: KeyMetrics = {
    period: row.period,
    previous_period: row.previous_period,
    total_orders: {
      value: Number(row.total_orders),
      change_percent: toChange(row.orders_change),
    },
    total_items: {
      value: Number(row.total_items),
      change_percent: toChange(row.items_change),
    },
    gross_revenue: {
      value: Number(row.gross_revenue),
      change_percent: toChange(row.revenue_change),
    },
    average_item_value: {
      value: Number(row.average_item_value),
      change_percent: toChange(row.item_value_change),
    },
  };

  await redis.set(CACHE_KEY, data, { ex: CACHE_TTL });
  return data;
}
