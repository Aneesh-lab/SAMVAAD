import express from "express";

import {
  getAdminDashboard,
} from "../controllers/adminDashboardController.js";

import protect,{requireRole} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  requireRole("admin"),
  getAdminDashboard
);

export default router;