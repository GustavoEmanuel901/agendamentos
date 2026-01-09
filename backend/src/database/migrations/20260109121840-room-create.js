export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("rooms", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    horario_inicio: {
      type: Sequelize.TIME,
      allowNull: true,
    },
    horario_fim: {
      type: Sequelize.TIME,
      allowNull: true,
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
  await queryInterface.dropTable("rooms");
}
