import express from "express";

import {
  getAdminDashboard,
} from "../controllers/adminDashboardController.js";

import {
  getAllStudents,
  getStudentById,
} from "../controllers/adminStudentController.js";

import protect,{requireRole} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  requireRole("admin"),
  getAdminDashboard
);

//Get all students 
router.get(
  "/students",
  protect,
  requireRole("admin"),
  getAllStudents
);

// View student details
router.get(
  "/students/:id",
  protect,
  requireRole("admin"),
  getStudentById
);

export default router;