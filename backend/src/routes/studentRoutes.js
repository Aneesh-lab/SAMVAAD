import express from "express";

import { getPublishedCourses,
    getPublishedLessonsByCourse
    ,getPublishedLessonById,
    completeLesson,
     getMyProgress,
     completePractice,
     getStudentCourseDetails,
     getMyXP,
     getMyStreak,
     
} from "../controllers/studentController.js";

import protect from "../middleware/authMiddleware.js";


const router = express.Router();

router.get(
  "/courses",
  protect,
  getPublishedCourses
);
router.get(
  "/courses/:courseId",
  protect,
  getStudentCourseDetails
);

router.get(
  "/courses/:courseId/lessons",
  protect,
  getPublishedLessonsByCourse
);

router.get(
  "/lessons/:id",
  protect,
  getPublishedLessonById
);

router.post(
  "/lessons/:lessonId/complete",
  protect,
  completeLesson
);

router.post(
  "/practice/complete",
  protect,
  completePractice
);

router.get(
  "/progress",
  protect,
  getMyProgress
);

router.get(
  "/xp",
  protect,
  getMyXP
);

router.get(
  "/streak",
  protect,
  getMyStreak
);

export default router;