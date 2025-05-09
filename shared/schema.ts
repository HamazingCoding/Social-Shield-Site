import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  voiceAnalyses: many(voiceAnalyses),
  videoAnalyses: many(videoAnalyses),
  linkAnalyses: many(linkAnalyses),
  emailAnalyses: many(emailAnalyses),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Voice analysis schema
export const voiceAnalyses = pgTable("voice_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  filename: text("filename"),
  isAI: boolean("is_ai").notNull(),
  confidence: integer("confidence").notNull(),
  details: jsonb("details").$type<string[]>().notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const voiceAnalysesRelations = relations(voiceAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [voiceAnalyses.userId],
    references: [users.id],
  }),
}));

export const insertVoiceAnalysisSchema = createInsertSchema(voiceAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertVoiceAnalysis = z.infer<typeof insertVoiceAnalysisSchema>;
export type VoiceAnalysis = typeof voiceAnalyses.$inferSelect;

// Video analysis schema
export const videoAnalyses = pgTable("video_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  filename: text("filename"),
  isAuthentic: boolean("is_authentic").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  manipulationMarkers: integer("manipulation_markers").notNull(),
  details: jsonb("details").$type<string[]>().notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoAnalysesRelations = relations(videoAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [videoAnalyses.userId],
    references: [users.id],
  }),
}));

export const insertVideoAnalysisSchema = createInsertSchema(videoAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertVideoAnalysis = z.infer<typeof insertVideoAnalysisSchema>;
export type VideoAnalysis = typeof videoAnalyses.$inferSelect;

// Link analysis schema
export const linkAnalyses = pgTable("link_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  url: text("url").notNull(),
  isPhishing: boolean("is_phishing").notNull(),
  confidence: integer("confidence").notNull(),
  details: jsonb("details").$type<string[]>().notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const linkAnalysesRelations = relations(linkAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [linkAnalyses.userId],
    references: [users.id],
  }),
}));

export const insertLinkAnalysisSchema = createInsertSchema(linkAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertLinkAnalysis = z.infer<typeof insertLinkAnalysisSchema>;
export type LinkAnalysis = typeof linkAnalyses.$inferSelect;

// Email analysis schema
export const emailAnalyses = pgTable("email_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  isPhishing: boolean("is_phishing").notNull(),
  riskLevel: integer("risk_level").notNull(),
  senderStatus: text("sender_status").notNull(),
  linksStatus: text("links_status").notNull(),
  contentStatus: text("content_status").notNull(),
  urgencyLevel: text("urgency_level").notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailAnalysesRelations = relations(emailAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [emailAnalyses.userId],
    references: [users.id],
  }),
}));

export const insertEmailAnalysisSchema = createInsertSchema(emailAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertEmailAnalysis = z.infer<typeof insertEmailAnalysisSchema>;
export type EmailAnalysis = typeof emailAnalyses.$inferSelect;

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
