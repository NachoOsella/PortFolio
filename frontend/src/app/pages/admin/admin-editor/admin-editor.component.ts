import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { ApiService } from '../../../core/services/api.service';
import { SeoService } from '../../../core/services/seo.service';
import { BlogPost } from '../../../shared/models/blog.model';
import { ArrowLeft, Save, Send, LucideAngularModule } from 'lucide-angular';


interface PostForm {
    title: string;
    slug: string;
    date: string;
    excerpt: string;
    tags: string;
    content: string;
    published: boolean;
    coverImage: string;
}

@Component({
    selector: 'app-admin-editor',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, MarkdownModule],
    templateUrl: './admin-editor.component.html',
    styleUrl: './admin-editor.component.css',
})
export class AdminEditorComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly api = inject(ApiService);
    private readonly seo = inject(SeoService);

    isEditMode = signal(false);
    originalSlug = signal<string>('');
    isLoading = signal(false);
    isSaving = signal(false);
    saveStatus = signal<'idle' | 'success' | 'error'>('idle');
    saveMessage = signal('');
    errors = signal<Record<string, string>>({});

    form = signal<PostForm>({
        title: '',
        slug: '',
        date: new Date().toISOString().split('T')[0],
        excerpt: '',
        tags: '',
        content: '',
        published: false,
        coverImage: '',
    });

    icons = { ArrowLeft, Save, Send };

    wordCount = computed(() => {
        return this.form().content.trim().split(/\s+/).filter(Boolean).length;
    });

    ngOnInit(): void {
        this.seo.updateTitle('Editor | Admin | Nacho.dev');

        this.route.params.subscribe((params) => {
            const slug = params['slug'];
            if (slug) {
                this.isEditMode.set(true);
                this.originalSlug.set(slug);
                this.loadPost(slug);
            }
        });
    }

    loadPost(slug: string): void {
        this.isLoading.set(true);
        this.api.get<BlogPost>(`/blog/${slug}`).subscribe({
            next: (post) => {
                this.form.set({
                    title: post.title,
                    slug: post.slug,
                    date: post.date,
                    excerpt: post.excerpt,
                    tags: post.tags.join(', '),
                    content: post.content || '',
                    published: post.published,
                    coverImage: post.coverImage || '',
                });
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.router.navigate(['/admin']);
            },
        });
    }

    generateSlug(): void {
        const title = this.form().title;
        if (!this.isEditMode() && title && !this.form().slug) {
            const slug = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 50);
            this.form.update((f) => ({ ...f, slug }));
        }
    }

    validateForm(): boolean {
        const errs: Record<string, string> = {};
        const f = this.form();

        if (!f.title || f.title.length < 3) {
            errs['title'] = 'Title must be at least 3 characters';
        }

        if (!f.slug || !/^[a-z0-9-]+$/.test(f.slug)) {
            errs['slug'] = 'Slug must be lowercase letters, numbers, and hyphens only';
        }

        if (!f.date) {
            errs['date'] = 'Date is required';
        }

        if (!f.excerpt || f.excerpt.length < 10) {
            errs['excerpt'] = 'Excerpt must be at least 10 characters';
        }

        if (!f.content || f.content.length < 50) {
            errs['content'] = 'Content must be at least 50 characters';
        }

        this.errors.set(errs);
        return Object.keys(errs).length === 0;
    }

    save(publish = false): void {
        if (this.isSaving()) return;

        if (!this.validateForm()) {
            this.saveStatus.set('error');
            this.saveMessage.set('Please fix the errors above.');
            return;
        }

        this.isSaving.set(true);
        this.saveStatus.set('idle');

        const postData = {
            ...this.form(),
            tags: this.form().tags.split(',').map((t) => t.trim()).filter(Boolean),
            published: publish || this.form().published,
        };

        const request = this.isEditMode()
            ? this.api.put<BlogPost>(`/admin/posts/${this.originalSlug()}`, postData)
            : this.api.post<BlogPost>('/admin/posts', postData);

        request.subscribe({
            next: (post) => {
                this.isSaving.set(false);
                this.saveStatus.set('success');
                this.saveMessage.set(publish ? 'Post published successfully!' : 'Draft saved successfully!');

                if (!this.isEditMode()) {
                    this.router.navigate(['/admin/edit', post.slug]);
                } else if (post.slug !== this.originalSlug()) {
                    this.originalSlug.set(post.slug);
                    this.router.navigate(['/admin/edit', post.slug], { replaceUrl: true });
                }
            },
            error: () => {
                this.isSaving.set(false);
                this.saveStatus.set('error');
                this.saveMessage.set('Failed to save. Please try again.');
            },
        });
    }

    canDeactivate(): boolean {
        return this.saveStatus() === 'success' || confirm('You have unsaved changes. Are you sure you want to leave?');
    }

    updateField(field: keyof PostForm, value: string): void {
        this.form.update((f) => ({ ...f, [field]: value }));
    }

    updatePublished(value: boolean): void {
        this.form.update((f) => ({ ...f, published: value }));
    }
}
