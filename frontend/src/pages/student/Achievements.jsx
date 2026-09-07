import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../config/axios";
import "./Achievements.css";

function Achievements() {
  const navigate = useNavigate();

  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/achievements");

        setAchievements(
          response.data.achievements || []
        );
      } catch (error) {
        console.error(
          "Fetch achievements error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load achievements."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked
  );

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;

  return (
    <div className="achievements-page">

      <div className="achievements-header">
        <div>
          <span className="achievements-eyebrow">
            YOUR MILESTONES
          </span>

          <h1>Achievements</h1>

          <p>
            Complete lessons, practice consistently,
            and reach milestones to unlock rewards.
          </p>
        </div>

        <div className="achievement-summary">
          <span className="material-symbols-rounded">
            emoji_events
          </span>

          <div>
            <strong>
              {unlockedCount}/{totalCount}
            </strong>

            <span>Unlocked</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="achievements-state">
          <span className="material-symbols-rounded">
            progress_activity
          </span>

          <p>Loading achievements...</p>
        </div>
      )}

      {!loading && error && (
        <div className="achievements-state achievements-error">
          <span className="material-symbols-rounded">
            error
          </span>

          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        achievements.length === 0 && (
          <div className="achievements-state">
            <span className="material-symbols-rounded">
              emoji_events
            </span>

            <p>No achievements available yet.</p>
          </div>
        )}

      {!loading && !error && achievements.length > 0 && (
        <>
          <div className="achievements-progress">
            <div className="achievements-progress-header">
              <span>Your achievement progress</span>

              <strong>
                {totalCount > 0
                  ? Math.round(
                      (unlockedCount / totalCount) *
                        100
                    )
                  : 0}
                %
              </strong>
            </div>

            <div className="achievements-progress-bar">
              <div
                className="achievements-progress-fill"
                style={{
                  width: `${
                    totalCount > 0
                      ? Math.round(
                          (unlockedCount /
                            totalCount) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div
                key={achievement._id}
                className={`achievement-card ${
                  achievement.unlocked
                    ? "achievement-card-unlocked"
                    : "achievement-card-locked"
                }`}
              >
                <div
                  className={`achievement-icon ${
                    achievement.unlocked
                      ? "achievement-icon-unlocked"
                      : "achievement-icon-locked"
                  }`}
                >
                  <span className="material-symbols-rounded">
                    {achievement.icon ||
                      "emoji_events"}
                  </span>
                </div>

                <div className="achievement-content">
                  <div className="achievement-title-row">
                    <h3>{achievement.name}</h3>

                    {achievement.unlocked && (
                      <span className="achievement-unlocked-badge">
                        Unlocked
                      </span>
                    )}
                  </div>

                  <p>
                    {achievement.description}
                  </p>

                  <div className="achievement-footer">
                    <span className="achievement-xp">
                      <span className="material-symbols-rounded">
                        bolt
                      </span>

                      +{achievement.xpReward} XP
                    </span>

                    {achievement.unlocked &&
                      achievement.unlockedAt && (
                        <span className="achievement-date">
                          {new Date(
                            achievement.unlockedAt
                          ).toLocaleDateString()}
                        </span>
                      )}

                    {!achievement.unlocked && (
                      <span className="achievement-locked-text">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        className="achievements-back-button"
        onClick={() =>
          navigate("/student/dashboard")
        }
      >
        <span className="material-symbols-rounded">
          arrow_back
        </span>

        Back to Dashboard
      </button>
    </div>
  );
}

export default Achievements;