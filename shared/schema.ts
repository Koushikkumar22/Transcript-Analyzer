import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  provider: text("provider").notNull().default('gemini'),
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
  provider: true,
});

// Validation schemas
export const fileUploadSchema = z.object({
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    buffer: z.any(), // Buffer is not directly validatable by zod
    size: z.number()
  }).refine(
    (file) => {
      const validTypes = [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      return validTypes.includes(file.mimetype) && file.size <= 5 * 1024 * 1024;
    },
    "File must be a TXT, PDF, DOC, or DOCX document under 5MB"
  ),
  provider: z.enum(['gemini', 'openai']).default('gemini'),
});

export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type Transcript = typeof transcripts.$inferSelect;