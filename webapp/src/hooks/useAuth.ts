import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AuthContextType } from '../types/auth';

/**
 * Custom hook to access authentication context
 * 
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType with user, login, logout, etc.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

