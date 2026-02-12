import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { Lock, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
    templateUrl: './admin-login.component.html',
    styleUrl: './admin-login.component.css',
})
export class AdminLoginComponent implements OnInit {
    private readonly authService = inject(AdminAuthService);
    private readonly router = inject(Router);
    private readonly seo = inject(SeoService);

    password = signal('');
    isLoading = signal(false);
    error = signal('');

    icons = { Lock };

    ngOnInit(): void {
        this.seo.updateTitle('Admin Login | Nacho.dev');

        this.authService.isAuthenticated$.subscribe((isAuth) => {
            if (isAuth) {
                this.router.navigate(['/admin']);
            }
        });
    }

    onSubmit(): void {
        if (!this.password() || this.isLoading()) return;

        this.isLoading.set(true);
        this.error.set('');

        this.authService.login(this.password()).subscribe({
            next: (response) => {
                this.isLoading.set(false);
                if (response.success) {
                    this.router.navigate(['/admin']);
                } else {
                    this.error.set(response.message);
                }
            },
            error: () => {
                this.isLoading.set(false);
                this.error.set('An error occurred. Please try again.');
            },
        });
    }
}
