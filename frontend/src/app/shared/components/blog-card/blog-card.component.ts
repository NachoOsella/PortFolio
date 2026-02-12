import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, Calendar, Clock } from 'lucide-angular';
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
    readonly imageFailed = signal(false);

    readonly icons = { ArrowRight, Calendar, Clock };

    private readonly router = inject(Router);

    constructor() {
        effect(() => {
            this.post();
            this.imageFailed.set(false);
        });
    }

    onImageError(): void {
        this.imageFailed.set(true);
    }

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
