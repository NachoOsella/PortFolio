import { ProjectsService } from './projects.service';
import { readProjects } from '../common/content-files';

jest.mock('../common/content-files', () => ({
    readProjects: jest.fn(),
}));

const mockedReadProjects = readProjects as jest.MockedFunction<typeof readProjects>;

describe('ProjectsService', () => {
    let service: ProjectsService;

    beforeEach(() => {
        service = new ProjectsService();
        mockedReadProjects.mockReset();
    });

    it('returns all projects', async () => {
        mockedReadProjects.mockResolvedValue([
            {
                id: 'project-1',
                title: 'Project One',
                description: 'Description',
                longDescription: 'Long description',
                image: 'https://example.com/image.png',
                category: 'Full-Stack',
                technologies: ['TypeScript'],
                featured: true,
                links: {
                    live: null,
                    github: 'https://github.com/example/project-1',
                },
                highlights: ['Feature A'],
                date: '2026-01-01',
            },
        ]);

        const projects = await service.getProjects();

        expect(projects).toHaveLength(1);
        expect(projects[0].id).toBe('project-1');
    });

    it('returns null when project is not found', async () => {
        mockedReadProjects.mockResolvedValue([]);

        const project = await service.getProjectById('missing');

        expect(project).toBeNull();
    });
});
