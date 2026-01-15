import express from "express";

import "./database";

const routes = express.Router();

import UserController from "./controllers/UserController";
import AppointmentControler from "./controllers/AppointmentController";
import LogController from "./controllers/LogController";
import RoomController from "./controllers/RoomController";
import TimeBlockController from "./controllers/TimeBlockController";
import auth from "./middlewares/auth";
import permissionAppointments from "./middlewares/permissionAppointments";
import permissionLogs from "./middlewares/permissionLogs";
import LoginController from "./controllers/LoginController";
import admin from "./middlewares/admin";

const loginController = new LoginController();
const userController = new UserController();
const appointmentControler = new AppointmentControler();
const logController = new LogController();
const roomController = new RoomController();
const timeBlockController = new TimeBlockController();

// LOGIN ROUTES
routes.post("/login", loginController.login);
routes.get("/logout", auth, loginController.logout);

// USER ROUTES
routes.post("/user", userController.createUser);
routes.get("/users/clients", auth, admin, userController.getClients);
routes.get("/user/:id", auth, userController.getOne);
routes.put("/user/:id", auth, userController.updateUser);
routes.get("/profile", auth, userController.getProfile);
routes.put(
  "/user/:id/permission",
  auth,
  admin,
  userController.alterUserPermissions
);

// APPOINTMENT ROUTES
routes.get(
  "/appointments",
  auth,
  permissionAppointments,
  appointmentControler.list
);
routes.post(
  "/appointments",
  auth,
  permissionAppointments,
  appointmentControler.create
);
routes.put(
  "/appointments/:id",
  auth,
  permissionAppointments,
  appointmentControler.update
);

// LOG ROUTES

routes.get("/logs", auth, permissionLogs, logController.list);

// ROOM ROUTES

routes.get("/rooms", auth, roomController.list);
routes.get("/room/:id", auth, admin, roomController.getOne);
routes.post("/room/:id", auth, admin, roomController.createOrUpdate);


// TIME BLOCK ROUTES
routes.get("/timeblocks", auth, admin, timeBlockController.getAll);

export default routes;
