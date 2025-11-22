import apiClient from './api';
import type {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  User,
  RefreshTokenResponse,
} from '../types/auth';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../config/constants';

class AuthService {
  /**
   * Login user
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', loginData);
    this.setAuthData(response.data);
    return response.data;
  }

  /**
   * Signup new user
   */
  async signup(signupData: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', signupData);
    this.setAuthData(response.data);
    return response.data;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access_token);
    return response.data;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Store auth data in localStorage
   */
  private setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, authResponse.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
  }
}

export default new AuthService();

