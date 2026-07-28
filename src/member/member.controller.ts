import {
 Controller,
 Get,
 Post,
 Body,
 Param
} from '@nestjs/common';

import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';


@Controller('members')
export class MemberController {


constructor(
 private service:MemberService
){}



@Post()
create(
 @Body() dto:CreateMemberDto
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


}