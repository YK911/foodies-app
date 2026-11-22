declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
      };
      sessionId?: string;
    }
  }
}

export {};
