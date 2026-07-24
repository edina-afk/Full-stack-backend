import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';


import { LedgerService } from './ledger.service';

import { CreateLedgerDto } from './dto/ledger.dto';

import { UpdateLedgerDto } from './dto/update.dto';



@Controller('ledgers')
export class LedgerController {


constructor(
 private ledgerService:LedgerService
){}



@Post()
create(
 @Body() dto:CreateLedgerDto
){

 return this.ledgerService.create(dto);

}



@Get()
findAll(){

 return this.ledgerService.findAll();

}



@Get(':id')
findOne(
 @Param('id') id:string
){

 return this.ledgerService.findOne(id);

}



@Patch(':id')
update(
 @Param('id') id:string,
 @Body() dto:UpdateLedgerDto
){

 return this.ledgerService.update(id,dto);

}



@Delete(':id')
remove(
 @Param('id') id:string
){

 return this.ledgerService.remove(id);

}


}