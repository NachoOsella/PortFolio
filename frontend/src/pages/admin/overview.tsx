import { Link } from 'react-router-dom';
import {
  Archive,
  ArrowUpRight,
  CircleAlert,
  FilePlus2,
  Folder,
  GitCommitHorizontal,
  Plus,
} from 'lucide-react';
import { relativeDate } from '@/lib/content';
import { useContentFiles, useGitHistory, useGitStatus } from '@/hooks/useRepositories';
import { EmptyState, LinkButton, LoadingState, StatusDot } from '@/components/ui';
import { AdminStat, FileRow } from './shared';

const todayLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}).format(new Date());

export function AdminOverview() {
  const { data: files, isLoading } = useContentFiles();
  const { data: git } = useGitStatus();
  const { data: commits } = useGitHistory();
  if (isLoading) return <LoadingState label="Loading workspace" />;
  const publishedProjects =
    files?.filter((file) => file.collection === 'projects' && file.status === 'published').length ??
    0;
  const publishedPosts =
    files?.filter((file) => file.collection === 'posts' && file.status === 'published').length ?? 0;
  const drafts = files?.filter((file) => file.status === 'draft').length ?? 0;
  const unsynced = files?.filter((file) => file.synchronizationStatus !== 'synced').length ?? 0;
  return (
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">Ledger opened / {todayLabel}</p>
          <h2>Content register.</h2>
          <p>Files, publication state and repository activity in one operational record.</p>
        </div>
        <LinkButton to="/admin/projects/new">
          <Plus size={16} />
          New project
        </LinkButton>
      </div>
      <div className="stat-grid">
        <AdminStat
          label="Markdown files"
          value={files?.length ?? 0}
          detail="Across 3 collections"
          icon={Archive}
        />
        <AdminStat
          label="Published projects"
          value={publishedProjects}
          detail="Public case studies"
          icon={Folder}
        />
        <AdminStat
          label="Published posts"
          value={publishedPosts}
          detail="Public journal notes"
          icon={FilePlus2}
        />
        <AdminStat
          label="Draft content"
          value={drafts}
          detail="Needs attention"
          icon={CircleAlert}
          tone={drafts ? 'amber' : 'default'}
        />
      </div>
      <div className="overview-grid">
        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Content requiring attention</p>
              <h3>Local changes</h3>
            </div>
            <Link to="/admin/files">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {files
            ?.filter((file) => file.synchronizationStatus !== 'synced')
            .slice(0, 5)
            .map((file) => (
              <FileRow key={file.path} file={file} />
            ))}
          {!unsynced && (
            <EmptyState
              title="Everything is in sync"
              description="No local changes need your attention."
            />
          )}
        </section>
        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Repository</p>
              <h3>Recent commits</h3>
            </div>
            <Link to="/admin/git">
              Open Git <ArrowUpRight size={14} />
            </Link>
          </div>
          {commits?.slice(0, 4).map((commit) => (
            <div className="commit-row" key={commit.id}>
              <span className="commit-mark">
                <GitCommitHorizontal size={15} />
              </span>
              <div>
                <strong>{commit.message}</strong>
                <span>
                  {relativeDate(commit.createdAt)} · {commit.files.length} file
                  {commit.files.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
          <div className="repo-state">
            <StatusDot tone={git?.ahead ? 'amber' : 'green'} />
            <span>
              {git?.ahead
                ? `${git.ahead} commit${git.ahead > 1 ? 's' : ''} ready to push`
                : 'Remote is up to date'}
            </span>
          </div>
        </section>
      </div>
      <section className="quick-actions">
        <p className="panel-kicker">Quick actions</p>
        <div>
          <Link to="/admin/projects/new">
            <Plus size={17} />
            <span>New project</span>
          </Link>
          <Link to="/admin/posts/new">
            <Plus size={17} />
            <span>New post</span>
          </Link>
          <Link to="/admin/about">
            <FilePlus2 size={17} />
            <span>Edit about</span>
          </Link>
          <Link to="/admin/git">
            <GitCommitHorizontal size={17} />
            <span>Review Git</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
