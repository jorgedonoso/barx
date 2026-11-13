import "server-only";
import { getGeminiClient } from "@/lib/gemini";
import { redis } from "@/lib/redis";
import { getKeyMetrics } from "./key-metrics";
import { getMonthlySales } from "./monthly-sales";
import { getTopProductCategories } from "./top-product-categories";

const CACHE_KEY = "dashboard:ai-insights";
const CACHE_TTL = 300;

export type AiInsights = {
  insights: {
    title: string;
    description: string;
    sentiment: "positive" | "negative" | "neutral";
  }[];
};

export async function getAiInsights(): Promise<AiInsights> {
  const cached = await redis.get<AiInsights>(CACHE_KEY);
  if (cached !== null) return cached;

  const [keyMetrics, monthlySales, topCategories] = await Promise.all([
    getKeyMetrics(),
    getMonthlySales(),
    getTopProductCategories(),
  ]);

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

  const response = await getGeminiClient().models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 1000,
    },
  });

  const data = JSON.parse(response.text ?? "") as AiInsights;

  if (!Array.isArray(data.insights) || data.insights.length !== 3) {
    throw new Error("Invalid insights response");
  }

  await redis.set(CACHE_KEY, data, { ex: CACHE_TTL });
  return data;
}
