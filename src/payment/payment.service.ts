import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(data: { ledgerId: string; amount: number; note?: string; date?: string }) {
    const amountNum = Number(data.amount);
    
    const paymentDate = data.date && !isNaN(Date.parse(data.date)) 
      ? new Date(data.date) 
      : new Date();

    try {
      return await this.prisma.$transaction(async (tx) => {
        const ledger = await tx.ledger.findUnique({
          where: { id: data.ledgerId },
        });

        if (!ledger) {
          throw new NotFoundException(`Ledger record ID ${data.ledgerId} not found`);
        }

        const payment = await tx.payment.create({
          data: {
            ledgerId: data.ledgerId,
            amount: amountNum,
            note: data.note || '',
            date: paymentDate,
          },
        });

        const updatedPaidAmount = Number(ledger.paidAmount || 0) + amountNum;

        await tx.ledger.update({
          where: { id: data.ledgerId },
          data: {
            paidAmount: updatedPaidAmount,
          },
        });

        return payment;
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Prisma Payment Error:', error);

      // Safe check for error.message
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      throw new InternalServerErrorException(errorMessage);
    }
  }
}