import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing bearer token');
        }

        const token = authHeader.replace('Bearer ', '').trim();
        const payload = await this.authService.verifyAdminToken(token);

        if (!payload) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        return true;
    }
}
