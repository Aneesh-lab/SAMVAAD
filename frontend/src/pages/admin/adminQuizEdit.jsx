import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../config/axios";
import "./adminQuizEdit.css";

const AdminQuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    lesson: "",
    isPublished: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");

      setCourses(response.data.courses || []);
    } catch (error) {
      console.error("Fetch courses error:", error);
    }
  };

  const fetchLessons = async (courseId) => {
    if (!courseId) {
      setLessons([]);
      return;
    }

    try {
      const response = await api.get(
        `/lessons/course/${courseId}`
      );

      setLessons(response.data.lessons || []);
    } catch (error) {
      console.error("Fetch lessons error:", error);
      setLessons([]);
    }
  };

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/quizzes/admin/${id}`
      );

      const quiz = response.data.quiz;

      setFormData({
        title: quiz.title || "",
        description: quiz.description || "",
        course: quiz.course?._id || quiz.course || "",
        lesson: quiz.lesson?._id || quiz.lesson || "",
        isPublished: quiz.isPublished || false,
      });

      if (quiz.course?._id || quiz.course) {
        await fetchLessons(
          quiz.course?._id || quiz.course
        );
      }
    } catch (error) {
      console.error("Fetch quiz error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load quiz"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCourses();
      await fetchQuiz();
    };

    loadData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleCourseChange = async (event) => {
    const courseId = event.target.value;

    setFormData((previous) => ({
      ...previous,
      course: courseId,
      lesson: "",
    }));

    await fetchLessons(courseId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!formData.title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    if (!formData.course) {
      setError("Please select a course.");
      return;
    }

    try {
      setSaving(true);

      await api.put(
        `/quizzes/admin/${id}`,
        {
          title: formData.title.trim(),
          description:
            formData.description.trim(),
          course: formData.course,
          lesson: formData.lesson || null,
          isPublished:
            formData.isPublished,
        }
      );

      setSuccessMessage(
        "Quiz updated successfully."
      );

      setTimeout(() => {
        navigate("/admin/quizzes");
      }, 800);
    } catch (error) {
      console.error("Update quiz error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update quiz"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-quiz-edit-page">
        <div className="admin-quiz-edit-state">
          Loading quiz...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-quiz-edit-page">
      <div className="admin-quiz-edit-header">
        <div>
          <button
            type="button"
            className="admin-quiz-edit-back-button"
            onClick={() =>
              navigate("/admin/quizzes")
            }
          >
            <span className="material-symbols-rounded">
              arrow_back
            </span>
            Back to Quizzes
          </button>

          <h1>Edit Quiz</h1>

          <p>
            Update the basic information for this
            quiz.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-quiz-edit-message admin-quiz-edit-error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="admin-quiz-edit-message admin-quiz-edit-success">
          {successMessage}
        </div>
      )}

      <form
        className="admin-quiz-edit-form"
        onSubmit={handleSubmit}
      >
        <div className="admin-quiz-edit-field">
          <label htmlFor="title">
            Quiz Title
          </label>

          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter quiz title"
          />
        </div>

        <div className="admin-quiz-edit-field">
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter quiz description"
            rows="4"
          />
        </div>

        <div className="admin-quiz-edit-field">
          <label htmlFor="course">
            Course
          </label>

          <select
            id="course"
            name="course"
            value={formData.course}
            onChange={handleCourseChange}
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

        <div className="admin-quiz-edit-field">
          <label htmlFor="lesson">
            Lesson
          </label>

          <select
            id="lesson"
            name="lesson"
            value={formData.lesson}
            onChange={handleChange}
            disabled={!formData.course}
          >
            <option value="">
              No specific lesson
            </option>

            {lessons.map((lesson) => (
              <option
                key={lesson._id}
                value={lesson._id}
              >
                {lesson.title}
              </option>
            ))}
          </select>
        </div>

        <label className="admin-quiz-edit-publish">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
          />

          <span>
            Publish this quiz
          </span>
        </label>

        <div className="admin-quiz-edit-actions">
          <button
            type="button"
            className="admin-quiz-edit-cancel-button"
            onClick={() =>
              navigate("/admin/quizzes")
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="admin-quiz-edit-save-button"
            disabled={saving}
          >
            <span className="material-symbols-rounded">
              {saving
                ? "progress_activity"
                : "save"}
            </span>

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminQuizEdit;