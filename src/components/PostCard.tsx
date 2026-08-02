import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, readingTime } from '@/lib/content';
import type { BlogPostFrontmatter } from '@/types';

export function PostCard({
  post,
  featured = false,
}: {
  post: { frontmatter: BlogPostFrontmatter; body: string };
  featured?: boolean;
}) {
  const item = post.frontmatter;
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className={`post-card ${featured ? 'post-card-featured' : ''}`}
      initial={false}
      whileInView={reduceMotion ? undefined : { x: [0, 18, 0] }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/blog/${item.slug}`}>
        <div className="post-card-top">
          <span className="post-category">{item.category}</span>
          <ArrowUpRight className="post-arrow" size={20} strokeWidth={1.7} />
        </div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="post-card-meta">
          <span>{formatDate(item.publishedAt)}</span>
          <span>{readingTime(post.body)} min read</span>
        </div>
      </Link>
    </motion.article>
  );
}
