import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { ApiService } from '../../../core/services/api.service';
import { BlogPost } from '../../../shared/models/blog.model';
import { Project } from '../../../shared/models/project.model';
import { Plus, Edit, Trash2, LogOut, ExternalLink, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
    private readonly authService = inject(AdminAuthService);
    private readonly router = inject(Router);
    private readonly seo = inject(SeoService);
    private readonly api = inject(ApiService);

    posts = signal<BlogPost[]>([]);
    projects = signal<Project[]>([]);
    isLoadingPosts = signal(true);
    isLoadingProjects = signal(true);
    deleteConfirmPost = signal<string | null>(null);
    deleteConfirmProject = signal<string | null>(null);
    activeTab = signal<'posts' | 'projects'>('posts');

    icons = { Plus, Edit, Trash2, LogOut, ExternalLink };

    ngOnInit(): void {
        this.seo.updateTitle('Admin Dashboard | Nacho.dev');
        this.loadPosts();
        this.loadProjects();
    }

    loadPosts(): void {
        this.isLoadingPosts.set(true);
        this.api.get<BlogPost[]>('/admin/posts').subscribe({
            next: (data) => {
                this.posts.set(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                this.isLoadingPosts.set(false);
            },
            error: () => {
                this.isLoadingPosts.set(false);
            },
        });
    }

    loadProjects(): void {
        this.isLoadingProjects.set(true);
        this.api.get<Project[]>('/admin/projects').subscribe({
            next: (data) => {
                this.projects.set(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                this.isLoadingProjects.set(false);
            },
            error: () => {
                this.isLoadingProjects.set(false);
            },
        });
    }

    setActiveTab(tab: 'posts' | 'projects'): void {
        this.activeTab.set(tab);
    }

    confirmDeletePost(slug: string): void {
        this.deleteConfirmPost.set(slug);
    }

    cancelDeletePost(): void {
        this.deleteConfirmPost.set(null);
    }

    deletePost(slug: string): void {
        this.api.delete<{ success: boolean }>(`/admin/posts/${slug}`).subscribe({
            next: () => {
                this.posts.update((posts) => posts.filter((p) => p.slug !== slug));
                this.deleteConfirmPost.set(null);
            },
        });
    }

    confirmDeleteProject(id: string): void {
        this.deleteConfirmProject.set(id);
    }

    cancelDeleteProject(): void {
        this.deleteConfirmProject.set(null);
    }

    deleteProject(id: string): void {
        this.api.delete<{ success: boolean }>(`/admin/projects/${id}`).subscribe({
            next: () => {
                this.projects.update((projects) => projects.filter((p) => p.id !== id));
                this.deleteConfirmProject.set(null);
            },
        });
    }

    logout(): void {
        this.authService.logout().subscribe(() => {
            this.router.navigate(['/admin/login']);
        });
    }
}
