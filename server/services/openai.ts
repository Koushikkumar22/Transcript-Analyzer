import OpenAI from "openai";

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (fenced?.[1] ?? trimmed).trim();
}

export async function analyzeTranscript(content: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Please provide your API key.");
  }

  const openai = new OpenAI({ apiKey });

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
        { role: "user", content },
      ],
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error("OpenAI returned an empty response.");
    }

    return JSON.parse(extractJson(rawContent));
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(error?.message || "Failed to analyze transcript with OpenAI");
  }
}
