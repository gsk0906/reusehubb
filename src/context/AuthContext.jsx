import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Read stored token if any; never hardcode or auto-fill a default user
  const [token, setToken] = useState(() => {
    return localStorage.getItem('reusehub_token') || null;
  });

  // User state always starts as null on fresh load
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clear all auth credentials completely
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('reusehub_token');
    localStorage.removeItem('token');
    localStorage.removeItem('reusehub_user');
  }, []);

  // Validate stored token on application startup via GET /api/users/me
  useEffect(() => {
    let isMounted = true;

    const validateExistingSession = async () => {
      const activeToken = localStorage.getItem('reusehub_token');
      if (!activeToken) {
        if (isMounted) {
          logout();
          setLoading(false);
        }
        return;
      }

      try {
        const userData = await fetchCurrentUser();
        const resolvedUser = userData?.user || userData;
        if (isMounted) {
          if (resolvedUser && (resolvedUser.id || resolvedUser._id || resolvedUser.email)) {
            setUser(resolvedUser);
            localStorage.setItem('reusehub_user', JSON.stringify(resolvedUser));
          } else {
            logout();
          }
        }
      } catch (err) {
        console.warn('Session verification failed on startup:', err?.friendlyMessage || err?.message);
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    validateExistingSession();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('reusehub_unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('reusehub_unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Login handler: memoized with useCallback
  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials);
    const receivedToken = data.token || data.accessToken || data.jwt;
    let receivedUser = data.user || null;

    if (!receivedToken) {
      throw new Error('Authentication failed: No token received from server.');
    }

    localStorage.setItem('reusehub_token', receivedToken);
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);

    if (!receivedUser) {
      try {
        const profile = await fetchCurrentUser();
        receivedUser = profile?.user || profile;
      } catch {
        receivedUser = { email: credentials.email };
      }
    }

    setUser(receivedUser);
    localStorage.setItem('reusehub_user', JSON.stringify(receivedUser));

    return { token: receivedToken, user: receivedUser, data };
  }, []);

  // Register handler: memoized with useCallback
  const register = useCallback(async (userData) => {
    const data = await registerUser(userData);
    const receivedToken = data.token || data.accessToken || data.jwt;
    const receivedUser = data.user || null;

    if (receivedToken) {
      localStorage.setItem('reusehub_token', receivedToken);
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser || userData);
      localStorage.setItem('reusehub_user', JSON.stringify(receivedUser || userData));
    }

    return { token: receivedToken, user: receivedUser, data };
  }, []);

  // Update profile fields: memoized with useCallback
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('reusehub_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Memoize context value so it does not trigger cascading re-renders across consumers
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
