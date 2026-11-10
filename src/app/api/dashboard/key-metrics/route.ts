import { NextResponse } from "next/server";
import { bigquery } from "@/lib/bigquery";
import { redis } from "@/lib/redis";

const CACHE_KEY = "dashboard:key-metrics";
const CACHE_TTL = 300;

export async function GET() {
  try {
    const cached = await redis.get(CACHE_KEY);

    if (cached) {
      return NextResponse.json(cached);
    }

    const query = `
      SELECT
        COUNT(DISTINCT order_id) AS total_orders,
        COUNT(*) AS total_items,
        ROUND(SUM(sale_price), 2) AS gross_revenue,
        ROUND(AVG(sale_price), 2) AS average_item_value
      FROM
        \`bigquery-public-data.thelook_ecommerce.order_items\`
      WHERE
        status IN ('Shipped', 'Complete')
    `;

    const [rows] = await bigquery.query({ query });

    const data = rows[0];

    await redis.set(CACHE_KEY, data, { ex: CACHE_TTL });

    return NextResponse.json(data);
  } catch (error) {
    console.error("BigQuery metrics error:", error);

    return NextResponse.json(
      { error: "Failed to retrieve metrics" },
      { status: 500 },
    );
  }
}
