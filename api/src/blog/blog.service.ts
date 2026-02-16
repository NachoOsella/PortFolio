import { Injectable } from '@nestjs/common';

import { BlogQueryDto } from './dto/blog-query.dto';
import { BlogPostMeta, BlogTocItem, readBlogDocument, readBlogIndex } from '../common/content-files';

export interface BlogPostSummary {
    date: string;
    excerpt: string;
    published: boolean;
    featured: boolean;
    coverImage?: string;
    readingTime: string;
    wordCount: number;
    slug: string;
    title: string;
    tags: string[];
}

export interface BlogPost extends BlogPostSummary {
    content: string;
    toc: BlogTocItem[];
}

@Injectable()
export class BlogService {
    async getPosts(query: BlogQueryDto): Promise<BlogPostSummary[]> {
        const posts = await readBlogIndex();
        const publishedPosts = posts.filter((post) => post.published);
        const tag = query.tag?.trim().toLowerCase();
        const filteredPosts = tag
            ? publishedPosts.filter((post) => post.tags.some((postTag) => postTag.toLowerCase() === tag))
            : publishedPosts;

        return filteredPosts.map((post) => this.mapMetaToSummary(post));
    }

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        const document = await readBlogDocument(slug);
        if (!document || !document.meta.published) {
            return null;
        }

        return {
            ...this.mapMetaToSummary(document.meta),
            content: document.content,
            toc: Array.isArray(document.toc) ? document.toc : [],
        };
    }

    async getTags(): Promise<string[]> {
        const posts = await readBlogIndex();
        const uniqueTags = new Set<string>();

        posts.filter((post) => post.published).forEach((post) => {
            post.tags.forEach((tag) => {
                const normalizedTag = tag.trim().toLowerCase();
                if (normalizedTag) {
                    uniqueTags.add(normalizedTag);
                }
            });
        });

        return Array.from(uniqueTags).sort();
    }

    private mapMetaToSummary(meta: BlogPostMeta): BlogPostSummary {
        return {
            title: meta.title,
            slug: meta.slug,
            date: meta.date,
            tags: meta.tags,
            excerpt: meta.excerpt,
            published: meta.published,
            featured: meta.featured,
            coverImage: meta.coverImage,
            readingTime: meta.readingTime,
            wordCount: meta.wordCount,
        };
    }
}
