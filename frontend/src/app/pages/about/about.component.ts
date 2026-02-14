import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { Github, Mail, FileText, Code, Briefcase, MapPin, CircleCheck, LucideAngularModule } from 'lucide-angular';
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

    aboutContent = signal<string>('');
    isLoading = signal(true);
    error = signal<string | null>(null);

    icons = { Github, Mail, FileText, Code, Briefcase, MapPin, CircleCheck };

    ngOnInit(): void {
        this.seo.updateTitle('About | Nacho.dev');
        this.seo.updateMetaTags({
            description: 'Full-stack developer passionate about building modern web applications with TypeScript, Angular, and Node.js.',
        });

        this.loadAboutContent();
    }

    private loadAboutContent(): void {
        this.http.get<AboutData>('/generated/about.json').pipe(
            catchError(() => {
                return this.api.get<AboutData>('/about').pipe(
                    catchError(() => of(null))
                );
            })
        ).subscribe({
            next: (data) => {
                if (data) {
                    this.aboutContent.set(data.content);
                } else {
                    this.error.set('Failed to load about content');
                }
                this.isLoading.set(false);
            },
            error: () => {
                this.error.set('Failed to load about content');
                this.isLoading.set(false);
            },
        });
    }
}
