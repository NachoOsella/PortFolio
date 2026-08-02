import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Github,
  Linkedin,
  Mail,
  Send,
  Sparkles,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatDate, readingTime } from '@/lib/content';
import { useAuth } from '@/context/AuthContext';
import {
  usePublicDocuments,
  usePublicPage,
  usePublicPost,
  usePublicProject,
} from '@/hooks/usePublicContent';
import { ContentVisual } from '@/components/ContentVisual';
import { KineticHero } from '@/components/KineticHero';
import { MarkdownRenderer, TableOfContents } from '@/components/MarkdownRenderer';
import { PostCard } from '@/components/PostCard';
import { ProjectCard } from '@/components/ProjectCard';
import {
  ArrowLink,
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Kicker,
  LinkButton,
  LoadingState,
  SearchField,
  SectionHeading,
  Textarea,
} from '@/components/ui';
import { ContentError } from '@/components/RouteStates';
import { Seo } from '@/components/Seo';
import type { BlogPostFrontmatter, ProjectFrontmatter } from '@/types';

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

export function LegacyHomePage() {
  const { data: projects, isLoading: projectsLoading } = usePublicDocuments('projects');
  const { data: posts } = usePublicDocuments('posts');
  const featuredProjects = (projects ?? [])
    .filter((item) => (item.frontmatter as ProjectFrontmatter).featured)
    .sort(
      (a, b) => Number(a.frontmatter.displayOrder ?? 99) - Number(b.frontmatter.displayOrder ?? 99),
    )
    .slice(0, 3);
  const latestPosts = (posts ?? [])
    .slice()
    .sort((a, b) =>
      String(b.frontmatter.publishedAt).localeCompare(String(a.frontmatter.publishedAt)),
    )
    .slice(0, 3);
  return (
    <>
      <span
        className="direction-contract"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html:
            '<!-- THESIS: Make the portfolio itself proof of clear systems, not a generic hero and card grid. OWN-WORLD: warm paper, white work surfaces, ink typography, cobalt control marks, and authored interface fragments. STORY: Visitors understand the craft, inspect real Markdown-backed work, and know how to start a conversation. FIRST VIEWPORT: A split editorial hero with the offer on the left and a synthetic product/editor system on the right. FORM: Experience-led editorial system, staged as a working archive rather than a marketing template.',
        }}
      />
      <Seo
        title="Full-stack developer"
        description="Ignacio Osella is a full-stack developer building thoughtful, maintainable digital products."
        path="/"
      />
      <section className="hero section-pad">
        <div className="page-shell hero-grid">
          <motion.div className="hero-copy" initial="hidden" animate="show" variants={reveal}>
            <p className="availability">
              <span className="availability-dot" />
              Available for junior / entry-level opportunities
            </p>
            <h1>
              Thoughtful systems,
              <br />
              <em>made tangible.</em>
            </h1>
            <p className="hero-lead">
              Full-stack developer building thoughtful and maintainable digital products with React,
              TypeScript, Java, and Spring Boot.
            </p>
            <div className="hero-actions">
              <LinkButton to="/projects" size="lg">
                View selected work <ArrowDownRight size={17} />
              </LinkButton>
              <LinkButton to="/contact" variant="secondary" size="lg">
                Let's talk <ArrowRight size={16} />
              </LinkButton>
            </div>
            <div className="hero-meta">
              <span>Based in Córdoba, Argentina</span>
              <span className="hero-meta-line" />
              <span>Working across product & platform</span>
            </div>
          </motion.div>
          <motion.div
            className="hero-art"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.1, ease: 'easeOut' }}
            aria-label="A synthetic product system interface visual"
          >
            <div className="hero-art-label">A small system, clearly made</div>
            <div className="hero-code-card">
              <div className="code-card-head">
                <span>
                  <i />
                  <i />
                  <i />
                </span>
                <small>architecture.ts</small>
                <span>•••</span>
              </div>
              <pre>
                <code>
                  <span className="code-purple">export const</span>{' '}
                  <span className="code-blue">platform</span> = {'{'}
                  {`\n`} modules: [<span className="code-orange">'inventory'</span>,{`\n`}{' '}
                  <span className="code-orange">'people'</span>,{' '}
                  <span className="code-orange">'orders'</span>
                  {`\n`} ],{`\n`} boundary: <span className="code-green">'explicit'</span>,{`\n`}{' '}
                  status: <span className="code-green">'ready'</span>
                  {`\n`}
                  {'}'};
                </code>
              </pre>
            </div>
            <div className="hero-editor-card">
              <div className="editor-top">
                <span>CONTENT / PROJECTS</span>
                <span className="editor-status">● synced</span>
              </div>
              <div className="editor-body">
                <div className="editor-aside">
                  <b />
                  <b />
                  <b />
                  <b />
                </div>
                <div className="editor-main">
                  <span className="editor-label">MODULAR ERP / 01</span>
                  <strong>Reusable by design.</strong>
                  <div className="editor-lines">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="editor-tags">
                    <span>React</span>
                    <span>Spring Boot</span>
                    <span>Postgres</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-art-stamp">
              IO <span>01</span>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="section-pad section-rule">
        <div className="page-shell">
          <SectionHeading
            kicker="Selected work"
            title="Systems with a point of view."
            description="A selection of product interfaces, business tools, and experiments built with care."
            action={<ArrowLink to="/projects">View all projects</ArrowLink>}
          />
          {projectsLoading ? (
            <LoadingState />
          ) : (
            <div className="project-grid">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.path}
                  initial="hidden"
                  animate="show"
                  variants={{
                    ...reveal,
                    show: {
                      ...reveal.show,
                      transition: { ...reveal.show.transition, delay: index * 0.08 },
                    },
                  }}
                >
                  <ProjectCard
                    project={project as { frontmatter: ProjectFrontmatter }}
                    featured={index === 0}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="section-pad capability-section">
        <div className="page-shell">
          <SectionHeading
            kicker="Capabilities"
            title="The craft behind the screen."
            description="A focused toolkit, used to make the product easier to understand and the system easier to change."
          />
          <div className="capability-grid">
            <Capability
              number="01"
              title="Product frontend"
              copy="Interfaces that help people see what matters, with accessible states and a clear visual rhythm."
              items="React / TypeScript / Motion / Accessibility"
            />
            <Capability
              number="02"
              title="Backend systems"
              copy="Domain boundaries and APIs that keep business rules explicit, testable, and ready to evolve."
              items="Java / Spring Boot / PostgreSQL / REST"
            />
            <Capability
              number="03"
              title="Delivery & infrastructure"
              copy="Small, repeatable workflows that make local development and deployment less mysterious."
              items="Docker / Git / CI / Documentation"
            />
          </div>
        </div>
      </section>
      <section className="section-pad about-strip">
        <div className="page-shell about-grid">
          <div className="about-mark">
            IO<span>2026</span>
          </div>
          <div className="about-copy">
            <Kicker>A little context</Kicker>
            <h2>Good software should leave the room clearer than it found it.</h2>
            <p>
              I care about the seam between product intent and the systems that make it dependable.
              I start by making the problem legible, then build the smallest useful shape around it.
            </p>
            <ArrowLink to="/about">More about my approach</ArrowLink>
          </div>
        </div>
      </section>
      <section className="section-pad section-rule">
        <div className="page-shell">
          <SectionHeading
            kicker="Latest writing"
            title="Notes from the build."
            description="Short essays about frontend architecture, backend boundaries, and the details that make software feel finished."
            action={<ArrowLink to="/blog">Read the journal</ArrowLink>}
          />
          <div className="post-grid">
            {latestPosts.map((post) => (
              <PostCard
                key={post.path}
                post={post as { frontmatter: BlogPostFrontmatter; body: string }}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="section-pad contact-cta">
        <div className="page-shell cta-inner">
          <div>
            <Kicker>Start a conversation</Kicker>
            <h2>
              Have a thoughtful problem
              <br />
              <em>worth solving?</em>
            </h2>
          </div>
          <LinkButton to="/contact" variant="secondary" size="lg">
            Get in touch <ArrowUpRightIcon />
          </LinkButton>
        </div>
      </section>
    </>
  );
}
function ArrowUpRightIcon() {
  return <ArrowRight size={16} />;
}
function Capability({
  number,
  title,
  copy,
  items,
}: {
  number: string;
  title: string;
  copy: string;
  items: string;
}) {
  return (
    <div className="capability">
      <span className="capability-number">{number}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
      <span className="capability-items">{items}</span>
    </div>
  );
}

export function HomePage() {
  const { data: projects, isLoading: projectsLoading } = usePublicDocuments('projects');
  const { data: posts } = usePublicDocuments('posts');
  const featuredProjects = (projects ?? [])
    .filter((item) => (item.frontmatter as ProjectFrontmatter).featured)
    .sort(
      (a, b) => Number(a.frontmatter.displayOrder ?? 99) - Number(b.frontmatter.displayOrder ?? 99),
    )
    .slice(0, 3);
  const latestPosts = (posts ?? [])
    .slice()
    .sort((a, b) =>
      String(b.frontmatter.publishedAt).localeCompare(String(a.frontmatter.publishedAt)),
    )
    .slice(0, 3);

  return (
    <>
      <span
        className="direction-contract"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html:
            '<!-- THESIS: Turn a developer portfolio into a kinetic typesetting system, refusing the generic centered hero and card grid. OWN-WORLD: cold paper and graphite fields, acid-green type, hard rectangular controls, oversized sans typography, and typographic project artwork. STORY: Visitors meet the builder, inspect systems in motion, read useful technical notes, and make contact. FIRST VIEWPORT: A two-line kinetic statement fills the viewport while an IO letter field reacts behind it and project and contact actions remain visible. FORM: Kinetic Typesetter, selected by the user, staged as a continuously recomposed technical poster. -->',
        }}
      />
      <Seo
        title="Full-stack product developer"
        description="Ignacio Osella builds clear, maintainable digital products with React, TypeScript, Java, and Spring Boot."
        path="/"
      />

      <KineticHero />

      <section className="work-stage section-pad">
        <div className="page-shell">
          <div className="stage-heading">
            <h2>Selected systems, shown at full scale.</h2>
            <p>Product work where interface decisions and technical boundaries support each other.</p>
            <ArrowLink to="/projects">View work</ArrowLink>
          </div>
          {projectsLoading ? (
            <LoadingState label="Loading selected work" />
          ) : (
            <div className="project-stack">
              {featuredProjects.map((project) => (
                <ProjectCard
                  key={project.path}
                  project={project as { frontmatter: ProjectFrontmatter }}
                  featured
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="practice-stage section-pad">
        <div className="page-shell practice-grid">
          <div className="practice-statement">
            <span aria-hidden="true">BUILD</span>
            <h2>One product mind, across the whole stack.</h2>
          </div>
          <div className="practice-list">
            <Capability
              number="Frontend"
              title="Interfaces with a clear reading order"
              copy="React and TypeScript shaped around accessible states, useful feedback, and deliberate motion."
              items="React / TypeScript / Motion / Accessibility"
            />
            <Capability
              number="Backend"
              title="Business rules with visible boundaries"
              copy="Java and Spring Boot services that keep domain behavior explicit, testable, and ready to change."
              items="Java / Spring Boot / PostgreSQL / REST"
            />
            <Capability
              number="Delivery"
              title="Workflows another person can follow"
              copy="Containers, tests, and documentation that turn delivery into a repeatable part of the product."
              items="Docker / Git / CI / Documentation"
            />
          </div>
        </div>
      </section>

      <section className="manifesto-stage section-pad">
        <div className="page-shell manifesto-inner">
          <p>Good software should make the problem clearer.</p>
          <div className="manifesto-word" aria-hidden="true">
            CLEAR
          </div>
          <ArrowLink to="/about">About my approach</ArrowLink>
        </div>
      </section>

      <section className="reading-stage section-pad">
        <div className="page-shell">
          <div className="reading-heading">
            <Kicker>Technical writing</Kicker>
            <h2>Ideas tested in the build.</h2>
            <p>Notes on architecture, UI engineering, and the decisions behind maintainable software.</p>
          </div>
          <div className="post-grid kinetic-post-grid">
            {latestPosts.map((post) => (
              <PostCard
                key={post.path}
                post={post as { frontmatter: BlogPostFrontmatter; body: string }}
              />
            ))}
          </div>
          <ArrowLink to="/blog">Read notes</ArrowLink>
        </div>
      </section>

      <section className="contact-cta section-pad">
        <div className="page-shell cta-inner">
          <h2>Bring me the difficult part.</h2>
          <LinkButton to="/contact" variant="secondary" size="lg">
            Contact <ArrowRight size={18} />
          </LinkButton>
        </div>
      </section>
    </>
  );
}

export function ProjectsPage() {
  const { data: projects, isLoading } = usePublicDocuments('projects');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All work');
  const [technology, setTechnology] = useState('All technologies');
  const allProjects = (projects ?? []) as Array<{
    frontmatter: ProjectFrontmatter;
    path: string;
    body: string;
  }>;
  const types = [
    'All work',
    ...Array.from(new Set(allProjects.map((item) => item.frontmatter.projectType))),
  ];
  const technologies = [
    'All technologies',
    ...Array.from(new Set(allProjects.flatMap((item) => item.frontmatter.technologies))),
  ];
  const filtered = allProjects.filter((item) => {
    const text = `${item.frontmatter.title} ${item.frontmatter.description}`.toLowerCase();
    return (
      (!search || text.includes(search.toLowerCase())) &&
      (type === 'All work' || item.frontmatter.projectType === type) &&
      (technology === 'All technologies' || item.frontmatter.technologies.includes(technology))
    );
  });
  const featured = filtered.filter((item) => item.frontmatter.featured);
  const regular = filtered.filter((item) => !item.frontmatter.featured);
  return (
    <div className="page-shell page-top">
      <Seo
        title="Projects"
        description="Selected full-stack projects by Ignacio Osella."
        path="/projects"
      />
      <div className="page-intro">
        <Kicker>Work archive</Kicker>
        <h1>Systems with clear edges.</h1>
        <p>
          Product interfaces, business systems, and experiments built around useful details and explicit boundaries.
        </p>
      </div>
      <div className="filter-bar">
        <SearchField value={search} onChange={setSearch} placeholder="Search projects" />
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          aria-label="Filter by project type"
        >
          {types.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={technology}
          onChange={(event) => setTechnology(event.target.value)}
          aria-label="Filter by technology"
        >
          {technologies.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try a different keyword or remove a filter."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setType('All work');
                setTechnology('All technologies');
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          {featured.length > 0 && (
            <section className="listing-section">
              <p className="listing-label">Featured projects</p>
              <div className="project-grid">
                {featured.map((project, index) => (
                  <ProjectCard key={project.path} project={project} featured={index === 0} />
                ))}
              </div>
            </section>
          )}
          {regular.length > 0 && (
            <section className="listing-section">
              <p className="listing-label">More work</p>
              <div className="project-grid project-grid-regular">
                {regular.map((project) => (
                  <ProjectCard key={project.path} project={project} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export function ProjectPage() {
  const { slug } = useParams();
  const { data: project, isLoading } = usePublicProject(slug);
  const { data: all } = usePublicDocuments('projects');
  if (isLoading) return <LoadingState />;
  if (!project)
    return <ContentError message="This project is not published or could not be found." />;
  const item = project.frontmatter;
  const index = (all ?? []).findIndex((doc) => doc.path === project.path);
  const previous = all?.[index - 1];
  const next = all?.[index + 1];
  return (
    <article className="case-study page-top">
      <Seo title={item.title} description={item.description} path={`/projects/${item.slug}`} />
      <div className="page-shell">
        <Link className="back-link" to="/projects">
          <ArrowLeft size={15} /> Back to projects
        </Link>
        <div className="case-header">
          <div>
            <Badge tone="accent">{item.projectType}</Badge>
            <h1>{item.title}</h1>
            <p>{item.description}</p>
          </div>
          <div className="case-meta-grid">
            <Meta label="Role" value={item.role} />
            <Meta label="Duration" value={item.duration} />
            <Meta label="Status" value={item.status} />
          </div>
        </div>
        <ContentVisual slug={item.slug} />
        <div className="case-lower">
          <aside>
            <TableOfContents content={project.body} />
            <div className="case-links">
              {item.repositoryUrl && (
                <a href={item.repositoryUrl} target="_blank" rel="noreferrer">
                  Repository <ArrowUpRightIcon />
                </a>
              )}
              {item.liveUrl && (
                <a href={item.liveUrl} target="_blank" rel="noreferrer">
                  Live project <ArrowUpRightIcon />
                </a>
              )}
            </div>
          </aside>
          <div className="case-content">
            <MarkdownRenderer content={project.body} />
          </div>
        </div>
        <div className="case-footer">
          <div>
            <span className="muted-label">Built with</span>
            <div className="tag-row">
              {item.technologies.map((technology) => (
                <Badge key={technology}>{technology}</Badge>
              ))}
            </div>
          </div>
          <div className="prev-next">
            {previous ? (
              <Link to={`/projects/${previous.frontmatter.slug}`}>
                <span>Previous project</span>
                <strong>{previous.frontmatter.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`/projects/${next.frontmatter.slug}`}>
                <span>
                  Next project <ArrowRight size={14} />
                </span>
                <strong>{next.frontmatter.title}</strong>
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="muted-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function BlogPage() {
  const { data: posts, isLoading } = usePublicDocuments('posts');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [tag, setTag] = useState('All tags');
  const allPosts = (posts ?? []) as Array<{
    frontmatter: BlogPostFrontmatter;
    path: string;
    body: string;
  }>;
  const categories = [
    'All categories',
    ...Array.from(new Set(allPosts.map((post) => post.frontmatter.category))),
  ];
  const tags = [
    'All tags',
    ...Array.from(new Set(allPosts.flatMap((post) => post.frontmatter.tags))),
  ];
  const filtered = allPosts.filter((post) => {
    const text = `${post.frontmatter.title} ${post.frontmatter.description}`.toLowerCase();
    return (
      (!search || text.includes(search.toLowerCase())) &&
      (category === 'All categories' || post.frontmatter.category === category) &&
      (tag === 'All tags' || post.frontmatter.tags.includes(tag))
    );
  });
  const featured = filtered.find((post) => post.frontmatter.featured);
  const rest = filtered.filter((post) => post.path !== featured?.path);
  return (
    <div className="page-shell page-top">
      <Seo
        title="Journal"
        description="Technical notes on React, Spring Boot, architecture, and product craft."
        path="/blog"
      />
      <div className="page-intro page-intro-wide">
        <Kicker>Technical writing</Kicker>
        <h1>Writing from the work.</h1>
        <p>
          Notes on useful interfaces, explicit systems, and the decisions that make software easier to maintain.
        </p>
      </div>
      <div className="filter-bar blog-filters">
        <SearchField value={search} onChange={setSearch} placeholder="Search notes" />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          aria-label="Filter by tag"
        >
          {tags.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notes found"
          description="Try a different keyword or remove a filter."
        />
      ) : (
        <>
          {featured && (
            <section className="featured-post">
              <PostCard post={featured} featured />
            </section>
          )}
          <section className="post-list">
            {rest.map((post) => (
              <PostCard key={post.path} post={post} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const { data: post, isLoading } = usePublicPost(slug);
  const { data: all } = usePublicDocuments('posts');
  const [copied, setCopied] = useState(false);
  if (isLoading) return <LoadingState />;
  if (!post) return <ContentError message="This article is not published or could not be found." />;
  const item = post.frontmatter;
  const index = (all ?? []).findIndex((doc) => doc.path === post.path);
  const previous = all?.[index - 1];
  const next = all?.[index + 1];
  const related =
    all
      ?.filter((doc) => doc.path !== post.path && doc.frontmatter.category === item.category)
      .slice(0, 2) ?? [];
  return (
    <article className="article page-top">
      <Seo title={item.title} description={item.description} path={`/blog/${item.slug}`} />
      <div className="page-shell">
        <Link className="back-link" to="/blog">
          <ArrowLeft size={15} /> Back to journal
        </Link>
        <header className="article-header">
          <Badge tone="accent">{item.category}</Badge>
          <h1>{item.title}</h1>
          <p>{item.description}</p>
          <div className="article-meta">
            <span>{formatDate(item.publishedAt)}</span>
            <span>{readingTime(post.body)} min read</span>
            <span>{item.tags.join(' / ')}</span>
            <button
              className="copy-link"
              onClick={() => {
                void navigator.clipboard?.writeText(window.location.href);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1400);
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied link' : 'Copy link'}
            </button>
          </div>
        </header>
        <div className="article-layout">
          <aside>
            <TableOfContents content={post.body} />
          </aside>
          <div className="article-content">
            <MarkdownRenderer content={post.body} />
          </div>
        </div>
        <div className="article-nav">
          {previous ? (
            <Link to={`/blog/${previous.frontmatter.slug}`}>
              <span>Previous note</span>
              <strong>{previous.frontmatter.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/blog/${next.frontmatter.slug}`}>
              <span>
                Next note <ArrowRight size={14} />
              </span>
              <strong>{next.frontmatter.title}</strong>
            </Link>
          )}
        </div>
        {related.length > 0 && (
          <section className="related-section">
            <SectionHeading kicker="Keep reading" title="More on this thread." />
            <div className="post-grid">
              {related.map((item) => (
                <PostCard
                  key={item.path}
                  post={item as { frontmatter: BlogPostFrontmatter; body: string }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export function AboutPage() {
  const { data: page, isLoading } = usePublicPage('about');
  if (isLoading) return <LoadingState />;
  if (!page) return <ContentError />;
  return (
    <div className="page-shell page-top">
      <Seo title="About" description={page.frontmatter.description} path="/about" />
      <div className="page-intro">
        <Kicker>About Ignacio</Kicker>
        <h1>I make complex work legible.</h1>
        <p>{page.frontmatter.description}</p>
      </div>
      <div className="page-reading-layout">
        <TableOfContents content={page.body} />
        <div className="page-reading-content">
          <MarkdownRenderer content={page.body} />
        </div>
      </div>
    </div>
  );
}

const contactSchema = z.object({
  name: z.string().min(2, 'Tell me your name.'),
  email: z.string().email('Enter a valid email address.'),
  company: z.string().optional(),
  subject: z.string().min(4, 'Add a short subject.'),
  message: z
    .string()
    .min(20, 'A little more detail will help.')
    .max(1200, 'Keep the message under 1200 characters.'),
});
type ContactValues = z.infer<typeof contactSchema>;
export function ContactPage() {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });
  const message = watch('message') ?? '';
  const onSubmit = async (values: ContactValues) => {
    setState('submitting');
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (values.email.includes('error')) {
      setState('error');
      return;
    }
    setState('success');
    reset();
  };
  return (
    <div className="page-shell page-top">
      <Seo
        title="Contact"
        description="Get in touch with Ignacio Osella about a product, role, or thoughtful problem."
        path="/contact"
      />
      <div className="contact-layout">
        <div className="contact-intro">
          <Kicker>Contact</Kicker>
          <h1>
            Let's make something <em>useful.</em>
          </h1>
          <p>
            If you are working on a product that needs a careful frontend, a clearer system, or
            simply a second pair of eyes, I would love to hear about it.
          </p>
          <div className="contact-details">
            <a href="mailto:hello@ignacioosella.dev">
              <Mail size={17} />
              hello@ignacioosella.dev
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              <Linkedin size={17} />
              LinkedIn <ArrowUpRightIcon />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <Github size={17} />
              GitHub <ArrowUpRightIcon />
            </a>
          </div>
        </div>
        <div className="contact-form-wrap">
          {state === 'success' ? (
            <div className="success-state">
              <div className="success-icon">
                <Check />
              </div>
              <Kicker>Message received</Kicker>
              <h2>Thank you for reaching out.</h2>
              <p>
                This mock form is wired for a future backend. For now, the message has been safely
                held in the frontend state.
              </p>
              <Button variant="secondary" onClick={() => setState('idle')}>
                Send another message
              </Button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-row">
                <Field label="Name" error={errors.name?.message}>
                  <Input {...register('name')} placeholder="Your name" />
                </Field>
                <Field label="Email" error={errors.email?.message}>
                  <Input {...register('email')} type="email" placeholder="you@example.com" />
                </Field>
              </div>
              <div className="form-row">
                <Field label="Company" hint="Optional">
                  <Input {...register('company')} placeholder="Where you work" />
                </Field>
                <Field label="Subject" error={errors.subject?.message}>
                  <Input {...register('subject')} placeholder="What is on your mind?" />
                </Field>
              </div>
              <Field
                label="Message"
                error={errors.message?.message}
                hint={`${message.length} / 1200`}
              >
                <Textarea
                  {...register('message')}
                  placeholder="Tell me a little about the problem you are solving."
                  rows={7}
                />
              </Field>
              {state === 'error' && (
                <p className="form-alert" role="alert">
                  Something went wrong while sending. Please try again or email me directly.
                </p>
              )}
              <Button type="submit" size="lg" disabled={state === 'submitting'}>
                {state === 'submitting' ? (
                  'Sending…'
                ) : (
                  <>
                    Send message <Send size={16} />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  if (session) {
    navigate('/admin');
    return null;
  }
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, remember);
      navigate(params.get('returnTo') ?? '/admin');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-page">
      <div className="login-aside">
        <Link to="/" className="wordmark">
          <span className="wordmark-mark">IO</span>
          <span>Ignacio Osella</span>
        </Link>
        <div>
          <p className="kicker">Private workspace</p>
          <h1>
            Content, with
            <br />
            <em>clear edges.</em>
          </h1>
          <p>Draft, review, and prepare the Markdown that powers the public site.</p>
        </div>
        <span className="login-aside-foot">Frontend mock / future Spring Boot API</span>
      </div>
      <div className="login-panel">
        <Link className="login-back" to="/">
          <ArrowLeft size={15} /> Back to website
        </Link>
        <form onSubmit={submit} className="login-form">
          <div>
            <Kicker>Studio login</Kicker>
            <h2>Welcome back.</h2>
            <p>Use any valid email and a six-character password in this frontend mock.</p>
          </div>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </Field>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember this session
          </label>
          {error && (
            <p className="form-alert" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Enter studio'}
          </Button>
          <p className="security-note">
            <Sparkles size={15} /> Demo only. Production authentication belongs in Spring Boot with
            secure HttpOnly cookies.
          </p>
        </form>
      </div>
    </div>
  );
}
