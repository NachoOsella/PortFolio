import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsOptional,
    IsString,
    Length,
    Matches,
    MaxLength,
} from 'class-validator';

export class UpsertPostDto {
    @IsString()
    @Length(5, 200)
    title!: string;

    @IsString()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug must be lowercase letters, numbers, and hyphens (e.g., "my-post-title")',
    })
    slug!: string;

    @IsDateString()
    date!: string;

    @IsString()
    @Length(10, 5000)
    excerpt!: string;

    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    tags!: string[];

    @IsString()
    @Length(50, 50000)
    content!: string;

    @IsOptional()
    @IsString()
    @MaxLength(2048)
    coverImage?: string;

    @IsOptional()
    @IsBoolean()
    featured?: boolean;

    @IsOptional()
    @IsBoolean()
    published?: boolean;
}
