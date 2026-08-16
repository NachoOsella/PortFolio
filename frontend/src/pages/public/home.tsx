import { lazy, Suspense } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroScene } from '@/components/HeroScene';
import { Seo } from '@/components/Seo';
import { LoadingState } from '@/components/ui';
import { usePublicPosts, usePublicProjects } from '@/hooks/usePublicContent';

const HorizontalProjects = lazy(() =>
  import('@/components/HorizontalProjects').then((module) => ({ default: module.HorizontalProjects })),
);
const WritingIndex = lazy(() =>
  import('@/components/WritingIndex').then((module) => ({ default: module.WritingIndex })),
);

export function HomePage() {
  const { data: projects, isLoading: projectsLoading } = usePublicProjects();
  const { data: posts, isLoading: postsLoading } = usePublicPosts();
  const featuredProjects = (projects ?? [])
    .filter((project) => project.frontmatter.featured)
    .sort((a, b) => Number(a.frontmatter.displayOrder ?? 99) - Number(b.frontmatter.displayOrder ?? 99));
  const recentPosts = (posts ?? [])
    .slice()
    .sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt))
    .slice(0, 4);

  return (
    <>
      <Seo
        title="Backend developer · Java & Spring Boot"
        description="Ignacio Osella specializes in Java and Spring Boot backend systems, with full-stack capability across Angular, TypeScript and production infrastructure."
        path="/"
      />
      <HeroScene />

      {projectsLoading ? (
        <div className="v2-shell v2-state-wrap">
          <LoadingState label="Loading selected work" />
        </div>
      ) : (
        <Suspense fallback={<div className="v2-shell v2-state-wrap"><LoadingState label="Preparing project gallery" /></div>}>
          <HorizontalProjects projects={featuredProjects} />
        </Suspense>
      )}

      {postsLoading ? (
        <div className="v2-shell v2-state-wrap">
          <LoadingState label="Loading technical writing" />
        </div>
      ) : (
        <Suspense fallback={<div className="v2-shell v2-state-wrap"><LoadingState label="Preparing technical writing" /></div>}>
          <WritingIndex posts={recentPosts} />
        </Suspense>
      )}

      <HomeContactSection />
    </>
  );
}

function HomeContactSection() {
  const reduceMotion = useReducedMotion();
  const transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <section className="v2-home-contact" aria-labelledby="home-contact-heading">
      <div className="v2-shell">
        <div className="v2-home-contact-grid">
          <motion.h2
            id="home-contact-heading"
            initial={reduceMotion ? false : { opacity: 0, y: 42, clipPath: 'inset(0 0 28% 0)' }}
            whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
            viewport={{ once: true, amount: 0.35 }}
            transition={transition}
          >
            Have a system worth untangling?
          </motion.h2>
          <motion.div
            className="v2-home-contact-copy"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ ...transition, delay: 0.12 }}
          >
            <p>A rough note is enough. Tell me what is taking shape and where it becomes difficult to see.</p>
            <a className="v2-home-contact-email" href="mailto:nachoosella7@gmail.com">
              <Mail size={17} strokeWidth={1.6} /> nachoosella7@gmail.com
            </a>
            <Link className="v2-home-contact-action" to="/contact">
              Start a conversation <ArrowUpRight size={22} strokeWidth={1.6} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}