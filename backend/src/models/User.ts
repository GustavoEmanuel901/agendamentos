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
        nome: DataTypes.STRING,
        sobrenome: DataTypes.STRING,
        email: {
          type: DataTypes.STRING(255),
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        senha: DataTypes.VIRTUAL,
        senha_hash: DataTypes.STRING,
        cep: DataTypes.STRING,
        endereco: DataTypes.STRING,
        numero: DataTypes.STRING,
        complemento:DataTypes.STRING,
        bairro: DataTypes.STRING,
        cidade: DataTypes.STRING,
        estado: DataTypes.STRING,
        status: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        permissao_logs: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        permissao_agendamento: {
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
        createdAt: "data_criacao",
        updatedAt: "data_atualizacao",
      }
    );
  }
  static associate(models: any) {
    this.hasMany(models.Log, {
      foreignKey: 'user_id',
      as: 'logs'
    })

    this.hasMany(models.Appointment, {
      foreignKey: 'user_id',
      as: 'appointments'
    })
  }
}


export default User;
