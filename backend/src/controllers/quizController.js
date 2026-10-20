import Quiz from "../models/Quiz.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";
import {checkAndUnlockAchievements,} from "../services/achievementService.js";


const calculateQuizXP = (percentage) => {
  if (percentage === 100) {
    return 30;
  }

  if (percentage >= 80) {
    return 20;
  }

  if (percentage >= 50) {
    return 10;
  }

  return 5;
};








export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      lesson,
      questions,
      isPublished,
    } = req.body;

    if (!title || !course) {
      return res.status(400).json({
        success: false,
        message: "Title and course are required",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (lesson) {
      const existingLesson = await Lesson.findOne({
        _id: lesson,
        course,
      });

      if (!existingLesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found in this course",
        });
      }
    }

    const quiz = await Quiz.create({
      title,
      description,
      course,
      lesson,
      questions,
      isPublished,
    });

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating quiz",
    });
  }
};


export const getStudentQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findOne({
      _id: id,
      isPublished: true,
    })
      .populate("course", "title category")
      .populate("lesson", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Published quiz not found",
      });
    }

    // Remove correct answers for student
    const studentQuestions = quiz.questions.map((question) => ({
      _id: question._id,
      question: question.question,
      options: question.options,
    }));

    return res.status(200).json({
      success: true,

      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        course: quiz.course,
        lesson: quiz.lesson,
        questions: studentQuestions,
      },
    });
  } catch (error) {
    console.error("Get student quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching quiz",
    });
  }
};




export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    // 1. Validate submitted answers
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

    // 2. Find the published quiz
    const quiz = await Quiz.findOne({
      _id: id,
      isPublished: true,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Published quiz not found",
      });
    }

    // 3. Ensure the quiz contains questions
    if (quiz.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This quiz has no questions",
      });
    }

    // 4. Evaluate answers and save only answered questions
    let score = 0;
    const evaluatedAnswers = [];

    for (const question of quiz.questions) {
      const submittedAnswer = answers.find(
        (answer) =>
          answer.questionId === question._id.toString()
      );

      const studentAnswer =
        typeof submittedAnswer?.answer === "string"
          ? submittedAnswer.answer.trim()
          : "";

      // Unanswered questions count as incorrect.
      // Empty answers are not saved to avoid schema validation errors.
      if (!studentAnswer) {
        continue;
      }

      const isCorrect =
        studentAnswer.toLowerCase() ===
        question.correctAnswer.trim().toLowerCase();

      if (isCorrect) {
        score++;
      }

      evaluatedAnswers.push({
        questionId: question._id,
        answer: studentAnswer,
        isCorrect,
      });
    }

    // 5. Calculate score using all quiz questions
    const totalQuestions = quiz.questions.length;

    const percentage = Math.round(
      (score / totalQuestions) * 100
    );

    // 6. Calculate quiz XP
    const xpReward = calculateQuizXP(percentage);

    // 7. Save the quiz attempt
    const attempt = await QuizAttempt.create({
      user: req.user.id,
      quiz: quiz._id,
      answers: evaluatedAnswers,
      score,
      totalQuestions,
      percentage,
      xpAwarded: xpReward,
    });

    // 8. Find the student
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 9. Update the student's daily streak
    const now = new Date();

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    let newStreak = user.streak;

    if (!user.lastActivityDate) {
      // First learning activity
      newStreak = 1;
    } else {
      const lastActivity = new Date(
        user.lastActivityDate
      );

      lastActivity.setHours(0, 0, 0, 0);

      const differenceInDays = Math.floor(
        (today.getTime() - lastActivity.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (differenceInDays === 1) {
        // Activity on the next consecutive day
        newStreak = user.streak + 1;
      } else if (differenceInDays > 1) {
        // At least one day was missed
        newStreak = 1;
      }

      // Same day: preserve the current streak.
    }

    // 10. Award quiz XP and save streak information
    user.xp += xpReward;
    user.streak = newStreak;
    user.lastActivityDate = now;

    await user.save();

    // 11. Unlock achievements and award their bonus XP
    const newlyUnlocked =
      await checkAndUnlockAchievements(req.user.id);

    // 12. Fetch final XP after achievement rewards
    const updatedUser = await User.findById(
      req.user.id
    ).select("xp");

    // 13. Return results to the frontend
    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        score,
        totalQuestions,
        percentage,
        xpAwarded: xpReward,
        totalXP: updatedUser
          ? updatedUser.xp
          : user.xp,
        streak: user.streak,
        attemptId: attempt._id,
        achievementsUnlocked: newlyUnlocked,
      },
    });
  } catch (error) {
    console.error("Submit quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while submitting quiz",
    });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("course", "title category")
      .populate("lesson", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching quizzes",
    });
  }
};


export const getAdminQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .populate("course", "title category")
      .populate("lesson", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Get admin quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching quiz",
    });
  }
};



export const updateQuizQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Questions must be an array",
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    for (const question of questions) {
      if (!question.question?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Every question must have question text",
        });
      }

      if (
        !Array.isArray(question.options) ||
        question.options.length < 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Every question must have at least 2 options",
        });
      }

      if (!question.correctAnswer?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Every question must have a correct answer",
        });
      }

      const hasCorrectOption =
        question.options.some(
          (option) =>
            option.trim().toLowerCase() ===
            question.correctAnswer.trim().toLowerCase()
        );

      if (!hasCorrectOption) {
        return res.status(400).json({
          success: false,
          message:
            "Correct answer must match one of the options",
        });
      }
    }

    quiz.questions = questions;

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz questions updated successfully",
      quiz,
    });
  } catch (error) {
    console.error(
      "Update quiz questions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating quiz questions",
    });
  }
};



export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      course,
      lesson,
      isPublished,
    } = req.body;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required",
      });
    }

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course is required",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (lesson) {
      const existingLesson = await Lesson.findOne({
        _id: lesson,
        course,
      });

      if (!existingLesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found in this course",
        });
      }
    }

    quiz.title = title.trim();
    quiz.description = description ?? "";
    quiz.course = course;
    quiz.lesson = lesson || null;
    quiz.isPublished =
      isPublished ?? quiz.isPublished;

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Update quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating quiz",
    });
  }
};


export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    await Quiz.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting quiz",
    });
  }
};

export const toggleQuizPublishStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    quiz.isPublished = !quiz.isPublished;

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: quiz.isPublished
        ? "Quiz published successfully"
        : "Quiz moved to draft successfully",
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        isPublished: quiz.isPublished,
      },
    });
  } catch (error) {
    console.error("Toggle quiz publish status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating quiz status",
    });
  }
};


//get published quizzes for students


export const getPublishedQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      isPublished: true,
    })
      .populate("course", "title category")
      .populate("lesson", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error("Get published quizzes error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching published quizzes",
    });
  }
};