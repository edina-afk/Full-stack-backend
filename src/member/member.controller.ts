import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/member.dto';
import { UpdateMemberDto } from './dto/update.dto';

@Controller('members')
export class MemberController {
  constructor(
    private memberService: MemberService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateMemberDto,
  ) {
    return this.memberService.create(dto);
  }

  @Get()
  findAll() {
    return this.memberService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.memberService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.memberService.update(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.memberService.remove(id);
  }
}