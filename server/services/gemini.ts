import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function analyzeTranscript(content: string) {
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
    const response = result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to analyze transcript");
  }
}
