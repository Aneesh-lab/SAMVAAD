import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import "./adminQuizzes.css";

const AdminQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [creating, setCreating] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [deletingQuizId, setDeletingQuizId] =
  useState(null);

  const [updatingQuizId, setUpdatingQuizId] =
  useState(null);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    lesson: "",
  });

  // -----------------------------
  // Fetch quizzes
  // -----------------------------
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/quizzes");

      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error("Fetch quizzes error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load quizzes."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Fetch courses
  // -----------------------------
  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");

      setCourses(response.data.courses || []);
    } catch (error) {
      console.error("Fetch courses error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load courses."
      );
    }
  };

  // -----------------------------
  // Fetch lessons by course
  // -----------------------------
  const fetchLessons = async (courseId) => {
    if (!courseId) {
      setLessons([]);
      return;
    }

    try {
      setLoadingLessons(true);

      const response = await api.get(
        `/lessons/course/${courseId}`
      );

      setLessons(response.data.lessons || []);
    } catch (error) {
      console.error("Fetch lessons error:", error);

      setLessons([]);

      setError(
        error.response?.data?.message ||
          "Unable to load lessons."
      );
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  // -----------------------------
  // Input handler
  // -----------------------------
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "course") {
      setFormData((previous) => ({
        ...previous,
        course: value,
        lesson: "",
      }));

      fetchLessons(value);
    }
  };

  // -----------------------------
  // Create quiz
  // -----------------------------
  const handleCreateQuiz = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    if (!formData.course) {
      setError("Please select a course.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.post("/quizzes", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        course: formData.course,
        lesson: formData.lesson || null,
        questions: [],
        isPublished: false,
      });

      setFormData({
        title: "",
        description: "",
        course: "",
        lesson: "",
      });

      setLessons([]);
      setShowForm(false);

      await fetchQuizzes();
    } catch (error) {
      console.error("Create quiz error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create quiz."
      );
    } finally {
      setCreating(false);
    }
  };

  // -----------------------------
  // Cancel form
  // -----------------------------
  const handleCancelForm = () => {
    setShowForm(false);

    setFormData({
      title: "",
      description: "",
      course: "",
      lesson: "",
    });

    setLessons([]);
    setError("");
  };

// Delete Quizzz
const handleDeleteQuiz = async (quiz) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${quiz.title}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeletingQuizId(quiz._id);
    setError("");

    await api.delete(
      `/quizzes/admin/${quiz._id}`
    );

    setQuizzes((previousQuizzes) =>
      previousQuizzes.filter(
        (item) => item._id !== quiz._id
      )
    );
  } catch (error) {
    console.error("Delete quiz error:", error);

    setError(
      error.response?.data?.message ||
        "Failed to delete quiz"
    );
  } finally {
    setDeletingQuizId(null);
  }
};

//Toggle publish status
const handleTogglePublish = async (quiz) => {
  try {
    setUpdatingQuizId(quiz._id);
    setError("");

    const response = await api.patch(
      `/quizzes/admin/${quiz._id}/publish`
    );

    const updatedQuiz = response.data.quiz;

    setQuizzes((previousQuizzes) =>
      previousQuizzes.map((item) =>
        item._id === quiz._id
          ? {
              ...item,
              isPublished: updatedQuiz.isPublished,
            }
          : item
      )
    );
  } catch (error) {
    console.error("Toggle quiz publish status error:", error);

    setError(
      error.response?.data?.message ||
        "Failed to update quiz publish status."
    );
  } finally {
    setUpdatingQuizId(null);
  }
};

  return (
    <div className="admin-quizzes-page">
      {/* Header */}
      <div className="admin-quizzes-header">
        <div>
          <p className="admin-quizzes-eyebrow">
            Quiz Management
          </p>

          <h1>Quizzes</h1>

          <p className="admin-quizzes-subtitle">
            Create and manage quizzes for SAMVAAD
            learners.
          </p>
        </div>

        <button
          type="button"
          className="admin-quizzes-create-button"
          onClick={() => {
            setShowForm(true);
            setError("");
          }}
        >
          <span className="material-symbols-rounded">
            add
          </span>

          Create Quiz
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="admin-quizzes-error">
          {error}
        </div>
      )}

      {/* Create Quiz Form */}
      {showForm && (
        <section className="admin-quiz-form-section">
          <div className="admin-quiz-form-header">
            <div>
              <p className="admin-quiz-form-eyebrow">
                New Quiz
              </p>

              <h2>Create Quiz</h2>

              <p>
                Add the basic details first. Questions
                can be added after the quiz is created.
              </p>
            </div>

            <button
              type="button"
              className="admin-quiz-form-close"
              onClick={handleCancelForm}
            >
              <span className="material-symbols-rounded">
                close
              </span>
            </button>
          </div>

          <form
            className="admin-quiz-form"
            onSubmit={handleCreateQuiz}
          >
            <div className="admin-quiz-form-field">
              <label htmlFor="quiz-title">
                Quiz Title
              </label>

              <input
                id="quiz-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Greetings Quiz"
              />
            </div>

            <div className="admin-quiz-form-field">
              <label htmlFor="quiz-description">
                Description
              </label>

              <textarea
                id="quiz-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what students will be tested on..."
                rows="4"
              />
            </div>

            <div className="admin-quiz-form-grid">
              <div className="admin-quiz-form-field">
                <label htmlFor="quiz-course">
                  Course
                </label>

                <select
                  id="quiz-course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                >
                  <option value="">
                    Select a course
                  </option>

                  {courses.map((course) => (
                    <option
                      key={course._id}
                      value={course._id}
                    >
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-quiz-form-field">
                <label htmlFor="quiz-lesson">
                  Lesson
                  <span className="optional-label">
                    Optional
                  </span>
                </label>

                <select
                  id="quiz-lesson"
                  name="lesson"
                  value={formData.lesson}
                  onChange={handleInputChange}
                  disabled={
                    !formData.course ||
                    loadingLessons
                  }
                >
                  <option value="">
                    {loadingLessons
                      ? "Loading lessons..."
                      : "Course quiz"}
                  </option>

                  {lessons.map((lesson) => (
                    <option
                      key={lesson._id}
                      value={lesson._id}
                    >
                      {lesson.order}. {lesson.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-quiz-form-actions">
              <button
                type="button"
                className="admin-quiz-cancel-button"
                onClick={handleCancelForm}
                disabled={creating}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-quiz-submit-button"
                disabled={creating}
              >
                <span className="material-symbols-rounded">
                  {creating
                    ? "progress_activity"
                    : "add"}
                </span>

                {creating
                  ? "Creating..."
                  : "Create Quiz"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Quiz List */}
      {loading ? (
        <div className="admin-quizzes-state">
          <span className="material-symbols-rounded">
            progress_activity
          </span>

          Loading quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="admin-quizzes-empty">
          <span className="material-symbols-rounded">
            quiz
          </span>

          <h2>No quizzes yet</h2>

          <p>
            Create your first quiz to start testing
            student knowledge.
          </p>
        </div>
      ) : (
        <div className="admin-quizzes-list">
          {quizzes.map((quiz) => (
            <article
              key={quiz._id}
              className="admin-quiz-card"
            >
              <div className="admin-quiz-content">
                <div className="admin-quiz-title-row">
                  <h2>{quiz.title}</h2>

                  <span
                    className={
                      quiz.isPublished
                        ? "admin-quiz-status published"
                        : "admin-quiz-status draft"
                    }
                  >
                    {quiz.isPublished
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

                <p className="admin-quiz-description">
                  {quiz.description ||
                    "No description provided."}
                </p>

                <div className="admin-quiz-meta">
                  <span>
                    <span className="material-symbols-rounded">
                      school
                    </span>

                    {quiz.course?.title ||
                      "No course"}
                  </span>

                  <span>
                    <span className="material-symbols-rounded">
                      menu_book
                    </span>

                    {quiz.lesson?.title ||
                      "Course quiz"}
                  </span>

                  <span>
                    <span className="material-symbols-rounded">
                      help
                    </span>

                    {quiz.questions?.length || 0}{" "}
                    questions
                  </span>
                </div>
              </div>

              <div className="admin-quiz-actions">

<button
  type="button"
  className={
    quiz.isPublished
      ? "admin-quiz-publish-button unpublish"
      : "admin-quiz-publish-button publish"
  }
  onClick={() => handleTogglePublish(quiz)}
  disabled={
    updatingQuizId === quiz._id ||
    deletingQuizId === quiz._id
  }
>
  <span className="material-symbols-rounded">
    {updatingQuizId === quiz._id
      ? "progress_activity"
      : quiz.isPublished
        ? "unpublished"
        : "publish"}
  </span>

  {updatingQuizId === quiz._id
    ? "Updating..."
    : quiz.isPublished
      ? "Move to Draft"
      : "Publish"}
</button>




<button
  type="button"
  className="admin-quiz-questions-button"
  onClick={() =>
    navigate(
      `/admin/quizzes/${quiz._id}/questions`
    )
  }
>
  <span className="material-symbols-rounded">
    quiz
  </span>

  Questions
</button>




               <button
  type="button"
  className="admin-quiz-edit-button"
  onClick={() =>
    navigate(
      `/admin/quizzes/${quiz._id}/edit`
    )
  }
>
  <span className="material-symbols-rounded">
    edit
  </span>

  Edit
</button>

            <button
  type="button"
  className="admin-quiz-delete-button"
  onClick={() =>
    handleDeleteQuiz(quiz)
  }
  disabled={
    deletingQuizId === quiz._id
  }
>
  <span className="material-symbols-rounded">
    {deletingQuizId === quiz._id
      ? "progress_activity"
      : "delete"}
  </span>

  {deletingQuizId === quiz._id
    ? "Deleting..."
    : "Delete"}
</button>    
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuizzes;