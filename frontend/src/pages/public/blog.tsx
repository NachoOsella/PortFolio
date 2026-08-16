import { lazy, Suspense, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { BlogIndex } from '@/components/BlogIndex';
import { ReadingProgress } from '@/components/ReadingProgress';
import { ContentError } from '@/components/RouteStates';
import { Seo } from '@/components/Seo';
import { LoadingState } from '@/components/ui';
import { usePublicPost, usePublicPosts } from '@/hooks/usePublicContent';
import { createRevision } from '@/lib/archive';
import { formatDate, readingTime } from '@/lib/content';

const MarkdownRenderer = lazy(() =>
  import('@/components/MarkdownRenderer').then((module) => ({ default: module.MarkdownRenderer })),
);
const TableOfContents = lazy(() =>
  import('@/components/MarkdownRenderer').then((module) => ({ default: module.TableOfContents })),
);

export function BlogPage() {
  const { data: posts, isLoading } = usePublicPosts();

  return (
    <div className="v2-page">
      <Seo title="Blog" description="Technical writing on backend engineering, Java, Spring Boot and maintainable systems." path="/blog" />
      {isLoading ? (
        <div className="v2-shell v2-state-wrap"><LoadingState label="Loading technical writing" /></div>
      ) : (
        <BlogIndex posts={posts ?? []} />
      )}
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const { data: post, isLoading } = usePublicPost(slug);
  const { data: all } = usePublicPosts();
  const [copied, setCopied] = useState(false);
  if (isLoading) return <LoadingState label="Loading article" />;
  if (!post) return <ContentError message="This article is not published or could not be found." />;

  const item = post.frontmatter;
  const list = all ?? [];
  const index = list.findIndex((document) => document.path === post.path);
  const next = list[index + 1] ?? list[0];

  return (
    <article className="v2-article v2-page-top">
      <ReadingProgress />
      <Seo
        title={item.seoTitle ?? item.title}
        description={item.seoDescription ?? item.description}
        path={`/blog/${item.slug}`}
      />
      <div className="v2-shell">
        <Link className="v2-back" to="/blog"><ArrowLeft size={16} /> Blog</Link>
        <header className="v2-article-header">
          <div className="v2-record-stamp">
            <strong>N–{String(Math.max(index, 0) + 1).padStart(3, '0')}</strong>
            <span>{item.category}</span>
            <span>{createRevision(item.updatedAt)}</span>
            <span>{formatDate(item.publishedAt)}</span>
          </div>
          <h1>{item.title}</h1>
          <p>{item.description}</p>
          <div className="v2-article-meta">
            <span>{item.category}</span>
            <span>{formatDate(item.publishedAt)}</span>
            <span>{readingTime(post.body)} min read</span>
            <button type="button" onClick={() => {
              void navigator.clipboard?.writeText(window.location.href);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1400);
            }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
          {item.tags.length ? (
            <div className="v2-article-tags">
              {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          ) : null}
        </header>
        <div className="v2-reading-layout">
          <aside className="v2-reading-rail">
            <Suspense fallback={null}><TableOfContents content={post.body} /></Suspense>
          </aside>
          <Suspense fallback={<LoadingState label="Preparing article" />}><MarkdownRenderer content={post.body} /></Suspense>
        </div>
        {next ? (
          <Link className="v2-next" to={`/blog/${next.frontmatter.slug}`}>
            <span>Next article</span>
            <strong>{next.frontmatter.title}</strong>
            <ArrowRight size={24} />
          </Link>
        ) : null}
      </div>
    </article>
  );
}