import { GoogleGenerativeAI } from "@google/generative-ai";

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (fenced?.[1] ?? trimmed).trim();
}

export async function analyzeTranscript(content: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please provide your API key.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Analyze this earnings transcript and extract the following information in JSON format:
  - Revenue figure and year-over-year growth (if available)
  - Earnings per share (EPS) figure
  - Guidance for next quarter (if available)
  - Key themes or topics discussed (as an array)
  - Future outlook and plans

  Return the data in this exact format:
  {
    "revenue": {
      "amount": "string",
      "growth": "string (optional)"
    },
    "eps": "string",
    "guidance": "string (optional)",
    "keyThemes": ["string array"],
    "futureOutlook": "string"
  }

  Transcript:
  ${content}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    return JSON.parse(extractJson(text));
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(error?.message || "Failed to analyze transcript with Gemini");
  }
}
