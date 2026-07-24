import { IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsString()
   fullName !: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}