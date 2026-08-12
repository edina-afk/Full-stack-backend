import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';

@Injectable()
export class LedgerService {
  constructor(private db: DatabaseService) {}

  // CREATE LEDGER
  async create(dto: CreateLedgerDto) {
    // Check receipt number before create
    const existingReceipt = await this.db.query(
      `SELECT id
       FROM "Ledger"
       WHERE "receiptNo" = $1
       LIMIT 1`,
      [dto.receiptNo],
    );

    if (existingReceipt.rows.length > 0) {
      throw new BadRequestException(
        'Receipt number already used',
      );
    }

    // Check member
    const memberResult = await this.db.query(
      `SELECT *
       FROM "Member"
       WHERE id = $1
       LIMIT 1`,
      [dto.memberId],
    );

    const member = memberResult.rows[0];

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const totalPrice =
      Number(dto.quantity) * Number(dto.unitPrice);

    const remaining =
      totalPrice - Number(dto.paidAmount);

    const result = await this.db.query(
      `INSERT INTO "Ledger"
       (
         id,
         "receiptNo",
         "memberId",
         date,
         "itemName",
         quantity,
         "unitPrice",
         "totalPrice",
         "paidAmount",
         remaining,
         note,
         "createdAt",
         "updatedAt"
       )
       VALUES
       (
         gen_random_uuid()::text,
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9,
         $10,
         NOW(),
         NOW()
       )
       RETURNING *`,
      [
        dto.receiptNo,
        dto.memberId,
        new Date(dto.date),
        dto.itemName,
        dto.quantity,
        dto.unitPrice,
        totalPrice,
        dto.paidAmount,
        remaining,
        dto.note || null,
      ],
    );

    const ledger = result.rows[0];

    return {
      ...ledger,
      member,
      payments: [],
    };
  }

  // GET ALL LEDGERS
  async findAll() {
    const result = await this.db.query(
      `SELECT *
       FROM "Ledger"
       ORDER BY "createdAt" DESC`,
    );

    const ledgers = result.rows;

    for (const ledger of ledgers) {
      const memberResult = await this.db.query(
        `SELECT *
         FROM "Member"
         WHERE id = $1
         LIMIT 1`,
        [ledger.memberId],
      );

      const paymentResult = await this.db.query(
        `SELECT *
         FROM "Payment"
         WHERE "ledgerId" = $1
         ORDER BY date DESC`,
        [ledger.id],
      );

      ledger.member = memberResult.rows[0] || null;
      ledger.payments = paymentResult.rows;
    }

    return ledgers;
  }

  // GET ONE LEDGER
  async findOne(id: string) {
    const result = await this.db.query(
      `SELECT *
       FROM "Ledger"
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    const ledger = result.rows[0];

    if (!ledger) {
      throw new NotFoundException(
        'Ledger not found',
      );
    }

    const memberResult = await this.db.query(
      `SELECT *
       FROM "Member"
       WHERE id = $1
       LIMIT 1`,
      [ledger.memberId],
    );

    const paymentResult = await this.db.query(
      `SELECT *
       FROM "Payment"
       WHERE "ledgerId" = $1
       ORDER BY date DESC`,
      [ledger.id],
    );

    ledger.member =
      memberResult.rows[0] || null;

    ledger.payments =
      paymentResult.rows;

    return ledger;
  }

  // UPDATE LEDGER
  async update(
    id: string,
    dto: UpdateLedgerDto,
  ) {
    const old = await this.findOne(id);

    const quantity =
      dto.quantity ?? old.quantity;

    const unitPrice =
      dto.unitPrice ??
      Number(old.unitPrice);

    const paidAmount =
      dto.paidAmount ??
      Number(old.paidAmount);

    const totalPrice =
      Number(quantity) *
      Number(unitPrice);

    const remaining =
      totalPrice -
      Number(paidAmount);

    const result = await this.db.query(
      `UPDATE "Ledger"
       SET
         "receiptNo" = COALESCE($1, "receiptNo"),
         "memberId" = COALESCE($2, "memberId"),
         date = COALESCE($3, date),
         "itemName" = COALESCE($4, "itemName"),
         quantity = COALESCE($5, quantity),
         "unitPrice" = $6,
         "totalPrice" = $7,
         "paidAmount" = $8,
         remaining = $9,
         note = COALESCE($10, note),
         "updatedAt" = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        dto.receiptNo ?? null,
        dto.memberId ?? null,
        dto.date
          ? new Date(dto.date)
          : null,
        dto.itemName ?? null,
        dto.quantity ?? null,
        unitPrice,
        totalPrice,
        paidAmount,
        remaining,
        dto.note ?? null,
        id,
      ],
    );

    const ledger = result.rows[0];

    if (!ledger) {
      throw new NotFoundException(
        'Ledger not found',
      );
    }

    const memberResult = await this.db.query(
      `SELECT *
       FROM "Member"
       WHERE id = $1
       LIMIT 1`,
      [ledger.memberId],
    );

    const paymentResult = await this.db.query(
      `SELECT *
       FROM "Payment"
       WHERE "ledgerId" = $1
       ORDER BY date DESC`,
      [ledger.id],
    );

    ledger.member =
      memberResult.rows[0] || null;

    ledger.payments =
      paymentResult.rows;

    return ledger;
  }

  // DELETE LEDGER
  async remove(id: string) {
    // Delete payments connected to ledger
    await this.db.query(
      `DELETE FROM "Payment"
       WHERE "ledgerId" = $1`,
      [id],
    );

    // Delete ledger
    const result = await this.db.query(
      `DELETE FROM "Ledger"
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'Ledger not found',
      );
    }

    return result.rows[0];
  }
}