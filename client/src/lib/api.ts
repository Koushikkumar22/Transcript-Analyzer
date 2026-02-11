import type { Transcript } from "@shared/schema";

async function parseAnalyzeError(response: Response): Promise<string> {
  const fallbackMessage = `Request failed with status ${response.status}`;

  try {
    const parsed = (await response.clone().json()) as { message?: string };
    if (parsed?.message) {
      return parsed.message;
    }
  } catch {
    // ignore JSON parsing errors and fall through to text
  }

  try {
    const text = await response.text();
    if (text) {
      return text;
    }
  } catch {
    // if body cannot be read, fall back to status text
  }

  return response.statusText || fallbackMessage;
}

export async function analyzeTranscript(
  file: File,
  provider: "gemini" | "openai" = "gemini",
): Promise<Transcript> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("provider", provider);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await parseAnalyzeError(response));
  }

  return response.json();
}
