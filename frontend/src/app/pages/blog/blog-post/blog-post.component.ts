import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
    ViewEncapsulation,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { ApiService } from '../../../core/services/api.service';
import { SeoService } from '../../../core/services/seo.service';
import { ScrollAnimationService } from '../../../core/services/scroll-animation.service';
import { BlogPost, TocItem } from '../../../shared/models/blog.model';
import { HttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import {
    ArrowLeft,
    Calendar,
    ChevronDown,
    Link2,
    Linkedin,
    LucideAngularModule,
} from 'lucide-angular';

type BlogPostPayload = Partial<BlogPost> & {
    meta?: Partial<BlogPost>;
};

@Component({
    selector: 'app-blog-post',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule, MarkdownModule, NgOptimizedImage],
    templateUrl: './blog-post.component.html',
    styleUrl: './blog-post.component.css',
    encapsulation: ViewEncapsulation.None,
})
export class BlogPostComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly api = inject(ApiService);
    private readonly seo = inject(SeoService);
    private readonly http = inject(HttpClient);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly scrollAnimationService = inject(ScrollAnimationService);

    private headingObserver: IntersectionObserver | null = null;

    post = signal<BlogPost | null>(null);
    prevPost = signal<BlogPost | null>(null);
    nextPost = signal<BlogPost | null>(null);
    isLoading = signal(true);
    error = signal<string | null>(null);
    activeHeading = signal<string>('');
    tocOpen = signal(false);
    tocItems = signal<TocItem[]>([]);
    readonly tocPanelId = 'blog-post-mobile-toc';
    
    readonly tocColumn = viewChild<ElementRef<HTMLElement>>('tocColumn');
    readonly backButton = viewChild<ElementRef<HTMLAnchorElement>>('backButton');
    readonly postHeader = viewChild<ElementRef<HTMLElement>>('postHeader');
    readonly mobileToc = viewChild<ElementRef<HTMLDivElement>>('mobileToc');
    readonly contentContainerRef = viewChild<ElementRef<HTMLElement>>('contentContainerRef');
    readonly postNav = viewChild<ElementRef<HTMLElement>>('postNav');

    icons = { ArrowLeft, Calendar, ChevronDown, Linkedin, Link2 };

    ngOnInit(): void {
        this.route.params.pipe(
            switchMap((params) => {
                this.isLoading.set(true);
                this.error.set(null);
                this.activeHeading.set('');
                this.tocItems.set([]);
                this.tocOpen.set(false);
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
                    this.updateSeoForPost(result.post);
                    this.queueScrollSpySetup();
                } else {
                    this.error.set('Post not found');
                }
                this.isLoading.set(false);
                
                setTimeout(() => {
                    this.observeElements();
                });
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

    ngOnDestroy(): void {
        this.headingObserver?.disconnect();
    }

    toggleToc(): void {
        this.tocOpen.update((v) => !v);
    }

    scrollToSection(id: string): void {
        if (!this.isBrowser) {
            return;
        }

        const element = this.findHeadingElement(id);
        if (!element) {
            window.location.hash = id;
            return;
        }

        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        this.activeHeading.set(id);
        this.tocOpen.set(false);

        if (window.history?.replaceState) {
            window.history.replaceState(null, '', `#${id}`);
        }
    }

    shareOnLinkedIn(): void {
        if (!this.isBrowser || !this.post()) return;
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    }

    copyLink(): void {
        if (!this.isBrowser || !navigator.clipboard?.writeText) {
            return;
        }

        void navigator.clipboard.writeText(window.location.href);
    }

    private updateSeoForPost(post: BlogPost): void {
        const postPath = `/blog/${post.slug}`;
        const postUrl = this.seo.buildAbsoluteUrl(postPath);
        const ogImage = this.seo.buildAbsoluteUrl(post.coverImage || '/og-image.png');
        const publishedAt = new Date(post.date).toISOString();

        this.seo.setCanonicalForPath(postPath);
        this.seo.setDefaultSocial({
            title: `${post.title} | Blog | Nacho.dev`,
            description: post.excerpt,
            path: postPath,
            type: 'article',
            imagePath: post.coverImage || '/og-image.png',
        });
        this.seo.setJsonLd([
            {
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: post.title,
                description: post.excerpt,
                datePublished: publishedAt,
                dateModified: publishedAt,
                image: [ogImage],
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': postUrl,
                },
                author: {
                    '@type': 'Person',
                    name: 'Ignacio',
                },
                publisher: {
                    '@type': 'Person',
                    name: 'Ignacio',
                },
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
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: post.title,
                        item: postUrl,
                    },
                ],
            },
        ]);
    }

    private loadPost(slug: string) {
        return this.http.get<BlogPost[]>(`/generated/blog-index.json`).pipe(
            catchError(() => this.api.get<BlogPost[]>('/blog')),
            switchMap((posts) => {
                const publishedPosts = posts
                    .filter((post) => post.published)
                    .map((post) => this.normalizeListPost(post));
                const index = publishedPosts.findIndex((post) => post.slug === slug);
                if (index === -1) {
                    return of({ post: null, prev: null, next: null });
                }

                const prev = index < publishedPosts.length - 1 ? publishedPosts[index + 1] : null;
                const next = index > 0 ? publishedPosts[index - 1] : null;

                return this.http.get<BlogPostPayload>(`/generated/blog/${slug}/index.json`).pipe(
                    catchError(() => this.api.get<BlogPostPayload>(`/blog/${slug}`)),
                    switchMap((fullPost) =>
                        of({
                            post: this.normalizePost(fullPost, publishedPosts[index]),
                            prev,
                            next,
                        })
                    )
                );
            })
        );
    }

    private normalizeListPost(post: BlogPost): BlogPost {
        return {
            ...post,
            tags: this.normalizeTags(post.tags),
            coverImage: this.normalizeCoverImage(post.coverImage, post.slug),
        };
    }

    private normalizePost(payload: BlogPostPayload, fallbackPost?: BlogPost): BlogPost {
        const { meta, ...postWithoutMeta } = payload;
        const mergedPost: Partial<BlogPost> = {
            ...fallbackPost,
            ...meta,
            ...postWithoutMeta,
        };
        const slug = mergedPost.slug ?? fallbackPost?.slug ?? '';
        const decoratedContent = this.decorateContentWithHeadingIds(mergedPost.content ?? '');

        return {
            slug,
            title: mergedPost.title ?? fallbackPost?.title ?? 'Untitled post',
            date: mergedPost.date ?? fallbackPost?.date ?? new Date().toISOString(),
            tags: this.normalizeTags(mergedPost.tags),
            excerpt: mergedPost.excerpt ?? fallbackPost?.excerpt ?? '',
            published: mergedPost.published ?? fallbackPost?.published ?? true,
            featured: mergedPost.featured ?? fallbackPost?.featured ?? false,
            coverImage: this.normalizeCoverImage(mergedPost.coverImage, slug),
            content: decoratedContent.content,
            toc: decoratedContent.toc.length
                ? decoratedContent.toc
                : this.normalizeToc(mergedPost.toc),
        };
    }

    private normalizeTags(tags: string[] | undefined): string[] {
        if (!tags?.length) {
            return [];
        }

        const uniqueTags = new Set<string>();
        tags.forEach((tag) => {
            const value = tag.trim().toLowerCase();
            if (value) {
                uniqueTags.add(value);
            }
        });

        return Array.from(uniqueTags);
    }

    private normalizeToc(toc: TocItem[] | undefined): TocItem[] {
        if (!toc?.length) {
            return [];
        }

        return toc.filter(
            (item) => !!item.id?.trim() && !!item.text?.trim() && item.level >= 2 && item.level <= 4
        );
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

    private decorateContentWithHeadingIds(content: string): { content: string; toc: TocItem[] } {
        if (!content) {
            return { content: '', toc: [] };
        }

        const usedIds = new Map<string, number>();
        const toc: TocItem[] = [];
        const headingRegex = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi;
        const enhancedContent = content.replace(
            headingRegex,
            (match: string, levelValue: string, attributes: string, innerHtml: string) => {
                const level = Number(levelValue);
                const headingText = this.extractHeadingText(innerHtml);
                if (!headingText) {
                    return match;
                }

                const existingIdMatch = attributes.match(/\sid=(['"])(.*?)\1/i);
                const baseId = existingIdMatch?.[2] ?? this.slugify(headingText);
                const id = this.makeUniqueId(baseId, usedIds);
                const updatedAttributes = existingIdMatch
                    ? attributes.replace(existingIdMatch[0], ` id="${id}"`)
                    : `${attributes} id="${id}"`;

                if (level >= 2 && level <= 4) {
                    toc.push({
                        id,
                        text: headingText,
                        level,
                    });
                }

                return `<h${level}${updatedAttributes}>${innerHtml}</h${level}>`;
            }
        );

        return {
            content: enhancedContent,
            toc,
        };
    }

    private extractHeadingText(headingHtml: string): string {
        const plainText = headingHtml.replace(/<[^>]+>/g, '');
        return this.decodeHtmlEntities(plainText).trim();
    }

    private decodeHtmlEntities(text: string): string {
        return text
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }

    private slugify(value: string): string {
        return value
            .toLowerCase()
            .replace(/&[a-z0-9#]+;/gi, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    private makeUniqueId(baseId: string, usedIds: Map<string, number>): string {
        const normalizedBaseId = this.slugify(baseId) || 'section';
        const count = usedIds.get(normalizedBaseId) ?? 0;
        usedIds.set(normalizedBaseId, count + 1);

        return count === 0 ? normalizedBaseId : `${normalizedBaseId}-${count + 1}`;
    }

    private queueScrollSpySetup(): void {
        if (!this.isBrowser) {
            return;
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.syncTocFromRenderedContent();
                this.setupScrollSpy();
            });
        });
    }

    private findHeadingElement(id: string): HTMLElement | null {
        const container = this.contentContainerRef()?.nativeElement;
        const scopedElement = container?.querySelector<HTMLElement>(`[id="${id}"]`) ?? null;

        if (scopedElement) {
            return scopedElement;
        }

        return document.getElementById(id);
    }

    private syncTocFromRenderedContent(): void {
        const container = this.contentContainerRef()?.nativeElement;
        if (!container) {
            return;
        }

        const headings = Array.from(container.querySelectorAll<HTMLElement>('h2, h3, h4'));
        if (!headings.length) {
            this.tocItems.set([]);
            return;
        }

        const usedIds = new Map<string, number>();
        const items: TocItem[] = headings
            .map((heading) => {
                const text = heading.textContent?.trim() ?? '';
                if (!text) {
                    return null;
                }

                const baseId = heading.id || this.slugify(text);
                const id = this.makeUniqueId(baseId, usedIds);
                heading.id = id;

                return {
                    id,
                    text,
                    level: Number(heading.tagName.slice(1)),
                };
            })
            .filter((item): item is TocItem => item !== null);

        this.tocItems.set(items);

        if (items.length && !this.activeHeading()) {
            this.activeHeading.set(items[0].id);
        }
    }

    private setupScrollSpy(): void {
        if (!this.isBrowser || !this.tocItems().length) {
            return;
        }

        this.headingObserver?.disconnect();

        const headings = this.tocItems()
            .map((item) => this.findHeadingElement(item.id))
            .filter((item): item is HTMLElement => !!item);

        if (!headings.length) {
            return;
        }

        this.activeHeading.set(headings[0].id);

        this.headingObserver = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visibleEntries.length > 0) {
                    this.activeHeading.set(visibleEntries[0].target.id);
                }
            },
            {
                rootMargin: '-20% 0px -65% 0px',
                threshold: [0.1, 0.25, 0.5, 0.75],
            }
        );

        headings.forEach((heading) => {
            this.headingObserver?.observe(heading);
        });
    }

    private observeElements(): void {
        // TOC column (desktop)
        const toc = this.tocColumn();
        if (toc) {
            this.scrollAnimationService.observe(toc.nativeElement);
        }

        // Back button
        const back = this.backButton();
        if (back) {
            this.scrollAnimationService.observe(back.nativeElement);
        }

        // Post header
        const header = this.postHeader();
        if (header) {
            this.scrollAnimationService.observe(header.nativeElement);
        }

        // Mobile TOC
        const mobile = this.mobileToc();
        if (mobile) {
            this.scrollAnimationService.observe(mobile.nativeElement);
        }

        // Content area
        const content = this.contentContainerRef();
        if (content) {
            this.scrollAnimationService.observe(content.nativeElement);
        }

        // Post navigation
        const nav = this.postNav();
        if (nav) {
            this.scrollAnimationService.observe(nav.nativeElement);
        }
    }
}
