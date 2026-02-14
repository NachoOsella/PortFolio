import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
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
        try {
            return await this.jwtService.verifyAsync<{ username: string }>(token);
        } catch {
            return null;
        }
    }
}
