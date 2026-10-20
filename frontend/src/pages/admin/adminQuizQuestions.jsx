import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../config/axios";
import "./adminQuizQuestions.css";

const createEmptyQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
});

const AdminQuizQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------
  // Fetch quiz
  // --------------------------------
  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/quizzes/admin/${id}`
      );

      const fetchedQuiz = response.data.quiz;

      setQuiz(fetchedQuiz);
      setQuestions(
        fetchedQuiz.questions?.map((question) => ({
          _id: question._id,
          question: question.question || "",
          options: [
            question.options?.[0] || "",
            question.options?.[1] || "",
            question.options?.[2] || "",
            question.options?.[3] || "",
          ],
          correctAnswer:
            question.correctAnswer || "",
          explanation:
            question.explanation || "",
        })) || []
      );
    } catch (error) {
      console.error(
        "Fetch quiz questions error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  // --------------------------------
  // Add question
  // --------------------------------
  const handleAddQuestion = () => {
    setQuestions((previous) => [
      ...previous,
      createEmptyQuestion(),
    ]);

    setSuccess("");
    setError("");
  };

  // --------------------------------
  // Update question text
  // --------------------------------
  const handleQuestionChange = (
    questionIndex,
    value
  ) => {
    setQuestions((previous) =>
      previous.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              question: value,
            }
          : question
      )
    );

    setSuccess("");
  };

  // --------------------------------
  // Update option
  // --------------------------------
  const handleOptionChange = (
    questionIndex,
    optionIndex,
    value
  ) => {
    setQuestions((previous) =>
      previous.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        const updatedOptions = [
          ...question.options,
        ];

        const oldValue =
          updatedOptions[optionIndex];

        updatedOptions[optionIndex] = value;

        return {
          ...question,
          options: updatedOptions,
          correctAnswer:
            question.correctAnswer === oldValue
              ? value
              : question.correctAnswer,
        };
      })
    );

    setSuccess("");
  };

  // --------------------------------
  // Update correct answer
  // --------------------------------
  const handleCorrectAnswerChange = (
    questionIndex,
    value
  ) => {
    setQuestions((previous) =>
      previous.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              correctAnswer: value,
            }
          : question
      )
    );

    setSuccess("");
  };

  // --------------------------------
  // Update explanation
  // --------------------------------
  const handleExplanationChange = (
    questionIndex,
    value
  ) => {
    setQuestions((previous) =>
      previous.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              explanation: value,
            }
          : question
      )
    );

    setSuccess("");
  };

  // --------------------------------
  // Remove question
  // --------------------------------
  const handleRemoveQuestion = (
    questionIndex
  ) => {
    setQuestions((previous) =>
      previous.filter(
        (_, index) => index !== questionIndex
      )
    );

    setSuccess("");
    setError("");
  };

  // --------------------------------
  // Validate questions
  // --------------------------------
  const validateQuestions = () => {
    for (
      let index = 0;
      index < questions.length;
      index++
    ) {
      const question = questions[index];

      if (!question.question.trim()) {
        return `Question ${index + 1} needs question text.`;
      }

      const validOptions =
        question.options.filter(
          (option) => option.trim()
        );

      if (validOptions.length < 2) {
        return `Question ${
          index + 1
        } must have at least 2 options.`;
      }

      if (!question.correctAnswer.trim()) {
        return `Please select a correct answer for Question ${
          index + 1
        }.`;
      }

      if (
        !validOptions.some(
          (option) =>
            option.trim().toLowerCase() ===
            question.correctAnswer
              .trim()
              .toLowerCase()
        )
      ) {
        return `Correct answer for Question ${
          index + 1
        } must match one of its options.`;
      }
    }

    return "";
  };

  // --------------------------------
  // Save questions
  // --------------------------------
  const handleSaveQuestions = async () => {
    const validationError =
      validateQuestions();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const cleanedQuestions =
        questions.map((question) => ({
          ...(question._id
            ? { _id: question._id }
            : {}),
          question: question.question.trim(),
          options: question.options
            .filter((option) => option.trim())
            .map((option) => option.trim()),
          correctAnswer:
            question.correctAnswer.trim(),
          explanation:
            question.explanation.trim(),
        }));

      const response = await api.put(
        `/quizzes/admin/${id}/questions`,
        {
          questions: cleanedQuestions,
        }
      );

      setQuiz(response.data.quiz);

      setQuestions(
        response.data.quiz.questions.map(
          (question) => ({
            _id: question._id,
            question:
              question.question || "",
            options: [
              question.options?.[0] || "",
              question.options?.[1] || "",
              question.options?.[2] || "",
              question.options?.[3] || "",
            ],
            correctAnswer:
              question.correctAnswer || "",
            explanation:
              question.explanation || "",
          })
        )
      );

      setSuccess(
        "Questions saved successfully."
      );

      setTimeout(() => {
  navigate("/admin/quizzes");
}, 800);
    } catch (error) {
      console.error(
        "Save quiz questions error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to save questions."
      );
    } finally {
      setSaving(false);
    }
  };



  // --------------------------------
  // Loading
  // --------------------------------
  if (loading) {
    return (
      <div className="admin-quiz-questions-page">
        <div className="admin-quiz-questions-state">
          <span className="material-symbols-rounded">
            progress_activity
          </span>

          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  // --------------------------------
  // Error without quiz
  // --------------------------------
  if (!quiz) {
    return (
      <div className="admin-quiz-questions-page">
        <div className="admin-quiz-questions-error-state">
          <span className="material-symbols-rounded">
            error
          </span>

          <h2>Unable to load quiz</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/quizzes")
            }
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-quiz-questions-page">
      {/* Header */}
      <div className="admin-quiz-questions-header">
        <div>
          <button
            type="button"
            className="admin-quiz-questions-back"
            onClick={() =>
              navigate("/admin/quizzes")
            }
          >
            <span className="material-symbols-rounded">
              arrow_back
            </span>

            Back to Quizzes
          </button>

          <p className="admin-quiz-questions-eyebrow">
            QUESTION MANAGEMENT
          </p>

          <h1>{quiz.title}</h1>

          <p className="admin-quiz-questions-subtitle">
            Add and manage questions for this quiz.
          </p>
        </div>

        <div className="admin-quiz-questions-header-actions">
          <span
            className={
              quiz.isPublished
                ? "admin-quiz-question-status published"
                : "admin-quiz-question-status draft"
            }
          >
            {quiz.isPublished
              ? "Published"
              : "Draft"}
          </span>

          <span className="admin-quiz-question-count">
            {questions.length}{" "}
            {questions.length === 1
              ? "question"
              : "questions"}
          </span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="admin-quiz-questions-error">
          <span className="material-symbols-rounded">
            error
          </span>

          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="admin-quiz-questions-success">
          <span className="material-symbols-rounded">
            check_circle
          </span>

          <span>{success}</span>
        </div>
      )}

      {/* Questions */}
      <div className="admin-quiz-question-list">
        {questions.length === 0 ? (
          <div className="admin-quiz-question-empty">
            <span className="material-symbols-rounded">
              quiz
            </span>

            <h2>No questions yet</h2>

            <p>
              Add the first question to this quiz.
            </p>

            <button
              type="button"
              onClick={handleAddQuestion}
            >
              <span className="material-symbols-rounded">
                add
              </span>

              Add Question
            </button>
          </div>
        ) : (
          questions.map(
            (question, questionIndex) => (
              <article
                key={
                  question._id ||
                  `new-${questionIndex}`
                }
                className="admin-quiz-question-card"
              >
                <div className="admin-quiz-question-card-header">
                  <div>
                    <span className="admin-quiz-question-number">
                      Question {questionIndex + 1}
                    </span>

                    <h2>
                      {question.question.trim()
                        ? question.question
                        : "New question"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="admin-quiz-question-remove"
                    onClick={() =>
                      handleRemoveQuestion(
                        questionIndex
                      )
                    }
                  >
                    <span className="material-symbols-rounded">
                      delete
                    </span>

                    Remove
                  </button>
                </div>

                <div className="admin-quiz-question-field">
                  <label>
                    Question
                  </label>

                  <textarea
                    value={question.question}
                    onChange={(event) =>
                      handleQuestionChange(
                        questionIndex,
                        event.target.value
                      )
                    }
                    placeholder="e.g. Which gesture represents Hello?"
                    rows="3"
                  />
                </div>

                <div className="admin-quiz-options-section">
                  <div className="admin-quiz-section-heading">
                    <div>
                      <h3>Options</h3>
                      <p>
                        Add at least two answer options.
                      </p>
                    </div>
                  </div>

                  <div className="admin-quiz-options-grid">
                    {question.options.map(
                      (option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="admin-quiz-option-field"
                        >
                          <span className="admin-quiz-option-label">
                            {String.fromCharCode(
                              65 + optionIndex
                            )}
                          </span>

                          <input
                            type="text"
                            value={option}
                            onChange={(event) =>
                              handleOptionChange(
                                questionIndex,
                                optionIndex,
                                event.target.value
                              )
                            }
                            placeholder={`Option ${
                              optionIndex + 1
                            }`}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="admin-quiz-question-grid">
                  <div className="admin-quiz-question-field">
                    <label>
                      Correct Answer
                    </label>

                    <select
                      value={
                        question.correctAnswer
                      }
                      onChange={(event) =>
                        handleCorrectAnswerChange(
                          questionIndex,
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Select correct answer
                      </option>

                      {question.options
                        .filter(
                          (option) =>
                            option.trim()
                        )
                        .map(
                          (
                            option,
                            optionIndex
                          ) => (
                            <option
                              key={`${option}-${optionIndex}`}
                              value={option}
                            >
                              {String.fromCharCode(
                                65 + optionIndex
                              )}{" "}
                              — {option}
                            </option>
                          )
                        )}
                    </select>
                  </div>

                  <div className="admin-quiz-question-field">
                    <label>
                      Explanation
                      <span className="optional-label">
                        Optional
                      </span>
                    </label>

                    <input
                      type="text"
                      value={
                        question.explanation
                      }
                      onChange={(event) =>
                        handleExplanationChange(
                          questionIndex,
                          event.target.value
                        )
                      }
                      placeholder="Explain why this answer is correct..."
                    />
                  </div>
                </div>
              </article>
            )
          )
        )}
      </div>

      {/* Bottom Actions */}
      {questions.length > 0 && (
        <div className="admin-quiz-question-footer">
          <button
            type="button"
            className="admin-quiz-add-question-button"
            onClick={handleAddQuestion}
          >
            <span className="material-symbols-rounded">
              add
            </span>

            Add Question
          </button>

          <button
            type="button"
            className="admin-quiz-save-button"
            onClick={handleSaveQuestions}
            disabled={saving}
          >
            <span className="material-symbols-rounded">
              {saving
                ? "progress_activity"
                : "save"}
            </span>

            {saving
              ? "Saving..."
              : "Save Questions"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminQuizQuestions;