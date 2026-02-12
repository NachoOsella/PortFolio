import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { SkillBadgeComponent } from '../../../../shared/components/skill-badge/skill-badge.component';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { SkillCategory } from '../../../../shared/models/skill.model';
import { ApiService } from '../../../../core/services/api.service';

@Component({
    selector: 'app-skills-overview-section',
    standalone: true,
    imports: [SkillBadgeComponent, SectionHeadingComponent],
    templateUrl: './skills-overview-section.component.html',
    styleUrl: './skills-overview-section.component.css',
})
export class SkillsOverviewSectionComponent implements OnInit {
    private readonly api = inject(ApiService);
    private readonly http = inject(HttpClient);

    skillCategories = signal<SkillCategory[]>([]);
    isLoading = signal(true);

    ngOnInit(): void {
        this.loadSkills();
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
