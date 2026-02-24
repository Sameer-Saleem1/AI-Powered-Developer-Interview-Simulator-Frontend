import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const interviewSessions = pgTable("interview_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(), // Frontend, Backend, Full Stack
  level: text("level").notNull(), // Junior, Mid, Senior
  techStack: text("tech_stack").array().notNull(),
  totalScore: integer("total_score"), // out of 100
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  questionText: text("question_text").notNull(),
  answerText: text("answer_text"),
  aiFeedback: text("ai_feedback"),
  score: integer("score"), // 0-20
});

export const usersRelations = relations(users, ({ many }) => ({
  interviewSessions: many(interviewSessions),
}));

export const interviewSessionsRelations = relations(
  interviewSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [interviewSessions.userId],
      references: [users.id],
    }),
    questions: many(questions),
  }),
);

export const questionsRelations = relations(questions, ({ one }) => ({
  session: one(interviewSessions, {
    fields: [questions.sessionId],
    references: [interviewSessions.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertInterviewSessionSchema = createInsertSchema(
  interviewSessions,
).omit({ id: true, createdAt: true });
export type InsertInterviewSession = z.infer<
  typeof insertInterviewSessionSchema
>;
export type InterviewSession = typeof interviewSessions.$inferSelect;

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

// Request/Response types
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginRequest = z.infer<typeof loginSchema>;

export type AuthResponse = { user: Omit<User, "password">; token: string };

export type CreateSessionRequest = Omit<
  InsertInterviewSession,
  "userId" | "totalScore" | "summary"
>;

export type SubmitAnswerRequest = { answerText: string };
export type AnswerResponse = Question;
