import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import * as contentFiles from '../common/content-files';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { GitHubService } from '../services/github.service';

jest.mock('../common/content-files');

describe('AdminService - Projects', () => {
    let service: AdminService;

    const mockAuthService = {
        signAdminToken: jest.fn().mockResolvedValue({ token: 'test-token', expiresAt: '2026-01-01' }),
    };

    const mockConfigService = {
        get: jest.fn().mockReturnValue('$2a$10$mockhash'),
    };
    const mockGitHubService = {
        syncPostDirectory: jest.fn().mockResolvedValue(undefined),
        deletePostDirectory: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminService,
                { provide: AuthService, useValue: mockAuthService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: GitHubService, useValue: mockGitHubService },
            ],
        }).compile();

        service = module.get<AdminService>(AdminService);
    });

    describe('listProjects', () => {
        it('should return all projects sorted by date desc', async () => {
            const mockProjects = [
                { id: 'project-1', title: 'Project 1', date: '2025-01-01' },
                { id: 'project-2', title: 'Project 2', date: '2025-06-01' },
                { id: 'project-3', title: 'Project 3', date: '2024-01-01' },
            ] as contentFiles.ProjectRecord[];

            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue(mockProjects);

            const result = await service.listProjects();

            expect(result).toHaveLength(3);
            expect(result[0].id).toBe('project-2'); // Most recent first
            expect(result[1].id).toBe('project-1');
            expect(result[2].id).toBe('project-3');
        });

        it('should return empty array when no projects exist', async () => {
            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue([]);

            const result = await service.listProjects();

            expect(result).toEqual([]);
        });
    });

    describe('getProjectById', () => {
        it('should return project when found', async () => {
            const mockProject = { id: 'test-project', title: 'Test Project' } as contentFiles.ProjectRecord;
            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue([mockProject]);

            const result = await service.getProjectById('test-project');

            expect(result).toEqual(mockProject);
        });

        it('should return null when project not found', async () => {
            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue([]);

            const result = await service.getProjectById('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('createProject', () => {
        const validPayload = {
            id: 'new-project',
            title: 'New Project',
            description: 'A short description',
            longDescription: 'A much longer description that meets the minimum length requirement of fifty characters.',
            image: 'https://example.com/image.jpg',
            category: 'Full-Stack',
            technologies: ['TypeScript', 'Node.js'],
            featured: true,
            links: { live: 'https://demo.com', github: 'https://github.com/test' },
            highlights: ['Feature 1', 'Feature 2'],
            date: '2025-06-15',
        };

        it('should create project successfully', async () => {
            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue([]);
            const writeSpy = jest.spyOn(contentFiles, 'writeSourceProjects').mockResolvedValue(undefined);
            const rebuildSpy = jest.spyOn(contentFiles, 'rebuildGeneratedContent').mockResolvedValue(undefined);

            const result = await service.createProject(validPayload);

            expect(result.id).toBe('new-project');
            expect(result.title).toBe('New Project');
            expect(writeSpy).toHaveBeenCalled();
            expect(rebuildSpy).toHaveBeenCalled();
        });

        it('should throw ConflictException when ID already exists', async () => {
            const existingProject = { id: 'new-project', title: 'Existing' } as contentFiles.ProjectRecord;
            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue([existingProject]);

            await expect(service.createProject(validPayload)).rejects.toThrow(ConflictException);
        });

        it('should normalize technologies and highlights', async () => {
            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue([]);
            jest.spyOn(contentFiles, 'writeSourceProjects').mockResolvedValue(undefined);
            jest.spyOn(contentFiles, 'rebuildGeneratedContent').mockResolvedValue(undefined);

            const payload = {
                ...validPayload,
                id: 'another-project',
                technologies: ['  TypeScript  ', '  ', 'Node.js'],
                highlights: ['  Feature 1  ', '', '  Feature 2  '],
            };

            const result = await service.createProject(payload);

            expect(result.technologies).toEqual(['TypeScript', 'Node.js']);
            expect(result.highlights).toEqual(['Feature 1', 'Feature 2']);
        });
    });

    describe('updateProject', () => {
        const existingProject = {
            id: 'existing-project',
            title: 'Old Title',
            description: 'Old description',
            longDescription: 'Old long description that is long enough to meet validation requirements here.',
            image: 'https://example.com/old.jpg',
            category: 'Backend',
            technologies: ['Python'],
            featured: false,
            links: { live: null, github: null },
            highlights: ['Old feature'],
            date: '2025-01-01',
        } as contentFiles.ProjectRecord;

        it('should update project successfully', async () => {
            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue([existingProject]);
            const writeSpy = jest.spyOn(contentFiles, 'writeSourceProjects').mockResolvedValue(undefined);
            const rebuildSpy = jest.spyOn(contentFiles, 'rebuildGeneratedContent').mockResolvedValue(undefined);

            const updatePayload = {
                id: 'existing-project',
                title: 'New Title',
                description: 'New description',
                longDescription: 'New long description that is definitely long enough for validation purposes.',
                image: 'https://example.com/new.jpg',
                category: 'Frontend',
                technologies: ['TypeScript'],
                featured: true,
                links: { live: 'https://new-demo.com', github: 'https://github.com/new' },
                highlights: ['New feature'],
                date: '2025-12-01',
            };

            const result = await service.updateProject('existing-project', updatePayload);

            expect(result.title).toBe('New Title');
            expect(result.category).toBe('Frontend');
            expect(result.featured).toBe(true);
            expect(writeSpy).toHaveBeenCalled();
            expect(rebuildSpy).toHaveBeenCalled();
        });

        it('should throw BadRequestException when trying to change ID', async () => {
            const updatePayload = {
                ...existingProject,
                id: 'different-id',
            };

            await expect(service.updateProject('existing-project', updatePayload as any)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw NotFoundException when project does not exist', async () => {
            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue([]);

            const updatePayload = {
                ...existingProject,
                id: 'non-existent', // Match the route ID
            };

            await expect(service.updateProject('non-existent', updatePayload)).rejects.toThrow(NotFoundException);
        });

        it('should preserve existing featured value when not provided', async () => {
            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue([existingProject]);
            jest.spyOn(contentFiles, 'writeSourceProjects').mockResolvedValue(undefined);
            jest.spyOn(contentFiles, 'rebuildGeneratedContent').mockResolvedValue(undefined);

            const updatePayload = {
                ...existingProject,
                featured: undefined,
            };

            const result = await service.updateProject('existing-project', updatePayload);

            expect(result.featured).toBe(false);
        });
    });

    describe('deleteProject', () => {
        it('should delete project successfully', async () => {
            const projects = [
                { id: 'project-1', title: 'Project 1' },
                { id: 'project-2', title: 'Project 2' },
            ] as contentFiles.ProjectRecord[];

            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue(projects);
            const writeSpy = jest.spyOn(contentFiles, 'writeSourceProjects').mockResolvedValue(undefined);
            const rebuildSpy = jest.spyOn(contentFiles, 'rebuildGeneratedContent').mockResolvedValue(undefined);

            const result = await service.deleteProject('project-1');

            expect(result.success).toBe(true);
            expect(writeSpy).toHaveBeenCalledWith([{ id: 'project-2', title: 'Project 2' }]);
            expect(rebuildSpy).toHaveBeenCalled();
        });

        it('should throw NotFoundException when project does not exist', async () => {
            jest.spyOn(contentFiles, 'readSourceProjects').mockResolvedValue([]);

            await expect(service.deleteProject('non-existent')).rejects.toThrow(NotFoundException);
        });
    });
});
