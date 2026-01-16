import { GetFilteres } from "../@types/filter";
import User from "../models/User";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Op } from "sequelize";
import LogController from "./LogController";
import generateToken from "../utils/generateToken";
import {
  userCreateSchema,
  userPermissionsUpdateSchema,
  userUpdateSchema,
} from "../schemas/userSchemas";
import ResponseMessages from "../utils/responseMessages";
import { LogsModuleEnum } from "../utils/logsModuleEnum";

export default class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const data = userCreateSchema.parse(req.body);

      const userExists = await User.findOne({ where: { email: data.email } });

      if (userExists)
        return res
          .status(400)
          .json({ message: ResponseMessages.EMAIL_ALREADY_REGISTERED });

      const password_hash = await bcrypt.hash(data.password, 8);

      const user = await User.create({
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        password_hash: password_hash,
        zip_code: data.zip_code,
        address: data.address,
        number: data.number,
        supplement: data.supplement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
      });

      const logController = new LogController();

      logController.create({
        description: `Login`,
        module: LogsModuleEnum.MY_ACCOUNT,
        user_id: user.dataValues.id,
      });

      const token = generateToken({
        id: user.dataValues.id,
        isAdmin: user.dataValues.admin,
        permissions: {
          logs: user.dataValues.permission_logs,
          appointments: user.dataValues.permission_appointments,
        },
      });

      const isProd = process.env.NODE_ENV === "production";

      return res
        .status(201)
        .cookie("token", `Bearer ${token}`, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 1000 * 60 * 60 * 24, // 1 dia
        })
        .cookie("admin", user.dataValues.admin, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24, // 1 dia
        })
        .json({
          message: ResponseMessages.USER_CREATED_SUCCESSFULLY,
          id: user.dataValues.id,
          name: user.dataValues.name,
          is_admin: user.dataValues.admin,
          permissions: {
            logs: user.dataValues.permission_logs,
            appointments: user.dataValues.permission_appointments,
          },
        });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: ResponseMessages.VALIDATION_ERROR,
          errors: error.message,
        });
      }
      return res
        .status(500)
        .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const id = req.userId;

      const user = await User.findByPk(id);

      if (!user)
        return res
          .status(404)
          .json({ message: ResponseMessages.USER_NOT_FOUND });

      return res.json({
        id: user.dataValues.id,
        name: user.dataValues.name,
        last_name: user.dataValues.last_name,
        permissions: {
          logs: user.dataValues.permission_logs,
          appointments: user.dataValues.permission_appointments,
        },
        is_admin: user.dataValues.admin,
      });
    } catch {
      return res
        .status(500)
        .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }

  async getClients(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "10",
        search,
        filterDate,
        order,
        sort,
      } = req.query as Partial<GetFilteres>;

      console.log(req.query);

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const perPageNum = Math.max(1, parseInt(limit, 10) || 10);
      const offset = (pageNum - 1) * perPageNum;

      const where: any = { admin: false };

      if (search) {
        const like = `%${search}%`;
        where[Op.or] = [
          { name: { [Op.like]: like } },
          { last_name: { [Op.like]: like } },
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

      const { count, rows } = await User.findAndCountAll({
        where,
        limit: perPageNum,
        offset,
        order: [[order || "name", sort || "ASC"]],
      });

      const clients = rows.map((user) => ({
        id: user.dataValues.id,

        user: {
          name: `${user.dataValues.name} ${user.dataValues.last_name}`,
          type: user.dataValues.admin ? "Admin" : "Cliente",
        },
        permissions: {
          appointments: user.dataValues.permission_appointments,
          logs: user.dataValues.permission_logs,
        },
        created_at: user.dataValues.created_at,
        address: `${user.dataValues.address}, ${user.dataValues.number} - ${user.dataValues.supplement} - ${user.dataValues.neighborhood} - ${user.dataValues.city}/${user.dataValues.state}`,
        status: user.dataValues.status,
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
      console.error(error);
      return res
        .status(500)
        .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ["password_hash"] },
      });

      if (!user)
        return res
          .status(404)
          .json({ message: ResponseMessages.USER_NOT_FOUND });

      return res.json(user);
    } catch {
      return res
        .status(500)
        .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const payload = userUpdateSchema.parse(req.body);

      const user = await User.findByPk(id);
      if (!user)
        return res
          .status(404)
          .json({ message: ResponseMessages.USER_NOT_FOUND });

      if (payload.email && payload.email !== user.getDataValue("email")) {
        const exists = await User.findOne({ where: { email: payload.email } });
        if (exists)
          return res
            .status(400)
            .json({ message: ResponseMessages.EMAIL_ALREADY_REGISTERED });
      }

      await user.update(payload);

      const logController = new LogController();

      await logController.create({
        description: "Atualização de Usuário",
        module: LogsModuleEnum.MY_ACCOUNT,
        user_id: Number(req.userId),
      });

      return res.json({ message: ResponseMessages.USER_UPDATED_SUCCESSFULLY });
    } catch (err: any) {
      if (err instanceof z.ZodError)
        return res.status(400).json({
          message: ResponseMessages.VALIDATION_ERROR,
          errors: err.message,
        });

      console.error(err);
      return res
        .status(500)
        .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }

  async alterUserPermissions(req: Request, res: Response) {
    try {
      const payload = userPermissionsUpdateSchema.parse(req.body);

      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user)
        return res
          .status(404)
          .json({ message: ResponseMessages.USER_NOT_FOUND });

      const updateData: any = {};
      if ("logs" in payload) updateData.permission_logs = payload.logs;
      if ("appointments" in payload)
        updateData.permission_appointments = payload.appointments;
      if ("status" in payload) updateData.status = payload.status;

      await user.update(updateData);

      return res.json({ message: ResponseMessages.USER_UPDATED_SUCCESSFULLY });
    } catch (err: any) {
      console.error(err);
      if (err instanceof z.ZodError)
        return res.status(400).json({
          message: ResponseMessages.VALIDATION_ERROR,
          errors: err.message,
        });

      return res
        .status(500)
        .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }
}
