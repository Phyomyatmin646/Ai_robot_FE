import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthUser } from '../types';
import {
  authApi,
  LoginParams,
  RegisterParams,
} from '../api/auth.api';
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  USER_KEY,
} from '../api/client';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Smooth SPA navigation: If session tokens already exist in localStorage, do not flash full-screen loader
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const hasToken = Boolean(getStoredAccessToken());
    const hasSavedUser = Boolean(localStorage.getItem(USER_KEY));
    return !(hasToken && hasSavedUser);
  });

  const isAuthenticated = Boolean(user && getStoredAccessToken());

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = getStoredAccessToken();
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.getProfile();
        if (res?.data && isMounted) {
          setUser(res.data);
          localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn('Profile sync in background:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    const handleLogoutEvent = () => {
      clearStoredAuth();
      if (isMounted) setUser(null);
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, []);

  const login = async (params: LoginParams) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(params);
      if (res.data?.tokens && res.data.user) {
        setStoredTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        setUser(res.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: RegisterParams) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(params);
      if (res.data?.tokens && res.data.user) {
        setStoredTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        setUser(res.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (e) {
        console.warn('Logout API error:', e);
      }
    }
    clearStoredAuth();
    setUser(null);
  };

  const updateUser = (updated: Partial<AuthUser>) => {
    if (!user) return;
    const next = { ...user, ...updated };
    setUser(next);
    localStorage.setItem(USER_KEY, JSON.stringify(next));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

