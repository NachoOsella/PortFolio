import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type ThemePreference = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly document = inject(DOCUMENT);
    private readonly storageKey = 'theme';
    private readonly isBrowser = isPlatformBrowser(this.platformId);
    private readonly isDarkSubject = new BehaviorSubject<boolean>(false);

    readonly isDark$ = this.isDarkSubject.asObservable();

    constructor() {
        const initialThemeIsDark = this.resolveInitialTheme();
        this.setTheme(initialThemeIsDark, false);
    }

    get isDark(): boolean {
        return this.isDarkSubject.value;
    }

    toggleTheme(): void {
        this.setTheme(!this.isDarkSubject.value);
    }

    setTheme(isDark: boolean, persist = true): void {
        this.applyThemeClass(isDark);
        this.isDarkSubject.next(isDark);

        if (persist) {
            this.persistThemePreference(isDark ? 'dark' : 'light');
        }
    }

    private resolveInitialTheme(): boolean {
        const storedPreference = this.getStoredThemePreference();
        if (storedPreference) {
            return storedPreference === 'dark';
        }

        return this.getSystemThemePreference() === 'dark';
    }

    private getStoredThemePreference(): ThemePreference | null {
        if (!this.isBrowser) {
            return null;
        }

        const value = localStorage.getItem(this.storageKey);
        if (value === 'dark' || value === 'light') {
            return value;
        }

        return null;
    }

    private getSystemThemePreference(): ThemePreference {
        if (!this.isBrowser || typeof window.matchMedia !== 'function') {
            return 'light';
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    private applyThemeClass(isDark: boolean): void {
        this.document.documentElement.classList.toggle('dark', isDark);
    }

    private persistThemePreference(theme: ThemePreference): void {
        if (!this.isBrowser) {
            return;
        }

        localStorage.setItem(this.storageKey, theme);
    }
}
