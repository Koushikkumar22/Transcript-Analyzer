import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  analysis: jsonb("analysis").$type<{
    revenue?: {
      amount: string;
      growth?: string;
    };
    eps?: string;
    guidance?: string;
    keyThemes: string[];
    futureOutlook?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTranscriptSchema = createInsertSchema(transcripts).pick({
  content: true,
});

// Validation schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB"
  ),
});

export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type Transcript = typeof transcripts.$inferSelect;
