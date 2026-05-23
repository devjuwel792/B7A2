import { Router } from "express";
import { createIssue, deleteIssue, getIssueById, getIssues } from "./issue.controller";
import auth from "../../middleware/auth";


const router = Router();

router.post("/", auth("contributor", "maintainer"), createIssue);
router.get("/", getIssues);

router.get("/:id", getIssueById);
router.delete("/:id", auth("maintainer"), deleteIssue);

export default router;