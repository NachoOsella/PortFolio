import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy } from 'lucide-react';

function CodeBlock({
  className,
  children,
  inline,
}: {
  className?: string;
  children?: React.ReactNode;
  inline?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');
  if (inline) return <code className="inline-code">{children}</code>;
  return (
    <div className="code-block">
      <div className="code-head">
        <span>{className?.replace('language-', '') || 'code'}</span>
        <button
          onClick={() => {
            void navigator.clipboard?.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          }}
          aria-label="Copy code"
        >
          <span>{copied ? 'Copied' : 'Copy'}</span>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  const components = useMemo(
    () => ({
      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1 id={headingId(children)}>{children}</h1>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2 id={headingId(children)}>{children}</h2>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3 id={headingId(children)}>{children}</h3>
      ),
      code: CodeBlock,
      a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
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
          {src ? <img src={src} alt={alt || ''} loading="lazy" /> : <div className="image-placeholder image-placeholder-inline"><span>{alt || 'Image'}</span></div>}
          {alt ? <figcaption>{alt}</figcaption> : null}
        </figure>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote>
          <span className="quote-mark">“</span>
          <div>{children}</div>
        </blockquote>
      ),
      table: ({ children }: { children?: React.ReactNode }) => (
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
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function headingId(children: React.ReactNode) {
  return String(children)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function TableOfContents({ content }: { content: string }) {
  const headings = content
    .split('\n')
    .filter((line) => /^#{2,3}\s/.test(line))
    .map((line) => {
      const level = line.match(/^(#+)/)?.[1].length ?? 2;
      const text = line.replace(/^#+\s/, '');
      return { level, text, id: headingId(text) };
    });
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
