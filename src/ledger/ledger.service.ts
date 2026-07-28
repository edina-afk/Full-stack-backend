import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';



@Injectable()
export class LedgerService {


  constructor(
    private prisma: PrismaService,
  ) {}



  // CREATE LEDGER
  async create(dto: CreateLedgerDto) {


    const member = await this.prisma.member.findUnique({

      where: {
        id: dto.memberId,
      },

    });



    if (!member) {

      throw new NotFoundException(
        'Member not found'
      );

    }



    // quantity × unit price

    const totalPrice =
      dto.quantity * Number(dto.unitPrice);



    // total price - paid amount

    const remaining =
      totalPrice - Number(dto.paidAmount);



    return this.prisma.ledger.create({

      data: {

        memberId: dto.memberId,

        date: new Date(dto.date),

        itemName: dto.itemName,

        quantity: dto.quantity,

        unitPrice: dto.unitPrice,

        totalPrice,

        paidAmount: dto.paidAmount,

        remaining,

        note: dto.note,

      },


      include: {

        member: true,

      },

    });

  }





  // GET ALL LEDGER

  findAll() {

    return this.prisma.ledger.findMany({

      include: {

        member: true,

      },

      orderBy: {

        createdAt: 'desc',

      },

    });

  }





  // GET ONE LEDGER

  async findOne(id: string): Promise<any> {


    const ledger =
      await this.prisma.ledger.findUnique({

        where: {

          id,

        },

        include: {

          member: true,

        },

      });



    if (!ledger) {

      throw new NotFoundException(
        'Ledger not found'
      );

    }



    return ledger;

  }





  // UPDATE LEDGER

  async update(
    id: string,
    dto: UpdateLedgerDto,
  ) {


    const old =
      await this.findOne(id);



    if (!old) {

      throw new NotFoundException(
        'Ledger not found'
      );

    }



    const quantity =
      dto.quantity ?? old.quantity;



    const unitPrice =
      dto.unitPrice ?? Number(old.unitPrice);



    const paidAmount =
      dto.paidAmount ?? Number(old.paidAmount);



    const totalPrice =
      quantity * Number(unitPrice);



    const remaining =
      totalPrice - Number(paidAmount);




    return this.prisma.ledger.update({

      where: {

        id,

      },


      data: {

        ...dto,


        totalPrice,


        remaining,


        date: dto.date
          ? new Date(dto.date)
          : old.date,

      },


      include: {

        member: true,

      },

    });

  }





  // DELETE LEDGER

  async remove(id: string) {


    await this.findOne(id);



    return this.prisma.ledger.delete({

      where: {

        id,

      },

    });

  }


}