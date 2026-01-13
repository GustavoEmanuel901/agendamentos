import { Request, Response } from "express";
import z from "zod";
import Appointment from "../models/Appointment";
import User from "../models/User";
import { Op } from "sequelize";
import { ListarDto } from "../dtos/UserDtos";
import LogController from "./LogController";
import Room from "../models/Room";
type AppointmentStatus = "agendado" | "em analise" | "cancelado";

export default class AppointmentControler {
  async create(req: Request, res: Response) {
    try {
      if (!req.permissions.appointment)
        return res.status(403).send({ error: "Acesso negado" });

      const appointmentCreateSchema = z.object({
        data: z
          .string()
          .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Data deve estar no formato YYYY-MM-DD"
          ),
        horario: z
          .string()
          .regex(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Horário deve estar no formato HH:MM"
          ),
        sala_id: z.number(),
      });

      console.log(req.body);

      const payload = appointmentCreateSchema.parse(req.body);

      const dateTimeString = `${payload.data}T${payload.horario}:00`;
      const data_agendamento = new Date(dateTimeString);
      if (isNaN(data_agendamento.getTime())) {
        return res.status(400).json({ message: "Data/Horário inválido" });
      }

      const room = await Room.findByPk(payload.sala_id);

      console.log(room);

      if (!room)
        return res.status(400).json({ message: "Sala não encontrada" });

      await Appointment.create({
        room_id: payload.sala_id,
        status: "Em análise",
        data_agendamento,
        user_id: req.userId,
      });

      const logController = new LogController();

      logController.create({
        descricao: "Criação de Agendamento",
        modulo: "Agendamentos",
        user_id: Number(req.userId),
      });

      return res
        .status(201)
        .json({ message: "Agendamento criado com sucesso" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: error.message,
        });
      }
      console.error("Erro ao criar agendamento:", error);
      return res.status(500).json({ message: "Erro ao criar agendamento" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      console.log("Permissões do usuário:", req.permissions);

      if (!req.permissions.appointment)
        return res.status(403).send({ error: "Acesso negado" });

      const {
        pagina = "1",
        limite = "10",
        pesquisa,
        data,
        ordenacao,
        ordem,
      } = req.query as Partial<ListarDto>;

      const userId = req.userId;

      const pageNum = Math.max(1, parseInt(pagina, 10) || 1);
      const perPageNum = Math.max(1, parseInt(limite, 10) || 10);
      const offset = (pageNum - 1) * perPageNum;

      const where: any = {};

      if (data) {
        const d = new Date(data);
        if (!isNaN(d.getTime())) {
          const start = new Date(d);
          start.setHours(0, 0, 0, 0);
          const end = new Date(d);
          end.setHours(23, 59, 59, 999);
          where.data_agendamento = { [Op.gte]: start, [Op.lte]: end };
        }
      }

      if (userId && !req.role) {
        where.user_id = userId;
      }

      const include: any[] = [];
      if (pesquisa) {
        const like = `%${pesquisa}%`;
        include.push({
          model: User,
          as: "user",
          attributes: [],
          where: {
            [Op.or]: [
              { nome: { [Op.like]: like } },
              { sobrenome: { [Op.like]: like } },
            ],
          },
        });
      } else {
        include.push({
          model: User,
          as: "user",
        });
      }

      include.push({
        model: Room,
        as: "room",
      });

      const { count, rows } = await Appointment.findAndCountAll({
        where,
        include,
        limit: perPageNum,
        offset,
        order: [[ordenacao || "data_agendamento", ordem || "DESC"]],
        distinct: true,
      });

      const appointments = rows.map((appointment) => ({
        id: appointment.dataValues.id,
        status: appointment.dataValues.status,
        data_agendamento: appointment.dataValues.data_agendamento,
        room: {
          id: appointment.dataValues.room.id,
          nome: appointment.dataValues.room.nome,
        },
        user: {
          id: appointment.dataValues.user.id,
          nome:
            appointment.dataValues.user.nome +
            " " +
            appointment.dataValues.user.sobrenome,
          admin: appointment.dataValues.user.admin ? "admin" : "cliente",
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
      console.error("Erro ao buscar agendamentos:", error);
      return res.status(500).json({ message: "Erro ao buscar agendamentos" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.permissions.appointment)
        return res.status(403).send({ error: "Acesso negado" });

      const { id } = req.params;

      const updateSchema = z.object({
        status: z.enum(["agendado", "em análise", "cancelado"]).optional(),
        sala_id: z.number().optional(),
      });

      const payload = updateSchema.parse(req.body);

      const appointment = await Appointment.findByPk(id);

      if (!appointment)
        return res.status(404).json({ message: "Agendamento não encontrado" });

      if (payload.sala_id) {
        const room = await Room.findByPk(payload.sala_id);

        if (!room)
          return res.status(400).json({ message: "Sala não encontrada" });
      }

      await appointment.update(payload);

      const logController = new LogController();

      if (payload.status == "cancelado") {
        await logController.create({
          descricao: "Agendamento Cancelado",
          modulo: "Agendamento",
          user_id: Number(req.userId),
        });
      } else if (payload.status == "agendado") {
        await logController.create({
          descricao: "Agendamento Confirmado",
          modulo: "Agendamento",
          user_id: Number(req.userId),
        });
      }

      return res.json({ message: "Agendamento atualizado com sucesso" });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res
          .status(400)
          .json({ message: "Erro de validação", errors: err.message });
      console.error(err);
      return res.status(500).json({ message: "Erro ao atualizar agendamento" });
    }
  }
}
