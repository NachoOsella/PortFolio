import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PublicLayoutV2 } from '@/layouts/PublicLayoutV2';
import {
  HomePage,
  ProjectsPage,
  ProjectPage,
  BlogPage,
  BlogPostPage,
  AboutPage,
  ContactPage,
  LoginPage,
} from '@/pages/public-v2';
import { NotFound } from '@/components/RouteStates';
import { LoadingState } from '@/components/ui';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

const AdminLayout = lazy(() =>
  import('@/layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })),
);
const AdminOverview = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminOverview })),
);
const AdminContent = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminContent })),
);
const AdminProjects = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminProjects })),
);
const AdminPosts = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminPosts })),
);
const AdminPages = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminPages })),
);
const AdminFiles = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminFiles })),
);
const AdminGit = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminGit })),
);
const AdminMessages = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminMessages })),
);
const AdminSettings = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminSettings })),
);
const EditorPage = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.EditorPage })),
);

function deferred(element: ReactNode) {
  return <Suspense fallback={<LoadingState label="Loading workspace" />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayoutV2 />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:slug', element: <ProjectPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/:slug', element: <BlogPostPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
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
          { path: 'pages', element: deferred(<AdminPages />) },
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
]);
