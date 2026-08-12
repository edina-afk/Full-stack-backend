import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { CreateMemberDto } from './dto/create-member.dto';

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
         gen_random_uuid()::text,
         $1,
         $2,
         $3,
         $4,
         NOW(),
         NOW()
       )
       RETURNING *`,
      [
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
  async remove(id: string) {
    // Delete payments belonging to member's ledgers
    await this.db.query(
      `DELETE FROM "Payment"
       WHERE "ledgerId" IN (
         SELECT id
         FROM "Ledger"
         WHERE "memberId" = $1
       )`,
      [id],
    );

    // Delete ledgers
    await this.db.query(
      `DELETE FROM "Ledger"
       WHERE "memberId" = $1`,
      [id],
    );

    // Delete member
    const result = await this.db.query(
      `DELETE FROM "Member"
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'Member not found',
      );
    }

    return result.rows[0];
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