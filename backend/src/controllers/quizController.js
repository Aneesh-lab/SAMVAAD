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

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

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

    if (quiz.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This quiz has no questions",
      });
    }

    let score = 0;

    const evaluatedAnswers = quiz.questions.map(
      (question) => {
        const submittedAnswer = answers.find(
          (answer) =>
            answer.questionId === question._id.toString()
        );

        const studentAnswer =
          submittedAnswer?.answer || "";

        const isCorrect =
          studentAnswer.trim().toLowerCase() ===
          question.correctAnswer.trim().toLowerCase();

        if (isCorrect) {
          score++;
        }

        return {
          questionId: question._id,
          answer: studentAnswer,
          isCorrect,
        };
      }
    );

    const totalQuestions = quiz.questions.length;

    const percentage = Math.round(
      (score / totalQuestions) * 100
    );

    const xpReward = calculateQuizXP(percentage);

     const attempt = await QuizAttempt.create({
           user: req.user.id,
           quiz: quiz._id,
           answers: evaluatedAnswers,
           score,
           totalQuestions,
           percentage,
           xpAwarded: xpReward,
});

const user = await User.findByIdAndUpdate(
  req.user.id,
  {
    $inc: {
      xp: xpReward,
    },
  },
  {
    new: true,
  }
);

const newlyUnlocked =
  await checkAndUnlockAchievements(
    req.user.id
  );



    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",

      result: {
        score,
        totalQuestions,
        percentage,
        xpAwarded: xpReward,
        totalXP: user.xp,
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