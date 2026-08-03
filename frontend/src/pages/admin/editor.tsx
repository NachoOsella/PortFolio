import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check } from 'lucide-react';
import { useContentFile, useContentFiles } from '@/hooks/useRepositories';
import { contentRepository } from '@/repositories/contentRepository';
import { apiEnabled } from '@/repositories/apiClient';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { LoadingState } from '@/components/ui';
import type { ContentCollection } from '@/types';

export function EditorPage({
  collection,
  fixedSlug,
}: {
  collection: ContentCollection;
  fixedSlug?: string;
}) {
  const { slug: routeSlug } = useParams();
  const slug = fixedSlug ?? routeSlug;
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
      if (!document) {
        const nextRoute = fixedSlug
          ? `/admin/${fixedSlug}/edit`
          : `/admin/${collection}/${next.frontmatter.slug}/edit`;
        navigate(nextRoute, { replace: true });
      }
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
            <ArrowLeft size={14} /> Back to {collection}
          </Link>
          <h2>
            {document?.frontmatter.title ??
              (fixedSlug === 'about' ? 'About me' : `New ${collection.slice(0, -1)}`)}
          </h2>
          <p>{document?.path ?? `content/${collection}/${fixedSlug ?? 'new'}.md`}</p>
        </div>
        <div className="editor-head-status">
          {error && <span className="form-alert">{error}</span>}
          {saved && (
            <span className="saved-feedback">
              <Check size={15} />
              {apiEnabled ? 'Saved to GitHub' : 'Saved to mock server'}
            </span>
          )}
        </div>
      </div>
      <MarkdownEditor
        document={document}
        collection={collection}
        initialTitle={fixedSlug === 'about' ? 'About' : undefined}
        initialSlug={fixedSlug}
        onSave={(raw) => save.mutate(raw)}
        saving={save.isPending}
      />
    </div>
  );
}
