import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly document = inject(DOCUMENT);
    private readonly isBrowser = isPlatformBrowser(this.platformId);
    private readonly storageKey = 'theme';
    private readonly isDarkSubject = new BehaviorSubject<boolean>(false);

    readonly isDark$ = this.isDarkSubject.asObservable();

    constructor() {
        this.setTheme(this.resolveInitialTheme());
    }

    get isDark(): boolean {
        return this.isDarkSubject.value;
    }

    toggleTheme(): void {
        this.setTheme(!this.isDark);
    }

    setTheme(isDark: boolean = this.isDark): void {
        this.applyThemeClass(isDark);
        this.persistTheme(isDark);

        if (this.isDarkSubject.value !== isDark) {
            this.isDarkSubject.next(isDark);
        }
    }

    private applyThemeClass(isDark: boolean): void {
        if (!this.isBrowser) {
            return;
        }

        this.document.documentElement.classList.toggle('dark', isDark);
    }

    private resolveInitialTheme(): boolean {
        if (!this.isBrowser) {
            return this.isDarkSubject.value;
        }

        const persistedTheme = this.readPersistedTheme();
        if (persistedTheme !== null) {
            return persistedTheme;
        }

        if (this.document.documentElement.classList.contains('dark')) {
            return true;
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    private readPersistedTheme(): boolean | null {
        if (!this.isBrowser) {
            return null;
        }

        try {
            const theme = window.localStorage.getItem(this.storageKey);
            if (theme === 'dark') {
                return true;
            }

            if (theme === 'light') {
                return false;
            }
        } catch {
            return null;
        }

        return null;
    }

    private persistTheme(isDark: boolean): void {
        if (!this.isBrowser) {
            return;
        }

        try {
            window.localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
        } catch {
            // Ignore storage write errors (e.g., privacy mode).
        }
    }
}
