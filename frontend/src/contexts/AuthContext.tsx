import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, AuthContextValue } from '../types/auth';
import { authService } from '../services/authService';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const currentUser = await authService.getUser();
      setUser(currentUser);
      const derivedRole = currentUser.role?.nama || currentUser.Role?.nama || null;
      setRole(derivedRole);
      return currentUser;
    } catch {
      setUser(null);
      setRole(null);
      return null;
    }
  }, []);

  const login = useCallback(
    async (
      loginInput: string,
      passwordInput: string,
      remember: boolean = false
    ): Promise<{ user: User; role: string }> => {
      const result = await authService.login(loginInput, passwordInput, remember);
      setUser(result.user);
      const derivedRole =
        result.user.role?.nama || result.user.Role?.nama || result.role || null;
      setRole(derivedRole);
      return result;
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    authService
      .getUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
          const derivedRole = currentUser.role?.nama || currentUser.Role?.nama || null;
          setRole(derivedRole);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setRole(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [user, role, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
