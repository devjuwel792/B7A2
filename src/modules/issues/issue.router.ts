import { Router } from "express";
import { createIssue, deleteIssue, getIssueById, getIssues } from "./issue.controller";


const router = Router();

router.post("/", createIssue);
router.get("/", getIssues);
router.get("/:id", getIssueById);
router.delete("/:id", deleteIssue);

export default router;