import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, ExternalLink, Github } from 'lucide-angular';
import { Project } from '../../models/project.model';

@Component({
    selector: 'app-project-card',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './project-card.component.html',
    styleUrl: './project-card.component.css',
})
export class ProjectCardComponent {
    project = input.required<Project>();
    private readonly router = inject(Router);

    readonly icons = { ArrowRight, ExternalLink, Github };

    onCardClick(event: MouseEvent): void {
        if (this.isInteractiveTarget(event.target)) {
            return;
        }

        void this.router.navigate(['/projects', this.project().id]);
    }

    onCardKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        void this.router.navigate(['/projects', this.project().id]);
    }

    private isInteractiveTarget(target: EventTarget | null): boolean {
        if (!(target instanceof HTMLElement)) {
            return false;
        }

        return target.closest('a, button, input, textarea, select, label') !== null;
    }
}
