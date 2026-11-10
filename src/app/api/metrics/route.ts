import { NextResponse } from "next/server";
import { bigquery } from "@/lib/bigquery";

export async function GET() {
  try {
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

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("BigQuery error:", error);

    return NextResponse.json(
      { error: "Failed to retrieve metrics" },
      { status: 500 },
    );
  }
}
