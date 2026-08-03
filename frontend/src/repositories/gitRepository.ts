import { seedCommits } from '@/mocks/content';
import { contentRepository, markFilesSynced } from './contentRepository';
import { safeStorage } from '@/lib/storage';
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

const STATUS_KEY = 'ignacio-git-status-v1';
const COMMITS_KEY = 'ignacio-git-commits-v1';
const wait = (ms = 340) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredStatus(): GitStatus {
  const storage = safeStorage();
  const saved = storage.getItem(STATUS_KEY);
  if (saved)
    try {
      return JSON.parse(saved) as GitStatus;
    } catch {
      storage.removeItem(STATUS_KEY);
    }
  return {
    branch: 'main',
    modified: ['content/projects/lembas.md', 'content/posts/markdown-first-portfolio.md'],
    added: [],
    deleted: [],
    untracked: [],
    ahead: 1,
    behind: 0,
    lastSyncAt: '2026-07-29T09:30:00.000Z',
    conflict: false,
  };
}
function persistStatus(status: GitStatus) {
  safeStorage().setItem(STATUS_KEY, JSON.stringify(status));
}
function getCommits() {
  const storage = safeStorage();
  const saved = storage.getItem(COMMITS_KEY);
  if (saved)
    try {
      return JSON.parse(saved) as GitCommit[];
    } catch {
      storage.removeItem(COMMITS_KEY);
    }
  return seedCommits;
}
function persistCommits(commits: GitCommit[]) {
  safeStorage().setItem(COMMITS_KEY, JSON.stringify(commits));
}

const mockGitRepository: GitRepository = {
  async getStatus() {
    await wait(220);
    const stored = getStoredStatus();
    const summaries = await contentRepository.listFiles();
    const localChanges = summaries
      .filter((file) => file.synchronizationStatus !== 'synced')
      .map((file) => file.path);
    return { ...stored, modified: Array.from(new Set([...stored.modified, ...localChanges])) };
  },
  async getHistory() {
    await wait(180);
    return getCommits();
  },
  async createCommit(input) {
    await wait();
    if (!input.message.trim()) throw new Error('Add a commit message before committing.');
    const status = getStoredStatus();
    const commit: GitCommit = {
      id: Math.random().toString(16).slice(2, 9),
      message: input.message.trim(),
      author: 'Ignacio Osella',
      createdAt: new Date().toISOString(),
      files: input.files,
    };
    persistCommits([commit, ...getCommits()]);
    persistStatus({
      ...status,
      modified: status.modified.filter((file) => !input.files.includes(file)),
      added: status.added.filter((file) => !input.files.includes(file)),
      deleted: status.deleted.filter((file) => !input.files.includes(file)),
      ahead: status.ahead + 1,
    });
    markFilesSynced(input.files);
    return commit;
  },
  async push() {
    await wait(700);
    const status = getStoredStatus();
    if (status.ahead === 0)
      return { success: true, pushedCommits: 0, message: 'Remote is already up to date.' };
    const pushedCommits = status.ahead;
    persistStatus({ ...status, ahead: 0, lastSyncAt: new Date().toISOString() });
    return {
      success: true,
      pushedCommits,
      message: `${pushedCommits} commit${pushedCommits > 1 ? 's' : ''} pushed to origin/main.`,
    };
  },
  async pull() {
    await wait(600);
    const status = getStoredStatus();
    if (status.behind === 0)
      return { success: true, updatedFiles: [], message: 'Your branch is up to date.' };
    persistStatus({ ...status, behind: 0, lastSyncAt: new Date().toISOString() });
    return { success: true, updatedFiles: [], message: 'Remote changes pulled cleanly.' };
  },
};

export const gitRepository: GitRepository = apiEnabled ? apiGitRepository : mockGitRepository;
