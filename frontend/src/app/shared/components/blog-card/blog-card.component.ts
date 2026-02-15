import { DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, Calendar } from 'lucide-angular';
import { BlogPost } from '../../models/blog.model';

@Component({
    selector: 'app-blog-card',
    standalone: true,
    imports: [RouterLink, DatePipe, LucideAngularModule],
    templateUrl: './blog-card.component.html',
    styleUrl: './blog-card.component.css',
})
export class BlogCardComponent {
    post = input.required<BlogPost>();

    readonly icons = { ArrowRight, Calendar };

    private readonly router = inject(Router);

    onCardClick(event: MouseEvent): void {
        if (this.isInteractiveTarget(event.target)) {
            return;
        }

        void this.router.navigate(['/blog', this.post().slug]);
    }

    onCardKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        void this.router.navigate(['/blog', this.post().slug]);
    }

    private isInteractiveTarget(target: EventTarget | null): boolean {
        if (!(target instanceof HTMLElement)) {
            return false;
        }

        return target.closest('a, button, input, textarea, select, label') !== null;
    }
}
