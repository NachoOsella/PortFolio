#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface BlogIndexItem {
    slug: string;
    date: string;
    published: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const GENERATED_DIR = path.join(ROOT_DIR, 'generated');
const FRONTEND_PUBLIC_DIR = path.join(ROOT_DIR, 'frontend', 'public');
const BLOG_INDEX_PATH = path.join(GENERATED_DIR, 'blog-index.json');
const SITEMAP_PATH = path.join(FRONTEND_PUBLIC_DIR, 'sitemap.xml');
const ROBOTS_PATH = path.join(FRONTEND_PUBLIC_DIR, 'robots.txt');

const DEFAULT_SITE_URL = 'http://localhost:4200';
const STATIC_ROUTES = ['/', '/projects', '/blog', '/about', '/contact'];

function ensureDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function normalizeSiteUrl(rawUrl: string | undefined): string {
    if (!rawUrl || rawUrl.trim().length === 0) {
        return DEFAULT_SITE_URL;
    }

    return rawUrl.trim().replace(/\/+$/, '');
}

function xmlEscape(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function loadBlogRoutes(): Array<{ path: string; lastmod: string }> {
    if (!fs.existsSync(BLOG_INDEX_PATH)) {
        return [];
    }

    const raw = fs.readFileSync(BLOG_INDEX_PATH, 'utf-8');
    const posts = JSON.parse(raw) as BlogIndexItem[];
    return posts
        .filter((post) => post.published)
        .map((post) => ({
            path: `/blog/${post.slug}`,
            lastmod: new Date(post.date).toISOString(),
        }));
}

function buildSitemapXml(
    siteUrl: string,
    staticRoutes: Array<{ path: string; lastmod: string }>,
    blogRoutes: Array<{ path: string; lastmod: string }>,
): string {
    const allRoutes = [...staticRoutes, ...blogRoutes];
    const entries = allRoutes
        .map((route) => {
            const loc = xmlEscape(`${siteUrl}${route.path}`);
            const lastmod = xmlEscape(route.lastmod);
            return [
                '  <url>',
                `    <loc>${loc}</loc>`,
                `    <lastmod>${lastmod}</lastmod>`,
                '  </url>',
            ].join('\n');
        })
        .join('\n');

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        entries,
        '</urlset>',
        '',
    ].join('\n');
}

function buildRobotsTxt(siteUrl: string): string {
    return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

function main(): void {
    const siteUrl = normalizeSiteUrl(process.env.SITE_URL);
    const now = new Date().toISOString();

    ensureDirectory(FRONTEND_PUBLIC_DIR);

    const staticRoutes = STATIC_ROUTES.map((route) => ({
        path: route,
        lastmod: now,
    }));
    const blogRoutes = loadBlogRoutes();

    const sitemapXml = buildSitemapXml(siteUrl, staticRoutes, blogRoutes);
    const robotsTxt = buildRobotsTxt(siteUrl);

    fs.writeFileSync(SITEMAP_PATH, sitemapXml, 'utf-8');
    fs.writeFileSync(ROBOTS_PATH, robotsTxt, 'utf-8');

    console.log(`✅ Generated sitemap: ${path.relative(ROOT_DIR, SITEMAP_PATH)}`);
    console.log(`✅ Generated robots: ${path.relative(ROOT_DIR, ROBOTS_PATH)}`);
    console.log(
        `ℹ️  Entries: ${staticRoutes.length + blogRoutes.length} (${staticRoutes.length} static, ${blogRoutes.length} blog)`,
    );
}

main();
