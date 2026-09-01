import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    answers: {
      type: [answerSchema],
      default: [],
    },

    score: {
      type: Number,
      required: true,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      required: true,
      default: 0,
    },

    percentage: {
      type: Number,
      required: true,
      default: 0,
    },
     xpAwarded: {
       type: Number,
       default: 0,
       min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const QuizAttempt = mongoose.model(
  "QuizAttempt",
  quizAttemptSchema
);

export default QuizAttempt;