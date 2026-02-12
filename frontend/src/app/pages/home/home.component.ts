import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { HeroSectionComponent } from './sections/hero-section/hero-section.component';
import { FeaturedProjectsSectionComponent } from './sections/featured-projects-section/featured-projects-section.component';
import { SkillsOverviewSectionComponent } from './sections/skills-overview-section/skills-overview-section.component';
import { LatestPostsSectionComponent } from './sections/latest-posts-section/latest-posts-section.component';
import { CtaSectionComponent } from './sections/cta-section/cta-section.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        HeroSectionComponent,
        FeaturedProjectsSectionComponent,
        SkillsOverviewSectionComponent,
        LatestPostsSectionComponent,
        CtaSectionComponent,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
    private readonly seo = inject(SeoService);

    ngOnInit(): void {
        this.setSeo();
    }

    private setSeo(): void {
        const title = 'Ignacio | Full-Stack Developer';
        const description =
            'Full-stack developer passionate about building modern web applications with TypeScript, Angular, and NestJS. View my projects and read my blog.';
        const url = 'https://nacho.dev';

        this.seo.updateTitle(title);
        this.seo.updateMetaTags({
            description,
            author: 'Ignacio',
        });
        this.seo.setOpenGraph({
            title,
            description,
            type: 'website',
            url,
            siteName: 'Ignacio Portfolio',
        });
        this.seo.setJsonLd({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Ignacio Portfolio',
            url,
            author: {
                '@type': 'Person',
                name: 'Ignacio',
                jobTitle: 'Full-Stack Developer',
                url,
            },
        });
    }
}
