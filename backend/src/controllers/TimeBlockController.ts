import { Request, Response } from "express";
import Room from "../models/Room";
import TimeBlock from "../models/TimeBlock";

export default class TimeBlockController {
  async listByRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;

      if (!roomId) {
        return res.status(400).json({ message: "ID da sala é obrigatório" });
      }

      const room = await Room.findByPk(roomId, {
        include: [
          {
            model: TimeBlock,
            as: "timeBlocks",
            attributes: ["id", "minutos"],
          },
        ],
      });

      if (!room) {
        return res.status(404).json({ message: "Sala não encontrada" });
      }

      return res.status(200).json((room as any).timeBlocks || []);
    } catch (error) {
      console.error("Erro ao listar timeblocks da sala:", error);
      return res.status(500).json({ message: "Erro ao listar timeblocks" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const timeBlocks = await TimeBlock.findAll({
        attributes: ["id", "minutos"],
        order: [["minutos", "ASC"]],
      }); 
      return res.status(200).json(timeBlocks);
    } catch (error) {
      console.error("Erro ao listar todos os timeblocks:", error);
      return res.status(500).json({ message: "Erro ao listar timeblocks" });
    }
  }
}