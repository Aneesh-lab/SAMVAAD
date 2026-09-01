import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      default: "🏆",
    },

    type: {
      type: String,
      enum: [
        "lesson",
        "streak",
        "xp",
        "quiz",
      ],
      required: true,
    },

    requirement: {
      type: Number,
      required: true,
      min: 1,
    },

    xpReward: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model(
  "Achievement",
  achievementSchema
);

export default Achievement;