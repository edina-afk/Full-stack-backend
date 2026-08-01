import {
 IsString,
 IsNumber,
 IsDateString,
 IsOptional,
 IsNotEmpty
} from 'class-validator';


export class CreateLedgerDto {

 @IsString()
@IsNotEmpty()
  receiptNo!: string;


@IsString()
memberId!:string;


@IsDateString()
date!:string;


@IsString()
itemName!:string;


@IsNumber()
quantity!:number;


@IsNumber()
unitPrice!:number;


@IsNumber()
paidAmount!:number;


@IsOptional()
@IsString()
note?:string;


}