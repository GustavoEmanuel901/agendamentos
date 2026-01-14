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
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        horario_inicio: DataTypes.TIME,
        horario_fim: DataTypes.TIME,
      },
      {
        sequelize,
        tableName: "rooms",
        timestamps: true,
        createdAt: "data_criacao",
        updatedAt: "data_atualizacao",
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
