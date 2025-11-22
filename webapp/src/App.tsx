import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import CreateCourse from './pages/mentor/CreateCourse';
import CourseDetail from './pages/mentor/CourseDetail';
import AvailableCourses from './pages/student/AvailableCourses';
import StudentCourseDetail from './pages/student/StudentCourseDetail';
import Analytics from './pages/student/Analytics';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { UserRole } from './types/auth';
import { ROUTES } from './config/constants';

function App() {
  const { isAuthenticated, user } = useAuth();

  // Show landing page for unauthenticated users, redirect authenticated users to their dashboard
  const HomeRoute = () => {
    if (isAuthenticated && user) {
      const redirectPath =
        user.role === UserRole.STUDENT
          ? ROUTES.STUDENT_DASHBOARD
          : ROUTES.MENTOR_DASHBOARD;
      return <Navigate to={redirectPath} replace />;
    }
    return <Landing />;
  };

  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomeRoute />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.SIGNUP} element={<Signup />} />
      <Route
        path={ROUTES.STUDENT_DASHBOARD}
        element={
          <ProtectedRoute requiredRole={UserRole.STUDENT}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_COURSES}
        element={
          <ProtectedRoute requiredRole={UserRole.STUDENT}>
            <AvailableCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_COURSE_DETAIL}
        element={
          <ProtectedRoute requiredRole={UserRole.STUDENT}>
            <StudentCourseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_ANALYTICS}
        element={
          <ProtectedRoute requiredRole={UserRole.STUDENT}>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MENTOR_DASHBOARD}
        element={
          <ProtectedRoute requiredRole={UserRole.MENTOR}>
            <MentorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CREATE_COURSE}
        element={
          <ProtectedRoute requiredRole={UserRole.MENTOR}>
            <CreateCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.COURSE_DETAIL}
        element={
          <ProtectedRoute requiredRole={UserRole.MENTOR}>
            <CourseDetail />
          </ProtectedRoute>
        }
      />
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default App;
