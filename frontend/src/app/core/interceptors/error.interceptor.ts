import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse) {
                const message = getHttpErrorMessage(error);
                console.error(
                    `[HTTP ${error.status}] ${req.method} ${req.urlWithParams} - ${message}`,
                    error,
                );
            } else {
                console.error(
                    `[HTTP] ${req.method} ${req.urlWithParams} - Unexpected request error`,
                    error,
                );
            }

            return throwError(() => error);
        }),
    );
};

function getHttpErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
        case 0:
            return 'Network error or CORS issue';
        case 400:
            return 'Bad request';
        case 401:
            return 'Unauthorized';
        case 403:
            return 'Forbidden';
        case 404:
            return 'Resource not found';
        case 429:
            return 'Too many requests';
        case 500:
            return 'Internal server error';
        default:
            return error.message || 'Unknown HTTP error';
    }
}
