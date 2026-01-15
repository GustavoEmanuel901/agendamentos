import { Request, Response } from "express";
import { Op } from "sequelize";
import Log from "../models/Log";
import { GetFilteres } from "../@types/filter";
import User from "../models/User";
import ResponseMessages from "../utils/responseMessages";

interface LogCreate {
  description: string;
  module: string;
  user_id: number;
}

export default class LogController {
  async list(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "10",
        search,
        filterDate,
        order,
        sort,
      } = req.query as Partial<GetFilteres>;

      const userId = req.userId;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const perPageNum = Math.max(1, parseInt(limit, 10) || 10);
      const offset = (pageNum - 1) * perPageNum;

      const where: any = {
        "$user.admin$": false,
      };

      if (userId && !req.isAdmin) where.user_id = userId;

      if (search) {
        const like = `%${search}%`;

        where[Op.or] = [
          { description: { [Op.like]: like } },
          { module: { [Op.like]: like } },
          { "$user.name$": { [Op.like]: like } },
          { "$user.last_name$": { [Op.like]: like } },
        ];
      }

      if (filterDate) {
        const d = new Date(filterDate);
        if (!isNaN(d.getTime())) {
          const start = new Date(d);
          start.setHours(0, 0, 0, 0);
          const end = new Date(d);
          end.setHours(23, 59, 59, 999);
          where.created_at = { [Op.gte]: start, [Op.lte]: end };
        }
      }

      const { count, rows } = await Log.findAndCountAll({
        where,
        limit: perPageNum,
        offset,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "last_name", "admin"],
          },
        ],
        order: [[order || "created_at", sort || "DESC"]],
      });

      const logs = rows.map((log) => ({
        id: log.dataValues.id,
        description: log.dataValues.description,
        module: log.dataValues.module,
        created_at: log.dataValues.created_at,
        user: {
          id: log.dataValues.user.id,
          name: log.dataValues.user.name + " " + log.dataValues.user.last_name,
          type: log.dataValues.user.admin ? "Admin" : "Cliente",
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
      return res
        .status(500)
        .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }

  async create(data: LogCreate) {
    try {
      await Log.create({
        module: data.module,
        description: data.description,
        user_id: data.user_id,
      });

      console.log(
        `[${new Date().toISOString()}] Log: ${data.description} no ${
          data.module
        }`
      );
    } catch (error: any) {
      console.error("Erro ao criar log:", error);
    }
  }
}
