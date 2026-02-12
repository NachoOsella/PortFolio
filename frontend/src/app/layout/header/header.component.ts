import { Component, HostListener, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
    LucideAngularModule,
    Sun,
    Moon,
    Menu,
    X,
    Download,
} from 'lucide-angular';
import { ThemeService } from '../../core/services/theme.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, LucideAngularModule],
    providers: [
        {
            provide: 'LUCIDE_ICONS',
            useValue: { Sun, Moon, Menu, X, Download },
        },
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent {
    private readonly themeService = inject(ThemeService);

    mobileMenuOpen = signal(false);
    scrolled = signal(false);
    readonly isDark = toSignal(this.themeService.isDark$, {
        initialValue: this.themeService.isDark,
    });
    readonly mobileNavId = 'mobile-nav-panel';

    readonly navLinks = [
        { label: 'Home', path: '/' },
        { label: 'Projects', path: '/projects' },
        { label: 'Blog', path: '/blog' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
    ];
    
    readonly icons = { Sun, Moon, Menu, X, Download };

    @HostListener('window:scroll')
    onScroll(): void {
        this.scrolled.set(window.scrollY > 10);
    }

    @HostListener('window:keydown.escape')
    onEscape(): void {
        this.closeMobileMenu();
    }

    toggleTheme(): void {
        this.themeService.toggleTheme();
    }

    toggleMobileMenu(): void {
        this.mobileMenuOpen.update((v) => !v);

        if (typeof document !== 'undefined') {
            document.body.style.overflow = this.mobileMenuOpen() ? 'hidden' : '';
        }
    }

    closeMobileMenu(): void {
        this.mobileMenuOpen.set(false);

        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
        }
    }
}
