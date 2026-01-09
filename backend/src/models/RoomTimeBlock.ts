import { DataTypes, Model, Sequelize } from "sequelize";

class RoomTimeBlock extends Model {
  static initialize(sequelize: Sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
      },
      {
        sequelize,
        tableName: "room_time_blocks",
        timestamps: true,
        createdAt: "data_criacao",
        updatedAt: "data_atualizacao",
      }
    );
  }
  static associate(models: any) {
    this.belongsTo(models.Room, {
      foreignKey: "room_id",
      as: "room",
    });
    this.belongsTo(models.TimeBlock, {
      foreignKey: "time_block_id",
      as: "timeBlock",
    });
  }
}

export default RoomTimeBlock;
