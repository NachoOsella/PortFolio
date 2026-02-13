import { Injectable } from '@nestjs/common';

import { BlogQueryDto } from './dto/blog-query.dto';

export interface BlogPostSummary {
    slug: string;
    title: string;
    tags: string[];
}

@Injectable()
export class BlogService {
    async getPosts(query: BlogQueryDto): Promise<BlogPostSummary[]> {
        void query;
        return [];
    }

    async getPostBySlug(slug: string): Promise<BlogPostSummary | null> {
        void slug;
        return null;
    }

    async getTags(): Promise<string[]> {
        return [];
    }
}
