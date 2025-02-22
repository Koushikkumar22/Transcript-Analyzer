import type { Express } from "express";
import { createServer } from "http";
import multer from "multer";
import { storage } from "./storage";
import { analyzeTranscript } from "./services/gemini";
import { extractText } from "./services/textExtractor";
import { fileUploadSchema } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export async function registerRoutes(app: Express) {
  app.post("/api/analyze", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Validate file size
      const validation = fileUploadSchema.safeParse({
        file: req.file,
      });

      if (!validation.success) {
        return res.status(400).json({ message: validation.error.message });
      }

      // Extract text from file
      const content = await extractText(req.file);

      // Create transcript record
      const transcript = await storage.createTranscript({ content });

      // Analyze with Gemini
      const analysis = await analyzeTranscript(content);

      // Update transcript with analysis
      const updated = await storage.updateAnalysis(transcript.id, analysis);

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
