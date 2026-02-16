import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    computed,
    effect,
    inject,
    signal,
    viewChild,
    viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCardComponent } from '../../../shared/components/project-card/project-card.component';
import { TagFilterComponent } from '../../../shared/components/tag-filter/tag-filter.component';
import { SectionHeadingComponent } from '../../../shared/components/section-heading/section-heading.component';
import { ApiService } from '../../../core/services/api.service';
import { SeoService } from '../../../core/services/seo.service';
import { ScrollAnimationService } from '../../../core/services/scroll-animation.service';
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
export class ProjectsListComponent implements OnInit, AfterViewInit {
    private readonly api = inject(ApiService);
    private readonly seo = inject(SeoService);
    private readonly http = inject(HttpClient);
    private readonly scrollAnimationService = inject(ScrollAnimationService);

    projects = signal<Project[]>([]);
    selectedCategory = signal<string>('all');
    isLoading = signal(true);
    error = signal<string | null>(null);
    
    readonly tagFilter = viewChild<ElementRef<HTMLElement>>('tagFilter');
    readonly emptyState = viewChild<ElementRef<HTMLDivElement>>('emptyState');
    readonly projectCards = viewChildren('projectCardRef', { read: ElementRef<HTMLElement> });

    constructor() {
        effect(() => {
            if (this.isLoading()) {
                return;
            }

            const cards = this.projectCards();
            if (!cards.length) {
                return;
            }

            cards.forEach((card) => {
                this.scrollAnimationService.observe(card.nativeElement);
            });
        });
    }

    categories = computed(() => {
        const cats = new Set<string>();
        this.projects().forEach((p) => {
            if (p.category && p.category.toLowerCase() !== 'all') {
                cats.add(p.category);
            }
        });
        return Array.from(cats).sort();
    });

    filteredProjects = computed(() => {
        if (this.selectedCategory() === 'all') {
            return this.projects();
        }
        return this.projects().filter((p) => p.category === this.selectedCategory());
    });

    ngOnInit(): void {
        const description =
            'Explore my portfolio of full-stack web applications, CLI tools, and open-source projects.';

        this.seo.updateTitle('Projects | Nacho.dev');
        this.seo.updateMetaTags({
            description,
        });
        this.seo.setCanonicalForPath('/projects');
        this.seo.setDefaultSocial({
            title: 'Projects | Nacho.dev',
            description,
            path: '/projects',
            imagePath: '/og-image.png',
        });
        this.seo.setJsonLd([
            {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: 'Projects',
                description,
                url: this.seo.buildAbsoluteUrl('/projects'),
            },
            {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: this.seo.buildAbsoluteUrl('/'),
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Projects',
                        item: this.seo.buildAbsoluteUrl('/projects'),
                    },
                ],
            },
        ]);

        this.loadProjects();
    }

    ngAfterViewInit(): void {
        this.observeElements();
    }

    onCategorySelected(category: string): void {
        this.selectedCategory.set(category);
        this.observeElements();
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
                this.observeElements();
            },
            error: () => {
                this.error.set('Failed to load projects. Please try again later.');
                this.isLoading.set(false);
            },
        });
    }
    
    private observeElements(): void {
        // Tag filter
        const filter = this.tagFilter();
        if (filter) {
            this.scrollAnimationService.observe(filter.nativeElement);
        }
        
        // Empty state
        const empty = this.emptyState();
        if (empty) {
            this.scrollAnimationService.observe(empty.nativeElement);
        }
        
    }

}
