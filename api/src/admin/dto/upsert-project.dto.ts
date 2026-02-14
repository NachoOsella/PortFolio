import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Length,
    Matches,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProjectLinksDto {
    @IsOptional()
    @IsUrl()
    @MaxLength(2048)
    live: string | null = null;

    @IsOptional()
    @IsUrl()
    @MaxLength(2048)
    github: string | null = null;
}

export class UpsertProjectDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'ID must be lowercase letters, numbers, and hyphens only (kebab-case)',
    })
    @Length(1, 100)
    id!: string;

    @IsString()
    @IsNotEmpty()
    @Length(5, 200)
    title!: string;

    @IsString()
    @IsNotEmpty()
    @Length(10, 500)
    description!: string;

    @IsString()
    @IsNotEmpty()
    @Length(50, 5000)
    longDescription!: string;

    @IsString()
    @IsNotEmpty()
    @IsUrl()
    @MaxLength(2048)
    image!: string;

    @IsString()
    @IsNotEmpty()
    @Length(2, 50)
    category!: string;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(20)
    @IsString({ each: true })
    @Length(1, 50, { each: true })
    technologies!: string[];

    @IsOptional()
    @IsBoolean()
    featured?: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => ProjectLinksDto)
    links: ProjectLinksDto = { live: null, github: null };

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @IsString({ each: true })
    @Length(1, 200, { each: true })
    highlights!: string[];

    @IsDateString()
    date!: string;
}
