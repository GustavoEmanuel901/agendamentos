import { Request, Response, NextFunction } from "express";
import ErrorMessage from "../utils/responseMessages";

export default async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAdmin)
    return res.status(403).json({ message: ErrorMessage.ACCESS_DENIED });

  next();
};
