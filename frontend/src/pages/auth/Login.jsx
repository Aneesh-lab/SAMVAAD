import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
      const response = await api.post(
        "/auth/login",
        formData
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid email or password."
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
              Learn ISL.
              <br />
              Connect with confidence.
            </h2>

            <p className="auth-brand-description">
              Build your Indian Sign Language skills
              through lessons, practice, and engaging
              challenges.
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
                Track your progress
              </div>

            </div>

          </div>

        </section>

        {/* Login form */}

        <section className="auth-form-section">

          <div className="auth-form-wrapper">

            <div className="auth-header">
              <h1>Welcome back</h1>

              <p>
                Login to continue learning with SAMVAAD.
              </p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

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
                  placeholder="Enter your password"
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
                  ? "Signing in..."
                  : "Sign in"}
              </button>

            </form>

            <p className="auth-footer">
              Don't have an account?{" "}
              <Link to="/register">
                Create an account
              </Link>
            </p>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Login;