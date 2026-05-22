import { Router } from "express";
import { login, signup } from "./auth.controller";

const router = Router();

router.post("/register", signup);
router.post("/login", login);

export default router;
