import { DataTypes, Model, Sequelize } from "sequelize";

class Log extends Model {
  static initialize(sequelize: Sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        description: DataTypes.STRING,
        module: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: "logs",
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
  }
}

export default Log;
