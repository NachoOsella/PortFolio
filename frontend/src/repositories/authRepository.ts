import { apiAuthRepository } from './apiRepositories';
import { apiEnabled } from './apiClient';
import type { UserSession } from '@/types';

export interface AuthRepository {
  login(email: string, password: string, remember: boolean): Promise<UserSession>;
  logout(): Promise<void>;
  session(): Promise<UserSession | null>;
}

/**
 * The mock auth repository only loads in development builds without
 * VITE_API_URL; production builds resolve to the Spring Boot adapter and
 * never include the localStorage simulation.
 */
async function loadRepository(): Promise<AuthRepository> {
  if (import.meta.env.DEV && !apiEnabled) {
    const { mockAuthRepository } = await import('./mockAuthRepository');
    return mockAuthRepository;
  }
  return apiAuthRepository;
}

export const authRepository = await loadRepository();