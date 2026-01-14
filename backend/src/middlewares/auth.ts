import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "../@types/tokenPayload";
import ResponseMessages from "../utils/responseMessages";

export default async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.cookies?.token || req.headers.authorization;

  if (!authHeader)
    return res.status(401).send({ error: ResponseMessages.INVALID_TOKEN });

  const parts = authHeader.split(" ");

  if (!(parts.length === 2))
    return res.status(401).send({ error: ResponseMessages.INVALID_TOKEN });

  const [scheme, token] = parts;

  if (scheme !== "Bearer")
    return res.status(401).send({ error: ResponseMessages.INVALID_TOKEN });

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET!) as TokenPayload;

    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin;
    req.permissions = decoded.permissions;

    return next();
  } catch (err) {
    return res.status(401).json({ error: ResponseMessages.INVALID_TOKEN });
  }
};
