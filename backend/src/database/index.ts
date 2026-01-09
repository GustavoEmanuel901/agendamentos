import { Sequelize } from "sequelize";
import dbConfig from "./config.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Log from "../models/Log.js";
import Room from "../models/Room.js";
import TimeBlock from "../models/TimeBlock.js";
import RoomTimeBlock from "../models/RoomTimeBlock.js";

const sequelize = new Sequelize(dbConfig.development);

User.initialize(sequelize);
Appointment.initialize(sequelize);
Log.initialize(sequelize);
Room.initialize(sequelize);
TimeBlock.initialize(sequelize);
RoomTimeBlock.initialize(sequelize);

User.associate(sequelize.models);
Room.associate(sequelize.models);
TimeBlock.associate(sequelize.models);
RoomTimeBlock.associate(sequelize.models);
Appointment.associate(sequelize.models);
Log.associate(sequelize.models);

export default sequelize;
