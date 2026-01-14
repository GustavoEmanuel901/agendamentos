export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("appointments", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: Sequelize.STRING, //ENUM("Cancelado", "Em análise", "Agendado"),
      allowNull: false,
      // validate: {
      //   isIn: [["Cancelado", "Em análise", "Agendado"]],
      // },
    },
    date_appointment: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    room_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "rooms",
        key: "id",
      },
      onUpdate: "NO ACTION",
      onDelete: "CASCADE",
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("appointments");
}
