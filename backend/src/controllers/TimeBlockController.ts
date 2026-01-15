import { Request, Response } from "express";
import TimeBlock from "../models/TimeBlock";
import ResponseMessages from "../utils/responseMessages";

export default class TimeBlockController {
  // async listByRoom(req: Request, res: Response) {
  //   try {
  //     const { roomId } = req.params;

  //     if (!roomId) {
  //       return res
  //         .status(404)
  //         .json({ message: ResponseMessages.ROOM_NOT_FOUND });
  //     }

  //     const room = await Room.findByPk(roomId, {
  //       include: [
  //         {
  //           model: TimeBlock,
  //           as: "time_blocks",
  //           attributes: ["id", "minutos"],
  //         },
  //       ],
  //     });

  //     if (!room) {
  //       return res
  //         .status(404)
  //         .json({ message: ResponseMessages.ROOM_NOT_FOUND });
  //     }

  //     return res.status(200).json((room as any).timeBlocks || []);
  //   } catch (error) {
  //     return res
  //       .status(500)
  //       .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
  //   }
  // }

  async getAll(req: Request, res: Response) {
    try {
      const timeBlocks = await TimeBlock.findAll({
        attributes: ["id", "minutes"],
        order: [["minutes", "ASC"]],
      });
      return res.status(200).json(timeBlocks);
    } catch (error) {
      return res
        .status(500)
        .json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
    }
  }
}
