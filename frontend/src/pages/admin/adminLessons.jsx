import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../config/axios";
import "./adminLessons.css";

function AdminLessons() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState(null);

  const [editingLessonId, setEditingLessonId] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPublicId, setVideoPublicId] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    order: "",
    isPublished: false,
  });

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError("");

      const [courseResponse, lessonsResponse] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/lessons/course/${courseId}`),
      ]);

      setCourse(courseResponse.data.course);
      setLessons(lessonsResponse.data.lessons || []);
    } catch (error) {
      console.error("Fetch lessons error:", error);

      setError(
        error.response?.data?.message || "Unable to load lessons."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      duration: "",
      order: "",
      isPublished: false,
    });

    setSelectedVideo(null);
    setVideoPublicId("");
    setEditingLessonId(null);
    setShowForm(false);
  };

  const handleSelectVideo = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedVideo(null);
      return;
    }

    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const maxSize = 50 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Please select an MP4, WebM, or MOV video.");
      event.target.value = "";
      setSelectedVideo(null);
      return;
    }

    if (file.size > maxSize) {
      setError("The video must be 50 MB or smaller.");
      event.target.value = "";
      setSelectedVideo(null);
      return;
    }

    setError("");
    setSelectedVideo(file);
  };

  const uploadSelectedVideo = async () => {
    if (!selectedVideo) {
      return {
        videoUrl: formData.videoUrl.trim(),
        videoPublicId,
        duration: Number(formData.duration) || 0,
      };
    }

    const uploadData = new FormData();
    uploadData.append("video", selectedVideo);

    setUploadingVideo(true);

    try {
      const response = await api.post("/videos/upload", uploadData);

      const uploadedVideo = response.data.video;

      if (!uploadedVideo?.videoUrl || !uploadedVideo?.videoPublicId) {
        throw new Error(
          "The server did not return the video URL and public ID."
        );
      }

      const uploadedDuration = Number(uploadedVideo.duration) || 0;

      const result = {
        videoUrl: uploadedVideo.videoUrl,
        videoPublicId: uploadedVideo.videoPublicId,
        duration:
          Number(formData.duration) ||
          (uploadedDuration > 0
            ? Math.ceil(uploadedDuration / 60)
            : 0),
      };

      setFormData((previous) => ({
        ...previous,
        videoUrl: result.videoUrl,
        duration: String(result.duration),
      }));

      setVideoPublicId(result.videoPublicId);
      setSelectedVideo(null);

      return result;
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleCreateLesson = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Lesson title is required.");
      return;
    }

    if (!formData.order || Number(formData.order) < 1) {
      setError("Lesson order must be at least 1.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const uploadedVideo = await uploadSelectedVideo();

      await api.post("/lessons", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        course: courseId,
        videoUrl: uploadedVideo.videoUrl,
        videoPublicId: uploadedVideo.videoPublicId,
        duration: uploadedVideo.duration,
        order: Number(formData.order),
        isPublished: formData.isPublished,
      });

      resetForm();
      await fetchLessons();
    } catch (error) {
      console.error("Create lesson error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to create lesson."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLessonId(lesson._id);
    setSelectedVideo(null);
    setVideoPublicId(lesson.videoPublicId || "");

    setFormData({
      title: lesson.title || "",
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      duration:
        lesson.duration !== undefined ? String(lesson.duration) : "",
      order: lesson.order !== undefined ? String(lesson.order) : "",
      isPublished: Boolean(lesson.isPublished),
    });

    setShowForm(true);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleUpdateLesson = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Lesson title is required.");
      return;
    }

    if (!formData.order || Number(formData.order) < 1) {
      setError("Lesson order must be at least 1.");
      return;
    }

    if (!editingLessonId) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const uploadedVideo = await uploadSelectedVideo();

      await api.put(`/lessons/${editingLessonId}`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        course: courseId,
        videoUrl: uploadedVideo.videoUrl,
        videoPublicId: uploadedVideo.videoPublicId,
        duration: uploadedVideo.duration,
        order: Number(formData.order),
        isPublished: formData.isPublished,
      });

      resetForm();
      await fetchLessons();
    } catch (error) {
      console.error("Update lesson error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to update lesson."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLesson = async (lesson) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${lesson.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingLessonId(lesson._id);
      setError("");

      await api.delete(`/lessons/${lesson._id}`);
      await fetchLessons();
    } catch (error) {
      console.error("Delete lesson error:", error);

      setError(
        error.response?.data?.message || "Unable to delete lesson."
      );
    } finally {
      setDeletingLessonId(null);
    }
  };

  const handleCancelForm = () => {
    resetForm();
    setError("");
  };

  const handleTogglePublish = async (lesson) => {
    try {
      setError("");

      await api.put(`/lessons/${lesson._id}`, {
        isPublished: !lesson.isPublished,
      });

      await fetchLessons();
    } catch (error) {
      console.error("Toggle lesson publish error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to update lesson status."
      );
    }
  };

  const isBusy = creating || uploadingVideo;

  return (
    <div className="admin-lessons-page">
      <div className="admin-lessons-header">
        <div>
          <button
            type="button"
            className="admin-lessons-back-button"
            onClick={() => navigate("/admin/courses")}
          >
            <span className="material-symbols-rounded">arrow_back</span>
            Back to Courses
          </button>

          <span className="admin-lessons-eyebrow">
            LESSON MANAGEMENT
          </span>

          <h1>{course?.title || "Course Lessons"}</h1>

          <p>Create and manage lessons for this course.</p>
        </div>

        <button
          type="button"
          className="admin-lessons-add-button"
          onClick={() => {
            setEditingLessonId(null);
            setSelectedVideo(null);
            setVideoPublicId("");

            setFormData({
              title: "",
              description: "",
              videoUrl: "",
              duration: "",
              order: "",
              isPublished: false,
            });

            setShowForm(true);
            setError("");
          }}
          disabled={showForm}
        >
          <span className="material-symbols-rounded">add</span>
          Add Lesson
        </button>
      </div>

      {error && (
        <div className="admin-lessons-error" role="alert">
          <span className="material-symbols-rounded">error</span>
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <section className="admin-lesson-form-card">
          <div className="admin-lesson-form-header">
            <div>
              <span className="admin-lessons-eyebrow">
                {editingLessonId ? "EDIT LESSON" : "NEW LESSON"}
              </span>

              <h2>
                {editingLessonId ? "Edit lesson" : "Create a lesson"}
              </h2>

              <p>
                {editingLessonId
                  ? "Update the lesson details."
                  : "Add a new lesson to this course."}
              </p>
            </div>
          </div>

          <form
            className="admin-lesson-form"
            onSubmit={
              editingLessonId ? handleUpdateLesson : handleCreateLesson
            }
          >
            <div className="admin-lesson-form-group">
              <label htmlFor="lesson-title">Lesson Title</label>

              <input
                id="lesson-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Basic Greetings"
                required
              />
            </div>

            <div className="admin-lesson-form-group">
              <label htmlFor="lesson-description">Description</label>

              <textarea
                id="lesson-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what students will learn..."
                rows="4"
              />
            </div>

            <div className="admin-lesson-form-group">
              <label htmlFor="lesson-video-file">
                Upload lesson video
              </label>

              <input
                id="lesson-video-file"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleSelectVideo}
                disabled={isBusy}
              />

              <small>
                MP4, WebM, or MOV. Maximum file size: 50 MB.
              </small>

              {selectedVideo && (
                <p>
                  Selected: {selectedVideo.name} (
                  {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              )}

              {formData.videoUrl && !selectedVideo && (
                <p>Video attached to this lesson.</p>
              )}
            </div>

            <div className="admin-lesson-form-row">
              <div className="admin-lesson-form-group">
                <label htmlFor="lesson-video-url">
                  Video URL (optional)
                </label>

                <input
                  id="lesson-video-url"
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  disabled={isBusy}
                />
              </div>

              <div className="admin-lesson-form-group">
                <label htmlFor="lesson-duration">
                  Duration (minutes)
                </label>

                <input
                  id="lesson-duration"
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="5"
                  min="0"
                  disabled={isBusy}
                />
              </div>

              <div className="admin-lesson-form-group">
                <label htmlFor="lesson-order">Lesson Order</label>

                <input
                  id="lesson-order"
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                  required
                  disabled={isBusy}
                />
              </div>
            </div>

            <label className="admin-lesson-publish-toggle">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                disabled={isBusy}
              />

              <span>Publish this lesson immediately</span>
            </label>

            <div className="admin-lesson-form-actions">
              <button
                type="button"
                className="admin-lesson-cancel-button"
                onClick={handleCancelForm}
                disabled={isBusy}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-lesson-submit-button"
                disabled={isBusy}
              >
                <span className="material-symbols-rounded">
                  {isBusy
                    ? "progress_activity"
                    : editingLessonId
                    ? "save"
                    : "add"}
                </span>

                {uploadingVideo
                  ? "Uploading video..."
                  : creating
                  ? editingLessonId
                    ? "Updating..."
                    : "Creating..."
                  : editingLessonId
                  ? "Update Lesson"
                  : "Create Lesson"}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="admin-lessons-state">
          <span className="material-symbols-rounded">
            progress_activity
          </span>
          <p>Loading lessons...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="admin-lessons-empty">
          <span className="material-symbols-rounded">menu_book</span>

          <h2>No lessons yet</h2>

          <p>Start building this course by adding its first lesson.</p>

          {!showForm && (
            <button
              type="button"
              className="admin-lessons-empty-button"
              onClick={() => {
                setEditingLessonId(null);
                setSelectedVideo(null);
                setVideoPublicId("");

                setFormData({
                  title: "",
                  description: "",
                  videoUrl: "",
                  duration: "",
                  order: "",
                  isPublished: false,
                });

                setShowForm(true);
                setError("");
              }}
            >
              <span className="material-symbols-rounded">add</span>
              Add First Lesson
            </button>
          )}
        </div>
      ) : (
        <div className="admin-lessons-list">
          {lessons.map((lesson) => (
            <article key={lesson._id} className="admin-lesson-card">
              <div className="admin-lesson-order">{lesson.order}</div>

              <div className="admin-lesson-content">
                <div className="admin-lesson-title-row">
                  <h2>{lesson.title}</h2>

                  <span
                    className={`admin-lesson-status ${
                      lesson.isPublished
                        ? "admin-lesson-status-published"
                        : "admin-lesson-status-draft"
                    }`}
                  >
                    {lesson.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                {lesson.description && <p>{lesson.description}</p>}

                <div className="admin-lesson-meta">
                  <span>
                    <span className="material-symbols-rounded">
                      schedule
                    </span>
                    {lesson.duration || 0} min
                  </span>

                  {lesson.videoUrl && (
                    <span>
                      <span className="material-symbols-rounded">
                        play_circle
                      </span>
                      Video added
                    </span>
                  )}
                </div>
              </div>

              <div className="admin-lesson-actions">
                <button
                  type="button"
                  className={
                    lesson.isPublished
                      ? "admin-lesson-draft-button"
                      : "admin-lesson-publish-button"
                  }
                  onClick={() => handleTogglePublish(lesson)}
                >
                  <span className="material-symbols-rounded">
                    {lesson.isPublished ? "unpublished" : "publish"}
                  </span>

                  {lesson.isPublished ? "Move to Draft" : "Publish"}
                </button>

                <button
                  type="button"
                  className="admin-lesson-edit-button"
                  onClick={() => handleEditLesson(lesson)}
                >
                  <span className="material-symbols-rounded">edit</span>
                  Edit
                </button>

                <button
                  type="button"
                  className="admin-lesson-delete-button"
                  onClick={() => handleDeleteLesson(lesson)}
                  disabled={deletingLessonId === lesson._id}
                >
                  <span className="material-symbols-rounded">
                    {deletingLessonId === lesson._id
                      ? "progress_activity"
                      : "delete"}
                  </span>

                  {deletingLessonId === lesson._id
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
}

export default AdminLessons;