import express from "express";

import "./database";

const routes = express.Router();

import UserController from "./controllers/UserController";
import AppointmentControler from "./controllers/AppointmentController";
import LogController from "./controllers/LogController";
import RoomController from "./controllers/RoomController";
import TimeBlockController from "./controllers/TimeBlockController";
import auth from "./middlewares/auth";
import LoginController from "./controllers/LoginController";
import admin from "./middlewares/admin";

const loginController = new LoginController();
const userController = new UserController();
const appointmentControler = new AppointmentControler();
const logController = new LogController();
const roomController = new RoomController();
const timeBlockController = new TimeBlockController();

routes.post("/login", loginController.login);
routes.get("/logout", auth, loginController.logout);

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

routes.get("/appointments", auth, appointmentControler.list);
routes.get("/appointment/user/:id", auth, appointmentControler.list);
routes.post("/appointments", auth, appointmentControler.create);
routes.put("/appointments/:id", auth, appointmentControler.update);

routes.get("/logs", auth, logController.list);
routes.get("/logs", auth, logController.list);
routes.get("/logs/user/:id", auth, logController.list);

routes.get("/rooms", auth, roomController.list);
routes.get("/room/:id", auth, admin, roomController.getOne);
routes.put("/room/:id", auth, admin, roomController.update);

routes.get("/room/:roomId/timeblocks", auth, timeBlockController.listByRoom);

export default routes;
