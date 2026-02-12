import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface AdminAuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AdminAuthService {
    private readonly http = inject(HttpClient);
    private readonly api = inject(ApiService);
    private readonly baseUrl = isDevMode() ? 'http://localhost:3000/api/admin' : '/api/admin';

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
            .post<{ success: boolean; message: string }>(
                `${this.baseUrl}/login`,
                { password },
                { withCredentials: true }
            )
            .pipe(
                tap((response) => {
                    if (response.success) {
                        this.authState.next({ isAuthenticated: true, isLoading: false });
                    }
                }),
                catchError((error) => {
                    return of({
                        success: false,
                        message: error.error?.message || 'Login failed. Please try again.',
                    });
                })
            );
    }

    logout(): Observable<{ success: boolean }> {
        return this.http
            .post<{ success: boolean }>(`${this.baseUrl}/logout`, {}, { withCredentials: true })
            .pipe(
                tap(() => {
                    this.authState.next({ isAuthenticated: false, isLoading: false });
                }),
                catchError(() => {
                    this.authState.next({ isAuthenticated: false, isLoading: false });
                    return of({ success: true });
                })
            );
    }

    verifyAuth(): void {
        this.http
            .get<{ authenticated: boolean }>(`${this.baseUrl}/verify`, { withCredentials: true })
            .pipe(
                catchError(() => of({ authenticated: false }))
            )
            .subscribe({
                next: (response) => {
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
}
