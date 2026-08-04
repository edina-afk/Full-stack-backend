import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(data: { ledgerId: string; amount: number; note?: string; date?: string }) {
    const amountNum = Number(data.amount);

    return this.prisma.$transaction(async (tx) => {
      // 1. Verify ledger exists
      const ledger = await tx.ledger.findUnique({
        where: { id: data.ledgerId },
      });

      if (!ledger) {
        throw new NotFoundException(`Ledger record with ID ${data.ledgerId} not found`);
      }

      // 2. Create individual payment record
      const payment = await tx.payment.create({
        data: {
          ledgerId: data.ledgerId,
          amount: amountNum,
          note: data.note || data['bankPaymentEntry'] || '',
          date: data.date ? new Date(data.date) : new Date(),
        },
      });

      // 3. Update total paid amount on the parent ledger entry
      const updatedPaidAmount = Number(ledger.paidAmount || 0) + amountNum;
      
      await tx.ledger.update({
        where: { id: data.ledgerId },
        data: {
          paidAmount: updatedPaidAmount,
        },
      });

      return payment;
    });
  }

  findAll() {
    return this.prisma.payment.findMany({
      include: {
        ledger: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findByLedger(ledgerId: string) {
    return this.prisma.payment.findMany({
      where: { ledgerId },
      orderBy: { date: 'desc' },
    });
  }
}