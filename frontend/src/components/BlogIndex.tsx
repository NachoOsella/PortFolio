import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContentIndexControls } from '@/components/ContentIndexControls';
import { EmptyState } from '@/components/ui';
import { createRevision, getRecordTone } from '@/lib/archive';
import { formatDate, readingTime } from '@/lib/content';
import type { PostDocument } from '@/types';

export function BlogIndex({ posts }: { posts: PostDocument[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const visiblePosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return posts
      .filter((post) => {
        if (!query) return true;
        const item = post.frontmatter;
        return [item.title, item.description, item.category, ...item.tags]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .slice()
      .sort((a, b) => {
        if (sort === 'title') return a.frontmatter.title.localeCompare(b.frontmatter.title);
        if (sort === 'oldest') {
          return a.frontmatter.publishedAt.localeCompare(b.frontmatter.publishedAt);
        }
        return b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt);
      });
  }, [posts, search, sort]);

  return (
    <section className="v2-index-page v2-blog-index" aria-labelledby="blog-index-heading">
      <div className="v2-shell">
        <header className="v2-index-header">
          <p className="v2-label">Writing</p>
          <h1 id="blog-index-heading">Notes for the real work.</h1>
          <p>Product engineering notes for the decisions, systems and interfaces that need to hold up after the first release.</p>
        </header>
        <ContentIndexControls
          id="blog-index-filters"
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          sortOptions={[
            { value: 'recent', label: 'Newest first' },
            { value: 'oldest', label: 'Oldest first' },
            { value: 'title', label: 'Title A–Z' },
          ]}
          resultCount={visiblePosts.length}
          resultLabel={visiblePosts.length === 1 ? 'note' : 'notes'}
        />

        {visiblePosts.length ? (
          <div className="v2-blog-index-list">
            {visiblePosts.map((post, index) => {
              const item = post.frontmatter;
              const tone = getRecordTone(item.slug, item.ink);
              return (
                <article className="v2-blog-index-row" key={post.path}>
                  <Link to={`/blog/${item.slug}`} className="v2-blog-index-link">
                    <span className={`v2-blog-index-number v2-tone-${tone}`} aria-hidden="true">
                      N–{String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="v2-blog-index-copy">
                      <div className="v2-blog-index-meta">
                        <span>{item.category} / {createRevision(item.updatedAt)}</span>
                        <span>{formatDate(item.publishedAt)} / INK {tone}</span>
                      </div>
                      <h2>{item.title}</h2>
                      <p>{item.description}</p>
                    </div>
                    <div className="v2-blog-index-reading">
                      <span>{readingTime(post.body)} min read</span>
                      <span>Read note <ArrowUpRight size={18} strokeWidth={1.6} /></span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No notes found"
            description="Try a different search term or return to the complete writing index."
          />
        )}
      </div>
    </section>
  );
}
