import express from "express";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

import protect, { requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin only — Create course
router.post(
  "/",
  protect,
  requireRole("admin"),
  createCourse
);

// Student + Admin — View courses
router.get(
  "/",
  protect,
  getCourses
);

// Student + Admin — View single course
router.get(
  "/:id",
  protect,
  getCourseById
);

// Admin only — Update course
router.put(
  "/:id",
  protect,
  requireRole("admin"),
  updateCourse
);

// Admin only — Delete course
router.delete(
  "/:id",
  protect,
  requireRole("admin"),
  deleteCourse
);

export default router;