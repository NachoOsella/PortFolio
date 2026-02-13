import { IsOptional, IsString } from 'class-validator';

export class BlogQueryDto {
    @IsOptional()
    @IsString()
    tag?: string;
}
