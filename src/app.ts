import type { Request, Response } from "express";
import express from "express";
import morgan from "morgan";
import { initDB } from "./db";
import authRoutes from "./modules/auth/auth.route";
import issuesRoutes from "./modules/issues/issue.router";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initDB();

app.use(morgan("dev"));
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
app.use("/api/auth", authRoutes);
app.use("/api/issues", issuesRoutes);
export default app;
