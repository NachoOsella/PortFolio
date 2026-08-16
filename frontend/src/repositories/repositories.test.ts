import { beforeEach, describe, expect, it } from 'vitest';
import { mockContentRepository, resetContentRepository } from './mockContentRepository';
import { mockGitRepository } from './mockGitRepository';
import { mockAuthRepository } from './mockAuthRepository';

beforeEach(async () => {
  localStorage.clear();
  sessionStorage.clear();
  await resetContentRepository();
});

describe('mock content repository', () => {
  it('supports create, update, rename, and delete while persisting local state', async () => {
    const raw = `---\ntitle: Test page\nslug: test-page\ndescription: A test page\nstatus: draft\nupdatedAt: 2026-07-01\n---\n\n# Test`;
    const created = await mockContentRepository.createFile({
      collection: 'pages',
      filename: 'test-page.md',
      raw,
    });
    expect(created.frontmatter.title).toBe('Test page');
    const updated = await mockContentRepository.updateFile(created.path, {
      raw: raw.replace('Test page', 'Updated page'),
    });
    expect(updated.version).toBe(2);
    const renamed = await mockContentRepository.renameFile(created.path, 'content/pages/renamed.md');
    expect(renamed.filename).toBe('renamed.md');
    await mockContentRepository.deleteFile(renamed.path);
    await expect(mockContentRepository.getFile(renamed.path)).rejects.toThrow('not found');
  });
});

describe('mock auth and git repositories', () => {
  it('persists a mock session without claiming browser security', async () => {
    const session = await mockAuthRepository.login('owner@example.com', 'not-a-secret', true);
    expect(session.email).toBe('owner@example.com');
    expect(await mockAuthRepository.session()).toEqual(session);
    await mockAuthRepository.logout();
    expect(await mockAuthRepository.session()).toBeNull();
  });

  it('creates a commit and pushes it explicitly', async () => {
    const statusBefore = await mockGitRepository.getStatus();
    const commit = await mockGitRepository.createCommit({
      message: 'content: test commit',
      files: statusBefore.modified,
    });
    expect(commit.message).toBe('content: test commit');
    const statusAfterCommit = await mockGitRepository.getStatus();
    expect(statusAfterCommit.ahead).toBeGreaterThan(statusBefore.ahead);
    const pushed = await mockGitRepository.push();
    expect(pushed.success).toBe(true);
    expect((await mockGitRepository.getStatus()).ahead).toBe(0);
  });
});