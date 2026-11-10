import { NextResponse } from "next/server";
import { bigquery } from "@/lib/bigquery";

export async function GET() {
  try {
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

    return NextResponse.json(
      rows.map((row) => ({
        category: row.category,
        revenue: Number(row.revenue),
      })),
    );
  } catch (error) {
    console.error("Top product categories error:", error);

    return NextResponse.json(
      { error: "Failed to retrieve top product categories" },
      { status: 500 },
    );
  }
}
