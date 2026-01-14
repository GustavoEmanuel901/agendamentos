import RoomTimeBlock from "../models/RoomTimeBlock";

export default class RoomTimeBlocksController {
  async create(roomId: number, timeBlockIds: number[]) {
    try {
      const createPromises = timeBlockIds.map((timeBlockId) =>
        RoomTimeBlock.create({ room_id: roomId, time_block_id: timeBlockId })
      );
      await Promise.all(createPromises);
    } catch (error) {
      throw error;
    }
  }

  async deleteByRoom(roomId: number) {
    try {
      await RoomTimeBlock.destroy({ where: { room_id: roomId } });
    } catch (error) {
      throw error;
    }
  }
}
