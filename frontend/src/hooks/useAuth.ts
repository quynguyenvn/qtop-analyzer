import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAuthState({ isAuthenticated: false, user: null, loading: false });
          return;
        }

        const response = await api.get('/users/me');
        setAuthState({
          isAuthenticated: true,
          user: response.data,
          loading: false,
        });
      } catch (error) {
        localStorage.removeItem('token');
        setAuthState({ isAuthenticated: false, user: null, loading: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setAuthState({ isAuthenticated: true, user, loading: false });
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ isAuthenticated: false, user: null, loading: false });
  };

  return {
    ...authState,
    login,
    logout,
  };
}; 