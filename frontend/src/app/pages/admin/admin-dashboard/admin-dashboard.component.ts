import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { ApiService } from '../../../core/services/api.service';
import { BlogPost } from '../../../shared/models/blog.model';
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
    isLoading = signal(true);
    deleteConfirm = signal<string | null>(null);

    icons = { Plus, Edit, Trash2, LogOut, ExternalLink };

    ngOnInit(): void {
        this.seo.updateTitle('Admin Dashboard | Nacho.dev');
        this.loadPosts();
    }

    loadPosts(): void {
        this.isLoading.set(true);
        this.api.get<BlogPost[]>('/admin/posts').subscribe({
            next: (data) => {
                this.posts.set(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            },
        });
    }

    confirmDelete(slug: string): void {
        this.deleteConfirm.set(slug);
    }

    cancelDelete(): void {
        this.deleteConfirm.set(null);
    }

    deletePost(slug: string): void {
        this.api.delete<void>(`/admin/posts/${slug}`).subscribe({
            next: () => {
                this.posts.update((posts) => posts.filter((p) => p.slug !== slug));
                this.deleteConfirm.set(null);
            },
        });
    }

    logout(): void {
        this.authService.logout().subscribe(() => {
            this.router.navigate(['/admin/login']);
        });
    }
}
