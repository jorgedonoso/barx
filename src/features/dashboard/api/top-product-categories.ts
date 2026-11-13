import "server-only";
import { bigquery } from "@/lib/bigquery";
import { redis } from "@/lib/redis";

const CACHE_KEY = "dashboard:top-product-categories";
const CACHE_TTL = 300;

export type TopCategory = {
  category: string;
  revenue: number;
};

export async function getTopProductCategories(): Promise<TopCategory[]> {
  const cached = await redis.get<TopCategory[]>(CACHE_KEY);
  if (cached) return cached;

  const query = `
    SELECT
      p.category,
      ROUND(SUM(oi.sale_price), 2) AS revenue
    FROM
      \`bigquery-public-data.thelook_ecommerce.order_items\` oi
    JOIN
      \`bigquery-public-data.thelook_ecommerce.products\` p
    ON
      oi.product_id = p.id
    WHERE
      oi.status IN ('Shipped', 'Complete')
    GROUP BY
      p.category
    ORDER BY
      revenue DESC
    LIMIT 10
  `;

  const [rows] = await bigquery.query({ query });

  const data = rows.map((row) => ({
    category: row.category,
    revenue: Number(row.revenue),
  }));

  await redis.set(CACHE_KEY, data, { ex: CACHE_TTL });
  return data;
}
