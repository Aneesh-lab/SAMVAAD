import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../config/axios";
import "./quizAttempt.css";

function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/quizzes/${id}`);
        const fetchedQuiz = response.data.quiz;

        if (!fetchedQuiz || !Array.isArray(fetchedQuiz.questions)) {
          throw new Error("Invalid quiz data received from the server.");
        }

        if (isMounted) {
          setQuiz(fetchedQuiz);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load this quiz. Please try again."
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

  const questions = quiz?.questions ?? [];
  const totalQuestions = questions.length;

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  const unansweredCount = totalQuestions - answeredCount;

  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const selectAnswer = (questionId, option) => {
    if (submitting) return;

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: option,
    }));

    setSubmitError("");
  };

  const goToQuestion = (index) => {
    if (
      index >= 0 &&
      index < totalQuestions &&
      !submitting
    ) {
      setCurrentQuestion(index);
      setShowReview(false);
    }
  };

  const handleNext = () => {
    if (submitting) return;

    if (currentQuestion < totalQuestions - 1) {
      goToQuestion(currentQuestion + 1);
    } else {
      setShowReview(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      goToQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitRequest = () => {
    if (!submitting) {
      setSubmitError("");
      setShowReview(true);
    }
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;

    const questionsWithoutIds = questions.some(
      (question) => !question._id
    );

    if (questionsWithoutIds) {
      setSubmitError(
        "Some questions are missing their IDs. Please reload the quiz and try again."
      );
      return;
    }

    const submittedAnswers = questions
      .filter((question) =>
        Object.prototype.hasOwnProperty.call(answers, question._id)
      )
      .map((question) => ({
        questionId: question._id,
        answer: answers[question._id],
      }));

    if (submittedAnswers.length === 0) {
      setSubmitError(
        "Please answer at least one question before submitting."
      );
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const response = await api.post(`/quizzes/${id}/submit`, {
        answers: submittedAnswers,
      });

      if (!response.data?.success || !response.data?.result) {
        throw new Error(
          response.data?.message ||
            "The server did not return a valid quiz result."
        );
      }

      // The results page will consume this response in Step 119F.
      navigate(`/student/quizzes/${id}/results`, {
        state: {
          result: response.data.result,
          quizTitle: quiz.title,
          quizId: id,
        },
        replace: true,
      });
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          err.message ||
          "Quiz submission failed. Your selected answers are still available. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="quiz-attempt-page">
        <div className="quiz-attempt-state">
          <div className="quiz-attempt-spinner" />
          <p>Loading your quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-attempt-page">
        <div className="quiz-attempt-state quiz-attempt-error">
          <h2>Unable to open quiz</h2>
          <p>{error}</p>

          <button
            type="button"
            className="quiz-attempt-primary-button"
            onClick={() => navigate("/student/quizzes")}
          >
            Back to quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || totalQuestions === 0) {
    return (
      <div className="quiz-attempt-page">
        <div className="quiz-attempt-state">
          <h2>No questions available</h2>
          <p>This quiz currently has no questions to attempt.</p>

          <button
            type="button"
            className="quiz-attempt-primary-button"
            onClick={() => navigate("/student/quizzes")}
          >
            Back to quizzes
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const questionId = question._id || `question-${currentQuestion}`;
  const selectedAnswer = answers[questionId];

  return (
    <div className="quiz-attempt-page">
      <header className="quiz-attempt-header">
        <button
          type="button"
          className="quiz-attempt-back-button"
          disabled={submitting}
          onClick={() => navigate("/student/quizzes")}
        >
          <span aria-hidden="true">←</span>
          <span>All quizzes</span>
        </button>

        <div className="quiz-attempt-header-title">
          <span className="quiz-attempt-eyebrow">
            QUIZ IN PROGRESS
          </span>
          <h1>{quiz.title}</h1>
        </div>
      </header>

      <div className="quiz-attempt-progress-section">
        <div className="quiz-attempt-progress-labels">
          <span>
            Question {currentQuestion + 1} of {totalQuestions}
          </span>

          <span>
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>

        <div
          className="quiz-attempt-progress-track"
          role="progressbar"
          aria-label="Quiz completion"
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
          aria-valuenow={answeredCount}
        >
          <div
            className="quiz-attempt-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="quiz-attempt-layout">
        <main className="quiz-attempt-main">
          <section className="quiz-question-card">
            <div className="quiz-question-meta">
              <span className="quiz-question-number">
                QUESTION {currentQuestion + 1}
              </span>

              <span
                className={`quiz-question-status ${
                  selectedAnswer ? "is-answered" : "is-unanswered"
                }`}
              >
                {selectedAnswer ? "Answered" : "Not answered"}
              </span>
            </div>

            <h2 className="quiz-question-text">
              {question.question}
            </h2>

            <p className="quiz-question-helper">
              Select one answer from the options below.
            </p>

            <div
              className="quiz-answer-list"
              role="radiogroup"
              aria-label={`Answer options for question ${
                currentQuestion + 1
              }`}
            >
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedAnswer === option;

                return (
                  <button
                    key={`${questionId}-${optionIndex}`}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={submitting}
                    className={`quiz-answer-option ${
                      isSelected ? "is-selected" : ""
                    }`}
                    onClick={() => selectAnswer(questionId, option)}
                  >
                    <span className="quiz-answer-letter">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>

                    <span className="quiz-answer-text">
                      {option}
                    </span>

                    <span
                      className="quiz-answer-indicator"
                      aria-hidden="true"
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="quiz-question-navigation">
              <button
                type="button"
                className="quiz-attempt-secondary-button"
                onClick={handlePrevious}
                disabled={currentQuestion === 0 || submitting}
              >
                Previous
              </button>

              <button
                type="button"
                className="quiz-attempt-primary-button"
                onClick={handleNext}
                disabled={submitting}
              >
                {currentQuestion === totalQuestions - 1
                  ? "Review answers"
                  : "Next question"}
                <span aria-hidden="true"> →</span>
              </button>
            </div>
          </section>
        </main>

        <aside className="quiz-attempt-sidebar">
          <section className="quiz-question-map-card">
            <div className="quiz-sidebar-heading">
              <h3>Question overview</h3>
              <span>{totalQuestions}</span>
            </div>

            <p className="quiz-sidebar-description">
              Select a question number to navigate.
            </p>

            <div className="quiz-question-grid">
              {questions.map((item, index) => {
                const itemId = item._id || `question-${index}`;
                const isAnswered = Boolean(answers[itemId]);
                const isCurrent = index === currentQuestion;

                return (
                  <button
                    key={itemId}
                    type="button"
                    disabled={submitting}
                    className={[
                      "quiz-question-grid-item",
                      isCurrent ? "is-current" : "",
                      isAnswered ? "is-answered" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => goToQuestion(index)}
                    aria-label={`Question ${index + 1}${
                      isAnswered ? ", answered" : ", unanswered"
                    }${isCurrent ? ", current question" : ""}`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="quiz-question-legend">
              <span>
                <i className="legend-dot legend-current" />
                Current
              </span>

              <span>
                <i className="legend-dot legend-answered" />
                Answered
              </span>

              <span>
                <i className="legend-dot legend-unanswered" />
                Unanswered
              </span>
            </div>
          </section>

          <section className="quiz-attempt-summary-card">
            <h3>Your progress</h3>

            <div className="quiz-summary-row">
              <span>Answered</span>
              <strong>{answeredCount}</strong>
            </div>

            <div className="quiz-summary-row">
              <span>Unanswered</span>
              <strong>{unansweredCount}</strong>
            </div>

            <button
              type="button"
              className="quiz-attempt-submit-button"
              onClick={handleSubmitRequest}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Review before submitting"}
            </button>

            <p className="quiz-submit-note">
              You can review your answers before finishing.
            </p>
          </section>
        </aside>
      </div>

      {showReview && (
        <div
          className="quiz-review-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !submitting
            ) {
              setShowReview(false);
            }
          }}
        >
          <section
            className="quiz-review-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-review-title"
            aria-busy={submitting}
          >
            {!submitting && (
              <button
                type="button"
                className="quiz-review-close"
                aria-label="Close review"
                onClick={() => setShowReview(false)}
              >
                ×
              </button>
            )}

            <span className="quiz-review-eyebrow">
              BEFORE YOU FINISH
            </span>

            <h2 id="quiz-review-title">
              Review your answers
            </h2>

            <p className="quiz-review-description">
              Check your progress before submitting this quiz.
            </p>

            <div className="quiz-review-stats">
              <div>
                <strong>{answeredCount}</strong>
                <span>Answered</span>
              </div>

              <div>
                <strong>{unansweredCount}</strong>
                <span>Unanswered</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="quiz-review-warning">
                You still have {unansweredCount} unanswered{" "}
                {unansweredCount === 1
                  ? "question"
                  : "questions"}.
                You can return to them before finishing.
              </p>
            )}

            {submitError && (
              <p className="quiz-review-warning" role="alert">
                {submitError}
              </p>
            )}

            <div className="quiz-review-actions">
              <button
                type="button"
                className="quiz-attempt-secondary-button"
                disabled={submitting}
                onClick={() => {
                  const firstUnansweredIndex = questions.findIndex(
                    (item, index) => {
                      const itemId = item._id || `question-${index}`;
                      return !answers[itemId];
                    }
                  );

                  if (firstUnansweredIndex !== -1) {
                    goToQuestion(firstUnansweredIndex);
                  } else {
                    setShowReview(false);
                  }
                }}
              >
                {unansweredCount > 0
                  ? "Review unanswered"
                  : "Return to quiz"}
              </button>

              <button
                type="button"
                className="quiz-attempt-primary-button"
                disabled={submitting}
                onClick={handleSubmitQuiz}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit quiz"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default QuizAttempt;