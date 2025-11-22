import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthContextType } from '../types/auth';
import { UserRole } from '../types/auth';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/constants';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get user from localStorage first
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // Fetch user from API if not in localStorage
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid tokens
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password, role });
      setUser(response.user);
      
      // Navigate to appropriate dashboard
      if (role === UserRole.STUDENT) {
        navigate(ROUTES.STUDENT_DASHBOARD);
      } else {
        navigate(ROUTES.MENTOR_DASHBOARD);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: UserRole) => {
    try {
      setIsLoading(true);
      const response = await authService.signup({ email, password, role });
      setUser(response.user);
      
      // Navigate to appropriate dashboard
      if (role === UserRole.STUDENT) {
        navigate(ROUTES.STUDENT_DASHBOARD);
      } else {
        navigate(ROUTES.MENTOR_DASHBOARD);
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate(ROUTES.LOGIN);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

