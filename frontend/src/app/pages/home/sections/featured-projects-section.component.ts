import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { ProjectCardComponent } from '../../../shared/components/project-card/project-card.component';
import { SectionHeadingComponent } from '../../../shared/components/section-heading/section-heading.component';
import { ApiService } from '../../../core/services/api.service';
import { Project } from '../../../shared/models/project.model';

@Component({
    selector: 'app-featured-projects-section',
    standalone: true,
    imports: [RouterLink, LucideAngularModule, ProjectCardComponent, SectionHeadingComponent],
    templateUrl: './featured-projects-section.component.html',
    styleUrl: './featured-projects-section.component.css',
})
export class FeaturedProjectsSectionComponent {
    private readonly api = inject(ApiService);
    private readonly platformId = inject(PLATFORM_ID);
    readonly icons = { ArrowRight };

    featuredProjects = signal<Project[]>([]);
    isLoading = signal(true);
    error = signal<string | null>(null);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadFeaturedProjects();
        } else {
            this.isLoading.set(false);
        }
    }

    private loadFeaturedProjects(): void {
        this.api.get<Project[]>('projects').subscribe({
            next: (projects) => {
                const featured = projects.filter((p) => p.featured).slice(0, 3);
                this.featuredProjects.set(featured);
                this.isLoading.set(false);
            },
            error: () => {
                this.error.set('Failed to load projects');
                this.isLoading.set(false);
            },
        });
    }
}
