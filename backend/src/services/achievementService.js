import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import QuizAttempt from "../models/QuizAttempt.js";




export const checkAndUnlockAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return [];
    }

    const achievements = await Achievement.find({
      isActive: true,
    });

    const unlockedAchievements =
      await UserAchievement.find({
        user: userId,
      });

    const unlockedIds = new Set(
      unlockedAchievements.map((item) =>
        item.achievement.toString()
      )
    );

    const completedLessons = await Progress.countDocuments({
      userId,
      status: "completed",
    });

    const perfectQuizAttempt = await QuizAttempt.exists({
         user: userId,
        percentage: 100,
        });

    const newlyUnlocked = [];

    for (const achievement of achievements) {
      if (
        unlockedIds.has(
          achievement._id.toString()
        )
      ) {
        continue;
      }

      let shouldUnlock = false;

      if (
        achievement.type === "lesson" &&
        completedLessons >= achievement.requirement
      ) {
        shouldUnlock = true;
      }

      if (
        achievement.type === "streak" &&
        user.streak >= achievement.requirement
      ) {
        shouldUnlock = true;
      }

      if (
        achievement.type === "xp" &&
        user.xp >= achievement.requirement
      ) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        const userAchievement =
          await UserAchievement.create({
            user: userId,
            achievement: achievement._id,
          });

        newlyUnlocked.push({
          _id: achievement._id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          unlockedAt:
            userAchievement.unlockedAt,
        });

        // Award achievement XP
        if (achievement.xpReward > 0) {
          await User.findByIdAndUpdate(
            userId,
            {
              $inc: {
                xp: achievement.xpReward,
              },
            }
          );
        }
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error(
      "Achievement check error:",
      error
    );

    return [];
  }
};