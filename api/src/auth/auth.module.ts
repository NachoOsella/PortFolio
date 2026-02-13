import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.ADMIN_JWT_SECRET || 'dev-secret',
            signOptions: {
                expiresIn: `${Number(process.env.ADMIN_SESSION_HOURS || 12)}h`,
            },
        }),
    ],
    providers: [AuthService, AuthGuard],
    exports: [AuthService, AuthGuard],
})
export class AuthModule {}
