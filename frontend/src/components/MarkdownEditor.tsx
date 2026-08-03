import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bold,
  Code2,
  Eye,
  FileCode2,
  Heading2,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minus,
  Quote,
  Save,
  Table2,
  X,
} from 'lucide-react';
import { buildMarkdown, parseMarkdown, readingTime, slugify } from '@/lib/content';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Badge, Button, Field, Input, SaveState, Textarea } from './ui';
import { getDraft, removeDraft, saveDraft } from '@/services/drafts';
import type { ContentCollection, MarkdownDocument } from '@/types';

const toolbar = [
  ['heading', 'Heading', Heading2],
  ['bold', 'Bold', Bold],
  ['italic', 'Italic', Italic],
  ['code', 'Inline code', Code2],
  ['link', 'Link', Link2],
  ['image', 'Image', Image],
  ['ul', 'Bulleted list', List],
  ['ol', 'Numbered list', ListOrdered],
  ['quote', 'Blockquote', Quote],
  ['table', 'Table', Table2],
  ['hr', 'Horizontal rule', Minus],
] as const;

type EditorMode = 'split' | 'write' | 'preview';
export function MarkdownEditor({
  document,
  collection,
  initialTitle,
  initialSlug,
  onSave,
  saving,
}: {
  document?: MarkdownDocument;
  collection: ContentCollection;
  initialTitle?: string;
  initialSlug?: string;
  onSave: (raw: string) => void;
  saving: boolean;
}) {
  const initial = document?.raw ?? newDocument(collection, initialTitle, initialSlug);
  const [raw, setRaw] = useState(initial);
  const [mode, setMode] = useState<EditorMode>('split');
  const [fullscreen, setFullscreen] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [draftAvailable, setDraftAvailable] = useState(
    Boolean(document && getDraft(document.path)),
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const parsed = useMemo(
    () => parseMarkdown(raw, document?.path ?? `content/${collection}/new.md`),
    [collection, document?.path, raw],
  );
  const body = parsed.parsed.content.trim();
  const data: Record<string, unknown> = parsed.result.success
    ? parsed.result.data
    : parsed.parsed.data;
  const stats = `${body.split(/\s+/).filter(Boolean).length} words · ${raw.length} characters · ${readingTime(body)} min read`;
  useEffect(() => {
    if (!document) return;
    const handler = window.setTimeout(() => saveDraft(document.path, raw), 900);
    return () => window.clearTimeout(handler);
  }, [document, raw]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        onSave(raw);
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setMode((value) => (value === 'preview' ? 'split' : 'preview'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSave, raw]);
  const updateField = (key: string, value: unknown) => {
    if (!parsed.result.success) return;
    setRaw(buildMarkdown({ ...parsed.result.data, [key]: value }, body));
  };
  const insert = (kind: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = raw.slice(start, end) || 'text';
    const snippets: Record<string, string> = {
      heading: `## ${selected}`,
      bold: `**${selected}**`,
      italic: `*${selected}*`,
      code: `\`${selected}\``,
      link: `[${selected}](https://example.com)`,
      image: `![${selected}](/images/${slugify(selected)}.webp)`,
      ul: `- ${selected}`,
      ol: `1. ${selected}`,
      quote: `> ${selected}`,
      table: `| Name | Detail |\n| --- | --- |\n| ${selected} | Value |`,
      hr: '---',
    };
    const next = `${raw.slice(0, start)}${snippets[kind]}${raw.slice(end)}`;
    setRaw(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + snippets[kind].length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };
  const restore = () => {
    if (!document) return;
    const draft = getDraft(document.path);
    if (draft) {
      setRaw(draft);
      setDraftAvailable(false);
    }
  };
  return (
    <div className={`editor-shell ${fullscreen ? 'editor-fullscreen' : ''}`}>
      <div className="editor-toolbar">
        <div className="editor-toolbar-left">
          {toolbar.map(([key, label, Icon]) => (
            <button key={key} title={label} aria-label={label} onClick={() => insert(key)}>
              <Icon size={16} />
            </button>
          ))}
        </div>
        <div className="editor-toolbar-right">
          <button className={mode === 'write' ? 'active' : ''} onClick={() => setMode('write')}>
            <FileCode2 size={15} />
            Write
          </button>
          <button className={mode === 'split' ? 'active' : ''} onClick={() => setMode('split')}>
            <Table2 size={15} />
            Split
          </button>
          <button className={mode === 'preview' ? 'active' : ''} onClick={() => setMode('preview')}>
            <Eye size={15} />
            Preview
          </button>
          <button
            title="Fullscreen"
            aria-label="Fullscreen"
            onClick={() => setFullscreen((value) => !value)}
          >
            {fullscreen ? <X size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      {draftAvailable && (
        <div className="draft-banner">
          <span>There is a newer local draft for this file.</span>
          <div>
            <Button size="sm" variant="ghost" onClick={restore}>
              Restore draft
            </Button>
            <button
              onClick={() => {
                if (document) removeDraft(document.path);
                setDraftAvailable(false);
              }}
            >
              Discard
            </button>
          </div>
        </div>
      )}
      <div className="editor-meta-toggle">
        <button onClick={() => setShowMetadata((value) => !value)}>
          <span>Frontmatter</span>
          <Badge tone={parsed.result.success ? 'success' : 'danger'}>
            {parsed.result.success ? 'Valid' : 'Needs attention'}
          </Badge>
        </button>
        {!parsed.result.success && (
          <span className="frontmatter-error">
            {parsed.result.error.issues[0]?.message ?? 'Invalid metadata'}
          </span>
        )}
      </div>
      {showMetadata && (
        <div className="frontmatter-panel">
          <Field label="Title">
            <Input
              value={String(data.title ?? '')}
              onChange={(event) => updateField('title', event.target.value)}
            />
          </Field>
          <Field label="Slug">
            <Input
              value={String(data.slug ?? '')}
              onChange={(event) => updateField('slug', slugify(event.target.value))}
            />
          </Field>
          <Field label="Status">
            <select
              className="field"
              value={String(data.status ?? 'draft')}
              onChange={(event) => updateField('status', event.target.value)}
            >
              <option>draft</option>
              <option>published</option>
              <option>scheduled</option>
              <option>archived</option>
            </select>
          </Field>
          {collection === 'posts' && (
            <Field label="Category">
              <Input
                value={String(data.category ?? '')}
                onChange={(event) => updateField('category', event.target.value)}
              />
            </Field>
          )}
          {collection === 'projects' && (
            <Field label="Project type">
              <Input
                value={String(data.projectType ?? '')}
                onChange={(event) => updateField('projectType', event.target.value)}
              />
            </Field>
          )}
          {'featured' in data && (
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={Boolean(data.featured)}
                onChange={(event) => updateField('featured', event.target.checked)}
              />
              Featured content
            </label>
          )}
        </div>
      )}
      <div className={`editor-pane ${mode}`}>
        <div className="source-pane">
          <div className="pane-label">Markdown source</div>
          <Textarea
            ref={textareaRef}
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="preview-pane">
          <div className="pane-label">Rendered preview</div>
          <div className="preview-scroll">
            <MarkdownRenderer content={body || '_Start writing to see a preview._'} />
          </div>
        </div>
      </div>
      <div className="editor-footer">
        <span>{stats}</span>
        <div className="editor-footer-actions">
          <SaveState saved={Boolean(document && document.synchronizationStatus === 'synced')} />
          <Button size="sm" onClick={() => onSave(raw)} disabled={saving}>
            <Save size={14} />
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function newDocument(collection: ContentCollection, initialTitle?: string, initialSlug?: string) {
  const title =
    initialTitle ??
    (collection === 'projects'
      ? 'New project'
      : collection === 'posts'
        ? 'New article'
        : 'New page');
  const slug = initialSlug ?? slugify(title);
  return `---\ntitle: ${title}\nslug: ${slug}\ndescription: Add a short description.\nstatus: draft\nupdatedAt: ${new Date().toISOString().slice(0, 10)}\n${collection === 'projects' ? 'projectType: Full-stack application\nrole: Full-stack developer\nduration: Ongoing\ntechnologies:\n  - React\nfeatured: false\n' : ''}${collection === 'posts' ? 'category: React\ntags:\n  - React\npublishedAt: ${new Date().toISOString().slice(0, 10)}\n' : ''}---\n\n# ${title}\n\nStart writing here.\n`;
}
