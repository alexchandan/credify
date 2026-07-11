import type { UserRole } from "../models/user.model.js";

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export {};
