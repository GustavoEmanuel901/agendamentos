import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import routes from "./routes";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);
app.use(routes);

app.listen(3333);
