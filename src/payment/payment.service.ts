import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
 

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePaymentDto) {
    console.log("Incoming payment:", data);

    const paymentDate =
      data.date && !isNaN(Date.parse(data.date))
        ? new Date(data.date)
        : new Date();

    try {
      return await this.prisma.$transaction(async (tx) => {

        const ledger = await tx.ledger.findUnique({
          where: {
            id: data.ledgerId,
          },
        });


        if (!ledger) {
          throw new NotFoundException(
            `Ledger ${data.ledgerId} not found`
          );
        }


        // ONLY CREATE PAYMENT ROW
        const payment = await tx.payment.create({
          data: {
            ledgerId: data.ledgerId,

            amount: Number(data.amount),

            bankPaymentEntry:
              data.bankPaymentEntry ?? "",

            date: paymentDate,
          },
        });


        return payment;
      });

    } catch(error) {

      console.error("FULL ERROR:", error);
      throw error;

    }
  }
}