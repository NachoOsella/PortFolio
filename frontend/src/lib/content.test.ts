import { describe, expect, it } from 'vitest';
import { buildMarkdown, isPubliclyVisible, parseMarkdown, readingTime, slugify } from './content';

const project = `---\ntitle: A project\nslug: a-project\ndescription: Clear work\nstatus: published\nfeatured: true\nprojectType: Product\nrole: Developer\nduration: Ongoing\ntechnologies:\n  - React\nupdatedAt: 2026-07-01\n---\n\n# Overview\n\nA useful project.`;

describe('content utilities', () => {
  it('parses valid project frontmatter and preserves the body', () => {
    const result = parseMarkdown(project, 'content/projects/a-project.md');
    expect(result.result.success).toBe(true);
    if (result.result.success) expect(result.result.data.slug).toBe('a-project');
    expect(result.parsed.content).toContain('# Overview');
  });

  it('returns a readable validation error for malformed YAML', () => {
    const result = parseMarkdown('---\ntitle: [broken\n---\nBody', 'content/pages/broken.md');
    expect(result.result.success).toBe(false);
    if (!result.result.success) expect(result.result.error.issues[0].message).toBeTruthy();
  });

  it('hides drafts, archives, and future scheduled content', () => {
    const draft = {
      title: 'Draft',
      slug: 'draft',
      description: '',
      status: 'draft',
      updatedAt: '',
    } as never;
    const scheduled = {
      title: 'Later',
      slug: 'later',
      description: '',
      status: 'scheduled',
      publishedAt: '2099-01-01',
      updatedAt: '',
    } as never;
    const published = {
      title: 'Live',
      slug: 'live',
      description: '',
      status: 'published',
      updatedAt: '',
    } as never;
    expect(isPubliclyVisible(draft)).toBe(false);
    expect(isPubliclyVisible(scheduled)).toBe(false);
    expect(isPubliclyVisible(published)).toBe(true);
  });

  it('calculates reading time and creates Markdown exports without dropping unknown metadata', () => {
    expect(readingTime('word '.repeat(450))).toBe(3);
    expect(slugify('Hello, Clear System')).toBe('hello-clear-system');
    expect(buildMarkdown({ title: 'Test', slug: 'test', custom: 'kept' }, 'Body')).toContain(
      'custom: kept',
    );
  });
});
