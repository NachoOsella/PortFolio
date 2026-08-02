import { beforeEach, describe, expect, it } from 'vitest';
import { getDraft, removeDraft, saveDraft } from '@/services/drafts';

describe('local editor drafts', () => {
  beforeEach(() => localStorage.clear());
  it('restores and discards a draft by file path', () => {
    saveDraft('content/posts/test.md', '# Local draft');
    expect(getDraft('content/posts/test.md')).toBe('# Local draft');
    removeDraft('content/posts/test.md');
    expect(getDraft('content/posts/test.md')).toBeNull();
  });
});
