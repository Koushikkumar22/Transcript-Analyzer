import { apiRequest } from "./queryClient";
import type { Transcript } from "@shared/schema";

export async function analyzeTranscript(file: File): Promise<Transcript> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}
