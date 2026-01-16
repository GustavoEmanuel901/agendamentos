import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "../@types/tokenPayload";
import ResponseMessages from "../utils/responseMessages";

const messageReturned = (res: Response) => {
  const isProd = process.env.NODE_ENV === "production";

  return res
    .status(401)
    .clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    })
    .json({ message: ResponseMessages.INVALID_TOKEN });
};

export default async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.cookies?.token || req.headers.authorization;

  if (!authHeader) return messageReturned(res);

  const parts = authHeader.split(" ");

  if (!(parts.length === 2)) return messageReturned(res);

  const [scheme, token] = parts;

  if (scheme !== "Bearer") return messageReturned(res);

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET!) as TokenPayload;

    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin;
    req.permissions = decoded.permissions;

    return next();
  } catch (err) {
    return messageReturned(res);
  }
};
