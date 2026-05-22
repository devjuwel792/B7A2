import { Router } from "express";
import { createIssue, deleteIssue, getIssueById, getIssues } from "./issue.controller";
import auth from "../../middleware/auth";


const router = Router();

router.post("/", auth("contributor", "maintainer"), createIssue);
router.get("/", auth("contributor", "maintainer"), getIssues);
router.get("/:id", auth("contributor", "maintainer"), getIssueById);
router.delete("/:id", auth("maintainer"), deleteIssue);

export default router;