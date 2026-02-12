import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { catchError } from 'rxjs';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { ApiService } from '../../../../core/services/api.service';
import { Project } from '../../../../shared/models/project.model';

@Component({
    selector: 'app-featured-projects-section',
    standalone: true,
    imports: [RouterLink, LucideAngularModule, ProjectCardComponent, SectionHeadingComponent],
    templateUrl: './featured-projects-section.component.html',
    styleUrl: './featured-projects-section.component.css',
})
export class FeaturedProjectsSectionComponent implements OnInit {
    private readonly api = inject(ApiService);
    private readonly http = inject(HttpClient);
    readonly icons = { ArrowRight };

    featuredProjects = signal<Project[]>([]);
    isLoading = signal(true);
    error = signal<string | null>(null);

    ngOnInit(): void {
        this.loadFeaturedProjects();
    }

    private loadFeaturedProjects(): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.http
            .get<Project[]>('/generated/projects.json')
            .pipe(catchError(() => this.api.get<Project[]>('/projects')))
            .subscribe({
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
