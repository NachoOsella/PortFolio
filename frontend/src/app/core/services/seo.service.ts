import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface MetaTagsConfig {
    description?: string;
    keywords?: string;
    author?: string;
    robots?: string;
}

export interface OpenGraphConfig {
    title?: string;
    description?: string;
    type?: string;
    url?: string;
    image?: string;
    siteName?: string;
}

export interface TwitterCardConfig {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    title?: string;
    description?: string;
    image?: string;
    creator?: string;
    site?: string;
}

export interface SocialDefaultsConfig {
    title: string;
    description: string;
    path: string;
    type?: string;
    imagePath?: string;
    siteName?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    twitterCreator?: string;
    twitterSite?: string;
}

@Injectable({
    providedIn: 'root',
})
export class SeoService {
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);
    private readonly document = inject(DOCUMENT);
    private readonly jsonLdScriptId = 'app-json-ld';
    private readonly canonicalLinkId = 'app-canonical-link';

    updateTitle(title: string): void {
        this.title.setTitle(title);
    }

    updateMetaTags(config: MetaTagsConfig): void {
        this.updateNameMetaTags({
            description: config.description,
            keywords: config.keywords,
            author: config.author,
            robots: config.robots,
        });
    }

    setOpenGraph(config: OpenGraphConfig): void {
        this.updatePropertyMetaTags({
            'og:title': config.title,
            'og:description': config.description,
            'og:type': config.type,
            'og:url': config.url,
            'og:image': config.image,
            'og:site_name': config.siteName,
        });
    }

    setTwitterCard(config: TwitterCardConfig): void {
        this.updateNameMetaTags({
            'twitter:card': config.card,
            'twitter:title': config.title,
            'twitter:description': config.description,
            'twitter:image': config.image,
            'twitter:creator': config.creator,
            'twitter:site': config.site,
        });
    }

    setJsonLd(data: Record<string, unknown> | Array<Record<string, unknown>>): void {
        const existingScript = this.document.getElementById(this.jsonLdScriptId);
        if (existingScript) {
            existingScript.remove();
        }

        const script = this.document.createElement('script');
        script.id = this.jsonLdScriptId;
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        this.document.head.appendChild(script);
    }

    setCanonical(url: string): void {
        const existingElement = this.document.getElementById(this.canonicalLinkId);
        if (existingElement) {
            existingElement.remove();
        }

        const link = this.document.createElement('link');
        link.id = this.canonicalLinkId;
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', url);
        this.document.head.appendChild(link);
    }

    resolveSiteUrl(): string {
        const runtime = globalThis as { process?: { env?: Record<string, string | undefined> } };
        const envSiteUrl = runtime.process?.env?.['SITE_URL'];
        const documentOrigin = this.document?.location?.origin;
        const fallbackOrigin =
            typeof window !== 'undefined' && window.location?.origin
                ? window.location.origin
                : undefined;
        const url = envSiteUrl || documentOrigin || fallbackOrigin || 'http://localhost:4200';

        return url.replace(/\/+$/, '');
    }

    buildAbsoluteUrl(pathOrUrl: string): string {
        if (/^https?:\/\//i.test(pathOrUrl)) {
            return pathOrUrl;
        }

        const siteUrl = this.resolveSiteUrl();
        if (pathOrUrl.startsWith('/')) {
            return `${siteUrl}${pathOrUrl}`;
        }

        return `${siteUrl}/${pathOrUrl.replace(/^\/+/, '')}`;
    }

    setCanonicalForPath(path: string): void {
        this.setCanonical(this.buildAbsoluteUrl(path));
    }

    setDefaultSocial(config: SocialDefaultsConfig): void {
        const pageUrl = this.buildAbsoluteUrl(config.path);
        const imageUrl = this.buildAbsoluteUrl(config.imagePath || '/og-image.png');
        const twitterCard = config.twitterCard || 'summary_large_image';

        this.setOpenGraph({
            title: config.title,
            description: config.description,
            type: config.type || 'website',
            url: pageUrl,
            image: imageUrl,
            siteName: config.siteName || 'Nacho.dev',
        });
        this.setTwitterCard({
            card: twitterCard,
            title: config.title,
            description: config.description,
            image: imageUrl,
            creator: config.twitterCreator || '@nacho',
            site: config.twitterSite || '@nacho',
        });
    }

    private updateNameMetaTags(tags: Record<string, string | undefined>): void {
        for (const [name, content] of Object.entries(tags)) {
            if (!content) {
                continue;
            }

            this.meta.updateTag({ name, content }, `name='${name}'`);
        }
    }

    private updatePropertyMetaTags(tags: Record<string, string | undefined>): void {
        for (const [property, content] of Object.entries(tags)) {
            if (!content) {
                continue;
            }

            this.meta.updateTag({ property, content }, `property='${property}'`);
        }
    }
}
