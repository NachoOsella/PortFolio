import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

    async signAdminToken(payload: { username: string }): Promise<string> {
        return this.jwtService.signAsync(payload);
    }

    async verifyAdminToken(token: string): Promise<{ username: string } | null> {
        try {
            return await this.jwtService.verifyAsync<{ username: string }>(token);
        } catch {
            return null;
        }
    }
}
