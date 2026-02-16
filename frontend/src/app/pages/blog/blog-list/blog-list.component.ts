import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    computed,
    effect,
    inject,
    signal,
    viewChild,
    viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogCardComponent } from '../../../shared/components/blog-card/blog-card.component';
import { TagFilterComponent } from '../../../shared/components/tag-filter/tag-filter.component';
import { SectionHeadingComponent } from '../../../shared/components/section-heading/section-heading.component';
import { ApiService } from '../../../core/services/api.service';
import { SeoService } from '../../../core/services/seo.service';
import { ScrollAnimationService } from '../../../core/services/scroll-animation.service';
import { BlogPost } from '../../../shared/models/blog.model';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Search, LucideAngularModule } from 'lucide-angular';

type BlogPostPayload = Partial<BlogPost> & {
    meta?: Partial<BlogPost>;
};

@Component({
    selector: 'app-blog-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BlogCardComponent,
        TagFilterComponent,
        SectionHeadingComponent,
        LucideAngularModule,
    ],
    templateUrl: './blog-list.component.html',
    styleUrl: './blog-list.component.css',
})
export class BlogListComponent implements OnInit, AfterViewInit {
    private readonly api = inject(ApiService);
    private readonly seo = inject(SeoService);
    private readonly http = inject(HttpClient);
    private readonly scrollAnimationService = inject(ScrollAnimationService);

    posts = signal<BlogPost[]>([]);
    selectedTag = signal<string>('all');
    searchQuery = signal<string>('');
    isLoading = signal(true);
    error = signal<string | null>(null);
    
    readonly filterSection = viewChild<ElementRef<HTMLDivElement>>('filterSection');
    readonly emptyState = viewChild<ElementRef<HTMLDivElement>>('emptyState');
    readonly blogCards = viewChildren('blogCardRef', { read: ElementRef<HTMLElement> });
    readonly pageSection = viewChild<ElementRef<HTMLElement>>('pageSection');

    icons = { Search };

    constructor() {
        effect(() => {
            if (this.isLoading()) {
                return;
            }

            const cards = this.blogCards();
            if (!cards.length) {
                return;
            }

            cards.forEach((card) => {
                this.scrollAnimationService.observe(card.nativeElement);
            });

            this.observePageAnimations();
        });
    }

    allTags = computed(() => {
        const tags = new Map<string, string>();
        this.posts().forEach((post) => {
            post.tags.forEach((tag) => {
                const normalized = tag.trim().toLowerCase();
                if (!normalized || normalized === 'all' || tags.has(normalized)) {
                    return;
                }

                tags.set(normalized, normalized);
            });
        });
        return Array.from(tags.values()).sort();
    });

    filteredPosts = computed(() => {
        let result = this.posts();

        if (this.selectedTag() !== 'all') {
            result = result.filter((post) =>
                post.tags.some((tag) => tag.toLowerCase() === this.selectedTag())
            );
        }

        if (this.searchQuery().trim()) {
            const query = this.searchQuery().toLowerCase().trim();
            result = result.filter(
                (post) =>
                    post.title.toLowerCase().includes(query) ||
                    post.excerpt.toLowerCase().includes(query)
            );
        }

        return [...result].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    });

    ngOnInit(): void {
        const description = 'Thoughts on code, projects, and continuous learning.';

        this.seo.updateTitle('Blog | Nacho.dev');
        this.seo.updateMetaTags({
            description,
        });
        this.seo.setCanonicalForPath('/blog');
        this.seo.setDefaultSocial({
            title: 'Blog | Nacho.dev',
            description,
            path: '/blog',
            imagePath: '/og-image.png',
        });
        this.seo.setJsonLd([
            {
                '@context': 'https://schema.org',
                '@type': 'Blog',
                name: 'Nacho.dev Blog',
                description,
                url: this.seo.buildAbsoluteUrl('/blog'),
            },
            {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: this.seo.buildAbsoluteUrl('/'),
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Blog',
                        item: this.seo.buildAbsoluteUrl('/blog'),
                    },
                ],
            },
        ]);

        this.loadPosts();
    }

    ngAfterViewInit(): void {
        this.observePageAnimations();
    }

    onTagSelected(tag: string): void {
        this.selectedTag.set(tag.toLowerCase());
        
        setTimeout(() => {
            this.observeElements();
            this.observePageAnimations();
        });
    }

    onSearchChange(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchQuery.set(value);
    }

    private loadPosts(): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.http.get<BlogPost[]>('/generated/blog-index.json').pipe(
            catchError(() => this.api.get<BlogPost[]>('/blog')),
            switchMap((data) => {
                const publishedPosts = data.filter((post) => post.published);
                if (!publishedPosts.length) {
                    return of([] as BlogPost[]);
                }

                const coverSyncRequests = publishedPosts.map((post) =>
                    this.http
                        .get<BlogPostPayload>(`/generated/blog/${post.slug}/index.json`)
                        .pipe(
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

                return forkJoin(coverSyncRequests);
            })
        ).subscribe({
            next: (data) => {
                this.posts.set(data);
                this.isLoading.set(false);
                
                setTimeout(() => {
                    this.observeElements();
                    this.observePageAnimations();
                });
            },
            error: () => {
                this.error.set('Failed to load blog posts. Please try again later.');
                this.isLoading.set(false);
            },
        });
    }

    private normalizePost(post: BlogPost): BlogPost {
        return {
            ...post,
            tags: post.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean),
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
    
    private observeElements(): void {
        // Filter section
        const filter = this.filterSection();
        if (filter) {
            this.scrollAnimationService.observe(filter.nativeElement);
        }
        
        // Empty state
        const empty = this.emptyState();
        if (empty) {
            this.scrollAnimationService.observe(empty.nativeElement);
        }
        
    }

    private observePageAnimations(): void {
        const run = () => {
            const sectionRef = this.pageSection();
            if (!sectionRef) {
                return;
            }

            const section = sectionRef.nativeElement;
            const elements = section.querySelectorAll<HTMLElement>('.animate-on-scroll');
            elements.forEach((element) => {
                this.scrollAnimationService.observe(element);
            });
        };

        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(run);
            return;
        }

        setTimeout(run, 0);
    }
}
