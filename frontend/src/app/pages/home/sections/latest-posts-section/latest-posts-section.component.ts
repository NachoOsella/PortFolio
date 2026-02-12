import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { BlogCardComponent } from '../../../../shared/components/blog-card/blog-card.component';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { ApiService } from '../../../../core/services/api.service';
import { BlogPost } from '../../../../shared/models/blog.model';

type BlogPostPayload = Partial<BlogPost> & {
    meta?: Partial<BlogPost>;
};

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
            .pipe(
                catchError(() => this.api.get<BlogPost[]>('/blog')),
                switchMap((posts) => {
                    const latestPublishedPosts = posts
                        .filter((p) => p.published)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 3);

                    if (!latestPublishedPosts.length) {
                        return of([] as BlogPost[]);
                    }

                    const postSyncRequests = latestPublishedPosts.map((post) =>
                        this.http.get<BlogPostPayload>(`/generated/blog/${post.slug}/index.json`).pipe(
                            map((fullPost) => {
                                const fullPostCover = fullPost.meta?.coverImage ?? fullPost.coverImage;
                                return this.normalizePost({
                                    ...post,
                                    coverImage: fullPostCover ?? post.coverImage,
                                });
                            }),
                            catchError(() => of(this.normalizePost(post)))
                        )
                    );

                    return forkJoin(postSyncRequests);
                })
            )
            .subscribe({
                next: (posts) => {
                    this.latestPosts.set(posts);
                    this.isLoading.set(false);
                },
                error: () => {
                    this.isLoading.set(false);
                },
            });
    }

    private normalizePost(post: BlogPost): BlogPost {
        return {
            ...post,
            coverImage: this.normalizeCoverImage(post.coverImage, post.slug),
        };
    }

    private normalizeCoverImage(coverImage: string | undefined, slug: string): string | undefined {
        if (!coverImage) {
            return undefined;
        }

        if (/^https?:\/\//.test(coverImage) || coverImage.startsWith('/')) {
            return coverImage;
        }

        if (coverImage.startsWith('./')) {
            return `/generated/blog/${slug}/${coverImage.slice(2)}`;
        }

        return `/generated/blog/${slug}/${coverImage}`;
    }
}
