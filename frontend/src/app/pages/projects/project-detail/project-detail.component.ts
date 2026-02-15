import { Component, ElementRef, OnInit, effect, inject, signal, viewChild, viewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SeoService } from '../../../core/services/seo.service';
import { ScrollAnimationService } from '../../../core/services/scroll-animation.service';
import { Project } from '../../../shared/models/project.model';
import { HttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import { ArrowLeft, Github, ExternalLink, LucideAngularModule } from 'lucide-angular';
import { ProjectCardComponent } from '../../../shared/components/project-card/project-card.component';

@Component({
    selector: 'app-project-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule, ProjectCardComponent],
    templateUrl: './project-detail.component.html',
    styleUrl: './project-detail.component.css',
})
export class ProjectDetailComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly api = inject(ApiService);
    private readonly seo = inject(SeoService);
    private readonly http = inject(HttpClient);
    private readonly scrollAnimationService = inject(ScrollAnimationService);

    project = signal<Project | null>(null);
    relatedProjects = signal<Project[]>([]);
    isLoading = signal(true);
    error = signal<string | null>(null);
    
    readonly backButton = viewChild<ElementRef<HTMLAnchorElement>>('backButton');
    readonly projectHeader = viewChild<ElementRef<HTMLDivElement>>('projectHeader');
    readonly keyFeatures = viewChild<ElementRef<HTMLDivElement>>('keyFeatures');
    readonly relatedSection = viewChild<ElementRef<HTMLDivElement>>('relatedSection');
    readonly relatedProjectCards = viewChildren('relatedProjectCardRef', {
        read: ElementRef<HTMLElement>,
    });

    icons = { ArrowLeft, Github, ExternalLink };

    constructor() {
        effect(() => {
            const cards = this.relatedProjectCards();
            if (!cards.length) {
                return;
            }

            cards.forEach((card) => {
                this.scrollAnimationService.observe(card.nativeElement);
            });
        });
    }

    ngOnInit(): void {
        this.route.params.pipe(
            switchMap((params) => {
                const id = params['id'];
                return this.loadProject(id);
            })
        ).subscribe({
            next: (project) => {
                if (project) {
                    this.project.set(project);
                    this.seo.updateTitle(`${project.title} | Projects | Nacho.dev`);
                    this.seo.updateMetaTags({
                        description: project.description,
                    });
                    this.loadRelatedProjects(project);
                } else {
                    this.error.set('Project not found');
                }
                this.isLoading.set(false);
                
                setTimeout(() => {
                    this.observeElements();
                });
            },
            error: () => {
                this.error.set('Failed to load project');
                this.isLoading.set(false);
            },
        });
    }

    private loadProject(id: string) {
        return this.http.get<Project[]>('/generated/projects.json').pipe(
            catchError(() => this.api.get<Project[]>('/projects')),
            switchMap((projects) => {
                const project = projects.find((p) => p.id === id);
                return of(project || null);
            })
        );
    }

    private loadRelatedProjects(currentProject: Project): void {
        this.http.get<Project[]>('/generated/projects.json').pipe(
            catchError(() => this.api.get<Project[]>('/projects'))
        ).subscribe({
            next: (projects) => {
                const related = projects
                    .filter((p) => p.id !== currentProject.id)
                    .filter((p) =>
                        p.technologies.some((tech) =>
                            currentProject.technologies.includes(tech)
                        ) || p.category === currentProject.category
                    )
                    .slice(0, 3);
                this.relatedProjects.set(related);
            },
        });
    }
    
    private observeElements(): void {
        // Back button
        const back = this.backButton();
        if (back) {
            this.scrollAnimationService.observe(back.nativeElement);
        }
        
        // Project header
        const header = this.projectHeader();
        if (header) {
            this.scrollAnimationService.observe(header.nativeElement);
        }
        
        // Key features
        const features = this.keyFeatures();
        if (features) {
            this.scrollAnimationService.observe(features.nativeElement);
        }
        
        // Related section
        const related = this.relatedSection();
        if (related) {
            this.scrollAnimationService.observe(related.nativeElement);
        }
    }
    
}
