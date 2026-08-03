import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContentIndexControls } from '@/components/ContentIndexControls';
import { EmptyState } from '@/components/ui';
import type { ProjectDocument } from '@/types';
import { ProjectDiagram } from '@/components/ProjectDiagram';
import { createRecordCode, createRevision, getRecordTone } from '@/lib/archive';

export function ProjectIndex({ projects }: { projects: ProjectDocument[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recommended');
  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects
      .filter((project) => {
        if (!query) return true;
        const item = project.frontmatter;
        return [
          item.title,
          item.description,
          item.projectType,
          item.role,
          item.duration,
          item.status,
          ...item.technologies,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .slice()
      .sort((a, b) => {
        if (sort === 'title') return a.frontmatter.title.localeCompare(b.frontmatter.title);
        if (sort === 'recent') {
          return b.frontmatter.updatedAt.localeCompare(a.frontmatter.updatedAt);
        }
        return Number(a.frontmatter.displayOrder ?? 99) - Number(b.frontmatter.displayOrder ?? 99);
      });
  }, [projects, search, sort]);

  return (
    <section className="v2-index-page" aria-labelledby="projects-index-heading">
      <div className="v2-shell">
        <header className="v2-index-header">
          <p className="v2-label">Projects</p>
          <h1 id="projects-index-heading">Built as systems, not surfaces.</h1>
          <p>Selected work across product interfaces, dependable services and the decisions between them.</p>
        </header>
        <ContentIndexControls
          id="project-index-filters"
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          sortOptions={[
            { value: 'recommended', label: 'Recommended' },
            { value: 'recent', label: 'Recently updated' },
            { value: 'title', label: 'Title A–Z' },
          ]}
          resultCount={visibleProjects.length}
          resultLabel={visibleProjects.length === 1 ? 'project' : 'projects'}
        />

        {visibleProjects.length ? (
          <div className="v2-project-register">
            {visibleProjects.map((project, index) => {
              const item = project.frontmatter;
              const tone = getRecordTone(item.slug, item.ink);
              const code = createRecordCode(item.title, index);
              return (
                <article className={`v2-project-record v2-tone-${tone}`} key={project.path}>
                  <Link to={`/projects/${item.slug}`} className="v2-project-record-link">
                    <header className="v2-project-record-head">
                      <strong>{code}</strong>
                      <span>OS–P{String(index + 1).padStart(2, '0')}</span>
                      <span>{createRevision(item.updatedAt)}</span>
                      <span>{item.status}</span>
                    </header>
                    <div className="v2-project-index-artwork" aria-hidden="true">
                      <span className="v2-project-type">{code} / {item.projectType}</span>
                      <ProjectDiagram slug={item.slug} title={item.title} />
                      <div className="v2-project-sweep">
                        <span>{item.technologies.slice(0, 3).join(' / ')}</span>
                      </div>
                    </div>
                    <div className="v2-project-index-copy">
                      <div>
                        <span>{item.role} / {item.duration}</span>
                        <h2>{item.title}</h2>
                        <p>{item.description}</p>
                      </div>
                      <span className="v2-project-open" aria-hidden="true">
                        <ArrowUpRight size={22} strokeWidth={1.6} />
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No projects found"
            description="Try a different search term or return to the complete project index."
          />
        )}
      </div>
    </section>
  );
}
