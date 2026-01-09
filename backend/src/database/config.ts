import type { Dialect } from "sequelize";

export default {
  development: {
    dialect: "sqlite" as Dialect,
    storage: "database.sqlite",
  },
  test: {
    dialect: "sqlite" as Dialect,
    storage: ":memory:",
  },
  production: {
    dialect: "sqlite" as Dialect,
    storage: "database.sqlite",
  },
};
