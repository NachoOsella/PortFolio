import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, isDevMode } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { ADMIN_AUTH_TOKEN_KEY } from '../constants/admin-auth.constants';

export interface AdminAuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface AdminLoginResponse {
    token: string;
    expiresAt: string;
}

@Injectable({
    providedIn: 'root',
})
export class AdminAuthService {
    private readonly http = inject(HttpClient);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly baseUrl = isDevMode() ? 'http://localhost:3000/api/admin' : '/api/admin';
    private readonly isBrowser = isPlatformBrowser(this.platformId);

    private authState = new BehaviorSubject<AdminAuthState>({
        isAuthenticated: false,
        isLoading: true,
    });

    isAuthenticated$ = this.authState.asObservable().pipe(map((s) => s.isAuthenticated));
    isLoading$ = this.authState.asObservable().pipe(map((s) => s.isLoading));

    constructor() {
        this.verifyAuth();
    }

    login(password: string): Observable<{ success: boolean; message: string }> {
        return this.http
            .post<AdminLoginResponse>(
                `${this.baseUrl}/login`,
                { password }
            )
            .pipe(
                tap((response) => {
                    this.storeToken(response.token);
                    this.authState.next({ isAuthenticated: true, isLoading: false });
                }),
                map(() => ({
                    success: true,
                    message: 'Authenticated',
                })),
                catchError((error) => {
                    this.clearToken();
                    this.authState.next({ isAuthenticated: false, isLoading: false });
                    return of({
                        success: false,
                        message:
                            (typeof error?.error?.message === 'string' && error.error.message) ||
                            'Login failed. Please check your password.',
                    });
                })
            );
    }

    logout(): Observable<{ success: boolean }> {
        const headers = this.buildAuthHeaders();
        this.clearToken();
        this.authState.next({ isAuthenticated: false, isLoading: false });

        if (!headers) {
            return of({ success: true });
        }

        return this.http
            .post<{ success: boolean }>(`${this.baseUrl}/logout`, {}, { headers })
            .pipe(
                catchError(() => {
                    return of({ success: true });
                })
            );
    }

    verifyAuth(): void {
        const headers = this.buildAuthHeaders();
        if (!headers) {
            this.authState.next({ isAuthenticated: false, isLoading: false });
            return;
        }

        this.http
            .get<{ authenticated: boolean }>(`${this.baseUrl}/verify`, { headers })
            .pipe(
                catchError(() => of({ authenticated: false }))
            )
            .subscribe({
                next: (response) => {
                    if (!response.authenticated) {
                        this.clearToken();
                    }
                    this.authState.next({
                        isAuthenticated: response.authenticated,
                        isLoading: false,
                    });
                },
            });
    }

    isAuthenticated(): boolean {
        return this.authState.value.isAuthenticated;
    }

    isLoading(): boolean {
        return this.authState.value.isLoading;
    }

    private buildAuthHeaders(): HttpHeaders | null {
        const token = this.getStoredToken();
        if (!token) {
            return null;
        }

        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    private getStoredToken(): string | null {
        if (!this.isBrowser) {
            return null;
        }

        return localStorage.getItem(ADMIN_AUTH_TOKEN_KEY);
    }

    private storeToken(token: string): void {
        if (!this.isBrowser) {
            return;
        }

        localStorage.setItem(ADMIN_AUTH_TOKEN_KEY, token);
    }

    private clearToken(): void {
        if (!this.isBrowser) {
            return;
        }

        localStorage.removeItem(ADMIN_AUTH_TOKEN_KEY);
    }
}
