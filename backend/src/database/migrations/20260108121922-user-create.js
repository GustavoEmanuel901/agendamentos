export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("users", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nome: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    sobrenome: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    },
    senha_hash: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    cep: {
      type: Sequelize.STRING(10),
      allowNull: false,
    },
    endereco: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    numero: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    complemento: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    bairro: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    cidade: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    estado: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    admin: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    permissao_logs: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    permissao_agendamento: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    data_criacao: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    data_atualizacao: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("users");
}
