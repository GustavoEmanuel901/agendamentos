import { Request, Response } from "express";
import TimeBlock from "../models/TimeBlock";
import ResponseMessages from "../utils/responseMessages";

export default class TimeBlockController {
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
