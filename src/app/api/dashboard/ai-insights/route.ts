import { NextResponse } from "next/server";
import { gemini } from "@/lib/gemini";
import { redis } from "@/lib/redis";

const CACHE_KEY = "dashboard:ai-insights";
const CACHE_TTL = 300;

export async function GET(request: Request) {
  try {
    const cached = await redis.get(CACHE_KEY);

    if (cached !== null) {
      return NextResponse.json(cached);
    }

    const baseUrl = new URL(request.url);

    const endpoints = [
      "key-metrics",
      "monthly-sales",
      "top-product-categories",
    ];

    const responses = await Promise.all(
      endpoints.map((endpoint) =>
        fetch(new URL(`/api/dashboard/${endpoint}`, baseUrl), {
          cache: "no-store",
        }),
      ),
    );

    if (responses.some((response) => !response.ok)) {
      throw new Error("Failed to retrieve dashboard data");
    }

    const [keyMetrics, monthlySales, topCategories] = await Promise.all(
      responses.map((response) => response.json()),
    );

    const prompt = `
      You are a business analytics assistant.

      Analyze the following e-commerce dashboard data.

      Key metrics (latest available month vs previous month):
      ${JSON.stringify(keyMetrics)}

      Monthly sales (last 12 months):
      ${JSON.stringify(monthlySales)}

      Top product categories (all available history):
      ${JSON.stringify(topCategories)}

      Generate exactly 3 useful business insights.

      Guidelines:
      - Identify meaningful trends and patterns.
      - Highlight positive or negative changes.
      - Include specific numbers when relevant.
      - Avoid repeating raw dashboard metrics without interpretation.
      - Do not invent facts or make unsupported assumptions.
      - Keep each insight concise and actionable.

      Return JSON in this exact format:
      {
        "insights": [
          {
            "title": "Short title",
            "description": "Business observation",
            "sentiment": "positive"
          }
        ]
      }

      Sentiment must be "positive", "negative", or "neutral".
    `;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 400,
      },
    });

    const data = JSON.parse(response.text ?? "");

    if (!Array.isArray(data.insights) || data.insights.length !== 3) {
      throw new Error("Invalid insights response");
    }

    await redis.set(CACHE_KEY, data, { ex: CACHE_TTL });

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI insights error:", error);

    return NextResponse.json(
      { error: "Failed to generate AI insights" },
      { status: 500 },
    );
  }
}
