import { Request, Response } from "express";
import { Op } from "sequelize";
import Room from "../models/Room";
import LogController from "./LogController";
import z from "zod";
import RoomTimeBlocksController from "./RoomTimeBlocksController";

export default class RoomController {
  async list(req: Request, res: Response) {
    try {
      const { pesquisa = "" } = req.query as { pesquisa?: string };

      const where: any = {};

      if (pesquisa) where.nome = { [Op.like]: `%${pesquisa}%` };

      const rooms = await Room.findAll({
        where,
        attributes: ["id", "nome"],
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

  async createOrUpdate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updateSchema = z.object({
        nome: z.string().min(2).optional(),
        horario_inicio: z
          .string()
          .regex(
            /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
            "Horário deve estar no formato HH:MM:SS"
          ),
        horario_fim: z
          .string()
          .regex(
            /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
            "Horário deve estar no formato HH:MM:SS"
          ),
        time_blocks: z.array(z.number()).optional(),
      });

      const payload = updateSchema.parse(req.body);

      const room = await Room.findByPk(id);

      if (!room)
        return res.status(404).json({ message: "Sala não encontrada" });

      const roomWithSameName = await Room.findOne({
        where: {
          nome: payload.nome,
        },
      });

      const roomTimeBlocksController = new RoomTimeBlocksController();

      if (!roomWithSameName) {
        const roomCreated = await Room.create(payload);

        const logController = new LogController();

        await logController.create({
          descricao: "Sala Criada",
          modulo: "Salas",
          user_id: Number(req.userId),
        });

        if (payload.time_blocks) {
          await roomTimeBlocksController.create(
            roomCreated.dataValues.id,
            payload.time_blocks
          );
        }

        return res.json({
          data: roomCreated,
          message: "Sala Criada com sucesso",
        });
      }

      const roomUpdated = await roomWithSameName.update(payload);

      const logController = new LogController();

      if (payload.time_blocks) {
        await roomTimeBlocksController.deleteByRoom(roomUpdated.dataValues.id);
        await roomTimeBlocksController.create(
          roomUpdated.dataValues.id,
          payload.time_blocks
        );
      }

      await logController.create({
        descricao: "Sala Alterada",
        modulo: "Salas",
        user_id: Number(req.userId),
      });

      return res.json({
        data: roomUpdated,
        message: "Sala atualizada com sucesso",
      });
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
