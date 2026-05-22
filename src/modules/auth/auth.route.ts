import { Router } from "express";
import { signup } from "./auth.controller";

const router = Router();

router.post("/register", signup);

export default router;
