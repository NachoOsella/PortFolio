import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { BlogQueryDto } from './dto/blog-query.dto';
import { BlogService, BlogPostSummary } from './blog.service';

@Controller('blog')
export class BlogController {
    constructor(private readonly blogService: BlogService) {}

    @Get()
    getPosts(@Query() query: BlogQueryDto): Promise<BlogPostSummary[]> {
        return this.blogService.getPosts(query);
    }

    @Get('tags')
    getTags(): Promise<string[]> {
        return this.blogService.getTags();
    }

    @Get(':slug')
    async getPostBySlug(@Param('slug') slug: string): Promise<BlogPostSummary> {
        const post = await this.blogService.getPostBySlug(slug);

        if (!post) {
            throw new NotFoundException(`Blog post with slug \"${slug}\" not found`);
        }

        return post;
    }
}
