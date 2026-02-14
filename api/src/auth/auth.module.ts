import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const configuredSecret = configService.get<string>('ADMIN_JWT_SECRET');
                const isProduction = configService.get<string>('NODE_ENV') === 'production';

                if (!configuredSecret && isProduction) {
                    throw new Error('ADMIN_JWT_SECRET must be configured in production');
                }

                const hours = parseInt(configService.get<string>('ADMIN_SESSION_HOURS') || '12', 10);
                if (isNaN(hours) || hours < 1 || hours > 168) {
                    throw new Error('ADMIN_SESSION_HOURS must be a number between 1 and 168');
                }

                return {
                    secret: configuredSecret || 'dev-secret',
                    signOptions: {
                        expiresIn: `${hours}h`,
                    },
                };
            },
        }),
    ],
    providers: [AuthService, AuthGuard],
    exports: [AuthService, AuthGuard],
})
export class AuthModule {}
