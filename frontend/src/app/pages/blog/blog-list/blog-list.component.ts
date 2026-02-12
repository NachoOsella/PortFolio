import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogCardComponent } from '../../../shared/components/blog-card/blog-card.component';
import { TagFilterComponent } from '../../../shared/components/tag-filter/tag-filter.component';
import { SectionHeadingComponent } from '../../../shared/components/section-heading/section-heading.component';
import { ApiService } from '../../../core/services/api.service';
import { SeoService } from '../../../core/services/seo.service';
import { BlogPost } from '../../../shared/models/blog.model';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { Search, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-blog-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BlogCardComponent,
        TagFilterComponent,
        SectionHeadingComponent,
        LucideAngularModule,
    ],
    templateUrl: './blog-list.component.html',
    styleUrl: './blog-list.component.css',
})
export class BlogListComponent implements OnInit {
    private readonly api = inject(ApiService);
    private readonly seo = inject(SeoService);
    private readonly http = inject(HttpClient);

    posts = signal<BlogPost[]>([]);
    selectedTag = signal<string>('all');
    searchQuery = signal<string>('');
    isLoading = signal(true);
    error = signal<string | null>(null);

    icons = { Search };

    allTags = computed(() => {
        const tags = new Set<string>();
        this.posts().forEach((post) => {
            post.tags.forEach((tag) => tags.add(tag));
        });
        return ['all', ...Array.from(tags).sort()];
    });

    filteredPosts = computed(() => {
        let result = this.posts();

        if (this.selectedTag() !== 'all') {
            result = result.filter((post) => post.tags.includes(this.selectedTag()));
        }

        if (this.searchQuery().trim()) {
            const query = this.searchQuery().toLowerCase().trim();
            result = result.filter(
                (post) =>
                    post.title.toLowerCase().includes(query) ||
                    post.excerpt.toLowerCase().includes(query)
            );
        }

        return result.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    });

    ngOnInit(): void {
        this.seo.updateTitle('Blog | Nacho.dev');
        this.seo.updateMetaTags({
            description: 'Thoughts on code, projects, and continuous learning.',
        });

        this.loadPosts();
    }

    onTagSelected(tag: string): void {
        this.selectedTag.set(tag);
    }

    onSearchChange(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchQuery.set(value);
    }

    private loadPosts(): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.http.get<BlogPost[]>('/generated/blog-index.json').pipe(
            catchError(() => this.api.get<BlogPost[]>('/blog'))
        ).subscribe({
            next: (data) => {
                this.posts.set(data.filter((post) => post.published));
                this.isLoading.set(false);
            },
            error: () => {
                this.error.set('Failed to load blog posts. Please try again later.');
                this.isLoading.set(false);
            },
        });
    }
}
