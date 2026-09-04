import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./Dashboard.css";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/student/dashboard");

        setDashboard(response.data);
      } catch (error) {
        const status = error.response?.status;
  const message =
    error.response?.data?.message ||
    error.message ||
    "Unknown error";

  alert(
    `Dashboard Error\n\nStatus: ${
      status || "No response"
    }\n\nMessage: ${message}`
  );

  setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loader"></div>
        <p>Loading your learning journey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="dashboard-error-icon">!</div>
        <div>
          <h3>Unable to load dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const {
    student,
    statistics,
    courses,
    quizAttempts,
    achievements,
  } = dashboard;

  return (
    <div className="student-dashboard">

      {/* =========================
          WELCOME HEADER
      ========================== */}

      <section className="dashboard-welcome">

        <div>
          <p className="dashboard-eyebrow">
            Your learning journey
          </p>

          <h1>
            Welcome back, {student.name} 👋
          </h1>

          <p className="dashboard-subtitle">
            Keep learning and building your ISL skills.
          </p>
        </div>

        <div className="dashboard-streak">

          <div className="streak-icon">
            🔥
          </div>

          <div>
            <strong>{student.streak}</strong>
            <span>day streak</span>
          </div>

        </div>

      </section>


      {/* =========================
          QUICK STATS
      ========================== */}

      <section className="dashboard-stats">

        <div className="dashboard-stat-card stat-lessons">
          <div className="stat-icon">
            📖
          </div>

          <div>
            <span className="stat-label">
              Lessons completed
            </span>

            <strong>
              {statistics.completedLessons}
            </strong>
          </div>
        </div>


        <div className="dashboard-stat-card stat-quizzes">
          <div className="stat-icon">
            🎯
          </div>

          <div>
            <span className="stat-label">
              Quizzes attempted
            </span>

            <strong>
              {statistics.quizzesAttempted}
            </strong>
          </div>
        </div>


        <div className="dashboard-stat-card stat-score">
          <div className="stat-icon">
            📊
          </div>

          <div>
            <span className="stat-label">
              Average score
            </span>

            <strong>
              {statistics.averageQuizScore}%
            </strong>
          </div>
        </div>


        <div className="dashboard-stat-card stat-achievements">
          <div className="stat-icon">
            🏆
          </div>

          <div>
            <span className="stat-label">
              Achievements
            </span>

            <strong>
              {statistics.achievementsUnlocked}
            </strong>
          </div>
        </div>

      </section>


      {/* =========================
          XP PROGRESS
      ========================== */}

      <section className="xp-card">

        <div className="xp-card-left">

          <div className="xp-icon">
            ⭐
          </div>

          <div>
            <span>Your XP</span>

            <strong>
              {student.xp} XP
            </strong>
          </div>

        </div>

        <div className="xp-message">
          Keep completing lessons and quizzes
          to earn more XP.
        </div>

      </section>


      {/* =========================
          COURSES
      ========================== */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <h2>Continue Learning</h2>

            <p>
              Explore lessons and improve your
              communication skills.
            </p>
          </div>

        </div>


        {courses.length === 0 ? (

          <div className="empty-state">
            <div className="empty-state-icon">
              📚
            </div>

            <h3>No courses available yet</h3>

            <p>
              New learning content will appear here
              once courses are published.
            </p>
          </div>

        ) : (

          <div className="course-grid">

            {courses.map((course) => (

              <article
                key={course._id}
                className="course-card"
              >

                <div className="course-card-top">

                  <span className="course-category">
                    {course.category}
                  </span>

                  <span className="course-level">
                    {course.level}
                  </span>

                </div>

                <h3>{course.title}</h3>

                <p>
                  {course.description ||
                    "Start learning this course and improve your ISL skills."}
                </p>

                <button
                  type="button"
                  className="course-button"
                >
                  Start learning
                  <span>→</span>
                </button>

              </article>

            ))}

          </div>

        )}

      </section>


      {/* =========================
          LOWER DASHBOARD
      ========================== */}

      <div className="dashboard-lower-grid">


        {/* QUIZ ACTIVITY */}

        <section className="dashboard-section dashboard-panel">

          <div className="section-heading">

            <div>
              <h2>Recent Quiz Activity</h2>

              <p>
                Your latest quiz performance.
              </p>
            </div>

          </div>


          {quizAttempts.length === 0 ? (

            <div className="small-empty-state">
              <span>🎯</span>

              <p>
                You haven't attempted any quizzes yet.
              </p>
            </div>

          ) : (

            <div className="quiz-list">

              {quizAttempts
                .slice(0, 5)
                .map((attempt) => (

                  <div
                    key={attempt._id}
                    className="quiz-item"
                  >

                    <div className="quiz-item-info">

                      <div className="quiz-icon">
                        ✓
                      </div>

                      <div>
                        <strong>
                          {attempt.quiz?.title ||
                            "Quiz"}
                        </strong>

                        <span>
                          Quiz completed
                        </span>
                      </div>

                    </div>

                    <div className="quiz-score">
                      {attempt.percentage}%
                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>


        {/* ACHIEVEMENTS */}

        <section className="dashboard-section dashboard-panel">

          <div className="section-heading">

            <div>
              <h2>Achievements</h2>

              <p>
                Milestones you've unlocked.
              </p>
            </div>

          </div>


          {achievements.length === 0 ? (

            <div className="small-empty-state">
              <span>🏆</span>

              <p>
                Complete lessons and quizzes to
                unlock achievements.
              </p>
            </div>

          ) : (

            <div className="achievement-list">

              {achievements
                .slice(0, 4)
                .map((item) => (

                  <div
                    key={item._id}
                    className="achievement-item"
                  >

                    <div className="achievement-icon">
                      {item.achievement?.icon ||
                        "🏆"}
                    </div>

                    <div>
                      <strong>
                        {item.achievement?.name ||
                          "Achievement"}
                      </strong>

                      <span>
                        {item.achievement?.description ||
                          ""}
                      </span>
                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}

export default Dashboard;