import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import axios from 'axios';

// Configure Axios
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Important for cookies
});

// ── Token Auto-Refresh Interceptor ────────────────────────────────────────────
// When a request fails with 401, attempt a silent token refresh and retry once.
let isRefreshing = false;
let failedQueue: { resolve: (v: unknown) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // Only handle 401 errors that haven't been retried yet
    // Skip the refresh endpoint itself to avoid infinite loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/users/refresh') &&
      !originalRequest.url?.includes('/users/login')
    ) {
      if (isRefreshing) {
        // Queue subsequent requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/users/refresh');
        const newToken = data.accessToken;

        // Update default header for all future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear auth state — the response interceptor below will handle redirect
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('defectUser');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
// ─────────────────────────────────────────────────────────────────────────────

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('defectUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (user) {
          // Silently refresh the access token using the HttpOnly refresh cookie
          const res = await api.post('/users/refresh');
          const token = res.data.accessToken;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(prev => prev ? { ...prev, accessToken: token } : null);
        }
      } catch (error) {
        // Refresh token failed or expired — log out
        setUser(null);
        localStorage.removeItem('defectUser');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('defectUser', JSON.stringify({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    }));
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('defectUser');
    delete api.defaults.headers.common['Authorization'];
    api.post('/users/logout').catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
