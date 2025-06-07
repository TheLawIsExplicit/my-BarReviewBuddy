import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema, insertStudySessionSchema, insertCustomQuestionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Questions routes
  app.get("/api/questions", async (req, res) => {
    try {
      const { subject } = req.query;
      let questions;
      
      if (subject && typeof subject === 'string') {
        questions = await storage.getQuestionsBySubject(subject);
      } else {
        questions = await storage.getQuestions();
      }
      
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const question = await storage.getQuestionById(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  // User progress routes
  app.get("/api/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const validated = insertUserProgressSchema.parse(req.body);
      
      // Check if progress already exists for this question
      const existing = await storage.getProgressByQuestionId(validated.questionId);
      
      if (existing) {
        const updated = await storage.updateUserProgress(validated.questionId, {
          completed: validated.completed,
          timeSpent: validated.timeSpent,
          studyMode: validated.studyMode
        });
        res.json(updated);
      } else {
        const progress = await storage.createUserProgress(validated);
        res.json(progress);
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  app.put("/api/progress/:questionId", async (req, res) => {
    try {
      const questionId = parseInt(req.params.questionId);
      const updates = req.body;
      
      const updated = await storage.updateUserProgress(questionId, updates);
      
      if (!updated) {
        return res.status(404).json({ message: "Progress not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Study sessions routes
  app.post("/api/sessions", async (req, res) => {
    try {
      const validated = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(validated);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.put("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updated = await storage.updateStudySession(id, updates);
      
      if (!updated) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.get("/api/sessions/active", async (req, res) => {
    try {
      const session = await storage.getActiveStudySession();
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  });

  // Custom questions routes
  app.get("/api/custom-questions", async (req, res) => {
    try {
      const customQuestions = await storage.getCustomQuestions();
      res.json(customQuestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom questions" });
    }
  });

  app.post("/api/custom-questions", async (req, res) => {
    try {
      const validated = insertCustomQuestionSchema.parse(req.body);
      const customQuestion = await storage.createCustomQuestion(validated);
      res.json(customQuestion);
    } catch (error) {
      res.status(400).json({ message: "Invalid custom question data" });
    }
  });

  app.put("/api/custom-questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updated = await storage.updateCustomQuestion(id, updates);
      
      if (!updated) {
        return res.status(404).json({ message: "Custom question not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update custom question" });
    }
  });

  app.delete("/api/custom-questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomQuestion(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Custom question not found" });
      }
      
      res.json({ message: "Custom question deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete custom question" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
