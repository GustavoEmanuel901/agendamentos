import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generate_token";
import LogController from "./LogController";
import ResponseMessages from "../utils/responseMessages";

export default class LoginController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({
        where: { email, status: true },
      });

      if (!user) {
        return res.status(404).send({ error: ResponseMessages.USER_NOT_FOUND });
      }

      if (!(await bcrypt.compare(password, user.dataValues.password_hash))) {
        return res
          .status(404)
          .send({ error: ResponseMessages.INCORRECT_PASSWORD });
      }

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
        description: `Usuário realizou login.`,
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
          user_id: user.dataValues.id,
          role: user.dataValues.admin,
          nome: user.dataValues.name,
          permissions: {
            logs: user.dataValues.permission_logs,
            appointment: user.dataValues.permission_appointments,
          },
          message: "Logado com sucesso",
        });
    } catch (error) {
      return res
        .status(500)
        .send({ error: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const logController = new LogController();

      logController.create({
        description: `Usuário realizou logout.`,
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
        .send({ error: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }
}
