import { NextResponse } from "next/server";
import { getKeyMetrics } from "@/features/dashboard/api/key-metrics";

export async function GET() {
  try {
    return NextResponse.json(await getKeyMetrics());
  } catch (error) {
    console.error("BigQuery metrics error:", error);

    return NextResponse.json(
      { error: "Failed to retrieve metrics" },
      { status: 500 },
    );
  }
}
