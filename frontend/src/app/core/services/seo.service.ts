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

@Injectable({
  providedIn: 'root',
})
export class SeoService {
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);
    private readonly document = inject(DOCUMENT);
    private readonly jsonLdScriptId = 'app-json-ld';

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
