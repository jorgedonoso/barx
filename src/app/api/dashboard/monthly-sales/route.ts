import { NextResponse } from "next/server";
import { getMonthlySales } from "@/features/dashboard/api/monthly-sales";

export async function GET() {
  try {
    return NextResponse.json(await getMonthlySales());
  } catch (error) {
    console.error("Monthly sales error:", error);

    return NextResponse.json(
      { error: "Failed to retrieve monthly sales" },
      { status: 500 },
    );
  }
}
