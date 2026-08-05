import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePaymentDto) {
    console.log('Incoming payment:', data);

    const paymentDate =
      data.date && !isNaN(Date.parse(data.date))
        ? new Date(data.date)
        : new Date();

    try {
      return await this.prisma.$transaction(async (tx) => {
        console.log('Looking for ledger:', data.ledgerId);

        const ledger = await tx.ledger.findUnique({
          where: { id: data.ledgerId },
        });

        console.log('Ledger:', ledger);

        if (!ledger) {
          throw new NotFoundException(`Ledger ${data.ledgerId} not found`);
        }

        const payment = await tx.payment.create({
          data: {
            ledgerId: data.ledgerId,
            amount: Number(data.amount),
            bankPaymentEntry: data.bankPaymentEntry ?? "",
            date: paymentDate,
          },
        });

        console.log('Payment created:', payment);

        await tx.ledger.update({
          where: { id: data.ledgerId },
          data: {
            paidAmount: Number(ledger.paidAmount) + Number(data.amount),
          },
        });

        return payment;
      });
    } catch (error) {
      console.error('FULL ERROR:', error);
      throw error;
    }
  }
}