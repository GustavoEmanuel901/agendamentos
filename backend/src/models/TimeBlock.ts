import { DataTypes, Model, Sequelize } from "sequelize";

class TimeBlock extends Model {
  static initialize(sequelize: Sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        minutos: DataTypes.INTEGER,
      },
      {
        sequelize,
        tableName: "time_blocks",
        timestamps: true,
        createdAt: "data_criacao",
        updatedAt: "data_atualizacao",
      }
    );
  }
  static associate(models: any) {
    this.belongsToMany(models.Room, {
      through: models.RoomTimeBlock,
      foreignKey: "time_block_id",
      otherKey: "room_id",
      as: "rooms",
    });
  }
}

export default TimeBlock;
