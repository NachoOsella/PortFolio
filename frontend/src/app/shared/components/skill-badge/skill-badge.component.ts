import { Component, input } from '@angular/core';
import { Skill } from '../../models/skill.model';

@Component({
    selector: 'app-skill-badge',
    standalone: true,
    templateUrl: './skill-badge.component.html',
    styleUrl: './skill-badge.component.css',
})
export class SkillBadgeComponent {
    skill = input.required<Skill>();
    showLevel = input(false);

    levelClass(): string {
        switch (this.skill().level) {
            case 'expert':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'beginner':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    }
}
