import { DataTypes, Model, Sequelize } from "sequelize";

class Room extends Model {
  static initialize(sequelize: Sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        start_time: DataTypes.TIME,
        end_time: DataTypes.TIME,
      },
      {
        sequelize,
        tableName: "rooms",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }
  static associate(models: any) {
    this.belongsToMany(models.TimeBlock, {
      through: models.RoomTimeBlock,
      foreignKey: "room_id",
      otherKey: "time_block_id",
      as: "timeBlocks",
    });

    this.hasMany(models.Appointment, {
      foreignKey: "room_id",
      as: "appointments",
    });
  }
}

export default Room;
