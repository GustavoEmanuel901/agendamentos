import { DataTypes, Model, Sequelize } from "sequelize";
import { appointmentStatus } from "../utils/appointmentStatus";

class Appointment extends Model {
  static initialize(sequelize: Sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        status: {
          type: DataTypes.ENUM(...appointmentStatus),
          allowNull: false,
          validate: {
            isIn: [appointmentStatus],
          },
        },
        date_appointment: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: "appointments",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
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
