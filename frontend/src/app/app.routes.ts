import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { adminGuard } from './pages/admin/admin.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./layout/layout.component').then((m) => m.LayoutComponent),
        children: [
            {
                path: '',
                component: HomeComponent,
            },
            {
                path: 'projects',
                loadComponent: () =>
                    import('./pages/projects/projects-list/projects-list.component').then(
                        (m) => m.ProjectsListComponent,
                    ),
            },
            {
                path: 'projects/:id',
                loadComponent: () =>
                    import('./pages/projects/project-detail/project-detail.component').then(
                        (m) => m.ProjectDetailComponent,
                    ),
            },
            {
                path: 'blog',
                loadComponent: () =>
                    import('./pages/blog/blog-list/blog-list.component').then(
                        (m) => m.BlogListComponent,
                    ),
            },
            {
                path: 'blog/:slug',
                loadComponent: () =>
                    import('./pages/blog/blog-post/blog-post.component').then(
                        (m) => m.BlogPostComponent,
                    ),
            },
            {
                path: 'about',
                loadComponent: () =>
                    import('./pages/about/about.component').then((m) => m.AboutComponent),
            },
            {
                path: 'contact',
                loadComponent: () =>
                    import('./pages/contact/contact.component').then((m) => m.ContactComponent),
            },
            {
                path: 'admin/login',
                loadComponent: () =>
                    import('./pages/admin/admin-login/admin-login.component').then(
                        (m) => m.AdminLoginComponent,
                    ),
            },
            {
                path: 'admin',
                loadComponent: () =>
                    import('./pages/admin/admin-dashboard/admin-dashboard.component').then(
                        (m) => m.AdminDashboardComponent,
                    ),
                canActivate: [adminGuard],
            },
            {
                path: 'admin/new',
                loadComponent: () =>
                    import('./pages/admin/admin-editor/admin-editor.component').then(
                        (m) => m.AdminEditorComponent,
                    ),
                canActivate: [adminGuard],
            },
            {
                path: 'admin/edit/:slug',
                loadComponent: () =>
                    import('./pages/admin/admin-editor/admin-editor.component').then(
                        (m) => m.AdminEditorComponent,
                    ),
                canActivate: [adminGuard],
            },
            {
                path: '**',
                redirectTo: '',
            },
        ],
    },
];
