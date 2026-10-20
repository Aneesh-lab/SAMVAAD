import { useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar({ onMenuClick }) {
  const location = useLocation();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userName = user.name || "User";
  const currentPath = location.pathname;

  const getPageTitle = () => {
    if (currentPath.includes("/quizzes/") && currentPath.endsWith("/questions")) {
      return "Manage Questions";
    }

    if (currentPath.includes("/quizzes/") && currentPath.endsWith("/edit")) {
      return "Edit Quiz";
    }

    if (currentPath.includes("/courses/") && currentPath.endsWith("/lessons")) {
      return "Manage Lessons";
    }

    const pageTitles = {
      "/admin/dashboard": "Dashboard",
      "/admin/courses": "Courses",
      "/admin/quizzes": "Quiz Management",
      "/admin/students": "Students",
      "/dashboard": "Dashboard",
      "/learn": "Learn",
      "/student/quizzes": "Quizzes",
      "/student/progress": "My Progress",
      "/student/achievements": "Achievements",
      "/student/profile": "My Profile",
      "/student/practice": "Practice",
    };

    if (pageTitles[currentPath]) {
      return pageTitles[currentPath];
    }

    if (currentPath.startsWith("/courses/")) {
      return "Course Details";
    }

    if (currentPath.startsWith("/lessons/")) {
      return "Lesson";
    }

    return "Dashboard";
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          onClick={onMenuClick}
          className="navbar-menu-button"
          aria-label="Open navigation menu"
        >
          ☰
        </button>

        <div className="navbar-page-title">
          {getPageTitle()}
        </div>
      </div>

      <div className="navbar-right">
       

        <button
          type="button"
          className="navbar-profile"
        >
          <div className="navbar-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <span className="navbar-username">
            {userName}
          </span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;