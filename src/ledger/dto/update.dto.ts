import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
} from 'class-validator';


export class UpdateLedgerDto {

  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  @IsString()
  voucherNumber?: string;


  @IsOptional()
  @IsInt()
  quantity?: number;


  @IsOptional()
  @IsNumber()
  unitPrice?: number;


  @IsOptional()
  @IsNumber()
  amount?: number;


  @IsOptional()
  @IsNumber()
  balance?: number;


  @IsOptional()
  @IsString()
  note?: string;

}