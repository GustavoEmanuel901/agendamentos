import { DataTypes, Model, Sequelize } from "sequelize";

class Appointment extends Model {
  static initialize(sequelize: Sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        status: DataTypes.STRING,
        data_agendamento: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: "appointments",
        timestamps: true,
        createdAt: "data_criacao",
        updatedAt: "data_atualizacao",
      }
    );
  }
  static associate(models: any) {
    this.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    this.belongsTo(models.Room, {
      foreignKey: "room_id",
      as: "room",
    });
  }
}

export default Appointment;
