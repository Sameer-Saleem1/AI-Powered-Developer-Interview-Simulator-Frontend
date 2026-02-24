import { z } from 'zod';
import { insertUserSchema, loginSchema, interviewSessions, questions, users } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.object({ user: z.any(), token: z.string() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: loginSchema,
      responses: {
        200: z.object({ user: z.any(), token: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.object({ user: z.any() }),
        401: errorSchemas.unauthorized,
      },
    }
  },
  sessions: {
    list: {
      method: 'GET' as const,
      path: '/api/sessions' as const,
      responses: {
        200: z.array(z.any()), // array of sessions
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sessions' as const,
      input: z.object({
        role: z.string(),
        level: z.string(),
        techStack: z.array(z.string()),
      }),
      responses: {
        201: z.any(), // created session
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/sessions/:id' as const,
      responses: {
        200: z.object({
          session: z.any(),
          questions: z.array(z.any()),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
  questions: {
    answer: {
      method: 'POST' as const,
      path: '/api/questions/:id/answer' as const,
      input: z.object({ answerText: z.string() }),
      responses: {
        200: z.any(), // updated question with AI feedback and score
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
