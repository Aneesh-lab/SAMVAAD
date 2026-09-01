import User from "../models/User.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Quiz from "../models/Quiz.js";
import Achievement from "../models/Achievement.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({
      role: "student",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    const totalCourses = await Course.countDocuments();

    const totalPublishedCourses =
      await Course.countDocuments({
        isPublished: true,
      });

    const totalLessons = await Lesson.countDocuments();

    const totalQuizzes = await Quiz.countDocuments();

    const totalAchievements =
      await Achievement.countDocuments({
        isActive: true,
      });

    return res.status(200).json({
      success: true,

      statistics: {
        totalStudents,
        totalAdmins,
        totalCourses,
        totalPublishedCourses,
        totalLessons,
        totalQuizzes,
        totalAchievements,
      },
    });
  } catch (error) {
    console.error(
      "Get admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching admin dashboard",
    });
  }
};