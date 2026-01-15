import { Request, Response, NextFunction } from "express";
import ResponseMessages from "../utils/responseMessages";

export default async (req: Request, res: Response, next: NextFunction) => {
  if (!req.permissions.logs)
    return res.status(403).send({ error: ResponseMessages.ACCESS_DENIED });

  next();
};
