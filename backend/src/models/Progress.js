import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    lastAttemptAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

progressSchema.index(
  { userId: 1, lessonId: 1 },
  { unique: true }
);

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;