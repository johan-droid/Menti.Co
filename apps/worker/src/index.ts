import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const studySummarySchema = z.object({
  title: z.string(),
  evidenceInsight: z.string(),
  citations: z.array(z.string()).min(1)
});

async function runMockIngestion(inputText: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.log("Skipping AI call: GEMINI_API_KEY not set.");
    return;
  }

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Extract JSON with keys title, evidenceInsight, citations from:\n${inputText}`
  });

  const text = response.text ?? "{}";
  const parsed = studySummarySchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    console.error("Invalid AI output schema", parsed.error.flatten());
    return;
  }

  console.log("Validated AI payload:", parsed.data.title);
}

runMockIngestion("Example clinical paper input").catch((error) => {
  console.error("Worker failed", error);
  process.exit(1);
});
