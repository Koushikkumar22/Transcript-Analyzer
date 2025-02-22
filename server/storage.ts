import { transcripts, type Transcript, type InsertTranscript } from "@shared/schema";

export interface IStorage {
  createTranscript(transcript: InsertTranscript): Promise<Transcript>;
  updateAnalysis(id: number, analysis: Transcript["analysis"]): Promise<Transcript>;
  getTranscript(id: number): Promise<Transcript | undefined>;
}

export class MemStorage implements IStorage {
  private transcripts: Map<number, Transcript>;
  private currentId: number;

  constructor() {
    this.transcripts = new Map();
    this.currentId = 1;
  }

  async createTranscript(insertTranscript: InsertTranscript): Promise<Transcript> {
    const id = this.currentId++;
    const transcript: Transcript = {
      ...insertTranscript,
      id,
      analysis: null,
      createdAt: new Date(),
    };
    this.transcripts.set(id, transcript);
    return transcript;
  }

  async updateAnalysis(
    id: number,
    analysis: Transcript["analysis"]
  ): Promise<Transcript> {
    const transcript = await this.getTranscript(id);
    if (!transcript) {
      throw new Error("Transcript not found");
    }
    const updated = { ...transcript, analysis };
    this.transcripts.set(id, updated);
    return updated;
  }

  async getTranscript(id: number): Promise<Transcript | undefined> {
    return this.transcripts.get(id);
  }
}

export const storage = new MemStorage();
