/**
 * Post-build pass that produces the static site surface:
 *  - prerendered HTML for every public route (SSR via scripts + src/ssr.tsx)
 *  - robots.txt and sitemap.xml generated from the real content
 *  - a 1200x630 social preview image (og-image.png)
 *
 * Runs as `postbuild` after `vite build`. Requires Node >= 23.6 (type
 * stripping) and sharp (devDependency).
 */
import { createServer } from 'vite';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import sharp from 'sharp';

const SITE_URL = process.env.VITE_SITE_URL ?? 'https://ignacioosella.dev';
const DIST = path.resolve(process.cwd(), 'dist');
const CONTENT = path.resolve(process.cwd(), 'content');

// The prerender pass must read content from disk through the mock repository
// (which serves the local files in SSR), never from the live API. The build
// pipeline runs with VITE_API_URL set (docker/CI), which would otherwise make
// the repositories resolve to the API adapters and the static pass would
// depend on a running backend.
process.env.VITE_API_URL = '';

type Route = { path: string; lastmod: string };

async function frontmatter(raw: string): Promise<Record<string, unknown>> {
  const match = /^---\n([\s\S]*?)\n---/.exec(raw);
  if (!match) return {};
  return parse(match[1]) as Record<string, unknown>;
}

async function contentRoutes(): Promise<Route[]> {
  const routes: Route[] = [];
  const collections = [
    { dir: 'projects', prefix: '/projects' },
    { dir: 'posts', prefix: '/blog' },
  ];
  for (const { dir, prefix } of collections) {
    const files = (await readdir(path.join(CONTENT, dir))).filter((name) => name.endsWith('.md'));
    for (const filename of files.sort()) {
      const raw = await readFile(path.join(CONTENT, dir, filename), 'utf8');
      const front = await frontmatter(raw);
      const slug = String(front.slug ?? filename.replace(/\.md$/, ''));
      routes.push({ path: `${prefix}/${slug}`, lastmod: String(front.updatedAt ?? '') });
    }
  }
  const pages = (await readdir(path.join(CONTENT, 'pages'))).filter((name) => name.endsWith('.md'));
  for (const filename of pages) {
    const raw = await readFile(path.join(CONTENT, 'pages', filename), 'utf8');
    const front = await frontmatter(raw);
    const slug = String(front.slug ?? filename.replace(/\.md$/, ''));
    routes.push({ path: `/${slug}`, lastmod: String(front.updatedAt ?? '') });
  }
  return routes;
}

async function prerender(server: Awaited<ReturnType<typeof createServer>>) {
  let template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  if (!template.includes('class="app-fallback"')) {
    throw new Error('dist/index.html does not look like a fresh Vite build (missing app-fallback). Run `vite build` before the static pass.');
  }
  // The static shell carries fallback title/meta for direct hits; the SSR
  // output hoists its own head elements (React 19), so strip the static ones
  // to avoid duplicates in the prerendered files.
  template = template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta\s+name="description"[^>]*>/, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/g, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/g, '')
    .replace(/<link\s+rel="canonical"[^>]*>/, '');

  const rootMatch = /<div id="root">([\s\S]*?)<\/div>\s*<\/body>/.exec(template);
  if (!rootMatch) throw new Error('dist/index.html has no #root element to fill.');
  const moduleRender = await server.ssrLoadModule('/src/ssr.tsx');
  const render = moduleRender.render as (url: string) => Promise<string>;

  const routes: Route[] = [
    { path: '/', lastmod: '' },
    { path: '/projects', lastmod: '' },
    { path: '/blog', lastmod: '' },
    { path: '/contact', lastmod: '' },
    { path: '/about', lastmod: '' },
    { path: '/now', lastmod: '' },
    { path: '/uses', lastmod: '' },
    ...(await contentRoutes()),
  ];

  for (const route of routes) {
    // React 19's streaming output renders <title>/<meta>/<link> inside the
    // root container; browsers only hoist them on hydration. Move them into
    // the static <head> so crawlers and social scrapers read them without JS.
    const rendered = await render(route.path);
    const headTags = [
      ...(rendered.match(/<title>[\s\S]*?<\/title>/) ?? []),
      ...(rendered.match(/<meta\s[^>]*\/?>/g) ?? []),
      ...(rendered.match(/<link\s[^>]*\/?>/g) ?? []),
    ];
    const body = headTags.length
      ? headTags.reduce((html, tag) => html.replace(tag, ''), rendered)
      : rendered;
    const output = `${template.slice(0, rootMatch.index)}<div id="root">${body}</div>${template.slice(rootMatch.index + rootMatch[0].length)}`;
    const withHead = output.replace('</head>', `${headTags.join('\n    ')}</head>`);
    const target =
      route.path === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.path, 'index.html');
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, withHead);
    console.log(`prerendered ${route.path}`);
  }
}

async function writeSiteMetadata() {
  const routes: Route[] = await contentRoutes();
  const staticRoutes = ['', '/projects', '/blog', '/about', '/now', '/uses', '/contact'];
  const all = [...staticRoutes.map((p) => ({ path: p, lastmod: '' })), ...routes];

  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /login',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
  await writeFile(path.join(DIST, 'robots.txt'), robots);

  const urls = all
    .map((route) => {
      const lastmod = route.lastmod ? `\n    <lastmod>${route.lastmod.slice(0, 10)}</lastmod>` : '';
      return `  <url>\n    <loc>${SITE_URL}${route.path}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
}

const OG_SVG = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#1d2021"/>
  <g stroke="#32302f" stroke-width="1">
    <path d="M0 105h1200M0 210h1200M0 315h1200M0 420h1200M0 525h1200"/>
    <path d="M150 0v630M300 0v630M450 0v630M600 0v630M750 0v630M900 0v630M1050 0v630"/>
  </g>
  <g fill="#d3863b"><rect x="150" y="315" width="12" height="12"/><rect x="1050" y="105" width="12" height="12"/></g>
  <rect x="60" y="60" width="24" height="24" fill="none" stroke="#d3863b" stroke-width="2"/>
  <text x="100" y="84" fill="#928374" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="22" letter-spacing="4">NACHEOOSELLA.DEV</text>
  <text x="100" y="330" fill="#d4be98" font-family="Archivo, Arial, sans-serif" font-size="72" font-weight="600">Ignacio Osella</text>
  <text x="100" y="392" fill="#d3863b" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="26" letter-spacing="3">BACKEND DEVELOPER / JAVA &amp; SPRING BOOT</text>
  <text x="100" y="448" fill="#a89984" font-family="Archivo, Arial, sans-serif" font-size="24">Dependable backend systems, delivered end to end</text>
  <text x="100" y="560" fill="#928374" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="18" letter-spacing="2">CORDOBA, ARGENTINA</text>
</svg>`;

async function writeOgImage() {
  await sharp(Buffer.from(OG_SVG)).png().toFile(path.join(DIST, 'og-image.png'));
  console.log('wrote og-image.png');
}

async function main() {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    await prerender(server);
    await writeSiteMetadata();
    await writeOgImage();
  } finally {
    await server.close();
  }
  console.log('static pass complete');
}

main().catch((error) => {
  console.error('prerender failed:', error);
  process.exitCode = 1;
});