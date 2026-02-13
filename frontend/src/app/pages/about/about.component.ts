import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';
import { Github, Mail, FileText, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, RouterLink, SectionHeadingComponent, LucideAngularModule],
    templateUrl: './about.component.html',
    styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
    private readonly seo = inject(SeoService);

    icons = { Github, Mail, FileText };

    ngOnInit(): void {
        this.seo.updateTitle('About | Nacho.dev');
        this.seo.updateMetaTags({
            description: 'Full-stack developer passionate about building modern web applications with TypeScript, Angular, and Node.js.',
        });
    }
}
