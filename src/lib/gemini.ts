import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({
  enterprise: true,
  project: process.env.GCP_PROJECT_ID,
  location: "global",
});
