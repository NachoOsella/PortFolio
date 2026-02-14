import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { combineLatest, filter, map, take } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AdminAuthService);

    return combineLatest([authService.isLoading$, authService.isAuthenticated$]).pipe(
        filter(([isLoading]) => !isLoading),
        take(1),
        map(([, isAuthenticated]) => {
            if (isAuthenticated) {
                return true;
            }
            return router.createUrlTree(['/admin/login']);
        })
    );
};
