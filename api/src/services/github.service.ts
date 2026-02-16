import { readFile, readdir } from 'node:fs/promises';
import * as path from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { getRepositoryPaths } from '../common/content-files';

interface GitHubContentFile {
    type: string;
    name: string;
    sha: string;
}

interface GitHubSingleFile {
    type: string;
    sha: string;
}

@Injectable()
export class GitHubService {
    private readonly logger = new Logger(GitHubService.name);

    private readonly token = this.configService.get<string>('GITHUB_TOKEN')?.trim() ?? '';
    private readonly repositoryRef = this.configService.get<string>('GITHUB_REPO')?.trim() ?? '';
    private readonly owner =
        this.configService.get<string>('GITHUB_OWNER')?.trim()
        || this.repositoryRef.split('/')[0]
        || '';
    private readonly repo =
        this.repositoryRef.includes('/') ? this.repositoryRef.split('/')[1] || '' : this.repositoryRef;
    private readonly branch = this.configService.get<string>('GITHUB_BRANCH')?.trim() || 'main';
    private readonly contentRoot =
        this.configService.get<string>('GITHUB_CONTENT_ROOT')?.trim() || 'content/blog';

    constructor(private readonly configService: ConfigService) {}

    async syncPostDirectory(slug: string, actionLabel: string): Promise<void> {
        if (!this.isConfigured()) {
            this.logger.warn(
                `GitHub sync skipped for "${slug}" (${actionLabel}): integration is not configured`,
            );
            return;
        }

        const paths = getRepositoryPaths();
        const localDir = path.join(paths.contentBlogDir, slug);
        const localEntries = await readdir(localDir, { withFileTypes: true });
        const localFileNames = localEntries
            .filter((entry) => entry.isFile())
            .map((entry) => entry.name);

        const remoteDirPath = this.joinRepoPath(this.contentRoot, slug);
        const remoteFiles = await this.listRemoteFiles(remoteDirPath);
        const remoteByName = new Map<string, GitHubContentFile>(
            remoteFiles.map((file) => [file.name, file]),
        );

        for (const fileName of localFileNames) {
            const localFilePath = path.join(localDir, fileName);
            const content = await readFile(localFilePath);
            const remotePath = this.joinRepoPath(remoteDirPath, fileName);
            const currentSha = remoteByName.get(fileName)?.sha;

            await this.upsertRemoteFile(
                remotePath,
                content,
                `${this.commitPrefix(actionLabel)} ${slug}/${fileName}`,
                currentSha,
            );
        }

        const localSet = new Set(localFileNames);
        for (const remoteFile of remoteFiles) {
            if (localSet.has(remoteFile.name)) {
                continue;
            }

            const remotePath = this.joinRepoPath(remoteDirPath, remoteFile.name);
            await this.deleteRemoteFile(
                remotePath,
                remoteFile.sha,
                `chore(blog): remove ${slug}/${remoteFile.name}`,
            );
        }
    }

    async deletePostDirectory(slug: string, actionLabel: string): Promise<void> {
        if (!this.isConfigured()) {
            this.logger.warn(
                `GitHub sync skipped for "${slug}" (${actionLabel}): integration is not configured`,
            );
            return;
        }

        const remoteDirPath = this.joinRepoPath(this.contentRoot, slug);
        const remoteFiles = await this.listRemoteFiles(remoteDirPath);

        for (const remoteFile of remoteFiles) {
            const remotePath = this.joinRepoPath(remoteDirPath, remoteFile.name);
            await this.deleteRemoteFile(
                remotePath,
                remoteFile.sha,
                `chore(blog): delete ${slug}/${remoteFile.name}`,
            );
        }
    }

    private isConfigured(): boolean {
        return Boolean(this.token && this.owner && this.repo);
    }

    private commitPrefix(actionLabel: string): string {
        const normalized = actionLabel.trim().toLowerCase();
        if (normalized.includes('create')) {
            return 'feat(blog): add';
        }

        if (normalized.includes('delete') || normalized.includes('remove')) {
            return 'chore(blog): remove';
        }

        return 'chore(blog): update';
    }

    private async listRemoteFiles(remoteDirPath: string): Promise<GitHubContentFile[]> {
        try {
            const encodedPath = this.encodeGitHubPath(remoteDirPath);
            const data = await this.githubRequest<GitHubContentFile[] | GitHubSingleFile>(
                'GET',
                `/repos/${this.owner}/${this.repo}/contents/${encodedPath}?ref=${encodeURIComponent(this.branch)}`,
            );

            if (Array.isArray(data)) {
                return data.filter((item) => item.type === 'file');
            }

            if (data?.type === 'file') {
                return [
                    {
                        type: data.type,
                        name: path.posix.basename(remoteDirPath),
                        sha: data.sha,
                    },
                ];
            }

            return [];
        } catch (error) {
            if (this.isNotFoundError(error)) {
                return [];
            }

            throw error;
        }
    }

    private async upsertRemoteFile(
        remotePath: string,
        fileContent: Buffer,
        message: string,
        sha?: string,
    ): Promise<void> {
        const encodedPath = this.encodeGitHubPath(remotePath);
        await this.githubRequest('PUT', `/repos/${this.owner}/${this.repo}/contents/${encodedPath}`, {
            message,
            content: fileContent.toString('base64'),
            branch: this.branch,
            sha,
        });
    }

    private async deleteRemoteFile(remotePath: string, sha: string, message: string): Promise<void> {
        const encodedPath = this.encodeGitHubPath(remotePath);
        await this.githubRequest('DELETE', `/repos/${this.owner}/${this.repo}/contents/${encodedPath}`, {
            message,
            sha,
            branch: this.branch,
        });
    }

    private async githubRequest<T = unknown>(
        method: 'GET' | 'PUT' | 'DELETE',
        endpoint: string,
        body?: Record<string, unknown>,
    ): Promise<T> {
        const response = await fetch(`https://api.github.com${endpoint}`, {
            method,
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${this.token}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'portfolio-admin-api',
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const rawMessage = await response.text();
            const detail = rawMessage.slice(0, 500);
            throw new Error(`GitHub API ${method} ${endpoint} failed (${response.status}): ${detail}`);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return (await response.json()) as T;
    }

    private encodeGitHubPath(filePath: string): string {
        return filePath
            .split('/')
            .filter(Boolean)
            .map((segment) => encodeURIComponent(segment))
            .join('/');
    }

    private joinRepoPath(...parts: string[]): string {
        return parts
            .map((part) => part.replace(/^\/+|\/+$/g, ''))
            .filter(Boolean)
            .join('/');
    }

    private isNotFoundError(error: unknown): boolean {
        return error instanceof Error && error.message.includes('(404)');
    }
}
