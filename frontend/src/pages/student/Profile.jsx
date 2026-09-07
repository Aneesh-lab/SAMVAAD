import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../config/axios";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/student/dashboard");

        setStudent(response.data.student);
        setStatistics(response.data.statistics);
      } catch (error) {
        console.error(
          "Fetch profile error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-state">
          <span className="material-symbols-rounded">
            progress_activity
          </span>

          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-state profile-error">
          <span className="material-symbols-rounded">
            error
          </span>

          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const initials = student.name
    ? student.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "S";

  return (
    <div className="profile-page">

      {/* Header */}

      <div className="profile-header">
        <div>
          <span className="profile-eyebrow">
            ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            View your account information and
            learning achievements.
          </p>
        </div>
      </div>

      {/* Main Profile */}

      <div className="profile-layout">

        {/* Profile Card */}

        <section className="profile-card">

          <div className="profile-avatar">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="profile-identity">
            <h2>{student.name}</h2>

            <p>{student.email}</p>

            <span className="profile-role">
              {student.role}
            </span>
          </div>

        </section>

        {/* Learning Stats */}

        <section className="profile-section">

          <div className="profile-section-header">
            <div>
              <h2>Learning Statistics</h2>

              <p>
                Your current learning activity
              </p>
            </div>
          </div>

          <div className="profile-stats-grid">

            <div className="profile-stat-card">
              <div className="profile-stat-icon">
                <span className="material-symbols-rounded">
                  bolt
                </span>
              </div>

              <div>
                <strong>
                  {student.xp}
                </strong>

                <span>Total XP</span>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon">
                <span className="material-symbols-rounded">
                  local_fire_department
                </span>
              </div>

              <div>
                <strong>
                  {student.streak}
                </strong>

                <span>Day Streak</span>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon">
                <span className="material-symbols-rounded">
                  menu_book
                </span>
              </div>

              <div>
                <strong>
                  {statistics?.completedLessons || 0}
                </strong>

                <span>Lessons Completed</span>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon">
                <span className="material-symbols-rounded">
                  emoji_events
                </span>
              </div>

              <div>
                <strong>
                  {statistics?.achievementsUnlocked || 0}
                </strong>

                <span>Achievements</span>
              </div>
            </div>

          </div>

        </section>

        {/* Account Information */}

        <section className="profile-section">

          <div className="profile-section-header">
            <div>
              <h2>Account Information</h2>

              <p>
                Information associated with your
                SAMVAAD account.
              </p>
            </div>
          </div>

          <div className="profile-information">

            <div className="profile-information-row">
              <span className="profile-information-label">
                Full Name
              </span>

              <span className="profile-information-value">
                {student.name}
              </span>
            </div>

            <div className="profile-information-row">
              <span className="profile-information-label">
                Email Address
              </span>

              <span className="profile-information-value">
                {student.email}
              </span>
            </div>

            <div className="profile-information-row">
              <span className="profile-information-label">
                Account Type
              </span>

              <span className="profile-information-value profile-account-type">
                {student.role}
              </span>
            </div>

          </div>

        </section>

      </div>

      <button
        type="button"
        className="profile-dashboard-button"
        onClick={() =>
          navigate("/student/dashboard")
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

export default Profile;