import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import { seedAchievements,} from "./utils/seedAchievements.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";


dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

//Connecting routes to server
app.use("/api/auth",authRoutes);
app.use("/api/courses",courseRoutes)
app.use("/api/lessons",lessonRoutes);
app.use("/api/student",studentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/student/dashboard",dashboardRoutes);
app.use( "/api/admin/dashboard",adminDashboardRoutes);



app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SAMVAAD API is running",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedAchievements();
    app.listen(PORT, () => {
      console.log(`SAMVAAD server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start SAMVAAD server");
  }
};

startServer();

