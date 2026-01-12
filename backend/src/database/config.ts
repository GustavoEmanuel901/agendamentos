import 'dotenv/config';
import type { Dialect } from "sequelize";

export default {
  development: {
    username: process.env.DB_USER as string ,
    port: 3306,
    password: process.env.DB_PASS as string,
    database: process.env.DB_NAME as string,
    host: process.env.DB_HOST as string,
    dialect: "mysql" as Dialect,
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
