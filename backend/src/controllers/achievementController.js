import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";
import User from "../models/User.js";

export const getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({
      isActive: true,
    }).sort({ createdAt: 1 });

    const unlockedAchievements =
      await UserAchievement.find({
        user: req.user.id,
      }).populate("achievement");

    const unlockedMap = new Map();

    unlockedAchievements.forEach((item) => {
      unlockedMap.set(
        item.achievement._id.toString(),
        item.unlockedAt
      );
    });

    const result = achievements.map((achievement) => ({
      _id: achievement._id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      type: achievement.type,
      requirement: achievement.requirement,
      xpReward: achievement.xpReward,
      unlocked: unlockedMap.has(
        achievement._id.toString()
      ),
      unlockedAt:
        unlockedMap.get(
          achievement._id.toString()
        ) || null,
    }));

    return res.status(200).json({
      success: true,
      achievements: result,
    });
  } catch (error) {
    console.error(
      "Get achievements error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching achievements",
    });
  }
};