
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("room_time_blocks", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "rooms",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    time_block_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "time_blocks",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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
  
  // Adiciona índice único para evitar duplicatas
  await queryInterface.addIndex("room_time_blocks", ["room_id", "time_block_id"], {
    unique: true,
    name: "unique_room_time_block",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("room_time_blocks");
}
