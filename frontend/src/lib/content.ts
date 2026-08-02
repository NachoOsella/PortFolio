import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { z } from 'zod';
import { schemaForCollection } from '@/schemas/content';
import type { ContentCollection, ParsedFrontmatter, SynchronizationStatus } from '@/types';

export function collectionFromPath(path: string): ContentCollection {
  if (path.includes('/projects/')) return 'projects';
  if (path.includes('/posts/')) return 'posts';
  return 'pages';
}

function splitFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { data: {}, content: raw };
  return { data: parseYaml(match[1]) ?? {}, content: raw.slice(match[0].length) };
}

export function parseMarkdown(raw: string, path: string) {
  const collection = collectionFromPath(path);
  try {
    const parsed = splitFrontmatter(raw);
    const result = schemaForCollection(collection).safeParse(parsed.data);
    return { parsed, collection, result };
  } catch (error) {
    const parsed = { data: {}, content: raw };
    const message = error instanceof Error ? error.message : 'Invalid YAML frontmatter';
    return {
      parsed,
      collection,
      result: {
        success: false as const,
        error: new z.ZodError([{ code: 'custom', path: [], message }]),
      },
    };
  }
}

export function createDocument(
  raw: string,
  path: string,
  previous?: { version: number; createdAt: string; synchronizationStatus?: SynchronizationStatus },
) {
  const { parsed, collection, result } = parseMarkdown(raw, path);
  if (!result.success)
    throw new Error(result.error.issues.map((issue) => issue.message).join(', '));
  const now = new Date().toISOString();
  return {
    path,
    filename: path.split('/').pop() ?? path,
    collection,
    frontmatter: result.data as ParsedFrontmatter,
    body: parsed.content.trim(),
    raw,
    version: previous?.version ?? 1,
    size: new TextEncoder().encode(raw).length,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    synchronizationStatus: previous?.synchronizationStatus ?? 'synced',
  };
}

export function normalizeDate(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.length === 10 ? `${value}T12:00:00.000Z` : value;
}

export function isPubliclyVisible(frontmatter: ParsedFrontmatter, now = new Date()) {
  if (frontmatter.status !== 'published' && frontmatter.status !== 'scheduled') return false;
  if (
    frontmatter.status === 'scheduled' &&
    'publishedAt' in frontmatter &&
    frontmatter.publishedAt
  ) {
    return new Date(normalizeDate(frontmatter.publishedAt)) <= now;
  }
  return true;
}

export function readingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function formatDate(value: string) {
  try {
    const date = parseISO(normalizeDate(value));
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return value;
  }
}

export function relativeDate(value: string) {
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function toFrontmatter(raw: string) {
  return splitFrontmatter(raw).data as Record<string, unknown>;
}

export function buildMarkdown(frontmatter: Record<string, unknown>, body: string) {
  const yaml = stringifyYaml(frontmatter).trimEnd();
  return `---\n${yaml}\n---\n\n${body.trim()}\n`;
}

export function suggestCommitMessage(
  title: string,
  collection: ContentCollection,
  verb = 'update',
) {
  const noun =
    collection === 'posts' ? 'article' : collection === 'projects' ? 'case study' : 'page';
  return `content: ${verb} ${title.toLowerCase()} ${noun}`;
}
