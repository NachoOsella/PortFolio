import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
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

    readonly icons = { ArrowRight, ExternalLink, Github };
}
