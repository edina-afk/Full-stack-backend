import {
 Controller,
 Get,
 Post,
 Put,
 Delete,
 Body,
 Param,
 Patch
} from '@nestjs/common';


import { LedgerService } from './ledger.service';

import { CreateLedgerDto } from './dto/create-ledger.dto';

import { UpdateLedgerDto } from './dto/update-ledger.dto';



@Controller('ledger')
export class LedgerController {



constructor(
private service:LedgerService
){}




@Post()
create(
@Body() dto:CreateLedgerDto
){

return this.service.create(dto);

}



@Get()
findAll(){

return this.service.findAll();

}



@Get(':id')
findOne(
@Param('id') id:string
){

return this.service.findOne(id);

}



@Patch(':id')
update(
@Param('id') id:string,
@Body() dto:UpdateLedgerDto
){

return this.service.update(id,dto);

}



@Delete(':id')
remove(@Param('id') id: string) {
  return this.service.remove(id);
}


}