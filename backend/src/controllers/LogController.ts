import { Request, Response } from "express";
import { Op } from "sequelize";
import Log from "../models/Log";
import { ListarDto } from "../dtos/UserDtos";
import User from "../models/User";

interface LogCreate {
  descricao: string;
  modulo: string;
  user_id: number;
}

export default class LogController {
  async list(req: Request, res: Response) {
    try {
      if (!req.permissions.logs)
        return res.status(403).send({ error: "Acesso negado" });

      const {
        pagina = "1",
        limite = "10",
        pesquisa,
        data,
        ordem,
        ordenacao,
      } = req.query as Partial<ListarDto>;

      const userId = req.userId;

      const pageNum = Math.max(1, parseInt(pagina, 10) || 1);
      const perPageNum = Math.max(1, parseInt(limite, 10) || 10);
      const offset = (pageNum - 1) * perPageNum;

      const where: any = {};

      if (userId && !req.role) where.user_id = userId;

      if (pesquisa) {
        const like = `%${pesquisa}%`;

        where[Op.or] = [
          { descricao: { [Op.like]: like } },
          { modulo: { [Op.like]: like } },
          { "$user.nome$": { [Op.like]: like } },
          { "$user.sobrenome$": { [Op.like]: like } },
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

      const { count, rows } = await Log.findAndCountAll({
        where,
        limit: perPageNum,
        offset,
        include: [{ model: User, as: "user" }],
        order: [[ordenacao || "data_criacao", ordem || "DESC"]],
      });

      const logs = rows.map((log) => ({
        id: log.dataValues.id,
        descricao: log.dataValues.descricao,
        modulo: log.dataValues.modulo,
        data_criacao: log.dataValues.data_criacao,
        user: {
          id: log.dataValues.user.id,
          nome: log.dataValues.user.nome + " " + log.dataValues.user.sobrenome,
          admin: log.dataValues.user.admin ? "admin" : "cliente",
        },
      }));

      return res.json({
        data: logs,
        meta: {
          total: count,
          page: pageNum,
          per_page: perPageNum,
          total_pages: Math.ceil(count / perPageNum),
        },
      });
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      return res.status(500).json({ message: "Erro ao buscar logs" });
    }
  }

  async create(data: LogCreate) {
    try {
      await Log.create({
        modulo: data.modulo,
        descricao: data.descricao,
        user_id: data.user_id,
      });

      console.log(
        `[${new Date().toISOString()}] Log: ${data.descricao} no ${data.modulo}`
      );
    } catch (error: any) {
      console.error("Erro ao criar log:", error);
    }
  }
}
