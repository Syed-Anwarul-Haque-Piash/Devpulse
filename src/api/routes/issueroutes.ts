import { Router } from "express";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "../controllers/issues.controller";
import { auth, authorizeRoles } from "../../utils/auth";

const router = Router();

// Public routes
router.get("/", getAllIssues);
router.get("/:id", getIssueById);

// Protected routes (require authentication)
router.post("/", auth, createIssue);
router.patch("/:id", auth, updateIssue);

// Maintainer only routes
router.delete("/:id", auth, authorizeRoles("maintainer"), deleteIssue);

export default router;
