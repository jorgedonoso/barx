"use client";

import { Spinner } from "@/features/ui/Spinner";
import { useEffect, useState } from "react";

type Insight = {
  title: string;
  description: string;
  sentiment: "positive" | "negative" | "neutral";
};

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch("/api/dashboard/ai-insights");

        if (!response.ok) {
          throw new Error("Failed to fetch insights");
        }

        const data = await response.json();
        setInsights(data.insights);
      } catch (error) {
        console.error("AI insights error:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <section className="mb-8 rounded border border-purple-300 bg-purple-100 p-6">
      <div className="mb-5 flex items-center gap-2">
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <span className="rounded-full bg-purple-200 px-2 py-1 text-xs text-purple-600 border border-purple-300">
          Powered by Vertex AI
        </span>
      </div>

      {error ? (
        <p className="text-sm text-red-500">Unable to load AI insights.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {insights.map((insight, index) => (
            <article
              key={index}
              className="rounded bg-purple-50 border border-purple-300 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    insight.sentiment === "positive"
                      ? "bg-green-500"
                      : insight.sentiment === "negative"
                        ? "bg-red-500"
                        : "bg-gray-400"
                  }`}
                />
                <h3 className="font-bold">{insight.title}</h3>
              </div>

              <p className="text-sm leading-relaxed text-gray-600">
                {insight.description}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
