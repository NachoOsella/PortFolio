import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { ProjectSummary, ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get()
    getProjects(): Promise<ProjectSummary[]> {
        return this.projectsService.getProjects();
    }

    @Get(':id')
    async getProjectById(@Param('id') id: string): Promise<ProjectSummary> {
        const project = await this.projectsService.getProjectById(id);

        if (!project) {
            throw new NotFoundException(`Project with id \"${id}\" not found`);
        }

        return project;
    }
}
