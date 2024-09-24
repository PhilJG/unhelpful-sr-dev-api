import express from "express";
import cors from "cors";

import "dotenv/config.js";

import fonyRouter from "./Router.js";

const app = express();

app.use(cors());

app.use(express.json());
app.options("*", cors());

app.use((req, res, next) => {
  next();
});

app.use(fonyRouter);

app.listen(4100, () => {
  console.log(`The server is running on 4100`);
});
