import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../config/axios";
import "./Progress.css";

const Progress = () => {
  const navigate = useNavigate();

  const [courseProgress, setCourseProgress] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError("");

        /*
          Get all published courses.
        */
        const coursesResponse =
          await api.get("/student/courses");

        const courses =
          coursesResponse.data.courses || [];

        /*
          Get details for every course so that
          we know its total lesson count and
          completed lesson count.
        */
        const courseDetails =
          await Promise.all(
            courses.map(async (course) => {
              const response =
                await api.get(
                  `/student/courses/${course._id}`
                );

              const data =
                response.data;

              const lessons =
                data.lessons || [];

              /*
                Progress records returned by
                this endpoint are already limited
                to the current course.
              */
              const progress =
                data.progress || {};

              const totalLessons =
                progress.totalLessons ??
                lessons.length;

              const completedLessons =
                progress.completedLessons ??
                0;

              const percentage =
                totalLessons > 0
                  ? Math.round(
                      (completedLessons /
                        totalLessons) *
                        100
                    )
                  : 0;

              return {
                ...course,
                totalLessons,
                completedLessons,
                percentage,
              };
            })
          );

        setCourseProgress(
          courseDetails
        );

      } catch (err) {
        console.error(
          "Fetch progress error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load your progress"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  /*
    Overall statistics
  */
  const totalLessons =
    courseProgress.reduce(
      (total, course) =>
        total + course.totalLessons,
      0
    );

  const completedLessons =
    courseProgress.reduce(
      (total, course) =>
        total + course.completedLessons,
      0
    );

  const overallPercentage =
    totalLessons > 0
      ? Math.round(
          (completedLessons /
            totalLessons) *
            100
        )
      : 0;

  const completedCourses =
    courseProgress.filter(
      (course) =>
        course.totalLessons > 0 &&
        course.completedLessons ===
          course.totalLessons
    ).length;

  if (loading) {
    return (
      <div className="progress-page">

        <div className="progress-loading">
          Loading your progress...
        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page">

        <div className="progress-error">
          {error}
        </div>

      </div>
    );
  }

  return (
    <div className="progress-page">

      {/* Header */}

      <div className="progress-page-header">

        <div>

          <span className="progress-eyebrow">
            Your learning journey
          </span>

          <h1>
            My Progress
          </h1>

          <p>
            Track your learning progress
            across SAMVAAD courses.
          </p>

        </div>

      </div>

      {/* Overall Progress */}

      <div className="overall-progress-card">

        <div className="overall-progress-header">

          <div>

            <span className="overall-progress-label">
              Overall progress
            </span>

            <h2>
              Keep learning, keep growing
            </h2>

            <p>
              {completedLessons} of{" "}
              {totalLessons} lessons completed
            </p>

          </div>

          <strong>
            {overallPercentage}%
          </strong>

        </div>

        <div className="overall-progress-bar">

          <div
            className="overall-progress-fill"
            style={{
              width:
                `${overallPercentage}%`,
            }}
          ></div>

        </div>

      </div>

      {/* Summary */}

      <div className="progress-summary">

        <div className="progress-summary-card">

          <span className="progress-summary-label">
            Courses
          </span>

          <strong>
            {courseProgress.length}
          </strong>

          <span className="progress-summary-description">
            Available courses
          </span>

        </div>

        <div className="progress-summary-card">

          <span className="progress-summary-label">
            Lessons
          </span>

          <strong>
            {completedLessons}
          </strong>

          <span className="progress-summary-description">
            Completed
          </span>

        </div>

        <div className="progress-summary-card">

          <span className="progress-summary-label">
            Courses completed
          </span>

          <strong>
            {completedCourses}
          </strong>

          <span className="progress-summary-description">
            Great achievement
          </span>

        </div>

      </div>

      {/* Course Progress */}

      <div className="progress-courses-section">

        <div className="progress-section-header">

          <div>

            <h2>
              Course progress
            </h2>

            <p>
              Select a course to continue
              learning.
            </p>

          </div>

        </div>

        {courseProgress.length === 0 ? (
          <div className="progress-empty">

            <h3>
              No courses available
            </h3>

            <p>
              Published courses will appear
              here.
            </p>

          </div>
        ) : (
          <div className="progress-course-list">

            {courseProgress.map(
              (course) => {

                const isCompleted =
                  course.totalLessons >
                    0 &&
                  course.completedLessons ===
                    course.totalLessons;

                return (
                  <div
                    key={course._id}
                    className="progress-course-card"
                    onClick={() =>
                      navigate(
                        `/student/learn/${course._id}`
                      )
                    }
                  >

                    <div className="progress-course-top">

                      <div className="progress-course-info">

                        <span className="progress-course-category">
                          {course.category}
                        </span>

                        <h3>
                          {course.title}
                        </h3>

                        <p>
                          {course.description}
                        </p>

                      </div>

                      <span className="progress-course-level">
                        {course.level}
                      </span>

                    </div>

                    <div className="progress-course-bottom">

                      <div className="progress-course-meta">

                        <span>
                          {
                            course.completedLessons
                          }{" "}
                          of{" "}
                          {
                            course.totalLessons
                          } lessons
                        </span>

                        <span
                          className={
                            isCompleted
                              ? "progress-completed-label"
                              : ""
                          }
                        >
                          {isCompleted
                            ? "✓ Completed"
                            : `${course.percentage}% complete`}
                        </span>

                      </div>

                      <div className="progress-course-bar">

                        <div
                          className="progress-course-fill"
                          style={{
                            width:
                              `${course.percentage}%`,
                          }}
                        ></div>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default Progress;