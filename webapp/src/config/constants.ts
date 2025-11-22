// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Token storage keys
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'user';

// App constants
export const APP_NAME = 'Progress';
export const APP_DESCRIPTION = 'Student Dashboard for tracking progress across courses';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  STUDENT_DASHBOARD: '/student/dashboard',
  MENTOR_DASHBOARD: '/mentor/dashboard',
} as const;

