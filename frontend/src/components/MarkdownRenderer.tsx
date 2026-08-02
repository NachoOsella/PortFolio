import { isValidElement, useMemo, useRef, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

/*
  react-markdown v9 removed the `inline` prop on custom `code` components.
  Block code is always `<pre><code>`, so we override `pre` for blocks and use
  the presence of a `language-*`/similar className on `code` to tell inline
  apart. rehype-highlight was dropped: it bundled ~100 kB gzip of highlight.js
  and shipped zero styling for it, so code renders in a calm monochrome panel
  that fits the system. Heading ids are assigned by a tiny rehype plugin with a
  per-parse slugger, so duplicates are disambiguated and TOC links stay anchored.
*/

function slugifyHeading(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

class Slugger {
  private counts = new Map<string, number>();
  slug(text: string) {
    const base = slugifyHeading(text) || 'section';
    const count = this.counts.get(base) ?? 0;
    this.counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  }
}

type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function hastText(node: HastNode | undefined): string {
  if (!node) return '';
  if (node.type === 'text') return String(node.value ?? '');
  if (Array.isArray(node.children)) return node.children.map(hastText).join('');
  return '';
}

function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const slugger = new Slugger();
    const walk = (node: HastNode) => {
      if (node.type === 'element' && node.tagName && /^h[1-6]$/.test(node.tagName)) {
        node.properties = { ...node.properties, id: slugger.slug(hastText(node)) };
      }
      if (Array.isArray(node.children)) node.children.forEach(walk);
    };
    walk(tree);
  };
}

function childCodeElement(children: ReactNode) {
  const node = Array.isArray(children) ? children[0] : children;
  if (isValidElement(node)) return node.props as { className?: string; children?: ReactNode };
  return null;
}

function CodeBlock({ language, children }: { language: string; children: ReactNode }) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    const text = codeRef.current?.textContent ?? '';
    void navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="code-block">
      <div className="code-head">
        <span>{language}</span>
        <button onClick={onCopy} aria-label="Copy code">
          <span>{copied ? 'Copied' : 'Copy'}</span>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre>
        <code ref={codeRef} className={language ? `language-${language}` : undefined}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  const components = useMemo(
    () => ({
      // Inline code has no className; block code carries language-* and is
      // rendered whole by the `pre` override, so it never reaches inline form.
      code: ({ className, children }: { className?: string; children?: ReactNode }) =>
        className ? (
          <code className={className}>{children}</code>
        ) : (
          <code className="inline-code">{children}</code>
        ),
      pre: ({ children }: { children?: ReactNode }) => {
        const code = childCodeElement(children);
        if (!code) return <pre>{children}</pre>;
        const language = /language-([\w-]+)/.exec(code.className ?? '')?.[1] ?? 'code';
        return <CodeBlock language={language}>{code.children}</CodeBlock>;
      },
      a: ({ href, children }: { href?: string; children?: ReactNode }) => (
        <a
          href={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noreferrer' : undefined}
        >
          {children}
        </a>
      ),
      img: ({ src, alt }: { src?: string; alt?: string }) => (
        <figure className="markdown-image">
          {src ? (
            <img src={src} alt={alt || ''} loading="lazy" />
          ) : (
            <div className="image-placeholder">
              <span>{alt || 'Image'}</span>
            </div>
          )}
          {alt ? <figcaption>{alt}</figcaption> : null}
        </figure>
      ),
      blockquote: ({ children }: { children?: ReactNode }) => (
        <blockquote>
          <span className="quote-mark">“</span>
          <div>{children}</div>
        </blockquote>
      ),
      table: ({ children }: { children?: ReactNode }) => (
        <div className="table-wrap">
          <table>{children}</table>
        </div>
      ),
      hr: () => <hr />,
    }),
    [],
  );
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHeadingIds]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

type Heading = { level: number; text: string; id: string };

function parseHeadings(content: string): Heading[] {
  const slugger = new Slugger();
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of content.split('\n')) {
    if (/^`{3,}/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({ level, text, id: slugger.slug(text) });
  }
  return headings;
}

export function TableOfContents({ content }: { content: string }) {
  const headings = useMemo(
    () => parseHeadings(content).filter((heading) => heading.level === 2 || heading.level === 3),
    [content],
  );
  if (!headings.length) return null;
  return (
    <nav className="toc" aria-label="On this page">
      <p className="toc-title">On this page</p>
      {headings.map((heading) => (
        <a
          key={heading.id}
          className={heading.level === 3 ? 'toc-sub' : ''}
          href={`#${heading.id}`}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}