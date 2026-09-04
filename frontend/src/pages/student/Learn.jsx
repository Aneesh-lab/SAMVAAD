import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import "./Learn.css";

function Learn() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");

        setCourses(response.data.courses || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load courses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="learn-loading">
        <div className="learn-loader"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learn-error">
        <strong>Unable to load courses</strong>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="learn-page">

      <section className="learn-header">
        <div>
          <p className="learn-eyebrow">
            ISL Learning
          </p>

          <h1>Learn Indian Sign Language</h1>

          <p>
            Choose a course and start building your
            communication skills step by step.
          </p>
        </div>
      </section>

      <section className="learn-section">

        <div className="learn-section-heading">
          <div>
            <h2>Available Courses</h2>
            <p>
              Learn at your own pace and practice
              what you learn.
            </p>
          </div>

          <span className="course-count">
            {courses.length} courses
          </span>
        </div>

        {courses.length === 0 ? (
          <div className="learn-empty">
            <div className="learn-empty-icon">
              📚
            </div>

            <h3>No courses available</h3>

            <p>
              Courses will appear here once they
              are published by the administrator.
            </p>
          </div>
        ) : (
          <div className="learn-course-grid">

            {courses.map((course) => (
              <article
                key={course._id}
                className="learn-course-card"
              >

                <div className="learn-course-top">
                  <span className="learn-category">
                    {course.category}
                  </span>

                  <span className="learn-level">
                    {course.level}
                  </span>
                </div>

                <h3>{course.title}</h3>

                <p>
                  {course.description ||
                    "Start learning this course and improve your ISL skills."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/student/learn/${course._id}`
                    )
                  }
                  className="learn-course-button"
                >
                  View course
                  <span>→</span>
                </button>

              </article>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default Learn;