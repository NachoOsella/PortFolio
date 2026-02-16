import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { GitHubService } from '../services/github.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
    imports: [AuthModule],
    controllers: [AdminController],
    providers: [AdminService, GitHubService],
})
export class AdminModule {}
