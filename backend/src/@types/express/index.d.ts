import "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    isAdmin?: boolean;
    permissions: {
      logs: boolean;
      appointments: boolean;
    };
  }
}
