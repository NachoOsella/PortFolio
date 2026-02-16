import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private readonly revokedAdminTokens = new Map<string, number>();

    constructor(private readonly jwtService: JwtService) {}

    async signAdminToken(payload: { username: string }): Promise<{ token: string; expiresAt: string }> {
        const token = await this.jwtService.signAsync(payload);
        const decoded = this.jwtService.decode(token) as { exp?: number } | null;
        const expiresAt = decoded?.exp
            ? new Date(decoded.exp * 1000).toISOString()
            : new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

        return { token, expiresAt };
    }

    async verifyAdminToken(token: string): Promise<{ username: string } | null> {
        if (this.isAdminTokenRevoked(token)) {
            return null;
        }

        try {
            return await this.jwtService.verifyAsync<{ username: string }>(token);
        } catch {
            return null;
        }
    }

    revokeAdminToken(token: string): void {
        if (!token) {
            return;
        }

        this.cleanupExpiredRevokedAdminTokens();

        const decoded = this.jwtService.decode(token) as { exp?: number } | null;
        if (!decoded?.exp) {
            return;
        }

        const expiresAtMs = decoded.exp * 1000;
        if (expiresAtMs <= Date.now()) {
            this.revokedAdminTokens.delete(token);
            return;
        }

        this.revokedAdminTokens.set(token, expiresAtMs);
    }

    private isAdminTokenRevoked(token: string): boolean {
        this.cleanupExpiredRevokedAdminTokens();

        return this.revokedAdminTokens.has(token);
    }

    private cleanupExpiredRevokedAdminTokens(): void {
        const now = Date.now();

        for (const [token, expiresAtMs] of this.revokedAdminTokens.entries()) {
            if (expiresAtMs <= now) {
                this.revokedAdminTokens.delete(token);
            }
        }
    }
}
