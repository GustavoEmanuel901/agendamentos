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
        descricao: DataTypes.STRING,
        modulo: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: "logs",
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
  }
}

export default Log;
