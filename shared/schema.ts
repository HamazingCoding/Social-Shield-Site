import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original user schema (maintained for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Voice Analysis types
export type VoiceAnalysisResult = {
  isAI: boolean;
  confidence: number;
  details: string[];
  recommendations: string[];
};

// Deepfake Video Analysis types
export type DeepfakeAnalysisResult = {
  isAuthentic: boolean;
  confidenceScore: number;
  manipulationMarkers: number;
  details: string[];
  recommendations: string[];
};

// Link Analysis types
export type LinkAnalysisResult = {
  isPhishing: boolean;
  confidence: number;
  details: string[];
  recommendations: string[];
};

// Email Analysis types
export type PhishingDetails = {
  title: string;
  description: string;
};

export type EmailDetails = {
  sender: string;
  links: string;
  content: string;
  urgency: string;
};

export type EmailAnalysisResult = {
  isPhishing: boolean;
  riskLevel: number;
  details: EmailDetails;
  recommendations: string[];
};
