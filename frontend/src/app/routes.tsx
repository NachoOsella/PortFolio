import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { HomePage } from '@/pages/public/home';
import { ApplicationError, NotFound } from '@/components/RouteStates';
import { LoadingState } from '@/components/ui';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

const ProjectsPage = lazy(() =>
  import('@/pages/public/projects').then((module) => ({ default: module.ProjectsPage })),
);
const ProjectPage = lazy(() =>
  import('@/pages/public/projects').then((module) => ({ default: module.ProjectPage })),
);
const BlogPage = lazy(() =>
  import('@/pages/public/blog').then((module) => ({ default: module.BlogPage })),
);
const BlogPostPage = lazy(() =>
  import('@/pages/public/blog').then((module) => ({ default: module.BlogPostPage })),
);
const AboutPage = lazy(() =>
  import('@/pages/public/staticPages').then((module) => ({ default: module.AboutPage })),
);
const StaticPage = lazy(() =>
  import('@/pages/public/staticPages').then((module) => ({ default: module.StaticPage })),
);
const ContactPage = lazy(() =>
  import('@/pages/public/contact').then((module) => ({ default: module.ContactPage })),
);
const LoginPage = lazy(() =>
  import('@/pages/public/login').then((module) => ({ default: module.LoginPage })),
);

const AdminLayout = lazy(() =>
  import('@/layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })),
);
const AdminOverview = lazy(() =>
  import('@/pages/admin/overview').then((module) => ({ default: module.AdminOverview })),
);
const AdminContent = lazy(() =>
  import('@/pages/admin/content').then((module) => ({ default: module.AdminContent })),
);
const AdminProjects = lazy(() =>
  import('@/pages/admin/projects').then((module) => ({ default: module.AdminProjects })),
);
const AdminPosts = lazy(() =>
  import('@/pages/admin/posts').then((module) => ({ default: module.AdminPosts })),
);
const AdminPages = lazy(() =>
  import('@/pages/admin/pages').then((module) => ({ default: module.AdminPages })),
);
const AdminAbout = lazy(() =>
  import('@/pages/admin/about').then((module) => ({ default: module.AdminAbout })),
);
const AdminFiles = lazy(() =>
  import('@/pages/admin/files').then((module) => ({ default: module.AdminFiles })),
);
const AdminGit = lazy(() =>
  import('@/pages/admin/git').then((module) => ({ default: module.AdminGit })),
);
const AdminMessages = lazy(() =>
  import('@/pages/admin/messages').then((module) => ({ default: module.AdminMessages })),
);
const AdminSettings = lazy(() =>
  import('@/pages/admin/settings').then((module) => ({ default: module.AdminSettings })),
);
const EditorPage = lazy(() =>
  import('@/pages/admin/editor').then((module) => ({ default: module.EditorPage })),
);

function deferred(element: ReactNode) {
  return <Suspense fallback={<LoadingState label="Loading workspace" />}>{element}</Suspense>;
}

function deferredPublic(element: ReactNode) {
  return <Suspense fallback={<LoadingState label="Loading page" />}>{element}</Suspense>;
}

export const routes: RouteObject[] = [  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ApplicationError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', element: deferredPublic(<ProjectsPage />) },
      { path: 'projects/:slug', element: deferredPublic(<ProjectPage />) },
      { path: 'blog', element: deferredPublic(<BlogPage />) },
      { path: 'blog/:slug', element: deferredPublic(<BlogPostPage />) },
      { path: 'about', element: deferredPublic(<AboutPage />) },
      { path: 'now', element: deferredPublic(<StaticPage slug="now" />) },
      { path: 'uses', element: deferredPublic(<StaticPage slug="uses" />) },
      { path: 'contact', element: deferredPublic(<ContactPage />) },
      { path: 'login', element: deferredPublic(<LoginPage />) },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    errorElement: <ApplicationError />,
    children: [
      {
        element: deferred(<AdminLayout />),
        children: [
          { index: true, element: deferred(<AdminOverview />) },
          { path: 'content', element: deferred(<AdminContent />) },
          { path: 'projects', element: deferred(<AdminProjects />) },
          { path: 'projects/new', element: deferred(<EditorPage collection="projects" />) },
          { path: 'projects/:slug/edit', element: deferred(<EditorPage collection="projects" />) },
          { path: 'posts', element: deferred(<AdminPosts />) },
          { path: 'posts/new', element: deferred(<EditorPage collection="posts" />) },
          { path: 'posts/:slug/edit', element: deferred(<EditorPage collection="posts" />) },
          { path: 'about', element: deferred(<AdminAbout />) },
          {
            path: 'about/edit',
            element: deferred(<EditorPage collection="pages" fixedSlug="about" />),
          },
          { path: 'pages', element: deferred(<AdminPages />) },
          { path: 'pages/new', element: deferred(<EditorPage collection="pages" />) },
          { path: 'pages/:slug/edit', element: deferred(<EditorPage collection="pages" />) },
          { path: 'files', element: deferred(<AdminFiles />) },
          { path: 'git', element: deferred(<AdminGit />) },
          { path: 'messages', element: deferred(<AdminMessages />) },
          { path: 'settings', element: deferred(<AdminSettings />) },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
];

let browserRouter: ReturnType<typeof createBrowserRouter> | null = null;

/**
 * Created lazily so the module can also be imported in SSR, where
 * `document` does not exist. The prerender pass uses `routes` with a
 * memory router instead.
 */
export function getBrowserRouter() {
  return (browserRouter ??= createBrowserRouter(routes));
}