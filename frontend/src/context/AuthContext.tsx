/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authRepository } from '@/repositories/authRepository';
import type { UserSession } from '@/types';

interface AuthContextValue {
  session: UserSession | null;
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    authRepository
      .session()
      .then(setSession)
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    const handleUnauthorized = () => setSession(null);
    window.addEventListener('portfolio:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('portfolio:unauthorized', handleUnauthorized);
  }, []);
  const login = async (email: string, password: string, remember: boolean) => {
    const next = await authRepository.login(email, password, remember);
    setSession(next);
  };
  const logout = async () => {
    await authRepository.logout();
    setSession(null);
  };
  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
