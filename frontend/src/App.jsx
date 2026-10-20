import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/Dashboard";
import Learn from "./pages/student/Learn";

import CourseDetails from "./pages/student/CourseDetails";
import Lesson from "./pages/student/Lesson";
import Progress from "./pages/student/Progress";
import Achievements from "./pages/student/Achievements";
import Profile from "./pages/student/Profile";
import Practice from "./pages/student/Practice";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/layouts/AppShell";

import AdminDashboard from "./pages/admin/adminDashboard.jsx";
import AdminCourses from "./pages/admin/adminCourses";
import AdminLessons from "./pages/admin/adminLessons";
import AdminQuizzes from "./pages/admin/adminQuizzes";
import AdminQuizQuestions from "./pages/admin/adminQuizQuestions";
import AdminQuizEdit from "./pages/admin/adminQuizEdit";
import AdminStudents from "./pages/admin/AdminStudents";
import StudentQuizzes from "./pages/student/studentQuizzes";
import QuizInstructions from "./pages/student/quizInstructions";
import QuizAttempt from "./pages/student/quizAttempt";
import QuizResults from "./pages/student/quizResults";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <AppShell>
                <StudentDashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppShell>
                <AdminDashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />

<Route
  path="/admin/courses"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AppShell>
        <AdminCourses />
      </AppShell>
    </ProtectedRoute>
  }
/>

    <Route
  path="/admin/courses/:courseId/lessons"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AppShell>
        <AdminLessons />
      </AppShell>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/quizzes"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AppShell>
        <AdminQuizzes />
      </AppShell>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/quizzes/:id/questions"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AppShell>
        <AdminQuizQuestions />
      </AppShell>
    </ProtectedRoute>
  }
/>

<Route
  path="/student/quizzes"
  element={
    <ProtectedRoute role="student">
      <AppShell>
        <StudentQuizzes />
      </AppShell>
    </ProtectedRoute>
  }
/>
<Route
  path="/student/quizzes/:id/attempt"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <AppShell>
        <QuizAttempt />
      </AppShell>
    </ProtectedRoute>
  }
/>

<Route
  path="/student/quizzes/:id"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <AppShell>
        <QuizInstructions />
      </AppShell>
    </ProtectedRoute>
  }
/>
<Route
  path="/student/quizzes/:id/results"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <AppShell>
        <QuizResults />
      </AppShell>
    </ProtectedRoute>
  }
/>

  <Route
  path="/student/progress"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <AppShell>
        <Progress />
      </AppShell>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/quizzes/:id/edit"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AppShell>
        <AdminQuizEdit />
      </AppShell>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/students"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AppShell>
        <AdminStudents />
      </AppShell>
    </ProtectedRoute>
  }
/>

              <Route
  path="/student/learn"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <AppShell>
        <Learn />
      </AppShell>
    </ProtectedRoute>
  }
/>

<Route
  path="/student/learn/:id"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <AppShell>
        <CourseDetails />
      </AppShell>
    </ProtectedRoute>
  }
/>

        <Route
  path="/student/learn/:id/lesson/:lessonId"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <AppShell>
        <Lesson />
      </AppShell>
    </ProtectedRoute>
  }
/>
  

  <Route
  path="/student/achievements"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <AppShell>
        <Achievements />
      </AppShell>
    </ProtectedRoute>
  }
/>

<Route
  path="/student/profile"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <AppShell>
        <Profile />
      </AppShell>
    </ProtectedRoute>
  }
/>

<Route
  path="/student/practice"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <AppShell>
        <Practice />
      </AppShell>
    </ProtectedRoute>
  }
/>



        <Route
          path="*"
          element={
            <div>
              <h1>SAMVAAD</h1>
              <p>Page not found.</p>
            </div>
          }
        />


  

      </Routes>
    </BrowserRouter>
  );
}

export default App;