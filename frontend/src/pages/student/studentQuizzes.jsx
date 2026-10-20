import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import "./studentQuizzes.css";

function StudentQuizzes() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get("/quizzes/published");

        setQuizzes(response.data.quizzes || []);
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Unable to load quizzes.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="student-quizzes">
      <section className="student-quizzes-header">
        <div>
          <p className="student-quizzes-eyebrow">
            Test your knowledge
          </p>

          <h1>Available Quizzes</h1>

          <p className="student-quizzes-subtitle">
            Check what you've learned and strengthen your
            Indian Sign Language skills.
          </p>
        </div>

        {!loading && !error && (
          <div className="student-quizzes-count">
            <span>{quizzes.length}</span>
            <span>
              {quizzes.length === 1 ? "Quiz available" : "Quizzes available"}
            </span>
          </div>
        )}
      </section>

      {loading ? (
        <div className="student-quizzes-state">
          <div className="student-quizzes-loader" />

          <h3>Loading quizzes...</h3>

          <p>Getting your available assessments ready.</p>
        </div>
      ) : error ? (
        <div className="student-quizzes-state student-quizzes-error">
          <div className="student-quizzes-state-icon">!</div>

          <h3>Unable to load quizzes</h3>

          <p>{error}</p>

          <button
            type="button"
            className="student-quizzes-button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="student-quizzes-state">
          <div className="student-quizzes-state-icon">
            <span className="material-symbols-rounded">
              quiz
            </span>
          </div>

          <h3>No quizzes available yet</h3>

          <p>
            Published quizzes will appear here when they
            become available.
          </p>

          <button
            type="button"
            className="student-quizzes-secondary-button"
            onClick={() => navigate("/student/learn")}
          >
            Explore courses
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : (
        <section className="student-quizzes-grid">
          {quizzes.map((quiz) => (
            <article
              key={quiz._id}
              className="student-quiz-card"
            >
              <div className="student-quiz-card-top">
                <div className="student-quiz-icon">
                  <span className="material-symbols-rounded">
                    quiz
                  </span>
                </div>

                <span className="student-quiz-status">
                  Available
                </span>
              </div>

              <div className="student-quiz-card-content">
                <p className="student-quiz-category">
                  {quiz.course?.category || "ISL Learning"}
                </p>

                <h2>{quiz.title}</h2>

                <p className="student-quiz-description">
                  {quiz.description ||
                    "Test your understanding and review what you've learned."}
                </p>

                <div className="student-quiz-meta">
                  <div className="student-quiz-meta-item">
                    <span className="material-symbols-rounded">
                      menu_book
                    </span>

                    <span>
                      {quiz.course?.title || "Course"}
                    </span>
                  </div>

                  {quiz.lesson?.title && (
                    <div className="student-quiz-meta-item">
                      <span className="material-symbols-rounded">
                        play_lesson
                      </span>

                      <span>{quiz.lesson.title}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="student-quiz-card-footer">
                <div className="student-quiz-question-count">
                  <span className="material-symbols-rounded">
                    format_list_numbered
                  </span>

                  <span>
                    {quiz.questions?.length ?? 0} questions
                  </span>
                </div>

                <button
                  type="button"
                  className="student-quizzes-button"
                  onClick={() =>
                    navigate(`/student/quizzes/${quiz._id}`)
                  }
                >
                  Start quiz
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default StudentQuizzes;