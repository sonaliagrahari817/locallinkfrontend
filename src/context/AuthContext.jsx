import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import { saveSeparateAccount, findSeparateAccount, defaultAvatarImg } from '../data/dummyData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          // Verify token with backend if server is running
          if (!savedToken.startsWith('mock_')) {
            const res = await authAPI.getMe();
            if (res.data?.user) {
              const formatted = saveSeparateAccount(res.data.user);
              setUser(formatted);
              localStorage.setItem('user', JSON.stringify(formatted));
            }
          }
        } catch (error) {
          // If token verification fails with 401, clean up
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), 2000)
      );
      const res = await Promise.race([
        authAPI.login({ email: cleanEmail, password }),
        timeoutPromise
      ]);
      const { token: newToken, user: userData } = res.data;

      const formattedUser = saveSeparateAccount(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(formattedUser));
      setToken(newToken);
      setUser(formattedUser);

      return { ...res.data, user: formattedUser };
    } catch (err) {
      console.warn('Backend server login fallback. Logging in separate account...');
      const storedUser = findSeparateAccount(cleanEmail);
      const isProvider = cleanEmail.includes('provider') || storedUser?.role === 'provider' || storedUser?.accountType === 'provider';

      const fallbackUser = {
        _id: storedUser?._id || 'user_' + Date.now(),
        name: storedUser?.name || (cleanEmail.includes('aman') ? 'Aman Sharma' : cleanEmail.split('@')[0]),
        email: cleanEmail,
        phone: storedUser?.phone || '+91 98765 12345',
        role: isProvider ? 'provider' : (storedUser?.role || 'user'),
        accountType: isProvider ? 'provider' : (storedUser?.accountType || 'customer'),
        city: 'Lucknow, UP',
        avatar: storedUser?.avatar || defaultAvatarImg,
        notifications: { emailAlerts: true, pushAlerts: true, smsAlerts: true },
      };

      const formattedUser = saveSeparateAccount(fallbackUser);
      const fallbackToken = 'mock_jwt_token_' + Date.now();

      localStorage.setItem('token', fallbackToken);
      localStorage.setItem('user', JSON.stringify(formattedUser));
      setToken(fallbackToken);
      setUser(formattedUser);

      return { success: true, token: fallbackToken, user: formattedUser };
    }
  }, []);

  const register = useCallback(async (formData) => {
    const cleanEmail = (formData.email || '').toLowerCase().trim();
    const payload = {
      ...formData,
      email: cleanEmail,
      role: formData.role || 'user'
    };

    try {
      const res = await authAPI.register(payload);
      const { token: newToken, user: userData } = res.data;

      const formattedUser = saveSeparateAccount(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(formattedUser));
      setToken(newToken);
      setUser(formattedUser);

      return { ...res.data, user: formattedUser };
    } catch (err) {
      if (err.response && err.response.data?.message && err.response.data.message.toLowerCase().includes('already exists')) {
        throw err;
      }
      console.warn('Backend server registration fallback. Creating isolated user account...');
      const fallbackUser = {
        _id: (payload.role === 'provider' ? 'provider_' : 'customer_') + Date.now(),
        name: payload.name,
        email: payload.email,
        phone: payload.phone || '+91 98765 43210',
        role: payload.role || 'user',
        accountType: payload.role === 'provider' ? 'provider' : 'customer',
        city: 'Lucknow, UP',
        avatar: payload.avatar || defaultAvatarImg,
        notifications: { emailAlerts: true, pushAlerts: true, smsAlerts: true },
      };

      const formattedUser = saveSeparateAccount(fallbackUser);
      const fallbackToken = 'mock_jwt_token_' + Date.now();

      localStorage.setItem('token', fallbackToken);
      localStorage.setItem('user', JSON.stringify(formattedUser));
      setToken(fallbackToken);
      setUser(formattedUser);

      return { success: true, token: fallbackToken, user: formattedUser };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    const formatted = saveSeparateAccount(updatedUser);
    setUser(formatted);
    localStorage.setItem('user', JSON.stringify(formatted));
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
