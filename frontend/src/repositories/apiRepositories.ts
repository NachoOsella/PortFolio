import { apiPath, apiRequest } from './apiClient';
import type { AuthRepository } from './authRepository';
import type { ContentRepository } from './contentRepository';
import type { GitRepository } from './gitRepository';
import type {
  ContentQuery,
  CreateContentFileInput,
  ImportMarkdownFileInput,
  ContentFileSummary,
  GitCommit,
  GitPullResult,
  GitPushResult,
  GitStatus,
  MarkdownDocument,
  UpdateContentFileInput,
  UserSession,
} from '@/types';

export const apiAuthRepository: AuthRepository = {
  login: (email, password, remember) =>
    apiRequest<UserSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember }),
    }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
  session: async () => {
    const session = await apiRequest<UserSession | undefined>('/auth/session');
    return session ?? null;
  },
};

function queryString(query: ContentQuery = {}) {
  const params = new URLSearchParams();
  if (query.collection) params.set('collection', query.collection);
  if (query.search) params.set('search', query.search);
  if (query.status && query.status !== 'all') params.set('status', query.status);
  if (query.featured !== undefined && query.featured !== 'all') {
    params.set('featured', String(query.featured));
  }
  const value = params.toString();
  return value ? `?${value}` : '';
}

export const apiContentRepository: ContentRepository = {
  listFiles: (query) =>
    apiRequest<ContentFileSummary[]>(`/content/files${queryString(query)}`),
  getFile: (path) =>
    apiRequest<MarkdownDocument>(`/content/file?path=${apiPath(path)}`),
  createFile: (input: CreateContentFileInput) =>
    apiRequest<MarkdownDocument>('/content/files', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateFile: (path: string, input: UpdateContentFileInput) =>
    apiRequest<MarkdownDocument>('/content/file', {
      method: 'PUT',
      body: JSON.stringify({ path, ...input }),
    }),
  renameFile: (path: string, newPath: string) =>
    apiRequest<MarkdownDocument>('/content/rename', {
      method: 'POST',
      body: JSON.stringify({ path, newPath }),
    }),
  deleteFile: (path: string) =>
    apiRequest<void>(`/content/file?path=${apiPath(path)}`, { method: 'DELETE' }),
  importFile: (input: ImportMarkdownFileInput) =>
    apiRequest<MarkdownDocument>('/content/import', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export const apiGitRepository: GitRepository = {
  getStatus: () => apiRequest<GitStatus>('/git/status'),
  getHistory: () => apiRequest<GitCommit[]>('/git/history'),
  createCommit: async () => {
    throw new Error('Use Push to GitHub after reviewing local content changes.');
  },
  push: () => apiRequest<GitPushResult>('/git/push', { method: 'POST' }),
  pull: () => apiRequest<GitPullResult>('/git/pull', { method: 'POST' }),
};
