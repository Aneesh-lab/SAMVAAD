import Achievement from "../models/Achievement.js";

const achievements = [
  {
    name: "First Step",
    description: "Complete your first lesson",
    icon: "🏆",
    type: "lesson",
    requirement: 1,
    xpReward: 10,
  },

  {
    name: "Learner",
    description: "Complete 10 lessons",
    icon: "📚",
    type: "lesson",
    requirement: 10,
    xpReward: 25,
  },

  {
    name: "On Fire",
    description: "Reach a 3-day learning streak",
    icon: "🔥",
    type: "streak",
    requirement: 3,
    xpReward: 25,
  },

  {
    name: "XP Beginner",
    description: "Earn 100 XP",
    icon: "⭐",
    type: "xp",
    requirement: 100,
    xpReward: 25,
  },

  {
    name: "Quiz Master",
    description: "Score 100% on a quiz",
    icon: "🧠",
    type: "quiz",
    requirement: 100,
    xpReward: 30,
  },
];

export const seedAchievements = async () => {
  try {
    for (const achievement of achievements) {
      await Achievement.findOneAndUpdate(
        {
          name: achievement.name,
        },
        achievement,
        {
          upsert: true,
          returnDocument: "after",
        }
      );
    }

    console.log(
      "Achievements seeded successfully"
    );
  } catch (error) {
    console.error(
      "Achievement seed error:",
      error
    );
  }
};