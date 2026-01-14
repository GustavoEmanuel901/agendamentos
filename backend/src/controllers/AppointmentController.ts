import { Request, Response } from "express";
import z from "zod";
import Appointment from "../models/Appointment";
import User from "../models/User";
import { Op } from "sequelize";
import { GetFilteres } from "../@types/filter";
import LogController from "./LogController";
import Room from "../models/Room";
import {
  appointmentStatus,
  AppointmentStatusEnum,
} from "../utils/appointmentStatus";
import ResponseMessages from "../utils/responseMessages";
import {
  appointmentCreateSchema,
  appointmentUpdateSchema,
} from "../schemas/appointmentSchemas";

export default class AppointmentControler {
  async create(req: Request, res: Response) {
    try {
      const payload = appointmentCreateSchema.parse(req.body);

      const dateTimeString = `${payload.date}T${payload.hours}:00`;
      const data_agendamento = new Date(dateTimeString);
      if (isNaN(data_agendamento.getTime())) {
        return res
          .status(400)
          .json({ message: ResponseMessages.INVALID_DATE_TIME });
      }

      const room = await Room.findByPk(payload.room_id);

      if (!room)
        return res
          .status(404)
          .json({ message: ResponseMessages.ROOM_NOT_FOUND });

      await Appointment.create({
        room_id: payload.room_id,
        status: AppointmentStatusEnum.UNDER_REVIEW,
        data_agendamento,
        user_id: req.userId,
      });

      const logController = new LogController();

      logController.create({
        description: "Criação de Agendamento",
        module: "Agendamentos",
        user_id: Number(req.userId),
      });

      return res
        .status(201)
        .json({ message: ResponseMessages.APPOINTMENT_CREATED_SUCCESS });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: error.message,
        });
      }
      return res
        .status(500)
        .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }

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

      const where: any = {};

      if (filterDate) {
        const d = new Date(filterDate);
        if (!isNaN(d.getTime())) {
          const start = new Date(d);
          start.setHours(0, 0, 0, 0);
          const end = new Date(d);
          end.setHours(23, 59, 59, 999);
          where.date_appointment = { [Op.gte]: start, [Op.lte]: end };
        }
      }

      if (userId && !req.isAdmin) where.user_id = userId;

      const include: any[] = [];
      if (search) {
        const like = `%${search}%`;
        include.push({
          model: User,
          as: "user",
          where: {
            [Op.or]: [
              { name: { [Op.like]: like } },
              { last_name: { [Op.like]: like } },
            ],
          },
        });
      } else {
        include.push({
          model: User,
          as: "user",
          attributes: ["id", "name", "last_name", "admin"],
        });
      }

      include.push({
        model: Room,
        as: "room",
        attributes: ["id", "name"],
      });

      const { count, rows } = await Appointment.findAndCountAll({
        where,
        include,
        limit: perPageNum,
        offset,
        order: [[order || "date_appointment", sort || "DESC"]],
        distinct: true,
      });

      const appointments = rows.map((appointment) => ({
        id: appointment.dataValues.id,
        status: appointment.dataValues.status,
        date_appointment: appointment.dataValues.date_appointment,
        room: {
          id: appointment.dataValues.room.id,
          name: appointment.dataValues.room.name,
        },
        user: {
          id: appointment.dataValues.user.id,
          name:
            appointment.dataValues.user.name +
            " " +
            appointment.dataValues.user.last_name,
          type: appointment.dataValues.user.admin ? "Admin" : "Cliente",
        },
      }));

      return res.json({
        data: appointments,
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

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const payload = appointmentUpdateSchema.parse(req.body);

      const appointment = await Appointment.findByPk(id);

      if (!appointment)
        return res
          .status(404)
          .json({ message: ResponseMessages.APPOINTMENT_NOT_FOUND });

      if (payload.room_id) {
        const room = await Room.findByPk(payload.room_id);

        if (!room)
          return res
            .status(404)
            .json({ message: ResponseMessages.ROOM_NOT_FOUND });
      }

      // SOMENTE ADM PODEM CONFIRMAR AGENDAMENTOS
      if (payload.status == AppointmentStatusEnum.SCHEDULED && !req.isAdmin) {
        return res
          .status(403)
          .json({ message: ResponseMessages.ACCESS_DENIED });
      }

      await appointment.update(payload);

      const logController = new LogController();

      if (payload.status == AppointmentStatusEnum.CANCELED) {
        await logController.create({
          description: "Agendamento Cancelado",
          module: "Agendamento",
          user_id: Number(req.userId),
        });
      } else if (payload.status == AppointmentStatusEnum.SCHEDULED) {
        await logController.create({
          description: "Agendamento Confirmado",
          module: "Agendamento",
          user_id: Number(req.userId),
        });
      }

      return res.json({
        message: ResponseMessages.APPOINTMENT_UPDATED_SUCCESSFULLY,
      });
    } catch (err) {
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
