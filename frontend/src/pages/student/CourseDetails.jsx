import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../config/axios";
import "./CourseDetails.css";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] =
    useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          courseResponse,
          progressResponse,
        ] = await Promise.all([
          api.get(`/student/courses/${id}`),
          api.get("/student/progress"),
        ]);

        const courseData = courseResponse.data;
        const progressData =
          progressResponse.data.progress || [];

        setCourse(courseData.course);

        const courseLessons =
          courseData.lessons || [];

        setLessons(courseLessons);

        /*
          Find all completed lessons that belong
          to this particular course.
        */
        const completedIds = new Set();

        progressData.forEach((item) => {
          if (item.status !== "completed") {
            return;
          }

          const progressLesson =
            item.lessonId;

          if (!progressLesson) {
            return;
          }

          const lessonId =
            progressLesson._id || progressLesson;

          const lessonBelongsToCourse =
            courseLessons.some(
              (lesson) =>
                lesson._id === lessonId
            );

          if (lessonBelongsToCourse) {
            completedIds.add(lessonId);
          }
        });

        setCompletedLessonIds(completedIds);

      } catch (err) {
        console.error(
          "Fetch course details error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load course details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  /*
    REAL COURSE PROGRESS

    Progress is based on the number of lessons
    actually completed by the student.
  */
  const totalLessons = lessons.length;

  const completedLessons =
    completedLessonIds.size;

  const progressPercentage =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) *
            100
        )
      : 0;

  const openLesson = (lessonId) => {
    navigate(
      `/student/learn/${id}/lesson/${lessonId}`
    );
  };

  if (loading) {
    return (
      <div className="course-details-page">
        <div className="course-details-loading">
          Loading course...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-details-page">
        <div className="course-details-error">
          {error}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-details-page">
        <div className="course-details-error">
          Course not found.
        </div>
      </div>
    );
  }

  return (
    <div className="course-details-page">

      {/* Course Header */}
      <div className="course-details-header">

        <div className="course-details-info">

          <span className="course-category">
            {course.category}
          </span>

          <h1>{course.title}</h1>

          <p>{course.description}</p>

          <span className="course-level">
            {course.level}
          </span>

        </div>

      </div>

      {/* REAL COURSE PROGRESS */}
      <div className="course-progress-section">

        <div className="course-progress-header">

          <div>
            <h2>Your progress</h2>

            <p>
              {completedLessons} of{" "}
              {totalLessons} lessons completed
            </p>
          </div>

          <strong>
            {progressPercentage}%
          </strong>

        </div>

        <div className="course-progress-bar">

          <div
            className="course-progress-fill"
            style={{
              width: `${progressPercentage}%`,
            }}
          ></div>

        </div>

        {progressPercentage === 100 && (
          <p className="course-completed-message">
            ✓ Course completed! Great work.
          </p>
        )}

      </div>

      {/* Lessons */}
      <div className="course-lessons-section">

        <div className="course-lessons-header">
          <h2>Lessons</h2>

          <span>
            {completedLessons}/{totalLessons}
          </span>
        </div>

        <div className="course-lessons-list">

          {lessons.length === 0 ? (
            <div className="no-lessons">
              No lessons available yet.
            </div>
          ) : (
            lessons.map((lesson, index) => {

              const isCompleted =
                completedLessonIds.has(
                  lesson._id
                );

              return (
                <div
                  key={lesson._id}
                  className={`lesson-card ${
                    isCompleted
                      ? "lesson-card-completed"
                      : ""
                  }`}
                  onClick={() =>
                    openLesson(lesson._id)
                  }
                >

                  {/* Lesson Number / Status */}
                  <div
                    className={`lesson-card-number ${
                      isCompleted
                        ? "completed"
                        : ""
                    }`}
                  >
                    {isCompleted
                      ? "✓"
                      : index + 1}
                  </div>

                  {/* Lesson Details */}
                  <div className="lesson-card-content">

                    <h3>{lesson.title}</h3>

                    {lesson.description && (
                      <p>
                        {lesson.description}
                      </p>
                    )}

                    <div className="lesson-card-meta">

                      {lesson.duration > 0 && (
                        <span>
                          {lesson.duration} min
                        </span>
                      )}

                      {isCompleted && (
                        <span className="lesson-completed-label">
                          Completed
                        </span>
                      )}

                    </div>

                  </div>

                  {/* Action */}
                  <div className="lesson-card-action">

                    <span>
                      {isCompleted
                        ? "Review"
                        : "Start lesson"}
                    </span>

                    <span className="lesson-arrow">
                      →
                    </span>

                  </div>

                </div>
              );
            })
          )}

        </div>

      </div>

    </div>
  );
};

export default CourseDetails;