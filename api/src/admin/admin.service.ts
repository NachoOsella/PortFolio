import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { Injectable, BadRequestException, ConflictException, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { fileTypeFromBuffer } from 'file-type';

import { AuthService } from '../auth/auth.service';
import {
    BlogPostMeta,
    deleteMarkdownPost,
    getRepositoryPaths,
    pathExists,
    ProjectRecord,
    readBlogIndex,
    readMarkdownPost,
    readSourceProjects,
    rebuildGeneratedContent,
    removeFrontmatter,
    writeMarkdownPost,
    writeSourceProjects,
} from '../common/content-files';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpsertPostDto } from './dto/upsert-post.dto';
import { UpsertProjectDto } from './dto/upsert-project.dto';

export interface AdminPostSummary extends BlogPostMeta {}

export interface AdminPost extends AdminPostSummary {
    content: string;
}

export interface AdminUploadedImage {
    markdownPath: string;
    fileName: string;
    publicUrl: string;
    size: number;
    mimeType: string;
}

export interface AdminUploadFile {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

const IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/gif': 'gif',
};

export const ALLOWED_IMAGE_MIME_TYPES = Object.keys(IMAGE_EXTENSION_BY_MIME);

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    async login(body: AdminLoginDto): Promise<{ token: string; expiresAt: string }> {
        const passwordHash = this.configService.get<string>('ADMIN_PASSWORD_HASH');
        if (!passwordHash) {
            throw new InternalServerErrorException('ADMIN_PASSWORD_HASH is not configured');
        }

        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(body.password, passwordHash);
        } catch (error) {
            this.logger.error('Failed to verify password hash:', error);
            throw new InternalServerErrorException('Authentication service unavailable');
        }
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.authService.signAdminToken({ username: 'admin' });
    }

    logout(): { success: boolean } {
        return { success: true };
    }

    verifySession(): { authenticated: boolean } {
        return { authenticated: true };
    }

    async listPosts(): Promise<AdminPostSummary[]> {
        const posts = await readBlogIndex();
        const safePosts = posts.filter((post): post is AdminPostSummary => {
            return Boolean(post)
                && typeof post.title === 'string'
                && typeof post.slug === 'string'
                && typeof post.date === 'string'
                && Array.isArray(post.tags)
                && typeof post.excerpt === 'string'
                && typeof post.published === 'boolean'
                && typeof post.featured === 'boolean'
                && typeof post.readingTime === 'string'
                && typeof post.wordCount === 'number';
        });

        return safePosts.sort((a, b) => this.compareIsoDatesDesc(a.date, b.date));
    }

    async getPostBySlug(slug: string): Promise<AdminPost | null> {
        const normalizedSlug = this.normalizeSlug(slug);
        const posts = await readBlogIndex();
        const summary = posts.find((post) => post.slug === normalizedSlug);

        if (!summary) {
            return null;
        }

        const markdownWithFrontmatter = await readMarkdownPost(normalizedSlug);
        const markdownContent = markdownWithFrontmatter ? removeFrontmatter(markdownWithFrontmatter).trim() : '';

        return {
            ...summary,
            content: markdownContent,
        };
    }

    async createPost(payload: UpsertPostDto): Promise<AdminPost> {
        const normalizedSlug = this.normalizeSlug(payload.slug);
        await this.assertSlugAvailable(normalizedSlug, null);

        await writeMarkdownPost(null, normalizedSlug, this.buildMarkdownDocument(payload, normalizedSlug));
        await this.rebuildContentOrThrow();

        const post = await this.getPostBySlug(normalizedSlug);
        if (!post) {
            throw new InternalServerErrorException('Post was created but could not be loaded');
        }

        return post;
    }

    async updatePost(slug: string, payload: UpsertPostDto): Promise<AdminPost> {
        const currentSlug = this.normalizeSlug(slug);
        const nextSlug = this.normalizeSlug(payload.slug);

        await this.assertPostExists(currentSlug);
        await this.assertSlugAvailable(nextSlug, currentSlug);

        await writeMarkdownPost(
            currentSlug,
            nextSlug,
            this.buildMarkdownDocument(payload, nextSlug),
        );
        await this.rebuildContentOrThrow();

        const post = await this.getPostBySlug(nextSlug);
        if (!post) {
            throw new InternalServerErrorException('Post was updated but could not be loaded');
        }

        return post;
    }

    async deletePost(slug: string): Promise<{ success: boolean }> {
        const normalizedSlug = this.normalizeSlug(slug);
        await this.assertPostExists(normalizedSlug);

        await deleteMarkdownPost(normalizedSlug);
        await this.rebuildContentOrThrow();

        return { success: true };
    }

    async uploadPostImage(slug: string, file: AdminUploadFile): Promise<AdminUploadedImage> {
        const normalizedSlug = this.normalizeSlug(slug);
        await this.assertPostExists(normalizedSlug);

        const fileType = await fileTypeFromBuffer(file.buffer);
        if (!fileType || !ALLOWED_IMAGE_MIME_TYPES.includes(fileType.mime)) {
            throw new BadRequestException(
                `Invalid or unsupported image file. Detected type: ${fileType?.mime ?? 'unknown'}`
            );
        }

        const extension = IMAGE_EXTENSION_BY_MIME[fileType.mime];

        const paths = getRepositoryPaths();
        const sourceDir = path.join(paths.contentBlogDir, normalizedSlug);
        const generatedDir = path.join(paths.generatedBlogDir, normalizedSlug);

        const fileName = await this.generateUniqueImageName(sourceDir, file.originalname, extension);
        const sourcePath = path.join(sourceDir, fileName);
        const generatedPath = path.join(generatedDir, fileName);

        await mkdir(sourceDir, { recursive: true });
        await mkdir(generatedDir, { recursive: true });

        await writeFile(sourcePath, file.buffer);
        await writeFile(generatedPath, file.buffer);

        return {
            markdownPath: `./${fileName}`,
            fileName,
            publicUrl: `/generated/blog/${normalizedSlug}/${fileName}`,
            size: file.size,
            mimeType: file.mimetype,
        };
    }

    // Project CRUD operations
    async listProjects(): Promise<ProjectRecord[]> {
        const projects = await readSourceProjects();
        return projects.sort((a, b) => this.compareIsoDatesDesc(a.date, b.date));
    }

    async getProjectById(id: string): Promise<ProjectRecord | null> {
        const projects = await readSourceProjects();
        return projects.find((project) => project.id === id) ?? null;
    }

    async createProject(payload: UpsertProjectDto): Promise<ProjectRecord> {
        await this.assertProjectIdAvailable(payload.id);

        const newProject: ProjectRecord = {
            id: payload.id,
            title: payload.title,
            description: payload.description,
            longDescription: payload.longDescription,
            image: payload.image,
            category: payload.category,
            technologies: this.normalizeStringArray(payload.technologies),
            featured: payload.featured ?? false,
            links: {
                live: payload.links?.live ?? null,
                github: payload.links?.github ?? null,
            },
            highlights: this.normalizeStringArray(payload.highlights),
            date: payload.date,
        };

        const projects = await readSourceProjects();
        projects.push(newProject);
        await writeSourceProjects(projects);
        await this.rebuildContentOrThrow();

        return newProject;
    }

    async updateProject(id: string, payload: UpsertProjectDto): Promise<ProjectRecord> {
        if (payload.id !== undefined && payload.id !== id) {
            throw new BadRequestException('Project ID is immutable and cannot be changed');
        }

        const projects = await readSourceProjects();
        const index = projects.findIndex((project) => project.id === id);

        if (index === -1) {
            throw new NotFoundException(`Project with ID "${id}" not found`);
        }

        const updatedProject: ProjectRecord = {
            ...projects[index],
            title: payload.title,
            description: payload.description,
            longDescription: payload.longDescription,
            image: payload.image,
            category: payload.category,
            technologies: this.normalizeStringArray(payload.technologies),
            featured: payload.featured ?? projects[index].featured,
            links: {
                live: payload.links?.live ?? null,
                github: payload.links?.github ?? null,
            },
            highlights: this.normalizeStringArray(payload.highlights),
            date: payload.date,
        };

        projects[index] = updatedProject;
        await writeSourceProjects(projects);
        await this.rebuildContentOrThrow();

        return updatedProject;
    }

    async deleteProject(id: string): Promise<{ success: boolean }> {
        const projects = await readSourceProjects();
        const index = projects.findIndex((project) => project.id === id);

        if (index === -1) {
            throw new NotFoundException(`Project with ID "${id}" not found`);
        }

        projects.splice(index, 1);
        await writeSourceProjects(projects);
        await this.rebuildContentOrThrow();

        return { success: true };
    }

    private normalizeStringArray(arr: string[]): string[] {
        return arr.map((s) => s.trim()).filter((s) => s.length > 0);
    }

    private compareIsoDatesDesc(dateA: string, dateB: string): number {
        // ISO 8601 dates can be compared lexicographically
        // This avoids NaN issues from invalid dates
        return dateB.localeCompare(dateA);
    }

    private async assertProjectIdAvailable(id: string): Promise<void> {
        const projects = await readSourceProjects();
        if (projects.some((project) => project.id === id)) {
            throw new ConflictException(`Project with ID "${id}" already exists`);
        }
    }

    private normalizeSlug(slug: string): string {
        return slug
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    private async assertPostExists(slug: string): Promise<void> {
        const paths = getRepositoryPaths();
        const postPath = path.join(paths.contentBlogDir, slug, 'index.md');
        if (!(await pathExists(postPath))) {
            throw new NotFoundException(`Blog post with slug "${slug}" not found`);
        }
    }

    private async assertSlugAvailable(nextSlug: string, currentSlug: string | null): Promise<void> {
        if (currentSlug && currentSlug === nextSlug) {
            return;
        }

        const paths = getRepositoryPaths();
        const postDir = path.join(paths.contentBlogDir, nextSlug);
        if (await pathExists(postDir)) {
            throw new ConflictException(`Blog post with slug "${nextSlug}" already exists`);
        }
    }

    private async rebuildContentOrThrow(): Promise<void> {
        try {
            await rebuildGeneratedContent();
        } catch (error) {
            throw new InternalServerErrorException(
                `Content rebuild failed after post mutation: ${(error as Error).message}`,
            );
        }
    }

    private buildMarkdownDocument(payload: UpsertPostDto, normalizedSlug: string): string {
        const lines = [
            '---',
            `title: "${this.escapeDoubleQuotedYaml(payload.title)}"`,
            `slug: "${normalizedSlug}"`,
            `date: "${payload.date}"`,
            `tags: [${payload.tags.map((tag) => `"${this.escapeDoubleQuotedYaml(tag)}"`).join(', ')}]`,
            `excerpt: "${this.escapeDoubleQuotedYaml(payload.excerpt)}"`,
            `published: ${Boolean(payload.published)}`,
            `featured: ${Boolean(payload.featured)}`,
        ];

        if (payload.coverImage?.trim()) {
            lines.push(`coverImage: "${this.escapeDoubleQuotedYaml(payload.coverImage.trim())}"`);
        }

        lines.push('---', '', payload.content.trim(), '');
        return `${lines.join('\n')}`;
    }

    private escapeDoubleQuotedYaml(value: string): string {
        return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    private sanitizeBaseFileName(fileName: string): string {
        const baseName = path.parse(fileName).name.toLowerCase().trim();
        const normalizedBaseName = baseName
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        return normalizedBaseName || `image-${Date.now()}`;
    }

    private async generateUniqueImageName(
        directory: string,
        originalName: string,
        extension: string,
    ): Promise<string> {
        const baseName = this.sanitizeBaseFileName(originalName);
        let candidate = `${baseName}.${extension}`;
        let index = 2;

        while (await pathExists(path.join(directory, candidate))) {
            candidate = `${baseName}-${index}.${extension}`;
            index += 1;
        }

        return candidate;
    }
}
