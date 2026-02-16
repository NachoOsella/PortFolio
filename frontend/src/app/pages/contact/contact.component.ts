import { Component, inject, OnInit, signal, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { ScrollAnimationService } from '../../core/services/scroll-animation.service';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';
import { Mail, Github, Send, LucideAngularModule } from 'lucide-angular';

interface ContactForm {
    name: string;
    email: string;
    subject: string;
    message: string;
    honeypot: string;
}

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, FormsModule, SectionHeadingComponent, LucideAngularModule],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit {
    private readonly seo = inject(SeoService);
    private readonly api = inject(ApiService);
    private readonly scrollAnimationService = inject(ScrollAnimationService);

    form = signal<ContactForm>({
        name: '',
        email: '',
        subject: '',
        message: '',
        honeypot: '',
    });

    errors = signal<Record<string, string>>({});
    isSubmitting = signal(false);
    submitStatus = signal<'idle' | 'success' | 'error'>('idle');
    submitMessage = signal('');
    
    readonly contactForm = viewChild<ElementRef<HTMLDivElement>>('contactForm');
    readonly contactInfo = viewChild<ElementRef<HTMLDivElement>>('contactInfo');

    icons = { Mail, Github, Send };

    ngOnInit(): void {
        const description = 'Get in touch for collaboration, opportunities, or just to say hello.';

        this.seo.updateTitle('Contact | Nacho.dev');
        this.seo.updateMetaTags({
            description,
        });
        this.seo.setCanonicalForPath('/contact');
        this.seo.setDefaultSocial({
            title: 'Contact | Nacho.dev',
            description,
            path: '/contact',
            imagePath: '/og-image.png',
        });
        this.seo.setJsonLd({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contact',
            description,
            url: this.seo.buildAbsoluteUrl('/contact'),
        });
        
        setTimeout(() => {
            this.observeElements();
        });
    }

    validateForm(): boolean {
        const errs: Record<string, string> = {};
        const f = this.form();

        if (!f.name || f.name.length < 2) {
            errs['name'] = 'Name must be at least 2 characters';
        }

        if (!f.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
            errs['email'] = 'Please enter a valid email';
        }

        if (!f.subject || f.subject.length < 5) {
            errs['subject'] = 'Subject must be at least 5 characters';
        }

        if (!f.message || f.message.length < 20) {
            errs['message'] = 'Message must be at least 20 characters';
        }

        this.errors.set(errs);
        return Object.keys(errs).length === 0;
    }

    onSubmit(): void {
        if (this.isSubmitting()) return;

        if (this.form().honeypot) {
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        this.isSubmitting.set(true);
        this.submitStatus.set('idle');

        this.api.post<{ success: boolean; message: string }>('/contact', this.form()).subscribe({
            next: (response) => {
                this.isSubmitting.set(false);
                if (response.success) {
                    this.submitStatus.set('success');
                    this.submitMessage.set('Thank you! Your message has been sent successfully.');
                    this.form.set({
                        name: '',
                        email: '',
                        subject: '',
                        message: '',
                        honeypot: '',
                    });
                } else {
                    this.submitStatus.set('error');
                    this.submitMessage.set(response.message || 'Something went wrong. Please try again.');
                }
            },
            error: () => {
                this.isSubmitting.set(false);
                this.submitStatus.set('error');
                this.submitMessage.set('Failed to send message. Please try again later.');
            },
        });
    }

    updateField(field: keyof ContactForm, value: string): void {
        this.form.update((f) => ({ ...f, [field]: value }));
        if (this.errors()[field]) {
            this.errors.update((e) => {
                const newErrors = { ...e };
                delete newErrors[field];
                return newErrors;
            });
        }
    }
    
    private observeElements(): void {
        // Contact form
        const form = this.contactForm();
        if (form) {
            this.scrollAnimationService.observe(form.nativeElement);
        }
        
        // Contact info cards
        const info = this.contactInfo();
        if (info) {
            const cards = info.nativeElement.querySelectorAll('.surface-card');
            cards.forEach((card) => {
                this.scrollAnimationService.observe(card as HTMLElement);
            });
        }
    }
}
