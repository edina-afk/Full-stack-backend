import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto {

    @IsEmail()
    @IsNotEmpty()
    email!: string;


    @IsString()
    @IsNotEmpty()
    otp!: string;


    @IsString()
    @IsNotEmpty()
    newPassword!: string;

}