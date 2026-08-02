import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer, TableOfContents } from '@/components/MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders inline code with the inline-code class and blocks as code blocks', () => {
    const content = ['Some `inline` here.', '', '```ts', 'const x = 1;', '```'].join('\n');
    const { container } = render(<MarkdownRenderer content={content} />);
    const inline = container.querySelector('.inline-code');
    expect(inline).not.toBeNull();
    expect(inline?.tagName).toBe('CODE');
    // Block code goes through the pre override into a single code-block.
    const blocks = container.querySelectorAll('.code-block');
    expect(blocks.length).toBe(1);
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeDefined();
  });

  it('gives repeated headings unique ids and links them from the TOC', () => {
    const content = ['# Title', '', '## Focus', '', '## Focus', ''].join('\n');
    const { container } = render(<MarkdownRenderer content={content} />);
    const headings = Array.from(container.querySelectorAll('h2'));
    expect(headings.map((h) => h.id)).toEqual(['focus', 'focus-1']);

    const { container: toc } = render(<TableOfContents content={content} />);
    const links = Array.from(toc.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['#focus', '#focus-1']);
  });
});