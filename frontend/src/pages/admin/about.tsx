import { FileText, Pencil, Plus } from 'lucide-react';
import { LinkButton, Badge, EmptyState, LoadingState } from '@/components/ui';
import { useContentFiles } from '@/hooks/useRepositories';

export function AdminAbout() {
  const { data: files, isLoading } = useContentFiles({ collection: 'pages', search: 'about' });
  const about = files?.find((file) => file.slug === 'about');

  return (
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">Content / About me</p>
          <h2>About me</h2>
          <p>The page that introduces your background, practice, and current focus.</p>
        </div>
        <LinkButton to="/admin/about/edit">
          {about ? <Pencil size={15} /> : <Plus size={15} />}
          {about ? 'Edit About' : 'Create About'}
        </LinkButton>
      </div>

      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">Dedicated page</p>
            <h3>{about ? about.title : 'About page is not created yet'}</h3>
          </div>
          {about ? <Badge tone="success">{about.status}</Badge> : null}
        </div>
        {isLoading ? (
          <LoadingState label="Loading About page" />
        ) : about ? (
          <div className="file-row">
            <span className="file-icon">
              <FileText size={15} />
            </span>
            <div>
              <strong>{about.title}</strong>
              <span>{about.path}</span>
            </div>
            <LinkButton to="/admin/about/edit" variant="secondary" size="sm">
              Edit
            </LinkButton>
          </div>
        ) : (
          <EmptyState
            title="Create your About page"
            description="It will be saved as content/pages/about.md and rendered at /about."
            action={
              <LinkButton to="/admin/about/edit">
                <Plus size={15} />
                Create About
              </LinkButton>
            }
          />
        )}
      </section>
    </div>
  );
}
