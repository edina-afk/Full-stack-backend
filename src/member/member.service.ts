import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';


@Injectable()
export class MemberService {


constructor(
 private prisma: PrismaService
){}


async create(dto: CreateMemberDto) {

  // Check receipt number first
  const existingReceipt = await this.prisma.member.findUnique({
    where: {
      receiptNo: dto.receiptNo,
    },
  });


  if (existingReceipt) {
    throw new BadRequestException(
      "Receipt number already exists"
    );
  }


  // Create member if receipt is unique
  return this.prisma.member.create({
    data: dto,
  });

}

async checkReceipt(receiptNo:string){

 const member = await this.prisma.member.findUnique({
  where:{
    receiptNo
  }
 });


 return {
  exists: !!member
 };

}

async remove(id: string) {
  await this.prisma.ledger.deleteMany({
    where: {
      memberId: id,
    },
  });

  return this.prisma.member.delete({
    where: {
      id,
    },
  });
}

// Dashboard
async findAll() {
  return this.prisma.member.findMany({
    select: {
      id: true,
      fullName: true,
      phone: true,
      address: true,
      createdAt: true,
      ledgers: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
// View button

async findOne(id:string){

 const member = await this.prisma.member.findUnique({

  where:{
    id
  },

  include:{
    ledgers:{
      include:{
        payments:true
      },
      orderBy:{
        date:"desc"
      }
    }
  }

 });

 if(!member){

  throw new NotFoundException(
    "Member not found"
  );

 }

 return member;

}



}