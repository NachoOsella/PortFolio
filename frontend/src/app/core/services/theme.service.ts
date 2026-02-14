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
    private readonly isDarkSubject = new BehaviorSubject<boolean>(true);

    readonly isDark$ = this.isDarkSubject.asObservable();

    constructor() {
        this.setTheme();
    }

    get isDark(): boolean {
        return true;
    }

    toggleTheme(): void {
        this.setTheme();
    }

    setTheme(): void {
        this.applyThemeClass(true);
        this.isDarkSubject.next(true);
    }

    private applyThemeClass(isDark: boolean): void {
        if (!this.isBrowser) {
            return;
        }

        this.document.documentElement.classList.toggle('dark', isDark);
    }
}
