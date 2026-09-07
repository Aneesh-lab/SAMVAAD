import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/Dashboard";
import Learn from "./pages/student/Learn";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/layouts/AppShell";
import CourseDetails from "./pages/student/CourseDetails";
import Lesson from "./pages/student/Lesson";
import Progress from "./pages/student/Progress";
import Achievements from "./pages/student/Achievements";
import Profile from "./pages/student/Profile";
import Practice from "./pages/student/Practice";






function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the SAMVAAD admin panel.</p>
    </div>
  );
}

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