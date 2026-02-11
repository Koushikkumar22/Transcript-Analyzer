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
    const fallbackMessage = `Request failed with status ${response.status}`;
    let parsedMessage: string | undefined;

    try {
      const parsed = (await response.clone().json()) as { message?: string };
      parsedMessage = parsed.message;
    } catch {
      // response body is not JSON; we'll try text below
    }

    if (parsedMessage) {
      throw new Error(parsedMessage);
    }

    const rawBody = await response.text();
    throw new Error(rawBody || fallbackMessage);
  }

  return response.json();
}
