import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';

import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('members')
export class MemberController {
  constructor(private service: MemberService) {}

  @Post()
  create(@Body() dto: CreateMemberDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('SUPERADMIN')
  remove(@Param('id') id: string, @Request() req: any) {
    const userRole = req.user?.role || '';
    return this.service.remove(id, userRole);
  }

  @Get("check-receipt/:receiptNo")
checkReceipt(
  @Param("receiptNo") receiptNo:string
){
  return this.service.checkReceipt(receiptNo);
}
}
