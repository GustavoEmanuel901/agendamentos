import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken";
import LogController from "./LogController";
import ResponseMessages from "../utils/responseMessages";
import { loginSchema } from "../schemas/LoginSchema";

export default class LoginController {
  async login(req: Request, res: Response) {
    try {
      const payload = loginSchema.parse(req.body);

      const user = await User.findOne({
        where: { email: payload.email, status: true },
      });

      if (!user)
        return res
          .status(404)
          .send({ message: ResponseMessages.USER_NOT_FOUND });

      if (
        !(await bcrypt.compare(payload.password, user.dataValues.password_hash))
      )
        return res
          .status(404)
          .send({ message: ResponseMessages.INCORRECT_PASSWORD });

      const token = generateToken({
        id: user.dataValues.id,
        isAdmin: user.dataValues.admin,
        permissions: {
          logs: user.dataValues.permission_logs,
          appointments: user.dataValues.permission_appointments,
        },
      });

      const logController = new LogController();

      logController.create({
        description: `Login.`,
        module: "Minha Conta",
        user_id: user.dataValues.id,
      });

      const isProd = process.env.NODE_ENV === "production";

      return res
        .status(200)
        .cookie("token", "Bearer " + token, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24, // 1 dia
        })
        .cookie("admin", user.dataValues.admin, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24, // 1 dia
        })
        .status(200)
        .json({
          id: user.dataValues.id,
          is_admin: user.dataValues.admin,
          name: user.dataValues.name,
          permissions: {
            logs: user.dataValues.permission_logs,
            appointments: user.dataValues.permission_appointments,
          },
          message: ResponseMessages.LOGIN_SUCCESS,
        });
    } catch (error) {
      return res
        .status(500)
        .send({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const logController = new LogController();

      logController.create({
        description: `Logout.`,
        module: "Minha Conta",
        user_id: Number(req.userId),
      });

      const isProd = process.env.NODE_ENV === "production";

      return res
        .clearCookie("token", {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
        })
        .status(200)
        .json({ message: ResponseMessages.LOGOUT_SUCCESS });
    } catch (error) {
      return res
        .status(500)
        .send({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }
}
