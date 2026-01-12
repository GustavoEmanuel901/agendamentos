import { ListarDto } from "../dtos/UserDtos";
import User from "../models/User";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Op } from "sequelize";
import LogController from "./LogController";
import generateToken from "../utils/generate_token";

export default class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const userCreateSchema = z.object({
        nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        sobrenome: z
          .string()
          .min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
        email: z.string().email("Email inválido"),
        senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
        endereco: z.string().optional(),
        numero: z.string().optional(),
        complemento: z.string().optional(),
        bairro: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
      });

      const data = userCreateSchema.parse(req.body);

      console.log("Dados validados:", data);
      const userExists = await User.findOne({ where: { email: data.email } });

      if (userExists)
        return res.status(400).json({ message: "Email já cadastrado" });

      const password_hash = await bcrypt.hash(data.senha, 8);

      const user = await User.create({
        nome: data.nome,
        sobrenome: data.sobrenome,
        email: data.email,
        senha_hash: password_hash,
        cep: data.cep,
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
      });

      const token = generateToken({
        id: user.dataValues.id,
        role: user.dataValues.admin,
      });

      return res
        .status(201)
        .cookie("token", token, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 1000 * 60 * 60 * 24, // 1 dia
        })
        .json({
          message: "Usuário criado com sucesso",
          user_id: user.dataValues.id,
          nome: user.dataValues.nome,
          role: user.dataValues.admin,
        });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: error.message,
        });
      }
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({ message: "Erro ao criar usuário" });
    }
  }

  async getClients(req: Request, res: Response) {
    try {
      const {
        pagina = "1",
        limite = "10",
        pesquisa,
        data,
      } = req.query as Partial<ListarDto>;
      const pageNum = Math.max(1, parseInt(pagina, 10) || 1);
      const perPageNum = Math.max(1, parseInt(limite, 10) || 10);
      const offset = (pageNum - 1) * perPageNum;

      const where: any = { admin: false };

      if (pesquisa) {
        const like = `%${pesquisa}%`;
        where[Op.or] = [
          { nome: { [Op.like]: like } },
          { sobrenome: { [Op.like]: like } },
        ];
      }

      if (data) {
        const d = new Date(data);
        if (!isNaN(d.getTime())) {
          const start = new Date(d);
          start.setHours(0, 0, 0, 0);
          const end = new Date(d);
          end.setHours(23, 59, 59, 999);
          where.data_criacao = { [Op.gte]: start, [Op.lte]: end };
        }
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        limit: perPageNum,
        offset,
        order: [["data_criacao", "DESC"]],
      });

      const clients = rows.map((user) => ({
        id: user.dataValues.id,
        permissoes: {
          pode_agendamentos: user.dataValues.permissao_agendamento,
          pode_logs: user.dataValues.permissao_logs,
        },
        tipo: user.dataValues.admin ? "admin" : "cliente",
        data_cadastro: user.dataValues.data_criacao,
        endereco: `${user.dataValues.endereco}, ${user.dataValues.numero} - ${user.dataValues.complemento} - ${user.dataValues.bairro} - ${user.dataValues.cidade}/${user.dataValues.estado}`,
        status: user.dataValues.status,
        nome: `${user.dataValues.nome} ${user.dataValues.sobrenome}`,
      }));

      return res.json({
        data: clients,
        meta: {
          total: count,
          page: pageNum,
          per_page: perPageNum,
          total_pages: Math.ceil(count / perPageNum),
        },
      });
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return res.status(500).json({ message: "Erro ao buscar clientes" });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if(!user)
        return res.status(404).json({ message: "Usuário não encontrado" });

      return res.json(user);
    } catch {
      return res.status(500).json({ message: "Erro ao recuperar usuário" });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updateSchema = z.object({
        nome: z.string().min(2).optional(),
        sobrenome: z.string().min(2).optional(),
        email: z.string().email().optional(),
        senha: z.string().min(6).optional(),
        cep: z
          .string()
          .regex(/^\d{5}-?\d{3}$/)
          .optional(),
        endereco: z.string().optional(),
        numero: z.string().optional(),
        complemento: z.string().optional(),
        bairro: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
      });

      const payload = updateSchema.parse(req.body);

      const user = await User.findByPk(id);
      if (!user)
        return res.status(404).json({ message: "Usuário não encontrado" });

      if (payload.email && payload.email !== user.getDataValue("email")) {
        const exists = await User.findOne({ where: { email: payload.email } });
        if (exists)
          return res.status(400).json({ message: "Email já cadastrado" });
      }

      const updateData: any = { ...payload };

      if (payload.senha) {
        const hash = await bcrypt.hash(payload.senha, 8);
        updateData.senha_hash = hash;
        delete updateData.senha;
      }

      await user.update(updateData);

      const logController = new LogController();

      await logController.create({
        descricao: "Usuário Alterado",
        modulo: "Minha Conta",
        user_id: Number(req.userId),
      });

      return res.json({ message: "Usuário atualizado com sucesso" });
    } catch (err: any) {
      if (err instanceof z.ZodError)
        return res
          .status(400)
          .json({ message: "Erro de validação", errors: err.message });
      console.error(err);
      return res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  }

  async alterUserPermissions(req: Request, res: Response) {
    try {
      if (!req.role) {
        return res
          .status(401)
          .json({ message: "Somente admins podem fazer essa alteração" });
      }
      const updateSchema = z.object({
        logs: z.boolean().optional(),
        agendamentos: z.boolean().optional(),
        status: z.boolean().optional(),
      });

      const payload = updateSchema.parse(req.body);

      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user)
        return res.status(404).json({ message: "Usuário não encontrado" });

      const updateData: any = {};
      if ("logs" in payload) updateData.permissao_logs = payload.logs;
      if ("agendamentos" in payload)
        updateData.permissao_agendamento = payload.agendamentos;
      if ("status" in payload) updateData.status = payload.status;

      await user.update(updateData);

      return res.json({ message: "Usuário atualizado com sucesso" });
    } catch (err: any) {
      if (err instanceof z.ZodError)
        return res
          .status(400)
          .json({ message: "Erro de validação", errors: err.message });
      console.error(err);
      return res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  }
}
