import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, isDevMode } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = isDevMode() ? 'http://localhost:3000/api' : '/api';
    private readonly retryDelayMs = 500;

    get<T>(endpoint: string, retryCount = 1): Observable<T> {
        const request$ = this.http.get<T>(this.buildUrl(endpoint));
        return this.requestWithHandling(request$, 'GET', endpoint, retryCount);
    }

    post<TResponse, TBody = unknown>(endpoint: string, data: TBody, retryCount = 0): Observable<TResponse> {
        const request$ = this.http.post<TResponse>(this.buildUrl(endpoint), data);
        return this.requestWithHandling(request$, 'POST', endpoint, retryCount);
    }

    put<TResponse, TBody = unknown>(endpoint: string, data: TBody, retryCount = 0): Observable<TResponse> {
        const request$ = this.http.put<TResponse>(this.buildUrl(endpoint), data);
        return this.requestWithHandling(request$, 'PUT', endpoint, retryCount);
    }

    delete<TResponse>(endpoint: string, retryCount = 0): Observable<TResponse> {
        const request$ = this.http.delete<TResponse>(this.buildUrl(endpoint));
        return this.requestWithHandling(request$, 'DELETE', endpoint, retryCount);
    }

    private requestWithHandling<T>(
        request$: Observable<T>,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        retryCount: number,
    ): Observable<T> {
        return request$.pipe(
            retry({
                count: retryCount,
                delay: this.retryDelayMs,
            }),
            catchError((error: unknown) => this.handleError(method, endpoint, error)),
        );
    }

    private handleError(method: string, endpoint: string, error: unknown): Observable<never> {
        const detail = this.getErrorDetail(error);
        console.error(`[ApiService] ${method} ${endpoint} failed: ${detail}`, error);
        return throwError(() => (error instanceof Error ? error : new Error(detail)));
    }

    private getErrorDetail(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            if (typeof error.error === 'string' && error.error.trim().length > 0) {
                return `HTTP ${error.status} - ${error.error}`;
            }

            if (error.error && typeof error.error === 'object' && 'message' in error.error) {
                const payloadMessage = error.error['message'];
                if (typeof payloadMessage === 'string' && payloadMessage.trim().length > 0) {
                    return `HTTP ${error.status} - ${payloadMessage}`;
                }
            }

            return `HTTP ${error.status} - ${error.message}`;
        }

        if (error instanceof Error) {
            return error.message;
        }

        return 'Unknown API error';
    }

    private buildUrl(endpoint: string): string {
        const normalizedEndpoint = endpoint.replace(/^\/+/, '');
        return `${this.baseUrl}/${normalizedEndpoint}`;
    }
}
