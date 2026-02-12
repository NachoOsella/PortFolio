import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { BlogCardComponent } from '../../../shared/components/blog-card/blog-card.component';
import { SectionHeadingComponent } from '../../../shared/components/section-heading/section-heading.component';
import { ApiService } from '../../../core/services/api.service';
import { BlogPost } from '../../../shared/models/blog.model';

@Component({
    selector: 'app-latest-posts-section',
    standalone: true,
    imports: [RouterLink, LucideAngularModule, BlogCardComponent, SectionHeadingComponent],
    templateUrl: './latest-posts-section.component.html',
    styleUrl: './latest-posts-section.component.css',
})
export class LatestPostsSectionComponent {
    private readonly api = inject(ApiService);
    private readonly platformId = inject(PLATFORM_ID);
    readonly icons = { ArrowRight };

    latestPosts = signal<BlogPost[]>([]);
    isLoading = signal(true);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadLatestPosts();
        } else {
            this.isLoading.set(false);
        }
    }

    private loadLatestPosts(): void {
        this.api.get<BlogPost[]>('blog').subscribe({
            next: (posts) => {
                const sorted = posts
                    .filter((p) => p.published)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 3);
                this.latestPosts.set(sorted);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            },
        });
    }
}
