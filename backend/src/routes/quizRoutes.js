import express from "express";

import {
  createQuiz,getStudentQuiz,submitQuiz
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