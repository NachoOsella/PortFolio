import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Mail, Send } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { HeroScene } from '@/components/v2/HeroScene';
import { ReadingProgress } from '@/components/v2/ReadingProgress';
import { SignatureMark } from '@/components/v2/SignatureMark';
import { ContentError } from '@/components/RouteStates';
import { Seo } from '@/components/Seo';
import { Button, EmptyState, Field, Input, LoadingState, Textarea } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  usePublicDocuments,
  usePublicPage,
  usePublicPost,
  usePublicProject,
} from '@/hooks/usePublicContent';
import { formatDate, readingTime } from '@/lib/content';
import type { BlogPostFrontmatter, ProjectFrontmatter } from '@/types';

const HorizontalProjects = lazy(() =>
  import('@/components/v2/HorizontalProjects').then((module) => ({ default: module.HorizontalProjects })),
);
const WritingIndex = lazy(() =>
  import('@/components/v2/WritingIndex').then((module) => ({ default: module.WritingIndex })),
);
const MarkdownRenderer = lazy(() =>
  import('@/components/MarkdownRenderer').then((module) => ({ default: module.MarkdownRenderer })),
);
const TableOfContents = lazy(() =>
  import('@/components/MarkdownRenderer').then((module) => ({ default: module.TableOfContents })),
);

type ProjectDocument = {
  path: string;
  body: string;
  frontmatter: ProjectFrontmatter;
};

type PostDocument = {
  path: string;
  body: string;
  frontmatter: BlogPostFrontmatter;
};

export function HomePage() {
  const { data: projectData, isLoading: projectsLoading } = usePublicDocuments('projects');
  const { data: postData, isLoading: postsLoading } = usePublicDocuments('posts');
  const projects = ((projectData ?? []) as ProjectDocument[])
    .filter((project) => project.frontmatter.featured)
    .sort((a, b) => Number(a.frontmatter.displayOrder ?? 99) - Number(b.frontmatter.displayOrder ?? 99));
  const posts = ((postData ?? []) as PostDocument[])
    .slice()
    .sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt))
    .slice(0, 4);

  return (
    <>
      <span
        className="v2-direction-contract"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html:
            '<!-- THESIS: A premium minimal portfolio shaped by technical precision, refusing fake terminals and generic card grids. OWN-WORLD: Gruvbox Material Dark Hard, warm foreground type, precise hairlines, angular IO geometry, and full-field color moments. STORY: Meet the developer, move through selected systems, understand the practice, read the thinking, and make contact. FIRST VIEWPORT: Two-line kinetic type leads while a restrained angular field reacts to the pointer; work and contact actions remain visible. FORM: Premium minimal with subtle Arch and terminal culture, staged through a pinned horizontal project gallery and coordinated motion. -->',
        }}
      />
      <Seo
        title="Full-stack product developer"
        description="Ignacio Osella builds clear interfaces and dependable systems with React, TypeScript, Java, and Spring Boot."
        path="/"
      />
      <HeroScene />

      {projectsLoading ? (
        <div className="v2-shell v2-state-wrap">
          <LoadingState label="Loading selected work" />
        </div>
      ) : (
        <Suspense fallback={<div className="v2-shell v2-state-wrap"><LoadingState label="Preparing project gallery" /></div>}>
          <HorizontalProjects projects={projects} />
        </Suspense>
      )}

      {postsLoading ? (
        <div className="v2-shell v2-state-wrap">
          <LoadingState label="Loading technical writing" />
        </div>
      ) : (
        <Suspense fallback={<div className="v2-shell v2-state-wrap"><LoadingState label="Preparing technical writing" /></div>}>
          <WritingIndex posts={posts} />
        </Suspense>
      )}
    </>
  );
}

export function ProjectsPage() {
  const { data, isLoading } = usePublicDocuments('projects');
  const projects = ((data ?? []) as ProjectDocument[]).sort(
    (a, b) => Number(a.frontmatter.displayOrder ?? 99) - Number(b.frontmatter.displayOrder ?? 99),
  );

  return (
    <div className="v2-page v2-page-top">
      <Seo title="Projects" description="Selected full-stack projects by Ignacio Osella." path="/projects" />
      {isLoading ? (
        <div className="v2-shell v2-state-wrap v2-page-top">
          <LoadingState label="Loading projects" />
        </div>
      ) : projects.length ? (
        <Suspense fallback={<div className="v2-shell v2-state-wrap"><LoadingState label="Preparing project gallery" /></div>}>
          <HorizontalProjects projects={projects} />
        </Suspense>
      ) : (
        <div className="v2-shell v2-state-wrap v2-page-top">
          <EmptyState title="No projects yet" description="Published projects will appear here." />
        </div>
      )}
    </div>
  );
}

export function ProjectPage() {
  const { slug } = useParams();
  const { data: project, isLoading } = usePublicProject(slug);
  const { data: allData } = usePublicDocuments('projects');
  if (isLoading) return <LoadingState label="Loading project" />;
  if (!project) return <ContentError message="This project is not published or could not be found." />;

  const item = project.frontmatter;
  const all = (allData ?? []) as ProjectDocument[];
  const index = all.findIndex((document) => document.path === project.path);
  const next = all[index + 1] ?? all[0];

  return (
    <article className="v2-case v2-page-top">
      <Seo title={item.title} description={item.description} path={`/projects/${item.slug}`} />
      <div className="v2-shell">
        <Link className="v2-back" to="/projects">
          <ArrowLeft size={16} /> Projects
        </Link>
        <header className="v2-case-header">
          <h1>{item.title}</h1>
          <p>{item.description}</p>
          <dl>
            <div><dt>Type</dt><dd>{item.projectType}</dd></div>
            <div><dt>Role</dt><dd>{item.role}</dd></div>
            <div><dt>Duration</dt><dd>{item.duration}</dd></div>
            <div><dt>Status</dt><dd>{item.status}</dd></div>
          </dl>
        </header>
        <div className="v2-reading-layout">
          <aside className="v2-reading-rail">
            <Suspense fallback={null}><TableOfContents content={project.body} /></Suspense>
            <div className="v2-case-links">
              {isRealProjectUrl(item.repositoryUrl) ? <a href={item.repositoryUrl} target="_blank" rel="noreferrer">Repository <ArrowUpRight size={15} /></a> : null}
              {isRealProjectUrl(item.liveUrl) ? <a href={item.liveUrl} target="_blank" rel="noreferrer">Live project <ArrowUpRight size={15} /></a> : null}
            </div>
          </aside>
          <Suspense fallback={<LoadingState label="Preparing project story" />}><MarkdownRenderer content={project.body} /></Suspense>
        </div>
        {next ? (
          <Link className="v2-next" to={`/projects/${next.frontmatter.slug}`}>
            <span>Next project</span>
            <strong>{next.frontmatter.title}</strong>
            <ArrowRight size={24} />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function isRealProjectUrl(url?: string) {
  return Boolean(url && !url.includes('example'));
}

export function BlogPage() {
  const { data, isLoading } = usePublicDocuments('posts');
  const posts = ((data ?? []) as PostDocument[])
    .slice()
    .sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt));

  return (
    <div className="v2-page v2-page-top">
      <Seo title="Blog" description="Technical writing on product engineering and maintainable systems." path="/blog" />
      {isLoading ? (
        <div className="v2-shell v2-state-wrap"><LoadingState label="Loading technical writing" /></div>
      ) : posts.length ? (
        <Suspense fallback={<div className="v2-shell v2-state-wrap"><LoadingState label="Preparing technical writing" /></div>}>
          <WritingIndex posts={posts} />
        </Suspense>
      ) : (
        <div className="v2-shell v2-state-wrap"><EmptyState title="No articles yet" description="Published writing will appear here." /></div>
      )}
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const { data: post, isLoading } = usePublicPost(slug);
  const { data: allData } = usePublicDocuments('posts');
  const [copied, setCopied] = useState(false);
  if (isLoading) return <LoadingState label="Loading article" />;
  if (!post) return <ContentError message="This article is not published or could not be found." />;

  const item = post.frontmatter;
  const all = (allData ?? []) as PostDocument[];
  const index = all.findIndex((document) => document.path === post.path);
  const next = all[index + 1] ?? all[0];

  return (
    <article className="v2-article v2-page-top">
      <ReadingProgress />
      <Seo title={item.title} description={item.description} path={`/blog/${item.slug}`} />
      <div className="v2-shell">
        <Link className="v2-back" to="/blog"><ArrowLeft size={16} /> Blog</Link>
        <header className="v2-article-header">
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

export function AboutPage() {
  const { data: page, isLoading } = usePublicPage('about');
  if (isLoading) {
    return <div className="v2-shell v2-page-top v2-state-wrap"><LoadingState label="Loading about page" /></div>;
  }
  if (!page) {
    return <div className="v2-shell v2-page-top v2-state-wrap"><ContentError /></div>;
  }

  return (
    <div className="v2-about v2-page-top">
      <Seo title="About" description={page.frontmatter.description} path="/about" />
      <div className="v2-shell">
        <header className="v2-page-header">
          <p className="v2-label">About Ignacio</p>
          <h1>Technical work, made legible.</h1>
          <p>{page.frontmatter.description}</p>
        </header>
        <div className="v2-reading-layout">
          <aside className="v2-reading-rail">
            <Suspense fallback={null}><TableOfContents content={page.body} /></Suspense>
          </aside>
          <Suspense fallback={<LoadingState label="Preparing about page" />}><MarkdownRenderer content={page.body} /></Suspense>
        </div>
      </div>
    </div>
  );
}

const contactSchema = z.object({
  name: z.string().min(2, 'Tell me your name.'),
  email: z.string().email('Enter a valid email address.'),
  subject: z.string().min(4, 'Add a short subject.'),
  message: z.string().min(20, 'A little more detail will help.').max(1200, 'Keep the message under 1200 characters.'),
});
type ContactValues = z.infer<typeof contactSchema>;

export function ContactPage() {
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });
  const submit = (values: ContactValues) => {
    setStatus('submitting');
    const subject = encodeURIComponent(values.subject);
    const body = encodeURIComponent(`${values.message}\n\nFrom: ${values.name} <${values.email}>`);
    window.location.href = `mailto:hello@ignacioosella.dev?subject=${subject}&body=${body}`;
    setStatus('success');
    reset();
  };

  return (
    <div className="v2-contact v2-page-top">
      <Seo title="Contact" description="Contact Ignacio Osella about a product or engineering role." path="/contact" />
      <motion.div
        className="v2-shell v2-contact-layout"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="v2-contact-intro">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Make the hard part easier to see.
          </motion.h1>
          <p>Tell me what is taking shape, where the tension is, and what you need the work to make possible.</p>
          <div className="v2-contact-links">
            <a href="mailto:hello@ignacioosella.dev"><Mail size={17} /> hello@ignacioosella.dev</a>
            <span>Usually replies within two working days.</span>
          </div>
          <motion.div
            className="v2-contact-poster"
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span>Context / constraint / change</span>
            <p>Good work begins when we can name the real question.</p>
            <SignatureMark className="v2-contact-poster-mark" />
          </motion.div>
        </div>
        <motion.div
          className="v2-contact-form-wrap"
          initial={reduceMotion ? false : { opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="v2-contact-form-opening">
            <h2>Start with the version you have.</h2>
            <p>A rough note, an unresolved decision or a problem worth untangling is enough.</p>
          </div>
          {status === 'success' ? (
            <div className="v2-success" role="status">
              <Check size={28} />
              <h2>Email draft opened.</h2>
              <p>Review the message and send it from your email application.</p>
              <Button type="button" onClick={() => setStatus('idle')}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(submit)}>
              <div className="v2-contact-short-fields">
                <Field label="Your name" error={errors.name?.message}><Input {...register('name')} autoComplete="name" placeholder="How should I address you?" /></Field>
                <Field label="Email" error={errors.email?.message}><Input {...register('email')} type="email" autoComplete="email" placeholder="you@company.com" /></Field>
              </div>
              <Field label="What are we looking at?" error={errors.subject?.message}><Input {...register('subject')} placeholder="A product, a system, a difficult decision..." /></Field>
              <Field label="Give me the context" error={errors.message?.message}><Textarea {...register('message')} rows={8} placeholder="What is happening now, where does it become unclear, and what would a better outcome change?" /></Field>
              <div className="v2-contact-form-footnote">
                <span>Useful, not polished.</span>
                <span>Every message is read by Ignacio.</span>
              </div>
              {status === 'error' ? <p className="v2-form-error" role="alert">The message could not be sent. Try again or use email.</p> : null}
              <Button type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Opening email...' : <>Open email draft <Send size={16} /></>}
              </Button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export function LoginPage() {
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (session) navigate('/admin', { replace: true });
  }, [navigate, session]);

  if (session) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password, true);
      navigate(params.get('returnTo') ?? '/admin');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="v2-login v2-page-top">
      <Seo title="Studio login" description="Private portfolio content workspace." path="/login" />
      <div className="v2-shell v2-login-layout">
        <div>
          <SignatureMark />
          <p className="v2-label">Private workspace</p>
          <h1>Content with clear ownership.</h1>
          <p>The browser simulates this workflow. Authentication belongs to the future Spring Boot service.</p>
        </div>
        <form onSubmit={submit}>
          <Field label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>
          <Field label="Password"><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></Field>
          {error ? <p className="v2-form-error" role="alert">{error}</p> : null}
          <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Enter studio'}</Button>
        </form>
      </div>
    </div>
  );
}
