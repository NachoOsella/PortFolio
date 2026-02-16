import { Component, inject, OnInit, signal, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { ScrollAnimationService } from '../../core/services/scroll-animation.service';
import { Github, Mail, FileText, LucideAngularModule } from 'lucide-angular';
import { catchError, of } from 'rxjs';

interface AboutData {
    content: string;
    wordCount: number;
}

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule, MarkdownModule],
    templateUrl: './about.component.html',
    styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
    private readonly seo = inject(SeoService);
    private readonly http = inject(HttpClient);
    private readonly api = inject(ApiService);
    private readonly scrollAnimationService = inject(ScrollAnimationService);

    aboutContent = signal<string>('');
    isLoading = signal(true);
    error = signal<string | null>(null);

    icons = { Github, Mail, FileText };
    
    readonly pageHeader = viewChild<ElementRef<HTMLDivElement>>('pageHeader');
    readonly contentArea = viewChild<ElementRef<HTMLDivElement>>('contentArea');
    readonly profileBlock = viewChild<ElementRef<HTMLDivElement>>('profileBlock');
    readonly actionButtons = viewChild<ElementRef<HTMLDivElement>>('actionButtons');

    ngOnInit(): void {
        const description =
            'Backend engineer focused on Java, Spring Boot, distributed systems, and clean architecture.';
        const siteUrl = this.seo.resolveSiteUrl();

        this.seo.updateTitle('About | Nacho.dev');
        this.seo.updateMetaTags({
            description,
        });
        this.seo.setCanonicalForPath('/about');
        this.seo.setDefaultSocial({
            title: 'About | Nacho.dev',
            description,
            path: '/about',
            imagePath: '/og-image.png',
        });
        this.seo.setJsonLd({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Ignacio',
            jobTitle: 'Backend Engineer',
            description,
            url: `${siteUrl}/about`,
            sameAs: ['https://github.com/NachoOsella', 'https://www.linkedin.com/in/nachoosella/'],
        });

        this.loadAboutContent();
    }

    private loadAboutContent(): void {
        this.http
            .get<AboutData>('/generated/about.json')
            .pipe(
                catchError(() => {
                    return this.api.get<AboutData>('/about').pipe(catchError(() => of(null)));
                })
            )
            .subscribe({
                next: (data) => {
                    if (data) {
                        this.aboutContent.set(data.content);
                    } else {
                        this.error.set('Failed to load about content');
                    }
                    this.isLoading.set(false);
                    
                    setTimeout(() => {
                        this.observeElements();
                    });
                },
                error: () => {
                    this.error.set('Failed to load about content');
                    this.isLoading.set(false);
                },
            });
    }
    
    private observeElements(): void {
        // Header is visible immediately
        const header = this.pageHeader();
        if (header) {
            this.scrollAnimationService.observe(header.nativeElement);
        }
        
        // Content area
        const content = this.contentArea();
        if (content) {
            this.scrollAnimationService.observe(content.nativeElement);
        }
        
        // Profile grid
        const profile = this.profileBlock();
        if (profile) {
            this.scrollAnimationService.observe(profile.nativeElement);
        }
        
        // Action buttons
        const buttons = this.actionButtons();
        if (buttons) {
            this.scrollAnimationService.observe(buttons.nativeElement);
        }
    }
}
