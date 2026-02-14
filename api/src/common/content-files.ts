import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface BlogPostMeta {
    title: string;
    slug: string;
    date: string;
    tags: string[];
    excerpt: string;
    published: boolean;
    featured: boolean;
    coverImage?: string;
    readingTime: string;
    wordCount: number;
}

export interface BlogTocItem {
    level: number;
    text: string;
    id: string;
}

export interface BlogPostDocument {
    meta: BlogPostMeta;
    content: string;
    toc: BlogTocItem[];
}

export interface ProjectRecord {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    image: string;
    category: string;
    technologies: string[];
    featured: boolean;
    links: {
        live: string | null;
        github: string | null;
    };
    highlights: string[];
    date: string;
}

interface PackageJsonLike {
    workspaces?: unknown;
}

export interface RepositoryPaths {
    rootDir: string;
    generatedDir: string;
    generatedBlogDir: string;
    generatedBlogIndexPath: string;
    generatedProjectsPath: string;
    contentDir: string;
    contentBlogDir: string;
    contentProjectsPath: string;
}

let cachedPaths: RepositoryPaths | null = null;

export function getRepositoryPaths(): RepositoryPaths {
    if (cachedPaths) {
        return cachedPaths;
    }

    const rootDir = findRepositoryRoot();
    cachedPaths = {
        rootDir,
        generatedDir: path.join(rootDir, 'generated'),
        generatedBlogDir: path.join(rootDir, 'generated', 'blog'),
        generatedBlogIndexPath: path.join(rootDir, 'generated', 'blog-index.json'),
        generatedProjectsPath: path.join(rootDir, 'generated', 'projects.json'),
        contentDir: path.join(rootDir, 'content'),
        contentBlogDir: path.join(rootDir, 'content', 'blog'),
        contentProjectsPath: path.join(rootDir, 'content', 'projects.json'),
    };

    return cachedPaths;
}

export async function readBlogIndex(): Promise<BlogPostMeta[]> {
    const paths = getRepositoryPaths();
    return readJsonFile<BlogPostMeta[]>(paths.generatedBlogIndexPath, []);
}

export async function readBlogDocument(slug: string): Promise<BlogPostDocument | null> {
    const paths = getRepositoryPaths();
    const filePath = path.join(paths.generatedBlogDir, slug, 'index.json');
    return readJsonFile<BlogPostDocument | null>(filePath, null);
}

export async function readProjects(): Promise<ProjectRecord[]> {
    const paths = getRepositoryPaths();
    return readJsonFile<ProjectRecord[]>(paths.generatedProjectsPath, []);
}

export async function readSourceProjects(): Promise<ProjectRecord[]> {
    const paths = getRepositoryPaths();
    return readJsonFile<ProjectRecord[]>(paths.contentProjectsPath, []);
}

export async function writeSourceProjects(projects: ProjectRecord[]): Promise<void> {
    const paths = getRepositoryPaths();
    await writeFile(paths.contentProjectsPath, JSON.stringify(projects, null, 2), 'utf-8');
}

export async function readMarkdownPost(slug: string): Promise<string | null> {
    const paths = getRepositoryPaths();
    const filePath = path.join(paths.contentBlogDir, slug, 'index.md');
    return readTextFile(filePath, null);
}

export async function writeMarkdownPost(
    currentSlug: string | null,
    nextSlug: string,
    markdown: string,
): Promise<void> {
    const paths = getRepositoryPaths();
    const currentDir = currentSlug ? path.join(paths.contentBlogDir, currentSlug) : null;
    const targetDir = path.join(paths.contentBlogDir, nextSlug);
    const targetFile = path.join(targetDir, 'index.md');

    await mkdir(paths.contentBlogDir, { recursive: true });

    if (currentDir && currentSlug !== nextSlug) {
        await ensurePathAbsent(targetDir);
        await rename(currentDir, targetDir);
    } else {
        await mkdir(targetDir, { recursive: true });
    }

    await writeFile(targetFile, markdown, 'utf-8');
}

export async function deleteMarkdownPost(slug: string): Promise<void> {
    const paths = getRepositoryPaths();
    const targetDir = path.join(paths.contentBlogDir, slug);
    await rm(targetDir, { recursive: true, force: false });
}

export async function pathExists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}

export function removeFrontmatter(markdown: string): string {
    return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

export async function rebuildGeneratedContent(): Promise<void> {
    const paths = getRepositoryPaths();
    await execFileAsync('npm', ['run', 'build:content'], {
        cwd: paths.rootDir,
        timeout: 120000,
    });
}

function findRepositoryRoot(): string {
    const starts = [process.cwd(), __dirname];

    for (const start of starts) {
        const root = walkUpForRepositoryRoot(start);
        if (root) {
            return root;
        }
    }

    const fallback = path.resolve(process.cwd(), '..');
    return fallback;
}

function walkUpForRepositoryRoot(start: string): string | null {
    let current = path.resolve(start);

    while (true) {
        if (isRepositoryRoot(current)) {
            return current;
        }

        const parent = path.dirname(current);
        if (parent === current) {
            return null;
        }

        current = parent;
    }
}

function isRepositoryRoot(dirPath: string): boolean {
    try {
        const packageJsonPath = path.join(dirPath, 'package.json');
        const packageJsonRaw = requireText(packageJsonPath);
        if (!packageJsonRaw) {
            return false;
        }

        const parsed = JSON.parse(packageJsonRaw) as PackageJsonLike;
        return Array.isArray(parsed.workspaces);
    } catch {
        return false;
    }
}

function requireText(filePath: string): string | null {
    try {
        return readFileSync(filePath, 'utf-8');
    } catch {
        return null;
    }
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
    try {
        const raw = await readFile(filePath, 'utf-8');
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

async function readTextFile(filePath: string, fallback: string | null): Promise<string | null> {
    try {
        return await readFile(filePath, 'utf-8');
    } catch {
        return fallback;
    }
}

async function ensurePathAbsent(filePath: string): Promise<void> {
    if (await pathExists(filePath)) {
        throw new Error(`Target path already exists: ${filePath}`);
    }
}
