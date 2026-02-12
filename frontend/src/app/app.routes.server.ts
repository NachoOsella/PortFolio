import { RenderMode, ServerRoute } from '@angular/ssr';

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
