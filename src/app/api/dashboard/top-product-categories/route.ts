import { NextResponse } from "next/server";
import { getTopProductCategories } from "@/features/dashboard/api/top-product-categories";

export async function GET() {
  try {
    return NextResponse.json(await getTopProductCategories());
  } catch (error) {
    console.error("Top product categories error:", error);

    return NextResponse.json(
      { error: "Failed to retrieve top product categories" },
      { status: 500 },
    );
  }
}
