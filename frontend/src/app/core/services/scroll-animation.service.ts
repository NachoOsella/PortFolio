import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, Renderer2, RendererFactory2, inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

interface AnimatedElement {
    element: HTMLElement;
    observer: IntersectionObserver;
}

@Injectable({
    providedIn: 'root',
})
export class ScrollAnimationService {
    private readonly rendererFactory = inject(RendererFactory2);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly document = inject(DOCUMENT);
    private readonly router = inject(Router);
    private renderer: Renderer2;
    private animatedElements = new Map<HTMLElement, AnimatedElement>();
    private rafIds = new Map<HTMLElement, number>();
    private readonly threshold = 0.1;
    private readonly rootMargin = '0px 0px -50px 0px';

    constructor() {
        this.renderer = this.rendererFactory.createRenderer(null, null);

        if (isPlatformBrowser(this.platformId)) {
            this.router.events
                .pipe(filter((event) => event instanceof NavigationEnd))
                .subscribe(() => {
                    // Wait longer for Angular to fully render the new page
                    setTimeout(() => {
                        this.replayAnimationsInView();
                    }, 100);
                });
        }
    }

    observe(element: HTMLElement | null | undefined): void {
        if (!element) {
            return;
        }

        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        if (typeof HTMLElement !== 'undefined' && !(element instanceof HTMLElement)) {
            return;
        }

        const existing = this.animatedElements.get(element);
        if (existing) {
            existing.observer.disconnect();
            this.animatedElements.delete(element);
        }

        this.renderer.removeClass(element, 'is-visible');
        this.renderer.addClass(element, 'animate-ready');

        this.cancelScheduledVisibility(element);

        // Use nested requestAnimationFrame calls to ensure the browser paints
        // the animate-ready state before applying is-visible.
        const rafId = requestAnimationFrame(() => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || this.document.documentElement.clientHeight;
            const isInViewport = rect.top <= windowHeight && rect.bottom >= 0;

            if (isInViewport) {
                const revealRafId = requestAnimationFrame(() => {
                    this.renderer.addClass(element, 'is-visible');
                    this.rafIds.delete(element);
                });
                this.rafIds.set(element, revealRafId);
                return;
            }

            const observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries, element),
                {
                    threshold: this.threshold,
                    rootMargin: this.rootMargin,
                },
            );

            observer.observe(element);
            this.animatedElements.set(element, { element, observer });
            this.rafIds.delete(element);
        });

        this.rafIds.set(element, rafId);
    }

    unobserve(element: HTMLElement): void {
        this.cancelScheduledVisibility(element);

        const animated = this.animatedElements.get(element);
        if (animated) {
            animated.observer.disconnect();
            this.animatedElements.delete(element);
        }
    }

    private handleIntersection(entries: IntersectionObserverEntry[], element: HTMLElement): void {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                this.renderer.addClass(element, 'is-visible');
                // Stop observing once visible
                const animated = this.animatedElements.get(element);
                if (animated) {
                    animated.observer.unobserve(element);
                    this.animatedElements.delete(element);
                }
            }
        });
    }

    destroy(): void {
        this.rafIds.forEach((id) => {
            cancelAnimationFrame(id);
        });
        this.rafIds.clear();

        this.animatedElements.forEach((animated) => {
            animated.observer.disconnect();
        });
        this.animatedElements.clear();
    }

    private replayAnimationsInView(): void {
        const elements = this.document.querySelectorAll<HTMLElement>('.animate-on-scroll');
        elements.forEach((element) => {
            this.observe(element);
        });
    }

    private cancelScheduledVisibility(element: HTMLElement): void {
        const rafId = this.rafIds.get(element);
        if (rafId) {
            cancelAnimationFrame(rafId);
            this.rafIds.delete(element);
        }
    }
}
