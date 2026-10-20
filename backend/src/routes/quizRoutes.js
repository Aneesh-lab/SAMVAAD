import express from "express";

import {
  createQuiz,
  getAdminQuizById,
  submitQuiz,
  updateQuizQuestions,
  deleteQuiz,
  getStudentQuiz,
  getQuizzes,
  updateQuiz,

} from "../controllers/quizController.js";

import {
  toggleQuizPublishStatus,getPublishedQuizzes
} from "../controllers/quizController.js";

import protect, {
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  requireRole("admin"),
  createQuiz
);

router.get(
  "/",
  protect,
  requireRole("admin"),
  getQuizzes
);


router.get(
  "/admin/:id",
  protect,
  requireRole("admin"),
  getAdminQuizById
);

router.put(
  "/admin/:id",
  protect,
  requireRole("admin"),
  updateQuiz
);

router.put(
  "/admin/:id/questions",
  protect,
  requireRole("admin"),
  updateQuizQuestions
);

router.delete(
  "/admin/:id",
  protect,
  requireRole("admin"),
  deleteQuiz
);

router.patch(
  "/admin/:id/publish",
  protect,
  requireRole("admin"),
  toggleQuizPublishStatus
);

router.get(
  "/published",
  protect,
  requireRole("student"),
  getPublishedQuizzes
);

router.get(
  "/:id",
  protect,
  getStudentQuiz
);

router.post(
  "/:id/submit",
  protect,
  submitQuiz
);


export default router;