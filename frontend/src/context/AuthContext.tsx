import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, role?: UserRole, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('erp_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return INITIAL_USERS[0];
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('erp_token');
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('erp_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('erp_auth_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('erp_token', token);
    } else {
      localStorage.removeItem('erp_token');
    }
  }, [token]);

  const login = async (email: string, role?: UserRole, password?: string): Promise<boolean> => {
    try {
      // 1. Attempt real API login
      const data = await authApi.login(email, password);
      setUser(data.user);
      setToken(data.token);
      return true;
    } catch (err) {
      console.warn('Backend API login unavailable, using local mock session:', err);
      // Fallback to local session
      const found = INITIAL_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || (role && u.role === role)
      );
      if (found) {
        setUser(found);
        setToken(found.token || 'mock-token');
      } else {
        const fallback: User = {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: role || 'SALES',
          token: `token-${Date.now()}`,
        };
        setUser(fallback);
        setToken(fallback.token || 'mock-token');
      }
      return true;
    }
  };

  const switchRole = async (role: UserRole) => {
    const emailMap: Record<UserRole, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@minierp.com', pass: 'Admin@123' },
      SALES: { email: 'sales@minierp.com', pass: 'Sales@123' },
      WAREHOUSE: { email: 'warehouse@minierp.com', pass: 'Warehouse@123' },
      ACCOUNTS: { email: 'accounts@minierp.com', pass: 'Accounts@123' },
    };

    const target = emailMap[role];
    try {
      const res = await authApi.login(target.email, target.pass);
      setUser(res.user);
      setToken(res.token);
    } catch (err) {
      const localTarget = INITIAL_USERS.find((u) => u.role === role);
      if (localTarget) {
        setUser(localTarget);
        setToken(localTarget.token || 'mock-token');
      } else if (user) {
        setUser({ ...user, role });
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('erp_auth_user');
    localStorage.removeItem('erp_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        switchRole,
        isAuthenticated: !!user,
        token,
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