import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../config/axios";
import "./quizInstructions.css";

function QuizInstructions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${id}`);

        if (isMounted) {
          setQuiz(response.data.quiz);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load quiz details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuiz();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="quiz-instructions-state">
        <div className="quiz-instructions-loader" />
        <h3>Preparing your quiz</h3>
        <p>Please wait while we load the quiz details.</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="quiz-instructions-state">
        <div className="quiz-instructions-state-icon">
          <span className="material-symbols-rounded">
            error_outline
          </span>
        </div>

        <h3>Unable to open this quiz</h3>

        <p>
          {error || "The requested quiz could not be found."}
        </p>

        <button
          type="button"
          className="quiz-instructions-primary"
          onClick={() => navigate("/student/quizzes")}
        >
          Back to quizzes
        </button>
      </div>
    );
  }

  const questionCount = quiz.questions?.length ?? 0;

  return (
    <div className="quiz-instructions">
      <button
        type="button"
        className="quiz-instructions-back"
        onClick={() => navigate("/student/quizzes")}
      >
        <span aria-hidden="true">←</span>
        Back to quizzes
      </button>

      <section className="quiz-instructions-hero">
        <div className="quiz-instructions-icon">
          <span className="material-symbols-rounded">
            assignment
          </span>
        </div>

        <p className="quiz-instructions-eyebrow">
          Quiz overview
        </p>

        <h1>{quiz.title}</h1>

        <p className="quiz-instructions-description">
          {quiz.description ||
            "Review the details below before beginning your assessment."}
        </p>

        <div className="quiz-instructions-tags">
          <span>
            {quiz.course?.category || "ISL Learning"}
          </span>

          {quiz.lesson?.title && (
            <span>{quiz.lesson.title}</span>
          )}
        </div>
      </section>

      <section className="quiz-instructions-details">
        <div className="quiz-instructions-section-heading">
          <h2>Before you begin</h2>

          <p>
            Take a moment to understand how this quiz works.
          </p>
        </div>

        <div className="quiz-instructions-summary">
          <div className="quiz-instructions-summary-icon">
            <span className="material-symbols-rounded">
              format_list_numbered
            </span>
          </div>

          <div>
            <strong>{questionCount} questions</strong>

            <p>
              {questionCount === 1
                ? "This quiz contains one question."
                : `This quiz contains ${questionCount} questions.`}
            </p>
          </div>
        </div>

        <div className="quiz-instructions-rules">
          <div className="quiz-instructions-rule">
            <span className="material-symbols-rounded">
              check_circle
            </span>

            <div>
              <strong>Read every question carefully</strong>

              <p>
                Review the question and its available options
                before choosing your answer.
              </p>
            </div>
          </div>

          <div className="quiz-instructions-rule">
            <span className="material-symbols-rounded">
              radio_button_checked
            </span>

            <div>
              <strong>Select your answer</strong>

              <p>
                Choose the option that you believe is correct
                for each question.
              </p>
            </div>
          </div>

          <div className="quiz-instructions-rule">
            <span className="material-symbols-rounded">
              task_alt
            </span>

            <div>
              <strong>Review before submitting</strong>

              <p>
                Check your responses before submitting your
                completed quiz.
              </p>
            </div>
          </div>
        </div>

        {questionCount === 0 && (
          <div className="quiz-instructions-warning">
            This quiz does not contain any questions yet.
            Please return to the quiz list and choose another.
          </div>
        )}

        <div className="quiz-instructions-actions">
          <button
            type="button"
            className="quiz-instructions-secondary"
            onClick={() => navigate("/student/quizzes")}
          >
            Cancel
          </button>

          <button
            type="button"
            className="quiz-instructions-primary"
            disabled={questionCount === 0}
            onClick={() =>
              navigate(`/student/quizzes/${id}/attempt`)
            }
          >
            Begin quiz
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default QuizInstructions;