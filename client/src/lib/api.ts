import type { Transcript } from "@shared/schema";

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
    let message = `Request failed with status ${response.status}`;

    try {
      const data = await response.json();
      message = data?.message || message;
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }

    throw new Error(message);
  }

  return response.json();
}
