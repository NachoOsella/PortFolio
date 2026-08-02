import { useRef, useState } from 'react';
import { Download, Folder, Server, Upload, X } from 'lucide-react';
import { useContentFiles, useImportContent } from '@/hooks/useRepositories';
import { contentRepository, exportDocument } from '@/repositories/contentRepository';
import { downloadMockArchive } from '@/services/download';
import { Button, LoadingState, SearchField } from '@/components/ui';
import { FileRow } from './shared';

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
          {isLoading ? <LoadingState /> : visible.map((file) => <FileRow key={file.path} file={file} />)}
        </section>
      </div>
    </div>
  );
}