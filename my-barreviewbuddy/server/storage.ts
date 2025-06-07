import { 
  questions, 
  userProgress, 
  studySessions,
  customQuestions,
  users,
  type Question, 
  type InsertQuestion,
  type UserProgress,
  type InsertUserProgress,
  type StudySession,
  type InsertStudySession,
  type CustomQuestion,
  type InsertCustomQuestion,
  type User, 
  type InsertUser 
} from "@shared/schema";
import { questionsData } from "../client/src/lib/questions-data";

export interface IStorage {
  // Questions
  getQuestions(): Promise<Question[]>;
  getQuestionById(id: number): Promise<Question | undefined>;
  getQuestionsBySubject(subject: string): Promise<Question[]>;
  
  // Custom Questions
  getCustomQuestions(): Promise<CustomQuestion[]>;
  getCustomQuestionById(id: number): Promise<CustomQuestion | undefined>;
  createCustomQuestion(question: InsertCustomQuestion): Promise<CustomQuestion>;
  updateCustomQuestion(id: number, updates: Partial<CustomQuestion>): Promise<CustomQuestion | undefined>;
  deleteCustomQuestion(id: number): Promise<boolean>;
  
  // User Progress
  getUserProgress(): Promise<UserProgress[]>;
  getProgressByQuestionId(questionId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(questionId: number, updates: Partial<UserProgress>): Promise<UserProgress | undefined>;
  
  // Study Sessions
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: number, updates: Partial<StudySession>): Promise<StudySession | undefined>;
  getActiveStudySession(): Promise<StudySession | undefined>;
  
  // Users (existing)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private questions: Map<number, Question>;
  private customQuestions: Map<number, CustomQuestion>;
  private userProgress: Map<number, UserProgress>;
  private studySessions: Map<number, StudySession>;
  private users: Map<number, User>;
  private currentQuestionId: number;
  private currentCustomQuestionId: number;
  private currentProgressId: number;
  private currentSessionId: number;
  private currentUserId: number;

  constructor() {
    this.questions = new Map();
    this.customQuestions = new Map();
    this.userProgress = new Map();
    this.studySessions = new Map();
    this.users = new Map();
    this.currentQuestionId = 1;
    this.currentCustomQuestionId = 1000; // Start custom questions at 1000
    this.currentProgressId = 1;
    this.currentSessionId = 1;
    this.currentUserId = 1;
    
    // Initialize with sample questions data
    this.initializeQuestions();
  }

  private initializeQuestions() {
    questionsData.forEach((questionData) => {
      const question: Question = {
        id: this.currentQuestionId++,
        ...questionData
      };
      this.questions.set(question.id, question);
    });
  }

  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestionById(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getQuestionsBySubject(subject: string): Promise<Question[]> {
    if (subject === 'all') {
      return this.getQuestions();
    }
    return Array.from(this.questions.values()).filter(
      (question) => question.subject.toLowerCase().includes(subject.toLowerCase())
    );
  }

  async getUserProgress(): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values());
  }

  async getProgressByQuestionId(questionId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      (progress) => progress.questionId === questionId
    );
  }

  async getCustomQuestions(): Promise<CustomQuestion[]> {
    return Array.from(this.customQuestions.values());
  }

  async getCustomQuestionById(id: number): Promise<CustomQuestion | undefined> {
    return this.customQuestions.get(id);
  }

  async createCustomQuestion(question: InsertCustomQuestion): Promise<CustomQuestion> {
    const id = this.currentCustomQuestionId++;
    const newQuestion: CustomQuestion = { 
      id,
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty,
      timeLimit: question.timeLimit,
      question: question.question,
      answer: question.answer,
      codal: question.codal || null,
      jurisprudence: question.jurisprudence || null,
      createdAt: question.createdAt,
      isCustom: true
    };
    this.customQuestions.set(id, newQuestion);
    return newQuestion;
  }

  async updateCustomQuestion(id: number, updates: Partial<CustomQuestion>): Promise<CustomQuestion | undefined> {
    const existing = this.customQuestions.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.customQuestions.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteCustomQuestion(id: number): Promise<boolean> {
    return this.customQuestions.delete(id);
  }

  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentProgressId++;
    const newProgress: UserProgress = { 
      ...progress, 
      id,
      completed: progress.completed ?? false,
      timeSpent: progress.timeSpent ?? null,
      userAnswer: progress.userAnswer ?? null
    };
    this.userProgress.set(id, newProgress);
    return newProgress;
  }

  async updateUserProgress(questionId: number, updates: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const existing = await this.getProgressByQuestionId(questionId);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.userProgress.set(existing.id, updated);
      return updated;
    }
    return undefined;
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const id = this.currentSessionId++;
    const newSession: StudySession = { 
      ...session, 
      id,
      endTime: session.endTime ?? null,
      questionsCompleted: session.questionsCompleted ?? null,
      totalTime: session.totalTime ?? null
    };
    this.studySessions.set(id, newSession);
    return newSession;
  }

  async updateStudySession(id: number, updates: Partial<StudySession>): Promise<StudySession | undefined> {
    const existing = this.studySessions.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.studySessions.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getActiveStudySession(): Promise<StudySession | undefined> {
    return Array.from(this.studySessions.values()).find(
      (session) => !session.endTime
    );
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
