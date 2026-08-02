import { beforeEach, describe, expect, it } from 'vitest';
import { contentRepository, resetContentRepository } from './contentRepository';
import { gitRepository } from './gitRepository';
import { authRepository } from './authRepository';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetContentRepository();
});

describe('mock content repository', () => {
  it('supports create, update, rename, and delete while persisting local state', async () => {
    const raw = `---\ntitle: Test page\nslug: test-page\ndescription: A test page\nstatus: draft\nupdatedAt: 2026-07-01\n---\n\n# Test`;
    const created = await contentRepository.createFile({
      collection: 'pages',
      filename: 'test-page.md',
      raw,
    });
    expect(created.frontmatter.title).toBe('Test page');
    const updated = await contentRepository.updateFile(created.path, {
      raw: raw.replace('Test page', 'Updated page'),
    });
    expect(updated.version).toBe(2);
    const renamed = await contentRepository.renameFile(created.path, 'content/pages/renamed.md');
    expect(renamed.filename).toBe('renamed.md');
    await contentRepository.deleteFile(renamed.path);
    await expect(contentRepository.getFile(renamed.path)).rejects.toThrow('not found');
  });
});

describe('mock auth and git repositories', () => {
  it('persists a mock session without claiming browser security', async () => {
    const session = await authRepository.login('owner@example.com', 'not-a-secret', true);
    expect(session.email).toBe('owner@example.com');
    expect(await authRepository.session()).toEqual(session);
    await authRepository.logout();
    expect(await authRepository.session()).toBeNull();
  });

  it('creates a commit and pushes it explicitly', async () => {
    const statusBefore = await gitRepository.getStatus();
    const commit = await gitRepository.createCommit({
      message: 'content: test commit',
      files: statusBefore.modified,
    });
    expect(commit.message).toBe('content: test commit');
    const statusAfterCommit = await gitRepository.getStatus();
    expect(statusAfterCommit.ahead).toBeGreaterThan(statusBefore.ahead);
    const pushed = await gitRepository.push();
    expect(pushed.success).toBe(true);
    expect((await gitRepository.getStatus()).ahead).toBe(0);
  });
});
