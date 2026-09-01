import User from "../models/User.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import QuizAttempt from "../models/QuizAttempt.js";
import UserAchievement from "../models/UserAchievement.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get student
    const user = await User.findById(userId).select(
      "name email role xp streak"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get courses
    const courses = await Course.find({
      isPublished: true,
    })
      .select("title description category level")
      .sort({ createdAt: -1 });

    // Get student's lesson progress
    const progress = await Progress.find({
      userId,
    });

    // Get quiz attempts
    const quizAttempts = await QuizAttempt.find({
      user: userId,
    })
      .populate("quiz", "title")
      .sort({ createdAt: -1 });

    // Get unlocked achievements
    const achievements = await UserAchievement.find({
      user: userId,
    }).populate(
      "achievement",
      "name description icon xpReward"
    );

    // Calculate completed lessons
    const completedLessons = progress.filter(
      (item) => item.status === "completed"
    ).length;

    // Calculate average quiz percentage
    let averageQuizScore = 0;

    if (quizAttempts.length > 0) {
      const totalPercentage = quizAttempts.reduce(
        (sum, attempt) =>
          sum + attempt.percentage,
        0
      );

      averageQuizScore = Math.round(
        totalPercentage / quizAttempts.length
      );
    }

    return res.status(200).json({
      success: true,

      student: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        streak: user.streak,
      },

      statistics: {
        completedLessons,
        totalProgressRecords: progress.length,
        quizzesAttempted: quizAttempts.length,
        averageQuizScore,
        achievementsUnlocked:
          achievements.length,
      },

      courses,

      progress,

      quizAttempts,

      achievements,
    });
  } catch (error) {
    console.error(
      "Get student dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching dashboard",
    });
  }
};