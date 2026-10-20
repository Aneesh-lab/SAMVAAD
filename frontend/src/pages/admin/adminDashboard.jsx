import { useEffect, useState } from "react";

import api from "../../config/axios";
import "./adminDashboard.css";

function AdminDashboard() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/dashboard");

        setStatistics(response.data.statistics);
      } catch (error) {
        console.error(
          "Fetch admin dashboard error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-state">
          <span className="material-symbols-rounded">
            progress_activity
          </span>

          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-state admin-dashboard-error">
          <span className="material-symbols-rounded">
            error
          </span>

          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const statCards = [
    {
      label: "Total Students",
      value: statistics.totalStudents,
      icon: "group",
    },
    {
      label: "Total Courses",
      value: statistics.totalCourses,
      icon: "menu_book",
    },
    {
      label: "Total Lessons",
      value: statistics.totalLessons,
      icon: "play_lesson",
    },
    {
      label: "Total Quizzes",
      value: statistics.totalQuizzes,
      icon: "quiz",
    },
    {
      label: "Published Courses",
      value: statistics.totalPublishedCourses,
      icon: "public",
    },
    {
      label: "Active Achievements",
      value: statistics.totalAchievements,
      icon: "emoji_events",
    },
  ];

  return (
    <div className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div>
          <span className="admin-dashboard-eyebrow">
            ADMIN CONTROL CENTER
          </span>

          <h1>Dashboard</h1>

          <p>
            Manage SAMVAAD learning content and monitor
            platform activity.
          </p>
        </div>
      </header>

      <section className="admin-stat-grid">
        {statCards.map((stat) => (
          <article
            key={stat.label}
            className="admin-stat-card"
          >
            <div className="admin-stat-icon">
              <span className="material-symbols-rounded">
                {stat.icon}
              </span>
            </div>

            <div className="admin-stat-content">
              <span>{stat.label}</span>

              <strong>{stat.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-overview-section">
        <div className="admin-section-header">
          <div>
            <span className="admin-section-eyebrow">
              CONTENT OVERVIEW
            </span>

            <h2>Platform Content</h2>

            <p>
              Current content available across the SAMVAAD
              platform.
            </p>
          </div>
        </div>

        <div className="admin-overview-list">
          <div className="admin-overview-row">
            <div>
              <span className="material-symbols-rounded">
                menu_book
              </span>

              <span>Courses</span>
            </div>

            <strong>
              {statistics.totalCourses}
            </strong>
          </div>

          <div className="admin-overview-row">
            <div>
              <span className="material-symbols-rounded">
                public
              </span>

              <span>Published Courses</span>
            </div>

            <strong>
              {statistics.totalPublishedCourses}
            </strong>
          </div>

          <div className="admin-overview-row">
            <div>
              <span className="material-symbols-rounded">
                play_lesson
              </span>

              <span>Lessons</span>
            </div>

            <strong>
              {statistics.totalLessons}
            </strong>
          </div>

          <div className="admin-overview-row">
            <div>
              <span className="material-symbols-rounded">
                quiz
              </span>

              <span>Quizzes</span>
            </div>

            <strong>
              {statistics.totalQuizzes}
            </strong>
          </div>

          <div className="admin-overview-row">
            <div>
              <span className="material-symbols-rounded">
                emoji_events
              </span>

              <span>Active Achievements</span>
            </div>

            <strong>
              {statistics.totalAchievements}
            </strong>
          </div>
        </div>
      </section>

      <section className="admin-system-section">
        <div className="admin-system-item">
          <span className="material-symbols-rounded">
            admin_panel_settings
          </span>

          <div>
            <span>Administrators</span>

            <strong>
              {statistics.totalAdmins}
            </strong>
          </div>
        </div>

        <div className="admin-system-item">
          <span className="material-symbols-rounded">
            group
          </span>

          <div>
            <span>Registered Students</span>

            <strong>
              {statistics.totalStudents}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;