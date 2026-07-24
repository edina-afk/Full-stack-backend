import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateLedgerDto } from './dto/ledger.dto';
import { UpdateLedgerDto } from './dto/update.dto';


@Injectable()
export class LedgerService {

  constructor(
    private prisma: PrismaService,
  ){}


  // Create Ledger
  create(dto: CreateLedgerDto){

    return this.prisma.ledger.create({
      data:{
        ...dto,
        date: new Date(dto.date),
      },
    });

  }



  // Get All Ledger
  findAll(){

    return this.prisma.ledger.findMany({
      include:{
        member:true,
      },
      orderBy:{
        createdAt:'desc',
      },
    });

  }



  // Get One Ledger
  async findOne(id:string){

    const ledger =
      await this.prisma.ledger.findUnique({
        where:{
          id,
        },
        include:{
          member:true,
        },
      });


    if(!ledger){
      throw new NotFoundException(
        'Ledger not found'
      );
    }


    return ledger;

  }



  // Update Ledger
  async update(
    id:string,
    dto:UpdateLedgerDto
  ){

    await this.findOne(id);


    return this.prisma.ledger.update({
      where:{
        id,
      },
      data:dto,
    });

  }



  // Delete Ledger
  async remove(id:string){

    await this.findOne(id);


    return this.prisma.ledger.delete({
      where:{
        id,
      },
    });

  }

}