import { apiGitRepository } from './apiRepositories';
import { apiEnabled } from './apiClient';
import type {
  CreateCommitInput,
  GitCommit,
  GitPullResult,
  GitPushResult,
  GitStatus,
} from '@/types';

export interface GitRepository {
  getStatus(): Promise<GitStatus>;
  getHistory(): Promise<GitCommit[]>;
  createCommit(input: CreateCommitInput): Promise<GitCommit>;
  push(): Promise<GitPushResult>;
  pull(): Promise<GitPullResult>;
}

/**
 * The mock Git repository only loads in development builds without
 * VITE_API_URL; production builds use the Spring Boot Git adapter, which
 * never executes Git or stores credentials in the browser.
 */
async function loadRepository(): Promise<GitRepository> {
  if (import.meta.env.DEV && !apiEnabled) {
    const { mockGitRepository } = await import('./mockGitRepository');
    return mockGitRepository;
  }
  return apiGitRepository;
}

export const gitRepository = await loadRepository();