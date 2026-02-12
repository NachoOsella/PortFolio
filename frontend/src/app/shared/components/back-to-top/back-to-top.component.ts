import { Component, HostListener, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LucideAngularModule, ChevronUp } from 'lucide-angular';

@Component({
    selector: 'app-back-to-top',
    standalone: true,
    imports: [LucideAngularModule],
    templateUrl: './back-to-top.component.html',
    styleUrl: './back-to-top.component.css',
})
export class BackToTopComponent {
    private platformId = inject(PLATFORM_ID);
    visible = signal(false);

    readonly icons = { ChevronUp };

    @HostListener('window:scroll')
    onScroll(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.visible.set(window.scrollY > 300);
        }
    }

    scrollToTop(): void {
        if (isPlatformBrowser(this.platformId)) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}
