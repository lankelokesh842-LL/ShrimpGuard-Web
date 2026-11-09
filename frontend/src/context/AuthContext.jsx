import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('shrimpguard_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('shrimpguard_token') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('shrimpguard_user', JSON.stringify(res.data.data));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('shrimpguard_token', userData.token);
      localStorage.setItem('shrimpguard_user', JSON.stringify(userData));
      return { success: true, data: userData };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (farmerData) => {
    const res = await api.post('/auth/register', farmerData);
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('shrimpguard_token', userData.token);
      localStorage.setItem('shrimpguard_user', JSON.stringify(userData));
      return { success: true, data: userData };
    }
    return { success: false, message: res.data.message };
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      const updated = { ...user, ...res.data.data };
      setUser(updated);
      localStorage.setItem('shrimpguard_user', JSON.stringify(updated));
      return { success: true, data: updated };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('shrimpguard_token');
    localStorage.removeItem('shrimpguard_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateProfile,
        logout,
        isAdmin: user?.role === 'admin',
        isFarmer: user?.role === 'farmer'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
