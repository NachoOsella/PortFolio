import { Link } from 'react-router-dom';
import { ArrowUpRight, Folder } from 'lucide-react';
import { useContentFiles } from '@/hooks/useRepositories';
import { LinkButton } from '@/components/ui';
import { SummaryRow } from './shared';

export function AdminContent() {
  const { data: files } = useContentFiles();
  return (
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">Content workspace</p>
          <h2>One source of truth.</h2>
          <p>Markdown files stay canonical from draft to published page.</p>
        </div>
        <LinkButton to="/admin/files">
          <Folder size={16} />
          Browse files
        </LinkButton>
      </div>
      <div className="content-principles">
        <div>
          <span className="principle-number">01</span>
          <h3>Write in Markdown</h3>
          <p>Keep prose and metadata portable, reviewable, and ready for the future server.</p>
        </div>
        <div>
          <span className="principle-number">02</span>
          <h3>Preview the real thing</h3>
          <p>The admin preview uses the same renderer as the public website.</p>
        </div>
        <div>
          <span className="principle-number">03</span>
          <h3>Sync deliberately</h3>
          <p>Save locally, review the working tree, then push changes to GitHub explicitly.</p>
        </div>
      </div>
      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">All content</p>
            <h3>{files?.length ?? 0} Markdown files</h3>
          </div>
          <Link to="/admin/files">
            File manager <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="collection-summary">
          <SummaryRow
            label="Projects"
            count={files?.filter((file) => file.collection === 'projects').length ?? 0}
            to="/admin/projects"
          />
          <SummaryRow
            label="Blog posts"
            count={files?.filter((file) => file.collection === 'posts').length ?? 0}
            to="/admin/posts"
          />
          <SummaryRow
            label="Pages"
            count={files?.filter((file) => file.collection === 'pages').length ?? 0}
            to="/admin/pages"
          />
        </div>
      </section>
    </div>
  );
}