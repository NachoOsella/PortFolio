import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpsertPostDto } from './dto/upsert-post.dto';

@Injectable()
export class AdminService {
    constructor(private readonly authService: AuthService) {}

    async login(body: AdminLoginDto): Promise<{ token: string }> {
        const token = await this.authService.signAdminToken({ username: 'admin' });
        void body;
        return { token };
    }

    logout(): { success: boolean } {
        return { success: true };
    }

    verifySession(): { authenticated: boolean } {
        return { authenticated: true };
    }

    listPosts(): Array<{ slug: string; title: string }> {
        return [];
    }

    createPost(payload: UpsertPostDto): { success: boolean } {
        void payload;
        return { success: true };
    }

    updatePost(slug: string, payload: UpsertPostDto): { success: boolean } {
        void slug;
        void payload;
        return { success: true };
    }

    deletePost(slug: string): { success: boolean } {
        void slug;
        return { success: true };
    }
}
