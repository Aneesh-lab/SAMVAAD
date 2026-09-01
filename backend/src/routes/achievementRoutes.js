import express from "express";

import {
  getMyAchievements,
} from "../controllers/achievementController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getMyAchievements
);

export default router;