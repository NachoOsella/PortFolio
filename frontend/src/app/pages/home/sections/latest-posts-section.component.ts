import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { catchError } from 'rxjs';
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
export class LatestPostsSectionComponent implements OnInit {
    private readonly api = inject(ApiService);
    private readonly http = inject(HttpClient);
    readonly icons = { ArrowRight };

    latestPosts = signal<BlogPost[]>([]);
    isLoading = signal(true);

    ngOnInit(): void {
        this.loadLatestPosts();
    }

    private loadLatestPosts(): void {
        this.isLoading.set(true);

        this.http
            .get<BlogPost[]>('/generated/blog-index.json')
            .pipe(catchError(() => this.api.get<BlogPost[]>('/blog')))
            .subscribe({
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
