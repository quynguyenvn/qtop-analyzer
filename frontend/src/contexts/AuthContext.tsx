import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { User, AuthContextType, ApiResponse } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthResponse {
  token: string;
  user: User;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get<ApiResponse<User>>('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });

    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    setUser(user);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', {
      username,
      email,
      password,
    });

    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 