import { Request, Response, NextFunction } from "express";

export default async (req: Request, res: Response, next: NextFunction) => {
  if (!req.role) {
    return res
      .status(403)
      .json({ message: "Somente admins podem fazer essa operação" });
  }

  next();
};
