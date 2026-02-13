import { Injectable } from '@nestjs/common';

export interface ProjectSummary {
    id: string;
    title: string;
}

@Injectable()
export class ProjectsService {
    async getProjects(): Promise<ProjectSummary[]> {
        return [];
    }

    async getProjectById(id: string): Promise<ProjectSummary | null> {
        void id;
        return null;
    }
}
