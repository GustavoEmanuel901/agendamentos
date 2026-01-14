export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("users", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    last_name: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    zip_code: {
      type: Sequelize.STRING(10),
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    number: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    supplement: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    neighborhood: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    city: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    state: {
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
    permission_logs: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    permission_appointments: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
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
  await queryInterface.dropTable("users");
}
