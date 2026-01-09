import { Request, Response } from "express";
import { Op } from "sequelize";
import Room from "../models/Room";
import LogController from "./LogController";
import z from "zod";

export default class RoomController {
  async list(req: Request, res: Response) {
    try {
      const { pesquisa = "" } = req.query as { pesquisa?: string };

      const where: any = {};

      if (pesquisa) where.nome = { [Op.like]: `%${pesquisa}%` };

      const rooms = await Room.findAll({
        where,
        attributes: ["id", "nome"],
        limit: 20,
        order: [["nome", "ASC"]],
      });

      return res.json(rooms);
    } catch (error) {
      console.error("Erro ao listar salas:", error);
      return res.status(500).json({ message: "Erro ao listar salas" });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const room = await Room.findByPk(id, {
        include: ["timeBlocks"],
      });

      return res.json(room);
    } catch {
      return res.status(500).json({ message: "Erro ao recuperar usuário" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updateSchema = z.object({
        nome: z.string().min(2).optional(),
        horario_inicio: z
          .string()
          .regex(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Horário deve estar no formato HH:MM"
          ),
        horario_fim: z
          .string()
          .regex(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Horário deve estar no formato HH:MM"
          ),
      });

      const payload = updateSchema.parse(req.body);

      const room = await Room.findByPk(id);

      if (!room)
        return res.status(404).json({ message: "Sala não encontrada" });

      await room.update(payload);

      const logController = new LogController();

      await logController.create({
        descricao: "Sala Alterada",
        modulo: "Salas",
        user_id: Number(req.userId),
      });

      return res.json({ message: "Sala atualizada com sucesso" });
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
