import { Component, ElementRef, effect, inject, OnInit, signal, viewChildren } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { SkillBadgeComponent } from '../../../../shared/components/skill-badge/skill-badge.component';
import { SkillCategory } from '../../../../shared/models/skill.model';
import { ApiService } from '../../../../core/services/api.service';
import { ScrollAnimationService } from '../../../../core/services/scroll-animation.service';

@Component({
    selector: 'app-skills-overview-section',
    standalone: true,
    imports: [SectionHeadingComponent, SkillBadgeComponent],
    templateUrl: './skills-overview-section.component.html',
    styleUrl: './skills-overview-section.component.css',
})
export class SkillsOverviewSectionComponent implements OnInit {
    private readonly api = inject(ApiService);
    private readonly http = inject(HttpClient);
    private readonly scrollAnimationService = inject(ScrollAnimationService);

    skillCategories = signal<SkillCategory[]>([]);
    isLoading = signal(true);
    activeCardIndex = signal<number | null>(null);
    readonly skillCards = viewChildren<ElementRef<HTMLElement>>('skillCard');

    constructor() {
        effect(() => {
            if (this.isLoading()) {
                return;
            }

            const cards = this.skillCards();
            if (!cards.length) {
                return;
            }

            cards.forEach((card) => {
                this.scrollAnimationService.observe(card.nativeElement);
            });
        });
    }
    
    ngOnInit(): void {
        this.loadSkills();
    }

    setActiveCard(index: number): void {
        this.activeCardIndex.set(index);
    }

    clearActiveCard(index: number, event?: FocusEvent): void {
        if (this.activeCardIndex() !== index) {
            return;
        }

        const currentTarget = event?.currentTarget;
        const relatedTarget = event?.relatedTarget;
        if (
            currentTarget instanceof HTMLElement &&
            relatedTarget instanceof Node &&
            currentTarget.contains(relatedTarget)
        ) {
            return;
        }

        this.activeCardIndex.set(null);
    }

    shouldShowLevel(index: number): boolean {
        return this.activeCardIndex() === index;
    }

    private loadSkills(): void {
        this.isLoading.set(true);

        this.http
            .get<{ categories: SkillCategory[] }>('/generated/skills.json')
            .pipe(catchError(() => this.api.get<{ categories: SkillCategory[] }>('/skills')))
            .subscribe({
                next: (data) => {
                    this.skillCategories.set(data.categories);
                    this.isLoading.set(false);
                },
                error: () => {
                    this.isLoading.set(false);
                },
            });
    }
}
