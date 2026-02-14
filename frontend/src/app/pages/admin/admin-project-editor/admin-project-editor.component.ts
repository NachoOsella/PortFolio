import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SeoService } from '../../../core/services/seo.service';
import { Project } from '../../../shared/models/project.model';
import { ArrowLeft, Save, Plus, LucideAngularModule } from 'lucide-angular';

interface ProjectForm {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    image: string;
    category: string;
    technologies: string;
    featured: boolean;
    liveUrl: string;
    githubUrl: string;
    highlights: string;
    date: string;
}

@Component({
    selector: 'app-admin-project-editor',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
    templateUrl: './admin-project-editor.component.html',
    styleUrl: './admin-project-editor.component.css',
})
export class AdminProjectEditorComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly api = inject(ApiService);
    private readonly seo = inject(SeoService);

    isEditMode = signal(false);
    originalId = signal<string>('');
    isLoading = signal(false);
    isSaving = signal(false);
    saveStatus = signal<'idle' | 'success' | 'error'>('idle');
    saveMessage = signal('');
    errors = signal<Record<string, string>>({});

    form = signal<ProjectForm>({
        id: '',
        title: '',
        description: '',
        longDescription: '',
        image: '',
        category: '',
        technologies: '',
        featured: false,
        liveUrl: '',
        githubUrl: '',
        highlights: '',
        date: new Date().toISOString().split('T')[0],
    });

    icons = { ArrowLeft, Save, Plus };

    ngOnInit(): void {
        this.seo.updateTitle('Project Editor | Admin | Nacho.dev');

        this.route.params.subscribe((params) => {
            const id = params['id'];
            if (id) {
                this.isEditMode.set(true);
                this.originalId.set(id);
                this.loadProject(id);
            }
        });
    }

    loadProject(id: string): void {
        this.isLoading.set(true);
        this.api.get<Project>(`/admin/projects/${id}`).subscribe({
            next: (project) => {
                this.form.set({
                    id: project.id,
                    title: project.title,
                    description: project.description,
                    longDescription: project.longDescription,
                    image: project.image,
                    category: project.category,
                    technologies: project.technologies.join(', '),
                    featured: project.featured,
                    liveUrl: project.links.live || '',
                    githubUrl: project.links.github || '',
                    highlights: project.highlights.join('\n'),
                    date: project.date,
                });
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.router.navigate(['/admin']);
            },
        });
    }

    generateId(): void {
        const title = this.form().title;
        if (!this.isEditMode() && title && !this.form().id) {
            const id = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 50);
            this.form.update((f) => ({ ...f, id }));
        }
    }

    validateForm(): boolean {
        const errs: Record<string, string> = {};
        const f = this.form();

        if (!f.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.id)) {
            errs['id'] = 'ID must be lowercase letters, numbers, and hyphens only (kebab-case)';
        }

        if (!f.title || f.title.length < 5) {
            errs['title'] = 'Title must be at least 5 characters';
        }

        if (!f.description || f.description.length < 10) {
            errs['description'] = 'Description must be at least 10 characters';
        }

        if (!f.longDescription || f.longDescription.length < 50) {
            errs['longDescription'] = 'Long description must be at least 50 characters';
        }

        if (!f.image) {
            errs['image'] = 'Image URL is required';
        } else if (!this.isValidUrl(f.image)) {
            errs['image'] = 'Please enter a valid URL';
        }

        if (!f.category || f.category.length < 2) {
            errs['category'] = 'Category is required';
        }

        if (!f.technologies || f.technologies.trim().length === 0) {
            errs['technologies'] = 'At least one technology is required';
        }

        if (!f.highlights || f.highlights.trim().length === 0) {
            errs['highlights'] = 'At least one highlight is required';
        }

        if (!f.date) {
            errs['date'] = 'Date is required';
        }

        if (f.liveUrl && !this.isValidUrl(f.liveUrl)) {
            errs['liveUrl'] = 'Please enter a valid URL or leave empty';
        }

        if (f.githubUrl && !this.isValidUrl(f.githubUrl)) {
            errs['githubUrl'] = 'Please enter a valid URL or leave empty';
        }

        this.errors.set(errs);
        return Object.keys(errs).length === 0;
    }

    private isValidUrl(url: string): boolean {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    save(): void {
        if (this.isSaving()) return;

        if (!this.validateForm()) {
            this.saveStatus.set('error');
            this.saveMessage.set('Please fix the errors above.');
            return;
        }

        this.isSaving.set(true);
        this.saveStatus.set('idle');

        const projectData = {
            id: this.form().id,
            title: this.form().title,
            description: this.form().description,
            longDescription: this.form().longDescription,
            image: this.form().image,
            category: this.form().category,
            technologies: this.form()
                .technologies.split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            featured: this.form().featured,
            links: {
                live: this.form().liveUrl.trim() || null,
                github: this.form().githubUrl.trim() || null,
            },
            highlights: this.form()
                .highlights.split('\n')
                .map((h) => h.trim())
                .filter(Boolean),
            date: this.form().date,
        };

        const request = this.isEditMode()
            ? this.api.put<Project>(`/admin/projects/${this.originalId()}`, projectData)
            : this.api.post<Project>('/admin/projects', projectData);

        request.subscribe({
            next: (project) => {
                this.isSaving.set(false);
                this.saveStatus.set('success');
                this.saveMessage.set(this.isEditMode() ? 'Project updated successfully!' : 'Project created successfully!');

                if (!this.isEditMode()) {
                    this.router.navigate(['/admin/projects/edit', project.id]);
                }
            },
            error: (err) => {
                this.isSaving.set(false);
                this.saveStatus.set('error');
                this.saveMessage.set(err?.error?.message || 'Failed to save. Please try again.');
            },
        });
    }

    canDeactivate(): boolean {
        return this.saveStatus() === 'success' || confirm('You have unsaved changes. Are you sure you want to leave?');
    }

    updateField(field: keyof ProjectForm, value: string | boolean): void {
        this.form.update((f) => ({ ...f, [field]: value }));
    }
}
