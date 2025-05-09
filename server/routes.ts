import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as path from "path";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (_req, file, callback) => {
    const acceptedAudioTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a"];
    const acceptedVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
    
    if (file.fieldname === "audio" && acceptedAudioTypes.includes(file.mimetype)) {
      callback(null, true);
    } else if (file.fieldname === "video" && acceptedVideoTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for voice detection
  app.post("/api/voice-detection", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }
      
      // Process the audio file and analyze it
      const result = await storage.analyzeVoice(req.file);
      res.json(result);
    } catch (error) {
      console.error("Error in voice detection:", error);
      res.status(500).json({ message: "Error processing audio file" });
    }
  });

  // API endpoint for deepfake detection
  app.post("/api/deepfake-detection", upload.single("video"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }
      
      // Process the video file and analyze it
      const result = await storage.analyzeVideo(req.file);
      res.json(result);
    } catch (error) {
      console.error("Error in deepfake detection:", error);
      res.status(500).json({ message: "Error processing video file" });
    }
  });

  // API endpoint for phishing link detection
  app.post("/api/phishing-detection/link", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "No URL provided" });
      }
      
      // Analyze the URL for phishing indicators
      const result = await storage.analyzeLink(url);
      res.json(result);
    } catch (error) {
      console.error("Error in link analysis:", error);
      res.status(500).json({ message: "Error analyzing link" });
    }
  });

  // API endpoint for phishing email detection
  app.post("/api/phishing-detection/email", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "No email content provided" });
      }
      
      // Analyze the email content for phishing indicators
      const result = await storage.analyzeEmail(content);
      res.json(result);
    } catch (error) {
      console.error("Error in email analysis:", error);
      res.status(500).json({ message: "Error analyzing email" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
