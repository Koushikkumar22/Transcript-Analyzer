import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to analyze transcript with OpenAI");
  }
}
