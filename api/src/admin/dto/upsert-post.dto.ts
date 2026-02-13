import { IsArray, IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpsertPostDto {
    @IsString()
    @Length(5, 200)
    title!: string;

    @IsString()
    @Length(20, 5000)
    excerpt!: string;

    @IsArray()
    @IsString({ each: true })
    tags!: string[];

    @IsString()
    content!: string;

    @IsOptional()
    @IsBoolean()
    published?: boolean;
}
