import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Archive, ArrowUpRight, Copy, Download, Plus, Trash2 } from 'lucide-react';
import { createRecordCode, createRevision } from '@/lib/archive';
import { relativeDate } from '@/lib/content';
import { useContentFiles } from '@/hooks/useRepositories';
import { contentRepository, exportDocument } from '@/repositories/contentRepository';
import { downloadMarkdown } from '@/services/download';
import { Badge, EmptyState, LinkButton, LoadingState, StatusDot } from '@/components/ui';
import type { ContentCollection, ContentFileSummary, PublicationStatus } from '@/types';

export function AdminStat({
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
      <div className="stat-record">
        <span>{createRecordCode(label, value, 'L')}</span>
        <Icon size={15} aria-hidden="true" />
      </div>
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </div>
  );
}

export function FileRow({ file }: { file: ContentFileSummary }) {
  return (
    <div className="file-row">
      <span className="file-record-code">{createRecordCode(file.title, 0, 'D')}</span>
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

export function SummaryRow({ label, count, to }: { label: string; count: number; to: string }) {
  return (
    <Link className="summary-row" to={to}>
      <span>{label}</span>
      <strong>{count}</strong>
      <ArrowUpRight size={15} />
    </Link>
  );
}

export function ContentList({
  collection,
  title,
  description,
  newLabel,
  excludeSlugs = [],
}: {
  collection: ContentCollection;
  title: string;
  description: string;
  newLabel: string;
  excludeSlugs?: string[];
}) {
  const [status, setStatus] = useState<'all' | PublicationStatus>('all');
  const [sort, setSort] = useState<'updated' | 'title'>('updated');
  const { data: files, isLoading } = useContentFiles({ collection, status });
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
    .filter((file) => !excludeSlugs.includes(file.slug))
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
                      <span className="table-record-code">
                        {createRecordCode(file.title, 0, collection.slice(0, 1).toUpperCase())}
                      </span>
                      <span>
                        <strong>{file.title}</strong>
                        <small>
                          {file.filename} · {createRevision(file.updatedAt)}
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
