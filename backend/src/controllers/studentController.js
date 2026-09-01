import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import {checkAndUnlockAchievements, } from "../services/achievementService.js";


const getStartOfDay = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};


export const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      isPublished: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get published courses error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
    });
  }
};

export const getPublishedLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      isPublished: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course not found",
      });
    }

    const lessons = await Lesson.find({
      course: courseId,
      isPublished: true,
    }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    console.error("Get published lessons error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching lessons",
    });
  }
};



export const getPublishedLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findOne({
      _id: id,
      isPublished: true,
    }).populate("course", "title category");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Published lesson not found",
      });
    }

    if (!lesson.course || !lesson.course._id) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error("Get published lesson error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching lesson",
    });
  }
};


export const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findOne({
      _id: lessonId,
      isPublished: true,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Published lesson not found",
      });
    }

    const existingProgress = await Progress.findOne({
      userId: req.user.id,
      lessonId,
    });

    // Lesson already completed
    if (
      existingProgress &&
      existingProgress.status === "completed"
    ) {
      return res.status(200).json({
        success: true,
        message: "Lesson already completed",
        xpAwarded: 0,
        progress: existingProgress,
      });
    }

    let progress;

    if (existingProgress) {
      existingProgress.status = "completed";
      existingProgress.completedAt = new Date();
      existingProgress.lastAttemptAt = new Date();

      progress = await existingProgress.save();
    } else {
      progress = await Progress.create({
        userId: req.user.id,
        lessonId,
        status: "completed",
        completedAt: new Date(),
        lastAttemptAt: new Date(),
      });
    }

    // Award 10 XP
   const XP_REWARD = 10;

const user = await User.findById(req.user.id);

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}

// Calculate today's date
const today = getStartOfDay(new Date());

let newStreak = user.streak;

// First learning activity
if (!user.lastActivityDate) {
  newStreak = 1;
} else {
  const lastActivity = getStartOfDay(
    user.lastActivityDate
  );

  const differenceInTime =
    today.getTime() - lastActivity.getTime();

  const differenceInDays =
    Math.floor(
      differenceInTime / (1000 * 60 * 60 * 24)
    );

  // Activity on a new consecutive day
  if (differenceInDays === 1) {
    newStreak = user.streak + 1;
  }

  // More than one day missed
  else if (differenceInDays > 1) {
    newStreak = 1;
  }

  // Same day → don't increase streak
}

user.xp += XP_REWARD;
user.streak = newStreak;
user.lastActivityDate = new Date();

await user.save();

const newlyUnlocked =
  await checkAndUnlockAchievements(
    req.user.id
  );



    return res.status(200).json({
      success: true,
      message: "Lesson completed successfully",
      xpAwarded: XP_REWARD,
      totalXP: user.xp,
      streak: user.streak,
      progress,
      achievementsUnlocked: newlyUnlocked,
    });
  } catch (error) {
    console.error("Complete lesson error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while completing lesson",
    });
  }
};


export const getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({
      userId: req.user.id,
    })
      .populate("lessonId", "title course order")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    console.error("Get progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching progress",
    });
  }
};


export const getStudentCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      isPublished: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course not found",
      });
    }

    const lessons = await Lesson.find({
      course: courseId,
      isPublished: true,
    }).sort({ order: 1 });

    const lessonIds = lessons.map((lesson) => lesson._id);

    const completedProgress = await Progress.find({
      userId: req.user.id,
      lessonId: { $in: lessonIds },
      status: "completed",
    });

    const totalLessons = lessons.length;
    const completedLessons = completedProgress.length;

    const progressPercentage =
      totalLessons === 0
        ? 0
        : Math.round(
            (completedLessons / totalLessons) * 100
          );

    return res.status(200).json({
      success: true,

      course,

      lessons,

      progress: {
        totalLessons,
        completedLessons,
        progressPercentage,
      },
    });
  } catch (error) {
    console.error(
      "Get student course details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error while fetching course details",
    });
  }
};


export const getMyXP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email xp"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      xp: user.xp,
    });
  } catch (error) {
    console.error("Get XP error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching XP",
    });
  }
};



export const getMyStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "streak lastActivityDate"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      streak: user.streak,
      lastActivityDate: user.lastActivityDate,
    });
  } catch (error) {
    console.error("Get streak error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching streak",
    });
  }
};