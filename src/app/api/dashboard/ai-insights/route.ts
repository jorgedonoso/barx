import { NextResponse } from "next/server";
import { getAiInsights } from "@/features/dashboard/api/ai-insights";

export async function GET() {
  try {
    return NextResponse.json(await getAiInsights());
  } catch (error) {
    console.error("AI insights error:", error);

    return NextResponse.json(
      { error: "Failed to generate AI insights" },
      { status: 500 },
    );
  }
}
