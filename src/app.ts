import express from "express";
import type { Request, Response } from "express";
import { initDB } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initDB();
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export default app;
