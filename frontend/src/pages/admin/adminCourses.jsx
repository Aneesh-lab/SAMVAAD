import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../config/axios";
import "./adminCourses.css";

function AdminCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [editingCourse, setEditingCourse] =
    useState(null);

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deletingCourseId, setDeletingCourseId] =
  useState(null);

  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    thumbnail: "",
    isPublished: false,
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/courses");

      setCourses(response.data.courses || []);
    } catch (error) {
      console.error(
        "Fetch admin courses error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleFormChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      level: "Beginner",
      thumbnail: "",
      isPublished: false,
    });

    setFormError("");
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setFormError("");

      await api.post("/courses", formData);

      resetForm();
      setShowCreateForm(false);

      await fetchCourses();
    } catch (error) {
      console.error(
        "Create course error:",
        error
      );

      setFormError(
        error.response?.data?.message ||
          "Unable to create course."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);

    setFormData({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      level: course.level || "Beginner",
      thumbnail: course.thumbnail || "",
      isPublished: course.isPublished || false,
    });

    setFormError("");
    setShowCreateForm(false);
  };

  const handleUpdateCourse = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setFormError("");

      await api.put(
        `/courses/${editingCourse._id}`,
        formData
      );

      resetForm();
      setEditingCourse(null);

      await fetchCourses();
    } catch (error) {
      console.error(
        "Update course error:",
        error
      );

      setFormError(
        error.response?.data?.message ||
          "Unable to update course."
      );
    } finally {
      setSaving(false);
    }
  };

const handleDeleteCourse = async (course) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${course.title}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeletingCourseId(course._id);
    setError("");

    await api.delete(`/courses/${course._id}`);

    await fetchCourses();
  } catch (error) {
    console.error(
      "Delete course error:",
      error
    );

    setError(
      error.response?.data?.message ||
        "Unable to delete course."
    );
  } finally {
    setDeletingCourseId(null);
  }
};

  const handleCancelCreate = () => {
    if (creating) {
      return;
    }

    resetForm();
    setShowCreateForm(false);
  };

  const handleCancelEdit = () => {
    if (saving) {
      return;
    }

    resetForm();
    setEditingCourse(null);
  };

  return (
    <div className="admin-courses-page">
      <div className="admin-courses-header">
        <div>
          <span className="admin-courses-eyebrow">
            COURSE MANAGEMENT
          </span>

          <h1>Courses</h1>

          <p>
            Create, manage, and publish learning
            courses for SAMVAAD students.
          </p>
        </div>

        {!showCreateForm && !editingCourse && (
          <button
            type="button"
            className="admin-courses-create-button"
            onClick={() => {
              setFormError("");
              setShowCreateForm(true);
            }}
          >
            <span className="material-symbols-rounded">
              add
            </span>

            Create Course
          </button>
        )}
      </div>

      {(showCreateForm || editingCourse) && (
        <section className="admin-course-form-section">
          <div className="admin-course-form-header">
            <div>
              <span className="admin-course-form-eyebrow">
                {editingCourse
                  ? "EDIT COURSE"
                  : "NEW COURSE"}
              </span>

              <h2>
                {editingCourse
                  ? "Edit Course"
                  : "Create Course"}
              </h2>

              <p>
                {editingCourse
                  ? "Update the course information and publishing status."
                  : "Add a new learning course to the SAMVAAD platform."}
              </p>
            </div>

            <button
              type="button"
              className="admin-course-form-close"
              onClick={
                editingCourse
                  ? handleCancelEdit
                  : handleCancelCreate
              }
              disabled={creating || saving}
              aria-label="Close course form"
            >
              <span className="material-symbols-rounded">
                close
              </span>
            </button>
          </div>

          <form
            className="admin-course-form"
            onSubmit={
              editingCourse
                ? handleUpdateCourse
                : handleCreateCourse
            }
          >
            <div className="admin-course-form-group">
              <label htmlFor="course-title">
                Course Title
              </label>

              <input
                id="course-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g. Basic Greetings"
                required
              />
            </div>

            <div className="admin-course-form-group">
              <label htmlFor="course-description">
                Description
              </label>

              <textarea
                id="course-description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Describe what students will learn in this course."
                rows="5"
                required
              />
            </div>

            <div className="admin-course-form-row">
              <div className="admin-course-form-group">
                <label htmlFor="course-category">
                  Category
                </label>

                <input
                  id="course-category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleFormChange}
                  placeholder="e.g. Greetings"
                  required
                />
              </div>

              <div className="admin-course-form-group">
                <label htmlFor="course-level">
                  Level
                </label>

                <select
                  id="course-level"
                  name="level"
                  value={formData.level}
                  onChange={handleFormChange}
                >
                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Advanced">
                    Advanced
                  </option>
                </select>
              </div>
            </div>

            <div className="admin-course-form-group">
              <label htmlFor="course-thumbnail">
                Thumbnail URL
              </label>

              <input
                id="course-thumbnail"
                name="thumbnail"
                type="url"
                value={formData.thumbnail}
                onChange={handleFormChange}
                placeholder="https://example.com/image.jpg"
              />

              <small>
                Optional. You can add a thumbnail
                URL later if needed.
              </small>
            </div>

            <label className="admin-course-publish-toggle">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleFormChange}
              />

              <span className="admin-course-checkbox">
                <span className="material-symbols-rounded">
                  check
                </span>
              </span>

              <span>
                <strong>
                  Publish this course
                </strong>

                <small>
                  Published courses are visible to
                  students.
                </small>
              </span>
            </label>

            {formError && (
              <div className="admin-course-form-error">
                <span className="material-symbols-rounded">
                  error
                </span>

                <span>{formError}</span>
              </div>
            )}

            <div className="admin-course-form-actions">
              <button
                type="button"
                className="admin-course-form-cancel"
                onClick={
                  editingCourse
                    ? handleCancelEdit
                    : handleCancelCreate
                }
                disabled={creating || saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-course-form-submit"
                disabled={creating || saving}
              >
                {editingCourse ? (
                  saving ? (
                    <>
                      <span className="material-symbols-rounded">
                        progress_activity
                      </span>

                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-rounded">
                        save
                      </span>

                      Save Changes
                    </>
                  )
                ) : creating ? (
                  <>
                    <span className="material-symbols-rounded">
                      progress_activity
                    </span>

                    Creating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-rounded">
                      add
                    </span>

                    Create Course
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading && (
        <div className="admin-courses-state">
          <span className="material-symbols-rounded">
            progress_activity
          </span>

          <p>Loading courses...</p>
        </div>
      )}

      {!loading && error && (
        <div className="admin-courses-state admin-courses-error">
          <span className="material-symbols-rounded">
            error
          </span>

          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        courses.length === 0 && (
          <div className="admin-courses-state">
            <span className="material-symbols-rounded">
              menu_book
            </span>

            <h2>No courses yet</h2>

            <p>
              Create your first course to start
              building the SAMVAAD learning library.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        courses.length > 0 && (
          <div className="admin-courses-grid">
            {courses.map((course) => (
              <article
                key={course._id}
                className="admin-course-card"
              >
                <div className="admin-course-card-top">
                  <div className="admin-course-icon">
                    <span className="material-symbols-rounded">
                      menu_book
                    </span>
                  </div>

                  <span
                    className={`admin-course-status ${
                      course.isPublished
                        ? "admin-course-status-published"
                        : "admin-course-status-draft"
                    }`}
                  >
                    {course.isPublished
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

                <div className="admin-course-content">
                  <span className="admin-course-category">
                    {course.category || "General"}
                  </span>

                  <h2>{course.title}</h2>

                  <p>
                    {course.description ||
                      "No description available."}
                  </p>
                </div>

                <div className="admin-course-meta">
                  <span>
                    <span className="material-symbols-rounded">
                      signal_cellular_alt
                    </span>

                    {course.level || "Beginner"}
                  </span>

                  <span>
                    <span className="material-symbols-rounded">
                      calendar_today
                    </span>

                    {course.createdAt
                      ? new Date(
                          course.createdAt
                        ).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                <div className="admin-course-actions">
                  <button
                    type="button"
                    className="admin-course-edit-button"
                    onClick={() =>
                      handleEditCourse(course)
                    }
                  >
                    <span className="material-symbols-rounded">
                      edit
                    </span>

                    Edit
                  </button>

                  <button
  type="button"
  className="admin-course-lessons-button"
  onClick={() =>
    navigate(
      `/admin/courses/${course._id}/lessons`
    )
  }
>
  <span className="material-symbols-rounded">
    play_lesson
  </span>

  Lessons
</button>

                  <button
  type="button"
  className="admin-course-delete-button"
  onClick={() => handleDeleteCourse(course)}
  disabled={
    deletingCourseId === course._id
  }
>
  <span className="material-symbols-rounded">
    {deletingCourseId === course._id
      ? "progress_activity"
      : "delete"}
  </span>

  {deletingCourseId === course._id
    ? "Deleting..."
    : "Delete"}
</button>
                </div>
              </article>
            ))}
          </div>
        )}

      <button
        type="button"
        className="admin-courses-back-button"
        onClick={() =>
          navigate("/admin/dashboard")
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

export default AdminCourses;