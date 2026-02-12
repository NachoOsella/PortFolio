import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCardComponent } from '../../../shared/components/project-card/project-card.component';
import { TagFilterComponent } from '../../../shared/components/tag-filter/tag-filter.component';
import { SectionHeadingComponent } from '../../../shared/components/section-heading/section-heading.component';
import { ApiService } from '../../../core/services/api.service';
import { SeoService } from '../../../core/services/seo.service';
import { Project } from '../../../shared/models/project.model';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';

@Component({
    selector: 'app-projects-list',
    standalone: true,
    imports: [
        CommonModule,
        ProjectCardComponent,
        TagFilterComponent,
        SectionHeadingComponent,
    ],
    templateUrl: './projects-list.component.html',
    styleUrl: './projects-list.component.css',
})
export class ProjectsListComponent implements OnInit {
    private readonly api = inject(ApiService);
    private readonly seo = inject(SeoService);
    private readonly http = inject(HttpClient);

    projects = signal<Project[]>([]);
    selectedCategory = signal<string>('all');
    isLoading = signal(true);
    error = signal<string | null>(null);

    categories = computed(() => {
        const cats = new Set<string>();
        this.projects().forEach((p) => cats.add(p.category));
        return ['all', ...Array.from(cats).sort()];
    });

    filteredProjects = computed(() => {
        if (this.selectedCategory() === 'all') {
            return this.projects();
        }
        return this.projects().filter((p) => p.category === this.selectedCategory());
    });

    ngOnInit(): void {
        this.seo.updateTitle('Projects | Nacho.dev');
        this.seo.updateMetaTags({
            description: 'Explore my portfolio of full-stack web applications, CLI tools, and open-source projects.',
        });

        this.loadProjects();
    }

    onCategorySelected(category: string): void {
        this.selectedCategory.set(category);
    }

    private loadProjects(): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.http.get<Project[]>('/generated/projects.json').pipe(
            catchError(() => {
                return this.api.get<Project[]>('/projects');
            })
        ).subscribe({
            next: (data) => {
                this.projects.set(data);
                this.isLoading.set(false);
            },
            error: () => {
                this.error.set('Failed to load projects. Please try again later.');
                this.isLoading.set(false);
            },
        });
    }
}
