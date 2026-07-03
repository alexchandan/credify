// src/types/express/index.d.ts
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export {};
