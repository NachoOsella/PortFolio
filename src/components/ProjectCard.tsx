import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContentVisual } from './ContentVisual';
import type { ProjectFrontmatter } from '@/types';

export function ProjectCard({
  project,
  featured = false,
}: {
  project: { frontmatter: ProjectFrontmatter };
  featured?: boolean;
}) {
  const item = project.frontmatter;
  const cardRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [60, -60]);
  const copyY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [26, -26]);

  return (
    <motion.article
      ref={cardRef}
      className={`project-card ${featured ? 'project-card-featured' : ''}`}
      initial={reduceMotion ? false : { clipPath: 'inset(7% 0 0 0)' }}
      whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/projects/${item.slug}`} className="project-card-link">
        <motion.div className="project-visual-motion" style={{ y: visualY }}>
          <ContentVisual slug={item.slug} compact={!featured} />
        </motion.div>
        <motion.div className="project-card-copy" style={{ y: copyY }}>
          <div className="project-card-heading">
            <p className="meta-line">
              <span>{item.projectType}</span>
              <span>{item.duration}</span>
            </p>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
          <div className="project-card-bottom">
            <span className="project-technologies">{item.technologies.slice(0, 3).join(' / ')}</span>
            <span className="card-arrow" aria-hidden="true">
              <ArrowUpRight size={22} strokeWidth={1.7} />
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.article>
  );
}
