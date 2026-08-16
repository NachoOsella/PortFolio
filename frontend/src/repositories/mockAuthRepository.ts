import type { UserSession } from '@/types';
import { safeStorage } from '@/lib/storage';

const SESSION_KEY = 'ignacio-session-v1';
const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export interface AuthRepository {
  login(email: string, password: string, remember: boolean): Promise<UserSession>;
  logout(): Promise<void>;
  session(): Promise<UserSession | null>;
}

export const mockAuthRepository: AuthRepository = {
  async login(email, password, remember) {
    await wait();
    if (!email.includes('@') || password.length < 6)
      throw new Error('Enter a valid email and a password with at least 6 characters.');
    const session = {
      email,
      name: 'Ignacio Osella',
      remember,
      createdAt: new Date().toISOString(),
    };
    // This mock is intentionally not secure. Spring Boot should own auth with HttpOnly cookies in production.
    safeStorage(remember ? 'local' : 'session').setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },
  async logout() {
    await wait(180);
    safeStorage('local').removeItem(SESSION_KEY);
    safeStorage('session').removeItem(SESSION_KEY);
  },
  async session() {
    await wait(120);
    const raw =
      safeStorage('local').getItem(SESSION_KEY) ?? safeStorage('session').getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  },
};