import { Request, Response } from "express";
import { Op } from "sequelize";
import Room from "../models/Room";
import LogController from "./LogController";
import z from "zod";
import RoomTimeBlocksController from "./RoomTimeBlocksController";
import ResponseMessages from "../utils/responseMessages";
import { RoomCreateOrUpdateSchema } from "../schemas/roomSchemas";
import { GetFilteres } from "../@types/filter";
import TimeBlock from "../models/TimeBlock";

export default class RoomController {
  async list(req: Request, res: Response) {
    try {
      const { search } = req.query as GetFilteres;

      const where: any = {};

      if (search) where.name = { [Op.like]: `%${search}%` };
      const rooms = await Room.findAll({
        where,
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
      });

      return res.json(rooms);
    } catch (error) {
      return res
        .status(500)
        .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const room = await Room.findByPk(id, {
        include: [
          {
            model: TimeBlock,
            as: "time_blocks",
            attributes: ["id", "minutes"],
          },
        ],
      });

      if (!room)
        return res
          .status(404)
          .json({ message: ResponseMessages.ROOM_NOT_FOUND });

      return res.json(room);
    } catch {
      return res
        .status(500)
        .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }

  async createOrUpdate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const payload = RoomCreateOrUpdateSchema.parse(req.body);

      const room = await Room.findByPk(id);

      if (!room)
        return res.status(404).json({ message: "Sala não encontrada" });

      const roomWithSameName = await Room.findOne({
        where: {
          name: payload.name,
        },
      });

      const roomTimeBlocksController = new RoomTimeBlocksController();

      if (!roomWithSameName) {
        const roomCreated = await Room.create(payload);

        const logController = new LogController();

        await logController.create({
          description: "Sala Criada",
          module: "Salas",
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
          message: ResponseMessages.ROOM_CREATED_SUCCESSFULLY,
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
        description: "Sala Alterada",
        module: "Salas",
        user_id: Number(req.userId),
      });

      return res.json({
        data: roomUpdated,
        message: ResponseMessages.ROOM_UPDATED_SUCCESSFULLY,
      });
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
}
