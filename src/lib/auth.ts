import { authAPI } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'scholar' | 'user';
  native_language: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get auth token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  // Login user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await authAPI.login({ email, password });
    const { user, token } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  },

  // Register user
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    native_language: string;
  }): Promise<AuthResponse> => {
    const response = await authAPI.register(userData);
    const { user, token } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user has specific role
  hasRole: (role: string): boolean => {
    const user = authUtils.getCurrentUser();
    return user?.role === role;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles: string[]): boolean => {
    const user = authUtils.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  },

  // Check if user is admin or manager
  isAdminOrManager: (): boolean => {
    return authUtils.hasAnyRole(['admin', 'manager']);
  },

  // Check if user is scholar or above
  isScholarOrAbove: (): boolean => {
    return authUtils.hasAnyRole(['admin', 'manager', 'scholar']);
  },

  // Refresh user profile
  refreshProfile: async (): Promise<User | null> => {
    try {
      const response = await authAPI.getProfile();
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      return null;
    }
  },

  // Update user profile
  updateProfile: async (data: {
    name?: string;
    native_language?: string;
  }): Promise<User> => {
    const response = await authAPI.updateProfile(data);
    const user = response.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await authAPI.changePassword(data);
  },
};
