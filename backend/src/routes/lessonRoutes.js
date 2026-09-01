import express from "express";

import { createLesson,getLessonsByCourse,getLessonById,updateLesson,deleteLesson} from "../controllers/lessonController.js";

import protect, { requireRole,} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  requireRole("admin"),
  createLesson
);

router.get(
  "/course/:courseId",
  protect,
  requireRole("admin"),
  getLessonsByCourse
);

router.get(
  "/:id",
  protect,
  requireRole("admin"),
  getLessonById
);

router.put(
  "/:id",
  protect,
  requireRole("admin"),
  updateLesson
);

router.delete(
  "/:id",
  protect,
  requireRole("admin"),
  deleteLesson
);

export default router;