import express from "express";
import { createCourse, getCourses,getCourseById,updateCourse,deleteCourse } from "../controllers/courseController.js";

import protect, { requireRole} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  requireRole("admin"),
  createCourse
);

router.get(
  "/",
  protect,
  requireRole("admin"),
  getCourses
);




router.get(
  "/:id",
  protect,
  requireRole("admin"),
  getCourseById
);


router.put(
  "/:id",
  protect,
  requireRole("admin"),
  updateCourse
);

router.delete(
  "/:id",
  protect,
  requireRole("admin"),
  deleteCourse
);


export default router;