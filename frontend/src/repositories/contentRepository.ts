import { buildMarkdown } from '@/lib/content';
import { apiContentRepository } from './apiRepositories';
import { apiEnabled } from './apiClient';
import type {
  ContentFileSummary,
  ContentQuery,
  CreateContentFileInput,
  ImportMarkdownFileInput,
  MarkdownDocument,
  UpdateContentFileInput,
} from '@/types';

export interface ContentRepository {
  listFiles(query?: ContentQuery): Promise<ContentFileSummary[]>;
  getFile(path: string): Promise<MarkdownDocument>;
  createFile(input: CreateContentFileInput): Promise<MarkdownDocument>;
  updateFile(path: string, input: UpdateContentFileInput): Promise<MarkdownDocument>;
  renameFile(path: string, newPath: string): Promise<MarkdownDocument>;
  deleteFile(path: string): Promise<void>;
  importFile(input: ImportMarkdownFileInput): Promise<MarkdownDocument>;
}

export function exportDocument(document: MarkdownDocument) {
  return buildMarkdown(document.frontmatter, document.body);
}

/**
 * Resolves the repository implementation. The mock is only reachable in
 * development builds without VITE_API_URL; `import.meta.env.DEV` becomes a
 * literal `false` in production builds, so Rollup drops the dynamic import
 * and the seed/localStorage mock never ships to production.
 */
async function loadRepository(): Promise<ContentRepository> {
  if (import.meta.env.DEV && !apiEnabled) {
    const { mockContentRepository } = await import('./mockContentRepository');
    return mockContentRepository;
  }
  return apiContentRepository;
}

export const contentRepository = await loadRepository();