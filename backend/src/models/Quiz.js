import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length >= 2;
        },
        message: "At least 2 options are required",
      },
    },

    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;