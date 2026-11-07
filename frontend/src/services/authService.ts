import { api, getCsrfCookie } from './api';
import type { AuthResponse, LoginCredentials, User } from '../types/auth';

export const authService = {
  /**
   * Log in user with credentials, initializing Sanctum CSRF protection first.
   */
  async login(login: string, password: string, remember: boolean = false): Promise<AuthResponse> {
    await getCsrfCookie();
    const payload: LoginCredentials = { login, password, remember };
    const response = await api.post<AuthResponse>('/v1/login', payload);
    return response.data;
  },

  /**
   * Terminate user session.
   */
  async logout(): Promise<void> {
    await api.post('/v1/logout');
  },

  /**
   * Fetch currently authenticated user with their Role.
   */
  async getUser(): Promise<User> {
    const response = await api.get<User>('/user');
    return response.data;
  },
};

export const login = authService.login;
export const logout = authService.logout;
export const getUser = authService.getUser;

export default authService;
