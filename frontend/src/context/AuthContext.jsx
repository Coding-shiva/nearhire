import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nearhire_token');
      const savedUser = localStorage.getItem('nearhire_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Refresh user profile from backend
          const res = await api.get('/auth/me');
          if (res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('nearhire_user', JSON.stringify(res.data.data));
          }
        } catch (e) {
          localStorage.removeItem('nearhire_token');
          localStorage.removeItem('nearhire_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('nearhire_token', token);
    localStorage.setItem('nearhire_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token, user: userData } = res.data.data;
    localStorage.setItem('nearhire_token', token);
    localStorage.setItem('nearhire_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('nearhire_token');
    localStorage.removeItem('nearhire_user');
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    const res = await api.put('/auth/profile', updatedData);
    const updatedUser = res.data.data;
    localStorage.setItem('nearhire_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isEmployer: user?.role === 'EMPLOYER' || user?.role === 'ADMIN',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
