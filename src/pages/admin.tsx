import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  CircleAlert,
  Copy,
  Download,
  FilePlus2,
  Folder,
  GitCommitHorizontal,
  Inbox,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Server,
  Settings2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { relativeDate, suggestCommitMessage } from '@/lib/content';
import {
  useContentFile,
  useContentFiles,
  useGitAction,
  useGitHistory,
  useGitStatus,
  useImportContent,
} from '@/hooks/useRepositories';
import { contentRepository, exportDocument } from '@/repositories/contentRepository';
import { gitRepository } from '@/repositories/gitRepository';
import { downloadMarkdown, downloadMockArchive } from '@/services/download';
import { getMessages, saveMessages } from '@/services/messages';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  LinkButton,
  LoadingState,
  SearchField,
  StatusDot,
  Textarea,
} from '@/components/ui';
import type { ContentCollection, ContentFileSummary, PublicationStatus } from '@/types';

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
          <p className="admin-eyebrow">Tuesday, July 29, 2026</p>
          <h2>Good morning, Ignacio.</h2>
          <p>Here is the state of your content workspace.</p>
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
          <Link to="/admin/pages/about/edit">
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
function AdminStat({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Archive;
  tone?: 'default' | 'amber';
}) {
  return (
    <div className={`admin-stat ${tone === 'amber' ? 'stat-amber' : ''}`}>
      <div className="stat-icon">
        <Icon size={17} />
      </div>
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </div>
  );
}
function FileRow({ file }: { file: ContentFileSummary }) {
  return (
    <div className="file-row">
      <span className="file-icon">
        <FilePlus2 size={15} />
      </span>
      <div>
        <strong>{file.title}</strong>
        <span>{file.path}</span>
      </div>
      <Badge tone={file.synchronizationStatus === 'modified' ? 'warning' : 'neutral'}>
        {file.synchronizationStatus}
      </Badge>
    </div>
  );
}

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
          <p>Save locally, sync to the mock server, then review and commit changes explicitly.</p>
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
function SummaryRow({ label, count, to }: { label: string; count: number; to: string }) {
  return (
    <Link className="summary-row" to={to}>
      <span>{label}</span>
      <strong>{count}</strong>
      <ArrowUpRight size={15} />
    </Link>
  );
}

export function AdminProjects() {
  return (
    <ContentList
      collection="projects"
      title="Projects"
      description="Case studies and product experiments in Markdown."
      newLabel="New project"
    />
  );
}
export function AdminPosts() {
  return (
    <ContentList
      collection="posts"
      title="Blog posts"
      description="Technical notes, drafts, and editorial history."
      newLabel="New post"
    />
  );
}
export function AdminPages() {
  return (
    <ContentList
      collection="pages"
      title="Pages"
      description="Static pages that keep the public site grounded."
      newLabel="New page"
    />
  );
}

function ContentList({
  collection,
  title,
  description,
  newLabel,
}: {
  collection: ContentCollection;
  title: string;
  description: string;
  newLabel: string;
}) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | PublicationStatus>('all');
  const [sort, setSort] = useState<'updated' | 'title'>('updated');
  const { data: files, isLoading } = useContentFiles({ collection, search, status });
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: (path: string) => contentRepository.deleteFile(path),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content-files'] }),
  });
  const duplicate = useMutation({
    mutationFn: async (file: ContentFileSummary) => {
      const doc = await contentRepository.getFile(file.path);
      const filename = file.filename.replace('.md', '-copy.md');
      return contentRepository.createFile({ collection, filename, raw: doc.raw });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content-files'] }),
  });
  const rename = useMutation({
    mutationFn: ({ file, filename }: { file: ContentFileSummary; filename: string }) =>
      contentRepository.renameFile(
        file.path,
        `content/${collection}/${filename.endsWith('.md') ? filename : `${filename}.md`}`,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content-files'] }),
  });
  const rows = (files ?? [])
    .slice()
    .sort((a, b) =>
      sort === 'title' ? a.title.localeCompare(b.title) : b.updatedAt.localeCompare(a.updatedAt),
    );
  const editPath = (file: ContentFileSummary) => `/admin/${collection}/${file.slug}/edit`;
  const exportFile = async (file: ContentFileSummary) => {
    const doc = await contentRepository.getFile(file.path);
    downloadMarkdown(file.filename, exportDocument(doc));
  };
  return (
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">Content / {collection}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <LinkButton to={`/admin/${collection}/new`}>
          <Plus size={16} />
          {newLabel}
        </LinkButton>
      </div>
      <div className="admin-list-toolbar">
        <SearchField value={search} onChange={setSearch} placeholder={`Search ${collection}`} />
        <select
          className="field compact-select"
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          {collection === 'posts' && <option value="scheduled">Scheduled</option>}
          <option value="archived">Archived</option>
        </select>
        <select
          className="field compact-select"
          value={sort}
          onChange={(event) => setSort(event.target.value as typeof sort)}
        >
          <option value="updated">Recently updated</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>
      {isLoading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <EmptyState
          title={`No ${collection} found`}
          description="Create a new Markdown file or adjust your filters."
          action={
            <LinkButton to={`/admin/${collection}/new`}>
              <Plus size={15} />
              Create one
            </LinkButton>
          }
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Status</th>
                {collection === 'projects' && <th>Featured</th>}
                {collection === 'posts' && <th>Published</th>}
                <th>Modified</th>
                <th>State</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((file) => (
                <tr key={file.path}>
                  <td>
                    <Link className="table-file" to={editPath(file)}>
                      <span className="file-icon">
                        <FilePlus2 size={14} />
                      </span>
                      <span>
                        <strong>{file.title}</strong>
                        <small>
                          {file.filename} · {file.slug}
                        </small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <Badge
                      tone={
                        file.status === 'published'
                          ? 'success'
                          : file.status === 'draft'
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      {file.status}
                    </Badge>
                  </td>
                  {collection === 'projects' && (
                    <td>
                      {file.featured ? (
                        <Badge tone="accent">Featured</Badge>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                  )}
                  {collection === 'posts' && <td>{file.updatedAt.slice(0, 10)}</td>}
                  <td>{relativeDate(file.updatedAt)}</td>
                  <td>
                    <span className="table-state">
                      <StatusDot
                        tone={file.synchronizationStatus === 'synced' ? 'green' : 'amber'}
                      />
                      {file.synchronizationStatus}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={editPath(file)} aria-label={`Edit ${file.title}`}>
                        Edit
                      </Link>
                      <button
                        onClick={() => void exportFile(file)}
                        aria-label={`Export ${file.title}`}
                      >
                        <Download size={15} />
                      </button>
                      <button
                        onClick={() => duplicate.mutate(file)}
                        aria-label={`Duplicate ${file.title}`}
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => {
                          const filename = window.prompt('New filename', file.filename);
                          if (filename && filename !== file.filename)
                            rename.mutate({ file, filename });
                        }}
                        aria-label={`Rename ${file.title}`}
                      >
                        Rename
                      </button>
                      <button
                        className="danger-action"
                        onClick={() => {
                          if (window.confirm(`Delete ${file.title}? This cannot be undone.`))
                            remove.mutate(file.path);
                        }}
                        aria-label={`Delete ${file.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function EditorPage({ collection }: { collection: ContentCollection }) {
  const { slug } = useParams();
  const { data: files, isLoading: filesLoading } = useContentFiles({ collection });
  const match = files?.find((file) => file.slug === slug);
  const { data: document, isLoading: docLoading } = useContentFile(match?.path);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const save = useMutation({
    mutationFn: async (raw: string) => {
      if (document) return contentRepository.updateFile(document.path, { raw });
      const title = raw.match(/^title:\s*(.+)$/m)?.[1] ?? 'new-file';
      const filename = `${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}.md`;
      return contentRepository.createFile({ collection, filename, raw });
    },
    onSuccess: (next) => {
      setSaved(true);
      setError('');
      void queryClient.invalidateQueries({ queryKey: ['content-files'] });
      void queryClient.invalidateQueries({ queryKey: ['content-file'] });
      if (!document)
        navigate(`/admin/${collection}/${next.frontmatter.slug}/edit`, { replace: true });
      window.setTimeout(() => setSaved(false), 1800);
    },
    onError: (cause) =>
      setError(cause instanceof Error ? cause.message : 'Could not save this file.'),
  });
  if (filesLoading || (match && docLoading)) return <LoadingState label="Opening editor" />;
  return (
    <div className="admin-page editor-page">
      <div className="editor-page-head">
        <div>
          <Link className="admin-back-link" to={`/admin/${collection}`}>
            <ArrowDownToLine size={14} /> Back to {collection}
          </Link>
          <h2>{document?.frontmatter.title ?? `New ${collection.slice(0, -1)}`}</h2>
          <p>{document?.path ?? `content/${collection}/new.md`}</p>
        </div>
        <div className="editor-head-status">
          {error && <span className="form-alert">{error}</span>}
          {saved && (
            <span className="saved-feedback">
              <Check size={15} />
              Saved to mock server
            </span>
          )}
        </div>
      </div>
      <MarkdownEditor
        document={document}
        collection={collection}
        onSave={(raw) => save.mutate(raw)}
        saving={save.isPending}
      />
    </div>
  );
}

export function AdminFiles() {
  const { data: files, isLoading } = useContentFiles();
  const importInput = useRef<HTMLInputElement>(null);
  const importContent = useImportContent();
  const [search, setSearch] = useState('');
  const visible =
    files?.filter((file) =>
      `${file.path} ${file.title}`.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];
  const [notice, setNotice] = useState('');
  const exportAll = async () => {
    const docs = await Promise.all(visible.map((file) => contentRepository.getFile(file.path)));
    downloadMockArchive(docs.map((doc) => ({ filename: doc.path, raw: exportDocument(doc) })));
  };
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.md')) {
      setNotice('Only .md files are supported.');
      return;
    }
    const raw = await file.text();
    const collection = raw.includes('projectType:')
      ? 'projects'
      : raw.includes('category:')
        ? 'posts'
        : 'pages';
    try {
      await importContent.mutateAsync({ collection, filename: file.name, raw });
      setNotice(`Imported ${file.name} into ${collection}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not import this file.');
    }
    event.target.value = '';
  };
  return (
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">Content / Files</p>
          <h2>File manager</h2>
          <p>
            A focused view of the Markdown content tree. No browser filesystem access is involved.
          </p>
        </div>
        <div className="button-row">
          <Button variant="secondary" onClick={() => void exportAll()}>
            <Download size={15} />
            Export all
          </Button>
          <Button onClick={() => importInput.current?.click()}>
            <Upload size={15} />
            Import Markdown
          </Button>
          <input
            ref={importInput}
            type="file"
            accept=".md,text/markdown"
            hidden
            onChange={handleImport}
          />
        </div>
      </div>
      {notice && (
        <div className="notice-banner">
          {notice}
          <button onClick={() => setNotice('')}>
            <X size={14} />
          </button>
        </div>
      )}
      <div className="files-layout">
        <aside className="folder-tree">
          <p className="panel-kicker">Repository tree</p>
          <div className="tree-root">
            <Folder size={16} />
            content/
          </div>
          {(['projects', 'posts', 'pages'] as const).map((collection) => (
            <div className="tree-folder" key={collection}>
              <span>
                <Folder size={15} />
                {collection}/
              </span>
              <b>{files?.filter((file) => file.collection === collection).length ?? 0}</b>
            </div>
          ))}
          <div className="tree-note">
            <Server size={15} />
            <p>
              Mock server state
              <br />
              <strong>Persisted locally</strong>
            </p>
          </div>
        </aside>
        <section className="admin-panel file-manager-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">All Markdown files</p>
              <h3>{visible.length} files</h3>
            </div>
            <SearchField value={search} onChange={setSearch} placeholder="Search files" />
          </div>
          {isLoading ? (
            <LoadingState />
          ) : (
            visible.map((file) => <FileRow key={file.path} file={file} />)
          )}
        </section>
      </div>
    </div>
  );
}

export function AdminGit() {
  const { data: status, isLoading } = useGitStatus();
  const { data: commits } = useGitHistory();
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const commit = useGitAction((input: { message: string; files: string[] }) =>
    gitRepository.createCommit(input),
  );
  const push = useGitAction(() => gitRepository.push());
  const pull = useGitAction(() => gitRepository.pull());
  if (isLoading || !status) return <LoadingState label="Reading repository status" />;
  const files = [
    ...status.modified.map((path) => ({ path, status: 'modified' as const })),
    ...status.added.map((path) => ({ path, status: 'added' as const })),
    ...status.deleted.map((path) => ({ path, status: 'deleted' as const })),
    ...status.untracked.map((path) => ({ path, status: 'untracked' as const })),
  ];
  const suggestion = files[0]
    ? suggestCommitMessage(
        files[0].path.split('/').pop()?.replace('.md', '').replaceAll('-', ' ') ?? 'content',
        files[0].path.includes('/posts/')
          ? 'posts'
          : files[0].path.includes('/projects/')
            ? 'projects'
            : 'pages',
      )
    : 'content: refine portfolio content';
  const doCommit = async () => {
    try {
      await commit.mutateAsync({
        message: message || suggestion,
        files: files.map((file) => file.path),
      });
      setMessage('');
      setNotice('Commit created locally. Push it when you are ready.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Commit failed.');
    }
  };
  const doPush = async () => {
    const result = await push.mutateAsync(undefined);
    setNotice((result as { message: string }).message);
  };
  return (
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">Operations / Git</p>
          <h2>Repository, made legible.</h2>
          <p>Review content changes before they leave the browser mock.</p>
        </div>
        <div className="git-branch">
          <GitCommitHorizontal size={16} />
          {status.branch}
          <Badge tone={status.ahead ? 'warning' : 'success'}>
            {status.ahead ? `${status.ahead} ahead` : 'synced'}
          </Badge>
        </div>
      </div>
      {notice && (
        <div className="notice-banner">
          {notice}
          <button onClick={() => setNotice('')}>
            <X size={14} />
          </button>
        </div>
      )}
      {status.conflict && (
        <div className="conflict-card">
          <div>
            <CircleAlert size={17} />
            <div>
              <strong>Remote changes need review</strong>
              <p>
                A remote version differs from your local Markdown. Compare the local, server, and
                last synchronized versions before choosing a resolution.
              </p>
            </div>
          </div>
          <div>
            <Button variant="secondary" size="sm">
              Keep local
            </Button>
            <Button variant="secondary" size="sm">
              Keep remote
            </Button>
            <Button size="sm">Open merge view</Button>
          </div>
        </div>
      )}
      <div className="git-overview">
        <div>
          <span className="muted-label">Current branch</span>
          <strong>{status.branch}</strong>
        </div>
        <div>
          <span className="muted-label">Remote</span>
          <strong>origin / main</strong>
          <span className="git-subtext">
            {status.behind ? `${status.behind} behind` : 'Up to date'}
          </span>
        </div>
        <div>
          <span className="muted-label">Last sync</span>
          <strong>{relativeDate(status.lastSyncAt)}</strong>
        </div>
        <div>
          <span className="muted-label">Working tree</span>
          <strong>{files.length ? `${files.length} changes` : 'Clean'}</strong>
        </div>
      </div>
      <div className="git-grid">
        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Working tree</p>
              <h3>{files.length ? 'Changes to review' : 'Clean repository'}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void pull.mutateAsync(undefined);
              }}
            >
              {' '}
              <RefreshCw size={14} />
              Sync
            </Button>
          </div>
          {files.length ? (
            <div className="changed-files">
              {files.map((file) => (
                <div className="changed-file" key={file.path}>
                  <StatusDot
                    tone={
                      file.status === 'deleted'
                        ? 'red'
                        : file.status === 'added'
                          ? 'green'
                          : 'amber'
                    }
                  />
                  <span>{file.path}</span>
                  <Badge tone={file.status === 'deleted' ? 'danger' : 'neutral'}>
                    {file.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing to commit"
              description="Save a Markdown file to create a new local change."
            />
          )}
        </section>
        <section className="admin-panel commit-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Create commit</p>
              <h3>Write a useful message</h3>
            </div>
            <GitCommitHorizontal size={19} />
          </div>
          <Field label="Commit message" hint="A short message makes history easier to scan.">
            <Textarea
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={suggestion}
            />
          </Field>
          <button className="suggestion" onClick={() => setMessage(suggestion)}>
            Use suggestion: <strong>{suggestion}</strong>
          </button>
          <Button onClick={() => void doCommit()} disabled={!files.length || commit.isPending}>
            <GitCommitHorizontal size={15} />
            {commit.isPending ? 'Committing…' : 'Create commit'}
          </Button>
        </section>
      </div>
      <section className="admin-panel git-history">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">History</p>
            <h3>Recent commits</h3>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void doPush()}
            disabled={!status.ahead || push.isPending}
          >
            <Upload size={14} />
            {push.isPending ? 'Pushing…' : 'Push to remote'}
          </Button>
        </div>
        {commits?.map((commit) => (
          <div className="history-row" key={commit.id}>
            <span className="history-hash">{commit.id}</span>
            <div>
              <strong>{commit.message}</strong>
              <span>
                {commit.author} · {relativeDate(commit.createdAt)}
              </span>
            </div>
            <span className="history-files">
              {commit.files.length} file{commit.files.length > 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

export function AdminMessages() {
  const [messages, setMessages] = useState(getMessages);
  const [selected, setSelected] = useState(messages[0]?.id);
  const current = messages.find((message) => message.id === selected);
  const markRead = (id: string) => {
    const next = messages.map((message) =>
      message.id === id ? { ...message, status: 'read' as const } : message,
    );
    setMessages(next);
    saveMessages(next);
  };
  return (
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">
            Inbox / {messages.filter((message) => message.status === 'new').length} new
          </p>
          <h2>Messages</h2>
          <p>A calm place for the conversations that start outside the editor.</p>
        </div>
        <Badge tone="accent">
          <Inbox size={14} />
          {messages.filter((message) => message.status === 'new').length} unread
        </Badge>
      </div>
      <div className="messages-layout">
        <section className="message-list">
          {messages.map((message) => (
            <button
              className={`message-list-item ${message.id === selected ? 'active' : ''}`}
              key={message.id}
              onClick={() => {
                setSelected(message.id);
                markRead(message.id);
              }}
            >
              <span className={`message-unread ${message.status === 'new' ? 'is-new' : ''}`} />
              <div>
                <strong>{message.name}</strong>
                <span>{message.subject}</span>
                <small>{relativeDate(message.createdAt)}</small>
              </div>
            </button>
          ))}
        </section>
        <section className="admin-panel message-detail">
          {current ? (
            <>
              <div className="message-detail-head">
                <div>
                  <p className="panel-kicker">{current.status}</p>
                  <h3>{current.subject}</h3>
                  <span>
                    {current.name} · {current.email}
                    {current.company ? ` · ${current.company}` : ''}
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal size={17} />
                </Button>
              </div>
              <p className="message-body">{current.message}</p>
              <a
                className="button button-secondary"
                href={`mailto:${current.email}?subject=Re: ${current.subject}`}
              >
                Reply by email <ArrowUpRight size={15} />
              </a>
            </>
          ) : (
            <EmptyState title="Select a message" description="Choose a message from the inbox." />
          )}
        </section>
      </div>
    </div>
  );
}

export function AdminSettings() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">Workspace / Settings</p>
          <h2>Settings</h2>
          <p>Keep the future API boundary visible while the browser mock stays simple.</p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="admin-panel settings-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Public profile</p>
              <h3>Site identity</h3>
            </div>
            <Settings2 size={18} />
          </div>
          <div className="settings-form">
            <Field label="Name">
              <Input defaultValue="Ignacio Osella" />
            </Field>
            <Field label="Role">
              <Input defaultValue="Full-stack developer" />
            </Field>
            <Field label="Location">
              <Input defaultValue="Córdoba, Argentina" />
            </Field>
            <Field label="Email">
              <Input defaultValue="hello@ignacioosella.dev" />
            </Field>
            <Button
              onClick={() => {
                setSaved(true);
                window.setTimeout(() => setSaved(false), 1600);
              }}
            >
              {saved ? (
                <>
                  <Check size={15} />
                  Saved
                </>
              ) : (
                'Save settings'
              )}
            </Button>
          </div>
        </section>
        <section className="admin-panel security-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Security boundary</p>
              <h3>Frontend mock only</h3>
            </div>
            <CircleAlert size={18} />
          </div>
          <p>
            This browser demo never stores repository credentials, executes Git, or writes a
            production filesystem. The future Spring Boot service must own authentication with
            secure HttpOnly cookies, authorization, file locking, Git credentials, backups, conflict
            detection, and audit logs.
          </p>
          <div className="architecture-note">
            <span>React frontend</span>
            <i>↓ REST API</i>
            <span>Spring Boot backend</span>
            <i>↓</i>
            <span>Content directory + Git</span>
          </div>
        </section>
      </div>
    </div>
  );
}
