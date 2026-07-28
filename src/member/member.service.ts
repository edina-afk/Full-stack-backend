import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';


@Injectable()
export class MemberService {


constructor(
 private prisma: PrismaService
){}



create(dto:CreateMemberDto){

 return this.prisma.member.create({

  data:dto

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
   id:id
  },


  include:{
   ledgers:true
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