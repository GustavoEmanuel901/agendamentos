import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generate_token";
import LogController from "./LogController";

export default class LoginController {
  async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    try {
      const user = await User.findOne({
        where: { email },
      });

      if (!user) {
        return res.status(400).send({ error: "Email incorreto" });
      }

      if (!(await bcrypt.compare(senha, user.dataValues.senha_hash))) {
        return res.status(400).send({ error: "Senha incorreta" });
      }

      const token = generateToken({
        id: user.dataValues.id,
        role: user.dataValues.admin,
        permissions: {
          logs: user.dataValues.permissao_logs,
          appointment: user.dataValues.permissao_agendamento,
        },
      });

      const logController = new LogController();

      logController.create({
        descricao: `Usuário realizou login.`,
        modulo: "Minha Conta",
        user_id: user.dataValues.id,
      });

      return res
        .status(200)
        .cookie("token", "Bearer " + token, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 1000 * 60 * 60 * 24, // 1 dia
        })
        .status(200)
        .json({
          user_id: user.dataValues.id,
          role: user.dataValues.admin,
          nome: user.dataValues.nome,
          message: "Logado com sucesso",
        });
    } catch (error) {
      return res.status(400).send({ error: "Login failed, try again" });
    }
  }
}
