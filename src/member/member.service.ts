import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/member.dto';
import { UpdateMemberDto } from './dto/update.dto';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  // Create Member
  create(dto: CreateMemberDto) {
    return this.prisma.member.create({
      data: dto,
    });
  }

  // Get All Members
  findAll() {
    return this.prisma.member.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get One Member
  async findOne(id: string) {
  const member = await this.prisma.member.findUnique({
    where: {
      id,
    },
    include: {
      ledgers: true,
    },
  });

  if (!member) {
    throw new NotFoundException('Member not found');
  }

  return member;
}

  // Update Member
  async update(
    id: string,
    dto: UpdateMemberDto,
  ) {
    await this.findOne(id);

    return this.prisma.member.update({
      where: { id },
      data: dto,
    });
  }

  // Delete Member
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.member.delete({
      where: { id },
    });
  }
}