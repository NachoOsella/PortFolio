import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpsertPostDto } from './dto/upsert-post.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Post('login')
    login(@Body() body: AdminLoginDto): Promise<{ token: string }> {
        return this.adminService.login(body);
    }

    @Post('logout')
    @UseGuards(AuthGuard)
    logout(): { success: boolean } {
        return this.adminService.logout();
    }

    @Get('verify')
    @UseGuards(AuthGuard)
    verify(): { authenticated: boolean } {
        return this.adminService.verifySession();
    }

    @Get('posts')
    @UseGuards(AuthGuard)
    getPosts(): Array<{ slug: string; title: string }> {
        return this.adminService.listPosts();
    }

    @Post('posts')
    @UseGuards(AuthGuard)
    createPost(@Body() payload: UpsertPostDto): { success: boolean } {
        return this.adminService.createPost(payload);
    }

    @Put('posts/:slug')
    @UseGuards(AuthGuard)
    updatePost(@Param('slug') slug: string, @Body() payload: UpsertPostDto): { success: boolean } {
        return this.adminService.updatePost(slug, payload);
    }

    @Delete('posts/:slug')
    @UseGuards(AuthGuard)
    deletePost(@Param('slug') slug: string): { success: boolean } {
        return this.adminService.deletePost(slug);
    }
}
