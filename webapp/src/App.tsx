import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { UserRole } from './types/auth';
import { ROUTES } from './config/constants';

function App() {
  const { isAuthenticated, user } = useAuth();

  // Redirect authenticated users from home to their dashboard
  const HomeRedirect = () => {
    if (isAuthenticated && user) {
      const redirectPath =
        user.role === UserRole.STUDENT
          ? ROUTES.STUDENT_DASHBOARD
          : ROUTES.MENTOR_DASHBOARD;
      return <Navigate to={redirectPath} replace />;
    }
    return <Navigate to={ROUTES.LOGIN} replace />;
  };

  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomeRedirect />} />
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
        path={ROUTES.MENTOR_DASHBOARD}
        element={
          <ProtectedRoute requiredRole={UserRole.MENTOR}>
            <MentorDashboard />
          </ProtectedRoute>
        }
      />
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default App;
