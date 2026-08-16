import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough } from 'node:stream';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { AuthProvider } from '@/context/AuthContext';
import { routes } from '@/app/routes';
import { contentRepository } from '@/repositories/contentRepository';
import { isPubliclyVisible } from '@/lib/content';
import type { ContentCollection } from '@/types';

/**
 * Server entry used by the prerender pass (scripts/prerender.ts). It renders
 * each public route to static HTML with React 19 streaming, prefetching the
 * collections each page needs from the same repository contract the browser
 * uses — so the static markup and the hydrated client stay in sync.
 */
function collectionsFor(url: string): ContentCollection[] {
  if (url === '/' || url.startsWith('/projects')) return ['projects', 'posts'];
  if (url.startsWith('/blog')) return ['posts'];
  return ['pages'];
}

/**
 * Preload every module the public routes lazy-import so React resolves each
 * Suspense boundary synchronously during rendering — the output then contains
 * real content instead of `<!--$?-->` pending segments, and is deterministic.
 * Guarded by import.meta.env.SSR so client bundles drop the branch entirely.
 */
async function preloadLazyModules() {
  if (!import.meta.env.SSR) return;
  const modules = [
    '/src/components/HorizontalProjects',
    '/src/components/WritingIndex',
    '/src/components/MarkdownRenderer',
  ];
  await Promise.all(modules.map((id) => import(/* @vite-ignore */ id)));
}

export async function render(url: string): Promise<string> {
  await preloadLazyModules();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  });
  const router = createMemoryRouter(routes, { initialEntries: [url] });

  for (const collection of collectionsFor(url)) {
    await queryClient.prefetchQuery({
      queryKey: ['public-documents', collection],
      queryFn: async () => {
        const summaries = await contentRepository.listFiles({ collection });
        const documents = await Promise.all(
          summaries.map((summary) => contentRepository.getFile(summary.path)),
        );
        return documents.filter((document) => isPubliclyVisible(document.frontmatter));
      },
    });
  }

  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    const buffer = new PassThrough();
    buffer.on('data', (chunk: Buffer) => chunks.push(chunk.toString()));
    buffer.on('end', () => resolve(chunks.join('')));
    buffer.on('error', reject);

    const stream = renderToPipeableStream(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          {/* Render motion components at their final, visible state so the
              static HTML is meaningful without JavaScript. */}
          <MotionConfig reducedMotion="always">
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </MotionConfig>
        </QueryClientProvider>
      </StrictMode>,
      {
        onShellError: reject,
        onError: reject,
        onAllReady() {
          stream.pipe(buffer);
        },
      },
    );
  });
}