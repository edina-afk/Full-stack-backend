import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private db: DatabaseService) {}

  async create(data: CreatePaymentDto) {
    console.log('Incoming payment:', data);

    const paymentDate =
      data.date && !isNaN(Date.parse(data.date))
        ? new Date(data.date)
        : new Date();

    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      // Check ledger exists
      const ledgerResult = await client.query(
        `SELECT id
         FROM "Ledger"
         WHERE id = $1
         LIMIT 1`,
        [data.ledgerId],
      );

      const ledger = ledgerResult.rows[0];

      if (!ledger) {
        throw new NotFoundException(
          `Ledger ${data.ledgerId} not found`,
        );
      }

      // Create payment
      const paymentResult = await client.query(
        `INSERT INTO "Payment"
         (
           id,
           "ledgerId",
           amount,
           "bankPaymentEntry",
           date,
           "createdAt"
         )
         VALUES
         (
           gen_random_uuid()::text,
           $1,
           $2,
           $3,
           $4,
           NOW()
         )
         RETURNING *`,
        [
          data.ledgerId,
          Number(data.amount),
          data.bankPaymentEntry ?? '',
          paymentDate,
        ],
      );

      await client.query('COMMIT');

      return paymentResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');

      console.error('FULL ERROR:', error);

      throw error;
    } finally {
      client.release();
    }
  }
}