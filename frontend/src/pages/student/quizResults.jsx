import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./QuizResults.css";

function QuizResults() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result;
  const quizTitle = location.state?.quizTitle || "Quiz Results";

  useEffect(() => {
    if (!result) {
      navigate("/student/quizzes", { replace: true });
    }
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  const {
    score,
    totalQuestions,
    percentage,
    xpAwarded,
    totalXP,
    achievementsUnlocked = [],
  } = result;

  const isPerfectScore =
    totalQuestions > 0 && score === totalQuestions;

  const getResultMessage = () => {
    if (isPerfectScore) {
      return "Perfect score! Excellent work.";
    }

    if (percentage >= 80) {
      return "Excellent work! You're making great progress.";
    }

    if (percentage >= 50) {
      return "Good effort! Keep practising to improve.";
    }

    return "Every attempt is a learning opportunity. Keep going!";
  };

  return (
    <div className="quiz-results-page">
      <header className="quiz-results-header">
        <button
          type="button"
          className="quiz-results-back"
          onClick={() => navigate("/student/quizzes")}
        >
          <span aria-hidden="true">←</span>
          Back to quizzes
        </button>

        <span className="quiz-results-eyebrow">
          QUIZ COMPLETED
        </span>

        <h1>{quizTitle}</h1>
        <p>Your results are ready. Here's how you performed.</p>
      </header>

      <main className="quiz-results-content">
        <section className="quiz-results-score-card">
          <div
            className={`quiz-results-score-ring ${
              isPerfectScore ? "is-perfect" : ""
            }`}
            role="img"
            aria-label={`Score: ${percentage}%`}
          >
            <div className="quiz-results-score-inner">
              <strong>{percentage}%</strong>
              <span>Your score</span>
            </div>
          </div>

          <h2>{getResultMessage()}</h2>

          <p className="quiz-results-score-detail">
            You answered {score} out of {totalQuestions} questions
            correctly.
          </p>

          {isPerfectScore && (
            <span className="quiz-results-perfect-badge">
              Perfect score
            </span>
          )}
        </section>

        <section className="quiz-results-stats">
          <article className="quiz-results-stat-card">
            <span className="quiz-results-stat-icon">
              <span className="material-symbols-rounded">
                check_circle
              </span>
            </span>

            <div>
              <p>Correct answers</p>
              <strong>
                {score}
                <span> / {totalQuestions}</span>
              </strong>
            </div>
          </article>

          <article className="quiz-results-stat-card">
            <span className="quiz-results-stat-icon xp-icon">
              <span className="material-symbols-rounded">
                bolt
              </span>
            </span>

            <div>
              <p>XP earned</p>
              <strong>+{xpAwarded} XP</strong>
            </div>
          </article>

          <article className="quiz-results-stat-card">
            <span className="quiz-results-stat-icon total-xp-icon">
              <span className="material-symbols-rounded">
                stars
              </span>
            </span>

            <div>
              <p>Total XP</p>
              <strong>{totalXP} XP</strong>
            </div>
          </article>
        </section>

        {achievementsUnlocked.length > 0 && (
          <section className="quiz-results-achievements">
            <div className="quiz-results-section-heading">
              <span className="material-symbols-rounded">
                emoji_events
              </span>

              <div>
                <h2>New achievements unlocked!</h2>
                <p>
                  Your progress has earned you new achievements.
                </p>
              </div>
            </div>

            <div className="quiz-results-achievement-list">
              {achievementsUnlocked.map((achievement, index) => {
                const achievementId =
                  achievement._id ||
                  achievement.id ||
                  achievement.code ||
                  `achievement-${index}`;

                return (
                  <article
                    className="quiz-results-achievement"
                    key={achievementId}
                  >
                    <span className="quiz-results-achievement-icon">
                      <span className="material-symbols-rounded">
                        emoji_events
                      </span>
                    </span>

                    <div>
                      <h3>
                        {achievement.title ||
                          achievement.name ||
                          "Achievement unlocked"}
                      </h3>

                      {achievement.description && (
                        <p>{achievement.description}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="quiz-results-actions">
          <button
            type="button"
            className="quiz-results-primary"
            onClick={() => navigate("/student/quizzes")}
          >
            Explore more quizzes
            <span aria-hidden="true">→</span>
          </button>

          <button
            type="button"
            className="quiz-results-secondary"
            onClick={() => navigate("/student/dashboard")}
          >
            Back to dashboard
          </button>
        </section>
      </main>
    </div>
  );
}

export default QuizResults;