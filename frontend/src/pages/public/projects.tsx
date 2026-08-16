import { lazy, Suspense } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ProjectIndex } from '@/components/ProjectIndex';
import { ContentError } from '@/components/RouteStates';
import { Seo } from '@/components/Seo';
import { LoadingState } from '@/components/ui';
import { usePublicProject, usePublicProjects } from '@/hooks/usePublicContent';
import { createRecordCode, createRevision } from '@/lib/archive';

const MarkdownRenderer = lazy(() =>
  import('@/components/MarkdownRenderer').then((module) => ({ default: module.MarkdownRenderer })),
);
const TableOfContents = lazy(() =>
  import('@/components/MarkdownRenderer').then((module) => ({ default: module.TableOfContents })),
);

export function ProjectsPage() {
  const { data: projects, isLoading } = usePublicProjects();

  return (
    <div className="v2-page">
      <Seo title="Projects" description="Selected work by Ignacio Osella — dependable backend systems and the interfaces that ship them." path="/projects" />
      {isLoading ? (
        <div className="v2-shell v2-state-wrap v2-page-top">
          <LoadingState label="Loading projects" />
        </div>
      ) : (
        <ProjectIndex projects={projects ?? []} />
      )}
    </div>
  );
}

export function ProjectPage() {
  const { slug } = useParams();
  const { data: project, isLoading } = usePublicProject(slug);
  const { data: all } = usePublicProjects();
  if (isLoading) return <LoadingState label="Loading project" />;
  if (!project) return <ContentError message="This project is not published or could not be found." />;

  const item = project.frontmatter;
  const list = all ?? [];
  const index = list.findIndex((document) => document.path === project.path);
  const next = list[index + 1] ?? list[0];

  return (
    <article className="v2-case v2-page-top">
      <Seo title={item.title} description={item.description} path={`/projects/${item.slug}`} />
      <div className="v2-shell">
        <Link className="v2-back" to="/projects">
          <ArrowLeft size={16} /> Projects
        </Link>
        <header className="v2-case-header">
          <div className="v2-record-stamp">
            <strong>{createRecordCode(item.title, Math.max(index, 0))}</strong>
            <span>OS–P{String(Math.max(index, 0) + 1).padStart(2, '0')}</span>
            <span>{createRevision(item.updatedAt)}</span>
            <span>{item.status}</span>
          </div>
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
  if (!url) return false;
  try {
    const { host } = new URL(url);
    // Synthetic seed content uses example.com placeholders; hide those until
    // real repository/live URLs are authored into the frontmatter.
    return host !== 'example.com' && !host.endsWith('.example.com');
  } catch {
    return false;
  }
}