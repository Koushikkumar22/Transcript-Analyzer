import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import multer from "multer";
import { storage } from "./storage";
import { analyzeTranscript as analyzeWithGemini } from "./services/gemini";
import { analyzeTranscript as analyzeWithOpenAI } from "./services/openai";
import { extractText } from "./services/textExtractor";
import { fileUploadSchema } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

function uploadHandler(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "File is too large. Maximum upload size is 5MB."
          : err.message;

      res.status(400).json({ message });
      return;
    }

    next(err);
  });
}

export async function registerRoutes(app: Express) {
  app.post("/api/analyze", uploadHandler, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const validation = fileUploadSchema.safeParse({
        file: req.file,
        provider: req.body.provider || "gemini",
      });

      if (!validation.success) {
        return res.status(400).json({ message: validation.error.message });
      }

      const content = await extractText(req.file);
      const transcript = await storage.createTranscript({
        content,
        provider: validation.data.provider,
      });

      const analysis = await (validation.data.provider === "openai"
        ? analyzeWithOpenAI(content)
        : analyzeWithGemini(content));

      const updated = await storage.updateAnalysis(transcript.id, analysis);
      res.json(updated);
    } catch (error: any) {
      const message = error?.message ?? "Unexpected server error";
      const status = /missing|invalid|No file|Failed to extract|too large/i.test(message) ? 400 : 500;
      res.status(status).json({ message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
