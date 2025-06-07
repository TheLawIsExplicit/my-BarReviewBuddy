import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(), // 'Easy', 'Medium', 'Hard'
  timeLimit: integer("time_limit").notNull(), // in minutes
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  codal: text("codal"),
  jurisprudence: text("jurisprudence"),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  completed: boolean("completed").default(false),
  timeSpent: integer("time_spent"), // in seconds
  studyMode: text("study_mode").notNull(), // 'practice' or 'timed'
  userAnswer: text("user_answer"), // User's practice answer
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  mode: text("mode").notNull(), // 'practice' or 'timed'
  questionsCompleted: integer("questions_completed").default(0),
  totalTime: integer("total_time").default(0), // in seconds
});

export const customQuestions = pgTable("custom_questions", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(),
  timeLimit: integer("time_limit").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  codal: text("codal"),
  jurisprudence: text("jurisprudence"),
  createdAt: text("created_at").notNull(),
  isCustom: boolean("is_custom").default(true),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
});

export const insertCustomQuestionSchema = createInsertSchema(customQuestions).omit({
  id: true,
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type CustomQuestion = typeof customQuestions.$inferSelect;
export type InsertCustomQuestion = z.infer<typeof insertCustomQuestionSchema>;

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
