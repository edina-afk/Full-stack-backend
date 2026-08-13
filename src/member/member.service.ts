import {
  Injectable,
  NotFoundException,
  BadRequestException,
   ForbiddenException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class MemberService {
  constructor(private db: DatabaseService) {}

  // CREATE MEMBER
  async create(dto: CreateMemberDto) {
    // Check receipt number first
    const existingReceipt = await this.db.query(
      `SELECT id
       FROM "Member"
       WHERE "receiptNo" = $1
       LIMIT 1`,
      [dto.receiptNo],
    );

    if (existingReceipt.rows.length > 0) {
      throw new BadRequestException(
        'Receipt number already exists',
      );
    }

    // Create member
    const id = randomUUID();

    const result = await this.db.query(
      `INSERT INTO "Member"
       (
         id,
         "fullName",
         phone,
         address,
         "receiptNo",
         "createdAt",
         "updatedAt"
       )
       VALUES
       (
         $1,
         $2,
         $3,
         $4,
         $5,
         NOW(),
         NOW()
       )
       RETURNING *`,
      [
        id,
        dto.fullName,
        dto.phone,
        dto.address || null,
        dto.receiptNo,
      ],
    );

    return result.rows[0];
  }

  // CHECK RECEIPT
  async checkReceipt(receiptNo: string) {
    const result = await this.db.query(
      `SELECT id
       FROM "Member"
       WHERE "receiptNo" = $1
       LIMIT 1`,
      [receiptNo],
    );

    return {
      exists: result.rows.length > 0,
    };
  }

  // DELETE MEMBER
   async remove(id: string, userRole: string) {
  const normalize = (r?: string) => (r || '').toString().toUpperCase().replace(/[^A-Z]/g, '');
  if (normalize(userRole) !== 'SUPERADMIN') {
    throw new ForbiddenException('Only SUPERADMIN can delete members');
  }

  const client = await this.db.getClient();

  try {
    const start = Date.now();
    console.log(`[member.remove] starting transaction for member ${id}`);
    await client.query('BEGIN');

    // Delete payments belonging to member's ledgers
    const payRes = await client.query(
      `DELETE FROM "Payment"
       WHERE "ledgerId" IN (
         SELECT id FROM "Ledger" WHERE "memberId" = $1
       )`,
      [id],
    );
    console.log(`[member.remove] deleted payments count=${payRes.rowCount}`);

    // Delete ledgers
    const ledRes = await client.query(
      `DELETE FROM "Ledger" WHERE "memberId" = $1`,
      [id],
    );
    console.log(`[member.remove] deleted ledgers count=${ledRes.rowCount}`);

    // Delete member
    const result = await client.query(
      `DELETE FROM "Member" WHERE id = $1 RETURNING *`,
      [id],
    );
    console.log(`[member.remove] deleted member rows=${result.rowCount}`);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new NotFoundException('Member not found');
    }

    await client.query('COMMIT');
    const dur = Date.now() - start;
    console.log(`[member.remove] transaction committed for ${id} duration=${dur}ms`);

    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[member.remove] error, rolled back', (err as any).message || err);
    throw err;
  } finally {
    client.release();
  }
}

  // DASHBOARD
  async findAll() {
    const memberResult = await this.db.query(
      `SELECT
         id,
         "fullName",
         phone,
         address,
         "receiptNo",
         "createdAt",
         "updatedAt"
       FROM "Member"
       ORDER BY "createdAt" DESC`,
    );

    const members = memberResult.rows;

    for (const member of members) {
      const ledgerResult = await this.db.query(
        `SELECT *
         FROM "Ledger"
         WHERE "memberId" = $1
         ORDER BY date DESC`,
        [member.id],
      );

      member.ledgers = ledgerResult.rows;
    }

    return members;
  }

  // VIEW MEMBER
  async findOne(id: string) {
    const memberResult = await this.db.query(
      `SELECT *
       FROM "Member"
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    const member = memberResult.rows[0];

    if (!member) {
      throw new NotFoundException(
        'Member not found',
      );
    }

    const ledgerResult = await this.db.query(
      `SELECT *
       FROM "Ledger"
       WHERE "memberId" = $1
       ORDER BY date DESC`,
      [id],
    );

    const ledgers = ledgerResult.rows;

    for (const ledger of ledgers) {
      const paymentResult = await this.db.query(
        `SELECT *
         FROM "Payment"
         WHERE "ledgerId" = $1
         ORDER BY date DESC`,
        [ledger.id],
      );

      ledger.payments =
        paymentResult.rows;
    }

    member.ledgers = ledgers;

    return member;
  }
}