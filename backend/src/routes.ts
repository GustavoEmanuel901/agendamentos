import express from "express";

import "./database";

const routes = express.Router();

import UserController from "./controllers/UserController";
import AppointmentControler from "./controllers/AppointmentController";
import LogController from "./controllers/LogController";
import RoomController from "./controllers/RoomController";
import auth from "./middlewares/auth";
import LoginController from "./controllers/LoginController";
import admin from "./middlewares/admin";

const loginController = new LoginController();
const userController = new UserController();
const appointmentControler = new AppointmentControler();
const logController = new LogController();
const roomController = new RoomController();

routes.post("/login", loginController.login);

routes.post("/user", userController.createUser);
routes.get("/users/clients", auth, admin, userController.getClients);
routes.get("/user/:id", auth, userController.getOne);
routes.put("/user/:id", auth, userController.updateUser);
routes.put(
  "/user/:id/permission",
  auth,
  admin,
  userController.alterUserPermissions
);

routes.get("/appointments", auth, appointmentControler.list);
routes.post("/appointments", auth, appointmentControler.create);
routes.put("/appointments", auth, appointmentControler.update);

routes.get("/logs", auth, logController.list);

routes.get("/rooms", auth, roomController.list);
routes.get("/room/:id", auth, admin, roomController.getOne);
routes.put("/room/:id", auth, admin, roomController.update);

export default routes;
