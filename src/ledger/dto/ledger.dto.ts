import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLedgerDto {

  @IsString()
  memberId!: string;


  @IsDateString()
  date!: string;


  @IsString()
  description!: string;


  @IsOptional()
  @IsString()
  voucherNumber?: string;


  @IsOptional()
  @IsInt()
  quantity?: number;


  @IsOptional()
  @IsNumber()
  unitPrice?: number;


  @IsNumber()
  amount!: number;


  @IsOptional()
  @IsNumber()
  balance?: number;


  @IsOptional()
  @IsString()
  note?: string;
}