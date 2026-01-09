import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "../@types/tokenPayload";

export default async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.cookies?.token;
  if (!authHeader) {
    return res.status(401).send({ error: "No token provided" });
  }

  const parts = authHeader.split(" ");

  if (!(parts.length === 2)) {
    return res.status(401).send({ error: "Token error" });
  }

  const [scheme, token] = parts;

  if (scheme !== "Bearer") {
    return res.status(401).send({ error: "Token bad formatted" });
  }

  if (!token) {
    return res.status(401).send({ error: "Token null" });
  }

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET!) as TokenPayload;

    req.userId = decoded.id;
    req.role = decoded.role;
    req.permissions.logs = decoded.permissions.logs;
    req.permissions.appointment = decoded.permissions.appointment;

    return next();
  } catch {
    return res.status(401).json({ error: "Token invalid" });
  }
};
