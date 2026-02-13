import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class ContactDto {
    @IsString()
    @Length(2, 100)
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @Length(5, 200)
    subject!: string;

    @IsString()
    @Length(20, 5000)
    message!: string;

    @IsString()
    @MaxLength(0)
    honeypot!: string;
}
