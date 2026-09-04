import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../config/axios";
import "./CourseDetails.css";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);

        setCourse(
          response.data.course || response.data.data
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load course."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="course-details-loading">
        <div className="course-details-loader"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-details-error">
        <h3>Unable to load course</h3>
        <p>{error}</p>

        <button
          onClick={() => navigate("/student/learn")}
        >
          Back to courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-details-error">
        <h3>Course not found</h3>

        <button
          onClick={() => navigate("/student/learn")}
        >
          Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="course-details-page">

      <button
        className="course-back-button"
        onClick={() => navigate("/student/learn")}
      >
        ← Back to courses
      </button>

      <section className="course-details-header">

        <div className="course-details-badges">
          <span>{course.category}</span>
          <span>{course.level}</span>
        </div>

        <h1>{course.title}</h1>

        <p>
          {course.description ||
            "Start learning and improve your Indian Sign Language skills."}
        </p>

      </section>

      <section className="course-lessons-section">

        <div className="course-section-heading">
          <div>
            <h2>Course Lessons</h2>
            <p>
              Complete each lesson step by step.
            </p>
          </div>
        </div>

        <div className="course-lessons-empty">
          <div>📚</div>

          <h3>Lessons coming next</h3>

          <p>
            We will connect this course with its
            lessons in the next step.
          </p>
        </div>

      </section>

    </div>
  );
}

export default CourseDetails;