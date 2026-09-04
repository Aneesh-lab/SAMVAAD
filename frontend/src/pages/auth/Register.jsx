import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);

      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* Brand section */}

        <section className="auth-brand">

          <div className="auth-brand-content">

            <div className="auth-logo">
              SAMVAAD
            </div>

            <h2>
              Start your
              <br />
              ISL journey.
            </h2>

            <p className="auth-brand-description">
              Learn Indian Sign Language through
              interactive lessons, practice, and
              rewarding challenges.
            </p>

            <div className="auth-features">

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  ✓
                </span>
                Learn at your own pace
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  ★
                </span>
                Earn XP and achievements
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  ↗
                </span>
                Track your learning progress
              </div>

            </div>

          </div>

        </section>

        {/* Registration form */}

        <section className="auth-form-section">

          <div className="auth-form-wrapper">

            <div className="auth-header">

              <h1>Create your account</h1>

              <p>
                Start learning Indian Sign Language
                with SAMVAAD.
              </p>

            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="form-group">

                <label htmlFor="name">
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create account"}
              </button>

            </form>

            <p className="auth-footer">
              Already have an account?{" "}
              <Link to="/login">
                Login
              </Link>
            </p>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Register;