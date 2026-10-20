import express from "express";
import protect, { requireRole } from "../middleware/authMiddleware.js";
import videoUpload from "../middleware/videoUpload.js";
import { uploadLessonVideo } from "../controllers/videoController.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  requireRole("admin"),
  (req, res, next) => {
    videoUpload.single("video")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message || "Video upload failed",
        });
      }

      next();
    });
  },
  uploadLessonVideo
);

export default router;