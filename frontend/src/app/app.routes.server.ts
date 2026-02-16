import { access, readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RenderMode, ServerRoute } from '@angular/ssr';

interface BlogIndexItem {
    slug: string;
    published: boolean;
}

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

async function resolveBlogIndexPath(): Promise<string | null> {
    const candidates = [
        path.resolve(process.cwd(), '../generated/blog-index.json'),
        path.resolve(process.cwd(), 'generated/blog-index.json'),
        path.resolve(moduleDir, '../../../generated/blog-index.json'),
    ];

    for (const candidate of candidates) {
        try {
            await access(candidate);
            return candidate;
        } catch {
            // Continue to next candidate path.
        }
    }

    return null;
}

async function getBlogPrerenderParams(): Promise<Record<string, string>[]> {
    try {
        const blogIndexPath = await resolveBlogIndexPath();
        if (!blogIndexPath) {
            return [];
        }

        const raw = await readFile(blogIndexPath, 'utf-8');
        const posts = JSON.parse(raw) as BlogIndexItem[];
        return posts
            .filter((post) => post.published && typeof post.slug === 'string')
            .map((post) => ({ slug: post.slug }));
    } catch {
        return [];
    }
}

export const serverRoutes: ServerRoute[] = [
    {
        path: '',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'projects',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'blog',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'blog/:slug',
        renderMode: RenderMode.Prerender,
        async getPrerenderParams() {
            return getBlogPrerenderParams();
        },
    },
    {
        path: 'about',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'contact',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'admin/login',
        renderMode: RenderMode.Client,
    },
    {
        path: 'admin',
        renderMode: RenderMode.Client,
    },
    {
        path: 'admin/new',
        renderMode: RenderMode.Client,
    },
    {
        path: 'admin/edit/:slug',
        renderMode: RenderMode.Client,
    },
    {
        path: '**',
        renderMode: RenderMode.Server,
    },
];
