import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "../@types/tokenPayload";

export default async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.cookies?.token || req.headers.authorization;

  console.log("Auth Header:", authHeader);

  if (!authHeader) {
    console.log("No token provided");
    return res.status(401).send({ error: "No token provided" });
  }

  const parts = authHeader.split(" ");

  if (!(parts.length === 2)) {
    console.log("Token error");

    return res.status(401).send({ error: "Token error" });
  }

  const [scheme, token] = parts;

  if (scheme !== "Bearer") {
    console.log("Bad formatted token");

    return res.status(401).send({ error: "Token bad formatted" });
  }

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET!) as TokenPayload;

    console.log("Decoded token:", decoded);

    req.userId = decoded.id;
    req.role = decoded.role;
    req.permissions = decoded.permissions;

    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Token invalid" });
  }
};
