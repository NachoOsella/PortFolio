import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { map, take } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AdminAuthService);

    return authService.isAuthenticated$.pipe(
        take(1),
        map((isAuthenticated) => {
            if (isAuthenticated) {
                return true;
            }
            return router.createUrlTree(['/admin/login']);
        })
    );
};
