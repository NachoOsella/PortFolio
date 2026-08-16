import { seedContent } from '@/mocks/content';
import { buildMarkdown, createDocument, parseMarkdown } from '@/lib/content';
import { safeStorage } from '@/lib/storage';
import type {
  ContentFileSummary,
  MarkdownDocument,
} from '@/types';
import type { ContentRepository } from './contentRepository';

const STORAGE_KEY = 'ignacio-content-v1';
const wait = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadFromDisk(): Promise<MarkdownDocument[]> {
  // Used by the prerender pass (SSR): serve the real local Markdown files
  // instead of the browser demo seeds. The dynamic import of node:fs is
  // dropped from browser bundles because this branch is unreachable there.
  const { readdirSync, readFileSync } = await import('node:fs');
  const root = process.cwd();
  const documents: MarkdownDocument[] = [];
  for (const collection of ['projects', 'posts', 'pages']) {
    const directory = `${root}/content/${collection}`;
    const files = readdirSync(directory).filter((name) => name.endsWith('.md'));
    for (const filename of files.sort()) {
      const raw = readFileSync(`${directory}/${filename}`, 'utf8');
      documents.push(
        createDocument(raw, `content/${collection}/${filename}`, {
          version: 1,
          createdAt: new Date().toISOString(),
        }),
      );
    }
  }
  return documents;
}

function summary(document: MarkdownDocument): ContentFileSummary {
  const frontmatter = document.frontmatter;
  return {
    path: document.path,
    filename: document.filename,
    collection: document.collection,
    title: frontmatter.title,
    slug: frontmatter.slug,
    status: frontmatter.status,
    featured: 'featured' in frontmatter ? Boolean(frontmatter.featured) : undefined,
    category: 'category' in frontmatter ? String(frontmatter.category) : undefined,
    technologies:
      'technologies' in frontmatter ? (frontmatter.technologies as string[]) : undefined,
    updatedAt: document.updatedAt,
    publishedAt: 'publishedAt' in frontmatter ? String(frontmatter.publishedAt) : undefined,
    size: document.size,
    synchronizationStatus: document.synchronizationStatus,
    gitStatus: document.synchronizationStatus === 'modified' ? 'modified' : undefined,
  };
}

async function load(): Promise<MarkdownDocument[]> {
  if (import.meta.env.SSR) return loadFromDisk();
  const storage = safeStorage();
  const saved = storage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as MarkdownDocument[];
    } catch {
      storage.removeItem(STORAGE_KEY);
    }
  }
  return seedContent.map(([path, raw], index) => {
    const doc = createDocument(raw, `content/${path}`, {
      version: 1,
      createdAt: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
    });
    return {
      ...doc,
      synchronizationStatus: index % 5 === 0 ? 'modified' : 'synced',
    };
  });
}

let documents = await load();

function persist() {
  safeStorage().setItem(STORAGE_KEY, JSON.stringify(documents));
}
function find(path: string) {
  return documents.find((document) => document.path === path);
}
function failOccasionally() {
  // Keep the mock dependable by default; tests and future demos can opt into recoverable failures.
  if (safeStorage().getItem('ignacio-mock-errors') === 'true' && Math.random() < 0.08)
    throw new Error('The mock content server could not complete the request. Try again.');
}

export const mockContentRepository: ContentRepository = {
  async listFiles(query = {}) {
    await wait();
    failOccasionally();
    return documents
      .filter((document) => {
        const matchesCollection = !query.collection || document.collection === query.collection;
        const matchesSearch =
          !query.search ||
          `${document.frontmatter.title} ${document.frontmatter.slug} ${document.filename}`
            .toLowerCase()
            .includes(query.search.toLowerCase());
        const matchesStatus =
          !query.status || query.status === 'all' || document.frontmatter.status === query.status;
        const matchesFeatured =
          query.featured === undefined ||
          query.featured === 'all' ||
          ('featured' in document.frontmatter && document.frontmatter.featured === query.featured);
        return matchesCollection && matchesSearch && matchesStatus && matchesFeatured;
      })
      .map(summary);
  },
  async getFile(path) {
    await wait(180);
    const document = find(path);
    if (!document) throw new Error('Markdown file not found.');
    return document;
  },
  async createFile(input) {
    await wait();
    if (find(input.filename)) throw new Error('A file with this path already exists.');
    const path = input.filename.startsWith('content/')
      ? input.filename
      : `content/${input.collection}/${input.filename}`;
    const document = createDocument(input.raw, path);
    documents = [document, ...documents];
    persist();
    return document;
  },
  async updateFile(path, input) {
    await wait();
    failOccasionally();
    const current = find(path);
    if (!current) throw new Error('Markdown file not found.');
    const document = createDocument(input.raw, path, {
      version: current.version + 1,
      createdAt: current.createdAt,
      synchronizationStatus: 'modified',
    });
    documents = documents.map((item) => (item.path === path ? document : item));
    persist();
    return document;
  },
  async renameFile(path, newPath) {
    await wait();
    if (find(newPath)) throw new Error('A file with this path already exists.');
    const current = find(path);
    if (!current) throw new Error('Markdown file not found.');
    const document = createDocument(current.raw, newPath, {
      version: current.version + 1,
      createdAt: current.createdAt,
      synchronizationStatus: 'modified',
    });
    documents = documents.map((item) => (item.path === path ? document : item));
    persist();
    return document;
  },
  async deleteFile(path) {
    await wait();
    if (!find(path)) throw new Error('Markdown file not found.');
    documents = documents.filter((document) => document.path !== path);
    persist();
  },
  async importFile(input) {
    await wait();
    const path = input.filename.startsWith('content/')
      ? input.filename
      : `content/${input.collection}/${input.filename}`;
    const parsed = parseMarkdown(input.raw, path);
    if (!parsed.result.success)
      throw new Error(parsed.result.error.issues.map((issue) => issue.message).join(', '));
    if (find(path) && !input.overwrite) throw new Error('A file with this path already exists.');
    const document = createDocument(input.raw, path, {
      version: find(path)?.version ? find(path)!.version + 1 : 1,
      createdAt: find(path)?.createdAt ?? new Date().toISOString(),
      synchronizationStatus: 'modified',
    });
    documents = documents.filter((item) => item.path !== path).concat(document);
    persist();
    return document;
  },
};

export async function resetContentRepository() {
  documents = await load();
  persist();
}
export function markFilesSynced(paths: string[]) {
  documents = documents.map((document) =>
    paths.includes(document.path) ? { ...document, synchronizationStatus: 'synced' } : document,
  );
  persist();
}
export function exportDocument(document: MarkdownDocument) {
  return buildMarkdown(document.frontmatter, document.body);
}