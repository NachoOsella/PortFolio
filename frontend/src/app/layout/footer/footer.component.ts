import { Component, ElementRef, viewChild, inject, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Github, Mail } from 'lucide-angular';
import { ScrollAnimationService } from '../../core/services/scroll-animation.service';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css',
})
export class FooterComponent {
    readonly currentYear = new Date().getFullYear();

    private readonly scrollAnimationService = inject(ScrollAnimationService);
    readonly footerGrid = viewChild<ElementRef<HTMLDivElement>>('footerGrid');
    readonly footerBottom = viewChild<ElementRef<HTMLDivElement>>('footerBottom');

    readonly socialLinks = [
        {
            label: 'GitHub',
            href: 'https://github.com/NachoOsella',
            icon: Github,
        },
        {
            label: 'Email',
            href: 'mailto:hello@nacho.dev',
            icon: Mail,
        },
    ];

    readonly quickLinks = [
        { label: 'Home', path: '/' },
        { label: 'Projects', path: '/projects' },
        { label: 'Blog', path: '/blog' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
        { label: 'Admin', path: '/admin/login' },
    ];

    constructor() {
        effect(() => {
            // Observe elements when view children are available
            const grid = this.footerGrid();
            const bottom = this.footerBottom();

            if (grid) {
                const columns = grid.nativeElement.querySelectorAll('.animate-on-scroll');
                columns.forEach((col) => {
                    this.scrollAnimationService.observe(col as HTMLElement);
                });
            }

            if (bottom) {
                this.scrollAnimationService.observe(bottom.nativeElement);
            }
        });
    }
}
