import { DataTypes, Model, Sequelize } from "sequelize";

class User extends Model {
  static initialize(sequelize: Sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        email: {
          type: DataTypes.STRING(255),
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: DataTypes.VIRTUAL,
        password_hash: DataTypes.STRING,
        zip_code: DataTypes.STRING,
        address: DataTypes.STRING,
        number: DataTypes.STRING,
        supplement: DataTypes.STRING,
        neighborhood: DataTypes.STRING,
        city: DataTypes.STRING,
        state: DataTypes.STRING,
        status: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        permission_logs: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        permission_appointments: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        admin: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: "users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }
  static associate(models: any) {
    this.hasMany(models.Log, {
      foreignKey: "user_id",
      as: "logs",
    });

    this.hasMany(models.Appointment, {
      foreignKey: "user_id",
      as: "appointments",
    });
  }
}

export default User;
