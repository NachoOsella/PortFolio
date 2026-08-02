import { useState } from 'react';
import { CircleAlert, GitCommitHorizontal, RefreshCw, Upload, X } from 'lucide-react';
import { relativeDate, suggestCommitMessage } from '@/lib/content';
import { useGitAction, useGitHistory, useGitStatus } from '@/hooks/useRepositories';
import { gitRepository } from '@/repositories/gitRepository';
import { Badge, Button, EmptyState, Field, LoadingState, StatusDot, Textarea } from '@/components/ui';

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