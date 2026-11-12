import { GoogleGenAI } from "@google/genai";

let cachedGemini: GoogleGenAI | null = null;

export function getGeminiClient() {
  if (!cachedGemini) {
    cachedGemini = new GoogleGenAI({
      enterprise: true,
      project: process.env.GCP_PROJECT_ID,
      location: "global",
    });
  }

  return cachedGemini;
}
