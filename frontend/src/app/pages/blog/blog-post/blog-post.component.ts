import { Component, inject, signal, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SeoService } from '../../../core/services/seo.service';
import { BlogPost } from '../../../shared/models/blog.model';
import { HttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import { ArrowLeft, Twitter, Linkedin, Link2, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-blog-post',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule],
    templateUrl: './blog-post.component.html',
    styleUrl: './blog-post.component.css',
})
export class BlogPostComponent implements OnInit, AfterViewInit {
    @ViewChild('contentRef') contentRef!: ElementRef<HTMLElement>;

    private readonly route = inject(ActivatedRoute);
    private readonly api = inject(ApiService);
    private readonly seo = inject(SeoService);
    private readonly http = inject(HttpClient);

    post = signal<BlogPost | null>(null);
    prevPost = signal<BlogPost | null>(null);
    nextPost = signal<BlogPost | null>(null);
    isLoading = signal(true);
    error = signal<string | null>(null);
    activeHeading = signal<string>('');
    tocOpen = signal(false);

    icons = { ArrowLeft, Twitter, Linkedin, Link2 };

    ngOnInit(): void {
        this.route.params.pipe(
            switchMap((params) => {
                const slug = params['slug'];
                return this.loadPost(slug);
            })
        ).subscribe({
            next: (result) => {
                if (result.post) {
                    this.post.set(result.post);
                    this.prevPost.set(result.prev || null);
                    this.nextPost.set(result.next || null);
                    this.seo.updateTitle(`${result.post.title} | Blog | Nacho.dev`);
                    this.seo.updateMetaTags({
                        description: result.post.excerpt,
                    });
                } else {
                    this.error.set('Post not found');
                }
                this.isLoading.set(false);
            },
            error: () => {
                this.error.set('Failed to load post');
                this.isLoading.set(false);
            },
        });
    }

    ngAfterViewInit(): void {
        this.setupScrollSpy();
    }

    toggleToc(): void {
        this.tocOpen.update((v) => !v);
    }

    scrollToSection(id: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            this.tocOpen.set(false);
        }
    }

    shareOnTwitter(): void {
        if (!this.post()) return;
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(this.post()!.title);
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    }

    shareOnLinkedIn(): void {
        if (!this.post()) return;
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    }

    copyLink(): void {
        navigator.clipboard.writeText(window.location.href);
    }

    private loadPost(slug: string) {
        return this.http.get<BlogPost[]>(`/generated/blog-index.json`).pipe(
            catchError(() => this.api.get<BlogPost[]>('/blog')),
            switchMap((posts) => {
                const index = posts.findIndex((p) => p.slug === slug && p.published);
                if (index === -1) {
                    return of({ post: null, prev: null, next: null });
                }

                const prev = index < posts.length - 1 ? posts[index + 1] : null;
                const next = index > 0 ? posts[index - 1] : null;

                return this.http.get<BlogPost>(`/generated/blog/${slug}/index.json`).pipe(
                    catchError(() => this.api.get<BlogPost>(`/blog/${slug}`)),
                    switchMap((fullPost) => of({ post: fullPost, prev, next }))
                );
            })
        );
    }

    private setupScrollSpy(): void {
        if (!this.post()?.toc?.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.activeHeading.set(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -80% 0px' }
        );

        this.post()?.toc?.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });
    }
}
