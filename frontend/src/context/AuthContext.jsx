import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user on startup if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('sprinthub_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getProfile();
        if (res.data.success) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        } else {
          // Token invalid or expired
          localStorage.removeItem('sprinthub_token');
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        // Clear token if server says it's unauthorized
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('sprinthub_token');
        }
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        localStorage.setItem('sprinthub_token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      if (res.data.success) {
        localStorage.setItem('sprinthub_token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try checking details.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('sprinthub_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Profile update handler
  const updateProfile = async (formData) => {
    try {
      const res = await authAPI.updateProfile(formData);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      return { success: false, message: msg };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
