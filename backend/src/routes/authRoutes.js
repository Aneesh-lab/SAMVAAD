import express from "express";
import { registerUser,loginUser } from "../controllers/authController.js";
import protect,{requireRole} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated",
    user: req.user,
  });
});


router.get(
  "/admin-test",
  protect,
  requireRole("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Admin",
      user: req.user,
    });
  }
);

export default router;