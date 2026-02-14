import { Injectable } from '@nestjs/common';
import { ProjectRecord, readProjects } from '../common/content-files';

export type ProjectSummary = ProjectRecord;

@Injectable()
export class ProjectsService {
    async getProjects(): Promise<ProjectSummary[]> {
        return readProjects();
    }

    async getProjectById(id: string): Promise<ProjectSummary | null> {
        const projects = await readProjects();
        return projects.find((project) => project.id === id) || null;
    }
}
