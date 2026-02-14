import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

import { AuthGuard } from '../auth/auth.guard';
import { ProjectRecord } from '../common/content-files';
import {
    ALLOWED_IMAGE_MIME_TYPES,
    AdminPost,
    AdminPostSummary,
    AdminService,
    AdminUploadFile,
    AdminUploadedImage,
} from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpsertPostDto } from './dto/upsert-post.dto';
import { UpsertProjectDto } from './dto/upsert-project.dto';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    login(@Body() body: AdminLoginDto): Promise<{ token: string; expiresAt: string }> {
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
    getPosts(): Promise<AdminPostSummary[]> {
        return this.adminService.listPosts();
    }

    @Get('posts/:slug')
    @UseGuards(AuthGuard)
    async getPostBySlug(@Param('slug') slug: string): Promise<AdminPost> {
        const post = await this.adminService.getPostBySlug(slug);
        if (!post) {
            throw new NotFoundException(`Blog post with slug "${slug}" not found`);
        }

        return post;
    }

    @Post('posts')
    @UseGuards(AuthGuard)
    createPost(@Body() payload: UpsertPostDto): Promise<AdminPost> {
        return this.adminService.createPost(payload);
    }

    @Put('posts/:slug')
    @UseGuards(AuthGuard)
    updatePost(@Param('slug') slug: string, @Body() payload: UpsertPostDto): Promise<AdminPost> {
        return this.adminService.updatePost(slug, payload);
    }

    @Delete('posts/:slug')
    @UseGuards(AuthGuard)
    deletePost(@Param('slug') slug: string): Promise<{ success: boolean }> {
        return this.adminService.deletePost(slug);
    }

    @Get('projects')
    @UseGuards(AuthGuard)
    getProjects(): Promise<ProjectRecord[]> {
        return this.adminService.listProjects();
    }

    @Get('projects/:id')
    @UseGuards(AuthGuard)
    async getProjectById(@Param('id') id: string): Promise<ProjectRecord> {
        const project = await this.adminService.getProjectById(id);
        if (!project) {
            throw new NotFoundException(`Project with ID "${id}" not found`);
        }
        return project;
    }

    @Post('projects')
    @UseGuards(AuthGuard)
    createProject(@Body() payload: UpsertProjectDto): Promise<ProjectRecord> {
        return this.adminService.createProject(payload);
    }

    @Put('projects/:id')
    @UseGuards(AuthGuard)
    updateProject(@Param('id') id: string, @Body() payload: UpsertProjectDto): Promise<ProjectRecord> {
        return this.adminService.updateProject(id, payload);
    }

    @Delete('projects/:id')
    @UseGuards(AuthGuard)
    deleteProject(@Param('id') id: string): Promise<{ success: boolean }> {
        return this.adminService.deleteProject(id);
    }

    @Post('posts/:slug/images')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('image', {
            limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
            fileFilter: (_req, file, cb) => {
                if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
                    cb(null, true);
                    return;
                }

                cb(new BadRequestException(`Unsupported image type: ${file.mimetype}`), false);
            },
        }),
    )
    uploadPostImage(
        @Param('slug') slug: string,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addMaxSizeValidator({ maxSize: MAX_IMAGE_SIZE_BYTES })
                .build({
                    fileIsRequired: true,
                    errorHttpStatusCode: HttpStatus.BAD_REQUEST,
                }),
        )
        file: AdminUploadFile,
    ): Promise<AdminUploadedImage> {
        return this.adminService.uploadPostImage(slug, file);
    }
}
