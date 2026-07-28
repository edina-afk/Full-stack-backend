import {
 IsString,
 IsOptional
} from 'class-validator';


export class CreateMemberDto {


 @IsString()
 fullName!: string;


 @IsString()
 phone!: string;


 @IsOptional()
 @IsString()
 address?: string;

}