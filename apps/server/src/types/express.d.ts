import type { Resume, User as PrismaUser } from "@prisma/client";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user?: PrismaUser;
      service?: {
        externalId: string;
        serviceProvider: string;
        type: string;
        iat: number;
      };
      payload?: {
        resume: Resume;
      };
    }
  }
}

export {};
