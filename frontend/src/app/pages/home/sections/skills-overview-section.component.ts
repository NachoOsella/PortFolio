import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SkillBadgeComponent } from '../../../shared/components/skill-badge/skill-badge.component';
import { SectionHeadingComponent } from '../../../shared/components/section-heading/section-heading.component';
import { SkillCategory } from '../../../shared/models/skill.model';
import { ApiService } from '../../../core/services/api.service';

@Component({
    selector: 'app-skills-overview-section',
    standalone: true,
    imports: [SkillBadgeComponent, SectionHeadingComponent],
    templateUrl: './skills-overview-section.component.html',
    styleUrl: './skills-overview-section.component.css',
})
export class SkillsOverviewSectionComponent {
    private readonly api = inject(ApiService);
    private readonly platformId = inject(PLATFORM_ID);

    skillCategories = signal<SkillCategory[]>([]);
    isLoading = signal(true);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadSkills();
        } else {
            this.isLoading.set(false);
        }
    }

    private loadSkills(): void {
        this.api.get<{ categories: SkillCategory[] }>('skills').subscribe({
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
